/**
 * ============================================================================
 * REPORTS ROUTES
 * ============================================================================
 * Handles business reports and data exports
 */

import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/reports/sales
 * Generate sales report
 */
router.get('/api/reports/sales', async (request, env, ctx) => {
  try {
    const url = new URL(request.url);
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');
    const format = url.searchParams.get('format') || 'json';

    if (!dateFrom || !dateTo) {
      return new Response(JSON.stringify({
        error: 'Date range is required',
        code: 'MISSING_DATE_RANGE'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Get sales data
    const salesData = await request.db.all(`
      SELECT
        DATE(o.created_at) as sale_date,
        COUNT(*) as total_orders,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as avg_order_value,
        COUNT(DISTINCT o.customer_id) as unique_customers
      FROM orders o
      WHERE DATE(o.created_at) BETWEEN ? AND ?
        AND o.order_status = 'completed'
      GROUP BY DATE(o.created_at)
      ORDER BY sale_date
    `, [dateFrom, dateTo]);

    return new Response(JSON.stringify({
      success: true,
      data: salesData,
      period: { from: dateFrom, to: dateTo },
      format
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Generate sales report error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate sales report',
      code: 'REPORT_ERROR'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

export default router;