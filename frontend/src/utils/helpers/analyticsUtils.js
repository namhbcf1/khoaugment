/**
 * Analytics Utilities
 * Provides event tracking, performance monitoring, and offline analytics capabilities
 * Edge-optimized for Cloudflare environment
 */

// Default configuration
const DEFAULT_CONFIG = {
  enabled: true,
  consoleLog: (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development'), // Log to console in development
  endpointUrl: (import.meta.env && import.meta.env.VITE_ANALYTICS_ENDPOINT) || '/api/analytics',
  bufferSize: 10, // Number of events to buffer before sending
  flushInterval: 30000, // 30 seconds
  samplingRate: 1.0, // Track 100% of events by default
  includePerformance: true, // Include performance data
  anonymizeIp: true, // Anonymize IP addresses
  offlineStorage: true, // Store events offline when disconnected
  appVersion: (import.meta.env && import.meta.env.VITE_APP_VERSION) || '1.0.0',
};

// Analytics state
let config = { ...DEFAULT_CONFIG };
let eventBuffer = [];
let performanceMetrics = {};
let isInitialized = false;
let flushIntervalId = null;
let sessionId = generateSessionId();
let pageViewsCount = 0;

/**
 * Initialize analytics with custom configuration
 * @param {Object} customConfig - Custom configuration options
 */
export const init = (customConfig = {}) => {
  if (isInitialized) return;
  
  // Merge custom configuration with defaults
  config = { ...DEFAULT_CONFIG, ...customConfig };
  
  // Initialize session
  initSession();
  
  // Schedule automatic event flush
  if (config.flushInterval > 0) {
    flushIntervalId = setInterval(() => flush(), config.flushInterval);
  }
  
  // Track performance metrics
  if (config.includePerformance) {
    trackPerformance();
  }
  
  // Listen for page visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Listen for online/offline events
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Track initial page view
  trackPageView();
  
  isInitialized = true;
};

/**
 * Log an event to the analytics system
 * @param {String} eventName - Name of the event
 * @param {Object} eventData - Additional event data
 * @param {Boolean} immediate - Whether to send immediately or buffer
 */
export const logEvent = (eventName, eventData = {}, immediate = false) => {
  if (!config.enabled) return;
  
  // Skip based on sampling rate
  if (Math.random() > config.samplingRate) return;
  
  const event = {
    eventName,
    eventData,
    timestamp: Date.now(),
    sessionId,
    url: (typeof window !== 'undefined' && window.location) ? window.location.href : '',
    referrer: (typeof document !== 'undefined' && document.referrer) ? document.referrer : '',
    userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '',
    screenSize: (typeof window !== 'undefined') ? `${window.innerWidth}x${window.innerHeight}` : '0x0',
    appVersion: config.appVersion
  };
  
  // Add performance metrics if available
  if (config.includePerformance) {
    event.performance = { ...performanceMetrics };
  }
  
  // Log to console in development
  if (config.consoleLog) {
    console.log(`Analytics Event: ${eventName}`, event);
  }
  
  // Buffer or send immediately
  if (immediate) {
    sendEvent(event);
  } else {
    eventBuffer.push(event);
    
    // Flush if buffer limit reached
    if (eventBuffer.length >= config.bufferSize) {
      flush();
    }
  }
};

/**
 * Track a page view
 * @param {String} pagePath - Custom page path (optional)
 * @param {String} pageTitle - Custom page title (optional)
 */
export const trackPageView = (pagePath = null, pageTitle = null) => {
  pageViewsCount++;
  
  logEvent('page_view', {
    path: pagePath || window.location.pathname,
    title: pageTitle || document.title,
    viewNumber: pageViewsCount
  });
};

/**
 * Track a user interaction
 * @param {String} category - Interaction category
 * @param {String} action - Interaction action
 * @param {String} label - Interaction label
 * @param {Number} value - Interaction value
 */
export const trackInteraction = (category, action, label = null, value = null) => {
  logEvent('interaction', {
    category,
    action,
    label,
    value
  });
};

/**
 * Track feature usage
 * @param {String} featureName - Name of the feature
 * @param {String} action - Action performed with the feature
 * @param {Object} metadata - Additional metadata
 */
export const trackFeatureUsage = (featureName, action, metadata = {}) => {
  logEvent('feature_usage', {
    feature: featureName,
    action,
    ...metadata
  });
};

/**
 * Track an error
 * @param {String} errorType - Error type
 * @param {String} errorMessage - Error message
 * @param {String} errorStack - Error stack trace
 * @param {Object} metadata - Additional metadata
 */
export const trackError = (errorType, errorMessage, errorStack = null, metadata = {}) => {
  logEvent('error', {
    type: errorType,
    message: errorMessage,
    stack: errorStack,
    ...metadata
  }, true); // Send immediately
};

/**
 * Track a user conversion or goal
 * @param {String} goalName - Name of the goal
 * @param {Number} value - Goal value
 * @param {Object} metadata - Additional metadata
 */
export const trackGoal = (goalName, value = null, metadata = {}) => {
  logEvent('goal', {
    name: goalName,
    value,
    ...metadata
  }, true); // Send immediately
};

/**
 * Flush all buffered events to the server
 * @returns {Promise<boolean>} - Whether flush was successful
 */
export const flush = async () => {
  if (!eventBuffer.length) return true;
  
  try {
    // Clone the buffer and clear it
    const events = [...eventBuffer];
    eventBuffer = [];
    
    // If offline, store events for later
    if (!navigator.onLine && config.offlineStorage) {
      storeOfflineEvents(events);
      return false;
    }
    
    // Send events to server
    await sendEvents(events);
    return true;
  } catch (error) {
    // If sending fails, restore events to buffer or store offline
    console.error('Failed to flush analytics events:', error);
    
    if (config.offlineStorage) {
      storeOfflineEvents(eventBuffer);
      eventBuffer = [];
      return false;
    } else {
      // Keep events in buffer to retry later
      eventBuffer = [...eventBuffer, ...events];
      return false;
    }
  }
};

/**
 * Generate a unique session ID
 * @returns {String} - Session ID
 */
function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Initialize analytics session
 */
function initSession() {
  // Check for existing session
  const storedSessionId = sessionStorage.getItem('analytics_session_id');
  const sessionTimestamp = parseInt(sessionStorage.getItem('analytics_session_timestamp') || '0');
  const now = Date.now();
  
  // If session exists and is less than 30 minutes old, reuse it
  if (storedSessionId && now - sessionTimestamp < 30 * 60 * 1000) {
    sessionId = storedSessionId;
  } else {
    // Create new session
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  
  // Update session timestamp
  sessionStorage.setItem('analytics_session_timestamp', now.toString());
}

/**
 * Track browser performance metrics
 */
function trackPerformance() {
  try {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    if (navigation) {
      performanceMetrics.loadTime = navigation.loadEventEnd - navigation.startTime;
      performanceMetrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.startTime;
      performanceMetrics.timeToFirstByte = navigation.responseStart - navigation.requestStart;
      performanceMetrics.domInteractive = navigation.domInteractive - navigation.startTime;
    }
    
    const firstPaint = paint.find(entry => entry.name === 'first-paint');
    if (firstPaint) {
      performanceMetrics.firstPaint = firstPaint.startTime;
    }
    
    const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint');
    if (firstContentfulPaint) {
      performanceMetrics.firstContentfulPaint = firstContentfulPaint.startTime;
    }
    
    // Track memory usage if available
    if (performance.memory) {
      performanceMetrics.jsHeapSizeLimit = performance.memory.jsHeapSizeLimit;
      performanceMetrics.totalJSHeapSize = performance.memory.totalJSHeapSize;
      performanceMetrics.usedJSHeapSize = performance.memory.usedJSHeapSize;
    }
    
    // Log performance data
    logEvent('performance', performanceMetrics);
    
    // Track long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              logEvent('long_task', {
                duration: entry.duration,
                name: entry.name,
                startTime: entry.startTime
              });
            }
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.error('Long task tracking not supported:', e);
      }
    }
  } catch (e) {
    console.error('Error tracking performance:', e);
  }
}

/**
 * Handle visibility change events
 * @param {Event} event - Visibility change event
 */
function handleVisibilityChange(event) {
  if (document.visibilityState === 'hidden') {
    // Page is being hidden, send events
    const pageVisibleTime = Date.now() - performanceMetrics.pageVisibleTime;
    
    logEvent('visibility_change', {
      state: 'hidden',
      visibleTime: pageVisibleTime
    }, true); // Send immediately
    
    // Flush events immediately
    flush();
  } else if (document.visibilityState === 'visible') {
    // Page is becoming visible again
    performanceMetrics.pageVisibleTime = Date.now();
    
    logEvent('visibility_change', {
      state: 'visible'
    });
  }
}

/**
 * Handle online event
 */
function handleOnline() {
  // Send any stored offline events
  processOfflineEvents();
  
  logEvent('connectivity_change', {
    state: 'online'
  });
}

/**
 * Handle offline event
 */
function handleOffline() {
  logEvent('connectivity_change', {
    state: 'offline'
  }, true); // Send immediately
}

/**
 * Store events for offline processing
 * @param {Array} events - Events to store
 */
function storeOfflineEvents(events) {
  if (!events.length) return;
  
  try {
    // Get existing stored events
    const existingEvents = JSON.parse(localStorage.getItem('offline_analytics_events') || '[]');
    
    // Add new events
    const updatedEvents = [...existingEvents, ...events];
    
    // Limit storage to 100 events to prevent excessive storage use
    const limitedEvents = updatedEvents.slice(-100);
    
    // Save back to storage
    localStorage.setItem('offline_analytics_events', JSON.stringify(limitedEvents));
  } catch (e) {
    console.error('Failed to store offline events:', e);
  }
}

/**
 * Process stored offline events
 */
async function processOfflineEvents() {
  try {
    // Get stored events
    const storedEvents = JSON.parse(localStorage.getItem('offline_analytics_events') || '[]');
    
    if (storedEvents.length === 0) return;
    
    // Clear storage
    localStorage.removeItem('offline_analytics_events');
    
    // Send events
    await sendEvents(storedEvents);
  } catch (e) {
    console.error('Failed to process offline events:', e);
  }
}

/**
 * Send a single event to the server
 * @param {Object} event - Event to send
 */
async function sendEvent(event) {
  await sendEvents([event]);
}

/**
 * Send multiple events to the server
 * @param {Array} events - Events to send
 */
async function sendEvents(events) {
  if (!events.length || !config.endpointUrl) return;
  
  try {
    // Use beacon API if available for better reliability
    // especially when page is being unloaded
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events })], { type: 'application/json' });
      const success = navigator.sendBeacon(config.endpointUrl, blob);
      
      if (success) return;
      // Fall back to fetch if sendBeacon fails
    }
    
    // Fall back to fetch
    await fetch(config.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ events }),
      keepalive: true // Keep request alive even if page unloads
    });
  } catch (error) {
    console.error('Failed to send analytics events:', error);
    throw error;
  }
}

/**
 * Track a custom metric
 * @param {String} metricName - Name of the metric
 * @param {Number} value - Metric value
 * @param {Object} metadata - Additional metadata
 */
export const trackMetric = (metricName, value, metadata = {}) => {
  logEvent('metric', {
    name: metricName,
    value,
    ...metadata
  });
};

/**
 * Set user identity for analytics
 * @param {String} userId - User ID
 * @param {Object} userProperties - User properties
 */
export const setUser = (userId, userProperties = {}) => {
  sessionStorage.setItem('analytics_user_id', userId);
  
  // Log user identification event
  logEvent('user_identified', {
    userId,
    ...userProperties
  });
};

/**
 * Clear user identity
 */
export const clearUser = () => {
  sessionStorage.removeItem('analytics_user_id');
  
  // Log user logout event
  logEvent('user_cleared');
};

/**
 * Disable analytics tracking
 */
export const disable = () => {
  config.enabled = false;
  
  // Clear scheduled flush
  if (flushIntervalId) {
    clearInterval(flushIntervalId);
    flushIntervalId = null;
  }
};

/**
 * Enable analytics tracking
 */
export const enable = () => {
  config.enabled = true;
  
  // Restart scheduled flush
  if (!flushIntervalId && config.flushInterval > 0) {
    flushIntervalId = setInterval(() => flush(), config.flushInterval);
  }
};

/**
 * Reset analytics state
 */
export const reset = () => {
  eventBuffer = [];
  performanceMetrics = {};
  pageViewsCount = 0;
  sessionId = generateSessionId();
  
  // Clear storage
  sessionStorage.removeItem('analytics_session_id');
  sessionStorage.removeItem('analytics_session_timestamp');
  sessionStorage.removeItem('analytics_user_id');
};

/**
 * Get current analytics configuration
 * @returns {Object} - Current configuration
 */
export const getConfig = () => ({ ...config });

/**
 * Update analytics configuration
 * @param {Object} newConfig - New configuration
 */
export const updateConfig = (newConfig) => {
  config = { ...config, ...newConfig };
};

/**
 * Clean up analytics (remove event listeners, etc.)
 */
export const cleanup = () => {
  // Remove event listeners
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  
  // Clear scheduled flush
  if (flushIntervalId) {
    clearInterval(flushIntervalId);
    flushIntervalId = null;
  }
  
  // Flush any remaining events
  flush();
  
  isInitialized = false;
};

// Initialize if in browser environment
if (typeof window !== 'undefined') {
  init();
}

export default {
  init,
  logEvent,
  trackPageView,
  trackInteraction,
  trackFeatureUsage,
  trackError,
  trackGoal,
  trackMetric,
  setUser,
  clearUser,
  flush,
  enable,
  disable,
  reset,
  getConfig,
  updateConfig,
  cleanup
}; 