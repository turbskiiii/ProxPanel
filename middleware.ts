import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { apiRateLimiter, authRateLimiter, vpsActionRateLimiter, adminRateLimiter } from "./lib/rate-limiter"
import { logger } from "./lib/logger"
import { verifyAuth } from "@/lib/auth"

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfConnectingIP = request.headers.get("cf-connecting-ip")

  return cfConnectingIP || realIP || (forwarded ? forwarded.split(",")[0] : request.ip || "unknown")
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIP(request)
  const userAgent = request.headers.get("user-agent") || "unknown"

  // Create response with security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }

  // Skip rate limiting for health checks
  if (pathname === "/api/health") {
    return response
  }

  // Rate limiting
  let rateLimiter = apiRateLimiter
  let userId: string | undefined

  // Get user for authenticated requests
  if (request.headers.get("authorization") || request.cookies.get("auth-token")) {
    try {
      const user = await verifyAuth(request)
      userId = user?.userId
    } catch (error) {
      // Continue without user ID
    }
  }

  // Select appropriate rate limiter
  if (pathname.startsWith("/api/auth")) {
    rateLimiter = authRateLimiter
  } else if (pathname.includes("/power") || pathname.includes("/password")) {
    rateLimiter = vpsActionRateLimiter
  } else if (pathname.startsWith("/api/admin") || pathname.startsWith("/admin")) {
    rateLimiter = adminRateLimiter
  }

  // Apply rate limiting
  const rateLimit = await rateLimiter.isAllowed(ip, userId)

  if (!rateLimit.allowed) {
    logger.security("Rate limit exceeded", {
      path: pathname,
      ip,
      userAgent,
      userId,
    })

    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": Math.ceil((rateLimit.resetTime! - Date.now()) / 1000).toString(),
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": rateLimit.resetTime!.toString(),
      },
    })
  }

  // Add rate limit headers
  response.headers.set("X-RateLimit-Limit", "100")
  response.headers.set("X-RateLimit-Remaining", rateLimit.remaining?.toString() || "0")
  response.headers.set("X-RateLimit-Reset", rateLimit.resetTime?.toString() || "0")

  // Authentication for protected API routes
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/") && pathname !== "/api/health") {
    const user = await verifyAuth(request)
    if (!user) {
      logger.security("Unauthorized API access attempt", {
        path: pathname,
        ip,
        userAgent,
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  // Admin route protection
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/admin")) {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Check admin privileges (this would need to be implemented in verifyAuth)
    // For now, we'll assume the user object has an isAdmin property
    // if (!user.isAdmin) {
    //   return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    // }
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

  return response
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/admin/:path*", "/login", "/signup"],
}
