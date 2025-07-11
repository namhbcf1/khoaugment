/**
 * Performance Optimization Utilities
 * Caching, Rate Limiting, and Performance Monitoring
 * Trường Phát Computer Hòa Bình
 */

/**
 * Cache utility using Cloudflare KV
 */
export class CacheManager {
  constructor(kv) {
    this.kv = kv;
    this.defaultTTL = 3600; // 1 hour
  }

  /**
   * Generate cache key with prefix
   */
  generateKey(prefix, identifier) {
    return `${prefix}:${identifier}`;
  }

  /**
   * Get cached data
   */
  async get(key) {
    try {
      const cached = await this.kv.get(key);
      if (cached) {
        const data = JSON.parse(cached);
        // Check if data has expiry and is still valid
        if (data.expires && Date.now() > data.expires) {
          await this.kv.delete(key);
          return null;
        }
        return data.value;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const data = {
        value,
        expires: Date.now() + (ttl * 1000),
        cached_at: Date.now()
      };
      await this.kv.put(key, JSON.stringify(data), { expirationTtl: ttl });
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cached data
   */
  async delete(key) {
    try {
      await this.kv.delete(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Cache with automatic refresh
   */
  async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
    let cached = await this.get(key);
    
    if (cached === null) {
      try {
        const freshData = await fetchFunction();
        await this.set(key, freshData, ttl);
        return freshData;
      } catch (error) {
        console.error('Cache fetch function error:', error);
        return null;
      }
    }
    
    return cached;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern) {
    try {
      // Note: KV doesn't support pattern deletion, so we track keys
      const keysToDelete = await this.kv.get(`keys:${pattern}`);
      if (keysToDelete) {
        const keys = JSON.parse(keysToDelete);
        await Promise.all(keys.map(key => this.kv.delete(key)));
        await this.kv.delete(`keys:${pattern}`);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  constructor(kv) {
    this.kv = kv;
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(identifier, limit = 100, windowSeconds = 3600) {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);

    try {
      // Get current request count
      const currentData = await this.kv.get(key);
      let requests = [];
      
      if (currentData) {
        const data = JSON.parse(currentData);
        // Filter requests within the current window
        requests = data.requests.filter(timestamp => timestamp > windowStart);
      }

      // Check if limit exceeded
      if (requests.length >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: Math.min(...requests) + (windowSeconds * 1000),
          limit
        };
      }

      // Add current request
      requests.push(now);
      
      // Store updated requests
      await this.kv.put(key, JSON.stringify({
        requests,
        updated_at: now
      }), { expirationTtl: windowSeconds });

      return {
        allowed: true,
        remaining: limit - requests.length,
        resetTime: windowStart + (windowSeconds * 1000),
        limit
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Allow request on error to avoid blocking legitimate traffic
      return { allowed: true, remaining: limit - 1, resetTime: now + (windowSeconds * 1000), limit };
    }
  }

  /**
   * Rate limit middleware
   */
  middleware(limit = 100, windowSeconds = 3600) {
    return async (request, env, ctx) => {
      const identifier = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimiter = new RateLimiter(env.KV);
      
      const result = await rateLimiter.checkLimit(identifier, limit, windowSeconds);
      
      if (!result.allowed) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Rate limit exceeded',
          retry_after: Math.ceil((result.resetTime - Date.now()) / 1000)
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        });
      }

      // Add rate limit headers to response
      const response = await ctx.next();
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());
      
      return response;
    };
  }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  /**
   * Start timing an operation
   */
  startTimer(operation) {
    const startTime = Date.now();
    return {
      operation,
      startTime,
      end: () => {
        const duration = Date.now() - startTime;
        this.recordMetric(operation, duration);
        return duration;
      }
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(operation, duration, metadata = {}) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        avgTime: 0
      });
    }

    const metric = this.metrics.get(operation);
    metric.count++;
    metric.totalTime += duration;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.avgTime = metric.totalTime / metric.count;

    // Log slow operations
    if (duration > 1000) { // > 1 second
      console.warn(`Slow operation detected: ${operation} took ${duration}ms`, metadata);
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const result = {};
    for (const [operation, metric] of this.metrics) {
      result[operation] = { ...metric };
    }
    return result;
  }

  /**
   * Performance monitoring middleware
   */
  middleware() {
    return async (request, env, ctx) => {
      const timer = this.startTimer(`${request.method} ${new URL(request.url).pathname}`);
      
      try {
        const response = await ctx.next();
        const duration = timer.end();
        
        // Add performance headers
        response.headers.set('X-Response-Time', `${duration}ms`);
        
        return response;
      } catch (error) {
        timer.end();
        throw error;
      }
    };
  }
}

/**
 * Database query optimization utilities
 */
export class QueryOptimizer {
  /**
   * Add pagination to query
   */
  static addPagination(query, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return `${query} LIMIT ${limit} OFFSET ${offset}`;
  }

  /**
   * Add search conditions
   */
  static addSearchConditions(baseQuery, searchFields, searchTerm) {
    if (!searchTerm) return baseQuery;
    
    const searchConditions = searchFields
      .map(field => `${field} LIKE ?`)
      .join(' OR ');
    
    return `${baseQuery} AND (${searchConditions})`;
  }

  /**
   * Add sorting
   */
  static addSorting(query, sortBy = 'created_at', sortOrder = 'DESC') {
    const allowedOrders = ['ASC', 'DESC'];
    const order = allowedOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    return `${query} ORDER BY ${sortBy} ${order}`;
  }

  /**
   * Optimize query with indexes hint
   */
  static optimizeQuery(query, indexes = []) {
    // Add index hints for better performance
    if (indexes.length > 0) {
      const indexHints = indexes.map(index => `USE INDEX (${index})`).join(' ');
      return query.replace(/FROM\s+(\w+)/i, `FROM $1 ${indexHints}`);
    }
    return query;
  }
}

/**
 * Response compression utility
 */
export class ResponseCompressor {
  /**
   * Compress response if client supports it
   */
  static async compressResponse(response, request) {
    const acceptEncoding = request.headers.get('Accept-Encoding') || '';
    
    if (acceptEncoding.includes('gzip')) {
      // Note: Cloudflare Workers automatically handle gzip compression
      // This is a placeholder for custom compression logic if needed
      return response;
    }
    
    return response;
  }

  /**
   * Add cache headers
   */
  static addCacheHeaders(response, maxAge = 3600) {
    response.headers.set('Cache-Control', `public, max-age=${maxAge}`);
    response.headers.set('ETag', `"${Date.now()}"`);
    return response;
  }
}

/**
 * Memory usage monitoring
 */
export class MemoryMonitor {
  /**
   * Check memory usage and warn if high
   */
  static checkMemoryUsage() {
    // Note: Cloudflare Workers have memory limits
    // This is a placeholder for memory monitoring logic
    const memoryUsage = {
      used: 0, // Would need actual memory measurement
      limit: 128 * 1024 * 1024, // 128MB typical limit
      percentage: 0
    };
    
    if (memoryUsage.percentage > 80) {
      console.warn('High memory usage detected:', memoryUsage);
    }
    
    return memoryUsage;
  }
}
