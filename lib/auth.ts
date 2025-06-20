import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export interface AuthUser {
  userId: number
  email: string
  name: string
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    }
  } catch (error) {
    return null
  }
}

export function generateSecurePassword(length = 16): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let password = ""

  // Ensure at least one character from each category
  const categories = ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz", "0123456789", "!@#$%^&*"]

  // Add one character from each category
  categories.forEach((category) => {
    password += category.charAt(Math.floor(Math.random() * category.length))
  })

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}
