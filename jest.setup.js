"use client"

import "@testing-library/jest-dom"
import jest from "jest"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ""
  },
}))

// Mock environment variables
process.env.JWT_SECRET = "test-jwt-secret-key-that-is-long-enough-for-testing"
process.env.DB_HOST = "localhost"
process.env.DB_USER = "test"
process.env.DB_PASSWORD = "test"
process.env.DB_NAME = "test_db"
process.env.NODE_ENV = "test"
process.env.LOG_LEVEL = "error"

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
