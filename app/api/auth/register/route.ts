import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await query("SELECT id FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = await query("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [
      name,
      email,
      passwordHash,
    ])

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
