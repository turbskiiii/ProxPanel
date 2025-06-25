import { NextResponse } from "next/server"
import { logger } from "./logger"
import { ZodError } from "zod"

export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409)
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429)
  }
}

export function handleApiError(error: unknown, context?: any): NextResponse {
  // Log the error
  if (error instanceof Error) {
    logger.error("API Error", {
      message: error.message,
      stack: error.stack,
      context,
    })
  } else {
    logger.error("Unknown API Error", { error, context })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 400 },
    )
  }

  // Handle application errors
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode })
  }

  // Handle database errors
  if (error instanceof Error) {
    if (error.message.includes("ER_DUP_ENTRY")) {
      return NextResponse.json({ error: "Resource already exists" }, { status: 409 })
    }

    if (error.message.includes("ER_NO_REFERENCED_ROW")) {
      return NextResponse.json({ error: "Referenced resource not found" }, { status: 400 })
    }
  }

  // Generic server error
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

export function asyncHandler(fn: Function) {
  return async (req: Request, context?: any) => {
    try {
      return await fn(req, context)
    } catch (error) {
      return handleApiError(error, context)
    }
  }
}
