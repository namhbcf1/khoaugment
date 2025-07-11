/**
 * Advanced Payment Gateway Service
 * Handles integration with Vietnamese and international payment providers
 */

import { message } from 'antd';

class PaymentGatewayService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://khoaugment-api.bangachieu2.workers.dev';
    this.supportedGateways = [
      'vnpay', 'momo', 'zalopay', 'stripe', 'paypal', 
      'vietcombank', 'techcombank', 'bidv', 'acb'
    ];
  }

  // VNPay Integration
  async connectVNPay(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/vnpay/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          merchant_id: credentials.merchantId,
          secret_key: credentials.secretKey,
          api_url: credentials.apiUrl,
          return_url: credentials.returnUrl,
          notify_url: credentials.notifyUrl
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('VNPay integration connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`VNPay connection failed: ${error.message}`);
      throw error;
    }
  }

  async processVNPayPayment(paymentData) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/vnpay/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`VNPay payment failed: ${error.message}`);
      throw error;
    }
  }

  // MoMo Integration
  async connectMoMo(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/momo/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          partner_code: credentials.partnerCode,
          access_key: credentials.accessKey,
          secret_key: credentials.secretKey,
          endpoint: credentials.endpoint,
          return_url: credentials.returnUrl,
          notify_url: credentials.notifyUrl
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('MoMo integration connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`MoMo connection failed: ${error.message}`);
      throw error;
    }
  }

  async processMoMoPayment(paymentData) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/momo/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`MoMo payment failed: ${error.message}`);
      throw error;
    }
  }

  // ZaloPay Integration
  async connectZaloPay(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/zalopay/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          app_id: credentials.appId,
          key1: credentials.key1,
          key2: credentials.key2,
          endpoint: credentials.endpoint,
          callback_url: credentials.callbackUrl
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('ZaloPay integration connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`ZaloPay connection failed: ${error.message}`);
      throw error;
    }
  }

  // Stripe Integration
  async connectStripe(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/stripe/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          publishable_key: credentials.publishableKey,
          secret_key: credentials.secretKey,
          webhook_secret: credentials.webhookSecret,
          account_id: credentials.accountId
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('Stripe integration connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Stripe connection failed: ${error.message}`);
      throw error;
    }
  }

  async processStripePayment(paymentData) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/stripe/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Stripe payment failed: ${error.message}`);
      throw error;
    }
  }

  // Banking Integration
  async connectBank(bankCode, credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/banking/${bankCode}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();
      if (result.success) {
        message.success(`${bankCode.toUpperCase()} banking integration connected successfully!`);
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`${bankCode.toUpperCase()} connection failed: ${error.message}`);
      throw error;
    }
  }

  // Payment Processing
  async processPayment(gateway, paymentData) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/${gateway}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      if (result.success) {
        message.success('Payment processed successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Payment processing failed: ${error.message}`);
      throw error;
    }
  }

  // Payment Verification
  async verifyPayment(gateway, transactionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/${gateway}/verify/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      message.error(`Payment verification failed: ${error.message}`);
      throw error;
    }
  }

  // Refund Processing
  async processRefund(gateway, refundData) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/${gateway}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(refundData)
      });

      const result = await response.json();
      if (result.success) {
        message.success('Refund processed successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Refund processing failed: ${error.message}`);
      throw error;
    }
  }

  // Get Payment Gateway Status
  async getGatewayStatus() {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      return result.data || {};
    } catch (error) {
      console.error('Failed to get payment gateway status:', error);
      return {};
    }
  }

  // Get Payment Analytics
  async getPaymentAnalytics(dateRange) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/analytics?${new URLSearchParams(dateRange)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      return result.data || {};
    } catch (error) {
      console.error('Failed to get payment analytics:', error);
      return {};
    }
  }

  // Banking Reconciliation
  async performBankingReconciliation(bankCode, dateRange) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/banking/${bankCode}/reconcile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dateRange)
      });

      const result = await response.json();
      if (result.success) {
        message.success('Banking reconciliation completed successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Banking reconciliation failed: ${error.message}`);
      throw error;
    }
  }

  // Disconnect Gateway
  async disconnectGateway(gateway) {
    try {
      const response = await fetch(`${this.baseURL}/api/payments/${gateway}/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        message.success(`${gateway} disconnected successfully`);
        return result;
      }
    } catch (error) {
      message.error(`Failed to disconnect ${gateway}: ${error.message}`);
      throw error;
    }
  }
}

export default new PaymentGatewayService();
