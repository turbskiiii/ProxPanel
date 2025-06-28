import crypto from 'crypto';
import { logger } from './logger';

export interface SecurityEvent {
  id: string;
  type:
    | 'authentication'
    | 'authorization'
    | 'input_validation'
    | 'rate_limit'
    | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip: string;
  userAgent: string;
  timestamp: number;
  details: Record<string, any>;
  blocked: boolean;
}

export interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  maxRequestRate: number;
  suspiciousPatterns: RegExp[];
  allowedOrigins: string[];
}

export class SecurityManager {
  private static instance: SecurityManager;
  private events: SecurityEvent[] = [];
  private failedAttempts: Map<string, { count: number; lastAttempt: number }> =
    new Map();
  private blockedIPs: Map<string, { until: number; reason: string }> =
    new Map();
  private activeSessions: Map<
    string,
    { userId: string; lastActivity: number }
  > = new Map();
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      maxRequestRate: 100, // requests per minute
      suspiciousPatterns: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /union\s+select/gi,
        /drop\s+table/gi,
        /insert\s+into/gi,
        /delete\s+from/gi,
      ],
      allowedOrigins: ['localhost:3000', 'proxpanel.com'],
    };
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Password validation
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.config.passwordMinLength) {
      errors.push(
        `Password must be at least ${this.config.passwordMinLength} characters long`
      );
    }

    if (this.config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.config.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (
      this.config.requireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password',
      '123456',
      'qwerty',
      'admin',
      'letmein',
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');

    // Check for suspicious patterns
    this.config.suspiciousPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        this.recordSecurityEvent({
          type: 'input_validation',
          severity: 'high',
          ip: 'unknown',
          userAgent: 'unknown',
          details: {
            input: sanitized,
            pattern: pattern.source,
            action: 'sanitization_blocked',
          },
          blocked: true,
        });
        throw new Error('Suspicious input detected');
      }
    });

    // HTML entity encoding
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return sanitized;
  }

  // Rate limiting
  checkRateLimit(
    ip: string,
    endpoint: string
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const key = `${ip}:${endpoint}`;
    const now = Date.now();
    const window = 60 * 1000; // 1 minute

    // Get current requests for this IP/endpoint
    const requests = this.getRequestsInWindow(key, now - window);

    if (requests.length >= this.config.maxRequestRate) {
      this.recordSecurityEvent({
        type: 'rate_limit',
        severity: 'medium',
        ip,
        userAgent: 'unknown',
        details: {
          endpoint,
          requests: requests.length,
          limit: this.config.maxRequestRate,
        },
        blocked: true,
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: requests[0] + window,
      };
    }

    // Add current request
    this.addRequest(key, now);

    return {
      allowed: true,
      remaining: this.config.maxRequestRate - requests.length - 1,
      resetTime: now + window,
    };
  }

  // Authentication security
  checkLoginAttempt(
    ip: string,
    userAgent: string,
    userId?: string
  ): { allowed: boolean; reason?: string } {
    // Check if IP is blocked
    const blocked = this.blockedIPs.get(ip);
    if (blocked && blocked.until > Date.now()) {
      this.recordSecurityEvent({
        type: 'authentication',
        severity: 'high',
        ip,
        userAgent,
        userId,
        details: {
          reason: 'ip_blocked',
          blockReason: blocked.reason,
          remainingTime: blocked.until - Date.now(),
        },
        blocked: true,
      });
      return { allowed: false, reason: 'IP address is temporarily blocked' };
    }

    // Check failed attempts
    const attempts = this.failedAttempts.get(ip);
    if (attempts && attempts.count >= this.config.maxLoginAttempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
      if (timeSinceLastAttempt < this.config.lockoutDuration) {
        this.recordSecurityEvent({
          type: 'authentication',
          severity: 'medium',
          ip,
          userAgent,
          userId,
          details: {
            reason: 'too_many_attempts',
            attempts: attempts.count,
            remainingLockout:
              this.config.lockoutDuration - timeSinceLastAttempt,
          },
          blocked: true,
        });
        return { allowed: false, reason: 'Too many failed login attempts' };
      } else {
        // Reset failed attempts after lockout period
        this.failedAttempts.delete(ip);
      }
    }

    return { allowed: true };
  }

  recordFailedLogin(ip: string, userAgent: string, userId?: string) {
    const attempts = this.failedAttempts.get(ip) || {
      count: 0,
      lastAttempt: 0,
    };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    this.failedAttempts.set(ip, attempts);

    this.recordSecurityEvent({
      type: 'authentication',
      severity:
        attempts.count >= this.config.maxLoginAttempts ? 'high' : 'medium',
      ip,
      userAgent,
      userId,
      details: {
        reason: 'failed_login',
        attemptCount: attempts.count,
        maxAttempts: this.config.maxLoginAttempts,
      },
      blocked: false,
    });

    // Block IP if max attempts reached
    if (attempts.count >= this.config.maxLoginAttempts) {
      this.blockedIPs.set(ip, {
        until: Date.now() + this.config.lockoutDuration,
        reason: 'Too many failed login attempts',
      });
    }
  }

  // Session management
  createSession(sessionId: string, userId: string): void {
    this.activeSessions.set(sessionId, {
      userId,
      lastActivity: Date.now(),
    });
  }

  validateSession(sessionId: string): { valid: boolean; userId?: string } {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return { valid: false };
    }

    const now = Date.now();
    if (now - session.lastActivity > this.config.sessionTimeout) {
      this.activeSessions.delete(sessionId);
      return { valid: false };
    }

    // Update last activity
    session.lastActivity = now;
    this.activeSessions.set(sessionId, session);

    return { valid: true, userId: session.userId };
  }

  invalidateSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
  }

  // CORS validation
  validateOrigin(origin: string): boolean {
    return this.config.allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowed === origin;
    });
  }

  // CSRF protection
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  validateCSRFToken(token: string, storedToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(storedToken, 'hex')
    );
  }

  // Security event recording
  private recordSecurityEvent(
    event: Omit<SecurityEvent, 'id' | 'timestamp'>
  ): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    this.events.push(securityEvent);

    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Log security event
    logger.warn('Security event recorded', {
      eventId: securityEvent.id,
      type: securityEvent.type,
      severity: securityEvent.severity,
      ip: securityEvent.ip,
      blocked: securityEvent.blocked,
      details: securityEvent.details,
    });

    // Send alert for high/critical events
    if (
      securityEvent.severity === 'high' ||
      securityEvent.severity === 'critical'
    ) {
      this.sendSecurityAlert(securityEvent);
    }
  }

  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Implementation for sending security alerts
    // This could be email, Slack, or other notification service
    if (process.env.NODE_ENV === 'production') {
      logger.error('Security alert triggered', {
        eventId: event.id,
        type: event.type,
        severity: event.severity,
        ip: event.ip,
        details: event.details,
      });
    }
  }

  // Request tracking for rate limiting
  private getRequestsInWindow(key: string, since: number): number[] {
    // This would typically be stored in Redis or similar
    // For now, we'll use a simple in-memory approach
    return [];
  }

  private addRequest(key: string, timestamp: number): void {
    // Implementation for adding request to tracking
  }

  // Public methods for security analysis
  getSecurityStats(timeRange?: { start: number; end: number }) {
    const events = timeRange
      ? this.events.filter(
          e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
        )
      : this.events;

    return {
      total: events.length,
      byType: {
        authentication: events.filter(e => e.type === 'authentication').length,
        authorization: events.filter(e => e.type === 'authorization').length,
        input_validation: events.filter(e => e.type === 'input_validation')
          .length,
        rate_limit: events.filter(e => e.type === 'rate_limit').length,
        suspicious_activity: events.filter(
          e => e.type === 'suspicious_activity'
        ).length,
      },
      bySeverity: {
        critical: events.filter(e => e.severity === 'critical').length,
        high: events.filter(e => e.severity === 'high').length,
        medium: events.filter(e => e.severity === 'medium').length,
        low: events.filter(e => e.severity === 'low').length,
      },
      blocked: events.filter(e => e.blocked).length,
      topIPs: this.getTopIPs(events),
    };
  }

  private getTopIPs(
    events: SecurityEvent[]
  ): Array<{ ip: string; count: number }> {
    const ipCounts = new Map<string, number>();
    events.forEach(event => {
      ipCounts.set(event.ip, (ipCounts.get(event.ip) || 0) + 1);
    });

    return Array.from(ipCounts.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Configuration management
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Security configuration updated', { newConfig });
  }

  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  // Cleanup methods
  clearBlockedIPs(): void {
    this.blockedIPs.clear();
  }

  clearFailedAttempts(): void {
    this.failedAttempts.clear();
  }

  clearSecurityEvents(): void {
    this.events = [];
  }
}

// Singleton instance
export const securityManager = SecurityManager.getInstance();

// Middleware for Express/Next.js
export function securityMiddleware(req: any, res: any, next: any) {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Rate limiting
  const rateLimit = securityManager.checkRateLimit(ip, req.path);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
    });
  }

  // Input sanitization for query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        try {
          req.query[key] = securityManager.sanitizeInput(req.query[key]);
        } catch (error) {
          return res.status(400).json({ error: 'Invalid input detected' });
        }
      }
    });
  }

  // Input sanitization for body
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj: any): any => {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          try {
            sanitized[key] = securityManager.sanitizeInput(value);
          } catch (error) {
            return res.status(400).json({ error: 'Invalid input detected' });
          }
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };
    req.body = sanitizeObject(req.body);
  }

  next();
}
