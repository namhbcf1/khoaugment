/**
 * Marketplace Integration Service
 * Handles integration with major Vietnamese e-commerce platforms
 */

import { message } from 'antd';

class MarketplaceIntegrationService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://khoaugment-api.bangachieu2.workers.dev';
    this.supportedPlatforms = ['shopee', 'lazada', 'tiki', 'sendo', 'facebook', 'instagram'];
  }

  // Shopee Integration
  async connectShopee(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/shopee/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          partner_id: credentials.partnerId,
          partner_key: credentials.partnerKey,
          shop_id: credentials.shopId,
          access_token: credentials.accessToken
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('Shopee integration connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Shopee connection failed: ${error.message}`);
      throw error;
    }
  }

  async syncShopeeProducts() {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/shopee/sync-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        message.success(`Synced ${result.count} products from Shopee`);
        return result;
      }
    } catch (error) {
      message.error(`Product sync failed: ${error.message}`);
      throw error;
    }
  }

  async syncShopeeOrders() {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/shopee/sync-orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        message.success(`Synced ${result.count} orders from Shopee`);
        return result;
      }
    } catch (error) {
      message.error(`Order sync failed: ${error.message}`);
      throw error;
    }
  }

  // Lazada Integration
  async connectLazada(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/lazada/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          app_key: credentials.appKey,
          app_secret: credentials.appSecret,
          access_token: credentials.accessToken,
          seller_id: credentials.sellerId
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('Lazada integration connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Lazada connection failed: ${error.message}`);
      throw error;
    }
  }

  // Tiki Integration
  async connectTiki(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/tiki/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          access_token: credentials.accessToken,
          seller_id: credentials.sellerId
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('Tiki integration connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Tiki connection failed: ${error.message}`);
      throw error;
    }
  }

  // Universal Product Sync
  async syncAllProducts() {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/sync-all-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        message.success(`Synced products from all connected platforms`);
        return result;
      }
    } catch (error) {
      message.error(`Universal sync failed: ${error.message}`);
      throw error;
    }
  }

  // Universal Order Sync
  async syncAllOrders() {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/sync-all-orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        message.success(`Synced orders from all connected platforms`);
        return result;
      }
    } catch (error) {
      message.error(`Universal order sync failed: ${error.message}`);
      throw error;
    }
  }

  // Inventory Sync
  async syncInventoryToMarketplaces(productId, quantity) {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/sync-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('Inventory synced to all marketplaces');
        return result;
      }
    } catch (error) {
      message.error(`Inventory sync failed: ${error.message}`);
      throw error;
    }
  }

  // Price Sync
  async syncPricesToMarketplaces(productId, price) {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/sync-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          product_id: productId,
          price: price
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('Prices synced to all marketplaces');
        return result;
      }
    } catch (error) {
      message.error(`Price sync failed: ${error.message}`);
      throw error;
    }
  }

  // Get Integration Status
  async getIntegrationStatus() {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      return result.data || {};
    } catch (error) {
      console.error('Failed to get integration status:', error);
      return {};
    }
  }

  // Social Commerce Integration
  async connectFacebookShop(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/facebook/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          page_id: credentials.pageId,
          access_token: credentials.accessToken,
          catalog_id: credentials.catalogId
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('Facebook Shop connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Facebook Shop connection failed: ${error.message}`);
      throw error;
    }
  }

  async connectInstagramShop(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/instagram/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          business_account_id: credentials.businessAccountId,
          access_token: credentials.accessToken,
          catalog_id: credentials.catalogId
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('Instagram Shop connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Instagram Shop connection failed: ${error.message}`);
      throw error;
    }
  }

  // Disconnect Integration
  async disconnectPlatform(platform) {
    try {
      const response = await fetch(`${this.baseURL}/api/integrations/${platform}/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        message.success(`${platform} disconnected successfully`);
        return result;
      }
    } catch (error) {
      message.error(`Failed to disconnect ${platform}: ${error.message}`);
      throw error;
    }
  }
}

export default new MarketplaceIntegrationService();
