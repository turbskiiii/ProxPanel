import { z } from "zod"

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number and special character",
    ),
})

// VPS validation schemas
export const createVpsSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name too long")
    .regex(/^[a-zA-Z0-9-_]+$/, "Name can only contain letters, numbers, hyphens, and underscores"),
  plan: z.enum(["developer", "standard", "business", "performance", "enterprise"]),
  os: z.string().min(1, "Operating system is required"),
  location: z.string().optional(),
})

export const vpsActionSchema = z.object({
  action: z.enum(["start", "stop", "restart", "reset"]),
})

export const updateVpsSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  ssh_port: z.number().min(1024).max(65535).optional(),
})

// Admin validation schemas
export const userUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  status: z.enum(["active", "suspended", "pending"]).optional(),
  is_admin: z.boolean().optional(),
})

export const auditLogSchema = z.object({
  action: z.string().min(1).max(100),
  category: z.enum(["auth", "vps", "user", "system", "billing", "security"]),
  details: z.string().max(1000).optional(),
})

// Validation middleware
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (data: unknown): Promise<T> => {
    try {
      return await schema.parseAsync(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation failed: ${error.errors.map((e) => e.message).join(", ")}`)
      }
      throw error
    }
  }
}
