/**
 * CORS Headers Utility
 * Provides CORS headers for cross-origin requests
 */

// Allowed origins
const ALLOWED_ORIGINS = [
  'https://khoaugment.pages.dev',
  'https://khochuan-pos.pages.dev',
  'https://khochuan-app.pages.dev',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Client-Version, X-Offline-Operation',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle CORS preflight requests
 * @param {Request} request - The incoming request
 * @returns {Response} - Response with CORS headers or null to continue processing
 */
export function handleCors(request) {
  // Get the origin from the request headers
  const origin = request.headers.get('Origin');
  
  // Create headers with dynamic origin if it's allowed
  const headersToSend = { ...corsHeaders };
  
  if (origin && (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*'))) {
    headersToSend['Access-Control-Allow-Origin'] = origin;
  } else {
    // Default to the first allowed origin if the incoming origin is not allowed
    headersToSend['Access-Control-Allow-Origin'] = ALLOWED_ORIGINS[0];
  }
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: headersToSend
    });
  }
  
  // For other requests, return null to continue processing
  return null;
}

/**
 * Add CORS headers to a response
 * @param {Response} response - The response to add headers to
 * @param {Request} request - The original request
 * @returns {Response} - Response with CORS headers
 */
export function addCorsHeaders(response, request) {
  const headers = new Headers(response.headers);
  
  // Get the origin from the request headers
  const origin = request?.headers?.get('Origin');
  
  // Create headers with dynamic origin if it's allowed
  const headersToSend = { ...corsHeaders };
  
  if (origin && (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*'))) {
    headersToSend['Access-Control-Allow-Origin'] = origin;
  } else {
    // Default to the first allowed origin if the incoming origin is not allowed
    headersToSend['Access-Control-Allow-Origin'] = ALLOWED_ORIGINS[0];
  }
  
  // Add CORS headers
  Object.entries(headersToSend).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // Return new response with CORS headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
} 