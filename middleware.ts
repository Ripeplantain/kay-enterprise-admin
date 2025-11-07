import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { nextUrl } = req
    const isLoggedIn = !!req.nextauth.token

    const isAuthPage = nextUrl.pathname.startsWith("/login")

    if (isAuthPage) {
      if (isLoggedIn) {
        return NextResponse.redirect(new URL("/", nextUrl))
      }
      return null
    }

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }

    return null
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}