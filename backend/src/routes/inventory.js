/**
 * ============================================================================
 * INVENTORY ROUTES
 * ============================================================================
 * Handles inventory management and stock tracking
 */

import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/inventory/logs
 * Get inventory change logs
 */
router.get('/api/inventory/logs', async (request, env, ctx) => {
  try {
    const url = new URL(request.url);
    const filters = {
      product_id: url.searchParams.get('product_id'),
      user_id: url.searchParams.get('user_id'),
      type: url.searchParams.get('type'),
      page: parseInt(url.searchParams.get('page')) || 1,
      limit: parseInt(url.searchParams.get('limit')) || 20
    };

    const logs = await request.db.getInventoryLogs(filters);

    return new Response(JSON.stringify({
      success: true,
      data: logs
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Get inventory logs error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch inventory logs',
      code: 'FETCH_ERROR'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

export default router;