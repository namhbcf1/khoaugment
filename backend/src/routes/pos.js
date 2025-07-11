/**
 * ============================================================================
 * POS ROUTES
 * ============================================================================
 * Handles Point of Sale specific operations
 */

import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors.js';

const router = Router();

/**
 * GET /api/pos/session
 * Get current POS session info
 */
router.get('/api/pos/session', async (request, env, ctx) => {
  try {
    const user = request.user;

    // Get user stats
    const stats = await request.db.getStaffStats(user.id);

    // Get today's sales for this user
    const todayStats = await request.db.getSalesStats('today', user.id);

    return new Response(JSON.stringify({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        },
        stats,
        todayStats
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Get POS session error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch POS session',
      code: 'FETCH_ERROR'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

export default router;