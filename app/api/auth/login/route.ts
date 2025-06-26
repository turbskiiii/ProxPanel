import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Demo credentials - in production, verify against database
    const demoCredentials = [
      { email: "admin@proxpanel.com", password: "demo123", role: "admin" },
      { email: "demo@proxpanel.com", password: "demo123", role: "user" },
      { email: "admin@example.com", password: "admin", role: "admin" },
      { email: "user@example.com", password: "password", role: "user" },
    ]

    const user = demoCredentials.find((cred) => cred.email === email && cred.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create a simple token (in production, use proper JWT)
    const token = Buffer.from(
      JSON.stringify({
        email: user.email,
        role: user.role,
        timestamp: Date.now(),
      }),
    ).toString("base64")

    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        role: user.role,
      },
      redirectUrl: user.role === "admin" ? "/admin" : "/dashboard",
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
