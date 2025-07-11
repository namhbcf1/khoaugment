/**
 * Price Optimization AI Service
 * Provides intelligent price recommendations and elasticity analysis
 * Running at the Edge with Cloudflare AI Workers
 */

import { api } from '../api';
import { localCache } from '../../utils/helpers/cacheUtils';

class PriceOptimizationService {
  constructor() {
    this.modelVersion = '1.3.2';
    this.confidenceThreshold = 0.75;
    this.pricingStrategies = [
      'profit_maximization',
      'revenue_maximization',
      'market_share',
      'customer_acquisition',
      'inventory_clearance'
    ];
    this.seasonalFactors = {
      'holiday': 1.2,
      'off_season': 0.85,
      'peak_season': 1.15,
      'back_to_school': 1.1,
      'clearance': 0.7
    };
  }

  /**
   * Get optimized prices for products
   * @param {Object} params - Price optimization parameters
   * @param {Array} params.productIds - List of product IDs to optimize
   * @param {String} params.strategy - Pricing strategy
   * @param {String} params.locationId - Store location ID
   * @param {Boolean} params.includeAnalysis - Whether to include detailed analysis
   * @returns {Promise<Object>} - Optimized pricing results
   */
  async getOptimizedPrices({
    productIds,
    strategy = 'profit_maximization',
    locationId = 'default',
    includeAnalysis = false
  }) {
    try {
      // Validate strategy
      if (!this.pricingStrategies.includes(strategy)) {
        strategy = 'profit_maximization';
      }
      
      // Check cache first
      const cacheKey = `price_opt_${productIds.join(',')}_${strategy}_${locationId}`;
      const cachedResults = localCache.get(cacheKey);
      
      if (cachedResults) {
        console.log('Using cached price optimization');
        return cachedResults;
      }
      
      // Call AI endpoint
      const response = await api.post('/ai/pricing/optimize', {
        productIds,
        strategy,
        locationId,
        includeAnalysis,
        modelVersion: this.modelVersion
      });
      
      // Process and enhance results
      const enhancedResults = this._enhancePricingResults(response.data, strategy);
      
      // Cache results for 6 hours (prices are relatively stable)
      localCache.set(cacheKey, enhancedResults, 6 * 60 * 60);
      
      return enhancedResults;
    } catch (error) {
      console.error('Error getting optimized prices:', error);
      return this._generateFallbackPricing(productIds, strategy);
    }
  }

  /**
   * Get price elasticity analysis for products
   * @param {Object} params - Elasticity analysis parameters
   * @param {Array} params.productIds - List of product IDs
   * @param {String} params.timeRange - Time range for analysis
   * @param {Boolean} params.includeSeasonality - Whether to include seasonal factors
   * @returns {Promise<Object>} - Elasticity analysis results
   */
  async getPriceElasticity({
    productIds,
    timeRange = '90d',
    includeSeasonality = true
  }) {
    try {
      const cacheKey = `elasticity_${productIds.join(',')}_${timeRange}`;
      const cachedResults = localCache.get(cacheKey);
      
      if (cachedResults) {
        return cachedResults;
      }
      
      const response = await api.post('/ai/pricing/elasticity', {
        productIds,
        timeRange,
        includeSeasonality,
        modelVersion: this.modelVersion
      });
      
      const enhancedResults = this._enhanceElasticityResults(response.data);
      localCache.set(cacheKey, enhancedResults, 24 * 60 * 60); // 24 hours cache
      
      return enhancedResults;
    } catch (error) {
      console.error('Error getting price elasticity:', error);
      return {
        elasticities: productIds.map(id => ({
          productId: id,
          elasticity: -1.0, // Default medium elasticity
          confidence: 0.5,
          isFallback: true
        })),
        analysis: {
          summary: 'Unable to retrieve elasticity data',
          isFallback: true
        }
      };
    }
  }

  /**
   * Get competitive pricing analysis
   * @param {Object} params - Competitive analysis parameters
   * @param {Array} params.productIds - List of product IDs
   * @param {Array} params.competitors - List of competitor IDs
   * @param {Boolean} params.includeRecommendations - Whether to include price recommendations
   * @returns {Promise<Object>} - Competitive analysis results
   */
  async getCompetitivePricing({
    productIds,
    competitors = [],
    includeRecommendations = true
  }) {
    try {
      const response = await api.post('/ai/pricing/competitive', {
        productIds,
        competitors,
        includeRecommendations,
        modelVersion: this.modelVersion
      });
      
      const enhancedResults = this._enhanceCompetitiveResults(response.data);
      
      return enhancedResults;
    } catch (error) {
      console.error('Error getting competitive pricing:', error);
      return {
        products: productIds.map(id => ({
          productId: id,
          competitivePrices: [],
          positioningStatus: 'unknown',
          isFallback: true
        })),
        summary: {
          pricePositioning: 'Unknown competitive position',
          isFallback: true
        }
      };
    }
  }

  /**
   * Get dynamic pricing rules for a product
   * @param {Object} params - Dynamic pricing parameters
   * @param {String} params.productId - Product ID
   * @param {String} params.strategy - Pricing strategy
   * @returns {Promise<Object>} - Dynamic pricing rules
   */
  async getDynamicPricingRules({
    productId,
    strategy = 'profit_maximization'
  }) {
    try {
      const response = await api.get(`/ai/pricing/dynamic-rules?productId=${productId}&strategy=${strategy}`);
      return response.data;
    } catch (error) {
      console.error('Error getting dynamic pricing rules:', error);
      return {
        rules: [],
        factors: [],
        isFallback: true
      };
    }
  }

  /**
   * Calculate optimal price for a product based on parameters
   * @param {Object} params - Price calculation parameters
   * @param {String} params.productId - Product ID
   * @param {Number} params.basePrice - Base price
   * @param {Object} params.factors - Pricing factors
   * @param {String} params.strategy - Pricing strategy
   * @returns {Promise<Object>} - Price calculation result
   */
  async calculateOptimalPrice({
    productId,
    basePrice,
    factors = {},
    strategy = 'profit_maximization'
  }) {
    try {
      const response = await api.post('/ai/pricing/calculate', {
        productId,
        basePrice,
        factors,
        strategy,
        modelVersion: this.modelVersion
      });
      
      return {
        ...response.data,
        calculationTime: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating optimal price:', error);
      
      // Simple fallback calculation
      const seasonFactor = factors.season ? (this.seasonalFactors[factors.season] || 1.0) : 1.0;
      const demandFactor = factors.demand || 1.0;
      const competitiveFactor = factors.competitive || 1.0;
      
      const adjustment = seasonFactor * demandFactor * competitiveFactor;
      const optimalPrice = Math.round((basePrice * adjustment) * 100) / 100;
      
      return {
        productId,
        basePrice,
        optimalPrice,
        adjustment,
        confidence: 0.5,
        isFallback: true,
        calculationTime: new Date().toISOString()
      };
    }
  }

  /**
   * Get bulk price recommendations for a category
   * @param {String} categoryId - Category ID
   * @param {String} strategy - Pricing strategy
   * @returns {Promise<Object>} - Bulk price recommendations
   */
  async getBulkPriceRecommendations(categoryId, strategy = 'profit_maximization') {
    try {
      const response = await api.get(`/ai/pricing/bulk-recommendations?categoryId=${categoryId}&strategy=${strategy}`);
      return response.data;
    } catch (error) {
      console.error('Error getting bulk price recommendations:', error);
      return {
        recommendations: [],
        summary: {
          potentialRevenue: 0,
          potentialProfit: 0
        },
        isFallback: true
      };
    }
  }

  /**
   * Get price trend forecast
   * @param {String} productId - Product ID
   * @param {Number} horizon - Forecast horizon in days
   * @returns {Promise<Object>} - Price trend forecast
   */
  async getPriceTrendForecast(productId, horizon = 30) {
    try {
      const response = await api.get(`/ai/pricing/trends?productId=${productId}&horizon=${horizon}`);
      return response.data;
    } catch (error) {
      console.error('Error getting price trend forecast:', error);
      
      // Generate simple flat forecast as fallback
      const today = new Date();
      const forecast = [];
      
      for (let i = 0; i < horizon; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        forecast.push({
          date: date.toISOString().split('T')[0],
          minPrice: null,
          maxPrice: null,
          predictedPrice: null,
          confidence: 0
        });
      }
      
      return {
        productId,
        forecast,
        trend: 'unknown',
        isFallback: true
      };
    }
  }

  /**
   * Enhance pricing results with additional insights
   * @param {Object} results - Raw pricing results
   * @param {String} strategy - Pricing strategy used
   * @returns {Object} - Enhanced pricing results
   * @private
   */
  _enhancePricingResults(results, strategy) {
    return {
      ...results,
      recommendations: results.recommendations.map(rec => ({
        ...rec,
        potentialLift: this._calculatePotentialLift(rec, strategy),
        implementationPriority: this._calculatePriority(rec),
        confidence: rec.confidence || this.confidenceThreshold
      })),
      generatedAt: new Date().toISOString(),
      strategy,
      summary: results.summary || this._generateSummary(results.recommendations, strategy)
    };
  }

  /**
   * Enhance elasticity results with additional insights
   * @param {Object} results - Raw elasticity results
   * @returns {Object} - Enhanced elasticity results
   * @private
   */
  _enhanceElasticityResults(results) {
    const enhancedElasticities = results.elasticities.map(item => ({
      ...item,
      priceFlexibility: this._getPriceFlexibilityLabel(item.elasticity),
      recommendedApproach: this._getElasticityRecommendation(item.elasticity),
      confidence: item.confidence || 0.7
    }));
    
    return {
      ...results,
      elasticities: enhancedElasticities,
      summary: results.summary || this._generateElasticitySummary(enhancedElasticities)
    };
  }

  /**
   * Enhance competitive analysis results
   * @param {Object} results - Raw competitive results
   * @returns {Object} - Enhanced competitive results
   * @private
   */
  _enhanceCompetitiveResults(results) {
    return {
      ...results,
      products: results.products.map(product => ({
        ...product,
        marketPosition: this._calculateMarketPosition(product),
        recommendedAction: product.recommendedAction || this._getCompetitiveAction(product)
      })),
      summary: results.summary || {
        pricePositioning: this._calculateOverallPositioning(results.products)
      }
    };
  }

  /**
   * Calculate potential lift from price recommendation
   * @param {Object} rec - Price recommendation
   * @param {String} strategy - Pricing strategy
   * @returns {Object} - Potential lift metrics
   * @private
   */
  _calculatePotentialLift(rec, strategy) {
    const currentPrice = rec.currentPrice || 0;
    const recommendedPrice = rec.recommendedPrice || 0;
    
    if (currentPrice === 0) return { revenue: 0, profit: 0, units: 0 };
    
    const priceChange = recommendedPrice - currentPrice;
    const percentChange = (priceChange / currentPrice) * 100;
    
    // Calculate expected impact based on elasticity
    const elasticity = rec.elasticity || -1.0;
    const demandChange = percentChange * elasticity;
    
    // Different calculations based on strategy
    let revenueImpact, profitImpact, unitsSold;
    
    if (strategy === 'profit_maximization') {
      revenueImpact = (1 + (percentChange / 100)) * (1 + (demandChange / 100)) - 1;
      profitImpact = (recommendedPrice - (rec.cost || 0)) / (currentPrice - (rec.cost || 0)) * (1 + (demandChange / 100)) - 1;
      unitsSold = demandChange / 100;
    } else {
      // Revenue maximization or market share
      revenueImpact = (1 + (percentChange / 100)) * (1 + (demandChange / 100)) - 1;
      profitImpact = (recommendedPrice - (rec.cost || 0)) / (currentPrice - (rec.cost || 0)) * (1 + (demandChange / 100)) - 1;
      unitsSold = demandChange / 100;
    }
    
    return {
      revenue: revenueImpact * 100, // Convert to percentage
      profit: profitImpact * 100, // Convert to percentage
      units: unitsSold * 100 // Convert to percentage
    };
  }

  /**
   * Calculate implementation priority
   * @param {Object} rec - Price recommendation
   * @returns {String} - Priority level
   * @private
   */
  _calculatePriority(rec) {
    const impactScore = Math.abs(rec.currentPrice - rec.recommendedPrice) / rec.currentPrice;
    const volumeScore = rec.salesVolume || 0.5;
    const confidenceScore = rec.confidence || 0.5;
    
    const priorityScore = impactScore * volumeScore * confidenceScore;
    
    if (priorityScore > 0.15) return 'high';
    if (priorityScore > 0.05) return 'medium';
    return 'low';
  }

  /**
   * Generate pricing summary
   * @param {Array} recommendations - Price recommendations
   * @param {String} strategy - Pricing strategy
   * @returns {Object} - Summary object
   * @private
   */
  _generateSummary(recommendations, strategy) {
    const totalProducts = recommendations.length;
    const increaseCount = recommendations.filter(r => r.recommendedPrice > r.currentPrice).length;
    const decreaseCount = recommendations.filter(r => r.recommendedPrice < r.currentPrice).length;
    const unchangedCount = totalProducts - increaseCount - decreaseCount;
    
    let avgChange = 0;
    recommendations.forEach(r => {
      const change = (r.recommendedPrice - r.currentPrice) / r.currentPrice;
      avgChange += change;
    });
    avgChange = (avgChange / totalProducts) * 100;
    
    let description;
    if (strategy === 'profit_maximization') {
      description = 'Prices optimized for maximum profit';
    } else if (strategy === 'revenue_maximization') {
      description = 'Prices optimized for maximum revenue';
    } else if (strategy === 'market_share') {
      description = 'Prices optimized to increase market share';
    } else if (strategy === 'inventory_clearance') {
      description = 'Prices optimized for inventory clearance';
    } else {
      description = 'Price optimization complete';
    }
    
    return {
      totalProducts,
      increaseCount,
      decreaseCount,
      unchangedCount,
      avgChange,
      description
    };
  }

  /**
   * Get price flexibility label from elasticity value
   * @param {Number} elasticity - Price elasticity value
   * @returns {String} - Flexibility label
   * @private
   */
  _getPriceFlexibilityLabel(elasticity) {
    const absElasticity = Math.abs(elasticity);
    
    if (absElasticity < 0.5) return 'very_inflexible';
    if (absElasticity < 1.0) return 'inflexible';
    if (absElasticity < 1.5) return 'moderate';
    if (absElasticity < 2.0) return 'flexible';
    return 'very_flexible';
  }

  /**
   * Get pricing recommendation based on elasticity
   * @param {Number} elasticity - Price elasticity value
   * @returns {String} - Recommendation
   * @private
   */
  _getElasticityRecommendation(elasticity) {
    const absElasticity = Math.abs(elasticity);
    
    if (absElasticity < 0.5) {
      return 'can_increase_price';
    } else if (absElasticity < 1.0) {
      return 'moderate_price_increase';
    } else if (absElasticity < 1.5) {
      return 'maintain_price';
    } else if (absElasticity < 2.0) {
      return 'careful_price_changes';
    }
    return 'lower_price_for_volume';
  }

  /**
   * Generate elasticity summary
   * @param {Array} elasticities - Enhanced elasticity data
   * @returns {Object} - Summary object
   * @private
   */
  _generateElasticitySummary(elasticities) {
    const flexibilityCount = {
      very_inflexible: 0,
      inflexible: 0,
      moderate: 0,
      flexible: 0,
      very_flexible: 0
    };
    
    elasticities.forEach(item => {
      flexibilityCount[item.priceFlexibility]++;
    });
    
    const avgElasticity = elasticities.reduce((sum, item) => sum + Math.abs(item.elasticity), 0) / elasticities.length;
    
    let overallElasticity;
    if (avgElasticity < 0.5) overallElasticity = 'very_inflexible';
    else if (avgElasticity < 1.0) overallElasticity = 'inflexible';
    else if (avgElasticity < 1.5) overallElasticity = 'moderate';
    else if (avgElasticity < 2.0) overallElasticity = 'flexible';
    else overallElasticity = 'very_flexible';
    
    return {
      averageElasticity: avgElasticity,
      overallElasticity,
      distributionByFlexibility: flexibilityCount,
      opportunityAssessment: this._getElasticityOpportunity(avgElasticity)
    };
  }

  /**
   * Get opportunity assessment based on average elasticity
   * @param {Number} avgElasticity - Average elasticity value
   * @returns {String} - Opportunity assessment
   * @private
   */
  _getElasticityOpportunity(avgElasticity) {
    if (avgElasticity < 0.5) {
      return 'High opportunity for price increases';
    } else if (avgElasticity < 1.0) {
      return 'Moderate opportunity for price increases';
    } else if (avgElasticity < 1.5) {
      return 'Price changes should be made carefully';
    } else {
      return 'Price sensitive products, focus on volume and efficiency';
    }
  }

  /**
   * Calculate market position from competitive data
   * @param {Object} product - Product with competitive data
   * @returns {String} - Market position
   * @private
   */
  _calculateMarketPosition(product) {
    const competitors = product.competitivePrices || [];
    if (competitors.length === 0) return 'unknown';
    
    let lowerCount = 0;
    let higherCount = 0;
    
    competitors.forEach(comp => {
      if ((comp.price || 0) < (product.currentPrice || 0)) {
        lowerCount++;
      } else if ((comp.price || 0) > (product.currentPrice || 0)) {
        higherCount++;
      }
    });
    
    const totalCount = competitors.length;
    const lowerPercent = (lowerCount / totalCount) * 100;
    const higherPercent = (higherCount / totalCount) * 100;
    
    if (lowerPercent >= 75) return 'premium';
    if (lowerPercent >= 50) return 'above_average';
    if (higherPercent >= 75) return 'budget';
    if (higherPercent >= 50) return 'below_average';
    return 'average';
  }

  /**
   * Get recommended competitive action
   * @param {Object} product - Product with competitive data
   * @returns {String} - Recommended action
   * @private
   */
  _getCompetitiveAction(product) {
    const position = this._calculateMarketPosition(product);
    
    switch (position) {
      case 'premium':
        return 'maintain_premium_position';
      case 'above_average':
        return 'highlight_value_proposition';
      case 'average':
        return 'differentiate_or_add_value';
      case 'below_average':
        return 'consider_price_increase';
      case 'budget':
        return 'emphasize_price_advantage';
      default:
        return 'gather_more_competitive_data';
    }
  }

  /**
   * Calculate overall competitive positioning
   * @param {Array} products - Products with competitive data
   * @returns {String} - Overall positioning
   * @private
   */
  _calculateOverallPositioning(products) {
    const positions = {};
    let total = 0;
    
    products.forEach(product => {
      const position = this._calculateMarketPosition(product);
      positions[position] = (positions[position] || 0) + 1;
      total++;
    });
    
    const positionPercentages = {};
    Object.keys(positions).forEach(pos => {
      positionPercentages[pos] = (positions[pos] / total) * 100;
    });
    
    // Find the dominant position
    let dominantPosition = 'mixed';
    let maxPercent = 33; // Threshold for dominance
    
    Object.keys(positionPercentages).forEach(pos => {
      if (positionPercentages[pos] > maxPercent) {
        maxPercent = positionPercentages[pos];
        dominantPosition = pos;
      }
    });
    
    if (dominantPosition === 'unknown') {
      return 'Insufficient competitive data';
    }
    
    const positionDescriptions = {
      premium: 'Premium positioned across most products',
      above_average: 'Generally priced above competitors',
      average: 'Average price positioning',
      below_average: 'Generally priced below competitors',
      budget: 'Budget positioned across most products',
      mixed: 'Mixed price positioning'
    };
    
    return positionDescriptions[dominantPosition] || 'Mixed price positioning';
  }

  /**
   * Generate fallback pricing data
   * @param {Array} productIds - Product IDs
   * @param {String} strategy - Pricing strategy
   * @returns {Object} - Fallback pricing data
   * @private
   */
  async _generateFallbackPricing(productIds, strategy) {
    try {
      // Try to get current product data
      const response = await api.post('/products/batch', { ids: productIds });
      const products = response.data;
      
      const recommendations = products.map(product => {
        // Simple fallback logic based on strategy
        let priceFactor = 1.0;
        if (strategy === 'profit_maximization') priceFactor = 1.05;
        else if (strategy === 'revenue_maximization') priceFactor = 0.95;
        else if (strategy === 'market_share') priceFactor = 0.9;
        else if (strategy === 'inventory_clearance') priceFactor = 0.8;
        
        const currentPrice = product.price || 0;
        const recommendedPrice = Math.round((currentPrice * priceFactor) * 100) / 100;
        
        return {
          productId: product.id,
          name: product.name,
          currentPrice,
          recommendedPrice,
          confidence: 0.5,
          elasticity: -1.0,
          potentialLift: {
            revenue: 0,
            profit: 0,
            units: 0
          },
          implementationPriority: 'low',
          isFallback: true
        };
      });
      
      return {
        recommendations,
        summary: this._generateSummary(recommendations, strategy),
        isFallback: true,
        generatedAt: new Date().toISOString(),
        strategy
      };
    } catch (error) {
      console.error('Error generating fallback pricing:', error);
      return {
        recommendations: productIds.map(id => ({
          productId: id,
          currentPrice: 0,
          recommendedPrice: 0,
          confidence: 0,
          isFallback: true
        })),
        summary: {
          totalProducts: productIds.length,
          increaseCount: 0,
          decreaseCount: 0,
          unchangedCount: productIds.length,
          avgChange: 0,
          description: 'Unable to generate price recommendations'
        },
        isFallback: true,
        generatedAt: new Date().toISOString(),
        strategy
      };
    }
  }
}

export const priceOptimization = new PriceOptimizationService();

export default priceOptimization; 