import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Button, Space, Typography, Tabs, Table, Tag,
  Progress, Alert, List, Avatar, Tooltip, Badge, Timeline,
  Form, Input, Select, Slider, Switch, Divider, Statistic,
  Modal, Drawer, Upload, message, Spin
} from 'antd';
import {
  RobotOutlined, BulbOutlined, ThunderboltOutlined, AimOutlined,
  LineChartOutlined, UserOutlined, ShoppingCartOutlined, DollarOutlined,
  FireOutlined, StarOutlined, TrophyOutlined, RocketOutlined,
  EyeOutlined, ExperimentOutlined, SettingOutlined,
  CloudUploadOutlined, DownloadOutlined, PlayCircleOutlined,
  PauseCircleOutlined, ReloadOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { Line, Column, Scatter, Heatmap, Gauge } from '@ant-design/plots';
import { api } from '../services/api';
import dayjs from 'dayjs';

import CustomerSegmentation from '../components/AI/CustomerSegmentation';
import SalesForecasting from '../components/AI/SalesForecasting';
import ProductRecommendation from '../components/AI/ProductRecommendation';
import PriceOptimization from '../components/AI/PriceOptimization';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const AIFeatures = () => {
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState('recommendation');
  const [modelStatus, setModelStatus] = useState({});
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [customerInsights, setCustomerInsights] = useState([]);
  const [priceOptimization, setPriceOptimization] = useState([]);
  const [demandForecasting, setDemandForecasting] = useState([]);
  const [anomalyDetection, setAnomalyDetection] = useState([]);
  const [chatbotMetrics, setChatbotMetrics] = useState({});
  const [aiSettings, setAiSettings] = useState({});
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadModelStatus(),
        loadRecommendations(),
        loadCustomerInsights(),
        loadPriceOptimization(),
        loadDemandForecasting(),
        loadAnomalyDetection(),
        loadChatbotMetrics(),
        loadAISettings()
      ]);
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModelStatus = async () => {
    try {
      const response = await api.get('/ai/models/status');
      if (response.data.success) {
        setModelStatus(response.data.data);
      }
    } catch (error) {
      // Mock data
      setModelStatus({
        recommendation: { status: 'active', accuracy: 87.5, lastTrained: '2024-03-10' },
        demand_forecasting: { status: 'active', accuracy: 92.3, lastTrained: '2024-03-08' },
        price_optimization: { status: 'training', accuracy: 85.1, lastTrained: '2024-03-05' },
        customer_segmentation: { status: 'active', accuracy: 89.7, lastTrained: '2024-03-12' },
        anomaly_detection: { status: 'active', accuracy: 94.2, lastTrained: '2024-03-11' },
        chatbot: { status: 'active', accuracy: 91.8, lastTrained: '2024-03-09' }
      });
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await api.get('/ai/recommendations');
      if (response.data.success) {
        setRecommendations(response.data.data);
      }
    } catch (error) {
      // Mock data
      setRecommendations([
        {
          type: 'product_recommendation',
          title: 'Khuyến nghị sản phẩm cho khách hàng VIP',
          description: 'Khách hàng Nguyễn Văn A có 85% khả năng mua Cà phê premium',
          confidence: 85,
          impact: 'high',
          action: 'Gửi offer đặc biệt',
          customer: 'Nguyễn Văn A',
          product: 'Cà phê premium'
        },
        {
          type: 'cross_sell',
          title: 'Cơ hội bán chéo',
          description: 'Khách mua Coca Cola có 70% khả năng mua snacks',
          confidence: 70,
          impact: 'medium',
          action: 'Đặt snacks gần khu vực nước uống',
          customer: null,
          product: 'Snacks combo'
        },
        {
          type: 'upsell',
          title: 'Cơ hội nâng cấp',
          description: 'Khách hàng thường có thể nâng cấp lên Premium',
          confidence: 65,
          impact: 'high',
          action: 'Chương trình loyalty đặc biệt',
          customer: 'Segment Regular',
          product: 'Premium membership'
        }
      ]);
    }
  };

  const loadCustomerInsights = async () => {
    try {
      const response = await api.get('/ai/customer-insights');
      if (response.data.success) {
        setCustomerInsights(response.data.data);
      }
    } catch (error) {
      // Mock data
      setCustomerInsights([
        {
          segment: 'High-Value Customers',
          count: 89,
          characteristics: ['Mua hàng thường xuyên', 'Giá trị đơn hàng cao', 'Ít nhạy cảm giá'],
          behavior: 'Thích sản phẩm premium, mua vào cuối tuần',
          churnRisk: 'low',
          recommendations: ['Chương trình VIP', 'Early access products']
        },
        {
          segment: 'Price-Sensitive Shoppers',
          count: 234,
          characteristics: ['Nhạy cảm với giá', 'Tìm kiếm khuyến mãi', 'Mua theo mùa'],
          behavior: 'So sánh giá, mua khi có sale',
          churnRisk: 'medium',
          recommendations: ['Flash sales', 'Loyalty points program']
        },
        {
          segment: 'Occasional Buyers',
          count: 156,
          characteristics: ['Mua không thường xuyên', 'Đơn hàng nhỏ', 'Cần kích thích'],
          behavior: 'Mua khi có nhu cầu cụ thể',
          churnRisk: 'high',
          recommendations: ['Remarketing campaigns', 'Personalized offers']
        }
      ]);
    }
  };

  const loadPriceOptimization = async () => {
    try {
      const response = await api.get('/ai/price-optimization');
      if (response.data.success) {
        setPriceOptimization(response.data.data);
      }
    } catch (error) {
      // Mock data
      setPriceOptimization([
        {
          product: 'Coca Cola 330ml',
          currentPrice: 12000,
          optimizedPrice: 13500,
          expectedIncrease: 12.5,
          confidence: 87,
          reasoning: 'Nhu cầu cao, ít cạnh tranh trong khu vực'
        },
        {
          product: 'Bánh mì sandwich',
          currentPrice: 25000,
          optimizedPrice: 23000,
          expectedIncrease: 8.3,
          confidence: 92,
          reasoning: 'Giảm giá để tăng volume, margin vẫn tốt'
        },
        {
          product: 'Mì tôm Hảo Hảo',
          currentPrice: 5000,
          optimizedPrice: 5500,
          expectedIncrease: 15.2,
          confidence: 78,
          reasoning: 'Sản phẩm thiết yếu, có thể tăng giá nhẹ'
        }
      ]);
    }
  };

  const loadDemandForecasting = async () => {
    try {
      const response = await api.get('/ai/demand-forecasting');
      if (response.data.success) {
        setDemandForecasting(response.data.data);
      }
    } catch (error) {
      // Mock data
      const mockData = [];
      const products = ['Coca Cola', 'Bánh mì', 'Mì tôm', 'Cà phê', 'Nước suối'];
      
      for (let i = 0; i < 30; i++) {
        products.forEach(product => {
          mockData.push({
            date: dayjs().add(i, 'days').format('YYYY-MM-DD'),
            product,
            predicted_demand: Math.floor(Math.random() * 100) + 50,
            confidence: Math.random() * 0.3 + 0.7
          });
        });
      }
      setDemandForecasting(mockData);
    }
  };

  const loadAnomalyDetection = async () => {
    try {
      const response = await api.get('/ai/anomaly-detection');
      if (response.data.success) {
        setAnomalyDetection(response.data.data);
      }
    } catch (error) {
      // Mock data
      setAnomalyDetection([
        {
          type: 'sales_spike',
          description: 'Doanh thu Coca Cola tăng đột biến 150% vào 14:30',
          severity: 'medium',
          timestamp: '2024-03-15T14:30:00',
          confidence: 95,
          action: 'Kiểm tra stock, chuẩn bị nhập thêm'
        },
        {
          type: 'inventory_anomaly',
          description: 'Tồn kho Bánh mì giảm bất thường nhanh',
          severity: 'high',
          timestamp: '2024-03-15T16:45:00',
          confidence: 88,
          action: 'Kiểm tra quy trình xuất kho'
        },
        {
          type: 'customer_behavior',
          description: 'Khách hàng VIP giảm tần suất mua hàng',
          severity: 'low',
          timestamp: '2024-03-15T09:15:00',
          confidence: 72,
          action: 'Chương trình retention'
        }
      ]);
    }
  };

  const loadChatbotMetrics = async () => {
    try {
      const response = await api.get('/ai/chatbot/metrics');
      if (response.data.success) {
        setChatbotMetrics(response.data.data);
      }
    } catch (error) {
      // Mock data
      setChatbotMetrics({
        totalConversations: 1247,
        successfulResolutions: 1089,
        averageResponseTime: 1.2,
        customerSatisfaction: 4.6,
        topQuestions: [
          'Giờ mở cửa',
          'Sản phẩm có sẵn',
          'Chính sách đổi trả',
          'Chương trình khuyến mãi',
          'Thông tin liên hệ'
        ]
      });
    }
  };

  const loadAISettings = async () => {
    try {
      const response = await api.get('/ai/settings');
      if (response.data.success) {
        setAiSettings(response.data.data);
      }
    } catch (error) {
      // Mock data
      setAiSettings({
        autoRecommendations: true,
        priceOptimizationEnabled: true,
        anomalyAlerts: true,
        chatbotEnabled: true,
        modelRetrainingFrequency: 'weekly',
        confidenceThreshold: 80
      });
    }
  };

  const handleModelAction = async (modelName, action) => {
    try {
      setLoading(true);
      const response = await api.post(`/ai/models/${modelName}/${action}`);
      
      if (response.data.success) {
        message.success(`${action} model ${modelName} thành công`);
        loadModelStatus();
      }
    } catch (error) {
      message.error(`Có lỗi xảy ra khi ${action} model`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'training': return 'blue';
      case 'error': return 'red';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'default';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  // Chart configurations
  const demandForecastConfig = {
    data: demandForecasting.filter(d => d.product === 'Coca Cola'),
    xField: 'date',
    yField: 'predicted_demand',
    smooth: true,
    color: '#722ed1',
    point: { size: 2 }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <RobotOutlined /> AI & Machine Learning
          </Title>
          <Text type="secondary">Trí tuệ nhân tạo và học máy cho POS thông minh</Text>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<SettingOutlined />}
              onClick={() => setShowConfigModal(true)}
            >
              Cấu hình AI
            </Button>
            <Button 
              icon={<ExperimentOutlined />}
              onClick={() => setShowTrainingModal(true)}
            >
              Training Models
            </Button>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={loadAIData}
              loading={loading}
            >
              Cập nhật
            </Button>
          </Space>
        </Col>
      </Row>

      <Tabs defaultActiveKey="overview">
        <TabPane tab="Tổng quan AI" key="overview">
          {/* Model Status */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card title="Trạng thái Models AI" loading={loading}>
                <Row gutter={[16, 16]}>
                  {Object.entries(modelStatus).map(([modelName, status]) => (
                    <Col xs={24} sm={12} lg={8} key={modelName}>
                      <Card size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>{modelName.replace('_', ' ').toUpperCase()}</Text>
                            <Tag color={getStatusColor(status.status)}>
                              {status.status}
                            </Tag>
                          </div>
                          <Progress 
                            percent={status.accuracy} 
                            size="small"
                            format={(percent) => `${percent}% accuracy`}
                          />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Trained: {dayjs(status.lastTrained).format('DD/MM/YYYY')}
                          </Text>
                          <Space>
                            <Button 
                              size="small" 
                              icon={<PlayCircleOutlined />}
                              onClick={() => handleModelAction(modelName, 'start')}
                              disabled={status.status === 'active'}
                            >
                              Start
                            </Button>
                            <Button 
                              size="small" 
                              icon={<PauseCircleOutlined />}
                              onClick={() => handleModelAction(modelName, 'stop')}
                              disabled={status.status !== 'active'}
                            >
                              Stop
                            </Button>
                            <Button 
                              size="small" 
                              icon={<ReloadOutlined />}
                              onClick={() => handleModelAction(modelName, 'retrain')}
                            >
                              Retrain
                            </Button>
                          </Space>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={
          <span>
            <UserOutlined />
            Phân khúc khách hàng
          </span>
        } key="customer-segmentation">
          <CustomerSegmentation />
        </TabPane>

        <TabPane tab={
          <span>
            <LineChartOutlined />
            Dự báo doanh thu
          </span>
        } key="sales-forecasting">
          <SalesForecasting />
        </TabPane>

        <TabPane tab={
          <span>
            <ShoppingCartOutlined />
            Gợi ý sản phẩm
          </span>
        } key="product-recommendation">
          <ProductRecommendation />
        </TabPane>

        <TabPane tab={
          <span>
            <DollarOutlined />
            Tối ưu giá
          </span>
        } key="price-optimization">
          <PriceOptimization />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AIFeatures;
