import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await req.json()
    const { items } = body // Expected: array of { id, name, price }

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), { status: 400 })
    }

    const totalCost = items.reduce((sum, item) => sum + item.price, 0)
    const userId = session.user.id

    // Run transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } })
      
      if (!user || user.xpBalance < totalCost) {
        throw new Error("Insufficient balance")
      }

      // Deduct balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { xpBalance: { decrement: totalCost } }
      })

      // Create ledger entries
      const ledgerEntries = await Promise.all(items.map(item => {
        return tx.ledgerEntry.create({
          data: {
            userId: userId,
            amount: -item.price,
            description: `Redeemed: ${item.name}`
          }
        })
      }))

      return { user: updatedUser, ledger: ledgerEntries }
    })

    return new Response(JSON.stringify({ success: true, balance: result.user.xpBalance }), { status: 200 })

  } catch (error) {
    console.error("Redeem Error:", error)
    if (error.message === "Insufficient balance") {
      return new Response(JSON.stringify({ error: "Insufficient balance" }), { status: 400 })
    }
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
  }
}
