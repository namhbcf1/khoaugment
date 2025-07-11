/**
 * Payment Gateway API Routes
 * Handles payment processing and gateway integrations
 */

import { Router } from 'itty-router';
import { corsHeaders } from '../utils/cors.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

// Mock payment data storage
const paymentStore = new Map();

// Helper function to get payment gateway status
const getPaymentGatewayStatus = (userId) => {
  return paymentStore.get(`gateways_${userId}`) || {};
};

// Helper function to save payment gateway status
const savePaymentGatewayStatus = (userId, status) => {
  paymentStore.set(`gateways_${userId}`, status);
};

// Get payment gateway status
router.get('/api/payments/status', async (request, env, ctx) => {
  try {
    const userId = request.user?.id || 'default';
    const status = getPaymentGatewayStatus(userId);
    
    return new Response(JSON.stringify({
      success: true,
      data: status
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

// VNPay Integration
router.post('/api/payments/vnpay/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const body = await request.json();
    const { merchant_id, secret_key, api_url, return_url, notify_url } = body;

    if (!merchant_id || !secret_key || !api_url) {
      throw new Error('Missing required VNPay credentials');
    }

    const vnpayConfig = {
      merchant_id,
      secret_key,
      api_url,
      return_url,
      notify_url,
      connected: true,
      connected_at: new Date().toISOString(),
      lastTransaction: null,
      transactionCount: 0
    };

    const currentStatus = getPaymentGatewayStatus(userId);
    currentStatus.vnpay = vnpayConfig;
    savePaymentGatewayStatus(userId, currentStatus);

    return new Response(JSON.stringify({
      success: true,
      message: 'VNPay integration connected successfully',
      data: { gateway: 'vnpay', connected: true }
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

// VNPay Payment Processing
router.post('/api/payments/vnpay/process', requireRole(['admin', 'cashier']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const body = await request.json();
    const { amount, order_id, order_info } = body;

    const status = getPaymentGatewayStatus(userId);
    if (!status.vnpay?.connected) {
      throw new Error('VNPay integration not connected');
    }

    // Mock payment processing
    const transactionId = 'VNP_' + Date.now();
    const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=${transactionId}`;

    // Update transaction count
    status.vnpay.lastTransaction = new Date().toISOString();
    status.vnpay.transactionCount += 1;
    savePaymentGatewayStatus(userId, status);

    return new Response(JSON.stringify({
      success: true,
      transaction_id: transactionId,
      payment_url: paymentUrl,
      amount,
      order_id
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

// MoMo Integration
router.post('/api/payments/momo/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const body = await request.json();
    const { partner_code, access_key, secret_key, endpoint, return_url, notify_url } = body;

    if (!partner_code || !access_key || !secret_key) {
      throw new Error('Missing required MoMo credentials');
    }

    const momoConfig = {
      partner_code,
      access_key,
      secret_key,
      endpoint,
      return_url,
      notify_url,
      connected: true,
      connected_at: new Date().toISOString(),
      lastTransaction: null,
      transactionCount: 0
    };

    const currentStatus = getPaymentGatewayStatus(userId);
    currentStatus.momo = momoConfig;
    savePaymentGatewayStatus(userId, currentStatus);

    return new Response(JSON.stringify({
      success: true,
      message: 'MoMo integration connected successfully',
      data: { gateway: 'momo', connected: true }
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

// MoMo Payment Processing
router.post('/api/payments/momo/process', requireRole(['admin', 'cashier']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const body = await request.json();
    const { amount, order_id, order_info } = body;

    const status = getPaymentGatewayStatus(userId);
    if (!status.momo?.connected) {
      throw new Error('MoMo integration not connected');
    }

    // Mock payment processing
    const transactionId = 'MOMO_' + Date.now();
    const paymentUrl = `https://test-payment.momo.vn/pay/${transactionId}`;

    // Update transaction count
    status.momo.lastTransaction = new Date().toISOString();
    status.momo.transactionCount += 1;
    savePaymentGatewayStatus(userId, status);

    return new Response(JSON.stringify({
      success: true,
      transaction_id: transactionId,
      payment_url: paymentUrl,
      amount,
      order_id
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

// ZaloPay Integration
router.post('/api/payments/zalopay/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const body = await request.json();
    const { app_id, key1, key2, endpoint, callback_url } = body;

    if (!app_id || !key1 || !key2) {
      throw new Error('Missing required ZaloPay credentials');
    }

    const zalopayConfig = {
      app_id,
      key1,
      key2,
      endpoint,
      callback_url,
      connected: true,
      connected_at: new Date().toISOString(),
      lastTransaction: null,
      transactionCount: 0
    };

    const currentStatus = getPaymentGatewayStatus(userId);
    currentStatus.zalopay = zalopayConfig;
    savePaymentGatewayStatus(userId, currentStatus);

    return new Response(JSON.stringify({
      success: true,
      message: 'ZaloPay integration connected successfully',
      data: { gateway: 'zalopay', connected: true }
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

// Stripe Integration
router.post('/api/payments/stripe/connect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const body = await request.json();
    const { publishable_key, secret_key, webhook_secret, account_id } = body;

    if (!publishable_key || !secret_key) {
      throw new Error('Missing required Stripe credentials');
    }

    const stripeConfig = {
      publishable_key,
      secret_key,
      webhook_secret,
      account_id,
      connected: true,
      connected_at: new Date().toISOString(),
      lastTransaction: null,
      transactionCount: 0
    };

    const currentStatus = getPaymentGatewayStatus(userId);
    currentStatus.stripe = stripeConfig;
    savePaymentGatewayStatus(userId, currentStatus);

    return new Response(JSON.stringify({
      success: true,
      message: 'Stripe integration connected successfully',
      data: { gateway: 'stripe', connected: true }
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

// Stripe Payment Processing
router.post('/api/payments/stripe/process', requireRole(['admin', 'cashier']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const body = await request.json();
    const { amount, currency, payment_method_id } = body;

    const status = getPaymentGatewayStatus(userId);
    if (!status.stripe?.connected) {
      throw new Error('Stripe integration not connected');
    }

    // Mock payment processing
    const transactionId = 'pi_' + Date.now();

    // Update transaction count
    status.stripe.lastTransaction = new Date().toISOString();
    status.stripe.transactionCount += 1;
    savePaymentGatewayStatus(userId, status);

    return new Response(JSON.stringify({
      success: true,
      transaction_id: transactionId,
      status: 'succeeded',
      amount,
      currency
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

// Payment Verification
router.get('/api/payments/:gateway/verify/:transactionId', async (request, env, ctx) => {
  try {
    const { gateway, transactionId } = request.params;

    // Mock verification
    return new Response(JSON.stringify({
      success: true,
      transaction_id: transactionId,
      status: 'verified',
      gateway,
      verified_at: new Date().toISOString()
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

// Payment Analytics
router.get('/api/payments/analytics', async (request, env, ctx) => {
  try {
    // Mock analytics data
    const analytics = {
      total_transactions: 1250,
      total_amount: 125000000,
      success_rate: 98.5,
      gateway_breakdown: {
        vnpay: { transactions: 450, amount: 45000000, success_rate: 99.1 },
        momo: { transactions: 380, amount: 38000000, success_rate: 98.7 },
        stripe: { transactions: 250, amount: 25000000, success_rate: 97.8 },
        zalopay: { transactions: 170, amount: 17000000, success_rate: 98.2 }
      },
      daily_stats: [
        { date: '2025-07-01', transactions: 45, amount: 4500000 },
        { date: '2025-07-02', transactions: 52, amount: 5200000 },
        { date: '2025-07-03', transactions: 48, amount: 4800000 },
        { date: '2025-07-04', transactions: 61, amount: 6100000 },
        { date: '2025-07-05', transactions: 55, amount: 5500000 }
      ]
    };

    return new Response(JSON.stringify({
      success: true,
      data: analytics
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

// Disconnect Payment Gateway
router.post('/api/payments/:gateway/disconnect', requireRole(['admin']), async (request, env, ctx) => {
  try {
    const userId = request.user.id;
    const gateway = request.params.gateway;
    const status = getPaymentGatewayStatus(userId);
    
    if (!status[gateway]) {
      throw new Error('Payment gateway not found');
    }

    // Remove gateway configuration
    delete status[gateway];
    savePaymentGatewayStatus(userId, status);

    return new Response(JSON.stringify({
      success: true,
      message: `${gateway} payment gateway disconnected successfully`
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
