/**
 * Validation Middleware
 * Provides schema validation for request bodies
 */

import { corsHeaders } from '../utils/cors';

/**
 * Validate request body against a schema
 * @param {Object} schema - Schema object with validate method
 * @returns {Function} - Middleware function
 */
export function validateBody(schema) {
  return async (request) => {
    try {
      // Skip for OPTIONS requests
      if (request.method === 'OPTIONS') {
        return;
      }
      
      // Only validate POST, PUT, PATCH requests
      if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
        return;
      }
      
      // Parse request body
      const contentType = request.headers.get('Content-Type') || '';
      let body;
      
      if (contentType.includes('application/json')) {
        body = await request.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        body = Object.fromEntries(formData);
      } else {
        // Unsupported content type
        return new Response(JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: 'Unsupported content type. Use application/json or application/x-www-form-urlencoded'
          }
        }), {
          status: 415,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Validate body against schema
      const { error, value } = schema.validate(body);
      
      if (error) {
        // Return validation error
        return new Response(JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message
            }))
          }
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Replace request body with validated and sanitized data
      request.validatedBody = value;
      
      // Continue with the request
      return;
    } catch (error) {
      console.error('Validation error:', error);
      
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid request body'
        }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  };
} 