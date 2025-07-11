/**
 * Rate Limiting Middleware
 * Implements basic rate limiting for API endpoints
 */

import { corsHeaders } from '../utils/cors';

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.max - Maximum requests per window (default: 100)
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {string} options.keyPrefix - KV key prefix (default: 'ratelimit:')
 * @returns {Function} - Middleware function
 */
export function rateLimit(options = {}) {
  const {
    max = 100,
    windowMs = 60000,
    keyPrefix = 'ratelimit:'
  } = options;
  
  return async (request, env) => {
    // Skip for OPTIONS requests
    if (request.method === 'OPTIONS') {
      return;
    }
    
    try {
      // Get client IP
      const clientIP = request.headers.get('CF-Connecting-IP') || 
                       request.headers.get('X-Forwarded-For') || 
                       '0.0.0.0';
      
      // Create unique key for this client and endpoint
      const path = new URL(request.url).pathname;
      const key = `${keyPrefix}${clientIP}:${path}`;
      
      // Get current rate limit data
      let rateData = await env.CACHE.get(key, { type: 'json' });
      const now = Date.now();
      
      if (!rateData) {
        // First request in this window
        rateData = {
          count: 1,
          reset: now + windowMs
        };
      } else {
        // Check if window has expired
        if (now > rateData.reset) {
          // Start a new window
          rateData = {
            count: 1,
            reset: now + windowMs
          };
        } else {
          // Increment counter in current window
          rateData.count += 1;
        }
      }
      
      // Store updated rate limit data
      await env.CACHE.put(key, JSON.stringify(rateData), {
        expirationTtl: Math.ceil(windowMs / 1000)
      });
      
      // Check if rate limit exceeded
      if (rateData.count > max) {
        const resetSeconds = Math.ceil((rateData.reset - now) / 1000);
        
        return new Response(JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded. Try again later.'
          }
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(resetSeconds),
            ...corsHeaders
          }
        });
      }
      
      // Continue with the request
      return;
    } catch (error) {
      console.error('Rate limit error:', error);
      // On error, allow the request to continue
      return;
    }
  };
} 