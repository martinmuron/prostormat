import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // If user is not authenticated and trying to access protected routes
  if (!token) {
    if (pathname.startsWith("/organizator") || pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
      const signInUrl = new URL("/prihlaseni", request.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }
    return NextResponse.next()
  }

  const userRole = token.role as string

  // Organizer restrictions
  if (userRole === "organizer") {
    // Organizers can ONLY access /organizator
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/organizator", request.url))
    }
  }

  // Non-organizers trying to access /organizator
  if (userRole !== "organizer" && pathname.startsWith("/organizator")) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/organizator/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
  ],
}
