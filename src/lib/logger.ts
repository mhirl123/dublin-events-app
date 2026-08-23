/**
 * Centralized logging utility
 * Supports different log levels: DEBUG, INFO, WARN, ERROR
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: any
  error?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logLevel = process.env.LOG_LEVEL || 'INFO'

  private getLevelPriority(level: LogLevel): number {
    const priorities = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 }
    return priorities[level]
  }

  private shouldLog(level: LogLevel): boolean {
    return this.getLevelPriority(level) >= this.getLevelPriority(this.logLevel as LogLevel)
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, data } = entry
    let log = `[${timestamp}] [${level}]`
    if (context) log += ` [${context}]`
    log += ` ${message}`
    if (data) log += ` ${JSON.stringify(data)}`
    return log
  }

  private sendToMonitoring(entry: LogEntry): void {
    // Send errors to monitoring service (Sentry, DataDog, etc.)
    if (entry.level === 'ERROR' && process.env.SENTRY_DSN) {
      // Example: Sentry integration
      console.error('ERROR logged:', entry.message, entry.data)
    }
  }

  debug(message: string, context?: string, data?: any): void {
    if (!this.shouldLog('DEBUG')) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      message,
      context,
      data,
    }
    console.debug(this.formatLog(entry))
  }

  info(message: string, context?: string, data?: any): void {
    if (!this.shouldLog('INFO')) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      context,
      data,
    }
    console.log(this.formatLog(entry))
  }

  warn(message: string, context?: string, data?: any): void {
    if (!this.shouldLog('WARN')) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      context,
      data,
    }
    console.warn(this.formatLog(entry))
  }

  error(message: string, context?: string, error?: Error | unknown, data?: any): void {
    if (!this.shouldLog('ERROR')) return

    const errorMessage = error instanceof Error ? error.message : String(error)
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      context,
      error: errorMessage,
      data,
    }

    console.error(this.formatLog(entry))
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack)
    }

    this.sendToMonitoring(entry)
  }

  // Performance timing
  startTimer(label: string): () => void {
    const start = Date.now()
    return () => {
      const duration = Date.now() - start
      this.debug(`Timer "${label}" completed in ${duration}ms`)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for use in API routes
export default logger
