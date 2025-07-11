import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Tabs,
  List,
  Space,
  Tag,
  Button,
  Avatar,
  Modal,
  Empty,
  Tooltip,
  Badge as AntBadge,
  Divider,
  Progress,
  Statistic
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  CheckCircleOutlined,
  LockOutlined,
  RocketOutlined,
  CrownOutlined,
  FireOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  TeamOutlined,
  ShareAltOutlined,
  GiftOutlined,
  HistoryOutlined,
  BookOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  ToolOutlined,
  ScheduleOutlined,
  DollarOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Mock data for badges
const mockBadges = [
  {
    id: 1,
    name: 'Bán hàng xuất sắc',
    description: 'Đạt doanh số trên 50 triệu trong một tháng',
    icon: <StarOutlined style={{ fontSize: '24px', color: '#FFD700' }} />,
    category: 'sales',
    rarity: 'rare',
    acquired: true,
    acquiredDate: '2023-06-15',
    level: 2,
    maxLevel: 3,
    progress: 100
  },
  {
    id: 2,
    name: 'Tư vấn viên 5 sao',
    description: 'Nhận được 10 đánh giá 5 sao từ khách hàng',
    icon: <HeartOutlined style={{ fontSize: '24px', color: '#FF4D4F' }} />,
    category: 'customer_service',
    rarity: 'uncommon',
    acquired: true,
    acquiredDate: '2023-05-20',
    level: 1,
    maxLevel: 3,
    progress: 100
  },
  {
    id: 3,
    name: 'Chuyên gia sản phẩm',
    description: 'Hoàn thành tất cả khóa đào tạo về sản phẩm',
    icon: <BookOutlined style={{ fontSize: '24px', color: '#52C41A' }} />,
    category: 'knowledge',
    rarity: 'uncommon',
    acquired: false,
    acquiredDate: null,
    level: 0,
    maxLevel: 3,
    progress: 65
  },
  {
    id: 4,
    name: 'Vua bán hàng',
    description: 'Đạt doanh số cao nhất trong một quý',
    icon: <CrownOutlined style={{ fontSize: '24px', color: '#722ED1' }} />,
    category: 'sales',
    rarity: 'epic',
    acquired: false,
    acquiredDate: null,
    level: 0,
    maxLevel: 1,
    progress: 0
  },
  {
    id: 5,
    name: 'Tinh thần đồng đội',
    description: 'Hỗ trợ đồng nghiệp hoàn thành mục tiêu',
    icon: <TeamOutlined style={{ fontSize: '24px', color: '#13C2C2' }} />,
    category: 'teamwork',
    rarity: 'common',
    acquired: true,
    acquiredDate: '2023-04-10',
    level: 3,
    maxLevel: 3,
    progress: 100
  },
  {
    id: 6,
    name: 'Chuyên gia kỹ thuật',
    description: 'Giải quyết thành công 20 vấn đề kỹ thuật phức tạp',
    icon: <ToolOutlined style={{ fontSize: '24px', color: '#1890FF' }} />,
    category: 'technical',
    rarity: 'rare',
    acquired: false,
    acquiredDate: null,
    level: 0,
    maxLevel: 3,
    progress: 40
  },
  {
    id: 7,
    name: 'Nhân viên xuất sắc',
    description: 'Được bình chọn là nhân viên xuất sắc của tháng',
    icon: <TrophyOutlined style={{ fontSize: '24px', color: '#FAAD14' }} />,
    category: 'achievement',
    rarity: 'rare',
    acquired: true,
    acquiredDate: '2023-07-01',
    level: 1,
    maxLevel: 12,
    progress: 100
  },
  {
    id: 8,
    name: 'Người dẫn đầu xu hướng',
    description: 'Dự đoán chính xác xu hướng thị trường và đạt doanh số cao',
    icon: <RocketOutlined style={{ fontSize: '24px', color: '#EB2F96' }} />,
    category: 'sales',
    rarity: 'legendary',
    acquired: false,
    acquiredDate: null,
    level: 0,
    maxLevel: 1,
    progress: 0
  },
  {
    id: 9,
    name: 'Chuyên gia dịch vụ',
    description: 'Giải quyết thành công 50 yêu cầu dịch vụ khách hàng',
    icon: <CustomerServiceOutlined style={{ fontSize: '24px', color: '#FA8C16' }} />,
    category: 'customer_service',
    rarity: 'uncommon',
    acquired: true,
    acquiredDate: '2023-03-15',
    level: 2,
    maxLevel: 3,
    progress: 100
  },
  {
    id: 10,
    name: 'Người đúng giờ',
    description: 'Không đi muộn trong 3 tháng liên tiếp',
    icon: <ScheduleOutlined style={{ fontSize: '24px', color: '#1890FF' }} />,
    category: 'discipline',
    rarity: 'common',
    acquired: true,
    acquiredDate: '2023-06-30',
    level: 1,
    maxLevel: 3,
    progress: 100
  },
  {
    id: 11,
    name: 'Cao thủ bán hàng',
    description: 'Đạt doanh số trên 100 triệu trong một tháng',
    icon: <DollarOutlined style={{ fontSize: '24px', color: '#52C41A' }} />,
    category: 'sales',
    rarity: 'epic',
    acquired: false,
    acquiredDate: null,
    level: 0,
    maxLevel: 3,
    progress: 45
  },
  {
    id: 12,
    name: 'Người bảo vệ',
    description: 'Phát hiện và ngăn chặn 5 trường hợp gian lận',
    icon: <SafetyOutlined style={{ fontSize: '24px', color: '#722ED1' }} />,
    category: 'security',
    rarity: 'rare',
    acquired: false,
    acquiredDate: null,
    level: 0,
    maxLevel: 3,
    progress: 20
  }
];

// Mock data for user stats
const mockUserStats = {
  totalBadges: 6,
  totalBadgesAvailable: 12,
  rarityCount: {
    common: 1,
    uncommon: 2,
    rare: 2,
    epic: 0,
    legendary: 0
  },
  categoryCount: {
    sales: 1,
    customer_service: 2,
    knowledge: 0,
    teamwork: 1,
    technical: 0,
    achievement: 1,
    discipline: 1,
    security: 0
  },
  recentlyAcquired: {
    name: 'Nhân viên xuất sắc',
    date: '2023-07-01'
  }
};

const BadgeCollection = () => {
  const [badges, setBadges] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Load data on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBadges(mockBadges);
      setUserStats(mockUserStats);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter badges based on active tab
  const filteredBadges = badges.filter(badge => {
    if (activeTab === 'all') return true;
    if (activeTab === 'acquired') return badge.acquired;
    if (activeTab === 'not_acquired') return !badge.acquired;
    if (activeTab === badge.category) return true;
    if (activeTab === badge.rarity) return true;
    return false;
  });

  // Handle badge click
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setDetailModalVisible(true);
  };

  // Get color for rarity
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return '#8C8C8C';
      case 'uncommon':
        return '#52C41A';
      case 'rare':
        return '#1890FF';
      case 'epic':
        return '#722ED1';
      case 'legendary':
        return '#FAAD14';
      default:
        return '#8C8C8C';
    }
  };

  // Get label for rarity
  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'Phổ biến';
      case 'uncommon':
        return 'Không phổ biến';
      case 'rare':
        return 'Hiếm';
      case 'epic':
        return 'Sử thi';
      case 'legendary':
        return 'Huyền thoại';
      default:
        return rarity;
    }
  };

  // Get label for category
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'sales':
        return 'Bán hàng';
      case 'customer_service':
        return 'Dịch vụ khách hàng';
      case 'knowledge':
        return 'Kiến thức';
      case 'teamwork':
        return 'Làm việc nhóm';
      case 'technical':
        return 'Kỹ thuật';
      case 'achievement':
        return 'Thành tích';
      case 'discipline':
        return 'Kỷ luật';
      case 'security':
        return 'An ninh';
      default:
        return category;
    }
  };

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sales':
        return <DollarOutlined />;
      case 'customer_service':
        return <CustomerServiceOutlined />;
      case 'knowledge':
        return <BookOutlined />;
      case 'teamwork':
        return <TeamOutlined />;
      case 'technical':
        return <ToolOutlined />;
      case 'achievement':
        return <TrophyOutlined />;
      case 'discipline':
        return <ScheduleOutlined />;
      case 'security':
        return <SafetyOutlined />;
      default:
        return <StarOutlined />;
    }
  };

  return (
    <div className="badge-collection">
      <Card loading={loading}>
        <Title level={2}>
          <TrophyOutlined /> Bộ sưu tập huy hiệu
        </Title>
        <Paragraph type="secondary">
          Khám phá và sưu tầm các huy hiệu thành tích trong sự nghiệp của bạn
        </Paragraph>

        {/* User Stats */}
        {userStats && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Huy hiệu đã sở hữu"
                  value={userStats.totalBadges}
                  suffix={`/ ${userStats.totalBadgesAvailable}`}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Progress 
                  percent={Math.round((userStats.totalBadges / userStats.totalBadgesAvailable) * 100)} 
                  size="small" 
                  showInfo={false}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Huy hiệu hiếm"
                  value={userStats.rarityCount.rare + userStats.rarityCount.epic + userStats.rarityCount.legendary}
                  valueStyle={{ color: '#722ED1' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Space>
                    <Tag color={getRarityColor('rare')}>{userStats.rarityCount.rare} hiếm</Tag>
                    <Tag color={getRarityColor('epic')}>{userStats.rarityCount.epic} sử thi</Tag>
                    <Tag color={getRarityColor('legendary')}>{userStats.rarityCount.legendary} huyền thoại</Tag>
                  </Space>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Huy hiệu bán hàng"
                  value={userStats.categoryCount.sales}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Huy hiệu gần đây"
                  value={userStats.recentlyAcquired.name}
                  valueStyle={{ fontSize: '14px' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Đạt được vào: {userStats.recentlyAcquired.date}</Text>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Badge Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabPosition="top"
        >
          <TabPane tab={<span>Tất cả</span>} key="all" />
          <TabPane tab={<span>Đã sở hữu</span>} key="acquired" />
          <TabPane tab={<span>Chưa sở hữu</span>} key="not_acquired" />
          <TabPane tab={<span>Bán hàng</span>} key="sales" />
          <TabPane tab={<span>Dịch vụ khách hàng</span>} key="customer_service" />
          <TabPane tab={<span>Kiến thức</span>} key="knowledge" />
          <TabPane tab={<span>Làm việc nhóm</span>} key="teamwork" />
          <TabPane tab={<span>Hiếm</span>} key="rare" />
          <TabPane tab={<span>Sử thi</span>} key="epic" />
          <TabPane tab={<span>Huyền thoại</span>} key="legendary" />
        </Tabs>

        {/* Badge Grid */}
        <List
          grid={{ 
            gutter: 16, 
            xs: 2, 
            sm: 3, 
            md: 4, 
            lg: 6, 
            xl: 6, 
            xxl: 8 
          }}
          dataSource={filteredBadges}
          locale={{ emptyText: <Empty description="Không có huy hiệu nào" /> }}
          renderItem={item => (
            <List.Item>
              <div 
                className={`badge-item ${item.acquired ? 'acquired' : 'not-acquired'}`}
                onClick={() => handleBadgeClick(item)}
                style={{ 
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '16px 8px',
                  border: `1px solid ${item.acquired ? getRarityColor(item.rarity) : '#f0f0f0'}`,
                  borderRadius: '8px',
                  backgroundColor: item.acquired ? 'white' : '#f5f5f5',
                  opacity: item.acquired ? 1 : 0.7,
                  transition: 'all 0.3s'
                }}
              >
                <Tooltip title={item.name}>
                  <AntBadge 
                    count={item.level > 0 ? item.level : 0} 
                    overflowCount={10}
                    style={{ backgroundColor: item.level > 0 ? getRarityColor(item.rarity) : '#d9d9d9' }}
                  >
                    <Avatar 
                      size={64} 
                      icon={item.icon}
                      style={{ 
                        backgroundColor: '#fff',
                        border: `2px solid ${item.acquired ? getRarityColor(item.rarity) : '#d9d9d9'}`
                      }}
                    />
                  </AntBadge>
                </Tooltip>
                <div style={{ marginTop: 8 }}>
                  <Text 
                    strong 
                    style={{ 
                      fontSize: '12px',
                      color: item.acquired ? 'inherit' : '#8c8c8c'
                    }}
                  >
                    {item.name}
                  </Text>
                </div>
                <div>
                  <Tag 
                    color={item.acquired ? getRarityColor(item.rarity) : '#d9d9d9'} 
                    style={{ margin: '4px 0', fontSize: '10px' }}
                  >
                    {getRarityLabel(item.rarity)}
                  </Tag>
                </div>
                {!item.acquired && item.progress > 0 && (
                  <Progress 
                    percent={item.progress} 
                    size="small" 
                    showInfo={false}
                    strokeColor={getRarityColor(item.rarity)}
                  />
                )}
              </div>
            </List.Item>
          )}
        />

        {/* Badge Detail Modal */}
        <Modal
          title={
            <Space>
              {selectedBadge?.icon}
              <span>{selectedBadge?.name}</span>
            </Space>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
            selectedBadge?.acquired && (
              <Button 
                key="share" 
                type="primary" 
                icon={<ShareAltOutlined />}
              >
                Chia sẻ huy hiệu
              </Button>
            )
          ]}
          width={600}
        >
          {selectedBadge && (
            <div>
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <AntBadge 
                  count={selectedBadge.level > 0 ? selectedBadge.level : 0} 
                  overflowCount={10}
                  style={{ backgroundColor: selectedBadge.level > 0 ? getRarityColor(selectedBadge.rarity) : '#d9d9d9' }}
                >
                  <Avatar 
                    size={100} 
                    icon={selectedBadge.icon}
                    style={{ 
                      backgroundColor: '#fff',
                      border: `3px solid ${selectedBadge.acquired ? getRarityColor(selectedBadge.rarity) : '#d9d9d9'}`
                    }}
                  />
                </AntBadge>
              </div>
              
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Tag color={getRarityColor(selectedBadge.rarity)}>
                  {getRarityLabel(selectedBadge.rarity)}
                </Tag>
                <Tag color="#108ee9">
                  {getCategoryLabel(selectedBadge.category)}
                </Tag>
                {selectedBadge.acquired ? (
                  <Tag color="#52c41a" icon={<CheckCircleOutlined />}>
                    Đã sở hữu
                  </Tag>
                ) : (
                  <Tag color="#d9d9d9" icon={<LockOutlined />}>
                    Chưa sở hữu
                  </Tag>
                )}
              </div>
              
              <Paragraph>
                <strong>Mô tả:</strong> {selectedBadge.description}
              </Paragraph>
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Cấp độ hiện tại"
                    value={selectedBadge.level}
                    suffix={`/ ${selectedBadge.maxLevel}`}
                    valueStyle={{ color: getRarityColor(selectedBadge.rarity) }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tiến trình"
                    value={selectedBadge.progress}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Progress 
                    percent={selectedBadge.progress} 
                    status={selectedBadge.acquired ? 'success' : 'active'}
                    strokeColor={getRarityColor(selectedBadge.rarity)}
                  />
                </Col>
              </Row>
              
              <Divider />
              
              {selectedBadge.acquired ? (
                <div>
                  <Title level={5}>
                    <HistoryOutlined /> Lịch sử đạt được
                  </Title>
                  <List
                    size="small"
                    bordered
                    dataSource={[
                      {
                        level: selectedBadge.level,
                        date: selectedBadge.acquiredDate,
                        description: `Đạt cấp độ ${selectedBadge.level} vào ngày ${selectedBadge.acquiredDate}`
                      }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: getRarityColor(selectedBadge.rarity) }}>{item.level}</Avatar>}
                          title={`Cấp độ ${item.level}`}
                          description={item.description}
                        />
                      </List.Item>
                    )}
                  />
                  
                  {selectedBadge.level < selectedBadge.maxLevel && (
                    <div style={{ marginTop: 16 }}>
                      <Title level={5}>
                        <RocketOutlined /> Cấp độ tiếp theo
                      </Title>
                      <Card size="small">
                        <Space>
                          <Avatar style={{ backgroundColor: '#d9d9d9' }}>{selectedBadge.level + 1}</Avatar>
                          <div>
                            <Text strong>Cấp độ {selectedBadge.level + 1}</Text>
                            <div>
                              <Text type="secondary">Tiếp tục thực hiện nhiệm vụ để đạt cấp độ tiếp theo</Text>
                            </div>
                          </div>
                        </Space>
                      </Card>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Title level={5}>
                    <RocketOutlined /> Làm thế nào để đạt được?
                  </Title>
                  <List
                    size="small"
                    bordered
                    dataSource={[
                      `Hoàn thành các nhiệm vụ liên quan đến ${getCategoryLabel(selectedBadge.category)}`,
                      selectedBadge.description,
                      'Theo dõi tiến trình trong báo cáo hàng ngày'
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <CheckCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </div>
              )}
              
              <div style={{ marginTop: 16 }}>
                <Title level={5}>
                  <GiftOutlined /> Phần thưởng
                </Title>
                <List
                  size="small"
                  bordered
                  dataSource={[
                    'Điểm thưởng dựa trên độ hiếm của huy hiệu',
                    'Hiển thị trong hồ sơ nhân viên',
                    'Ghi nhận trong báo cáo thành tích'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <GiftOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                      {item}
                    </List.Item>
                  )}
                />
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default BadgeCollection; 