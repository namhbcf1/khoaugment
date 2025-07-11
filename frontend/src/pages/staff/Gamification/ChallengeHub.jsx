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
  Progress,
  Tooltip,
  Badge,
  Divider,
  Alert,
  Empty,
  Statistic,
  Modal,
  Timeline,
  Avatar,
  Skeleton
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LockOutlined,
  FireOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  TeamOutlined,
  UserOutlined,
  GiftOutlined,
  CalendarOutlined,
  FlagOutlined,
  BellOutlined,
  DollarOutlined,
  HistoryOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Mock data for challenges
const mockChallenges = [
  {
    id: 1,
    title: 'Thách thức doanh số tháng 7',
    description: 'Đạt doanh số 30 triệu trong tháng 7',
    icon: <DollarOutlined style={{ fontSize: '24px', color: '#FFD700' }} />,
    progress: 65,
    status: 'in_progress',
    startDate: '2023-07-01',
    endDate: '2023-07-31',
    reward: {
      points: 500,
      badges: ['Bán hàng xuất sắc'],
      other: 'Thưởng 500,000đ'
    },
    category: 'sales',
    difficulty: 'medium',
    participants: 15,
    leaderboard: [
      { name: 'Nguyễn Văn A', progress: 85 },
      { name: 'Trần Thị B', progress: 70 },
      { name: 'Lê Văn C', progress: 65 }
    ]
  },
  {
    id: 2,
    title: 'Chuyên gia dịch vụ',
    description: 'Giải quyết 20 yêu cầu dịch vụ khách hàng trong tháng',
    icon: <HeartOutlined style={{ fontSize: '24px', color: '#FF4D4F' }} />,
    progress: 90,
    status: 'in_progress',
    startDate: '2023-07-01',
    endDate: '2023-07-31',
    reward: {
      points: 300,
      badges: ['Chuyên gia dịch vụ'],
      other: null
    },
    category: 'customer_service',
    difficulty: 'easy',
    participants: 10,
    leaderboard: [
      { name: 'Trần Thị B', progress: 95 },
      { name: 'Nguyễn Văn A', progress: 90 },
      { name: 'Phạm Văn D', progress: 85 }
    ]
  },
  {
    id: 3,
    title: 'Thử thách kiến thức sản phẩm',
    description: 'Hoàn thành tất cả bài kiểm tra kiến thức về sản phẩm mới',
    icon: <ThunderboltOutlined style={{ fontSize: '24px', color: '#1890FF' }} />,
    progress: 100,
    status: 'completed',
    startDate: '2023-06-15',
    endDate: '2023-06-30',
    reward: {
      points: 200,
      badges: ['Chuyên gia sản phẩm'],
      other: null
    },
    category: 'knowledge',
    difficulty: 'easy',
    participants: 20,
    leaderboard: [
      { name: 'Nguyễn Văn A', progress: 100 },
      { name: 'Hoàng Thị E', progress: 100 },
      { name: 'Trần Thị B', progress: 95 }
    ]
  },
  {
    id: 4,
    title: 'Thử thách đội nhóm',
    description: 'Hoàn thành mục tiêu doanh số đội 200 triệu trong quý',
    icon: <TeamOutlined style={{ fontSize: '24px', color: '#13C2C2' }} />,
    progress: 40,
    status: 'in_progress',
    startDate: '2023-07-01',
    endDate: '2023-09-30',
    reward: {
      points: 1000,
      badges: ['Tinh thần đồng đội'],
      other: 'Tiệc team building'
    },
    category: 'teamwork',
    difficulty: 'hard',
    participants: 25,
    leaderboard: [
      { name: 'Đội Laptop', progress: 50 },
      { name: 'Đội Linh kiện', progress: 45 },
      { name: 'Đội Phụ kiện', progress: 40 }
    ]
  },
  {
    id: 5,
    title: 'Thách thức bán hàng mùa tựu trường',
    description: 'Bán được 10 laptop cho học sinh, sinh viên',
    icon: <RiseOutlined style={{ fontSize: '24px', color: '#722ED1' }} />,
    progress: 0,
    status: 'upcoming',
    startDate: '2023-08-01',
    endDate: '2023-08-31',
    reward: {
      points: 600,
      badges: ['Bán hàng mùa vụ'],
      other: 'Thưởng 2% doanh số'
    },
    category: 'sales',
    difficulty: 'medium',
    participants: 0,
    leaderboard: []
  },
  {
    id: 6,
    title: 'Cao thủ bán hàng',
    description: 'Đạt doanh số cao nhất cửa hàng trong 3 tháng liên tiếp',
    icon: <TrophyOutlined style={{ fontSize: '24px', color: '#FAAD14' }} />,
    progress: 33,
    status: 'in_progress',
    startDate: '2023-06-01',
    endDate: '2023-08-31',
    reward: {
      points: 2000,
      badges: ['Vua bán hàng'],
      other: 'Thưởng 5,000,000đ'
    },
    category: 'sales',
    difficulty: 'hard',
    participants: 8,
    leaderboard: [
      { name: 'Lê Văn C', progress: 45 },
      { name: 'Nguyễn Văn A', progress: 40 },
      { name: 'Trần Thị B', progress: 33 }
    ]
  }
];

// Mock data for user stats
const mockUserStats = {
  activeChallenges: 4,
  completedChallenges: 1,
  totalPoints: 700,
  rank: 3,
  totalParticipants: 20
};

const ChallengeHub = () => {
  const [challenges, setChallenges] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [leaderboardModalVisible, setLeaderboardModalVisible] = useState(false);

  // Load data on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setChallenges(mockChallenges);
      setUserStats(mockUserStats);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter challenges based on active tab
  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return challenge.status === 'in_progress';
    if (activeTab === 'completed') return challenge.status === 'completed';
    if (activeTab === 'upcoming') return challenge.status === 'upcoming';
    if (activeTab === challenge.category) return true;
    if (activeTab === challenge.difficulty) return true;
    return false;
  });

  // Handle challenge click
  const handleChallengeClick = (challenge) => {
    setSelectedChallenge(challenge);
    setDetailModalVisible(true);
  };

  // Handle view leaderboard
  const handleViewLeaderboard = (e, challenge) => {
    e.stopPropagation();
    setSelectedChallenge(challenge);
    setLeaderboardModalVisible(true);
  };

  // Render challenge status
  const renderStatus = (status) => {
    switch (status) {
      case 'completed':
        return <Badge status="success" text="Đã hoàn thành" />;
      case 'in_progress':
        return <Badge status="processing" text="Đang diễn ra" />;
      case 'upcoming':
        return <Badge status="default" text="Sắp diễn ra" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  // Render challenge difficulty
  const renderDifficulty = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return <Tag color="#52C41A">Dễ</Tag>;
      case 'medium':
        return <Tag color="#FAAD14">Trung bình</Tag>;
      case 'hard':
        return <Tag color="#FF4D4F">Khó</Tag>;
      default:
        return <Tag>{difficulty}</Tag>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="challenge-hub">
      <Card loading={loading}>
        <Title level={2}>
          <FlagOutlined /> Trung tâm thử thách
        </Title>
        <Paragraph type="secondary">
          Tham gia các thử thách để nâng cao kỹ năng và nhận thưởng
        </Paragraph>

        {/* User Stats */}
        {userStats && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Thử thách đang tham gia"
                  value={userStats.activeChallenges}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Thử thách đã hoàn thành"
                  value={userStats.completedChallenges}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Điểm thưởng đã nhận"
                  value={userStats.totalPoints}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Xếp hạng hiện tại"
                  value={userStats.rank}
                  prefix={<TrophyOutlined />}
                  suffix={`/ ${userStats.totalParticipants}`}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Featured Challenge Alert */}
        <Alert
          message="Thử thách nổi bật: Thách thức doanh số tháng 7"
          description="Còn 10 ngày nữa để hoàn thành thử thách. Hiện tại bạn đã đạt 65% mục tiêu!"
          type="info"
          showIcon
          icon={<FireOutlined />}
          action={
            <Button size="small" type="primary" onClick={() => handleChallengeClick(challenges[0])}>
              Xem chi tiết
            </Button>
          }
          style={{ marginBottom: 16 }}
        />

        {/* Challenge Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabPosition="top"
        >
          <TabPane tab={<span>Tất cả</span>} key="all" />
          <TabPane tab={<span>Đang diễn ra</span>} key="active" />
          <TabPane tab={<span>Đã hoàn thành</span>} key="completed" />
          <TabPane tab={<span>Sắp diễn ra</span>} key="upcoming" />
          <TabPane tab={<span>Bán hàng</span>} key="sales" />
          <TabPane tab={<span>Dịch vụ khách hàng</span>} key="customer_service" />
          <TabPane tab={<span>Kiến thức</span>} key="knowledge" />
          <TabPane tab={<span>Làm việc nhóm</span>} key="teamwork" />
        </Tabs>

        {/* Challenge List */}
        <List
          grid={{ 
            gutter: 16, 
            xs: 1, 
            sm: 1, 
            md: 2, 
            lg: 2, 
            xl: 3, 
            xxl: 3 
          }}
          dataSource={filteredChallenges}
          locale={{ emptyText: <Empty description="Không có thử thách nào" /> }}
          renderItem={item => (
            <List.Item>
              <Card
                hoverable
                onClick={() => handleChallengeClick(item)}
                className={`challenge-card ${item.status}`}
                style={{ 
                  opacity: item.status === 'upcoming' ? 0.8 : 1,
                  cursor: 'pointer'
                }}
                actions={[
                  <Tooltip title="Xem chi tiết">
                    <Button type="link" icon={<ThunderboltOutlined />}>
                      Chi tiết
                    </Button>
                  </Tooltip>,
                  <Tooltip title="Xem bảng xếp hạng">
                    <Button 
                      type="link" 
                      icon={<TrophyOutlined />}
                      onClick={(e) => handleViewLeaderboard(e, item)}
                      disabled={item.status === 'upcoming'}
                    >
                      Xếp hạng
                    </Button>
                  </Tooltip>
                ]}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <Avatar 
                    size={48} 
                    icon={item.icon}
                    style={{ 
                      backgroundColor: '#fff',
                      border: '2px solid #1890ff'
                    }}
                  />
                  <div style={{ marginLeft: 16 }}>
                    <Text strong>{item.title}</Text>
                    <div>
                      <Space>
                        {renderStatus(item.status)}
                        {renderDifficulty(item.difficulty)}
                      </Space>
                    </div>
                  </div>
                </div>
                
                <Paragraph 
                  type="secondary" 
                  ellipsis={{ rows: 2 }}
                >
                  {item.description}
                </Paragraph>
                
                <Progress 
                  percent={item.progress} 
                  size="small" 
                  status={
                    item.status === 'completed' 
                      ? 'success' 
                      : item.status === 'upcoming' 
                        ? 'normal' 
                        : 'active'
                  }
                />
                
                <Row gutter={8} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      <CalendarOutlined /> {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </Text>
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      <UserOutlined /> {item.participants} người tham gia
                    </Text>
                  </Col>
                </Row>
                
                <Divider style={{ margin: '12px 0' }} />
                
                <div>
                  <Text strong>Phần thưởng:</Text>
                  <div>
                    <Space>
                      <Tag color="#108ee9">
                        <StarOutlined /> {item.reward.points} điểm
                      </Tag>
                      {item.reward.badges.map((badge, index) => (
                        <Tag color="#722ed1" key={index}>
                          <TrophyOutlined /> {badge}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />

        {/* Challenge Detail Modal */}
        <Modal
          title={selectedChallenge?.title || 'Chi tiết thử thách'}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
            selectedChallenge?.status === 'upcoming' && (
              <Button 
                key="register" 
                type="primary"
              >
                Đăng ký tham gia
              </Button>
            )
          ]}
          width={700}
        >
          {selectedChallenge && (
            <div>
              <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
                <Col span={4}>
                  <Avatar 
                    size={64} 
                    icon={selectedChallenge.icon}
                    style={{ 
                      backgroundColor: '#fff',
                      border: '3px solid #1890ff'
                    }}
                  />
                </Col>
                <Col span={20}>
                  <div style={{ marginBottom: 8 }}>
                    <Space>
                      {renderStatus(selectedChallenge.status)}
                      {renderDifficulty(selectedChallenge.difficulty)}
                      <Tag color="#108ee9">
                        {selectedChallenge.category === 'sales' && 'Bán hàng'}
                        {selectedChallenge.category === 'customer_service' && 'Dịch vụ khách hàng'}
                        {selectedChallenge.category === 'knowledge' && 'Kiến thức'}
                        {selectedChallenge.category === 'teamwork' && 'Làm việc nhóm'}
                      </Tag>
                    </Space>
                  </div>
                  
                  <Paragraph>
                    {selectedChallenge.description}
                  </Paragraph>
                </Col>
              </Row>
              
              <Card size="small" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Thời gian bắt đầu"
                      value={formatDate(selectedChallenge.startDate)}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ fontSize: '14px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Thời gian kết thúc"
                      value={formatDate(selectedChallenge.endDate)}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ fontSize: '14px' }}
                    />
                  </Col>
                </Row>
                
                {selectedChallenge.status === 'in_progress' && (
                  <div style={{ marginTop: 16 }}>
                    <Statistic
                      title="Thời gian còn lại"
                      value={`${getDaysRemaining(selectedChallenge.endDate)} ngày`}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#faad14', fontSize: '14px' }}
                    />
                  </div>
                )}
              </Card>
              
              <div style={{ marginBottom: 16 }}>
                <Text strong>Tiến trình của bạn:</Text>
                <Progress 
                  percent={selectedChallenge.progress} 
                  status={
                    selectedChallenge.status === 'completed' 
                      ? 'success' 
                      : selectedChallenge.status === 'upcoming' 
                        ? 'normal' 
                        : 'active'
                  }
                />
              </div>
              
              <Card title="Phần thưởng" size="small" style={{ marginBottom: 16 }}>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    {
                      title: 'Điểm thưởng',
                      description: `${selectedChallenge.reward.points} điểm`,
                      icon: <StarOutlined style={{ color: '#faad14' }} />
                    },
                    {
                      title: 'Huy hiệu',
                      description: selectedChallenge.reward.badges.join(', '),
                      icon: <TrophyOutlined style={{ color: '#722ed1' }} />
                    },
                    ...(selectedChallenge.reward.other ? [{
                      title: 'Phần thưởng khác',
                      description: selectedChallenge.reward.other,
                      icon: <GiftOutlined style={{ color: '#52c41a' }} />
                    }] : [])
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={item.icon} />}
                        title={item.title}
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
              </Card>
              
              {selectedChallenge.status === 'in_progress' && (
                <Card title="Bảng xếp hạng hàng đầu" size="small" style={{ marginBottom: 16 }}>
                  {selectedChallenge.leaderboard.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={selectedChallenge.leaderboard.slice(0, 3)}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                style={{ 
                                  backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                                  color: '#fff'
                                }}
                              >
                                {index + 1}
                              </Avatar>
                            }
                            title={item.name}
                            description={`Tiến độ: ${item.progress}%`}
                          />
                          <Progress 
                            percent={item.progress} 
                            size="small" 
                            showInfo={false}
                            style={{ width: 100 }}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="Chưa có dữ liệu xếp hạng" />
                  )}
                  <div style={{ textAlign: 'right', marginTop: 8 }}>
                    <Button 
                      size="small" 
                      onClick={(e) => handleViewLeaderboard(e, selectedChallenge)}
                    >
                      Xem đầy đủ
                    </Button>
                  </div>
                </Card>
              )}
              
              {selectedChallenge.status === 'in_progress' && (
                <Card title="Mẹo hoàn thành thử thách" size="small">
                  <ul>
                    <li>Theo dõi tiến độ hàng ngày</li>
                    <li>Tập trung vào các mục tiêu nhỏ</li>
                    <li>Tham khảo kinh nghiệm từ đồng nghiệp</li>
                    <li>Sử dụng các tài liệu đào tạo liên quan</li>
                  </ul>
                </Card>
              )}
              
              {selectedChallenge.status === 'completed' && (
                <Alert
                  message="Thử thách đã hoàn thành!"
                  description={`Chúc mừng! Bạn đã hoàn thành thử thách này và nhận được ${selectedChallenge.reward.points} điểm thưởng.`}
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                  style={{ marginBottom: 16 }}
                />
              )}
            </div>
          )}
        </Modal>

        {/* Leaderboard Modal */}
        <Modal
          title={`Bảng xếp hạng: ${selectedChallenge?.title || ''}`}
          open={leaderboardModalVisible}
          onCancel={() => setLeaderboardModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setLeaderboardModalVisible(false)}>
              Đóng
            </Button>
          ]}
          width={500}
        >
          {selectedChallenge && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                  <CalendarOutlined /> {formatDate(selectedChallenge.startDate)} - {formatDate(selectedChallenge.endDate)}
                </Text>
                <br />
                <Text type="secondary">
                  <UserOutlined /> {selectedChallenge.participants} người tham gia
                </Text>
              </div>
              
              {selectedChallenge.leaderboard.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={selectedChallenge.leaderboard}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            style={{ 
                              backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#1890FF',
                              color: '#fff'
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        }
                        title={
                          <Space>
                            <span>{item.name}</span>
                            {index === 0 && <TrophyOutlined style={{ color: '#FFD700' }} />}
                          </Space>
                        }
                        description={`Tiến độ: ${item.progress}%`}
                      />
                      <Progress 
                        percent={item.progress} 
                        size="small" 
                        showInfo={false}
                        style={{ width: 100 }}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Chưa có dữ liệu xếp hạng" />
              )}
              
              {selectedChallenge.status === 'in_progress' && (
                <Alert
                  message="Cập nhật hàng ngày"
                  description="Bảng xếp hạng được cập nhật vào cuối mỗi ngày làm việc."
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default ChallengeHub; 