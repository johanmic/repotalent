import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

// export async function middleware(request: NextRequest) {
//   return await updateSession(request)
// }

const excludePaths = [
  "/",
  "/api",
  "/jobs",
  "/manifest.webmanifest",
  "manifest.json",
]

export async function middleware(request: NextRequest) {
  // Check if the current path starts with any excludePath
  if (
    excludePaths.some(
      (path) =>
        request.nextUrl.pathname === path ||
        (path === "/jobs" && request.nextUrl.pathname.startsWith("/jobs/"))
    )
  ) {
    return NextResponse.next()
  }

  // Skip middleware for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
