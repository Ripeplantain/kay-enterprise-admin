import { auth } from "@/auth"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isAuthPage = nextUrl.pathname.startsWith("/login")
  const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard") || 
                          nextUrl.pathname === "/" ||
                          nextUrl.pathname.startsWith("/admin")

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl))
    }
    return null
  }

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  // Redirect /dashboard to /dashboard (core route)
  if (nextUrl.pathname === "/dashboard" && isLoggedIn) {
    return null // Allow access to /dashboard
  }

  return null
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}