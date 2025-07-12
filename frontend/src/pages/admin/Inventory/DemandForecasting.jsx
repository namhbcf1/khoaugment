import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, Select, Button, Spin, Alert, Typography, Space, DatePicker } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * Demand Forecasting component for inventory prediction
 */
const DemandForecasting = () => {
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [forecastPeriod, setForecastPeriod] = useState('30days');
  
  // Load forecast data
  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        setLoading(true);
        
        // Mock data - would be replaced with real AI-based forecasting API
        setTimeout(() => {
          // Generate 30 days of forecast data
          const mockForecastData = Array.from({ length: 30 }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() + index);
            
            return {
              date: date.toISOString().split('T')[0],
              forecast: Math.floor(50 + Math.random() * 100),
              lower: Math.floor(30 + Math.random() * 50),
              upper: Math.floor(100 + Math.random() * 50),
              actual: index < 5 ? Math.floor(40 + Math.random() * 120) : null,
            };
          });
          
          setForecastData(mockForecastData);
          setLoading(false);
        }, 1500);
        
      } catch (err) {
        console.error('Failed to fetch forecast data:', err);
        setError('Không thể tải dữ liệu dự báo');
        setLoading(false);
      }
    };
    
    fetchForecastData();
  }, [selectedCategory, forecastPeriod]);
  
  // Calculate forecast statistics
  const getTotalDemand = () => {
    return forecastData.reduce((sum, item) => sum + item.forecast, 0);
  };
  
  const getAverageDemand = () => {
    return forecastData.length > 0 
      ? Math.round(getTotalDemand() / forecastData.length) 
      : 0;
  };
  
  const getMaxDemand = () => {
    return forecastData.length > 0
      ? Math.max(...forecastData.map(item => item.upper))
      : 0;
  };
  
  // Render error state if needed
  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: '16px 0' }}
      />
    );
  }
  
  return (
    <>
      <Card title="Dự báo nhu cầu sản phẩm" bordered={false} style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Text strong>Danh mục sản phẩm:</Text>
              <Select 
                style={{ width: '100%', marginTop: 8 }}
                value={selectedCategory}
                onChange={setSelectedCategory}
              >
                <Option value="all">Tất cả sản phẩm</Option>
                <Option value="cpu">CPU</Option>
                <Option value="gpu">Card đồ họa</Option>
                <Option value="ram">Bộ nhớ RAM</Option>
                <Option value="storage">Ổ cứng</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <Text strong>Thời gian dự báo:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={forecastPeriod}
                onChange={setForecastPeriod}
              >
                <Option value="7days">7 ngày</Option>
                <Option value="30days">30 ngày</Option>
                <Option value="90days">90 ngày</Option>
                <Option value="180days">6 tháng</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <Text strong>Khoảng thời gian:</Text>
              <RangePicker style={{ width: '100%', marginTop: 8 }} />
            </Col>
            <Col xs={24} sm={6}>
              <Text strong>Hành động:</Text>
              <div style={{ marginTop: 8 }}>
                <Space>
                  <Button type="primary" loading={loading}>Cập nhật dự báo</Button>
                  <Button>Xuất báo cáo</Button>
                </Space>
              </div>
            </Col>
          </Row>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <Spin tip="Đang phân tích dữ liệu..." />
          </div>
        ) : (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic title="Tổng nhu cầu dự báo" value={getTotalDemand()} suffix="sản phẩm" />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic title="Nhu cầu trung bình" value={getAverageDemand()} suffix="sản phẩm/ngày" />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small">
                  <Statistic title="Đỉnh nhu cầu" value={getMaxDemand()} suffix="sản phẩm" />
                </Card>
              </Col>
            </Row>
            
            <Title level={5}>Biểu đồ dự báo nhu cầu</Title>
            <div style={{ height: 400, marginBottom: 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={forecastData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#1890ff"
                    name="Dự báo"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#52c41a"
                    name="Thực tế"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="upper"
                    stroke="#faad14"
                    name="Giới hạn trên"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="lower"
                    stroke="#faad14"
                    name="Giới hạn dưới"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <Title level={5}>Dữ liệu dự báo chi tiết</Title>
            <Table
              dataSource={forecastData}
              rowKey="date"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            >
              <Table.Column title="Ngày" dataIndex="date" key="date" />
              <Table.Column
                title="Dự báo"
                dataIndex="forecast"
                key="forecast"
                render={val => `${val} sản phẩm`}
              />
              <Table.Column
                title="Thực tế"
                dataIndex="actual"
                key="actual"
                render={val => (val !== null ? `${val} sản phẩm` : '—')}
              />
              <Table.Column
                title="Giới hạn dưới"
                dataIndex="lower"
                key="lower"
                render={val => `${val} sản phẩm`}
              />
              <Table.Column
                title="Giới hạn trên"
                dataIndex="upper"
                key="upper"
                render={val => `${val} sản phẩm`}
              />
            </Table>
          </>
        )}
      </Card>
    </>
  );
};

// Statistic component
const Statistic = ({ title, value, suffix }) => (
  <div>
    <Text type="secondary">{title}</Text>
    <div style={{ marginTop: 5 }}>
      <Title level={3} style={{ margin: 0 }}>{value}</Title>
      {suffix && <Text type="secondary">{suffix}</Text>}
    </div>
  </div>
);

export default DemandForecasting; 