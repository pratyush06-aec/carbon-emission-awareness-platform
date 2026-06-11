export { default } from "next-auth/middleware"

// Protect all routes except the auth API and static assets
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"]
}
