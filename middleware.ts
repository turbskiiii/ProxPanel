import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuth } from "@/lib/auth"

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip = request.ip || "unknown"
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const maxRequests = 100

    const key = `${ip}:${Math.floor(now / windowMs)}`
    const current = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs }

    if (current.count >= maxRequests) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    rateLimitStore.set(key, { ...current, count: current.count + 1 })

    // Clean up old entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }
  }

  // Authentication for protected API routes
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  // Authentication for dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname === "/login" || pathname === "/signup") {
    const user = await verifyAuth(request)
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/login", "/signup"],
}
