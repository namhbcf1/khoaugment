import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Select,
  DatePicker,
  Space,
  Tag,
  Progress,
  Avatar,
  Typography,
  Tabs,
  Button,
  Tooltip,
  Badge
} from 'antd';
import {
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  StarOutlined,
  TargetOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import { PageHeader } from '../../components/ui/DesignSystem';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const StaffPerformance = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [performanceData, setPerformanceData] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock performance data
  const mockPerformanceData = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      avatar: null,
      role: 'staff',
      department: 'Kho hàng',
      totalSales: 150000000,
      ordersProcessed: 245,
      customerRating: 4.8,
      efficiency: 92,
      punctuality: 98,
      teamwork: 85,
      overallScore: 88,
      trend: 'up',
      achievements: ['Nhân viên xuất sắc', 'Top performer'],
      targets: {
        sales: { target: 200000000, achieved: 150000000 },
        orders: { target: 300, achieved: 245 },
        rating: { target: 4.5, achieved: 4.8 }
      }
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      avatar: null,
      role: 'cashier',
      department: 'Bán hàng',
      totalSales: 200000000,
      ordersProcessed: 380,
      customerRating: 4.9,
      efficiency: 95,
      punctuality: 100,
      teamwork: 90,
      overallScore: 95,
      trend: 'up',
      achievements: ['Nhân viên tháng', 'Dịch vụ xuất sắc'],
      targets: {
        sales: { target: 180000000, achieved: 200000000 },
        orders: { target: 350, achieved: 380 },
        rating: { target: 4.5, achieved: 4.9 }
      }
    }
  ];

  useEffect(() => {
    loadPerformanceData();
  }, [selectedPeriod, selectedStaff]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setPerformanceData(mockPerformanceData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#52c41a';
    if (score >= 80) return '#1890ff';
    if (score >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 
      <RiseOutlined style={{ color: '#52c41a' }} /> : 
      <FallOutlined style={{ color: '#ff4d4f' }} />;
  };

  const performanceColumns = [
    {
      title: 'Nhân viên',
      key: 'employee',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.department}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Điểm tổng',
      dataIndex: 'overallScore',
      key: 'overallScore',
      render: (score, record) => (
        <Space>
          <Progress
            type="circle"
            size={50}
            percent={score}
            strokeColor={getScoreColor(score)}
            format={() => score}
          />
          {getTrendIcon(record.trend)}
        </Space>
      ),
      sorter: (a, b) => a.overallScore - b.overallScore
    },
    {
      title: 'Doanh số',
      dataIndex: 'totalSales',
      key: 'totalSales',
      render: (sales) => (
        <Statistic
          value={sales}
          formatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          prefix="₫"
          valueStyle={{ fontSize: 14 }}
        />
      ),
      sorter: (a, b) => a.totalSales - b.totalSales
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'ordersProcessed',
      key: 'ordersProcessed',
      render: (orders) => (
        <Badge count={orders} style={{ backgroundColor: '#1890ff' }} />
      ),
      sorter: (a, b) => a.ordersProcessed - b.ordersProcessed
    },
    {
      title: 'Đánh giá KH',
      dataIndex: 'customerRating',
      key: 'customerRating',
      render: (rating) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <Text strong>{rating}</Text>
        </Space>
      ),
      sorter: (a, b) => a.customerRating - b.customerRating
    },
    {
      title: 'Hiệu suất',
      key: 'metrics',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            <Text type="secondary">Hiệu quả: </Text>
            <Progress percent={record.efficiency} size="small" />
          </div>
          <div>
            <Text type="secondary">Đúng giờ: </Text>
            <Progress percent={record.punctuality} size="small" />
          </div>
          <div>
            <Text type="secondary">Teamwork: </Text>
            <Progress percent={record.teamwork} size="small" />
          </div>
        </Space>
      )
    },
    {
      title: 'Thành tích',
      dataIndex: 'achievements',
      key: 'achievements',
      render: (achievements) => (
        <Space direction="vertical">
          {achievements.map((achievement, index) => (
            <Tag key={index} color="gold" icon={<TrophyOutlined />}>
              {achievement}
            </Tag>
          ))}
        </Space>
      )
    }
  ];

  // Chart data for performance trends
  const performanceTrendData = [
    { month: 'T1', score: 82 },
    { month: 'T2', score: 85 },
    { month: 'T3', score: 88 },
    { month: 'T4', score: 90 },
    { month: 'T5', score: 92 },
    { month: 'T6', score: 95 }
  ];

  const departmentPerformanceData = [
    { department: 'Bán hàng', score: 92 },
    { department: 'Kho hàng', score: 88 },
    { department: 'Kế toán', score: 85 },
    { department: 'Marketing', score: 90 }
  ];

  const performanceDistributionData = [
    { range: '90-100', count: 5, type: 'Xuất sắc' },
    { range: '80-89', count: 12, type: 'Tốt' },
    { range: '70-79', count: 8, type: 'Khá' },
    { range: '60-69', count: 3, type: 'Trung bình' }
  ];

  const renderOverviewTab = () => (
    <Row gutter={16}>
      <Col span={16}>
        <Card title="Xu hướng hiệu suất" style={{ marginBottom: 16 }}>
          <Line
            data={performanceTrendData}
            xField="month"
            yField="score"
            point={{
              size: 5,
              shape: 'diamond',
            }}
            smooth={true}
            height={300}
          />
        </Card>
        
        <Card title="Hiệu suất theo phòng ban">
          <Column
            data={departmentPerformanceData}
            xField="department"
            yField="score"
            height={300}
            columnStyle={{
              fill: '#1890ff',
            }}
          />
        </Card>
      </Col>
      
      <Col span={8}>
        <Card title="Phân bố hiệu suất" style={{ marginBottom: 16 }}>
          <Pie
            data={performanceDistributionData}
            angleField="count"
            colorField="type"
            radius={0.8}
            height={250}
            label={{
              type: 'outer',
              content: '{name}: {percentage}',
            }}
          />
        </Card>
        
        <Card title="Top Performers">
          <Space direction="vertical" style={{ width: '100%' }}>
            {performanceData
              .sort((a, b) => b.overallScore - a.overallScore)
              .slice(0, 5)
              .map((staff, index) => (
                <div key={staff.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0'
                }}>
                  <Space>
                    <Badge count={index + 1} style={{ backgroundColor: '#faad14' }} />
                    <Avatar src={staff.avatar} icon={<UserOutlined />} size="small" />
                    <Text>{staff.name}</Text>
                  </Space>
                  <Text strong style={{ color: getScoreColor(staff.overallScore) }}>
                    {staff.overallScore}
                  </Text>
                </div>
              ))}
          </Space>
        </Card>
      </Col>
    </Row>
  );

  const renderTargetsTab = () => (
    <Row gutter={16}>
      {performanceData.map(staff => (
        <Col span={12} key={staff.id} style={{ marginBottom: 16 }}>
          <Card 
            title={
              <Space>
                <Avatar src={staff.avatar} icon={<UserOutlined />} />
                {staff.name}
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Mục tiêu doanh số:</Text>
                <Progress
                  percent={(staff.targets.sales.achieved / staff.targets.sales.target) * 100}
                  format={() => `${(staff.targets.sales.achieved / 1000000).toFixed(0)}M / ${(staff.targets.sales.target / 1000000).toFixed(0)}M`}
                />
              </div>
              
              <div>
                <Text type="secondary">Mục tiêu đơn hàng:</Text>
                <Progress
                  percent={(staff.targets.orders.achieved / staff.targets.orders.target) * 100}
                  format={() => `${staff.targets.orders.achieved} / ${staff.targets.orders.target}`}
                />
              </div>
              
              <div>
                <Text type="secondary">Mục tiêu đánh giá:</Text>
                <Progress
                  percent={(staff.targets.rating.achieved / staff.targets.rating.target) * 100}
                  format={() => `${staff.targets.rating.achieved} / ${staff.targets.rating.target}`}
                />
              </div>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div>
      <PageHeader
        title="Hiệu suất nhân viên"
        subtitle="Theo dõi và đánh giá hiệu suất làm việc"
        icon="trophy"
        actions={[
          <Space key="filters">
            <Select
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              style={{ width: 120 }}
            >
              <Option value="week">Tuần này</Option>
              <Option value="month">Tháng này</Option>
              <Option value="quarter">Quý này</Option>
              <Option value="year">Năm này</Option>
            </Select>
            
            <Select
              value={selectedStaff}
              onChange={setSelectedStaff}
              style={{ width: 150 }}
              placeholder="Chọn nhân viên"
            >
              <Option value="all">Tất cả</Option>
              {performanceData.map(staff => (
                <Option key={staff.id} value={staff.id}>
                  {staff.name}
                </Option>
              ))}
            </Select>
            
            <RangePicker />
          </Space>
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        {/* Summary Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Điểm trung bình"
                value={performanceData.reduce((acc, s) => acc + s.overallScore, 0) / performanceData.length || 0}
                precision={1}
                prefix={<TargetOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Top Performer"
                value={performanceData.length > 0 ? Math.max(...performanceData.map(s => s.overallScore)) : 0}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng doanh số"
                value={performanceData.reduce((acc, s) => acc + s.totalSales, 0)}
                formatter={(value) => `${(value / 1000000000).toFixed(1)}B`}
                prefix="₫"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đơn hàng xử lý"
                value={performanceData.reduce((acc, s) => acc + s.ordersProcessed, 0)}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Tổng quan" key="overview">
              {renderOverviewTab()}
            </TabPane>
            
            <TabPane tab="Chi tiết nhân viên" key="details">
              <Table
                columns={performanceColumns}
                dataSource={performanceData}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} nhân viên`
                }}
              />
            </TabPane>
            
            <TabPane tab="Mục tiêu" key="targets">
              {renderTargetsTab()}
            </TabPane>
            
            <TabPane tab="Báo cáo" key="reports">
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text type="secondary">Báo cáo chi tiết sẽ được phát triển</Text>
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default StaffPerformance;
