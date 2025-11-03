import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

type AuthToken = {
  role?: string | null
  email?: string | null
}

const isAdminToken = (token: AuthToken | null | undefined) =>
  token?.role === "admin"

const loginRedirect = (req: NextRequest, callbackPath?: string) => {
  const url = new URL("/prihlaseni", req.url)
  if (callbackPath) {
    url.searchParams.set("callbackUrl", callbackPath)
  }
  return NextResponse.redirect(url)
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as AuthToken | null
    const { pathname, search } = req.nextUrl
    const callbackPath = `${pathname}${search}`

    const requireAuthPaths = ["/dashboard", "/venue-inquiry"]
    if (!token && requireAuthPaths.some((path) => pathname.startsWith(path))) {
      return loginRedirect(req, callbackPath)
    }

    if (pathname.startsWith("/admin")) {
      if (!token) {
        return loginRedirect(req, callbackPath)
      }
      if (!isAdminToken(token)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    const apiUnauthorized = () =>
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (pathname.startsWith("/api/admin")) {
      if (!isAdminToken(token)) {
        return apiUnauthorized()
      }
    }

    if (pathname.startsWith("/api/venue-broadcast")) {
      if (!isAdminToken(token)) {
        return apiUnauthorized()
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Always run the middleware body so we can tailor responses
      authorized: () => true,
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/venue-inquiry/:path*",
    "/api/admin/:path*",
    "/api/venue-broadcast/:path*",
  ],
}
