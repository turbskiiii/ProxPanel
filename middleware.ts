import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple in-memory rate limiting for Edge Runtime
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const cfConnectingIP = request.headers.get("cf-connecting-ip")

  return cfConnectingIP || realIP || (forwarded ? forwarded.split(",")[0] : request.ip || "unknown")
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 100

  const key = `${ip}:${Math.floor(now / windowMs)}`
  const current = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs }

  if (current.count >= maxRequests) {
    return true
  }

  rateLimitStore.set(key, { ...current, count: current.count + 1 })

  // Clean up old entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetTime < now) {
      rateLimitStore.delete(k)
    }
  }

  return false
}

function verifyAuthToken(request: NextRequest): boolean {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return false
    }

    // Simple token validation - in production you'd verify JWT properly
    // For demo purposes, we'll accept any non-empty token
    return token.length > 0
  } catch (error) {
    return false
  }
}

const PUBLIC_FILE = /\.(.*)$/;
const locales = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 'ru', 'pt'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const acceptLang = request.headers.get('accept-language');
  if (!acceptLang) return defaultLocale;
  const preferred = acceptLang.split(',').map(l => l.split(';')[0].trim());
  for (const lang of preferred) {
    const base = lang.split('-')[0];
    if (locales.includes(base)) return base;
  }
  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIP(request)

  // Create response with security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }

  // Skip middleware for static files and API health check
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/health") || pathname.includes(".")) {
    return response
  }

  // Rate limiting
  if (isRateLimited(ip)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "900", // 15 minutes
      },
    })
  }

  // Authentication for protected API routes (except auth endpoints)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const isAuthenticated = verifyAuthToken(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  // Authentication for dashboard routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    const isAuthenticated = verifyAuthToken(request)
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname === "/login" || pathname === "/signup") {
    const isAuthenticated = verifyAuthToken(request)
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Check if the path already includes a locale
  const pathLocale = pathname.split('/')[1];
  if (locales.includes(pathLocale)) {
    return response;
  }

  // Redirect to the user's preferred locale
  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
