import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Progress,
  Tabs,
  List,
  Space,
  Tag,
  Button,
  Avatar,
  Tooltip,
  Badge,
  Divider,
  Alert,
  Empty,
  Statistic,
  Modal
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
  ShareAltOutlined,
  InfoCircleOutlined,
  BellOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Mock data for achievements
const mockAchievements = [
  {
    id: 1,
    title: 'Bán hàng xuất sắc',
    description: 'Đạt doanh số 50 triệu trong một tháng',
    icon: <StarOutlined style={{ fontSize: '24px', color: '#FFD700' }} />,
    progress: 100,
    status: 'completed',
    completedDate: '2023-06-15',
    points: 500,
    category: 'sales',
    level: 1
  },
  {
    id: 2,
    title: 'Chuyên gia tư vấn',
    description: 'Nhận được 10 đánh giá 5 sao từ khách hàng',
    icon: <HeartOutlined style={{ fontSize: '24px', color: '#FF4D4F' }} />,
    progress: 80,
    status: 'in_progress',
    completedDate: null,
    points: 300,
    category: 'customer_service',
    level: 1
  },
  {
    id: 3,
    title: 'Nhân viên mới xuất sắc',
    description: 'Hoàn thành tất cả các khóa đào tạo cơ bản',
    icon: <CheckCircleOutlined style={{ fontSize: '24px', color: '#52C41A' }} />,
    progress: 100,
    status: 'completed',
    completedDate: '2023-05-20',
    points: 200,
    category: 'training',
    level: 1
  },
  {
    id: 4,
    title: 'Chuyên gia sản phẩm',
    description: 'Hoàn thành khóa học về tất cả dòng sản phẩm',
    icon: <ThunderboltOutlined style={{ fontSize: '24px', color: '#1890FF' }} />,
    progress: 65,
    status: 'in_progress',
    completedDate: null,
    points: 400,
    category: 'training',
    level: 2
  },
  {
    id: 5,
    title: 'Cao thủ bán hàng',
    description: 'Đạt doanh số 100 triệu trong một tháng',
    icon: <TrophyOutlined style={{ fontSize: '24px', color: '#FFD700' }} />,
    progress: 45,
    status: 'in_progress',
    completedDate: null,
    points: 800,
    category: 'sales',
    level: 2
  },
  {
    id: 6,
    title: 'Người dẫn đầu',
    description: 'Đứng đầu bảng xếp hạng doanh số trong một quý',
    icon: <RiseOutlined style={{ fontSize: '24px', color: '#722ED1' }} />,
    progress: 0,
    status: 'locked',
    completedDate: null,
    points: 1000,
    category: 'sales',
    level: 3
  },
  {
    id: 7,
    title: 'Tinh thần đồng đội',
    description: 'Hỗ trợ 5 đồng nghiệp hoàn thành mục tiêu',
    icon: <TeamOutlined style={{ fontSize: '24px', color: '#13C2C2' }} />,
    progress: 60,
    status: 'in_progress',
    completedDate: null,
    points: 300,
    category: 'teamwork',
    level: 1
  },
  {
    id: 8,
    title: 'Chuyên gia giải quyết vấn đề',
    description: 'Giải quyết thành công 10 vấn đề khó của khách hàng',
    icon: <FireOutlined style={{ fontSize: '24px', color: '#FA8C16' }} />,
    progress: 40,
    status: 'in_progress',
    completedDate: null,
    points: 500,
    category: 'customer_service',
    level: 2
  }
];

// Mock data for user stats
const mockUserStats = {
  totalPoints: 1250,
  level: 3,
  nextLevelPoints: 2000,
  completedAchievements: 2,
  inProgressAchievements: 5,
  rank: 5,
  totalStaff: 20
};

const AchievementCenter = () => {
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  // Load data on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAchievements(mockAchievements);
      setUserStats(mockUserStats);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter achievements based on active tab
  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return achievement.status === 'completed';
    if (activeTab === 'in_progress') return achievement.status === 'in_progress';
    if (activeTab === 'locked') return achievement.status === 'locked';
    if (activeTab === achievement.category) return true;
    return false;
  });

  // Handle achievement click
  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setDetailModalVisible(true);
  };

  // Render achievement status
  const renderStatus = (status, progress) => {
    switch (status) {
      case 'completed':
        return <Badge status="success" text="Đã hoàn thành" />;
      case 'in_progress':
        return <Badge status="processing" text={`Đang tiến hành (${progress}%)`} />;
      case 'locked':
        return <Badge status="default" text="Chưa mở khóa" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  // Render achievement level
  const renderLevel = (level) => {
    const colors = ['#52C41A', '#1890FF', '#722ED1', '#FA8C16', '#EB2F96'];
    return (
      <Tag color={colors[level - 1] || colors[0]}>
        Cấp {level}
      </Tag>
    );
  };

  return (
    <div className="achievement-center">
      <Card loading={loading}>
        <Title level={2}>
          <TrophyOutlined /> Trung tâm thành tích
        </Title>
        <Paragraph type="secondary">
          Theo dõi tiến trình và đạt được các thành tích để nhận điểm thưởng và phần thưởng
        </Paragraph>

        {/* User Stats */}
        {userStats && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Điểm thưởng"
                  value={userStats.totalPoints}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Cấp độ"
                  value={userStats.level}
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                  suffix={`/ 10`}
                />
                <Progress 
                  percent={Math.round((userStats.totalPoints / userStats.nextLevelPoints) * 100)} 
                  size="small" 
                  status="active" 
                  showInfo={false}
                />
                <Text type="secondary">
                  {userStats.nextLevelPoints - userStats.totalPoints} điểm để lên cấp tiếp theo
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Thành tích đã đạt"
                  value={userStats.completedAchievements}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                  suffix={`/ ${achievements.length}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Xếp hạng"
                  value={userStats.rank}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                  suffix={`/ ${userStats.totalStaff}`}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Recent Achievements Alert */}
        <Alert
          message="Thành tích mới đạt được!"
          description="Chúc mừng! Bạn vừa đạt được thành tích 'Bán hàng xuất sắc'. Nhận ngay 500 điểm thưởng!"
          type="success"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="primary">
              Xem chi tiết
            </Button>
          }
        />

        {/* Achievement Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabPosition="top"
        >
          <TabPane 
            tab={<span><InfoCircleOutlined /> Tất cả</span>} 
            key="all"
          />
          <TabPane 
            tab={<span><CheckCircleOutlined /> Đã hoàn thành</span>} 
            key="completed"
          />
          <TabPane 
            tab={<span><ClockCircleOutlined /> Đang tiến hành</span>} 
            key="in_progress"
          />
          <TabPane 
            tab={<span><LockOutlined /> Chưa mở khóa</span>} 
            key="locked"
          />
          <TabPane 
            tab={<span><RiseOutlined /> Bán hàng</span>} 
            key="sales"
          />
          <TabPane 
            tab={<span><HeartOutlined /> Dịch vụ khách hàng</span>} 
            key="customer_service"
          />
          <TabPane 
            tab={<span><ThunderboltOutlined /> Đào tạo</span>} 
            key="training"
          />
          <TabPane 
            tab={<span><TeamOutlined /> Làm việc nhóm</span>} 
            key="teamwork"
          />
        </Tabs>

        {/* Achievement List */}
        <List
          grid={{ 
            gutter: 16, 
            xs: 1, 
            sm: 2, 
            md: 3, 
            lg: 3, 
            xl: 4, 
            xxl: 4 
          }}
          dataSource={filteredAchievements}
          locale={{ emptyText: <Empty description="Không có thành tích nào" /> }}
          renderItem={item => (
            <List.Item>
              <Card
                hoverable
                onClick={() => handleAchievementClick(item)}
                className={`achievement-card ${item.status}`}
                style={{ 
                  opacity: item.status === 'locked' ? 0.7 : 1,
                  cursor: 'pointer'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Avatar 
                    size={64} 
                    icon={item.icon}
                    style={{ 
                      backgroundColor: item.status === 'locked' ? '#f0f0f0' : '#fff',
                      border: '2px solid #1890ff'
                    }}
                  />
                </div>
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <Text strong>{item.title}</Text>
                  <div>
                    <Space>
                      {renderLevel(item.level)}
                      <Tag color="#108ee9">{item.points} điểm</Tag>
                    </Space>
                  </div>
                </div>
                <Paragraph 
                  type="secondary" 
                  ellipsis={{ rows: 2 }}
                  style={{ fontSize: '12px', textAlign: 'center' }}
                >
                  {item.description}
                </Paragraph>
                <Progress 
                  percent={item.progress} 
                  size="small" 
                  status={
                    item.status === 'completed' 
                      ? 'success' 
                      : item.status === 'locked' 
                        ? 'exception' 
                        : 'active'
                  }
                />
                <div style={{ marginTop: 8 }}>
                  {renderStatus(item.status, item.progress)}
                </div>
              </Card>
            </List.Item>
          )}
        />

        {/* Achievement Detail Modal */}
        <Modal
          title={selectedAchievement?.title || 'Chi tiết thành tích'}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
            selectedAchievement?.status === 'completed' && (
              <Button 
                key="share" 
                type="primary" 
                icon={<ShareAltOutlined />}
              >
                Chia sẻ thành tích
              </Button>
            )
          ]}
          width={600}
        >
          {selectedAchievement && (
            <div>
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <Avatar 
                  size={80} 
                  icon={selectedAchievement.icon}
                  style={{ 
                    backgroundColor: '#fff',
                    border: '3px solid #1890ff'
                  }}
                />
              </div>
              
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Space>
                  {renderLevel(selectedAchievement.level)}
                  <Tag color="#108ee9">{selectedAchievement.points} điểm</Tag>
                  {renderStatus(selectedAchievement.status, selectedAchievement.progress)}
                </Space>
              </div>
              
              <Paragraph>
                {selectedAchievement.description}
              </Paragraph>
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Tiến trình:</Text>
                  <Progress 
                    percent={selectedAchievement.progress} 
                    status={
                      selectedAchievement.status === 'completed' 
                        ? 'success' 
                        : selectedAchievement.status === 'locked' 
                          ? 'exception' 
                          : 'active'
                    }
                  />
                </Col>
                <Col span={12}>
                  <Text strong>Danh mục:</Text>
                  <div>
                    {selectedAchievement.category === 'sales' && <Tag color="blue">Bán hàng</Tag>}
                    {selectedAchievement.category === 'customer_service' && <Tag color="red">Dịch vụ khách hàng</Tag>}
                    {selectedAchievement.category === 'training' && <Tag color="green">Đào tạo</Tag>}
                    {selectedAchievement.category === 'teamwork' && <Tag color="purple">Làm việc nhóm</Tag>}
                  </div>
                </Col>
              </Row>
              
              <Divider />
              
              {selectedAchievement.status === 'completed' ? (
                <Alert
                  message="Thành tích đã đạt được"
                  description={`Chúc mừng! Bạn đã hoàn thành thành tích này vào ngày ${selectedAchievement.completedDate} và nhận được ${selectedAchievement.points} điểm thưởng.`}
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                />
              ) : selectedAchievement.status === 'in_progress' ? (
                <Alert
                  message="Thành tích đang tiến hành"
                  description={`Tiếp tục nỗ lực để hoàn thành thành tích này và nhận ${selectedAchievement.points} điểm thưởng.`}
                  type="info"
                  showIcon
                  icon={<ClockCircleOutlined />}
                />
              ) : (
                <Alert
                  message="Thành tích chưa mở khóa"
                  description="Bạn cần hoàn thành các thành tích trước để mở khóa thành tích này."
                  type="warning"
                  showIcon
                  icon={<LockOutlined />}
                />
              )}
              
              {selectedAchievement.status === 'in_progress' && (
                <div style={{ marginTop: 16 }}>
                  <Title level={5}>Các bước để hoàn thành:</Title>
                  <List
                    size="small"
                    bordered
                    dataSource={[
                      'Tiếp tục thực hiện nhiệm vụ liên quan',
                      'Theo dõi tiến trình trong báo cáo hàng ngày',
                      'Tham khảo các tài liệu đào tạo liên quan'
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
              
              {selectedAchievement.status === 'completed' && (
                <div style={{ marginTop: 16 }}>
                  <Title level={5}>Phần thưởng đã nhận:</Title>
                  <List
                    size="small"
                    bordered
                    dataSource={[
                      `${selectedAchievement.points} điểm thưởng`,
                      'Huy hiệu thành tích',
                      'Ghi nhận trong hồ sơ nhân viên'
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <GiftOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default AchievementCenter; 