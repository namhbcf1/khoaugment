/**
 * Recommendation Engine Service
 * Provides intelligent product recommendations and personalization
 * Edge-based ML processing for real-time suggestions
 */

import { api } from '../api';
import { localCache } from '../../utils/helpers/cacheUtils';
import { getCurrentUserId } from '../../utils/helpers/authUtils';

class RecommendationEngineService {
  constructor() {
    this.modelVersion = '2.1.4';
    this.defaultCount = 8;
    this.confidenceThreshold = 0.7;
    this.cacheTTL = 15 * 60; // 15 minutes for recommendations
    this.contextualFactors = [
      'time_of_day',
      'day_of_week',
      'weather',
      'recent_purchases',
      'store_inventory'
    ];
  }

  /**
   * Get personalized product recommendations for a customer
   * @param {Object} params - Recommendation parameters
   * @param {String} params.customerId - Customer ID
   * @param {Number} params.count - Number of recommendations to return
   * @param {Array} params.exclude - Product IDs to exclude
   * @param {String} params.context - Context of the recommendation (cart, product, category, homepage)
   * @returns {Promise<Array>} - Recommended products
   */
  async getPersonalizedRecommendations({
    customerId,
    count = this.defaultCount,
    exclude = [],
    context = 'homepage'
  }) {
    try {
      const cacheKey = `rec_personalized_${customerId}_${context}_${count}`;
      const cachedRecs = localCache.get(cacheKey);
      
      if (cachedRecs) {
        return this._filterExcluded(cachedRecs, exclude);
      }
      
      const contextualData = await this._getContextualData(context);
      
      const response = await api.post('/ai/recommendations/personalized', {
        customerId,
        count: count + exclude.length, // Request extra to account for exclusions
        context,
        contextualData,
        modelVersion: this.modelVersion
      });
      
      const enhancedRecs = this._enhanceRecommendations(response.data);
      localCache.set(cacheKey, enhancedRecs, this.cacheTTL);
      
      return this._filterExcluded(enhancedRecs, exclude);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return this._getFallbackRecommendations(count, exclude, context);
    }
  }

  /**
   * Get real-time recommendations based on current cart
   * @param {Object} params - Cart recommendation parameters
   * @param {Array} params.cartItems - Current items in cart
   * @param {String} params.customerId - Customer ID (optional)
   * @param {Number} params.count - Number of recommendations to return
   * @returns {Promise<Array>} - Recommended products for cart
   */
  async getCartRecommendations({
    cartItems,
    customerId = null,
    count = 4
  }) {
    if (!cartItems || cartItems.length === 0) {
      return [];
    }
    
    try {
      const cartItemIds = cartItems.map(item => item.productId);
      const cartSignature = cartItemIds.sort().join(',');
      const cacheKey = `rec_cart_${cartSignature}_${count}_${customerId || 'anon'}`;
      
      const cachedRecs = localCache.get(cacheKey);
      if (cachedRecs) {
        return cachedRecs;
      }
      
      const response = await api.post('/ai/recommendations/cart', {
        cartItems,
        customerId,
        count,
        includeReasons: true,
        modelVersion: this.modelVersion
      });
      
      const enhancedRecs = this._enhanceCartRecommendations(response.data, cartItems);
      localCache.set(cacheKey, enhancedRecs, this.cacheTTL / 3); // Shorter TTL for cart recs
      
      return enhancedRecs;
    } catch (error) {
      console.error('Error getting cart recommendations:', error);
      return this._getFallbackCartRecommendations(cartItems, count);
    }
  }

  /**
   * Get similar products to a given product
   * @param {Object} params - Similar products parameters
   * @param {String} params.productId - Product ID to find similar items for
   * @param {Number} params.count - Number of similar products to return
   * @param {Boolean} params.includeVariants - Whether to include product variants
   * @returns {Promise<Array>} - Similar products
   */
  async getSimilarProducts({
    productId,
    count = 6,
    includeVariants = true
  }) {
    try {
      const cacheKey = `rec_similar_${productId}_${count}_${includeVariants}`;
      const cachedRecs = localCache.get(cacheKey);
      
      if (cachedRecs) {
        return cachedRecs;
      }
      
      const response = await api.get(`/ai/recommendations/similar?productId=${productId}&count=${count}&includeVariants=${includeVariants}`);
      
      const enhancedRecs = this._enhanceSimilarProducts(response.data, productId);
      localCache.set(cacheKey, enhancedRecs, this.cacheTTL);
      
      return enhancedRecs;
    } catch (error) {
      console.error('Error getting similar products:', error);
      return this._getFallbackSimilarProducts(productId, count);
    }
  }

  /**
   * Get trending products for a given category or store
   * @param {Object} params - Trending parameters
   * @param {String} params.categoryId - Category ID (optional)
   * @param {String} params.locationId - Store location ID (optional)
   * @param {Number} params.count - Number of trending products to return
   * @param {String} params.timeframe - Timeframe for trend analysis (day, week, month)
   * @returns {Promise<Array>} - Trending products
   */
  async getTrendingProducts({
    categoryId = null,
    locationId = 'default',
    count = 10,
    timeframe = 'week'
  }) {
    try {
      const cacheKey = `rec_trending_${categoryId || 'all'}_${locationId}_${timeframe}`;
      const cachedTrending = localCache.get(cacheKey);
      
      if (cachedTrending) {
        return cachedTrending;
      }
      
      const endpoint = categoryId 
        ? `/ai/recommendations/trending?categoryId=${categoryId}&locationId=${locationId}&count=${count}&timeframe=${timeframe}`
        : `/ai/recommendations/trending?locationId=${locationId}&count=${count}&timeframe=${timeframe}`;
      
      const response = await api.get(endpoint);
      
      const enhancedTrending = this._enhanceTrendingProducts(response.data);
      localCache.set(cacheKey, enhancedTrending, 60 * 60); // 1 hour for trending
      
      return enhancedTrending;
    } catch (error) {
      console.error('Error getting trending products:', error);
      return this._getFallbackTrendingProducts(count);
    }
  }

  /**
   * Get staff product recommendations to help with sales
   * @param {Object} params - Staff recommendation parameters
   * @param {String} params.customerId - Current customer ID
   * @param {Array} params.customerHistory - Customer purchase history
   * @param {Array} params.currentInteractions - Current customer interactions
   * @param {String} params.staffId - Staff member ID
   * @returns {Promise<Object>} - Staff sales recommendations
   */
  async getStaffSalesRecommendations({
    customerId,
    customerHistory = [],
    currentInteractions = [],
    staffId = getCurrentUserId()
  }) {
    try {
      const response = await api.post('/ai/recommendations/staff', {
        customerId,
        customerHistory,
        currentInteractions,
        staffId,
        includeScripts: true,
        modelVersion: this.modelVersion
      });
      
      return this._enhanceStaffRecommendations(response.data);
    } catch (error) {
      console.error('Error getting staff recommendations:', error);
      return {
        recommendations: [],
        suggestedApproach: 'Ask the customer about their needs and preferences',
        salesScripts: []
      };
    }
  }

  /**
   * Get personalized category recommendations
   * @param {String} customerId - Customer ID
   * @param {Number} count - Number of categories to recommend
   * @returns {Promise<Array>} - Recommended categories
   */
  async getRecommendedCategories(customerId, count = 5) {
    try {
      const response = await api.get(`/ai/recommendations/categories?customerId=${customerId}&count=${count}`);
      return response.data;
    } catch (error) {
      console.error('Error getting recommended categories:', error);
      return [];
    }
  }
  
  /**
   * Enhance recommendations with additional data
   * @param {Array} recommendations - Raw recommendation data
   * @returns {Array} - Enhanced recommendations
   * @private
   */
  _enhanceRecommendations(recommendations) {
    return recommendations.map(rec => ({
      ...rec,
      confidence: rec.confidence || this.confidenceThreshold,
      reasonCode: rec.reasonCode || 'personalized',
      reason: this._getReasonText(rec.reasonCode || 'personalized')
    }));
  }
  
  /**
   * Enhance cart recommendations with additional contextual data
   * @param {Array} recommendations - Raw cart recommendations
   * @param {Array} cartItems - Current cart items
   * @returns {Array} - Enhanced cart recommendations
   * @private
   */
  _enhanceCartRecommendations(recommendations, cartItems) {
    const cartProducts = new Set(cartItems.map(item => item.productId));
    
    return recommendations.map(rec => {
      const enhancedRec = {
        ...rec,
        inCart: cartProducts.has(rec.productId),
        confidence: rec.confidence || 0.8,
      };
      
      if (!enhancedRec.reason && rec.reasonCode) {
        enhancedRec.reason = this._getCartRecommendationReason(rec.reasonCode, cartItems);
      }
      
      return enhancedRec;
    });
  }
  
  /**
   * Enhance similar product recommendations
   * @param {Array} recommendations - Raw similar products
   * @param {String} sourceProductId - Original product ID
   * @returns {Array} - Enhanced similar products
   * @private
   */
  _enhanceSimilarProducts(recommendations, sourceProductId) {
    return recommendations.map(rec => ({
      ...rec,
      similarityScore: rec.similarityScore || 0.7,
      sourceProductId,
      reason: rec.reason || 'Similar specifications and features'
    }));
  }
  
  /**
   * Enhance trending product data
   * @param {Array} trendingProducts - Raw trending products
   * @returns {Array} - Enhanced trending products
   * @private
   */
  _enhanceTrendingProducts(trendingProducts) {
    return trendingProducts.map(product => ({
      ...product,
      trendDirection: product.trendDirection || 'up',
      trendStrength: product.trendStrength || 0.5,
      trendDuration: product.trendDuration || '7 days'
    }));
  }
  
  /**
   * Enhance staff recommendations with conversation starters
   * @param {Object} staffRecs - Raw staff recommendations
   * @returns {Object} - Enhanced staff recommendations
   * @private
   */
  _enhanceStaffRecommendations(staffRecs) {
    return {
      ...staffRecs,
      recommendations: staffRecs.recommendations.map(rec => ({
        ...rec,
        confidenceFactor: rec.confidenceFactor || 0.7,
        saleOpportunity: rec.saleOpportunity || 'medium',
        conversationStarters: rec.conversationStarters || [
          `Have you considered the ${rec.name || 'this product'}?`,
          `Many customers who bought similar items also enjoyed ${rec.name || 'this product'}.`
        ]
      }))
    };
  }
  
  /**
   * Get recommendation reason text from code
   * @param {String} reasonCode - Recommendation reason code
   * @returns {String} - Human-readable reason
   * @private
   */
  _getReasonText(reasonCode) {
    const reasonTexts = {
      'personalized': 'Recommended for you based on your preferences',
      'trending': 'Popular right now',
      'similar_purchases': 'Based on your purchase history',
      'viewed_also_bought': 'Customers who viewed this also bought',
      'bought_also_bought': 'Frequently bought together',
      'seasonal': 'Seasonal recommendation',
      'new_arrival': 'New arrival you might like',
      'flash_sale': 'Limited time offer',
      'high_rated': 'Highly rated by customers',
      'price_drop': 'Recently price dropped'
    };
    
    return reasonTexts[reasonCode] || 'Recommended for you';
  }
  
  /**
   * Get cart-specific recommendation reason
   * @param {String} reasonCode - Recommendation reason code
   * @param {Array} cartItems - Current cart items
   * @returns {String} - Cart-specific reason
   * @private
   */
  _getCartRecommendationReason(reasonCode, cartItems) {
    const mainCartItem = cartItems[0]?.name || 'your selection';
    
    const cartReasons = {
      'complementary': `Great addition to ${mainCartItem}`,
      'frequently_bought_together': `Frequently bought with ${mainCartItem}`,
      'complete_the_set': 'Complete the set',
      'essential_addon': 'Essential add-on',
      'limited_offer': 'Limited time bundle offer',
      'upgrade': 'Recommended upgrade',
      'popular_addon': 'Popular add-on'
    };
    
    return cartReasons[reasonCode] || `Recommended with ${mainCartItem}`;
  }
  
  /**
   * Filter out excluded products from recommendations
   * @param {Array} recommendations - Product recommendations
   * @param {Array} exclude - Product IDs to exclude
   * @returns {Array} - Filtered recommendations
   * @private
   */
  _filterExcluded(recommendations, exclude) {
    if (!exclude || exclude.length === 0) {
      return recommendations;
    }
    
    const excludeSet = new Set(exclude);
    return recommendations.filter(rec => !excludeSet.has(rec.productId));
  }
  
  /**
   * Get contextual data for recommendations
   * @param {String} context - Context of recommendation
   * @returns {Promise<Object>} - Contextual data
   * @private
   */
  async _getContextualData(context) {
    const contextData = {};
    
    // Get time-based factors
    const now = new Date();
    contextData.time_of_day = now.getHours();
    contextData.day_of_week = now.getDay();
    
    // Get location-based factors
    try {
      // This would be replaced with actual weather API call in production
      const weatherData = await Promise.resolve({
        temperature: 28,
        condition: 'sunny',
        isRaining: false,
        season: 'summer'
      });
      
      contextData.weather = weatherData;
    } catch (err) {
      console.error('Error getting weather data:', err);
    }
    
    // Get store inventory status
    try {
      const inventoryStatus = await api.get('/inventory/status/summary');
      contextData.store_inventory = inventoryStatus.data;
    } catch (err) {
      console.error('Error getting inventory status:', err);
    }
    
    return contextData;
  }
  
  /**
   * Get fallback recommendations when AI service fails
   * @param {Number} count - Number of recommendations
   * @param {Array} exclude - Product IDs to exclude
   * @param {String} context - Context of recommendations
   * @returns {Array} - Fallback recommendations
   * @private
   */
  async _getFallbackRecommendations(count, exclude, context) {
    try {
      // Try to get popular products as fallback
      const response = await api.get(`/products/popular?limit=${count + exclude.length}`);
      const products = response.data;
      
      // Filter excluded products
      const filtered = this._filterExcluded(products, exclude);
      
      // Add recommendation metadata
      return filtered.slice(0, count).map(product => ({
        ...product,
        confidence: 0.5,
        reasonCode: 'popular',
        reason: 'Popular product',
        isFallback: true
      }));
    } catch (error) {
      console.error('Error getting fallback recommendations:', error);
      return [];
    }
  }
  
  /**
   * Get fallback cart recommendations
   * @param {Array} cartItems - Current cart items
   * @param {Number} count - Number of recommendations
   * @returns {Array} - Fallback cart recommendations
   * @private
   */
  async _getFallbackCartRecommendations(cartItems, count) {
    if (cartItems.length === 0) return [];
    
    try {
      // Get products from same category as cart items
      const firstItem = cartItems[0];
      const categoryId = firstItem.categoryId;
      
      if (!categoryId) return [];
      
      const response = await api.get(`/products/category/${categoryId}?limit=${count}`);
      const productsInCategory = response.data;
      
      const cartProductIds = cartItems.map(item => item.productId);
      const cartProductSet = new Set(cartProductIds);
      
      // Filter out products already in cart
      const filteredProducts = productsInCategory.filter(
        product => !cartProductSet.has(product.productId)
      );
      
      return filteredProducts.slice(0, count).map(product => ({
        ...product,
        reason: `Goes well with ${firstItem.name || 'your selection'}`,
        confidence: 0.4,
        isFallback: true
      }));
    } catch (error) {
      console.error('Error getting fallback cart recommendations:', error);
      return [];
    }
  }
  
  /**
   * Get fallback similar products
   * @param {String} productId - Product ID
   * @param {Number} count - Number of similar products
   * @returns {Array} - Fallback similar products
   * @private
   */
  async _getFallbackSimilarProducts(productId, count) {
    try {
      // Get product details first
      const productResponse = await api.get(`/products/${productId}`);
      const product = productResponse.data;
      
      if (!product || !product.categoryId) return [];
      
      // Get other products from same category
      const categoryResponse = await api.get(`/products/category/${product.categoryId}?limit=${count + 1}`);
      let categoryProducts = categoryResponse.data;
      
      // Remove the original product
      categoryProducts = categoryProducts.filter(p => p.productId !== productId);
      
      return categoryProducts.slice(0, count).map(p => ({
        ...p,
        similarityScore: 0.5,
        reason: 'Similar category',
        sourceProductId: productId,
        isFallback: true
      }));
    } catch (error) {
      console.error('Error getting fallback similar products:', error);
      return [];
    }
  }
  
  /**
   * Get fallback trending products
   * @param {Number} count - Number of trending products
   * @returns {Array} - Fallback trending products
   * @private
   */
  async _getFallbackTrendingProducts(count) {
    try {
      const response = await api.get(`/products?sort=popularity&limit=${count}`);
      return response.data.map(product => ({
        ...product,
        trendDirection: 'up',
        trendStrength: 0.5,
        trendDuration: '7 days',
        isFallback: true
      }));
    } catch (error) {
      console.error('Error getting fallback trending products:', error);
      return [];
    }
  }
}

export const recommendationEngine = new RecommendationEngineService();

export default recommendationEngine; 