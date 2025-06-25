import fs from "fs"
import path from "path"

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  meta?: any
  userId?: string
  ipAddress?: string
  userAgent?: string
}

class Logger {
  private logLevel: LogLevel
  private logFile: string

  constructor() {
    this.logLevel = this.getLogLevel()
    this.logFile = process.env.LOG_FILE || "./logs/app.log"
    this.ensureLogDirectory()
  }

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toLowerCase()
    switch (level) {
      case "debug":
        return LogLevel.DEBUG
      case "info":
        return LogLevel.INFO
      case "warn":
        return LogLevel.WARN
      case "error":
        return LogLevel.ERROR
      default:
        return LogLevel.INFO
    }
  }

  private ensureLogDirectory() {
    const logDir = path.dirname(this.logFile)
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
  }

  private writeLog(entry: LogEntry) {
    const logLine = JSON.stringify(entry) + "\n"

    // Console output in development
    if (process.env.NODE_ENV !== "production") {
      const colors = {
        ERROR: "\x1b[31m",
        WARN: "\x1b[33m",
        INFO: "\x1b[36m",
        DEBUG: "\x1b[37m",
        SECURITY: "\x1b[35m",
        AUDIT: "\x1b[32m",
      }
      const reset = "\x1b[0m"
      const color = colors[entry.level as keyof typeof colors] || reset

      console.log(`${color}[${entry.timestamp}] ${entry.level}: ${entry.message}${reset}`)
      if (entry.meta) {
        console.log(`${color}Meta:${reset}`, entry.meta)
      }
    }

    // File output
    try {
      fs.appendFileSync(this.logFile, logLine)
    } catch (error) {
      console.error("Failed to write to log file:", error)
    }
  }

  private createLogEntry(level: string, message: string, meta?: any, context?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      userId: context?.userId,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    }
  }

  error(message: string, meta?: any, context?: any) {
    if (this.logLevel >= LogLevel.ERROR) {
      this.writeLog(this.createLogEntry("ERROR", message, meta, context))
    }
  }

  warn(message: string, meta?: any, context?: any) {
    if (this.logLevel >= LogLevel.WARN) {
      this.writeLog(this.createLogEntry("WARN", message, meta, context))
    }
  }

  info(message: string, meta?: any, context?: any) {
    if (this.logLevel >= LogLevel.INFO) {
      this.writeLog(this.createLogEntry("INFO", message, meta, context))
    }
  }

  debug(message: string, meta?: any, context?: any) {
    if (this.logLevel >= LogLevel.DEBUG) {
      this.writeLog(this.createLogEntry("DEBUG", message, meta, context))
    }
  }

  security(message: string, meta?: any, context?: any) {
    const securityEntry = this.createLogEntry("SECURITY", message, meta, context)
    this.writeLog(securityEntry)

    // Also write to security-specific log
    const securityLogFile = process.env.SECURITY_LOG_FILE || "./logs/security.log"
    try {
      this.ensureLogDirectory()
      fs.appendFileSync(securityLogFile, JSON.stringify(securityEntry) + "\n")
    } catch (error) {
      console.error("Failed to write to security log file:", error)
    }
  }

  audit(action: string, userId: string, details?: any, context?: any) {
    const auditEntry = {
      ...this.createLogEntry("AUDIT", `User ${userId} performed: ${action}`, details, context),
      action,
      userId,
    }
    this.writeLog(auditEntry)

    // Also write to audit-specific log
    const auditLogFile = process.env.AUDIT_LOG_FILE || "./logs/audit.log"
    try {
      this.ensureLogDirectory()
      fs.appendFileSync(auditLogFile, JSON.stringify(auditEntry) + "\n")
    } catch (error) {
      console.error("Failed to write to audit log file:", error)
    }
  }
}

export const logger = new Logger()
