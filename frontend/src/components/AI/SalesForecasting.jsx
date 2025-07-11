/**
 * Sales Forecasting Dashboard
 * Dự báo doanh thu sử dụng Machine Learning
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Space,
  Typography,
  Statistic,
  Progress,
  Alert,
  Spin,
  DatePicker,
  Select,
  InputNumber,
  message,
  Tag,
  Tooltip,
  Descriptions
} from 'antd';
import {
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  BarChartOutlined,
  BulbOutlined,
  DownloadOutlined,
  ReloadOutlined,
  RobotOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar } from 'recharts';
import dayjs from 'dayjs';

import aiService from '../../services/aiService';
import api from '../../services/api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const SalesForecasting = () => {
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastPeriods, setForecastPeriods] = useState(30);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(90, 'day'),
    dayjs()
  ]);

  useEffect(() => {
    loadSalesData();
  }, [dateRange]);

  const loadSalesData = async () => {
    setLoading(true);
    try {
      // Load sales data from API
      const response = await api.get('/orders/sales-data', {
        params: {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        }
      });
      
      const salesData = response.data.data || [];
      setHistoricalData(salesData);
      
      if (salesData.length > 0) {
        await generateForecast(salesData);
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
      // Use demo data for development
      const demoData = generateDemoSalesData();
      setHistoricalData(demoData);
      await generateForecast(demoData);
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async (salesData) => {
    try {
      const result = await aiService.forecastSales(salesData, forecastPeriods);
      setForecastData(result);
      message.success(`Đã tạo dự báo ${forecastPeriods} ngày tới`);
    } catch (error) {
      console.error('Forecasting error:', error);
      message.error('Có lỗi xảy ra khi tạo dự báo');
    }
  };

  const generateDemoSalesData = () => {
    const data = [];
    const startDate = dayjs().subtract(90, 'day');
    
    for (let i = 0; i < 90; i++) {
      const date = startDate.add(i, 'day');
      const dayOfWeek = date.day();
      
      // Simulate weekly pattern (higher on weekends)
      let baseRevenue = 1000000 + Math.random() * 500000;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseRevenue *= 1.5; // Weekend boost
      }
      
      // Add trend
      baseRevenue += i * 5000;
      
      // Add some noise
      baseRevenue += (Math.random() - 0.5) * 200000;
      
      data.push({
        id: `order_${i}`,
        date: date.toISOString(),
        total: Math.max(0, baseRevenue),
        items: [{ quantity: Math.floor(Math.random() * 10) + 1 }]
      });
    }
    
    return data;
  };

  const chartData = useMemo(() => {
    if (!forecastData) return [];
    
    const historical = historicalData.map(item => ({
      date: dayjs(item.date).format('MM/DD'),
      actual: item.total,
      type: 'historical'
    }));
    
    const forecast = forecastData.forecast.map(item => ({
      date: dayjs(item.date).format('MM/DD'),
      predicted: item.predicted,
      lowerBound: item.lowerBound,
      upperBound: item.upperBound,
      type: 'forecast'
    }));
    
    return [...historical.slice(-30), ...forecast];
  }, [forecastData, historicalData]);

  const accuracyMetrics = useMemo(() => {
    if (!forecastData) return null;
    
    const { mape, rmse, mae } = forecastData.accuracy;
    return [
      {
        name: 'MAPE',
        value: mape.toFixed(2),
        suffix: '%',
        description: 'Mean Absolute Percentage Error'
      },
      {
        name: 'RMSE',
        value: rmse.toLocaleString('vi-VN'),
        suffix: 'đ',
        description: 'Root Mean Square Error'
      },
      {
        name: 'MAE',
        value: mae.toLocaleString('vi-VN'),
        suffix: 'đ',
        description: 'Mean Absolute Error'
      }
    ];
  }, [forecastData]);

  const handleExportForecast = () => {
    if (!forecastData) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      forecastPeriods,
      accuracy: forecastData.accuracy,
      forecast: forecastData.forecast,
      insights: forecastData.insights
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-forecast-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('Đã xuất dự báo');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang phân tích dữ liệu bán hàng...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2}>
                  <LineChartOutlined /> Dự báo doanh thu AI
                </Title>
                <Text type="secondary">
                  Sử dụng Machine Learning để dự báo doanh thu và xu hướng bán hàng
                </Text>
              </Col>
              <Col>
                <Space>
                  <RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    format="DD/MM/YYYY"
                  />
                  <InputNumber
                    min={7}
                    max={90}
                    value={forecastPeriods}
                    onChange={setForecastPeriods}
                    addonAfter="ngày"
                    style={{ width: 120 }}
                  />
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={loadSalesData}
                    loading={loading}
                  >
                    Tạo dự báo
                  </Button>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={handleExportForecast}
                    disabled={!forecastData}
                  >
                    Xuất dự báo
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Accuracy Metrics */}
      {accuracyMetrics && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {accuracyMetrics.map(metric => (
            <Col span={8} key={metric.name}>
              <Card size="small">
                <Statistic
                  title={
                    <Tooltip title={metric.description}>
                      {metric.name}
                    </Tooltip>
                  }
                  value={metric.value}
                  suffix={metric.suffix}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Forecast Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Biểu đồ dự báo doanh thu" size="small">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip 
                  formatter={(value, name) => [
                    `${value?.toLocaleString('vi-VN')} đ`,
                    name === 'actual' ? 'Thực tế' : 
                    name === 'predicted' ? 'Dự báo' :
                    name === 'lowerBound' ? 'Giới hạn dưới' : 'Giới hạn trên'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  name="Thực tế"
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Dự báo"
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stackId="1"
                  stroke="none"
                  fill="#52c41a"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stackId="1"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Insights */}
      {forecastData?.insights && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title={<><BulbOutlined /> Insights và khuyến nghị</>} size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                {forecastData.insights.map((insight, index) => (
                  <Alert
                    key={index}
                    message={insight.title}
                    description={insight.description}
                    type={
                      insight.impact === 'positive' ? 'success' :
                      insight.impact === 'negative' ? 'error' : 'info'
                    }
                    showIcon
                  />
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* Forecast Table */}
      {forecastData && (
        <Card title="Chi tiết dự báo" size="small">
          <Table
            dataSource={forecastData.forecast.slice(0, 14)} // Show first 14 days
            rowKey="date"
            pagination={false}
            size="small"
            columns={[
              {
                title: 'Ngày',
                dataIndex: 'date',
                key: 'date',
                render: (date) => dayjs(date).format('DD/MM/YYYY')
              },
              {
                title: 'Dự báo',
                dataIndex: 'predicted',
                key: 'predicted',
                render: (value) => `${value.toLocaleString('vi-VN')} đ`
              },
              {
                title: 'Khoảng tin cậy',
                key: 'confidence',
                render: (_, record) => (
                  <Space>
                    <Text type="secondary">
                      {record.lowerBound?.toLocaleString('vi-VN')} đ
                    </Text>
                    <Text>-</Text>
                    <Text type="secondary">
                      {record.upperBound?.toLocaleString('vi-VN')} đ
                    </Text>
                  </Space>
                )
              },
              {
                title: 'Xu hướng',
                dataKey: 'trend',
                key: 'trend',
                render: (value) => (
                  <Tag color={value > 0 ? 'green' : value < 0 ? 'red' : 'blue'}>
                    {value > 0 ? <RiseOutlined /> : <FallOutlined />}
                    {Math.abs(value).toLocaleString('vi-VN')} đ
                  </Tag>
                )
              }
            ]}
          />
        </Card>
      )}
    </div>
  );
};

export default SalesForecasting;
