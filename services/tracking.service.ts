/**
 * Professional Event Tracking Service
 * Centralized event tracking with privacy compliance
 */

interface TrackingEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  plan?: string;
  signupDate?: string;
  [key: string]: any;
}

class TrackingService {
  private isEnabled: boolean = true;
  private userId: string | null = null;
  private sessionId: string = this.generateSessionId();
  private eventQueue: TrackingEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startFlushInterval();
  }

  /**
   * Initialize tracking with user consent
   */
  initialize(hasUserConsent: boolean = true) {
    this.isEnabled = hasUserConsent;
    
    if (this.isEnabled) {
      this.track('tracking_initialized', {
        platform: 'react-native',
        version: '1.0.0',
      });
    }
  }

  /**
   * Set user identity
   */
  identify(userId: string, properties?: UserProperties) {
    if (!this.isEnabled) return;

    this.userId = userId;
    
    this.track('user_identified', {
      userId,
      ...properties,
    });
  }

  /**
   * Track an event
   */
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const event: TrackingEvent = {
      name: eventName,
      properties: {
        ...properties,
        platform: 'mobile',
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    this.eventQueue.push(event);

    // Log in development
    if (__DEV__) {
      console.log('📊 Tracking Event:', eventName, properties);
    }

    // Flush immediately for critical events
    const criticalEvents = ['error', 'crash', 'purchase', 'signup'];
    if (criticalEvents.includes(eventName)) {
      this.flush();
    }
  }

  /**
   * Track screen view
   */
  screen(screenName: string, properties?: Record<string, any>) {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track user action
   */
  action(actionName: string, category: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action: actionName,
      category,
      ...properties,
    });
  }

  /**
   * Track error
   */
  error(error: Error, context?: Record<string, any>) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    });
  }

  /**
   * Track performance metrics
   */
  performance(metricName: string, value: number, unit: string = 'ms') {
    this.track('performance', {
      metric_name: metricName,
      value,
      unit,
    });
  }

  /**
   * Flush events to tracking service
   */
  private async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In a real app, send to your tracking service
      // await this.sendToTrackingService(events);
      
      if (__DEV__) {
        console.log('📊 Flushing tracking events:', events.length);
      }
    } catch (error) {
      console.error('Failed to send tracking events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Start automatic flush interval
   */
  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Reset session (call on app foreground)
   */
  resetSession() {
    this.sessionId = this.generateSessionId();
    this.track('session_start');
  }

  /**
   * End session (call on app background)
   */
  endSession() {
    this.track('session_end');
    this.flush();
  }

  /**
   * Disable tracking (for privacy compliance)
   */
  disable() {
    this.isEnabled = false;
    this.eventQueue = [];
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Enable tracking
   */
  enable() {
    this.isEnabled = true;
    this.startFlushInterval();
    this.track('tracking_enabled');
  }
}

// Export singleton instance
export const Tracking = new TrackingService();
export default Tracking;