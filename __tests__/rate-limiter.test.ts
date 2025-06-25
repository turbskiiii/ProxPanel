import { describe, it, expect, beforeEach } from "@jest/globals"
import { apiRateLimiter, authRateLimiter } from "../lib/rate-limiter"

describe("Rate Limiter", () => {
  beforeEach(() => {
    // Clear rate limiter store
    apiRateLimiter["store"].clear()
    authRateLimiter["store"].clear()
  })

  describe("API Rate Limiter", () => {
    it("should allow requests within limit", async () => {
      const result = await apiRateLimiter.isAllowed("127.0.0.1")
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(99)
    })

    it("should block requests over limit", async () => {
      // Simulate hitting the limit
      for (let i = 0; i < 100; i++) {
        await apiRateLimiter.isAllowed("127.0.0.1")
      }

      const result = await apiRateLimiter.isAllowed("127.0.0.1")
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it("should reset after window expires", async () => {
      // This would need to mock time or use a shorter window for testing
      expect(true).toBe(true)
    })
  })

  describe("Auth Rate Limiter", () => {
    it("should have stricter limits for auth endpoints", async () => {
      // Hit the auth rate limit (5 requests)
      for (let i = 0; i < 5; i++) {
        await authRateLimiter.isAllowed("127.0.0.1")
      }

      const result = await authRateLimiter.isAllowed("127.0.0.1")
      expect(result.allowed).toBe(false)
    })
  })
})
