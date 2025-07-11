/**
 * Error Handler Middleware
 * Provides consistent error responses for the API
 */

import { corsHeaders } from '../utils/cors';

/**
 * Handle errors in a consistent way across the API
 * @param {Error} error - The error to handle
 * @returns {Response} - Error response
 */
export function handleError(error) {
  console.error('API Error:', error);
  
  // Default error details
  let status = 500;
  let message = 'Internal server error';
  let code = 'SERVER_ERROR';
  let details = null;
  
  // Handle known error types
  if (error.name === 'ValidationError') {
    status = 400;
    message = error.message || 'Validation error';
    code = 'VALIDATION_ERROR';
    details = error.details;
  } else if (error.name === 'AuthError') {
    status = 401;
    message = error.message || 'Authentication error';
    code = 'AUTH_ERROR';
  } else if (error.name === 'ForbiddenError') {
    status = 403;
    message = error.message || 'Permission denied';
    code = 'FORBIDDEN';
  } else if (error.name === 'NotFoundError') {
    status = 404;
    message = error.message || 'Resource not found';
    code = 'NOT_FOUND';
  }
  
  // Create error response
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
        details: details || undefined
      }
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

// Alias for compatibility
export const errorHandler = handleError;