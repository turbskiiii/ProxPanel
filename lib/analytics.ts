interface AnalyticsEvent {
  id: string;
  type: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  properties: Record<string, any>;
  context: {
    userAgent: string;
    ip: string;
    url: string;
    referrer?: string;
    screenResolution?: string;
    language?: string;
  };
}

interface UserJourney {
  userId: string;
  sessionId: string;
  events: AnalyticsEvent[];
  startTime: number;
  endTime?: number;
  duration?: number;
  conversion?: boolean;
}

interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topPages: Array<{ page: string; views: number }>;
  topEvents: Array<{ event: string; count: number }>;
  userRetention: Record<string, number>;
}

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private events: AnalyticsEvent[] = [];
  private userJourneys: Map<string, UserJourney> = new Map();
  private sessionData: Map<
    string,
    { userId: string; startTime: number; events: AnalyticsEvent[] }
  > = new Map();
  private isTracking = false;

  private constructor() {
    this.setupTracking();
  }

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  private setupTracking() {
    if (typeof window !== 'undefined') {
      // Track page views
      this.trackPageView();

      // Track user interactions
      this.trackUserInteractions();

      // Track performance metrics
      this.trackPerformance();

      // Track errors
      this.trackErrors();
    }
  }

  private trackPageView() {
    const trackPageView = () => {
      this.track('page_view', {
        title: document.title,
        url: window.location.href,
        path: window.location.pathname,
      });
    };

    // Track initial page view
    trackPageView();

    // Track navigation changes (for SPA)
    let currentUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        trackPageView();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private trackUserInteractions() {
    // Track clicks
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      if (target) {
        this.track('click', {
          element: target.tagName.toLowerCase(),
          text: target.textContent?.substring(0, 50),
          className: target.className,
          id: target.id,
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', event => {
      const form = event.target as HTMLFormElement;
      if (form) {
        this.track('form_submit', {
          formId: form.id,
          formAction: form.action,
          formMethod: form.method,
        });
      }
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round(
        ((window.scrollY + window.innerHeight) / document.body.scrollHeight) *
          100
      );
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (maxScrollDepth % 25 === 0) {
          this.track('scroll_depth', { depth: maxScrollDepth });
        }
      }
    });
  }

  private trackPerformance() {
    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.track('lcp', { value: lastEntry.startTime });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.track('fid', { value: entry.processingStart - entry.startTime });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.track('cls', { value: clsValue });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Track resource loading
    const resourceObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'resource') {
          this.track('resource_load', {
            name: entry.name,
            duration: entry.duration,
            size: (entry as any).transferSize,
            type: (entry as any).initiatorType,
          });
        }
      });
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
  }

  private trackErrors() {
    window.addEventListener('error', event => {
      this.track('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', event => {
      this.track('unhandled_rejection', {
        reason: event.reason,
        promise: event.promise.toString(),
      });
    });
  }

  track(eventType: string, properties: Record<string, any> = {}) {
    if (!this.isTracking) return;

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type: eventType,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      timestamp: Date.now(),
      properties,
      context: this.getEventContext(),
    };

    this.events.push(event);

    // Keep only last 10,000 events
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }

    // Update session data
    this.updateSessionData(event);

    // Send to analytics service
    this.sendToAnalyticsService(event);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string | undefined {
    // Get user ID from localStorage, cookies, or session
    return localStorage.getItem('analytics_user_id') || undefined;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private getEventContext() {
    return {
      userAgent: navigator.userAgent,
      ip: 'unknown', // Would be set by server
      url: window.location.href,
      referrer: document.referrer,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
    };
  }

  private updateSessionData(event: AnalyticsEvent) {
    const sessionId = event.sessionId;
    const session = this.sessionData.get(sessionId);

    if (session) {
      session.events.push(event);
    } else {
      this.sessionData.set(sessionId, {
        userId: event.userId || 'anonymous',
        startTime: event.timestamp,
        events: [event],
      });
    }
  }

  private async sendToAnalyticsService(event: AnalyticsEvent) {
    // Send to external analytics service (e.g., Google Analytics, Mixpanel)
    if (process.env.NODE_ENV === 'production') {
      try {
        // Example: Send to Google Analytics 4
        // if (window.gtag) {
        //   window.gtag('event', event.type, {
        //     event_category: 'user_interaction',
        //     event_label: event.properties.title || event.type,
        //     value: event.properties.value,
        //     custom_parameters: event.properties,
        //   })
        // }
        // Example: Send to custom analytics endpoint
        // await fetch('/api/analytics', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(event),
        // })
      } catch (error) {
        console.error('Failed to send analytics event:', error);
      }
    }
  }

  // Public methods
  startTracking() {
    this.isTracking = true;
  }

  stopTracking() {
    this.isTracking = false;
  }

  identify(userId: string, traits?: Record<string, any>) {
    localStorage.setItem('analytics_user_id', userId);

    this.track('identify', {
      userId,
      traits,
    });
  }

  trackConversion(conversionType: string, value?: number) {
    this.track('conversion', {
      type: conversionType,
      value,
    });

    // Mark current session as converted
    const sessionId = this.getSessionId();
    const session = this.sessionData.get(sessionId);
    if (session) {
      session.events.push({
        id: this.generateEventId(),
        type: 'conversion',
        userId: session.userId,
        sessionId,
        timestamp: Date.now(),
        properties: { type: conversionType, value },
        context: this.getEventContext(),
      });
    }
  }

  // Analytics reporting
  getMetrics(timeRange?: { start: number; end: number }): AnalyticsMetrics {
    const events = timeRange
      ? this.events.filter(
          e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
        )
      : this.events;

    const sessions = Array.from(this.sessionData.values());
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean));
    const uniqueSessions = new Set(events.map(e => e.sessionId));

    // Calculate session durations
    const sessionDurations = sessions
      .map(session => {
        const lastEvent = session.events[session.events.length - 1];
        return lastEvent ? lastEvent.timestamp - session.startTime : 0;
      })
      .filter(duration => duration > 0);

    const averageSessionDuration =
      sessionDurations.length > 0
        ? sessionDurations.reduce((sum, duration) => sum + duration, 0) /
          sessionDurations.length
        : 0;

    // Calculate bounce rate (sessions with only one event)
    const bounceSessions = sessions.filter(
      session => session.events.length === 1
    ).length;
    const bounceRate =
      sessions.length > 0 ? (bounceSessions / sessions.length) * 100 : 0;

    // Calculate conversion rate
    const conversionEvents = events.filter(e => e.type === 'conversion');
    const conversionRate =
      events.length > 0 ? (conversionEvents.length / events.length) * 100 : 0;

    // Top pages
    const pageViews = events.filter(e => e.type === 'page_view');
    const pageCounts = new Map<string, number>();
    pageViews.forEach(event => {
      const page = event.properties.path || event.properties.url;
      pageCounts.set(page, (pageCounts.get(page) || 0) + 1);
    });

    const topPages = Array.from(pageCounts.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Top events
    const eventCounts = new Map<string, number>();
    events.forEach(event => {
      eventCounts.set(event.type, (eventCounts.get(event.type) || 0) + 1);
    });

    const topEvents = Array.from(eventCounts.entries())
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // User retention (simplified)
    const userRetention: Record<string, number> = {
      '1_day': 0,
      '7_days': 0,
      '30_days': 0,
    };

    return {
      totalUsers: uniqueUsers.size,
      activeUsers: uniqueUsers.size, // Simplified - would need more complex logic
      totalSessions: uniqueSessions.size,
      averageSessionDuration,
      bounceRate,
      conversionRate,
      topPages,
      topEvents,
      userRetention,
    };
  }

  // Export data
  exportData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = [
        'id',
        'type',
        'userId',
        'sessionId',
        'timestamp',
        'properties',
        'context',
      ];
      const csv = [
        headers.join(','),
        ...this.events.map(event =>
          [
            event.id,
            event.type,
            event.userId || '',
            event.sessionId,
            event.timestamp,
            JSON.stringify(event.properties),
            JSON.stringify(event.context),
          ].join(',')
        ),
      ].join('\n');
      return csv;
    }

    return JSON.stringify(this.events, null, 2);
  }

  // Clear data
  clearData() {
    this.events = [];
    this.userJourneys.clear();
    this.sessionData.clear();
  }
}

// Singleton instance
export const analytics = AnalyticsManager.getInstance();

// React hook for analytics
export function useAnalytics() {
  const track = React.useCallback(
    (eventType: string, properties?: Record<string, any>) => {
      analytics.track(eventType, properties);
    },
    []
  );

  const identify = React.useCallback(
    (userId: string, traits?: Record<string, any>) => {
      analytics.identify(userId, traits);
    },
    []
  );

  const trackConversion = React.useCallback(
    (conversionType: string, value?: number) => {
      analytics.trackConversion(conversionType, value);
    },
    []
  );

  return { track, identify, trackConversion };
}
