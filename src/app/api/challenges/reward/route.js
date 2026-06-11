import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await req.json()
    const { xpAmount, challengeName } = body

    if (!xpAmount) {
      return new Response(JSON.stringify({ error: "Missing xpAmount" }), { status: 400 })
    }

    const userId = session.user.id

    // Update user balance and create ledger entry in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { xpBalance: { increment: xpAmount } }
      })

      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          userId: userId,
          amount: xpAmount,
          description: challengeName || "Completed AI Challenge"
        }
      })

      return { user: updatedUser, ledger: ledgerEntry }
    })

    return new Response(JSON.stringify({ success: true, balance: result.user.xpBalance }), { status: 200 })

  } catch (error) {
    console.error("Reward Error:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
  }
}
