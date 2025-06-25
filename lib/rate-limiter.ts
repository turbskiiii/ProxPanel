interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (ip: string, userId?: string) => string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config

    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  private getKey(ip: string, userId?: string): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(ip, userId)
    }
    return userId ? `${ip}:${userId}` : ip
  }

  async isAllowed(
    ip: string,
    userId?: string,
  ): Promise<{
    allowed: boolean
    resetTime?: number
    remaining?: number
  }> {
    const key = this.getKey(ip, userId)
    const now = Date.now()
    const resetTime = now + this.config.windowMs

    let entry = this.store.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      entry = {
        count: 1,
        resetTime,
      }
      this.store.set(key, entry)

      return {
        allowed: true,
        resetTime,
        remaining: this.config.maxRequests - 1,
      }
    }

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        resetTime: entry.resetTime,
        remaining: 0,
      }
    }

    entry.count++
    this.store.set(key, entry)

    return {
      allowed: true,
      resetTime: entry.resetTime,
      remaining: this.config.maxRequests - entry.count,
    }
  }
}

// Pre-configured rate limiters
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
})

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
})

export const vpsActionRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
})

export const adminRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 50,
})
