/**
 * Sales Prediction AI Service
 * Provides intelligent sales forecasting and revenue prediction
 * Edge-based ML processing for real-time predictions
 */

import { api } from '../api';
import { localCache } from '../../utils/helpers/cacheUtils';

class SalesPredictionService {
  constructor() {
    this.modelVersion = '2.2.0';
    this.confidenceThreshold = 0.75;
    this.cacheTTL = 4 * 60 * 60; // 4 hours for predictions
    this.defaultHorizon = 30; // Default forecast horizon in days
    
    // Factors that influence sales predictions
    this.predictionFactors = [
      'historical_data',   // Past sales trends
      'seasonality',       // Seasonal patterns
      'promotions',        // Marketing campaigns
      'pricing',           // Price changes
      'inventory',         // Stock levels
      'external_events',   // Holidays, events
      'weather',           // Weather conditions
      'competitor_actions' // Competitive landscape
    ];
    
    // Available forecasting models
    this.forecastModels = [
      'lstm',              // Long Short-Term Memory
      'prophet',           // Facebook Prophet
      'arima',             // AutoRegressive Integrated Moving Average
      'xgboost',           // XGBoost
      'ensemble',          // Ensemble of multiple models
      'dynamic_linear'     // Dynamic Linear Models
    ];
  }

  /**
   * Get sales forecast for future periods
   * @param {Object} params - Forecast parameters
   * @param {Number} params.horizon - Days to forecast
   * @param {String} params.interval - Time interval (day, week, month)
   * @param {Array} params.categoryIds - Categories to forecast (null for all)
   * @param {String} params.locationId - Store location ID
   * @param {String} params.model - Forecasting model to use
   * @returns {Promise<Object>} - Sales forecast results
   */
  async getSalesForecast({
    horizon = this.defaultHorizon,
    interval = 'day',
    categoryIds = null,
    locationId = 'default',
    model = 'ensemble'
  }) {
    try {
      // Validate model
      if (!this.forecastModels.includes(model)) {
        model = 'ensemble';
      }
      
      // Check cache first
      const cacheKey = `sales_forecast_${horizon}_${interval}_${locationId}_${categoryIds ? categoryIds.join(',') : 'all'}`;
      const cachedForecast = localCache.get(cacheKey);
      
      if (cachedForecast) {
        console.log('Using cached sales forecast');
        return cachedForecast;
      }
      
      // Call AI endpoint
      const response = await api.post('/ai/sales/forecast', {
        horizon,
        interval,
        categoryIds,
        locationId,
        model,
        modelVersion: this.modelVersion
      });
      
      // Process and enhance forecast data
      const enhancedForecast = this._enhanceForecastData(response.data);
      
      // Cache results
      localCache.set(cacheKey, enhancedForecast, this.cacheTTL);
      
      return enhancedForecast;
    } catch (error) {
      console.error('Error getting sales forecast:', error);
      return this._generateFallbackForecast(horizon, interval, categoryIds);
    }
  }

  /**
   * Get revenue prediction with breakdown by categories
   * @param {Object} params - Revenue prediction parameters
   * @param {String} params.timePeriod - Time period (week, month, quarter, year)
   * @param {String} params.startDate - Start date (YYYY-MM-DD)
   * @param {Boolean} params.includeCategoryBreakdown - Whether to include category breakdown
   * @returns {Promise<Object>} - Revenue prediction results
   */
  async getRevenuePrediction({
    timePeriod = 'month',
    startDate = this._getDefaultStartDate(),
    includeCategoryBreakdown = true
  }) {
    try {
      const response = await api.post('/ai/sales/revenue-prediction', {
        timePeriod,
        startDate,
        includeCategoryBreakdown,
        modelVersion: this.modelVersion
      });
      
      return {
        ...response.data,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting revenue prediction:', error);
      return this._generateFallbackRevenuePrediction(timePeriod, startDate);
    }
  }

  /**
   * Get sales anomaly detection
   * @param {Object} params - Anomaly detection parameters
   * @param {String} params.timeRange - Time range to analyze (e.g. '30d', '3m')
   * @param {Number} params.sensitivity - Detection sensitivity (0-1)
   * @param {String} params.locationId - Store location ID
   * @returns {Promise<Object>} - Anomaly detection results
   */
  async getSalesAnomalyDetection({
    timeRange = '30d',
    sensitivity = 0.7,
    locationId = 'default'
  }) {
    try {
      const response = await api.get(`/ai/sales/anomalies?timeRange=${timeRange}&sensitivity=${sensitivity}&locationId=${locationId}`);
      
      const enhancedResults = this._enhanceAnomalyResults(response.data);
      
      return enhancedResults;
    } catch (error) {
      console.error('Error detecting sales anomalies:', error);
      return {
        anomalies: [],
        metrics: {
          anomalyCount: 0,
          potentialImpact: 0
        },
        isFallback: true
      };
    }
  }

  /**
   * Get prediction for product performance
   * @param {Object} params - Product performance parameters
   * @param {Array} params.productIds - Product IDs to predict performance for
   * @param {Number} params.horizon - Days to predict forward
   * @param {String} params.locationId - Store location ID
   * @returns {Promise<Object>} - Product performance prediction results
   */
  async getProductPerformancePrediction({
    productIds,
    horizon = 30,
    locationId = 'default'
  }) {
    try {
      const response = await api.post('/ai/sales/product-performance', {
        productIds,
        horizon,
        locationId,
        modelVersion: this.modelVersion
      });
      
      const enhancedResults = this._enhanceProductPerformance(response.data);
      
      return enhancedResults;
    } catch (error) {
      console.error('Error predicting product performance:', error);
      return {
        products: productIds.map(id => ({
          productId: id,
          trend: 'unknown',
          predictedUnits: [],
          predictedRevenue: [],
          confidence: 0,
          isFallback: true
        })),
        summary: {
          topPerformers: [],
          underperformers: []
        },
        isFallback: true
      };
    }
  }

  /**
   * Get growth opportunity analysis
   * @param {String} timeFrame - Time frame (month, quarter, year)
   * @returns {Promise<Object>} - Growth opportunity analysis results
   */
  async getGrowthOpportunityAnalysis(timeFrame = 'quarter') {
    try {
      const response = await api.get(`/ai/sales/growth-opportunities?timeFrame=${timeFrame}`);
      return response.data;
    } catch (error) {
      console.error('Error getting growth opportunities:', error);
      return {
        opportunities: [],
        potentialRevenue: 0,
        isFallback: true
      };
    }
  }

  /**
   * Get promotional impact analysis
   * @param {Object} params - Promotional impact parameters
   * @param {String} params.promotionId - Promotion ID (optional)
   * @param {String} params.promotionType - Promotion type (optional)
   * @param {String} params.timeRange - Time range to analyze
   * @returns {Promise<Object>} - Promotional impact analysis
   */
  async getPromotionalImpactAnalysis({
    promotionId = null,
    promotionType = null,
    timeRange = '30d'
  }) {
    try {
      let endpoint = '/ai/sales/promotional-impact?';
      
      if (promotionId) {
        endpoint += `promotionId=${promotionId}&`;
      }
      
      if (promotionType) {
        endpoint += `promotionType=${promotionType}&`;
      }
      
      endpoint += `timeRange=${timeRange}`;
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error analyzing promotional impact:', error);
      return {
        impact: {
          revenueIncrease: 0,
          unitsSold: 0,
          customerEngagement: 0
        },
        analysis: 'Unable to analyze promotional impact',
        isFallback: true
      };
    }
  }

  /**
   * Get sales performance by staff member
   * @param {Object} params - Staff performance parameters
   * @param {String} params.staffId - Staff member ID (optional)
   * @param {String} params.departmentId - Department ID (optional)
   * @param {String} params.timeRange - Time range to analyze
   * @returns {Promise<Object>} - Staff sales performance data
   */
  async getStaffSalesPerformance({
    staffId = null,
    departmentId = null,
    timeRange = '30d'
  }) {
    try {
      let endpoint = '/ai/sales/staff-performance?';
      
      if (staffId) {
        endpoint += `staffId=${staffId}&`;
      }
      
      if (departmentId) {
        endpoint += `departmentId=${departmentId}&`;
      }
      
      endpoint += `timeRange=${timeRange}`;
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error getting staff sales performance:', error);
      return {
        staff: [],
        metrics: {
          topPerformer: null,
          averageSales: 0,
          salesDistribution: {}
        },
        isFallback: true
      };
    }
  }

  /**
   * Get scenario analysis for sales strategies
   * @param {Object} params - Scenario analysis parameters
   * @param {Array} params.scenarios - Scenarios to analyze
   * @param {Number} params.horizon - Days to forecast
   * @returns {Promise<Object>} - Scenario analysis results
   */
  async getScenarioAnalysis({
    scenarios,
    horizon = 90
  }) {
    try {
      const response = await api.post('/ai/sales/scenario-analysis', {
        scenarios,
        horizon,
        modelVersion: this.modelVersion
      });
      
      return response.data;
    } catch (error) {
      console.error('Error performing scenario analysis:', error);
      return {
        scenarios: scenarios.map(scenario => ({
          ...scenario,
          predictedRevenue: 0,
          predictedUnits: 0,
          impact: 'unknown',
          confidence: 0,
          isFallback: true
        })),
        recommendation: 'Unable to perform scenario analysis',
        isFallback: true
      };
    }
  }

  /**
   * Get sales velocity metrics
   * @param {Object} params - Sales velocity parameters
   * @param {String} params.timeRange - Time range to analyze
   * @param {String} params.comparisonRange - Time range to compare against
   * @returns {Promise<Object>} - Sales velocity metrics
   */
  async getSalesVelocityMetrics({
    timeRange = '30d',
    comparisonRange = '60d'
  }) {
    try {
      const response = await api.get(`/ai/sales/velocity?timeRange=${timeRange}&comparisonRange=${comparisonRange}`);
      return response.data;
    } catch (error) {
      console.error('Error getting sales velocity metrics:', error);
      return {
        metrics: {
          leadCount: 0,
          conversionRate: 0,
          avgDealSize: 0,
          salesCycle: 0,
          velocityScore: 0
        },
        trend: 'unknown',
        isFallback: true
      };
    }
  }

  /**
   * Enhance forecast data with additional insights
   * @param {Object} forecastData - Raw forecast data
   * @returns {Object} - Enhanced forecast data
   * @private
   */
  _enhanceForecastData(forecastData) {
    // Calculate growth rates and trends
    const enhancedSeries = forecastData.series.map(series => {
      const values = series.values || [];
      const trend = this._calculateTrend(values);
      
      return {
        ...series,
        trend,
        growthRate: this._calculateGrowthRate(values),
        confidence: series.confidence || this.confidenceThreshold,
        insights: series.insights || this._generateForecastInsights(series, trend)
      };
    });
    
    return {
      ...forecastData,
      series: enhancedSeries,
      generatedAt: new Date().toISOString(),
      nextUpdateAt: new Date(Date.now() + this.cacheTTL * 1000).toISOString(),
      summary: forecastData.summary || this._generateForecastSummary(enhancedSeries)
    };
  }

  /**
   * Enhance anomaly detection results
   * @param {Object} results - Raw anomaly detection results
   * @returns {Object} - Enhanced anomaly results
   * @private
   */
  _enhanceAnomalyResults(results) {
    const enhancedAnomalies = results.anomalies.map(anomaly => ({
      ...anomaly,
      severity: anomaly.severity || this._calculateAnomalySeverity(anomaly),
      possibleCauses: anomaly.possibleCauses || this._generatePossibleCauses(anomaly),
      recommendedActions: anomaly.recommendedActions || this._generateAnomalyActions(anomaly)
    }));
    
    const anomalyCount = enhancedAnomalies.length;
    const potentialImpact = this._calculateAnomaliesImpact(enhancedAnomalies);
    
    return {
      ...results,
      anomalies: enhancedAnomalies,
      metrics: results.metrics || {
        anomalyCount,
        potentialImpact
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Enhance product performance predictions
   * @param {Object} results - Raw product performance data
   * @returns {Object} - Enhanced product performance data
   * @private
   */
  _enhanceProductPerformance(results) {
    const enhancedProducts = results.products.map(product => {
      // Calculate trend from predicted units
      const trend = this._calculateTrend(product.predictedUnits || []);
      
      return {
        ...product,
        trend: product.trend || trend.direction,
        trendStrength: product.trendStrength || trend.strength,
        growthRate: product.growthRate || this._calculateGrowthRate(product.predictedUnits || []),
        insights: product.insights || this._generateProductInsights(product, trend)
      };
    });
    
    // Identify top performers and underperformers
    const sorted = [...enhancedProducts].sort((a, b) => {
      return (b.growthRate || 0) - (a.growthRate || 0);
    });
    
    const topPerformers = sorted.slice(0, 3).map(p => p.productId);
    const underperformers = sorted.slice(-3).map(p => p.productId);
    
    return {
      ...results,
      products: enhancedProducts,
      summary: results.summary || {
        topPerformers,
        underperformers
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Calculate trend direction and strength from time series
   * @param {Array} values - Time series values
   * @returns {Object} - Trend direction and strength
   * @private
   */
  _calculateTrend(values) {
    if (!values || values.length < 2) {
      return { direction: 'stable', strength: 0 };
    }
    
    // Simple linear regression
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    values.forEach((y, x) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });
    
    // Calculate slope and R-squared
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    let ssResid = 0;
    let ssTot = 0;
    const mean = sumY / n;
    
    values.forEach((y, x) => {
      const predicted = slope * x + intercept;
      ssResid += Math.pow(y - predicted, 2);
      ssTot += Math.pow(y - mean, 2);
    });
    
    // R-squared as trend strength
    let strength = ssTot !== 0 ? 1 - (ssResid / ssTot) : 0;
    strength = Math.max(0, Math.min(1, Math.abs(strength))); // Bound between 0-1
    
    // Determine direction
    let direction = 'stable';
    if (slope > 0.05 && strength > 0.2) direction = 'rising';
    else if (slope < -0.05 && strength > 0.2) direction = 'falling';
    
    return { direction, strength, slope };
  }

  /**
   * Calculate growth rate from time series
   * @param {Array} values - Time series values
   * @returns {Number} - Growth rate percentage
   * @private
   */
  _calculateGrowthRate(values) {
    if (!values || values.length < 2) {
      return 0;
    }
    
    // Calculate percentage change from first to last value
    const first = values[0] || 0;
    const last = values[values.length - 1] || 0;
    
    if (first === 0) return 0;
    
    return ((last - first) / first) * 100;
  }

  /**
   * Generate insights for forecast series
   * @param {Object} series - Forecast series data
   * @param {Object} trend - Trend information
   * @returns {Array} - Forecast insights
   * @private
   */
  _generateForecastInsights(series, trend) {
    const insights = [];
    
    if (trend.direction === 'rising' && trend.strength > 0.5) {
      insights.push('Strong upward trend detected');
      insights.push('Consider increasing inventory to meet demand');
    } else if (trend.direction === 'falling' && trend.strength > 0.5) {
      insights.push('Significant downward trend detected');
      insights.push('Review pricing and marketing strategies');
    } else if (trend.direction === 'stable') {
      insights.push('Stable sales pattern detected');
      insights.push('Maintain current inventory levels');
    }
    
    // Add seasonality insight if present
    if (series.seasonality) {
      insights.push(`Seasonal ${series.seasonality} pattern detected`);
    }
    
    return insights;
  }

  /**
   * Generate forecast summary
   * @param {Array} series - Enhanced forecast series
   * @returns {Object} - Forecast summary
   * @private
   */
  _generateForecastSummary(series) {
    // Count trends
    let rising = 0;
    let falling = 0;
    let stable = 0;
    
    series.forEach(s => {
      if (s.trend.direction === 'rising') rising++;
      else if (s.trend.direction === 'falling') falling++;
      else stable++;
    });
    
    // Calculate overall growth
    let totalGrowth = 0;
    series.forEach(s => {
      totalGrowth += s.growthRate || 0;
    });
    const avgGrowth = series.length > 0 ? totalGrowth / series.length : 0;
    
    // Generate summary description
    let overallTrend;
    if (rising > falling && rising > stable) {
      overallTrend = 'positive';
    } else if (falling > rising && falling > stable) {
      overallTrend = 'negative';
    } else {
      overallTrend = 'stable';
    }
    
    let description;
    if (overallTrend === 'positive') {
      description = `Overall positive trend with ${avgGrowth.toFixed(1)}% average growth`;
    } else if (overallTrend === 'negative') {
      description = `Overall negative trend with ${avgGrowth.toFixed(1)}% average decline`;
    } else {
      description = 'Overall stable trends with minimal growth';
    }
    
    return {
      overallTrend,
      avgGrowth,
      rising,
      falling,
      stable,
      description
    };
  }

  /**
   * Calculate anomaly severity
   * @param {Object} anomaly - Anomaly data
   * @returns {String} - Severity level
   * @private
   */
  _calculateAnomalySeverity(anomaly) {
    const deviation = anomaly.deviation || 0;
    
    if (Math.abs(deviation) > 50) return 'critical';
    if (Math.abs(deviation) > 30) return 'high';
    if (Math.abs(deviation) > 15) return 'medium';
    return 'low';
  }

  /**
   * Generate possible causes for anomaly
   * @param {Object} anomaly - Anomaly data
   * @returns {Array} - Possible causes
   * @private
   */
  _generatePossibleCauses(anomaly) {
    const causes = [];
    const type = anomaly.type || '';
    const deviation = anomaly.deviation || 0;
    
    if (deviation > 0) {
      // Positive anomaly
      causes.push('Marketing campaign impact');
      causes.push('Seasonal demand increase');
      causes.push('Competitive product stockout');
      causes.push('Price reduction');
    } else {
      // Negative anomaly
      causes.push('Inventory shortage');
      causes.push('Pricing issues');
      causes.push('Competitive actions');
      causes.push('Quality or reputation issues');
    }
    
    if (type.includes('sudden')) {
      causes.push('External event impact');
    }
    
    if (type.includes('gradual')) {
      causes.push('Changing market trends');
    }
    
    return causes;
  }

  /**
   * Generate recommended actions for anomaly
   * @param {Object} anomaly - Anomaly data
   * @returns {Array} - Recommended actions
   * @private
   */
  _generateAnomalyActions(anomaly) {
    const actions = [];
    const severity = anomaly.severity || this._calculateAnomalySeverity(anomaly);
    const deviation = anomaly.deviation || 0;
    
    // Common actions
    actions.push('Investigate root causes');
    
    if (severity === 'critical' || severity === 'high') {
      actions.push('Alert management immediately');
      
      if (deviation > 0) {
        actions.push('Ensure inventory can meet increased demand');
        actions.push('Analyze successful factors to replicate');
      } else {
        actions.push('Review pricing and competitive positioning');
        actions.push('Check for quality or fulfillment issues');
      }
    }
    
    if (severity === 'medium' || severity === 'low') {
      actions.push('Monitor situation for changes');
      
      if (deviation > 0) {
        actions.push('Document success factors');
      } else {
        actions.push('Adjust short-term forecasts');
      }
    }
    
    return actions;
  }

  /**
   * Calculate potential impact from anomalies
   * @param {Array} anomalies - Enhanced anomalies
   * @returns {Number} - Potential impact score
   * @private
   */
  _calculateAnomaliesImpact(anomalies) {
    let impact = 0;
    
    anomalies.forEach(anomaly => {
      const deviationImpact = Math.abs(anomaly.deviation || 0);
      const volumeImpact = anomaly.volumeImpact || 1;
      
      // Scale from 0-100
      const individualImpact = Math.min(100, deviationImpact * volumeImpact / 10);
      impact += individualImpact;
    });
    
    // Cap at 100
    return Math.min(100, impact);
  }

  /**
   * Generate insights for product performance
   * @param {Object} product - Product data
   * @param {Object} trend - Trend information
   * @returns {Array} - Product insights
   * @private
   */
  _generateProductInsights(product, trend) {
    const insights = [];
    
    if (trend.direction === 'rising' && trend.strength > 0.6) {
      insights.push('Strong sales momentum');
      insights.push('Consider increasing inventory levels');
    } else if (trend.direction === 'rising' && trend.strength > 0.3) {
      insights.push('Positive sales trend');
      insights.push('Monitor inventory to meet demand');
    } else if (trend.direction === 'falling' && trend.strength > 0.6) {
      insights.push('Significant sales decline');
      insights.push('Review pricing and marketing strategy');
    } else if (trend.direction === 'falling' && trend.strength > 0.3) {
      insights.push('Downward sales trend');
      insights.push('Consider promotional activities');
    } else {
      insights.push('Stable sales pattern');
      insights.push('Maintain current strategy');
    }
    
    return insights;
  }

  /**
   * Get default start date for revenue prediction
   * @returns {String} - Default start date (current date)
   * @private
   */
  _getDefaultStartDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Generate fallback forecast when AI service fails
   * @param {Number} horizon - Forecast horizon
   * @param {String} interval - Time interval
   * @param {Array} categoryIds - Category IDs
   * @returns {Object} - Fallback forecast data
   * @private
   */
  _generateFallbackForecast(horizon, interval, categoryIds) {
    const now = new Date();
    const dates = [];
    
    // Generate dates for the forecast
    for (let i = 0; i < horizon; i++) {
      const date = new Date(now);
      
      if (interval === 'day') {
        date.setDate(now.getDate() + i);
      } else if (interval === 'week') {
        date.setDate(now.getDate() + i * 7);
      } else if (interval === 'month') {
        date.setMonth(now.getMonth() + i);
      }
      
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Create a flat forecast series
    const series = [{
      id: 'total',
      name: 'Total Sales',
      values: Array(horizon).fill(0),
      dates,
      confidence: 0,
      trend: { direction: 'stable', strength: 0 },
      growthRate: 0,
      insights: ['Forecast data unavailable', 'Using fallback values']
    }];
    
    // Add category forecasts if requested
    if (categoryIds && categoryIds.length > 0) {
      categoryIds.forEach(catId => {
        series.push({
          id: catId,
          name: `Category ${catId}`,
          values: Array(horizon).fill(0),
          dates,
          confidence: 0,
          trend: { direction: 'stable', strength: 0 },
          growthRate: 0,
          insights: ['Category forecast unavailable', 'Using fallback values']
        });
      });
    }
    
    return {
      series,
      factors: [],
      summary: this._generateForecastSummary(series),
      generatedAt: new Date().toISOString(),
      isFallback: true
    };
  }

  /**
   * Generate fallback revenue prediction
   * @param {String} timePeriod - Time period
   * @param {String} startDate - Start date
   * @returns {Object} - Fallback revenue prediction
   * @private
   */
  _generateFallbackRevenuePrediction(timePeriod, startDate) {
    return {
      prediction: {
        revenue: 0,
        units: 0,
        transactions: 0
      },
      categories: [],
      comparisonToLastPeriod: {
        revenue: 0,
        units: 0,
        transactions: 0
      },
      timePeriod,
      startDate,
      endDate: '',
      confidence: 0,
      isFallback: true,
      generatedAt: new Date().toISOString()
    };
  }
}

export const salesPrediction = new SalesPredictionService();

export default salesPrediction; 