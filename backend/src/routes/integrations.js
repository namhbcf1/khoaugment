/**
 * ============================================================================
 * INTEGRATIONS ROUTES
 * ============================================================================
 * Handles third-party integrations and external services
 */

import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

// Mock integration data storage
const integrationStore = new Map();

// Helper function to get integration status
const getIntegrationStatus = (userId) => {
  return integrationStore.get(`status_${userId}`) || {};
};

// Helper function to save integration status
const saveIntegrationStatus = (userId, status) => {
  integrationStore.set(`status_${userId}`, status);
};

/**
 * GET /api/integrations/status
 * Get integration status
 */
router.get('/api/integrations/status', async (request, env, ctx) => {
  try {
    const userId = request.user?.id || 'default';
    const status = getIntegrationStatus(userId);

    return new Response(JSON.stringify({
      success: true,
      data: status
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Get integrations status error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Shopee Integration
router.post('/api/integrations/shopee/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const body = await request.json();
    const { partner_id, partner_key, shop_id, access_token } = body;

    if (!partner_id || !partner_key || !shop_id || !access_token) {
      throw new Error('Missing required Shopee credentials');
    }

    const shopeeConfig = {
      partner_id,
      partner_key,
      shop_id,
      access_token,
      connected: true,
      connected_at: new Date().toISOString(),
      lastSync: null,
      syncCount: 0
    };

    const currentStatus = getIntegrationStatus(userId);
    currentStatus.shopee = shopeeConfig;
    saveIntegrationStatus(userId, currentStatus);

    return new Response(JSON.stringify({
      success: true,
      message: 'Shopee integration connected successfully',
      data: { platform: 'shopee', connected: true }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Shopee Product Sync
router.post('/api/integrations/shopee/sync-products', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const status = getIntegrationStatus(userId);

    if (!status.shopee?.connected) {
      throw new Error('Shopee integration not connected');
    }

    const syncedCount = Math.floor(Math.random() * 50) + 10;

    status.shopee.lastSync = new Date().toISOString();
    status.shopee.syncCount += syncedCount;
    saveIntegrationStatus(userId, status);

    return new Response(JSON.stringify({
      success: true,
      message: 'Products synced successfully',
      count: syncedCount,
      platform: 'shopee'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Shopee Order Sync
router.post('/api/integrations/shopee/sync-orders', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const status = getIntegrationStatus(userId);

    if (!status.shopee?.connected) {
      throw new Error('Shopee integration not connected');
    }

    const syncedCount = Math.floor(Math.random() * 20) + 5;

    status.shopee.lastSync = new Date().toISOString();
    saveIntegrationStatus(userId, status);

    return new Response(JSON.stringify({
      success: true,
      message: 'Orders synced successfully',
      count: syncedCount,
      platform: 'shopee'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Lazada Integration
router.post('/api/integrations/lazada/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const body = await request.json();
    const { app_key, app_secret, access_token, seller_id } = body;

    if (!app_key || !app_secret || !access_token || !seller_id) {
      throw new Error('Missing required Lazada credentials');
    }

    const lazadaConfig = {
      app_key,
      app_secret,
      access_token,
      seller_id,
      connected: true,
      connected_at: new Date().toISOString(),
      lastSync: null,
      syncCount: 0
    };

    const currentStatus = getIntegrationStatus(userId);
    currentStatus.lazada = lazadaConfig;
    saveIntegrationStatus(userId, currentStatus);

    return new Response(JSON.stringify({
      success: true,
      message: 'Lazada integration connected successfully',
      data: { platform: 'lazada', connected: true }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Tiki Integration
router.post('/api/integrations/tiki/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const body = await request.json();
    const { client_id, client_secret, access_token, seller_id } = body;

    if (!client_id || !client_secret || !access_token || !seller_id) {
      throw new Error('Missing required Tiki credentials');
    }

    const tikiConfig = {
      client_id,
      client_secret,
      access_token,
      seller_id,
      connected: true,
      connected_at: new Date().toISOString(),
      lastSync: null,
      syncCount: 0
    };

    const currentStatus = getIntegrationStatus(userId);
    currentStatus.tiki = tikiConfig;
    saveIntegrationStatus(userId, currentStatus);

    return new Response(JSON.stringify({
      success: true,
      message: 'Tiki integration connected successfully',
      data: { platform: 'tiki', connected: true }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Facebook Shop Integration
router.post('/api/integrations/facebook/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const body = await request.json();
    const { page_id, access_token, catalog_id } = body;

    if (!page_id || !access_token || !catalog_id) {
      throw new Error('Missing required Facebook credentials');
    }

    const facebookConfig = {
      page_id,
      access_token,
      catalog_id,
      connected: true,
      connected_at: new Date().toISOString(),
      lastSync: null,
      syncCount: 0
    };

    const currentStatus = getIntegrationStatus(userId);
    currentStatus.facebook = facebookConfig;
    saveIntegrationStatus(userId, currentStatus);

    return new Response(JSON.stringify({
      success: true,
      message: 'Facebook Shop connected successfully',
      data: { platform: 'facebook', connected: true }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Instagram Shop Integration
router.post('/api/integrations/instagram/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const body = await request.json();
    const { business_account_id, access_token, catalog_id } = body;

    if (!business_account_id || !access_token || !catalog_id) {
      throw new Error('Missing required Instagram credentials');
    }

    const instagramConfig = {
      business_account_id,
      access_token,
      catalog_id,
      connected: true,
      connected_at: new Date().toISOString(),
      lastSync: null,
      syncCount: 0
    };

    const currentStatus = getIntegrationStatus(userId);
    currentStatus.instagram = instagramConfig;
    saveIntegrationStatus(userId, currentStatus);

    return new Response(JSON.stringify({
      success: true,
      message: 'Instagram Shop connected successfully',
      data: { platform: 'instagram', connected: true }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Universal Product Sync
router.post('/api/integrations/sync-all-products', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const status = getIntegrationStatus(userId);

    const connectedPlatforms = Object.keys(status).filter(
      platform => status[platform]?.connected
    );

    if (connectedPlatforms.length === 0) {
      throw new Error('No platforms connected');
    }

    let totalSynced = 0;
    const syncResults = [];

    // Mock sync for each connected platform
    for (const platform of connectedPlatforms) {
      const syncedCount = Math.floor(Math.random() * 30) + 10;
      totalSynced += syncedCount;

      status[platform].lastSync = new Date().toISOString();
      status[platform].syncCount += syncedCount;

      syncResults.push({
        platform,
        synced: syncedCount,
        status: 'success'
      });
    }

    saveIntegrationStatus(userId, status);

    return new Response(JSON.stringify({
      success: true,
      message: 'All products synced successfully',
      totalSynced,
      platforms: syncResults
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Universal Order Sync
router.post('/api/integrations/sync-all-orders', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const status = getIntegrationStatus(userId);

    const connectedPlatforms = Object.keys(status).filter(
      platform => status[platform]?.connected
    );

    if (connectedPlatforms.length === 0) {
      throw new Error('No platforms connected');
    }

    let totalSynced = 0;
    const syncResults = [];

    // Mock sync for each connected platform
    for (const platform of connectedPlatforms) {
      const syncedCount = Math.floor(Math.random() * 15) + 5;
      totalSynced += syncedCount;

      status[platform].lastSync = new Date().toISOString();

      syncResults.push({
        platform,
        synced: syncedCount,
        status: 'success'
      });
    }

    saveIntegrationStatus(userId, status);

    return new Response(JSON.stringify({
      success: true,
      message: 'All orders synced successfully',
      totalSynced,
      platforms: syncResults
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Disconnect Platform
router.post('/api/integrations/:platform/disconnect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const platform = request.params.platform;
    const status = getIntegrationStatus(userId);

    if (!status[platform]) {
      throw new Error('Platform not found');
    }

    // Remove platform configuration
    delete status[platform];
    saveIntegrationStatus(userId, status);

    return new Response(JSON.stringify({
      success: true,
      message: `${platform} disconnected successfully`
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Inventory Sync
router.post('/api/integrations/sync-inventory', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const body = await request.json();
    const { product_id, quantity } = body;

    // Mock inventory sync to all connected platforms
    return new Response(JSON.stringify({
      success: true,
      message: 'Inventory synced to all marketplaces',
      product_id,
      quantity,
      synced_platforms: ['shopee', 'lazada', 'tiki']
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Price Sync
router.post('/api/integrations/sync-prices', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const body = await request.json();
    const { product_id, price } = body;

    // Mock price sync to all connected platforms
    return new Response(JSON.stringify({
      success: true,
      message: 'Prices synced to all marketplaces',
      product_id,
      price,
      synced_platforms: ['shopee', 'lazada', 'tiki']
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Hardware Integration Routes

// Get hardware device status
router.get('/api/hardware/status', async (request, env, ctx) => {
  try {
    // Mock hardware status
    const hardwareStatus = {
      thermal_printer: {
        connected: true,
        port: 'COM1',
        lastActivity: new Date().toISOString(),
        sessions: 45,
        errors: 0
      },
      barcode_scanner: {
        connected: true,
        port: 'USB HID',
        lastActivity: new Date().toISOString(),
        sessions: 120,
        errors: 1
      },
      cash_drawer: {
        connected: false,
        port: null,
        lastActivity: null,
        sessions: 0,
        errors: 0
      }
    };

    return new Response(JSON.stringify({
      success: true,
      data: hardwareStatus
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Thermal Printer Routes
router.post('/api/hardware/printer/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const body = await request.json();
    const { type, port, baudRate, paperWidth } = body;

    // Mock printer connection
    return new Response(JSON.stringify({
      success: true,
      message: 'Thermal printer connected successfully',
      data: { type, port, baudRate, paperWidth }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

router.post('/api/hardware/printer/print', requireRole(['admin', 'cashier']), async (request, env, ctx) => {
  try {
    const body = await request.json();

    // Mock print operation
    return new Response(JSON.stringify({
      success: true,
      message: 'Receipt printed successfully',
      printJob: 'PRINT_' + Date.now()
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Barcode Scanner Routes
router.post('/api/hardware/scanner/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const body = await request.json();
    const { type, port, autoScan, scanMode } = body;

    // Mock scanner connection
    return new Response(JSON.stringify({
      success: true,
      message: 'Barcode scanner connected successfully',
      data: { type, port, autoScan, scanMode }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Cash Drawer Routes
router.post('/api/hardware/cashdrawer/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const body = await request.json();
    const { type, port, kickCode } = body;

    // Mock cash drawer connection
    return new Response(JSON.stringify({
      success: true,
      message: 'Cash drawer connected successfully',
      data: { type, port, kickCode }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

router.post('/api/hardware/cashdrawer/open', requireRole(['admin', 'cashier']), async (request, env, ctx) => {
  try {
    // Mock cash drawer open
    return new Response(JSON.stringify({
      success: true,
      message: 'Cash drawer opened successfully',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Payment Terminal Routes
router.post('/api/hardware/payment/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const body = await request.json();
    const { type, port, merchantId, terminalId } = body;

    // Mock payment terminal connection
    return new Response(JSON.stringify({
      success: true,
      message: 'Payment terminal connected successfully',
      data: { type, port, merchantId, terminalId }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

router.post('/api/hardware/payment/process', requireRole(['admin', 'cashier']), async (request, env, ctx) => {
  try {
    const body = await request.json();
    const { amount, transactionType } = body;

    // Mock payment processing
    return new Response(JSON.stringify({
      success: true,
      message: 'Card payment processed successfully',
      transactionId: 'TXN_' + Date.now(),
      amount,
      transactionType
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Customer Display Routes
router.post('/api/hardware/display/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const body = await request.json();
    const { type, port, displaySize } = body;

    // Mock display connection
    return new Response(JSON.stringify({
      success: true,
      message: 'Customer display connected successfully',
      data: { type, port, displaySize }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

router.post('/api/hardware/display/update', requireRole(['admin', 'cashier']), async (request, env, ctx) => {
  try {
    const body = await request.json();
    const { text } = body;

    // Mock display update
    return new Response(JSON.stringify({
      success: true,
      message: 'Display updated successfully',
      text
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Scale Routes
router.post('/api/hardware/scale/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const body = await request.json();
    const { type, port, baudRate, unit } = body;

    // Mock scale connection
    return new Response(JSON.stringify({
      success: true,
      message: 'Scale connected successfully',
      data: { type, port, baudRate, unit }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

router.get('/api/hardware/scale/weight', requireRole(['admin', 'cashier']), async (request, env, ctx) => {
  try {
    // Mock weight reading
    const weight = (Math.random() * 5).toFixed(3);

    return new Response(JSON.stringify({
      success: true,
      weight: parseFloat(weight),
      unit: 'kg',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

// Disconnect Hardware Device
router.post('/api/hardware/:deviceType/disconnect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const deviceType = request.params.deviceType;

    // Mock device disconnection
    return new Response(JSON.stringify({
      success: true,
      message: `${deviceType} disconnected successfully`
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

export default router;