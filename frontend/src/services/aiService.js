/**
 * AI Service - Machine Learning và Analytics
 * Triển khai các thuật toán AI cho customer segmentation, forecasting, và optimization
 */

class AIService {
  constructor() {
    this.models = new Map();
    this.trainingData = new Map();
    this.predictions = new Map();
    this.initializeModels();
  }

  /**
   * Khởi tạo các models AI
   */
  initializeModels() {
    // Customer Segmentation Model
    this.models.set('customerSegmentation', {
      type: 'kmeans',
      features: ['totalSpent', 'frequency', 'recency', 'avgOrderValue'],
      clusters: 5,
      trained: false
    });

    // Sales Forecasting Model
    this.models.set('salesForecasting', {
      type: 'linearRegression',
      features: ['date', 'seasonality', 'promotions', 'weather'],
      trained: false
    });

    // Recommendation Engine
    this.models.set('productRecommendation', {
      type: 'collaborativeFiltering',
      features: ['userId', 'productId', 'rating', 'category'],
      trained: false
    });

    // Price Optimization Model
    this.models.set('priceOptimization', {
      type: 'elasticityModel',
      features: ['price', 'demand', 'competition', 'cost'],
      trained: false
    });
  }

  /**
   * Customer Segmentation - RFM Analysis với K-Means
   */
  async segmentCustomers(customers) {
    try {
      // Tính toán RFM metrics
      const rfmData = this.calculateRFMMetrics(customers);
      
      // Normalize data
      const normalizedData = this.normalizeData(rfmData);
      
      // Apply K-Means clustering
      const segments = this.kMeansClustering(normalizedData, 5);
      
      // Label segments
      const labeledSegments = this.labelCustomerSegments(segments);
      
      return {
        segments: labeledSegments,
        metrics: this.calculateSegmentMetrics(labeledSegments),
        insights: this.generateSegmentInsights(labeledSegments)
      };
    } catch (error) {
      console.error('Customer segmentation error:', error);
      throw error;
    }
  }

  /**
   * Tính toán RFM (Recency, Frequency, Monetary) metrics
   */
  calculateRFMMetrics(customers) {
    const today = new Date();
    
    return customers.map(customer => {
      const orders = customer.orders || [];
      
      // Recency: Số ngày từ lần mua cuối
      const lastOrderDate = orders.length > 0 
        ? new Date(Math.max(...orders.map(o => new Date(o.date))))
        : new Date(0);
      const recency = Math.floor((today - lastOrderDate) / (1000 * 60 * 60 * 24));
      
      // Frequency: Số lần mua hàng
      const frequency = orders.length;
      
      // Monetary: Tổng giá trị đã mua
      const monetary = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Average Order Value
      const avgOrderValue = frequency > 0 ? monetary / frequency : 0;
      
      return {
        customerId: customer.id,
        customerName: customer.name,
        recency,
        frequency,
        monetary,
        avgOrderValue,
        registrationDate: customer.createdAt,
        lastActivity: customer.lastActivity
      };
    });
  }

  /**
   * Normalize data cho machine learning
   */
  normalizeData(data) {
    const features = ['recency', 'frequency', 'monetary', 'avgOrderValue'];
    const normalized = [];
    
    // Tính min, max cho mỗi feature
    const stats = {};
    features.forEach(feature => {
      const values = data.map(d => d[feature]);
      stats[feature] = {
        min: Math.min(...values),
        max: Math.max(...values),
        mean: values.reduce((a, b) => a + b, 0) / values.length
      };
    });
    
    // Normalize về scale 0-1
    data.forEach(item => {
      const normalizedItem = { ...item };
      features.forEach(feature => {
        const { min, max } = stats[feature];
        normalizedItem[feature] = max > min ? (item[feature] - min) / (max - min) : 0;
      });
      normalized.push(normalizedItem);
    });
    
    return { data: normalized, stats };
  }

  /**
   * K-Means Clustering Algorithm
   */
  kMeansClustering(normalizedData, k = 5) {
    const data = normalizedData.data;
    const features = ['recency', 'frequency', 'monetary', 'avgOrderValue'];
    
    // Khởi tạo centroids ngẫu nhiên
    let centroids = [];
    for (let i = 0; i < k; i++) {
      const centroid = {};
      features.forEach(feature => {
        centroid[feature] = Math.random();
      });
      centroids.push(centroid);
    }
    
    let iterations = 0;
    const maxIterations = 100;
    let converged = false;
    
    while (!converged && iterations < maxIterations) {
      // Assign points to nearest centroid
      const clusters = Array(k).fill().map(() => []);
      
      data.forEach(point => {
        let minDistance = Infinity;
        let clusterIndex = 0;
        
        centroids.forEach((centroid, index) => {
          const distance = this.euclideanDistance(point, centroid, features);
          if (distance < minDistance) {
            minDistance = distance;
            clusterIndex = index;
          }
        });
        
        clusters[clusterIndex].push({ ...point, cluster: clusterIndex });
      });
      
      // Update centroids
      const newCentroids = [];
      clusters.forEach((cluster, index) => {
        if (cluster.length > 0) {
          const newCentroid = {};
          features.forEach(feature => {
            newCentroid[feature] = cluster.reduce((sum, point) => sum + point[feature], 0) / cluster.length;
          });
          newCentroids.push(newCentroid);
        } else {
          newCentroids.push(centroids[index]);
        }
      });
      
      // Check convergence
      converged = this.centroidsConverged(centroids, newCentroids, features);
      centroids = newCentroids;
      iterations++;
    }
    
    // Final assignment
    const finalClusters = Array(k).fill().map(() => []);
    data.forEach(point => {
      let minDistance = Infinity;
      let clusterIndex = 0;
      
      centroids.forEach((centroid, index) => {
        const distance = this.euclideanDistance(point, centroid, features);
        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = index;
        }
      });
      
      finalClusters[clusterIndex].push({ ...point, cluster: clusterIndex });
    });
    
    return {
      clusters: finalClusters,
      centroids,
      iterations,
      converged
    };
  }

  /**
   * Tính khoảng cách Euclidean
   */
  euclideanDistance(point1, point2, features) {
    return Math.sqrt(
      features.reduce((sum, feature) => {
        const diff = point1[feature] - point2[feature];
        return sum + diff * diff;
      }, 0)
    );
  }

  /**
   * Kiểm tra convergence của centroids
   */
  centroidsConverged(oldCentroids, newCentroids, features, threshold = 0.001) {
    return oldCentroids.every((oldCentroid, index) => {
      const newCentroid = newCentroids[index];
      return features.every(feature => {
        return Math.abs(oldCentroid[feature] - newCentroid[feature]) < threshold;
      });
    });
  }

  /**
   * Gán nhãn cho các segments
   */
  labelCustomerSegments(clusterResult) {
    const { clusters, centroids } = clusterResult;
    
    const segmentLabels = [
      {
        name: 'Champions',
        description: 'Khách hàng VIP - mua nhiều, thường xuyên, gần đây',
        color: '#52c41a',
        strategy: 'Reward them. Can be early adopters for new products.'
      },
      {
        name: 'Loyal Customers',
        description: 'Khách hàng trung thành - mua thường xuyên',
        color: '#1890ff',
        strategy: 'Upsell higher value products. Ask for reviews.'
      },
      {
        name: 'Potential Loyalists',
        description: 'Khách hàng tiềm năng - mua gần đây nhưng chưa thường xuyên',
        color: '#722ed1',
        strategy: 'Offer membership or loyalty program. Keep them engaged.'
      },
      {
        name: 'At Risk',
        description: 'Khách hàng có nguy cơ rời bỏ - đã lâu không mua',
        color: '#fa8c16',
        strategy: 'Send personalized emails. Offer discounts.'
      },
      {
        name: 'Lost Customers',
        description: 'Khách hàng đã mất - lâu không mua, ít tương tác',
        color: '#ff4d4f',
        strategy: 'Revive interest with reach out campaign. Ignore otherwise.'
      }
    ];
    
    // Sắp xếp clusters theo monetary value để gán label phù hợp
    const sortedClusters = clusters
      .map((cluster, index) => ({
        index,
        cluster,
        centroid: centroids[index],
        avgMonetary: cluster.length > 0 
          ? cluster.reduce((sum, c) => sum + c.monetary, 0) / cluster.length 
          : 0
      }))
      .sort((a, b) => b.avgMonetary - a.avgMonetary);
    
    return sortedClusters.map((item, labelIndex) => ({
      ...segmentLabels[labelIndex],
      clusterId: item.index,
      customers: item.cluster,
      centroid: item.centroid,
      size: item.cluster.length,
      avgMonetary: item.avgMonetary
    }));
  }

  /**
   * Tính toán metrics cho từng segment
   */
  calculateSegmentMetrics(segments) {
    return segments.map(segment => {
      const customers = segment.customers;
      if (customers.length === 0) {
        return { ...segment, metrics: {} };
      }
      
      const totalRevenue = customers.reduce((sum, c) => sum + c.monetary, 0);
      const avgRecency = customers.reduce((sum, c) => sum + c.recency, 0) / customers.length;
      const avgFrequency = customers.reduce((sum, c) => sum + c.frequency, 0) / customers.length;
      const avgOrderValue = customers.reduce((sum, c) => sum + c.avgOrderValue, 0) / customers.length;
      
      return {
        ...segment,
        metrics: {
          totalRevenue,
          avgRecency: Math.round(avgRecency),
          avgFrequency: Math.round(avgFrequency * 10) / 10,
          avgOrderValue: Math.round(avgOrderValue),
          customerCount: customers.length,
          revenuePercentage: 0 // Sẽ được tính sau
        }
      };
    });
  }

  /**
   * Tạo insights cho segments
   */
  generateSegmentInsights(segments) {
    const totalCustomers = segments.reduce((sum, s) => sum + s.size, 0);
    const totalRevenue = segments.reduce((sum, s) => sum + (s.metrics?.totalRevenue || 0), 0);
    
    // Cập nhật revenue percentage
    segments.forEach(segment => {
      if (segment.metrics) {
        segment.metrics.revenuePercentage = totalRevenue > 0 
          ? Math.round((segment.metrics.totalRevenue / totalRevenue) * 100)
          : 0;
      }
    });
    
    const insights = [
      {
        type: 'overview',
        title: 'Tổng quan phân khúc khách hàng',
        description: `Đã phân tích ${totalCustomers} khách hàng thành ${segments.length} nhóm chính`,
        value: totalCustomers,
        trend: 'stable'
      }
    ];
    
    // Top performing segment
    const topSegment = segments.reduce((max, segment) => 
      (segment.metrics?.totalRevenue || 0) > (max.metrics?.totalRevenue || 0) ? segment : max
    );
    
    insights.push({
      type: 'top_segment',
      title: 'Nhóm khách hàng có giá trị cao nhất',
      description: `${topSegment.name} đóng góp ${topSegment.metrics?.revenuePercentage || 0}% doanh thu`,
      value: topSegment.metrics?.totalRevenue || 0,
      segment: topSegment.name
    });
    
    // At-risk customers
    const atRiskSegment = segments.find(s => s.name.includes('At Risk') || s.name.includes('Lost'));
    if (atRiskSegment) {
      insights.push({
        type: 'at_risk',
        title: 'Khách hàng có nguy cơ rời bỏ',
        description: `${atRiskSegment.size} khách hàng cần được chăm sóc đặc biệt`,
        value: atRiskSegment.size,
        urgency: 'high'
      });
    }
    
    return insights;
  }

  /**
   * Dự đoán segment cho khách hàng mới
   */
  predictCustomerSegment(customerData, trainedSegments) {
    const rfm = this.calculateRFMMetrics([customerData])[0];
    const features = ['recency', 'frequency', 'monetary', 'avgOrderValue'];
    
    let minDistance = Infinity;
    let predictedSegment = null;
    
    trainedSegments.forEach(segment => {
      const distance = this.euclideanDistance(rfm, segment.centroid, features);
      if (distance < minDistance) {
        minDistance = distance;
        predictedSegment = segment;
      }
    });
    
    return {
      segment: predictedSegment,
      confidence: Math.max(0, 1 - (minDistance / 2)), // Normalize confidence
      recommendations: this.getSegmentRecommendations(predictedSegment)
    };
  }

  /**
   * Lấy recommendations cho segment
   */
  getSegmentRecommendations(segment) {
    const recommendations = {
      'Champions': [
        'Offer exclusive products and early access',
        'Ask for referrals and reviews',
        'Provide VIP customer service'
      ],
      'Loyal Customers': [
        'Upsell premium products',
        'Offer loyalty rewards',
        'Send personalized offers'
      ],
      'Potential Loyalists': [
        'Offer membership programs',
        'Send educational content',
        'Provide excellent onboarding'
      ],
      'At Risk': [
        'Send win-back campaigns',
        'Offer limited-time discounts',
        'Gather feedback on issues'
      ],
      'Lost Customers': [
        'Send reactivation emails',
        'Offer significant discounts',
        'Survey for improvement areas'
      ]
    };
    
    return recommendations[segment.name] || ['Monitor customer behavior'];
  }

  /**
   * Export segmentation results
   */
  exportSegmentationResults(segments) {
    const results = {
      timestamp: new Date().toISOString(),
      totalSegments: segments.length,
      segments: segments.map(segment => ({
        name: segment.name,
        description: segment.description,
        customerCount: segment.size,
        metrics: segment.metrics,
        strategy: segment.strategy,
        customers: segment.customers.map(c => ({
          id: c.customerId,
          name: c.customerName,
          rfm: {
            recency: c.recency,
            frequency: c.frequency,
            monetary: c.monetary,
            avgOrderValue: c.avgOrderValue
          }
        }))
      }))
    };
    
    return JSON.stringify(results, null, 2);
  }

  /**
   * Sales Forecasting - Linear Regression với Seasonal Decomposition
   */
  async forecastSales(salesData, forecastPeriods = 30) {
    try {
      // Prepare time series data
      const timeSeriesData = this.prepareSalesTimeSeriesData(salesData);

      // Detect seasonality and trends
      const decomposition = this.decomposeTimeSeries(timeSeriesData);

      // Apply linear regression
      const forecast = this.linearRegressionForecast(decomposition, forecastPeriods);

      // Calculate confidence intervals
      const confidenceIntervals = this.calculateConfidenceIntervals(forecast, timeSeriesData);

      return {
        forecast: forecast,
        confidence: confidenceIntervals,
        trends: decomposition.trend,
        seasonality: decomposition.seasonal,
        accuracy: this.calculateForecastAccuracy(timeSeriesData),
        insights: this.generateForecastInsights(forecast, decomposition)
      };
    } catch (error) {
      console.error('Sales forecasting error:', error);
      throw error;
    }
  }

  /**
   * Chuẩn bị dữ liệu time series cho forecasting
   */
  prepareSalesTimeSeriesData(salesData) {
    // Group sales by date
    const dailySales = new Map();

    salesData.forEach(sale => {
      const date = new Date(sale.date).toISOString().split('T')[0];
      if (!dailySales.has(date)) {
        dailySales.set(date, { date, revenue: 0, orders: 0, items: 0 });
      }

      const dayData = dailySales.get(date);
      dayData.revenue += sale.total || 0;
      dayData.orders += 1;
      dayData.items += sale.items?.length || 0;
    });

    // Convert to sorted array
    const sortedData = Array.from(dailySales.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Fill missing dates
    const filledData = this.fillMissingDates(sortedData);

    return filledData.map((item, index) => ({
      ...item,
      dayIndex: index,
      dayOfWeek: new Date(item.date).getDay(),
      dayOfMonth: new Date(item.date).getDate(),
      month: new Date(item.date).getMonth(),
      quarter: Math.floor(new Date(item.date).getMonth() / 3)
    }));
  }

  /**
   * Điền các ngày thiếu trong time series
   */
  fillMissingDates(data) {
    if (data.length === 0) return [];

    const filled = [];
    const startDate = new Date(data[0].date);
    const endDate = new Date(data[data.length - 1].date);

    const dataMap = new Map(data.map(d => [d.date, d]));

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (dataMap.has(dateStr)) {
        filled.push(dataMap.get(dateStr));
      } else {
        filled.push({
          date: dateStr,
          revenue: 0,
          orders: 0,
          items: 0
        });
      }
    }

    return filled;
  }

  /**
   * Phân tích seasonal decomposition
   */
  decomposeTimeSeries(data) {
    const values = data.map(d => d.revenue);
    const n = values.length;

    // Calculate trend using moving average
    const trendWindow = Math.min(7, Math.floor(n / 4)); // 7-day moving average
    const trend = this.calculateMovingAverage(values, trendWindow);

    // Calculate seasonal component (weekly pattern)
    const seasonal = this.calculateSeasonalComponent(data, trend);

    // Calculate residual
    const residual = values.map((value, index) =>
      value - (trend[index] || 0) - (seasonal[index] || 0)
    );

    return {
      original: values,
      trend: trend,
      seasonal: seasonal,
      residual: residual
    };
  }

  /**
   * Tính moving average
   */
  calculateMovingAverage(values, window) {
    const result = [];
    const halfWindow = Math.floor(window / 2);

    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(values.length, i + halfWindow + 1);
      const slice = values.slice(start, end);
      const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      result.push(average);
    }

    return result;
  }

  /**
   * Tính seasonal component (weekly pattern)
   */
  calculateSeasonalComponent(data, trend) {
    const seasonal = new Array(data.length).fill(0);
    const weeklyPattern = new Array(7).fill(0);
    const weeklyCount = new Array(7).fill(0);

    // Calculate average for each day of week
    data.forEach((item, index) => {
      const dayOfWeek = item.dayOfWeek;
      const detrended = item.revenue - (trend[index] || 0);
      weeklyPattern[dayOfWeek] += detrended;
      weeklyCount[dayOfWeek]++;
    });

    // Normalize weekly pattern
    for (let i = 0; i < 7; i++) {
      if (weeklyCount[i] > 0) {
        weeklyPattern[i] /= weeklyCount[i];
      }
    }

    // Apply pattern to all data points
    data.forEach((item, index) => {
      seasonal[index] = weeklyPattern[item.dayOfWeek];
    });

    return seasonal;
  }

  /**
   * Linear regression forecasting
   */
  linearRegressionForecast(decomposition, periods) {
    const { trend, seasonal } = decomposition;
    const n = trend.length;

    // Fit linear regression to trend
    const x = Array.from({ length: n }, (_, i) => i);
    const y = trend;

    const { slope, intercept } = this.linearRegression(x, y);

    // Generate forecast
    const forecast = [];
    for (let i = 0; i < periods; i++) {
      const futureIndex = n + i;
      const trendValue = slope * futureIndex + intercept;

      // Add seasonal component (repeat weekly pattern)
      const seasonalIndex = i % 7;
      const avgSeasonal = seasonal.length > 0
        ? seasonal.filter((_, idx) => idx % 7 === seasonalIndex)
            .reduce((sum, val) => sum + val, 0) / Math.max(1, Math.floor(seasonal.length / 7))
        : 0;

      const forecastValue = Math.max(0, trendValue + avgSeasonal);

      forecast.push({
        date: this.addDays(new Date(), i + 1).toISOString().split('T')[0],
        predicted: forecastValue,
        trend: trendValue,
        seasonal: avgSeasonal
      });
    }

    return forecast;
  }

  /**
   * Linear regression calculation
   */
  linearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Tính confidence intervals
   */
  calculateConfidenceIntervals(forecast, historicalData) {
    const historicalValues = historicalData.map(d => d.revenue);
    const mean = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
    const variance = historicalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalValues.length;
    const stdDev = Math.sqrt(variance);

    return forecast.map(item => ({
      ...item,
      lowerBound: Math.max(0, item.predicted - 1.96 * stdDev),
      upperBound: item.predicted + 1.96 * stdDev,
      confidence: 95
    }));
  }

  /**
   * Tính độ chính xác của forecast
   */
  calculateForecastAccuracy(data) {
    if (data.length < 14) return { mape: 0, rmse: 0, mae: 0 };

    // Use last 7 days for validation
    const trainData = data.slice(0, -7);
    const testData = data.slice(-7);

    // Simple forecast for validation
    const lastWeekAvg = trainData.slice(-7).reduce((sum, d) => sum + d.revenue, 0) / 7;

    let mape = 0, rmse = 0, mae = 0;

    testData.forEach(actual => {
      const predicted = lastWeekAvg;
      const error = Math.abs(actual.revenue - predicted);
      const percentError = actual.revenue > 0 ? (error / actual.revenue) * 100 : 0;

      mape += percentError;
      rmse += Math.pow(error, 2);
      mae += error;
    });

    return {
      mape: mape / testData.length,
      rmse: Math.sqrt(rmse / testData.length),
      mae: mae / testData.length
    };
  }

  /**
   * Tạo insights cho forecast
   */
  generateForecastInsights(forecast, decomposition) {
    const insights = [];

    // Trend analysis
    const trendSlope = decomposition.trend.length > 1
      ? decomposition.trend[decomposition.trend.length - 1] - decomposition.trend[0]
      : 0;

    if (trendSlope > 0) {
      insights.push({
        type: 'trend',
        title: 'Xu hướng tăng trưởng tích cực',
        description: `Doanh thu có xu hướng tăng ${(trendSlope / decomposition.trend[0] * 100).toFixed(1)}%`,
        impact: 'positive'
      });
    } else if (trendSlope < 0) {
      insights.push({
        type: 'trend',
        title: 'Xu hướng giảm cần chú ý',
        description: `Doanh thu có xu hướng giảm ${Math.abs(trendSlope / decomposition.trend[0] * 100).toFixed(1)}%`,
        impact: 'negative'
      });
    }

    // Seasonal patterns
    const avgForecast = forecast.reduce((sum, f) => sum + f.predicted, 0) / forecast.length;
    const peakDays = forecast.filter(f => f.predicted > avgForecast * 1.1);

    if (peakDays.length > 0) {
      insights.push({
        type: 'seasonality',
        title: 'Ngày cao điểm dự kiến',
        description: `${peakDays.length} ngày trong dự báo có doanh thu cao hơn trung bình`,
        impact: 'opportunity'
      });
    }

    return insights;
  }

  /**
   * Utility function to add days to date
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Product Recommendation Engine - Collaborative Filtering
   */
  async generateProductRecommendations(userId, products, orders, options = {}) {
    try {
      const {
        maxRecommendations = 10,
        includePopular = true,
        includeSimilar = true,
        includePersonalized = true
      } = options;

      const recommendations = [];

      // 1. Collaborative Filtering - Users who bought this also bought
      if (includePersonalized) {
        const collaborativeRecs = this.collaborativeFiltering(userId, orders, products);
        recommendations.push(...collaborativeRecs.slice(0, 4));
      }

      // 2. Content-based filtering - Similar products
      if (includeSimilar) {
        const userHistory = this.getUserPurchaseHistory(userId, orders);
        const contentRecs = this.contentBasedFiltering(userHistory, products);
        recommendations.push(...contentRecs.slice(0, 3));
      }

      // 3. Popular products
      if (includePopular) {
        const popularRecs = this.getPopularProducts(products, orders);
        recommendations.push(...popularRecs.slice(0, 3));
      }

      // Remove duplicates and score
      const uniqueRecs = this.deduplicateAndScore(recommendations);

      return {
        recommendations: uniqueRecs.slice(0, maxRecommendations),
        strategies: {
          collaborative: includePersonalized,
          contentBased: includeSimilar,
          popularity: includePopular
        },
        insights: this.generateRecommendationInsights(uniqueRecs)
      };
    } catch (error) {
      console.error('Recommendation generation error:', error);
      throw error;
    }
  }

  /**
   * Collaborative Filtering Algorithm
   */
  collaborativeFiltering(targetUserId, orders, products) {
    // Create user-item matrix
    const userItemMatrix = this.createUserItemMatrix(orders);

    // Find similar users
    const similarUsers = this.findSimilarUsers(targetUserId, userItemMatrix);

    // Get recommendations based on similar users' purchases
    const recommendations = [];
    const targetUserItems = userItemMatrix.get(targetUserId) || new Set();

    similarUsers.forEach(({ userId, similarity }) => {
      const userItems = userItemMatrix.get(userId) || new Set();

      userItems.forEach(productId => {
        if (!targetUserItems.has(productId)) {
          const product = products.find(p => p.id === productId);
          if (product) {
            recommendations.push({
              product,
              score: similarity,
              reason: 'Khách hàng tương tự cũng mua',
              strategy: 'collaborative'
            });
          }
        }
      });
    });

    return recommendations;
  }

  /**
   * Content-based Filtering
   */
  contentBasedFiltering(userHistory, products) {
    if (userHistory.length === 0) return [];

    const recommendations = [];
    const userPreferences = this.analyzeUserPreferences(userHistory);

    products.forEach(product => {
      // Skip if user already bought this product
      if (userHistory.some(h => h.productId === product.id)) return;

      const similarity = this.calculateProductSimilarity(product, userPreferences);

      if (similarity > 0.3) { // Threshold for similarity
        recommendations.push({
          product,
          score: similarity,
          reason: 'Phù hợp với sở thích của bạn',
          strategy: 'content-based'
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Get popular products
   */
  getPopularProducts(products, orders) {
    const productStats = new Map();

    // Calculate product popularity
    orders.forEach(order => {
      order.items?.forEach(item => {
        const stats = productStats.get(item.productId) || {
          count: 0,
          revenue: 0,
          customers: new Set()
        };

        stats.count += item.quantity || 1;
        stats.revenue += (item.price || 0) * (item.quantity || 1);
        stats.customers.add(order.customerId);

        productStats.set(item.productId, stats);
      });
    });

    // Score products by popularity
    const recommendations = [];
    products.forEach(product => {
      const stats = productStats.get(product.id);
      if (stats) {
        const popularityScore = (
          stats.count * 0.4 +
          stats.customers.size * 0.4 +
          (stats.revenue / 1000000) * 0.2
        );

        recommendations.push({
          product,
          score: popularityScore,
          reason: `${stats.customers.size} khách hàng đã mua`,
          strategy: 'popularity'
        });
      }
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Create user-item interaction matrix
   */
  createUserItemMatrix(orders) {
    const matrix = new Map();

    orders.forEach(order => {
      const userId = order.customerId;
      if (!matrix.has(userId)) {
        matrix.set(userId, new Set());
      }

      order.items?.forEach(item => {
        matrix.get(userId).add(item.productId);
      });
    });

    return matrix;
  }

  /**
   * Find users similar to target user
   */
  findSimilarUsers(targetUserId, userItemMatrix, maxSimilar = 10) {
    const targetItems = userItemMatrix.get(targetUserId) || new Set();
    const similarities = [];

    userItemMatrix.forEach((userItems, userId) => {
      if (userId === targetUserId) return;

      const similarity = this.calculateJaccardSimilarity(targetItems, userItems);
      if (similarity > 0) {
        similarities.push({ userId, similarity });
      }
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxSimilar);
  }

  /**
   * Calculate Jaccard similarity between two sets
   */
  calculateJaccardSimilarity(setA, setB) {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Get user purchase history
   */
  getUserPurchaseHistory(userId, orders) {
    const history = [];

    orders
      .filter(order => order.customerId === userId)
      .forEach(order => {
        order.items?.forEach(item => {
          history.push({
            productId: item.productId,
            quantity: item.quantity || 1,
            price: item.price || 0,
            date: order.date
          });
        });
      });

    return history;
  }

  /**
   * Analyze user preferences from purchase history
   */
  analyzeUserPreferences(userHistory) {
    const preferences = {
      categories: new Map(),
      priceRange: { min: Infinity, max: 0, avg: 0 },
      brands: new Map(),
      totalSpent: 0,
      totalItems: 0
    };

    userHistory.forEach(item => {
      // Category preferences
      const category = item.product?.category || 'unknown';
      preferences.categories.set(category,
        (preferences.categories.get(category) || 0) + item.quantity
      );

      // Price preferences
      const price = item.price;
      preferences.priceRange.min = Math.min(preferences.priceRange.min, price);
      preferences.priceRange.max = Math.max(preferences.priceRange.max, price);
      preferences.totalSpent += price * item.quantity;
      preferences.totalItems += item.quantity;

      // Brand preferences
      const brand = item.product?.brand || 'unknown';
      preferences.brands.set(brand,
        (preferences.brands.get(brand) || 0) + item.quantity
      );
    });

    preferences.priceRange.avg = preferences.totalItems > 0
      ? preferences.totalSpent / preferences.totalItems
      : 0;

    return preferences;
  }

  /**
   * Calculate similarity between product and user preferences
   */
  calculateProductSimilarity(product, userPreferences) {
    let similarity = 0;

    // Category similarity
    const categoryScore = userPreferences.categories.get(product.category) || 0;
    const maxCategoryScore = Math.max(...userPreferences.categories.values());
    if (maxCategoryScore > 0) {
      similarity += (categoryScore / maxCategoryScore) * 0.4;
    }

    // Price similarity
    const productPrice = product.price || 0;
    const avgPrice = userPreferences.priceRange.avg;
    if (avgPrice > 0) {
      const priceDiff = Math.abs(productPrice - avgPrice) / avgPrice;
      const priceScore = Math.max(0, 1 - priceDiff);
      similarity += priceScore * 0.3;
    }

    // Brand similarity
    const brandScore = userPreferences.brands.get(product.brand) || 0;
    const maxBrandScore = Math.max(...userPreferences.brands.values());
    if (maxBrandScore > 0) {
      similarity += (brandScore / maxBrandScore) * 0.3;
    }

    return Math.min(1, similarity);
  }

  /**
   * Remove duplicates and calculate final scores
   */
  deduplicateAndScore(recommendations) {
    const productMap = new Map();

    recommendations.forEach(rec => {
      const productId = rec.product.id;

      if (!productMap.has(productId)) {
        productMap.set(productId, rec);
      } else {
        // Combine scores from different strategies
        const existing = productMap.get(productId);
        existing.score = Math.max(existing.score, rec.score);
        existing.reason += `, ${rec.reason}`;
      }
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Generate insights for recommendations
   */
  generateRecommendationInsights(recommendations) {
    const insights = [];

    // Strategy distribution
    const strategies = recommendations.reduce((acc, rec) => {
      acc[rec.strategy] = (acc[rec.strategy] || 0) + 1;
      return acc;
    }, {});

    insights.push({
      type: 'strategy_distribution',
      title: 'Phân bố chiến lược gợi ý',
      data: strategies
    });

    // Average score
    const avgScore = recommendations.length > 0
      ? recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length
      : 0;

    insights.push({
      type: 'confidence',
      title: 'Độ tin cậy trung bình',
      value: (avgScore * 100).toFixed(1),
      description: 'Mức độ phù hợp của các gợi ý'
    });

    return insights;
  }

  /**
   * Get real-time recommendations for POS
   */
  async getRealtimeRecommendations(currentCart, customerId = null) {
    try {
      const recommendations = [];

      // Cross-sell: Products frequently bought together
      if (currentCart.length > 0) {
        const crossSellRecs = this.getCrossSellRecommendations(currentCart);
        recommendations.push(...crossSellRecs);
      }

      // Upsell: Higher value alternatives
      if (currentCart.length > 0) {
        const upsellRecs = this.getUpsellRecommendations(currentCart);
        recommendations.push(...upsellRecs);
      }

      // Customer-specific recommendations
      if (customerId) {
        const personalRecs = await this.getPersonalizedRecommendations(customerId);
        recommendations.push(...personalRecs.slice(0, 3));
      }

      return {
        recommendations: recommendations.slice(0, 6),
        type: 'realtime',
        context: {
          cartSize: currentCart.length,
          hasCustomer: !!customerId
        }
      };
    } catch (error) {
      console.error('Realtime recommendation error:', error);
      return { recommendations: [], type: 'realtime' };
    }
  }

  /**
   * Cross-sell recommendations
   */
  getCrossSellRecommendations(currentCart) {
    // This would typically use market basket analysis
    // For now, return category-based suggestions
    const recommendations = [];
    const cartCategories = new Set(currentCart.map(item => item.category));

    // Suggest complementary categories
    const complementaryMap = {
      'electronics': ['accessories', 'cables'],
      'clothing': ['shoes', 'accessories'],
      'food': ['beverages', 'snacks'],
      'books': ['stationery', 'bookmarks']
    };

    cartCategories.forEach(category => {
      const complements = complementaryMap[category] || [];
      complements.forEach(complement => {
        recommendations.push({
          category: complement,
          reason: `Phù hợp với ${category}`,
          strategy: 'cross-sell',
          score: 0.7
        });
      });
    });

    return recommendations;
  }

  /**
   * Upsell recommendations
   */
  getUpsellRecommendations(currentCart) {
    const recommendations = [];

    currentCart.forEach(item => {
      // Suggest premium version (20-50% higher price)
      const upsellPrice = item.price * 1.3;
      recommendations.push({
        category: item.category,
        priceRange: [upsellPrice, upsellPrice * 1.5],
        reason: 'Phiên bản cao cấp hơn',
        strategy: 'upsell',
        score: 0.6
      });
    });

    return recommendations;
  }

  /**
   * Price Optimization - Dynamic Pricing Algorithm
   */
  async optimizePricing(products, orders, marketData = {}, options = {}) {
    try {
      const {
        strategy = 'profit_maximization', // 'profit_maximization', 'market_penetration', 'competitive'
        elasticityThreshold = 0.5,
        maxPriceChange = 0.2, // Maximum 20% price change
        considerSeasonality = true
      } = options;

      const optimizedPrices = [];

      for (const product of products) {
        const analysis = this.analyzeProductPricing(product, orders, marketData);
        const optimization = this.calculateOptimalPrice(product, analysis, strategy, {
          elasticityThreshold,
          maxPriceChange,
          considerSeasonality
        });

        optimizedPrices.push({
          product,
          currentPrice: product.price,
          optimizedPrice: optimization.price,
          priceChange: optimization.change,
          expectedImpact: optimization.impact,
          confidence: optimization.confidence,
          reasoning: optimization.reasoning
        });
      }

      return {
        optimizations: optimizedPrices.sort((a, b) => b.expectedImpact.profit - a.expectedImpact.profit),
        strategy,
        summary: this.generatePricingOptimizationSummary(optimizedPrices),
        insights: this.generatePricingInsights(optimizedPrices, strategy)
      };
    } catch (error) {
      console.error('Price optimization error:', error);
      throw error;
    }
  }

  /**
   * Analyze product pricing performance
   */
  analyzeProductPricing(product, orders, marketData) {
    const productOrders = orders.filter(order =>
      order.items?.some(item => item.productId === product.id)
    );

    // Calculate demand elasticity
    const elasticity = this.calculatePriceElasticity(product, productOrders);

    // Calculate sales metrics
    const salesMetrics = this.calculateSalesMetrics(product, productOrders);

    // Analyze competition
    const competitiveAnalysis = this.analyzeCompetition(product, marketData);

    // Seasonal analysis
    const seasonalAnalysis = this.analyzeSeasonality(product, productOrders);

    return {
      elasticity,
      salesMetrics,
      competitiveAnalysis,
      seasonalAnalysis,
      currentPerformance: this.assessCurrentPerformance(salesMetrics, elasticity)
    };
  }

  /**
   * Calculate price elasticity of demand
   */
  calculatePriceElasticity(product, orders) {
    if (orders.length < 10) {
      return { elasticity: -1, confidence: 'low', dataPoints: orders.length };
    }

    // Group orders by time periods and calculate average price and quantity
    const periods = this.groupOrdersByPeriod(orders, 'week');

    if (periods.length < 3) {
      return { elasticity: -1, confidence: 'low', dataPoints: periods.length };
    }

    // Calculate elasticity using log-log regression
    const priceChanges = [];
    const quantityChanges = [];

    for (let i = 1; i < periods.length; i++) {
      const prevPeriod = periods[i - 1];
      const currPeriod = periods[i];

      if (prevPeriod.avgPrice > 0 && currPeriod.avgPrice > 0) {
        const priceChange = (currPeriod.avgPrice - prevPeriod.avgPrice) / prevPeriod.avgPrice;
        const quantityChange = (currPeriod.quantity - prevPeriod.quantity) / prevPeriod.quantity;

        if (Math.abs(priceChange) > 0.01) { // Only consider significant price changes
          priceChanges.push(priceChange);
          quantityChanges.push(quantityChange);
        }
      }
    }

    if (priceChanges.length < 2) {
      return { elasticity: -1, confidence: 'low', dataPoints: priceChanges.length };
    }

    // Simple elasticity calculation
    const avgPriceChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    const avgQuantityChange = quantityChanges.reduce((sum, change) => sum + change, 0) / quantityChanges.length;

    const elasticity = avgPriceChange !== 0 ? avgQuantityChange / avgPriceChange : -1;

    return {
      elasticity: Math.abs(elasticity),
      confidence: priceChanges.length >= 5 ? 'high' : 'medium',
      dataPoints: priceChanges.length,
      interpretation: this.interpretElasticity(elasticity)
    };
  }

  /**
   * Group orders by time period
   */
  groupOrdersByPeriod(orders, period = 'week') {
    const groups = new Map();

    orders.forEach(order => {
      const date = new Date(order.date);
      let key;

      if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (period === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groups.has(key)) {
        groups.set(key, { orders: [], totalRevenue: 0, quantity: 0 });
      }

      const group = groups.get(key);
      group.orders.push(order);

      order.items?.forEach(item => {
        if (item.productId === order.productId) {
          group.totalRevenue += (item.price || 0) * (item.quantity || 1);
          group.quantity += item.quantity || 1;
        }
      });
    });

    // Calculate averages
    return Array.from(groups.entries()).map(([key, data]) => ({
      period: key,
      ...data,
      avgPrice: data.quantity > 0 ? data.totalRevenue / data.quantity : 0
    })).sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Calculate sales metrics
   */
  calculateSalesMetrics(product, orders) {
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + order.items?.reduce((itemSum, item) => {
        return item.productId === product.id
          ? itemSum + (item.price || 0) * (item.quantity || 1)
          : itemSum;
      }, 0) || 0;
    }, 0);

    const totalQuantity = orders.reduce((sum, order) => {
      return sum + order.items?.reduce((itemSum, item) => {
        return item.productId === product.id
          ? itemSum + (item.quantity || 1)
          : itemSum;
      }, 0) || 0;
    }, 0);

    const avgOrderValue = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;
    const salesVelocity = this.calculateSalesVelocity(orders);

    return {
      totalRevenue,
      totalQuantity,
      avgOrderValue,
      salesVelocity,
      profitMargin: this.estimateProfitMargin(product, avgOrderValue)
    };
  }

  /**
   * Calculate sales velocity (units per day)
   */
  calculateSalesVelocity(orders) {
    if (orders.length === 0) return 0;

    const firstOrder = new Date(Math.min(...orders.map(o => new Date(o.date))));
    const lastOrder = new Date(Math.max(...orders.map(o => new Date(o.date))));
    const daysDiff = Math.max(1, (lastOrder - firstOrder) / (1000 * 60 * 60 * 24));

    const totalQuantity = orders.reduce((sum, order) => {
      return sum + order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0) || 0;
    }, 0);

    return totalQuantity / daysDiff;
  }

  /**
   * Estimate profit margin
   */
  estimateProfitMargin(product, avgSellingPrice) {
    // Simplified profit margin estimation
    const estimatedCost = product.cost || (avgSellingPrice * 0.6); // Assume 40% margin if no cost data
    return avgSellingPrice > 0 ? (avgSellingPrice - estimatedCost) / avgSellingPrice : 0;
  }

  /**
   * Analyze competition
   */
  analyzeCompetition(product, marketData) {
    const competitorPrices = marketData.competitors?.[product.category] || [];

    if (competitorPrices.length === 0) {
      return {
        position: 'unknown',
        avgCompetitorPrice: 0,
        priceAdvantage: 0,
        recommendation: 'Cần thêm dữ liệu thị trường'
      };
    }

    const avgCompetitorPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;
    const priceAdvantage = (product.price - avgCompetitorPrice) / avgCompetitorPrice;

    let position;
    if (priceAdvantage > 0.1) position = 'premium';
    else if (priceAdvantage < -0.1) position = 'discount';
    else position = 'competitive';

    return {
      position,
      avgCompetitorPrice,
      priceAdvantage,
      competitorCount: competitorPrices.length,
      recommendation: this.getCompetitiveRecommendation(position, priceAdvantage)
    };
  }

  /**
   * Analyze seasonality
   */
  analyzeSeasonality(product, orders) {
    const monthlyData = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);

    orders.forEach(order => {
      const month = new Date(order.date).getMonth();
      order.items?.forEach(item => {
        if (item.productId === product.id) {
          monthlyData[month] += item.quantity || 1;
          monthlyCounts[month]++;
        }
      });
    });

    const avgSales = monthlyData.reduce((sum, sales) => sum + sales, 0) / 12;
    const seasonalityIndex = monthlyData.map(sales => avgSales > 0 ? sales / avgSales : 1);

    const currentMonth = new Date().getMonth();
    const currentSeasonality = seasonalityIndex[currentMonth];

    return {
      monthlyData,
      seasonalityIndex,
      currentSeasonality,
      peakMonths: seasonalityIndex
        .map((index, month) => ({ month, index }))
        .filter(item => item.index > 1.2)
        .map(item => item.month),
      lowMonths: seasonalityIndex
        .map((index, month) => ({ month, index }))
        .filter(item => item.index < 0.8)
        .map(item => item.month)
    };
  }

  /**
   * Calculate optimal price
   */
  calculateOptimalPrice(product, analysis, strategy, options) {
    const { elasticityThreshold, maxPriceChange, considerSeasonality } = options;
    const currentPrice = product.price;

    let optimalPrice = currentPrice;
    let reasoning = [];

    // Strategy-based optimization
    if (strategy === 'profit_maximization') {
      optimalPrice = this.optimizeForProfit(product, analysis, currentPrice);
      reasoning.push('Tối ưu hóa lợi nhuận');
    } else if (strategy === 'market_penetration') {
      optimalPrice = this.optimizeForMarketShare(product, analysis, currentPrice);
      reasoning.push('Tăng thị phần');
    } else if (strategy === 'competitive') {
      optimalPrice = this.optimizeForCompetition(product, analysis, currentPrice);
      reasoning.push('Cạnh tranh thị trường');
    }

    // Apply seasonality adjustment
    if (considerSeasonality && analysis.seasonalAnalysis.currentSeasonality !== 1) {
      const seasonalAdjustment = analysis.seasonalAnalysis.currentSeasonality;
      optimalPrice *= seasonalAdjustment;
      reasoning.push(`Điều chỉnh theo mùa (${(seasonalAdjustment * 100).toFixed(0)}%)`);
    }

    // Apply constraints
    const maxChange = currentPrice * maxPriceChange;
    optimalPrice = Math.max(currentPrice - maxChange, Math.min(currentPrice + maxChange, optimalPrice));

    const priceChange = (optimalPrice - currentPrice) / currentPrice;

    return {
      price: Math.round(optimalPrice),
      change: priceChange,
      impact: this.calculatePriceChangeImpact(product, analysis, priceChange),
      confidence: this.calculateOptimizationConfidence(analysis),
      reasoning: reasoning.join(', ')
    };
  }

  /**
   * Optimize for profit maximization
   */
  optimizeForProfit(product, analysis, currentPrice) {
    const { elasticity } = analysis.elasticity;
    const { profitMargin } = analysis.salesMetrics;

    if (elasticity.confidence === 'low') {
      // Conservative approach when data is limited
      return profitMargin < 0.3 ? currentPrice * 1.05 : currentPrice;
    }

    // Use elasticity to find profit-maximizing price
    if (elasticity.elasticity < 1) {
      // Inelastic demand - can increase price
      return currentPrice * 1.1;
    } else {
      // Elastic demand - be more careful
      return currentPrice * 1.02;
    }
  }

  /**
   * Optimize for market penetration
   */
  optimizeForMarketShare(product, analysis, currentPrice) {
    const { position, avgCompetitorPrice } = analysis.competitiveAnalysis;

    if (position === 'premium') {
      return Math.min(currentPrice * 0.95, avgCompetitorPrice * 0.98);
    } else if (position === 'discount') {
      return currentPrice * 1.02; // Slight increase while maintaining advantage
    } else {
      return avgCompetitorPrice * 0.95; // Undercut competition slightly
    }
  }

  /**
   * Optimize for competitive positioning
   */
  optimizeForCompetition(product, analysis, currentPrice) {
    const { avgCompetitorPrice } = analysis.competitiveAnalysis;

    if (avgCompetitorPrice > 0) {
      return avgCompetitorPrice; // Match competitor pricing
    }

    return currentPrice; // No change if no competitor data
  }

  /**
   * Calculate impact of price change
   */
  calculatePriceChangeImpact(product, analysis, priceChange) {
    const { elasticity } = analysis.elasticity;
    const { totalRevenue, totalQuantity } = analysis.salesMetrics;

    // Estimate quantity change based on elasticity
    const quantityChange = -elasticity.elasticity * priceChange;
    const newQuantity = totalQuantity * (1 + quantityChange);
    const newPrice = product.price * (1 + priceChange);
    const newRevenue = newQuantity * newPrice;

    return {
      revenueChange: newRevenue - totalRevenue,
      quantityChange: newQuantity - totalQuantity,
      profit: (newRevenue - totalRevenue) * 0.4, // Simplified profit calculation
      marketShare: quantityChange > 0 ? 'increase' : 'decrease'
    };
  }

  /**
   * Calculate optimization confidence
   */
  calculateOptimizationConfidence(analysis) {
    let confidence = 0;

    // Elasticity data quality
    if (analysis.elasticity.confidence === 'high') confidence += 0.4;
    else if (analysis.elasticity.confidence === 'medium') confidence += 0.2;

    // Sales data volume
    if (analysis.salesMetrics.totalQuantity > 100) confidence += 0.3;
    else if (analysis.salesMetrics.totalQuantity > 20) confidence += 0.2;
    else confidence += 0.1;

    // Competitive data
    if (analysis.competitiveAnalysis.competitorCount > 3) confidence += 0.2;
    else if (analysis.competitiveAnalysis.competitorCount > 0) confidence += 0.1;

    // Seasonality data
    if (analysis.seasonalAnalysis.monthlyData.some(data => data > 0)) confidence += 0.1;

    return Math.min(1, confidence);
  }

  /**
   * Generate pricing optimization summary
   */
  generatePricingOptimizationSummary(optimizations) {
    const totalProducts = optimizations.length;
    const priceIncreases = optimizations.filter(opt => opt.priceChange > 0).length;
    const priceDecreases = optimizations.filter(opt => opt.priceChange < 0).length;
    const noChange = totalProducts - priceIncreases - priceDecreases;

    const totalRevenueImpact = optimizations.reduce((sum, opt) =>
      sum + opt.expectedImpact.revenueChange, 0
    );

    return {
      totalProducts,
      priceIncreases,
      priceDecreases,
      noChange,
      totalRevenueImpact,
      avgPriceChange: optimizations.reduce((sum, opt) => sum + opt.priceChange, 0) / totalProducts
    };
  }

  /**
   * Generate pricing insights
   */
  generatePricingInsights(optimizations, strategy) {
    const insights = [];

    // Strategy-specific insights
    if (strategy === 'profit_maximization') {
      const profitableOptimizations = optimizations.filter(opt => opt.expectedImpact.profit > 0);
      insights.push({
        type: 'profit_opportunity',
        title: 'Cơ hội tăng lợi nhuận',
        description: `${profitableOptimizations.length} sản phẩm có thể tăng giá để tối ưu lợi nhuận`,
        value: profitableOptimizations.length
      });
    }

    // High-impact opportunities
    const highImpactOpts = optimizations.filter(opt =>
      Math.abs(opt.expectedImpact.revenueChange) > 1000000
    );

    if (highImpactOpts.length > 0) {
      insights.push({
        type: 'high_impact',
        title: 'Sản phẩm có tác động cao',
        description: `${highImpactOpts.length} sản phẩm có tiềm năng tác động lớn đến doanh thu`,
        value: highImpactOpts.length
      });
    }

    return insights;
  }

  /**
   * Helper methods
   */
  interpretElasticity(elasticity) {
    if (Math.abs(elasticity) < 0.5) return 'Không đàn hồi - có thể tăng giá';
    if (Math.abs(elasticity) < 1) return 'Ít đàn hồi - thận trọng khi thay đổi giá';
    return 'Đàn hồi cao - nhạy cảm với thay đổi giá';
  }

  getCompetitiveRecommendation(position, advantage) {
    if (position === 'premium') return 'Duy trì vị thế cao cấp hoặc giảm giá để cạnh tranh';
    if (position === 'discount') return 'Tận dụng lợi thế giá hoặc tăng giá để cải thiện margin';
    return 'Vị thế cạnh tranh tốt, có thể điều chỉnh nhẹ';
  }

  assessCurrentPerformance(salesMetrics, elasticity) {
    const { salesVelocity, profitMargin } = salesMetrics;

    if (salesVelocity > 10 && profitMargin > 0.3) return 'excellent';
    if (salesVelocity > 5 && profitMargin > 0.2) return 'good';
    if (salesVelocity > 1 && profitMargin > 0.1) return 'average';
    return 'poor';
  }
}

// Export singleton instance
export default new AIService();
