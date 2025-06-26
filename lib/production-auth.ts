import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query } from "./db"

export class ProductionAuthService {
  async authenticateUser(email: string, password: string): Promise<any> {
    try {
      // Get user from database
      const users = await query(
        'SELECT id, email, password_hash, name, is_admin, status FROM users WHERE email = ? AND status = "active"',
        [email],
      )

      if (users.length === 0) {
        throw new Error("Invalid credentials")
      }

      const user = users[0]

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      if (!isValidPassword) {
        throw new Error("Invalid credentials")
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.is_admin,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" },
      )

      // Log successful login
      await this.logAuthEvent(user.id, "login_success", "User logged in successfully")

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.is_admin,
        },
        token,
      }
    } catch (error) {
      // Log failed login attempt
      await this.logAuthEvent(null, "login_failed", `Failed login attempt for ${email}`)
      throw error
    }
  }

  async registerUser(userData: any): Promise<any> {
    try {
      // Check if user already exists
      const existingUsers = await query("SELECT id FROM users WHERE email = ?", [userData.email])
      if (existingUsers.length > 0) {
        throw new Error("User already exists")
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12)

      // Insert new user
      const result = await query("INSERT INTO users (email, password_hash, name, created_at) VALUES (?, ?, ?, NOW())", [
        userData.email,
        passwordHash,
        userData.name,
      ])

      const userId = (result as any).insertId

      // Log registration
      await this.logAuthEvent(userId, "user_registered", "New user registered")

      return { success: true, userId }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  private async logAuthEvent(userId: number | null, action: string, details: string): Promise<void> {
    try {
      await query(
        "INSERT INTO audit_logs (user_id, action, category, details, created_at) VALUES (?, ?, ?, ?, NOW())",
        [userId, action, "auth", details],
      )
    } catch (error) {
      console.error("Failed to log auth event:", error)
    }
  }
}
