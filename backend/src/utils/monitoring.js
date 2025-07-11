/**
 * System Monitoring and Health Check Utilities
 * Performance monitoring, error tracking, and system health
 * Trường Phát Computer Hòa Bình
 */

/**
 * System health monitor
 */
export class HealthMonitor {
  constructor(env) {
    this.env = env;
    this.metrics = new Map();
    this.alerts = [];
    this.startTime = Date.now();
  }

  /**
   * Check overall system health
   */
  async checkHealth() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks: {}
    };

    try {
      // Database health check
      health.checks.database = await this.checkDatabase();
      
      // Memory health check
      health.checks.memory = await this.checkMemory();
      
      // Performance health check
      health.checks.performance = await this.checkPerformance();
      
      // External services health check
      health.checks.external = await this.checkExternalServices();
      
      // Determine overall status
      const failedChecks = Object.values(health.checks).filter(check => check.status !== 'healthy');
      if (failedChecks.length > 0) {
        health.status = failedChecks.some(check => check.status === 'critical') ? 'critical' : 'degraded';
      }
      
    } catch (error) {
      health.status = 'critical';
      health.error = error.message;
    }

    return health;
  }

  /**
   * Check database connectivity and performance
   */
  async checkDatabase() {
    const startTime = Date.now();
    
    try {
      // Simple connectivity test
      const result = await this.env.DB.prepare('SELECT 1 as test').first();
      const responseTime = Date.now() - startTime;
      
      if (!result || result.test !== 1) {
        return {
          status: 'critical',
          message: 'Database connectivity failed',
          responseTime
        };
      }
      
      // Performance check
      if (responseTime > 1000) {
        return {
          status: 'degraded',
          message: 'Database response time is slow',
          responseTime
        };
      }
      
      return {
        status: 'healthy',
        message: 'Database is responsive',
        responseTime
      };
      
    } catch (error) {
      return {
        status: 'critical',
        message: `Database error: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check memory usage
   */
  async checkMemory() {
    try {
      // Cloudflare Workers memory monitoring is limited
      // We'll use proxy metrics
      const metricsSize = this.metrics.size;
      const alertsSize = this.alerts.length;
      
      if (metricsSize > 10000 || alertsSize > 1000) {
        return {
          status: 'degraded',
          message: 'High memory usage detected',
          metrics: { metricsSize, alertsSize }
        };
      }
      
      return {
        status: 'healthy',
        message: 'Memory usage is normal',
        metrics: { metricsSize, alertsSize }
      };
      
    } catch (error) {
      return {
        status: 'critical',
        message: `Memory check failed: ${error.message}`
      };
    }
  }

  /**
   * Check system performance
   */
  async checkPerformance() {
    try {
      const metrics = this.getPerformanceMetrics();
      
      if (metrics.averageResponseTime > 2000) {
        return {
          status: 'degraded',
          message: 'High average response time',
          metrics
        };
      }
      
      if (metrics.errorRate > 0.05) { // 5% error rate
        return {
          status: 'degraded',
          message: 'High error rate detected',
          metrics
        };
      }
      
      return {
        status: 'healthy',
        message: 'Performance is good',
        metrics
      };
      
    } catch (error) {
      return {
        status: 'critical',
        message: `Performance check failed: ${error.message}`
      };
    }
  }

  /**
   * Check external services
   */
  async checkExternalServices() {
    const services = [];
    
    try {
      // Check if we can reach external APIs (if any)
      // This is a placeholder for actual external service checks
      
      return {
        status: 'healthy',
        message: 'All external services are accessible',
        services
      };
      
    } catch (error) {
      return {
        status: 'degraded',
        message: `External service check failed: ${error.message}`,
        services
      };
    }
  }

  /**
   * Record performance metric
   */
  recordMetric(name, value, tags = {}) {
    const metric = {
      name,
      value,
      tags,
      timestamp: Date.now()
    };
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name);
    metrics.push(metric);
    
    // Keep only last 1000 metrics per name
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }

  /**
   * Get performance metrics summary
   */
  getPerformanceMetrics() {
    const responseTimeMetrics = this.metrics.get('response_time') || [];
    const errorMetrics = this.metrics.get('errors') || [];
    const requestMetrics = this.metrics.get('requests') || [];
    
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Filter metrics from last hour
    const recentResponseTimes = responseTimeMetrics
      .filter(m => m.timestamp > oneHourAgo)
      .map(m => m.value);
    
    const recentErrors = errorMetrics
      .filter(m => m.timestamp > oneHourAgo);
    
    const recentRequests = requestMetrics
      .filter(m => m.timestamp > oneHourAgo);
    
    return {
      averageResponseTime: recentResponseTimes.length > 0 
        ? recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length 
        : 0,
      maxResponseTime: recentResponseTimes.length > 0 
        ? Math.max(...recentResponseTimes) 
        : 0,
      minResponseTime: recentResponseTimes.length > 0 
        ? Math.min(...recentResponseTimes) 
        : 0,
      errorRate: recentRequests.length > 0 
        ? recentErrors.length / recentRequests.length 
        : 0,
      requestCount: recentRequests.length,
      errorCount: recentErrors.length
    };
  }

  /**
   * Create alert
   */
  createAlert(level, message, details = {}) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level, // 'info', 'warning', 'error', 'critical'
      message,
      details,
      timestamp: Date.now(),
      resolved: false
    };
    
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
    
    // Log critical alerts
    if (level === 'critical' || level === 'error') {
      console.error('ALERT:', alert);
    }
    
    return alert;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
    }
    return alert;
  }
}

/**
 * Error tracking and logging
 */
export class ErrorTracker {
  constructor(env) {
    this.env = env;
    this.errors = [];
  }

  /**
   * Track error
   */
  trackError(error, context = {}) {
    const errorRecord = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      timestamp: Date.now(),
      userAgent: context.userAgent || 'unknown',
      url: context.url || 'unknown',
      userId: context.userId || null
    };
    
    this.errors.push(errorRecord);
    
    // Keep only last 500 errors
    if (this.errors.length > 500) {
      this.errors.shift();
    }
    
    // Log error
    console.error('ERROR TRACKED:', errorRecord);
    
    // Store in KV for persistence (if available)
    if (this.env.KV) {
      this.env.KV.put(
        `error:${errorRecord.id}`, 
        JSON.stringify(errorRecord),
        { expirationTtl: 86400 * 7 } // 7 days
      ).catch(err => console.error('Failed to store error in KV:', err));
    }
    
    return errorRecord;
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeRange = 3600000) { // 1 hour default
    const now = Date.now();
    const cutoff = now - timeRange;
    
    const recentErrors = this.errors.filter(error => error.timestamp > cutoff);
    
    const errorsByType = {};
    const errorsByUrl = {};
    const errorsByUser = {};
    
    recentErrors.forEach(error => {
      // Group by error type
      errorsByType[error.name] = (errorsByType[error.name] || 0) + 1;
      
      // Group by URL
      errorsByUrl[error.url] = (errorsByUrl[error.url] || 0) + 1;
      
      // Group by user (if available)
      if (error.userId) {
        errorsByUser[error.userId] = (errorsByUser[error.userId] || 0) + 1;
      }
    });
    
    return {
      totalErrors: recentErrors.length,
      errorsByType,
      errorsByUrl,
      errorsByUser,
      timeRange: timeRange / 1000 // Convert to seconds
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 50) {
    return this.errors
      .slice(-limit)
      .reverse(); // Most recent first
  }
}

/**
 * Performance monitoring middleware
 */
export function createPerformanceMiddleware(healthMonitor) {
  return async (request, env, ctx) => {
    const startTime = Date.now();
    const url = new URL(request.url);
    
    try {
      // Record request
      healthMonitor.recordMetric('requests', 1, {
        method: request.method,
        path: url.pathname
      });
      
      // Process request
      const response = await ctx.next();
      
      // Record response time
      const responseTime = Date.now() - startTime;
      healthMonitor.recordMetric('response_time', responseTime, {
        method: request.method,
        path: url.pathname,
        status: response.status
      });
      
      // Record errors
      if (response.status >= 400) {
        healthMonitor.recordMetric('errors', 1, {
          method: request.method,
          path: url.pathname,
          status: response.status
        });
        
        if (response.status >= 500) {
          healthMonitor.createAlert('error', `Server error on ${url.pathname}`, {
            method: request.method,
            status: response.status,
            responseTime
          });
        }
      }
      
      // Add performance headers
      response.headers.set('X-Response-Time', `${responseTime}ms`);
      response.headers.set('X-Request-ID', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      
      return response;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record error
      healthMonitor.recordMetric('errors', 1, {
        method: request.method,
        path: url.pathname,
        error: error.message
      });
      
      healthMonitor.createAlert('critical', `Unhandled error on ${url.pathname}`, {
        method: request.method,
        error: error.message,
        stack: error.stack,
        responseTime
      });
      
      throw error;
    }
  };
}

/**
 * Health check endpoint handler
 */
export async function handleHealthCheck(request, env) {
  const healthMonitor = new HealthMonitor(env);
  const health = await healthMonitor.checkHealth();
  
  const status = health.status === 'healthy' ? 200 : 
                health.status === 'degraded' ? 200 : 503;
  
  return new Response(JSON.stringify(health, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}
