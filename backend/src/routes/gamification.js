/**
 * ============================================================================
 * GAMIFICATION ROUTES
 * ============================================================================
 * Handles gamification features like badges, achievements, and challenges
 */

import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors.js';

const router = Router();

/**
 * GET /api/gamification/badges
 * Get all available badges
 */
router.get('/api/gamification/badges', async (request, env, ctx) => {
  try {
    const badges = await request.db.all('SELECT * FROM badges WHERE is_active = 1 ORDER BY rarity, name');

    return new Response(JSON.stringify({
      success: true,
      data: badges
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Get badges error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch badges',
      code: 'FETCH_ERROR'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

export default router;