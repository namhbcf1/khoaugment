/**
 * Customer Segmentation AI Service
 * Provides intelligent customer segmentation and personalization
 * Edge-native implementation using Cloudflare AI
 */

import { api } from '../api';
import { localCache } from '../../utils/helpers/cacheUtils';

class CustomerSegmentationService {
  constructor() {
    this.modelVersion = '2.0.1';
    this.confidenceThreshold = 0.8;
    this.defaultSegmentCount = 5;
    this.cacheTTL = 24 * 60 * 60; // 24 hours for segmentation results
    this.segmentationMethods = [
      'rfm',          // Recency, Frequency, Monetary
      'behavioral',   // Behavioral patterns
      'demographic',  // Age, gender, location
      'psychographic',// Lifestyle, interests, values
      'clv',          // Customer Lifetime Value
      'hybrid'        // Combination of methods
    ];
  }

  /**
   * Get customer segments based on specified method
   * @param {Object} params - Segmentation parameters
   * @param {String} params.method - Segmentation method
   * @param {Number} params.segmentCount - Number of segments to create
   * @param {Array} params.features - Features to include in segmentation
   * @param {Boolean} params.includeDetails - Whether to include detailed metrics
   * @returns {Promise<Object>} - Segmentation results
   */
  async getCustomerSegments({
    method = 'rfm',
    segmentCount = this.defaultSegmentCount,
    features = null,
    includeDetails = false
  }) {
    try {
      // Validate method
      if (!this.segmentationMethods.includes(method)) {
        method = 'rfm';
      }
      
      // Check cache first
      const cacheKey = `segments_${method}_${segmentCount}`;
      const cachedResults = localCache.get(cacheKey);
      
      if (cachedResults) {
        console.log('Using cached segmentation results');
        return cachedResults;
      }
      
      // Call AI endpoint
      const response = await api.post('/ai/customers/segment', {
        method,
        segmentCount,
        features,
        includeDetails,
        modelVersion: this.modelVersion
      });
      
      // Process and enhance results
      const enhancedResults = this._enhanceSegmentationResults(response.data, method);
      
      // Cache results
      localCache.set(cacheKey, enhancedResults, this.cacheTTL);
      
      return enhancedResults;
    } catch (error) {
      console.error('Error getting customer segments:', error);
      return this._generateFallbackSegmentation(method, segmentCount);
    }
  }

  /**
   * Get RFM (Recency, Frequency, Monetary) analysis
   * @param {Object} params - RFM analysis parameters
   * @param {Number} params.recencyDays - Days to consider for recency
   * @param {Boolean} params.includeScores - Whether to include raw scores
   * @returns {Promise<Object>} - RFM analysis results
   */
  async getRFMAnalysis({
    recencyDays = 365,
    includeScores = true
  }) {
    try {
      const cacheKey = `rfm_analysis_${recencyDays}`;
      const cachedResults = localCache.get(cacheKey);
      
      if (cachedResults) {
        return cachedResults;
      }
      
      const response = await api.get(`/ai/customers/rfm?recencyDays=${recencyDays}&includeScores=${includeScores}`);
      
      const enhancedResults = this._enhanceRFMResults(response.data);
      localCache.set(cacheKey, enhancedResults, this.cacheTTL);
      
      return enhancedResults;
    } catch (error) {
      console.error('Error getting RFM analysis:', error);
      return {
        segments: [],
        metrics: {
          totalCustomers: 0,
          segmentDistribution: {}
        },
        isFallback: true
      };
    }
  }

  /**
   * Get customer lifetime value (CLV) predictions
   * @param {Object} params - CLV prediction parameters
   * @param {Number} params.predictionMonths - Months to predict forward
   * @param {Boolean} params.includeFactors - Whether to include influencing factors
   * @returns {Promise<Object>} - CLV prediction results
   */
  async getCustomerLifetimeValue({
    predictionMonths = 24,
    includeFactors = true
  }) {
    try {
      const response = await api.get(`/ai/customers/clv?predictionMonths=${predictionMonths}&includeFactors=${includeFactors}`);
      
      return {
        ...response.data,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting CLV predictions:', error);
      return {
        customers: [],
        metrics: {
          avgClv: 0,
          totalValue: 0
        },
        isFallback: true
      };
    }
  }

  /**
   * Get churn prediction for customers
   * @param {Object} params - Churn prediction parameters
   * @param {Number} params.riskThreshold - Risk threshold (0-1)
   * @param {Number} params.predictionDays - Days to predict forward
   * @returns {Promise<Object>} - Churn prediction results
   */
  async getChurnPredictions({
    riskThreshold = 0.5,
    predictionDays = 90
  }) {
    try {
      const response = await api.get(`/ai/customers/churn?riskThreshold=${riskThreshold}&predictionDays=${predictionDays}`);
      
      const enhancedResults = this._enhanceChurnResults(response.data);
      
      return enhancedResults;
    } catch (error) {
      console.error('Error getting churn predictions:', error);
      return {
        atRiskCustomers: [],
        metrics: {
          totalAtRisk: 0,
          avgRiskScore: 0,
          potentialRevenueLoss: 0
        },
        isFallback: true
      };
    }
  }

  /**
   * Get next best action recommendations for customers
   * @param {Object} params - Next best action parameters
   * @param {String} params.customerId - Customer ID (optional, if null returns for all segments)
   * @param {String} params.segmentId - Segment ID (optional, if customerId is null)
   * @returns {Promise<Object>} - Next best action results
   */
  async getNextBestActions({
    customerId = null,
    segmentId = null
  }) {
    try {
      let endpoint;
      if (customerId) {
        endpoint = `/ai/customers/next-best-action?customerId=${customerId}`;
      } else if (segmentId) {
        endpoint = `/ai/customers/next-best-action?segmentId=${segmentId}`;
      } else {
        endpoint = '/ai/customers/next-best-action';
      }
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error getting next best actions:', error);
      return {
        actions: [],
        isFallback: true
      };
    }
  }

  /**
   * Get behavioral clusters based on customer actions
   * @param {Number} clusterCount - Number of clusters to create
   * @returns {Promise<Object>} - Behavioral clustering results
   */
  async getBehavioralClusters(clusterCount = 4) {
    try {
      const response = await api.get(`/ai/customers/behavioral-clusters?count=${clusterCount}`);
      
      const enhancedResults = this._enhanceBehavioralResults(response.data);
      
      return enhancedResults;
    } catch (error) {
      console.error('Error getting behavioral clusters:', error);
      return {
        clusters: [],
        metrics: {
          totalCustomers: 0,
          clusterDistribution: {}
        },
        isFallback: true
      };
    }
  }

  /**
   * Get product affinity analysis for customer segments
   * @param {String} segmentId - Segment ID (optional)
   * @returns {Promise<Object>} - Product affinity results
   */
  async getProductAffinities(segmentId = null) {
    try {
      const endpoint = segmentId 
        ? `/ai/customers/product-affinity?segmentId=${segmentId}`
        : '/ai/customers/product-affinity';
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error getting product affinities:', error);
      return {
        affinities: [],
        isFallback: true
      };
    }
  }

  /**
   * Get customer segment for a specific customer
   * @param {String} customerId - Customer ID
   * @param {String} method - Segmentation method
   * @returns {Promise<Object>} - Customer segment data
   */
  async getCustomerSegment(customerId, method = 'rfm') {
    try {
      const response = await api.get(`/ai/customers/segment/${customerId}?method=${method}`);
      
      return {
        ...response.data,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting customer segment:', error);
      return {
        customerId,
        segment: 'unknown',
        confidence: 0,
        traits: [],
        isFallback: true
      };
    }
  }

  /**
   * Get similar customers based on a seed customer
   * @param {String} customerId - Seed customer ID
   * @param {Number} count - Number of similar customers to return
   * @returns {Promise<Array>} - Similar customers
   */
  async getSimilarCustomers(customerId, count = 10) {
    try {
      const response = await api.get(`/ai/customers/similar?customerId=${customerId}&count=${count}`);
      return response.data;
    } catch (error) {
      console.error('Error getting similar customers:', error);
      return [];
    }
  }

  /**
   * Analyze customer purchase patterns
   * @param {String} customerId - Customer ID (optional)
   * @param {String} segmentId - Segment ID (optional)
   * @returns {Promise<Object>} - Purchase pattern analysis
   */
  async analyzePurchasePatterns(customerId = null, segmentId = null) {
    try {
      let endpoint;
      if (customerId) {
        endpoint = `/ai/customers/purchase-patterns?customerId=${customerId}`;
      } else if (segmentId) {
        endpoint = `/ai/customers/purchase-patterns?segmentId=${segmentId}`;
      } else {
        endpoint = '/ai/customers/purchase-patterns';
      }
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error analyzing purchase patterns:', error);
      return {
        patterns: [],
        insights: [],
        isFallback: true
      };
    }
  }

  /**
   * Enhance segmentation results with additional insights
   * @param {Object} results - Raw segmentation results
   * @param {String} method - Segmentation method
   * @returns {Object} - Enhanced segmentation results
   * @private
   */
  _enhanceSegmentationResults(results, method) {
    // Add segment descriptions based on method
    const enhancedSegments = results.segments.map(segment => ({
      ...segment,
      description: segment.description || this._generateSegmentDescription(segment, method),
      recommendedActions: segment.recommendedActions || this._generateRecommendedActions(segment, method),
      valueIndicator: this._calculateValueIndicator(segment)
    }));
    
    return {
      ...results,
      segments: enhancedSegments,
      method,
      generatedAt: new Date().toISOString(),
      metrics: results.metrics || this._generateSegmentMetrics(enhancedSegments)
    };
  }

  /**
   * Enhance RFM analysis results
   * @param {Object} results - Raw RFM results
   * @returns {Object} - Enhanced RFM results
   * @private
   */
  _enhanceRFMResults(results) {
    // Standard RFM segment names and descriptions
    const rfmSegments = {
      'champions': 'Recent, frequent buyers with high spend',
      'loyal': 'Consistent buyers with good recency and frequency',
      'potential_loyalists': 'Recent customers with average frequency',
      'new_customers': 'Customers who bought recently but not frequently',
      'promising': 'Recent customers with low spend',
      'attention_needed': 'Above average recency, frequency and monetary values',
      'at_risk': 'Below average recency, but good frequency and monetary values',
      'cant_lose': 'Used to purchase frequently but haven\'t recently',
      'hibernating': 'Last purchase long ago, low spend and frequency',
      'lost': 'Lowest recency, frequency, and monetary scores'
    };
    
    const enhancedSegments = results.segments.map(segment => {
      return {
        ...segment,
        description: segment.description || rfmSegments[segment.name.toLowerCase()] || 'Customers in this segment',
        valueIndicator: this._calculateValueIndicator(segment)
      };
    });
    
    return {
      ...results,
      segments: enhancedSegments,
      method: 'rfm',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Enhance churn prediction results
   * @param {Object} results - Raw churn prediction results
   * @returns {Object} - Enhanced churn prediction results
   * @private
   */
  _enhanceChurnResults(results) {
    const enhancedCustomers = (results.atRiskCustomers || []).map(customer => ({
      ...customer,
      riskLevel: this._getRiskLevel(customer.churnProbability),
      recommendedActions: customer.recommendedActions || this._getChurnPreventionActions(customer)
    }));
    
    return {
      ...results,
      atRiskCustomers: enhancedCustomers,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Enhance behavioral clustering results
   * @param {Object} results - Raw behavioral clustering results
   * @returns {Object} - Enhanced behavioral clustering results
   * @private
   */
  _enhanceBehavioralResults(results) {
    const enhancedClusters = results.clusters.map(cluster => ({
      ...cluster,
      description: cluster.description || this._generateBehavioralDescription(cluster),
      marketingRecommendations: cluster.marketingRecommendations || this._generateMarketingRecommendations(cluster)
    }));
    
    return {
      ...results,
      clusters: enhancedClusters,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate segment description based on characteristics
   * @param {Object} segment - Segment data
   * @param {String} method - Segmentation method
   * @returns {String} - Generated description
   * @private
   */
  _generateSegmentDescription(segment, method) {
    // Generate descriptions based on segment traits and method
    const traits = segment.traits || {};
    
    if (method === 'rfm') {
      const recency = traits.recency === 'high' ? 'recent' : (traits.recency === 'low' ? 'inactive' : 'moderately active');
      const frequency = traits.frequency === 'high' ? 'frequent' : (traits.frequency === 'low' ? 'infrequent' : 'occasional');
      const monetary = traits.monetary === 'high' ? 'high-spending' : (traits.monetary === 'low' ? 'low-spending' : 'moderate-spending');
      
      return `${recency}, ${frequency}, ${monetary} customers`;
    }
    
    if (method === 'clv') {
      const value = traits.value === 'high' ? 'High lifetime value' : (traits.value === 'low' ? 'Low lifetime value' : 'Moderate lifetime value');
      const growth = traits.growth === 'positive' ? 'growing' : (traits.growth === 'negative' ? 'declining' : 'stable');
      
      return `${value} customers with ${growth} spending trends`;
    }
    
    if (method === 'behavioral') {
      const channels = traits.preferredChannel ? `prefers ${traits.preferredChannel}` : '';
      const products = traits.productPreferences ? `interested in ${traits.productPreferences}` : '';
      
      return `Customers who ${channels}${channels && products ? ' and ' : ''}${products}`;
    }
    
    return `${segment.name} segment - ${segment.size} customers`;
  }

  /**
   * Generate recommended actions for a segment
   * @param {Object} segment - Segment data
   * @param {String} method - Segmentation method
   * @returns {Array} - Recommended actions
   * @private
   */
  _generateRecommendedActions(segment, method) {
    const actions = [];
    const traits = segment.traits || {};
    
    if (method === 'rfm') {
      if (traits.recency === 'low' && traits.frequency === 'high') {
        actions.push('Send re-engagement campaign with personalized offers');
        actions.push('Highlight new products similar to previous purchases');
      }
      
      if (traits.recency === 'high' && traits.frequency === 'high') {
        actions.push('Implement loyalty rewards program');
        actions.push('Offer exclusive early access to new products');
      }
      
      if (traits.monetary === 'high') {
        actions.push('Provide premium customer service');
        actions.push('Create VIP shopping experiences');
      }
    }
    
    if (method === 'behavioral') {
      if (traits.browsingIntensity === 'high' && traits.conversionRate === 'low') {
        actions.push('Implement retargeting with special offers');
        actions.push('Simplify checkout process');
      }
      
      if (traits.preferredChannel) {
        actions.push(`Optimize marketing on ${traits.preferredChannel} channel`);
      }
    }
    
    // Add default actions if none were generated
    if (actions.length === 0) {
      actions.push('Develop targeted marketing campaign');
      actions.push('Review product recommendations');
      actions.push('Analyze customer feedback');
    }
    
    return actions;
  }

  /**
   * Calculate segment value indicator (0-100)
   * @param {Object} segment - Segment data
   * @returns {Number} - Value indicator score
   * @private
   */
  _calculateValueIndicator(segment) {
    const traits = segment.traits || {};
    let score = 50; // Default middle score
    
    // Adjust based on traits
    if (traits.recency === 'high') score += 10;
    if (traits.recency === 'low') score -= 10;
    
    if (traits.frequency === 'high') score += 15;
    if (traits.frequency === 'low') score -= 10;
    
    if (traits.monetary === 'high') score += 20;
    if (traits.monetary === 'low') score -= 15;
    
    if (traits.loyalty === 'high') score += 15;
    if (traits.loyalty === 'low') score -= 10;
    
    if (traits.growth === 'positive') score += 10;
    if (traits.growth === 'negative') score -= 15;
    
    // Cap between 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate segment metrics
   * @param {Array} segments - Enhanced segments
   * @returns {Object} - Segment metrics
   * @private
   */
  _generateSegmentMetrics(segments) {
    const totalCustomers = segments.reduce((sum, segment) => sum + segment.size, 0);
    
    // Calculate distribution
    const segmentDistribution = {};
    segments.forEach(segment => {
      segmentDistribution[segment.id] = (segment.size / totalCustomers) * 100;
    });
    
    // Calculate value distribution
    const valueBySegment = {};
    segments.forEach(segment => {
      valueBySegment[segment.id] = segment.valueIndicator;
    });
    
    return {
      totalCustomers,
      segmentCount: segments.length,
      segmentDistribution,
      valueBySegment,
      averageValue: segments.reduce((sum, segment) => sum + segment.valueIndicator, 0) / segments.length
    };
  }

  /**
   * Get risk level label from churn probability
   * @param {Number} probability - Churn probability
   * @returns {String} - Risk level
   * @private
   */
  _getRiskLevel(probability) {
    if (probability >= 0.7) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Generate churn prevention actions
   * @param {Object} customer - Customer data
   * @returns {Array} - Prevention actions
   * @private
   */
  _getChurnPreventionActions(customer) {
    const actions = [];
    const churnProbability = customer.churnProbability || 0;
    const daysSinceLastPurchase = customer.daysSinceLastPurchase || 0;
    
    if (churnProbability > 0.7) {
      actions.push('Send immediate win-back offer with significant discount');
      actions.push('Personal outreach from account manager');
    } else if (churnProbability > 0.4) {
      actions.push('Send re-engagement email with personalized recommendations');
      actions.push('Offer loyalty reward or bonus');
    }
    
    if (daysSinceLastPurchase > 90) {
      actions.push('Highlight new products or features since last visit');
    }
    
    if (actions.length === 0) {
      actions.push('Monitor customer behavior for changes');
      actions.push('Include in regular marketing campaigns');
    }
    
    return actions;
  }

  /**
   * Generate behavioral cluster description
   * @param {Object} cluster - Behavioral cluster
   * @returns {String} - Cluster description
   * @private
   */
  _generateBehavioralDescription(cluster) {
    const traits = cluster.traits || {};
    const behaviors = [];
    
    if (traits.purchaseFrequency) {
      behaviors.push(`${traits.purchaseFrequency} purchase frequency`);
    }
    
    if (traits.browsingPatterns) {
      behaviors.push(`${traits.browsingPatterns} browsing patterns`);
    }
    
    if (traits.preferredCategories) {
      behaviors.push(`interested in ${traits.preferredCategories}`);
    }
    
    if (traits.preferredChannel) {
      behaviors.push(`shops via ${traits.preferredChannel}`);
    }
    
    if (traits.priceConsciousness) {
      behaviors.push(`${traits.priceConsciousness} price consciousness`);
    }
    
    if (behaviors.length === 0) {
      return `${cluster.name} - ${cluster.size} customers`;
    }
    
    return `Customers with ${behaviors.join(', ')}`;
  }

  /**
   * Generate marketing recommendations for cluster
   * @param {Object} cluster - Behavioral cluster
   * @returns {Array} - Marketing recommendations
   * @private
   */
  _generateMarketingRecommendations(cluster) {
    const recommendations = [];
    const traits = cluster.traits || {};
    
    if (traits.preferredChannel) {
      recommendations.push(`Focus marketing on ${traits.preferredChannel} channel`);
    }
    
    if (traits.preferredCategories) {
      recommendations.push(`Highlight ${traits.preferredCategories} in promotions`);
    }
    
    if (traits.priceConsciousness === 'high') {
      recommendations.push('Emphasize value and discounts');
    } else if (traits.priceConsciousness === 'low') {
      recommendations.push('Emphasize quality and exclusivity');
    }
    
    if (traits.browsingPatterns === 'research-intensive') {
      recommendations.push('Provide detailed product information and comparisons');
    } else if (traits.browsingPatterns === 'impulse') {
      recommendations.push('Create urgency with limited-time offers');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Conduct further analysis to identify effective marketing strategies');
      recommendations.push('Test different messaging approaches');
    }
    
    return recommendations;
  }

  /**
   * Generate fallback segmentation when AI service fails
   * @param {String} method - Segmentation method
   * @param {Number} segmentCount - Number of segments
   * @returns {Object} - Fallback segmentation data
   * @private
   */
  _generateFallbackSegmentation(method, segmentCount) {
    // Create basic segments based on method
    const segments = [];
    
    if (method === 'rfm') {
      segments.push({
        id: 'champions',
        name: 'Champions',
        size: 0,
        traits: { recency: 'high', frequency: 'high', monetary: 'high' },
        description: 'Best customers - recent, frequent, and high spend',
        valueIndicator: 90
      });
      
      segments.push({
        id: 'loyal',
        name: 'Loyal Customers',
        size: 0,
        traits: { recency: 'medium', frequency: 'high', monetary: 'medium' },
        description: 'Consistent buyers with good frequency',
        valueIndicator: 75
      });
      
      segments.push({
        id: 'potential',
        name: 'Potential Loyalists',
        size: 0,
        traits: { recency: 'high', frequency: 'medium', monetary: 'medium' },
        description: 'Recent customers with average frequency and spend',
        valueIndicator: 60
      });
      
      segments.push({
        id: 'at_risk',
        name: 'At Risk',
        size: 0,
        traits: { recency: 'low', frequency: 'medium', monetary: 'medium' },
        description: 'Previous good customers who haven\'t purchased recently',
        valueIndicator: 40
      });
      
      segments.push({
        id: 'inactive',
        name: 'Inactive',
        size: 0,
        traits: { recency: 'low', frequency: 'low', monetary: 'low' },
        description: 'Lowest recency, frequency and monetary values',
        valueIndicator: 10
      });
    } else {
      // Generic segments for other methods
      for (let i = 1; i <= segmentCount; i++) {
        segments.push({
          id: `segment_${i}`,
          name: `Segment ${i}`,
          size: 0,
          traits: {},
          description: `Fallback segment ${i}`,
          valueIndicator: 50
        });
      }
    }
    
    return {
      segments,
      method,
      generatedAt: new Date().toISOString(),
      metrics: this._generateSegmentMetrics(segments),
      isFallback: true
    };
  }
}

export const customerSegmentation = new CustomerSegmentationService();

export default customerSegmentation; 