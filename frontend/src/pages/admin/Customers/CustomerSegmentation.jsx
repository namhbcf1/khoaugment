import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Statistic, 
  Table,
  Select, 
  Tabs, 
  Tooltip,
  Tag,
  Divider,
  Alert,
  Spin,
  Radio
} from 'antd';
import {
  UserOutlined,
  WalletOutlined,
  ShoppingOutlined,
  RiseOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PieChartOutlined,
  BarsOutlined,
  DotChartOutlined,
  ClockCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import { Pie, Scatter, Column, Line, Heatmap } from '@ant-design/plots';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * Trang phân tích và phân khúc khách hàng
 */
const CustomerSegmentation = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('year');
  const [segmentData, setSegmentData] = useState([]);
  const [customerValue, setCustomerValue] = useState([]);
  const [recencyData, setRecencyData] = useState([]);
  const [rfmMatrix, setRfmMatrix] = useState([]);
  const [lifetimeValueData, setLifetimeValueData] = useState([]);
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  // Tải dữ liệu mẫu
  useEffect(() => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      // Tạo dữ liệu mẫu
      const segmentData = [
        { segment: 'Khách hàng VIP', value: 52, percentage: 5.2, color: '#722ed1' },
        { segment: 'Khách hàng trung thành', value: 187, percentage: 18.7, color: '#2f54eb' },
        { segment: 'Khách hàng tiềm năng', value: 245, percentage: 24.5, color: '#1890ff' },
        { segment: 'Khách hàng mới', value: 321, percentage: 32.1, color: '#52c41a' },
        { segment: 'Khách hàng không hoạt động', value: 195, percentage: 19.5, color: '#faad14' },
      ];
      
      const rfmMatrix = generateRfmMatrix();
      const customerValue = generateCustomerValue();
      const recencyData = generateRecencyData();
      const lifetimeValueData = generateLifetimeValueData();
      const ageDistribution = generateAgeDistribution();
      const topCustomers = generateTopCustomers();
      
      setSegmentData(segmentData);
      setRfmMatrix(rfmMatrix);
      setCustomerValue(customerValue);
      setRecencyData(recencyData);
      setLifetimeValueData(lifetimeValueData);
      setAgeDistribution(ageDistribution);
      setTopCustomers(topCustomers);
      
      setLoading(false);
    }, 1500);
  }, [period]);

  // Tạo dữ liệu ma trận RFM
  const generateRfmMatrix = () => {
    const rfmData = [];
    
    // RFM Scores (1-5 for each dimension)
    for (let r = 1; r <= 5; r++) {
      for (let f = 1; f <= 5; f++) {
        for (let m = 1; m <= 5; m++) {
          // Calculate segment and customer count
          let segment = '';
          let value = 0;
          
          if (r >= 4 && f >= 4 && m >= 4) {
            segment = 'VIP';
            value = Math.floor(Math.random() * 10) + 5;
          } else if (r >= 3 && f >= 3 && m >= 3) {
            segment = 'Trung thành';
            value = Math.floor(Math.random() * 20) + 10;
          } else if (r >= 3 && (f >= 3 || m >= 3)) {
            segment = 'Tiềm năng';
            value = Math.floor(Math.random() * 30) + 15;
          } else if (r <= 2 && f <= 2 && m <= 2) {
            segment = 'Ngủ đông';
            value = Math.floor(Math.random() * 25) + 10;
          } else {
            segment = 'Trung bình';
            value = Math.floor(Math.random() * 40) + 20;
          }
          
          rfmData.push({
            r,
            f,
            m,
            segment,
            value,
          });
        }
      }
    }
    
    return rfmData;
  };

  // Tạo dữ liệu giá trị khách hàng
  const generateCustomerValue = () => {
    return [
      { category: 'Dưới 1tr', value: 352, color: '#d9d9d9' },
      { category: '1tr - 5tr', value: 421, color: '#faad14' },
      { category: '5tr - 15tr', value: 127, color: '#52c41a' },
      { category: '15tr - 30tr', value: 68, color: '#1890ff' },
      { category: 'Trên 30tr', value: 32, color: '#722ed1' },
    ];
  };

  // Tạo dữ liệu độ gần đây của khách hàng
  const generateRecencyData = () => {
    return [
      { time: '0-7 ngày', value: 143 },
      { time: '8-30 ngày', value: 205 },
      { time: '31-60 ngày', value: 187 },
      { time: '61-90 ngày', value: 139 },
      { time: '91-180 ngày', value: 117 },
      { time: '181-365 ngày', value: 112 },
      { time: 'Trên 365 ngày', value: 97 },
    ];
  };

  // Tạo dữ liệu giá trị vòng đời khách hàng
  const generateLifetimeValueData = () => {
    const data = [];
    const startDate = dayjs().subtract(12, 'months');
    
    for (let i = 0; i < 12; i++) {
      const month = startDate.clone().add(i, 'months').format('MM/YYYY');
      data.push({
        month,
        'Mới': Math.floor(Math.random() * 200000) + 100000,
        '0-6 tháng': Math.floor(Math.random() * 500000) + 300000,
        '6-12 tháng': Math.floor(Math.random() * 800000) + 500000,
        '1-2 năm': Math.floor(Math.random() * 1200000) + 800000,
        'Trên 2 năm': Math.floor(Math.random() * 2000000) + 1200000,
      });
    }
    
    return data;
  };

  // Tạo dữ liệu phân bố độ tuổi
  const generateAgeDistribution = () => {
    return [
      { age: '18-24', male: 87, female: 95 },
      { age: '25-34', male: 147, female: 158 },
      { age: '35-44', male: 118, female: 103 },
      { age: '45-54', male: 73, female: 67 },
      { age: '55-64', male: 52, female: 48 },
      { age: '65+', male: 32, female: 20 },
    ];
  };

  // Tạo dữ liệu top khách hàng
  const generateTopCustomers = () => {
    return [
      { id: 1, name: 'Nguyễn Văn A', orders: 12, totalSpent: 45800000, lastOrder: '2023-06-18', segment: 'VIP' },
      { id: 2, name: 'Trần Thị B', orders: 8, totalSpent: 38500000, lastOrder: '2023-06-22', segment: 'Trung thành' },
      { id: 3, name: 'Lê Minh C', orders: 15, totalSpent: 37200000, lastOrder: '2023-06-10', segment: 'VIP' },
      { id: 4, name: 'Phạm Văn D', orders: 10, totalSpent: 32600000, lastOrder: '2023-06-15', segment: 'Trung thành' },
      { id: 5, name: 'Hoàng Thị E', orders: 7, totalSpent: 28900000, lastOrder: '2023-06-05', segment: 'Tiềm năng' },
    ];
  };

  // Format tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Xử lý thay đổi khoảng thời gian
  const handlePeriodChange = (value) => {
    setPeriod(value);
    setLoading(true);
    
    // Giả lập tải dữ liệu mới
    setTimeout(() => setLoading(false), 1000);
  };

  // Cấu hình biểu đồ phân khúc khách hàng
  const segmentPieConfig = {
    data: segmentData,
    angleField: 'value',
    colorField: 'segment',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    color: ({ segment }) => {
      const item = segmentData.find(d => d.segment === segment);
      return item ? item.color : '#1890ff';
    },
    interactions: [{ type: 'element-active' }],
  };

  // Cấu hình biểu đồ RFM
  const rfmHeatmapConfig = {
    data: rfmMatrix,
    xField: 'r',
    yField: 'f',
    colorField: 'value',
    shape: 'square',
    sizeField: 'value',
    color: ['#BAE7FF', '#1890FF', '#0050B3'],
    label: {
      style: {
        fill: '#fff',
        shadowBlur: 2,
        shadowColor: 'rgba(0, 0, 0, .45)',
      },
    },
    meta: {
      r: { alias: 'Recency (độ gần đây)' },
      f: { alias: 'Frequency (tần suất)' },
      value: { alias: 'Số lượng' },
    },
  };

  // Cấu hình biểu đồ giá trị khách hàng
  const customerValuePieConfig = {
    data: customerValue,
    angleField: 'value',
    colorField: 'category',
    radius: 0.8,
    label: {
      type: 'inner',
      content: '{percentage}',
    },
    color: ({ category }) => {
      const item = customerValue.find(d => d.category === category);
      return item ? item.color : '#1890ff';
    },
    interactions: [{ type: 'element-active' }],
  };

  // Cấu hình biểu đồ độ gần đây
  const recencyBarConfig = {
    data: recencyData,
    xField: 'time',
    yField: 'value',
    color: '#1890ff',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
  };

  // Cấu hình biểu đồ giá trị vòng đời
  const lifetimeValueConfig = {
    data: lifetimeValueData,
    xField: 'month',
    yField: 'value',
    seriesField: 'segment',
    isStack: true,
    label: false,
    legend: { position: 'top' },
    color: ['#1890ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1'],
  };

  // Transform data for lifetime value chart
  const lifetimeValueChartData = lifetimeValueData.reduce((acc, item) => {
    const { month, ...segments } = item;
    Object.entries(segments).forEach(([segment, value]) => {
      acc.push({ month, segment, value });
    });
    return acc;
  }, []);

  // Cấu hình biểu đồ phân bố độ tuổi
  const ageDistributionConfig = {
    data: ageDistribution,
    xField: 'age',
    yField: ['male', 'female'],
    isGroup: true,
    color: ['#1890ff', '#eb2f96'],
    label: {
      position: 'middle',
      layout: [
        { type: 'interval-adjust-position' },
        { type: 'interval-hide-overlap' },
        { type: 'adjust-color' },
      ],
    },
    legend: {
      position: 'top-right',
      itemName: {
        formatter: (text) => {
          if (text === 'male') return 'Nam';
          if (text === 'female') return 'Nữ';
          return text;
        },
      },
    },
  };

  // Cột cho bảng top khách hàng
  const topCustomersColumns = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'orders',
      key: 'orders',
      align: 'right',
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      align: 'right',
      render: (text) => formatCurrency(text),
    },
    {
      title: 'Mua gần nhất',
      dataIndex: 'lastOrder',
      key: 'lastOrder',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Phân khúc',
      dataIndex: 'segment',
      key: 'segment',
      render: (text) => {
        let color = '';
        switch (text) {
          case 'VIP':
            color = '#722ed1';
            break;
          case 'Trung thành':
            color = '#2f54eb';
            break;
          case 'Tiềm năng':
            color = '#1890ff';
            break;
          default:
            color = '#1890ff';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div className="customer-segmentation">
      <Card bordered={false} className="header-card">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Title level={3}>Phân khúc khách hàng</Title>
            <Text type="secondary">
              Phân tích và phân khúc khách hàng để hiểu rõ hơn về đối tượng mục tiêu
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
              <Select 
                style={{ width: 120 }} 
                value={period} 
                onChange={handlePeriodChange}
                loading={loading}
              >
                <Option value="month">30 ngày qua</Option>
                <Option value="quarter">90 ngày qua</Option>
                <Option value="year">365 ngày qua</Option>
                <Option value="all">Tất cả thời gian</Option>
              </Select>
              
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 1000);
                }}
                loading={loading}
              >
                Làm mới
              </Button>
              
              <Button icon={<DownloadOutlined />} disabled={loading}>
                Xuất báo cáo
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserOutlined />
                  <span>Tổng khách hàng</span>
                </div>
              }
              value={1000}
              suffix={
                <div style={{ fontSize: '14px', color: '#52c41a' }}>
                  <RiseOutlined /> +12.5% so với kỳ trước
                </div>
              }
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <WalletOutlined />
                  <span>Giá trị trung bình</span>
                </div>
              }
              value={12450000}
              precision={0}
              formatter={(value) => formatCurrency(value)}
              suffix={
                <div style={{ fontSize: '14px', color: '#52c41a' }}>
                  <RiseOutlined /> +8.3% so với kỳ trước
                </div>
              }
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingOutlined />
                  <span>Tỷ lệ mua lại</span>
                </div>
              }
              value={42.5}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title={<span><PieChartOutlined /> Phân khúc khách hàng</span>}
            bordered={false}
            loading={loading}
          >
            <Pie {...segmentPieConfig} height={300} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Tabs defaultActiveKey="value">
            <TabPane 
              tab={<span><WalletOutlined /> Phân bố giá trị</span>}
              key="value"
            >
              <Card bordered={false} loading={loading} bodyStyle={{ padding: '12px' }}>
                <Pie {...customerValuePieConfig} height={300} />
              </Card>
            </TabPane>
            <TabPane 
              tab={<span><ClockCircleOutlined /> Thời gian mua gần nhất</span>}
              key="recency"
            >
              <Card bordered={false} loading={loading} bodyStyle={{ padding: '12px' }}>
                <Column {...recencyBarConfig} height={300} />
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title={<span><FireOutlined /> Top khách hàng giá trị</span>}
            bordered={false}
            loading={loading}
          >
            <Table 
              dataSource={topCustomers}
              columns={topCustomersColumns}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={<span><DotChartOutlined /> Phân bố khách hàng theo độ tuổi và giới tính</span>}
            bordered={false}
            loading={loading}
          >
            <Column {...ageDistributionConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card 
            title={<span><BarsOutlined /> Giá trị khách hàng theo vòng đời</span>}
            bordered={false}
            loading={loading}
          >
            <div style={{ marginBottom: '16px' }}>
              <Radio.Group defaultValue="stack" buttonStyle="solid">
                <Radio.Button value="stack">Biểu đồ xếp chồng</Radio.Button>
                <Radio.Button value="line">Biểu đồ đường</Radio.Button>
              </Radio.Group>
            </div>
            <div style={{ height: '350px' }}>
              {loading ? (
                <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Spin />
                </div>
              ) : (
                <Column height={350} {...lifetimeValueConfig} data={lifetimeValueChartData} />
              )}
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Alert
            message="Phân tích phân khúc khách hàng RFM"
            description={
              <>
                <Paragraph>
                  Phân tích RFM là phương pháp phân tích khách hàng dựa trên ba chỉ số:
                </Paragraph>
                <ul>
                  <li><strong>Recency (R):</strong> Độ gần đây của lần mua hàng cuối cùng</li>
                  <li><strong>Frequency (F):</strong> Tần suất mua hàng</li>
                  <li><strong>Monetary (M):</strong> Giá trị chi tiêu</li>
                </ul>
                <Paragraph>
                  Mỗi khách hàng được chấm điểm từ 1-5 cho mỗi chỉ số, với 5 là tốt nhất. 
                  Khách hàng có điểm cao ở cả 3 chỉ số (VIP) là đối tượng cần được chăm sóc đặc biệt.
                </Paragraph>
              </>
            }
            type="info"
            showIcon
          />
        </Col>
      </Row>
    </div>
  );
};

export default CustomerSegmentation; 