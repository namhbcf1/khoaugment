/**
 * Performance Monitoring and Optimization Service
 * Tracks and optimizes application performance metrics
 */

class PerformanceService {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.thresholds = {
      pageLoad: 3000, // 3 seconds
      apiResponse: 1000, // 1 second
      renderTime: 100, // 100ms
      bundleSize: 1000000, // 1MB
      memoryUsage: 50000000 // 50MB
    };
    this.initializeMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  initializeMonitoring() {
    // Monitor page load performance
    this.monitorPageLoad();
    
    // Monitor API response times
    this.monitorAPIPerformance();
    
    // Monitor component render times
    this.monitorRenderPerformance();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor bundle size
    this.monitorBundleSize();
    
    // Set up performance observer
    this.setupPerformanceObserver();
  }

  /**
   * Monitor page load performance
   */
  monitorPageLoad() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          if (navigation) {
            const metrics = {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
              totalTime: navigation.loadEventEnd - navigation.fetchStart,
              dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
              tcpConnect: navigation.connectEnd - navigation.connectStart,
              serverResponse: navigation.responseEnd - navigation.requestStart,
              domProcessing: navigation.domComplete - navigation.domLoading,
              timestamp: Date.now()
            };
            
            this.recordMetric('pageLoad', metrics);
            this.checkThresholds('pageLoad', metrics.totalTime);
          }
        }, 0);
      });
    }
  }

  /**
   * Monitor API response times
   */
  monitorAPIPerformance() {
    // Intercept fetch requests
    if (typeof window !== 'undefined' && window.fetch) {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const startTime = performance.now();
        const url = args[0];
        
        try {
          const response = await originalFetch(...args);
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          this.recordMetric('apiResponse', {
            url: typeof url === 'string' ? url : url.url,
            method: args[1]?.method || 'GET',
            status: response.status,
            duration,
            timestamp: Date.now()
          });
          
          this.checkThresholds('apiResponse', duration);
          return response;
        } catch (error) {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          this.recordMetric('apiError', {
            url: typeof url === 'string' ? url : url.url,
            method: args[1]?.method || 'GET',
            error: error.message,
            duration,
            timestamp: Date.now()
          });
          
          throw error;
        }
      };
    }
  }

  /**
   * Monitor component render performance
   */
  monitorRenderPerformance() {
    // This would be integrated with React DevTools in a real implementation
    // For now, we'll use a simple timing mechanism
    this.renderStartTimes = new Map();
  }

  /**
   * Start render timing for a component
   */
  startRenderTiming(componentName) {
    this.renderStartTimes.set(componentName, performance.now());
  }

  /**
   * End render timing for a component
   */
  endRenderTiming(componentName) {
    const startTime = this.renderStartTimes.get(componentName);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.recordMetric('componentRender', {
        component: componentName,
        duration,
        timestamp: Date.now()
      });
      
      this.checkThresholds('renderTime', duration);
      this.renderStartTimes.delete(componentName);
    }
  }

  /**
   * Monitor memory usage
   */
  monitorMemoryUsage() {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const metrics = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };
        
        this.recordMetric('memoryUsage', metrics);
        this.checkThresholds('memoryUsage', memory.usedJSHeapSize);
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Monitor bundle size
   */
  monitorBundleSize() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const resources = performance.getEntriesByType('resource');
      let totalSize = 0;
      
      resources.forEach(resource => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          totalSize += resource.transferSize || 0;
        }
      });
      
      this.recordMetric('bundleSize', {
        totalSize,
        timestamp: Date.now()
      });
      
      this.checkThresholds('bundleSize', totalSize);
    }
  }

  /**
   * Setup Performance Observer
   */
  setupPerformanceObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Observe Long Tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('longTask', {
              duration: entry.duration,
              startTime: entry.startTime,
              timestamp: Date.now()
            });
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longTask', longTaskObserver);
      } catch (e) {
        console.warn('Long Task API not supported');
      }

      // Observe Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('lcp', {
            value: lastEntry.startTime,
            timestamp: Date.now()
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP API not supported');
      }

      // Observe First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('fid', {
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now()
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('FID API not supported');
      }
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(type, data) {
    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }
    
    const metrics = this.metrics.get(type);
    metrics.push(data);
    
    // Keep only last 100 entries per type
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem(`perf_${type}`, JSON.stringify(metrics.slice(-10)));
    } catch (e) {
      // Handle storage quota exceeded
    }
  }

  /**
   * Check performance thresholds
   */
  checkThresholds(type, value) {
    const threshold = this.thresholds[type];
    if (threshold && value > threshold) {
      console.warn(`Performance threshold exceeded for ${type}: ${value}ms > ${threshold}ms`);
      
      // Record performance issue
      this.recordMetric('performanceIssue', {
        type,
        value,
        threshold,
        timestamp: Date.now()
      });
      
      // Trigger optimization suggestions
      this.suggestOptimizations(type, value);
    }
  }

  /**
   * Suggest optimizations based on performance issues
   */
  suggestOptimizations(type, value) {
    const suggestions = {
      pageLoad: [
        'Consider code splitting to reduce initial bundle size',
        'Implement lazy loading for non-critical components',
        'Optimize images and use modern formats (WebP, AVIF)',
        'Enable compression (gzip/brotli) on server',
        'Use CDN for static assets'
      ],
      apiResponse: [
        'Implement request caching',
        'Use pagination for large datasets',
        'Optimize database queries',
        'Consider using GraphQL for efficient data fetching',
        'Implement request debouncing'
      ],
      renderTime: [
        'Use React.memo for expensive components',
        'Implement virtualization for large lists',
        'Optimize re-renders with useMemo and useCallback',
        'Consider component lazy loading',
        'Profile and optimize expensive calculations'
      ],
      memoryUsage: [
        'Check for memory leaks in event listeners',
        'Implement proper cleanup in useEffect',
        'Optimize large data structures',
        'Use object pooling for frequently created objects',
        'Consider using Web Workers for heavy computations'
      ],
      bundleSize: [
        'Implement code splitting',
        'Remove unused dependencies',
        'Use tree shaking',
        'Optimize imports (import only what you need)',
        'Consider using lighter alternatives for heavy libraries'
      ]
    };

    const typeSuggestions = suggestions[type] || [];
    console.group(`Performance Optimization Suggestions for ${type}`);
    typeSuggestions.forEach(suggestion => console.log(`• ${suggestion}`));
    console.groupEnd();
  }

  /**
   * Get performance metrics
   */
  getMetrics(type = null) {
    if (type) {
      return this.metrics.get(type) || [];
    }
    
    const allMetrics = {};
    this.metrics.forEach((value, key) => {
      allMetrics[key] = value;
    });
    
    return allMetrics;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const summary = {
      pageLoad: this.calculateAverage('pageLoad', 'totalTime'),
      apiResponse: this.calculateAverage('apiResponse', 'duration'),
      renderTime: this.calculateAverage('componentRender', 'duration'),
      memoryUsage: this.getLatestMetric('memoryUsage', 'usedJSHeapSize'),
      bundleSize: this.getLatestMetric('bundleSize', 'totalSize'),
      issues: this.getMetrics('performanceIssue').length,
      timestamp: Date.now()
    };
    
    return summary;
  }

  /**
   * Calculate average for a metric
   */
  calculateAverage(type, field) {
    const metrics = this.getMetrics(type);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + (metric[field] || 0), 0);
    return Math.round(sum / metrics.length);
  }

  /**
   * Get latest metric value
   */
  getLatestMetric(type, field) {
    const metrics = this.getMetrics(type);
    if (metrics.length === 0) return 0;
    
    const latest = metrics[metrics.length - 1];
    return latest[field] || 0;
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics.clear();
    
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('perf_')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    const data = {
      metrics: this.getMetrics(),
      summary: this.getPerformanceSummary(),
      thresholds: this.thresholds,
      timestamp: Date.now()
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Export singleton instance
export default new PerformanceService();
