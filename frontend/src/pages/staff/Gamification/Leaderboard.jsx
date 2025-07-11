import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  Tabs,
  Space,
  Tag,
  Button,
  Avatar,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Progress,
  Tooltip,
  Badge,
  Alert,
  Input,
  Radio,
  Divider
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  RiseOutlined,
  FireOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  UserOutlined,
  SearchOutlined,
  CalendarOutlined,
  DollarOutlined,
  BarChartOutlined,
  LineChartOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ShareAltOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Mock data for leaderboard
const mockLeaderboardData = {
  sales: [
    {
      key: '1',
      rank: 1,
      name: 'Trần Thị B',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      department: 'Laptop',
      sales: 125000000,
      transactions: 42,
      target: 100000000,
      targetCompletion: 125,
      points: 3200,
      trend: 'up'
    },
    {
      key: '2',
      rank: 2,
      name: 'Lê Văn C',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      department: 'Linh kiện',
      sales: 98000000,
      transactions: 78,
      target: 100000000,
      targetCompletion: 98,
      points: 2800,
      trend: 'up'
    },
    {
      key: '3',
      rank: 3,
      name: 'Nguyễn Văn A',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      department: 'Laptop',
      sales: 85000000,
      transactions: 36,
      target: 100000000,
      targetCompletion: 85,
      points: 2450,
      trend: 'down'
    },
    {
      key: '4',
      rank: 4,
      name: 'Phạm Thị D',
      avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
      department: 'Phụ kiện',
      sales: 72000000,
      transactions: 65,
      target: 80000000,
      targetCompletion: 90,
      points: 2100,
      trend: 'up'
    },
    {
      key: '5',
      rank: 5,
      name: 'Hoàng Văn E',
      avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
      department: 'PC',
      sales: 68000000,
      transactions: 28,
      target: 80000000,
      targetCompletion: 85,
      points: 1950,
      trend: 'down'
    },
    {
      key: '6',
      rank: 6,
      name: 'Vũ Thị F',
      avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
      department: 'Linh kiện',
      sales: 65000000,
      transactions: 52,
      target: 80000000,
      targetCompletion: 81.25,
      points: 1850,
      trend: 'up'
    },
    {
      key: '7',
      rank: 7,
      name: 'Đặng Văn G',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      department: 'PC',
      sales: 61000000,
      transactions: 31,
      target: 80000000,
      targetCompletion: 76.25,
      points: 1750,
      trend: 'down'
    },
    {
      key: '8',
      rank: 8,
      name: 'Ngô Thị H',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      department: 'Phụ kiện',
      sales: 58000000,
      transactions: 48,
      target: 60000000,
      targetCompletion: 96.67,
      points: 1700,
      trend: 'up'
    },
    {
      key: '9',
      rank: 9,
      name: 'Bùi Văn I',
      avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
      department: 'Laptop',
      sales: 52000000,
      transactions: 22,
      target: 60000000,
      targetCompletion: 86.67,
      points: 1600,
      trend: 'down'
    },
    {
      key: '10',
      rank: 10,
      name: 'Lý Thị K',
      avatar: 'https://randomuser.me/api/portraits/women/56.jpg',
      department: 'Linh kiện',
      sales: 48000000,
      transactions: 38,
      target: 60000000,
      targetCompletion: 80,
      points: 1500,
      trend: 'up'
    }
  ],
  customerService: [
    {
      key: '1',
      rank: 1,
      name: 'Phạm Thị D',
      avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
      department: 'Phụ kiện',
      satisfaction: 98,
      responseTime: 2.5,
      casesResolved: 85,
      points: 2800,
      trend: 'up'
    },
    {
      key: '2',
      rank: 2,
      name: 'Nguyễn Văn A',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      department: 'Laptop',
      satisfaction: 96,
      responseTime: 3.2,
      casesResolved: 72,
      points: 2650,
      trend: 'up'
    },
    {
      key: '3',
      rank: 3,
      name: 'Trần Thị B',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      department: 'Laptop',
      satisfaction: 95,
      responseTime: 3.5,
      casesResolved: 68,
      points: 2500,
      trend: 'down'
    }
  ],
  teams: [
    {
      key: '1',
      rank: 1,
      name: 'Đội Laptop',
      members: 5,
      sales: 320000000,
      target: 300000000,
      targetCompletion: 106.67,
      points: 8500,
      trend: 'up'
    },
    {
      key: '2',
      rank: 2,
      name: 'Đội Linh kiện',
      members: 6,
      sales: 290000000,
      target: 300000000,
      targetCompletion: 96.67,
      points: 7800,
      trend: 'up'
    },
    {
      key: '3',
      rank: 3,
      name: 'Đội PC',
      members: 4,
      sales: 250000000,
      target: 250000000,
      targetCompletion: 100,
      points: 7200,
      trend: 'up'
    },
    {
      key: '4',
      rank: 4,
      name: 'Đội Phụ kiện',
      members: 5,
      sales: 220000000,
      target: 250000000,
      targetCompletion: 88,
      points: 6500,
      trend: 'down'
    }
  ]
};

// Mock data for user stats
const mockUserStats = {
  name: 'Nguyễn Văn A',
  rank: 3,
  totalStaff: 10,
  points: 2450,
  sales: {
    current: 85000000,
    target: 100000000,
    percentage: 85
  },
  customerService: {
    satisfaction: 96,
    responseTime: 3.2,
    casesResolved: 72
  },
  team: 'Đội Laptop',
  teamRank: 1
};

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState({});
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [timeRange, setTimeRange] = useState('month');
  const [department, setDepartment] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Load data on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLeaderboardData(mockLeaderboardData);
      setUserStats(mockUserStats);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle time range change
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  // Handle department change
  const handleDepartmentChange = (value) => {
    setDepartment(value);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Filter data based on search and department
  const getFilteredData = () => {
    const data = leaderboardData[activeTab] || [];
    return data.filter(item => {
      const matchesSearch = !searchText || 
        item.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesDepartment = department === 'all' || 
        (item.department && item.department === department);
      return matchesSearch && matchesDepartment;
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get columns for sales leaderboard
  const getSalesColumns = () => [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {rank <= 3 ? (
            <Avatar 
              style={{ 
                backgroundColor: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32',
                color: '#fff',
                marginRight: 8
              }}
            >
              {rank}
            </Avatar>
          ) : (
            <Avatar style={{ backgroundColor: '#f0f0f0', color: '#000', marginRight: 8 }}>
              {rank}
            </Avatar>
          )}
          {record.trend === 'up' && <RiseOutlined style={{ color: '#52c41a' }} />}
          {record.trend === 'down' && <FireOutlined style={{ color: '#ff4d4f' }} />}
        </div>
      )
    },
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} />
          <span>{text}</span>
          {record.rank === 1 && <TrophyOutlined style={{ color: '#FFD700' }} />}
        </Space>
      )
    },
    {
      title: 'Bộ phận',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Doanh số',
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a, b) => a.sales - b.sales,
      render: (text) => formatCurrency(text)
    },
    {
      title: 'Giao dịch',
      dataIndex: 'transactions',
      key: 'transactions',
      sorter: (a, b) => a.transactions - b.transactions
    },
    {
      title: 'Hoàn thành mục tiêu',
      dataIndex: 'targetCompletion',
      key: 'targetCompletion',
      sorter: (a, b) => a.targetCompletion - b.targetCompletion,
      render: (text) => (
        <Tooltip title={`${text}%`}>
          <Progress 
            percent={text} 
            size="small" 
            status={text >= 100 ? 'success' : 'active'} 
            style={{ width: 100 }}
          />
        </Tooltip>
      )
    },
    {
      title: 'Điểm thưởng',
      dataIndex: 'points',
      key: 'points',
      sorter: (a, b) => a.points - b.points,
      render: (text) => <Tag color="#722ed1">{text} điểm</Tag>
    }
  ];

  // Get columns for customer service leaderboard
  const getCustomerServiceColumns = () => [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {rank <= 3 ? (
            <Avatar 
              style={{ 
                backgroundColor: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32',
                color: '#fff',
                marginRight: 8
              }}
            >
              {rank}
            </Avatar>
          ) : (
            <Avatar style={{ backgroundColor: '#f0f0f0', color: '#000', marginRight: 8 }}>
              {rank}
            </Avatar>
          )}
          {record.trend === 'up' && <RiseOutlined style={{ color: '#52c41a' }} />}
          {record.trend === 'down' && <FireOutlined style={{ color: '#ff4d4f' }} />}
        </div>
      )
    },
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} />
          <span>{text}</span>
          {record.rank === 1 && <TrophyOutlined style={{ color: '#FFD700' }} />}
        </Space>
      )
    },
    {
      title: 'Bộ phận',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Độ hài lòng',
      dataIndex: 'satisfaction',
      key: 'satisfaction',
      sorter: (a, b) => a.satisfaction - b.satisfaction,
      render: (text) => (
        <Tooltip title={`${text}%`}>
          <Progress 
            percent={text} 
            size="small" 
            status="success" 
            style={{ width: 100 }}
          />
        </Tooltip>
      )
    },
    {
      title: 'Thời gian phản hồi',
      dataIndex: 'responseTime',
      key: 'responseTime',
      sorter: (a, b) => a.responseTime - b.responseTime,
      render: (text) => `${text} phút`
    },
    {
      title: 'Vấn đề đã giải quyết',
      dataIndex: 'casesResolved',
      key: 'casesResolved',
      sorter: (a, b) => a.casesResolved - b.casesResolved
    },
    {
      title: 'Điểm thưởng',
      dataIndex: 'points',
      key: 'points',
      sorter: (a, b) => a.points - b.points,
      render: (text) => <Tag color="#722ed1">{text} điểm</Tag>
    }
  ];

  // Get columns for teams leaderboard
  const getTeamsColumns = () => [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {rank <= 3 ? (
            <Avatar 
              style={{ 
                backgroundColor: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32',
                color: '#fff',
                marginRight: 8
              }}
            >
              {rank}
            </Avatar>
          ) : (
            <Avatar style={{ backgroundColor: '#f0f0f0', color: '#000', marginRight: 8 }}>
              {rank}
            </Avatar>
          )}
          {record.trend === 'up' && <RiseOutlined style={{ color: '#52c41a' }} />}
          {record.trend === 'down' && <FireOutlined style={{ color: '#ff4d4f' }} />}
        </div>
      )
    },
    {
      title: 'Đội',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <span>{text}</span>
          {record.rank === 1 && <TrophyOutlined style={{ color: '#FFD700' }} />}
        </Space>
      )
    },
    {
      title: 'Thành viên',
      dataIndex: 'members',
      key: 'members'
    },
    {
      title: 'Doanh số',
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a, b) => a.sales - b.sales,
      render: (text) => formatCurrency(text)
    },
    {
      title: 'Hoàn thành mục tiêu',
      dataIndex: 'targetCompletion',
      key: 'targetCompletion',
      sorter: (a, b) => a.targetCompletion - b.targetCompletion,
      render: (text) => (
        <Tooltip title={`${text}%`}>
          <Progress 
            percent={text} 
            size="small" 
            status={text >= 100 ? 'success' : 'active'} 
            style={{ width: 100 }}
          />
        </Tooltip>
      )
    },
    {
      title: 'Điểm thưởng',
      dataIndex: 'points',
      key: 'points',
      sorter: (a, b) => a.points - b.points,
      render: (text) => <Tag color="#722ed1">{text} điểm</Tag>
    }
  ];

  // Get columns based on active tab
  const getColumns = () => {
    switch (activeTab) {
      case 'sales':
        return getSalesColumns();
      case 'customerService':
        return getCustomerServiceColumns();
      case 'teams':
        return getTeamsColumns();
      default:
        return getSalesColumns();
    }
  };

  return (
    <div className="leaderboard">
      <Card loading={loading}>
        <Title level={2}>
          <TrophyOutlined /> Bảng xếp hạng
        </Title>
        <Paragraph type="secondary">
          Theo dõi thứ hạng và thành tích của bạn và đồng nghiệp
        </Paragraph>

        {/* User Stats */}
        {userStats && (
          <Card style={{ marginBottom: 16, backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={6} md={4}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar 
                    size={64} 
                    src="https://randomuser.me/api/portraits/men/22.jpg" 
                    style={{ marginBottom: 8 }}
                  />
                  <div>
                    <Text strong>{userStats.name}</Text>
                  </div>
                  <div>
                    <Tag color="#722ed1">Hạng {userStats.rank}</Tag>
                    <Tag color="#108ee9">{userStats.points} điểm</Tag>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={18} md={20}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Doanh số"
                      value={userStats.sales.current}
                      formatter={(value) => formatCurrency(value)}
                      valueStyle={{ fontSize: '16px' }}
                    />
                    <Progress 
                      percent={userStats.sales.percentage} 
                      size="small" 
                      showInfo={false}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Độ hài lòng khách hàng"
                      value={userStats.customerService.satisfaction}
                      suffix="%"
                      valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Đội"
                      value={userStats.team}
                      valueStyle={{ fontSize: '16px' }}
                    />
                    <div>
                      <Badge status="success" text={`Hạng ${userStats.teamRank} trong bảng xếp hạng đội`} />
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Button type="primary" icon={<LineChartOutlined />} block>
                      Xem chi tiết thống kê
                    </Button>
                    <Button style={{ marginTop: 8 }} icon={<BarChartOutlined />} block>
                      So sánh với đồng nghiệp
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        )}

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={8} md={6} lg={4}>
              <Text strong>Thời gian:</Text>
              <div>
                <Select
                  style={{ width: '100%' }}
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                >
                  <Option value="week">Tuần này</Option>
                  <Option value="month">Tháng này</Option>
                  <Option value="quarter">Quý này</Option>
                  <Option value="year">Năm nay</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={8} md={6} lg={4}>
              <Text strong>Bộ phận:</Text>
              <div>
                <Select
                  style={{ width: '100%' }}
                  value={department}
                  onChange={handleDepartmentChange}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="Laptop">Laptop</Option>
                  <Option value="PC">PC</Option>
                  <Option value="Linh kiện">Linh kiện</Option>
                  <Option value="Phụ kiện">Phụ kiện</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={8} md={6} lg={4}>
              <Text strong>Tìm kiếm:</Text>
              <div>
                <Input
                  placeholder="Tên nhân viên"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={handleSearch}
                />
              </div>
            </Col>
            <Col xs={24} sm={24} md={6} lg={12} style={{ textAlign: 'right' }}>
              <Space>
                <Button icon={<ReloadOutlined />}>
                  Làm mới
                </Button>
                <Button icon={<DownloadOutlined />}>
                  Xuất Excel
                </Button>
                <Button icon={<ShareAltOutlined />}>
                  Chia sẻ
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Leaderboard Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabPosition="top"
        >
          <TabPane 
            tab={
              <span>
                <DollarOutlined /> Doanh số
              </span>
            } 
            key="sales"
          >
            <Table
              columns={getColumns()}
              dataSource={getFilteredData()}
              rowKey="key"
              loading={loading}
              pagination={{ pageSize: 10 }}
              rowClassName={(record) => record.name === userStats?.name ? 'highlight-row' : ''}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <HeartOutlined /> Dịch vụ khách hàng
              </span>
            } 
            key="customerService"
          >
            <Table
              columns={getColumns()}
              dataSource={getFilteredData()}
              rowKey="key"
              loading={loading}
              pagination={{ pageSize: 10 }}
              rowClassName={(record) => record.name === userStats?.name ? 'highlight-row' : ''}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <TeamOutlined /> Xếp hạng đội
              </span>
            } 
            key="teams"
          >
            <Table
              columns={getColumns()}
              dataSource={getFilteredData()}
              rowKey="key"
              loading={loading}
              pagination={{ pageSize: 10 }}
              rowClassName={(record) => record.name === userStats?.team ? 'highlight-row' : ''}
            />
          </TabPane>
        </Tabs>

        {/* Legend */}
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Chú thích:</Text>
          <div style={{ marginTop: 8 }}>
            <Space>
              <Tag><RiseOutlined /> Tăng hạng</Tag>
              <Tag><FireOutlined /> Giảm hạng</Tag>
              <Tag><TrophyOutlined style={{ color: '#FFD700' }} /> Dẫn đầu</Tag>
            </Space>
          </div>
        </div>

        {/* Additional Info */}
        <Alert
          message="Bảng xếp hạng được cập nhật hàng ngày"
          description="Dữ liệu được tính toán dựa trên hiệu suất thực tế và được cập nhật vào cuối mỗi ngày làm việc."
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>

      <style jsx global>{`
        .highlight-row {
          background-color: #e6f7ff;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard; 