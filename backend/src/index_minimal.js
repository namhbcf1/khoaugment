/**
 * Minimal Test Version - KhoChuan POS API
 * No external dependencies to debug hanging issues
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    console.log('Request received:', request.method, path);
    
    try {
      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({
          success: true,
          message: 'API is healthy',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }
      
      // Root endpoint
      if (path === '/') {
        return new Response(JSON.stringify({
          success: true,
          message: 'KhoChuan POS API',
          version: '1.0.0'
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // Test database
      if (path === '/test-db') {
        try {
          const result = await env.DB.prepare('SELECT 1 as test').first();
          return new Response(JSON.stringify({
            success: true,
            message: 'Database connection successful',
            result
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Database connection failed',
            error: error.message
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
      
      // Handle OPTIONS requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }
      
      // 404 for other paths
      return new Response(JSON.stringify({
        success: false,
        message: 'Endpoint not found',
        path: path
      }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      
    } catch (error) {
      console.error('Error handling request:', error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
