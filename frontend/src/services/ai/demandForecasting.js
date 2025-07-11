/**
 * Demand Forecasting AI Service
 * Provides intelligent demand prediction using advanced ML models
 * Running at the edge with Cloudflare AI
 */

import { api } from '../api';
import { localCache } from '../../utils/helpers/cacheUtils';

class DemandForecastingService {
  constructor() {
    this.modelVersion = 'v1.2.3';
    this.confidenceThreshold = 0.85;
    this.forecastHorizon = 30; // days
  }

  /**
   * Get demand forecast for products
   * @param {Object} params - Forecast parameters
   * @param {Array} params.productIds - List of product IDs to forecast
   * @param {Number} params.horizon - Days to forecast (default: 30)
   * @param {Boolean} params.includeFactors - Whether to include influencing factors
   * @param {String} params.locationId - Store location ID
   * @returns {Promise<Object>} - Forecast results
   */
  async getProductDemandForecast({
    productIds,
    horizon = this.forecastHorizon,
    includeFactors = true,
    locationId = 'default'
  }) {
    try {
      // Check cache first
      const cacheKey = `forecast_${locationId}_${productIds.join(',')}_${horizon}`;
      const cachedForecast = localCache.get(cacheKey);
      
      if (cachedForecast) {
        console.log('Using cached forecast');
        return cachedForecast;
      }
      
      // Call AI endpoint
      const response = await api.post('/ai/demand-forecast', {
        productIds,
        horizon,
        includeFactors,
        locationId,
        modelVersion: this.modelVersion
      });
      
      // Process and enhance forecast data
      const enhancedForecast = this._enhanceForecastData(response.data);
      
      // Cache results for 1 hour
      localCache.set(cacheKey, enhancedForecast, 60 * 60);
      
      return enhancedForecast;
    } catch (error) {
      console.error('Error getting demand forecast:', error);
      
      // Fallback to statistical forecasting when AI fails
      return this._generateFallbackForecast(productIds, horizon, locationId);
    }
  }
  
  /**
   * Get category level demand forecast
   * @param {Object} params - Forecast parameters
   * @param {Array} params.categoryIds - List of category IDs
   * @param {Number} params.horizon - Days to forecast
   * @param {String} params.locationId - Store location ID
   * @returns {Promise<Object>} - Category forecast results
   */
  async getCategoryDemandForecast({
    categoryIds,
    horizon = this.forecastHorizon,
    locationId = 'default'
  }) {
    try {
      // Call AI endpoint for category forecast
      const response = await api.post('/ai/category-forecast', {
        categoryIds,
        horizon,
        locationId,
        modelVersion: this.modelVersion
      });
      
      return this._processCategoryForecast(response.data);
    } catch (error) {
      console.error('Error getting category forecast:', error);
      return this._generateFallbackCategoryForecast(categoryIds, horizon);
    }
  }
  
  /**
   * Get seasonal factors affecting demand
   * @param {String} locationId - Store location ID
   * @returns {Promise<Object>} - Seasonal factors
   */
  async getSeasonalFactors(locationId = 'default') {
    try {
      const response = await api.get(`/ai/seasonal-factors?locationId=${locationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting seasonal factors:', error);
      return {
        weather: [],
        events: [],
        holidays: [],
        trends: []
      };
    }
  }
  
  /**
   * Get stock recommendations based on forecasts
   * @param {String} locationId - Store location ID
   * @returns {Promise<Object>} - Restock recommendations
   */
  async getRestockRecommendations(locationId = 'default') {
    try {
      const response = await api.get(`/ai/restock-recommendations?locationId=${locationId}`);
      
      // Enhance with confidence scores
      return response.data.map(item => ({
        ...item,
        confidence: item.confidence || this._calculateConfidence(item),
        urgency: this._calculateUrgency(item),
        estimatedProfit: this._calculateEstimatedProfit(item)
      }));
    } catch (error) {
      console.error('Error getting restock recommendations:', error);
      return [];
    }
  }
  
  /**
   * Get real-time demand anomalies
   * @param {String} locationId - Store location ID
   * @returns {Promise<Array>} - List of detected anomalies
   */
  async getDemandAnomalies(locationId = 'default') {
    try {
      const response = await api.get(`/ai/demand-anomalies?locationId=${locationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting demand anomalies:', error);
      return [];
    }
  }
  
  /**
   * Enhance forecast data with additional insights
   * @param {Object} forecastData - Raw forecast data
   * @returns {Object} - Enhanced forecast data
   * @private
   */
  _enhanceForecastData(forecastData) {
    // Add trend indicators
    const withTrends = forecastData.forecasts.map(product => {
      const values = product.values;
      const trend = this._calculateTrend(values);
      
      return {
        ...product,
        trend,
        confidence: product.confidence || this.confidenceThreshold,
        riskLevel: this._calculateRiskLevel(product),
        potentialRevenue: this._calculatePotentialRevenue(product),
        suggestedAction: this._getSuggestedAction(product, trend)
      };
    });
    
    return {
      ...forecastData,
      forecasts: withTrends,
      generatedAt: new Date().toISOString(),
      nextUpdateAt: new Date(Date.now() + 3600000).toISOString() // +1 hour
    };
  }
  
  /**
   * Calculate trend direction and strength
   * @param {Array} values - Forecast values
   * @returns {Object} - Trend information
   * @private
   */
  _calculateTrend(values) {
    if (!values || values.length < 2) return { direction: 'stable', strength: 0 };
    
    // Simple linear regression
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    values.forEach((y, x) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const strength = Math.abs(slope) / (Math.max(...values) / n);
    
    let direction = 'stable';
    if (slope > 0.05) direction = 'rising';
    else if (slope < -0.05) direction = 'falling';
    
    return {
      direction,
      strength: Math.min(Math.abs(strength), 1),
      slope
    };
  }
  
  /**
   * Calculate risk level based on forecast
   * @param {Object} product - Product forecast
   * @returns {String} - Risk level (low, medium, high)
   * @private
   */
  _calculateRiskLevel(product) {
    const stockoutRisk = product.stockoutProbability || 0;
    const overStockRisk = product.overStockProbability || 0;
    const volatility = product.volatility || 0;
    
    const riskScore = (stockoutRisk * 0.4) + (overStockRisk * 0.3) + (volatility * 0.3);
    
    if (riskScore < 0.3) return 'low';
    if (riskScore < 0.6) return 'medium';
    return 'high';
  }
  
  /**
   * Calculate potential revenue from forecast
   * @param {Object} product - Product forecast
   * @returns {Number} - Potential revenue
   * @private
   */
  _calculatePotentialRevenue(product) {
    const totalDemand = product.values.reduce((sum, v) => sum + v, 0);
    return totalDemand * (product.price || 0);
  }
  
  /**
   * Get suggested action based on forecast
   * @param {Object} product - Product forecast
   * @param {Object} trend - Trend information
   * @returns {String} - Suggested action
   * @private
   */
  _getSuggestedAction(product, trend) {
    if (product.stockoutProbability > 0.7) {
      return 'urgent_restock';
    }
    
    if (trend.direction === 'rising' && trend.strength > 0.5) {
      return 'increase_inventory';
    }
    
    if (trend.direction === 'falling' && trend.strength > 0.5) {
      return 'reduce_inventory';
    }
    
    if (product.overStockProbability > 0.7) {
      return 'consider_promotion';
    }
    
    return 'monitor';
  }
  
  /**
   * Generate fallback forecast when AI is unavailable
   * @param {Array} productIds - Product IDs
   * @param {Number} horizon - Forecast horizon
   * @param {String} locationId - Location ID
   * @returns {Object} - Fallback forecast
   * @private
   */
  async _generateFallbackForecast(productIds, horizon, locationId) {
    // Try to get historical data
    try {
      const history = await api.get(`/products/sales-history?ids=${productIds.join(',')}&locationId=${locationId}`);
      return this._generateStatisticalForecast(history.data, horizon);
    } catch (error) {
      // If even history fails, return empty forecast structure
      return {
        forecasts: productIds.map(id => ({
          productId: id,
          values: Array(horizon).fill(0),
          confidence: 0,
          trend: { direction: 'unknown', strength: 0 },
          riskLevel: 'unknown',
          isFallback: true
        })),
        factors: [],
        generatedAt: new Date().toISOString(),
        isFallback: true
      };
    }
  }
  
  /**
   * Process category forecast data
   * @param {Object} categoryData - Raw category forecast data
   * @returns {Object} - Processed category forecast
   * @private
   */
  _processCategoryForecast(categoryData) {
    // Process and enhance category forecast data
    return {
      ...categoryData,
      categories: categoryData.categories.map(category => ({
        ...category,
        trend: this._calculateTrend(category.values),
        topProducts: (category.topProducts || []).slice(0, 5)
      }))
    };
  }
  
  /**
   * Generate fallback category forecast
   * @param {Array} categoryIds - Category IDs
   * @param {Number} horizon - Forecast horizon
   * @returns {Object} - Fallback category forecast
   * @private
   */
  _generateFallbackCategoryForecast(categoryIds, horizon) {
    return {
      categories: categoryIds.map(id => ({
        categoryId: id,
        values: Array(horizon).fill(0),
        trend: { direction: 'unknown', strength: 0 },
        isFallback: true
      })),
      generatedAt: new Date().toISOString(),
      isFallback: true
    };
  }
  
  /**
   * Generate statistical forecast from historical data
   * @param {Object} history - Historical sales data
   * @param {Number} horizon - Forecast horizon
   * @returns {Object} - Statistical forecast
   * @private
   */
  _generateStatisticalForecast(history, horizon) {
    // Implement simple moving average forecast
    return {
      forecasts: Object.keys(history).map(productId => {
        const productHistory = history[productId] || [];
        const avg = productHistory.length > 0 
          ? productHistory.reduce((sum, val) => sum + val, 0) / productHistory.length
          : 0;
        
        return {
          productId,
          values: Array(horizon).fill(avg),
          confidence: 0.5, // Medium confidence for statistical forecast
          trend: { direction: 'stable', strength: 0 },
          riskLevel: 'medium',
          isFallback: true
        };
      }),
      factors: [],
      generatedAt: new Date().toISOString(),
      isFallback: true
    };
  }
  
  /**
   * Calculate confidence for restock recommendation
   * @param {Object} item - Recommendation item
   * @returns {Number} - Confidence score
   * @private
   */
  _calculateConfidence(item) {
    return Math.min(0.5 + (item.historyLength || 0) / 100, 0.95);
  }
  
  /**
   * Calculate urgency score
   * @param {Object} item - Item data
   * @returns {Number} - Urgency score (0-1)
   * @private
   */
  _calculateUrgency(item) {
    const daysToStockout = item.daysToStockout || 30;
    return Math.max(0, Math.min(1, 1 - (daysToStockout / 30)));
  }
  
  /**
   * Calculate estimated profit for restock
   * @param {Object} item - Item data
   * @returns {Number} - Estimated profit
   * @private
   */
  _calculateEstimatedProfit(item) {
    const margin = item.margin || 0.3;
    const recommendedQty = item.recommendedQuantity || 0;
    const price = item.price || 0;
    
    return recommendedQty * price * margin;
  }
}

export const demandForecasting = new DemandForecastingService();

export default demandForecasting; 