interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'api' | 'ui' | 'database' | 'system';
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  id: string;
  timestamp: number;
  metrics: PerformanceMetric[];
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Set<(report: PerformanceReport) => void> = new Set();
  private isCollecting = false;

  constructor() {
    this.setupGlobalMonitoring();
  }

  private setupGlobalMonitoring() {
    // Monitor API calls
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const startTime = performance.now();
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;

        try {
          const response = await originalFetch(...args);
          const endTime = performance.now();

          this.recordMetric({
            name: 'api_response_time',
            value: endTime - startTime,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'api',
            metadata: {
              url,
              method: args[1]?.method || 'GET',
              status: response.status,
              success: response.ok,
            },
          });

          return response;
        } catch (error) {
          const endTime = performance.now();

          this.recordMetric({
            name: 'api_error',
            value: endTime - startTime,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'api',
            metadata: {
              url,
              method: args[1]?.method || 'GET',
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });

          throw error;
        }
      };
    }

    // Monitor React component render times
    if (typeof window !== 'undefined') {
      const originalCreateElement = React.createElement;
      React.createElement = (...args) => {
        const startTime = performance.now();
        const element = originalCreateElement(...args);

        // Use setTimeout to measure after render
        setTimeout(() => {
          const endTime = performance.now();
          this.recordMetric({
            name: 'component_render_time',
            value: endTime - startTime,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'ui',
            metadata: {
              component: args[0],
              props: args[1],
            },
          });
        }, 0);

        return element;
      };
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Generate report every 100 metrics
    if (this.metrics.length % 100 === 0) {
      this.generateReport();
    }
  }

  private generateReport(): PerformanceReport {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(
      m => now - m.timestamp < 60000 // Last minute
    );

    const apiMetrics = recentMetrics.filter(m => m.category === 'api');
    const totalRequests = apiMetrics.length;
    const averageResponseTime =
      apiMetrics.length > 0
        ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length
        : 0;
    const errorRate =
      apiMetrics.length > 0
        ? (apiMetrics.filter(m => m.metadata?.success === false).length /
            apiMetrics.length) *
          100
        : 0;
    const throughput = totalRequests / 60; // requests per second

    const report: PerformanceReport = {
      id: `report_${now}`,
      timestamp: now,
      metrics: recentMetrics,
      summary: {
        totalRequests,
        averageResponseTime,
        errorRate,
        throughput,
      },
    };

    // Notify observers
    this.observers.forEach(observer => observer(report));

    return report;
  }

  subscribe(observer: (report: PerformanceReport) => void) {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  startCollection() {
    this.isCollecting = true;
    console.log('Performance monitoring started');
  }

  stopCollection() {
    this.isCollecting = false;
    console.log('Performance monitoring stopped');
  }

  getMetrics(category?: string, timeRange?: { start: number; end: number }) {
    let filtered = this.metrics;

    if (category) {
      filtered = filtered.filter(m => m.category === category);
    }

    if (timeRange) {
      filtered = filtered.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    return filtered;
  }

  clearMetrics() {
    this.metrics = [];
  }

  // Performance optimization helpers
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Memory usage monitoring
  getMemoryUsage() {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  }

  // Network monitoring
  getNetworkInfo() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    return null;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  const [report, setReport] = React.useState<PerformanceReport | null>(null);

  React.useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe(setReport);
    return unsubscribe;
  }, []);

  return {
    report,
    startCollection:
      performanceMonitor.startCollection.bind(performanceMonitor),
    stopCollection: performanceMonitor.stopCollection.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor),
    getMemoryUsage: performanceMonitor.getMemoryUsage.bind(performanceMonitor),
    getNetworkInfo: performanceMonitor.getNetworkInfo.bind(performanceMonitor),
  };
}

// Utility functions
export const debounce = performanceMonitor.debounce.bind(performanceMonitor);
export const throttle = performanceMonitor.throttle.bind(performanceMonitor);
