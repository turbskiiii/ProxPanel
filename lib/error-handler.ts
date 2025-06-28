import { NextResponse } from 'next/server';
import { logger } from './logger';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
  }
}

export function handleApiError(error: unknown, context?: any): NextResponse {
  // Log the error
  if (error instanceof Error) {
    logger.error('API Error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  } else {
    logger.error('Unknown API Error', { error, context });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Handle application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Handle database errors
  if (error instanceof Error) {
    if (error.message.includes('ER_DUP_ENTRY')) {
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      );
    }

    if (error.message.includes('ER_NO_REFERENCED_ROW')) {
      return NextResponse.json(
        { error: 'Referenced resource not found' },
        { status: 400 }
      );
    }
  }

  // Generic server error
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export function asyncHandler(fn: Function) {
  return async (req: Request, context?: any) => {
    try {
      return await fn(req, context);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  url?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  timestamp: number;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
  timestamp: number;
  stack?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 100;
  private isProcessing = false;
  private errorCounts: Map<string, number> = new Map();
  private alertThresholds = {
    low: 10,
    medium: 5,
    high: 3,
    critical: 1,
  };

  private constructor() {
    this.setupGlobalErrorHandling();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.handleError(
        reason instanceof Error ? reason : new Error(String(reason)),
        {
          timestamp: Date.now(),
          action: 'unhandledRejection',
          metadata: { promise: promise.toString() },
        },
        'high'
      );
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', error => {
      this.handleError(
        error,
        {
          timestamp: Date.now(),
          action: 'uncaughtException',
        },
        'critical'
      );
    });

    // Handle window errors in browser
    if (typeof window !== 'undefined') {
      window.addEventListener('error', event => {
        this.handleError(
          new Error(event.message),
          {
            timestamp: Date.now(),
            url: event.filename,
            action: 'windowError',
            metadata: {
              lineNumber: event.lineno,
              columnNumber: event.colno,
            },
          },
          'medium'
        );
      });

      window.addEventListener('unhandledrejection', event => {
        this.handleError(
          event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason)),
          {
            timestamp: Date.now(),
            action: 'unhandledRejection',
            metadata: { promise: event.promise.toString() },
          },
          'high'
        );
      });
    }
  }

  handleError(
    error: Error,
    context: Partial<ErrorContext> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): string {
    const errorId = this.generateErrorId();
    const fullContext: ErrorContext = {
      timestamp: Date.now(),
      ...context,
    };

    const errorReport: ErrorReport = {
      id: errorId,
      error,
      context: fullContext,
      severity,
      handled: false,
      timestamp: Date.now(),
      stack: error.stack,
    };

    // Add to queue
    this.errorQueue.push(errorReport);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Update error counts
    const errorKey = `${error.name}:${error.message}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);

    // Log the error
    this.logError(errorReport);

    // Check if we need to send alerts
    this.checkAlertThresholds(errorReport);

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processErrorQueue();
    }

    return errorId;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(errorReport: ErrorReport) {
    const { error, context, severity } = errorReport;

    const logData = {
      errorId: errorReport.id,
      name: error.name,
      message: error.message,
      stack: error.stack,
      severity,
      context,
      timestamp: new Date(errorReport.timestamp).toISOString(),
    };

    switch (severity) {
      case 'critical':
        logger.error('Critical error occurred', logData);
        break;
      case 'high':
        logger.error('High severity error', logData);
        break;
      case 'medium':
        logger.warn('Medium severity error', logData);
        break;
      case 'low':
        logger.info('Low severity error', logData);
        break;
    }
  }

  private async processErrorQueue() {
    if (this.isProcessing || this.errorQueue.length === 0) return;

    this.isProcessing = true;

    try {
      const errorsToProcess = [...this.errorQueue];
      this.errorQueue = [];

      // Process errors in batches
      const batchSize = 10;
      for (let i = 0; i < errorsToProcess.length; i += batchSize) {
        const batch = errorsToProcess.slice(i, i + batchSize);
        await this.processErrorBatch(batch);
      }
    } catch (error) {
      logger.error('Error processing error queue', { error });
    } finally {
      this.isProcessing = false;
    }
  }

  private async processErrorBatch(errorReports: ErrorReport[]) {
    // Send to external error tracking service (e.g., Sentry, LogRocket)
    try {
      await this.sendToErrorTrackingService(errorReports);
    } catch (error) {
      logger.error('Failed to send errors to tracking service', { error });
    }

    // Store in database for analysis
    try {
      await this.storeErrorsInDatabase(errorReports);
    } catch (error) {
      logger.error('Failed to store errors in database', { error });
    }
  }

  private async sendToErrorTrackingService(errorReports: ErrorReport[]) {
    // Implementation for external error tracking service
    // This could be Sentry, LogRocket, or any other service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry
      // errorReports.forEach(report => {
      //   Sentry.captureException(report.error, {
      //     extra: report.context,
      //     tags: { severity: report.severity }
      //   })
      // })
    }
  }

  private async storeErrorsInDatabase(errorReports: ErrorReport[]) {
    // Implementation for storing errors in database
    // This would typically be done through your database service
    logger.info('Storing errors in database', {
      count: errorReports.length,
      errors: errorReports.map(r => ({ id: r.id, severity: r.severity })),
    });
  }

  private checkAlertThresholds(errorReport: ErrorReport) {
    const { severity } = errorReport;
    const threshold = this.alertThresholds[severity];
    const errorKey = `${errorReport.error.name}:${errorReport.error.message}`;
    const count = this.errorCounts.get(errorKey) || 0;

    if (count >= threshold) {
      this.sendAlert(errorReport, count);
    }
  }

  private async sendAlert(errorReport: ErrorReport, count: number) {
    const alertData = {
      errorId: errorReport.id,
      errorName: errorReport.error.name,
      errorMessage: errorReport.error.message,
      severity: errorReport.severity,
      count,
      context: errorReport.context,
      timestamp: new Date().toISOString(),
    };

    logger.error('Error threshold exceeded - sending alert', alertData);

    // Send alert via email, Slack, or other notification service
    try {
      await this.sendNotification(alertData);
    } catch (error) {
      logger.error('Failed to send error alert', { error, alertData });
    }
  }

  private async sendNotification(alertData: any) {
    // Implementation for sending notifications
    // This could be email, Slack, Discord, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Send Slack notification
      // await slack.sendMessage({
      //   channel: '#alerts',
      //   text: `🚨 Error Alert: ${alertData.errorName} (${alertData.count} occurrences)`,
      //   attachments: [{
      //     fields: [
      //       { title: 'Severity', value: alertData.severity, short: true },
      //       { title: 'Count', value: alertData.count.toString(), short: true },
      //       { title: 'Message', value: alertData.errorMessage }
      //     ]
      //   }]
      // })
    }
  }

  // Public methods for error analysis
  getErrorStats(timeRange?: { start: number; end: number }) {
    const errors = timeRange
      ? this.errorQueue.filter(
          e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
        )
      : this.errorQueue;

    const stats = {
      total: errors.length,
      bySeverity: {
        critical: errors.filter(e => e.severity === 'critical').length,
        high: errors.filter(e => e.severity === 'high').length,
        medium: errors.filter(e => e.severity === 'medium').length,
        low: errors.filter(e => e.severity === 'low').length,
      },
      byType: {} as Record<string, number>,
      topErrors: [] as Array<{ error: string; count: number }>,
    };

    // Count by error type
    errors.forEach(error => {
      const errorType = error.error.name;
      stats.byType[errorType] = (stats.byType[errorType] || 0) + 1;
    });

    // Get top errors
    const errorCounts = new Map<string, number>();
    errors.forEach(error => {
      const key = `${error.error.name}:${error.error.message}`;
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
    });

    stats.topErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  clearErrors() {
    this.errorQueue = [];
    this.errorCounts.clear();
  }
}

// Singleton instance
export const errorHandler = ErrorHandler.getInstance();

// React error boundary hook
export function useErrorBoundary() {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (error: Error) => {
      setHasError(true);
      setError(error);
      errorHandler.handleError(
        error,
        {
          action: 'reactErrorBoundary',
        },
        'high'
      );
    };

    // Add global error handler
    window.addEventListener('error', event => {
      handleError(new Error(event.message));
    });

    return () => {
      window.removeEventListener('error', event => {
        handleError(new Error(event.message));
      });
    };
  }, []);

  return { hasError, error, resetError: () => setHasError(false) };
}

// Utility function for wrapping async functions with error handling
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Partial<ErrorContext>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        context,
        'medium'
      );
      throw error;
    }
  };
}
