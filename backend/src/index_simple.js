/**
 * Simple Test Version - KhoChuan POS API
 * Debugging version to identify hanging issues
 */

import { Router } from 'itty-router';

const router = Router();

// Simple health check
router.get('/health', async (request, env) => {
  return new Response(JSON.stringify({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

// Simple root endpoint
router.get('/', async (request, env) => {
  return new Response(JSON.stringify({
    success: true,
    message: 'KhoChuan POS API',
    version: '1.0.0'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

// Test database connection
router.get('/test-db', async (request, env) => {
  try {
    const result = await env.DB.prepare('SELECT 1 as test').first();
    return new Response(JSON.stringify({
      success: true,
      message: 'Database connection successful',
      result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Database connection failed',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Catch all
router.all('*', () => {
  return new Response(JSON.stringify({
    success: false,
    message: 'Endpoint not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
});

export default {
  fetch: router.handle
};
