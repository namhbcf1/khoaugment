import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Progress,
  Space,
  Tag,
  Button,
  Avatar,
  Tooltip,
  Badge,
  List,
  Divider,
  Statistic,
  Popover,
  Skeleton
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  RiseOutlined,
  FireOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  TeamOutlined,
  FlagOutlined,
  GiftOutlined,
  BellOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Mock data for user stats
const mockUserStats = {
  name: 'Nguyễn Văn A',
  points: 2450,
  level: 5,
  nextLevelPoints: 3000,
  rank: 3,
  totalStaff: 20,
  badges: {
    total: 12,
    recent: {
      name: 'Nhân viên xuất sắc',
      icon: <TrophyOutlined style={{ color: '#FAAD14' }} />,
      date: '2023-07-01'
    }
  },
  challenges: {
    active: 3,
    completed: 8,
    upcoming: 2
  },
  achievements: {
    total: 15,
    completed: 9,
    inProgress: 6
  },
  sales: {
    current: 28500000,
    target: 50000000,
    percentage: 57
  },
  rewards: {
    available: 3,
    points: 2450
  }
};

// Mock data for leaderboard
const mockLeaderboard = [
  {
    rank: 1,
    name: 'Trần Thị B',
    points: 3200,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    rank: 2,
    name: 'Lê Văn C',
    points: 2800,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    rank: 3,
    name: 'Nguyễn Văn A',
    points: 2450,
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
  },
  {
    rank: 4,
    name: 'Phạm Thị D',
    points: 2100,
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg'
  },
  {
    rank: 5,
    name: 'Hoàng Văn E',
    points: 1950,
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg'
  }
];

// Mock data for achievements
const mockAchievements = [
  {
    id: 1,
    title: 'Bán hàng xuất sắc',
    progress: 100,
    status: 'completed',
    icon: <StarOutlined style={{ color: '#FFD700' }} />
  },
  {
    id: 2,
    title: 'Chuyên gia tư vấn',
    progress: 80,
    status: 'in_progress',
    icon: <HeartOutlined style={{ color: '#FF4D4F' }} />
  },
  {
    id: 3,
    title: 'Cao thủ bán hàng',
    progress: 45,
    status: 'in_progress',
    icon: <TrophyOutlined style={{ color: '#FFD700' }} />
  }
];

// Mock data for challenges
const mockChallenges = [
  {
    id: 1,
    title: 'Thách thức doanh số tháng 7',
    progress: 65,
    status: 'in_progress',
    daysLeft: 10,
    icon: <DollarOutlined style={{ color: '#1890FF' }} />
  },
  {
    id: 2,
    title: 'Chuyên gia dịch vụ',
    progress: 90,
    status: 'in_progress',
    daysLeft: 12,
    icon: <HeartOutlined style={{ color: '#FF4D4F' }} />
  }
];

// Mock data for rewards
const mockRewards = [
  {
    id: 1,
    title: 'Voucher cafe',
    points: 500,
    image: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
  },
  {
    id: 2,
    title: 'Áo thun công ty',
    points: 1000,
    image: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
  },
  {
    id: 3,
    title: 'Ngày nghỉ phép thêm',
    points: 2000,
    image: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
  }
];

// Profile Widget Component
const ProfileWidget = ({ userStats, loading }) => {
  return (
    <Card 
      loading={loading} 
      className="gamification-widget profile-widget"
      title={
        <Space>
          <UserOutlined />
          <span>Hồ sơ của tôi</span>
        </Space>
      }
      size="small"
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Avatar 
          size={64} 
          icon={<UserOutlined />} 
          src="https://randomuser.me/api/portraits/men/22.jpg"
        />
        <div style={{ marginTop: 8 }}>
          <Text strong>{userStats.name}</Text>
          <div>
            <Tag color="#108ee9">Cấp {userStats.level}</Tag>
            <Tag color="#722ed1">Hạng {userStats.rank}</Tag>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Điểm thưởng</Text>
          <Text strong>{userStats.points}</Text>
        </div>
        <Progress 
          percent={Math.round((userStats.points / userStats.nextLevelPoints) * 100)} 
          size="small" 
          status="active"
          showInfo={false}
        />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Còn {userStats.nextLevelPoints - userStats.points} điểm để lên cấp {userStats.level + 1}
        </Text>
      </div>
      
      <Divider style={{ margin: '12px 0' }} />
      
      <Row gutter={8}>
        <Col span={8}>
          <Statistic
            title="Huy hiệu"
            value={userStats.badges.total}
            valueStyle={{ fontSize: '18px' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Thử thách"
            value={userStats.challenges.active}
            valueStyle={{ fontSize: '18px' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Thành tích"
            value={userStats.achievements.completed}
            valueStyle={{ fontSize: '18px' }}
          />
        </Col>
      </Row>
    </Card>
  );
};

// Points Widget Component
const PointsWidget = ({ userStats, loading }) => {
  return (
    <Card 
      loading={loading} 
      className="gamification-widget points-widget"
      title={
        <Space>
          <StarOutlined />
          <span>Điểm thưởng</span>
        </Space>
      }
      size="small"
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Statistic
          value={userStats.points}
          prefix={<StarOutlined />}
          valueStyle={{ color: '#faad14' }}
        />
        <Text type="secondary">Tổng điểm đã tích lũy</Text>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Text strong>Tiến trình lên cấp:</Text>
        <Progress 
          percent={Math.round((userStats.points / userStats.nextLevelPoints) * 100)} 
          status="active"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary">Cấp {userStats.level}</Text>
          <Text type="secondary">Cấp {userStats.level + 1}</Text>
        </div>
      </div>
      
      <Divider style={{ margin: '12px 0' }} />
      
      <div>
        <Text strong>Lịch sử gần đây:</Text>
        <List
          size="small"
          dataSource={[
            { title: 'Hoàn thành thử thách Kiến thức sản phẩm', points: 200, date: '2023-07-15' },
            { title: 'Đạt huy hiệu Nhân viên xuất sắc', points: 500, date: '2023-07-01' },
            { title: 'Hoàn thành thử thách Dịch vụ khách hàng', points: 300, date: '2023-06-28' }
          ]}
          renderItem={item => (
            <List.Item>
              <div>
                <div>{item.title}</div>
                <div>
                  <Text type="success">+{item.points} điểm</Text>
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
                    {item.date}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button type="link" icon={<HistoryOutlined />}>
          Xem lịch sử đầy đủ
        </Button>
      </div>
    </Card>
  );
};

// Leaderboard Widget Component
const LeaderboardWidget = ({ leaderboard, loading }) => {
  return (
    <Card 
      loading={loading} 
      className="gamification-widget leaderboard-widget"
      title={
        <Space>
          <TrophyOutlined />
          <span>Bảng xếp hạng</span>
        </Space>
      }
      size="small"
      extra={<Button type="link" size="small">Xem đầy đủ</Button>}
    >
      <List
        dataSource={leaderboard}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar 
                  style={{ 
                    backgroundColor: item.rank === 1 ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : item.rank === 3 ? '#CD7F32' : '#f0f0f0',
                    color: '#fff',
                    marginRight: 8
                  }}
                >
                  {item.rank}
                </Avatar>
              }
              title={
                <Space>
                  <Avatar src={item.avatar} size="small" />
                  <Text>{item.name}</Text>
                  {item.rank === 1 && <TrophyOutlined style={{ color: '#FFD700' }} />}
                </Space>
              }
            />
            <div>
              <Tag color="#108ee9">{item.points} điểm</Tag>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

// Achievements Widget Component
const AchievementsWidget = ({ achievements, loading }) => {
  return (
    <Card 
      loading={loading} 
      className="gamification-widget achievements-widget"
      title={
        <Space>
          <CheckCircleOutlined />
          <span>Thành tích gần đây</span>
        </Space>
      }
      size="small"
      extra={<Button type="link" size="small">Xem tất cả</Button>}
    >
      <List
        dataSource={achievements}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar 
                  icon={item.icon}
                  style={{ 
                    backgroundColor: '#fff',
                    border: `2px solid ${item.status === 'completed' ? '#52c41a' : '#1890ff'}`
                  }}
                />
              }
              title={item.title}
              description={
                <Progress 
                  percent={item.progress} 
                  size="small" 
                  status={item.status === 'completed' ? 'success' : 'active'}
                />
              }
            />
            <div>
              <Badge 
                status={item.status === 'completed' ? 'success' : 'processing'} 
                text={item.status === 'completed' ? 'Hoàn thành' : `${item.progress}%`} 
              />
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

// Challenges Widget Component
const ChallengesWidget = ({ challenges, loading }) => {
  return (
    <Card 
      loading={loading} 
      className="gamification-widget challenges-widget"
      title={
        <Space>
          <FlagOutlined />
          <span>Thử thách đang tham gia</span>
        </Space>
      }
      size="small"
      extra={<Button type="link" size="small">Xem tất cả</Button>}
    >
      <List
        dataSource={challenges}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar 
                  icon={item.icon}
                  style={{ 
                    backgroundColor: '#fff',
                    border: '2px solid #1890ff'
                  }}
                />
              }
              title={item.title}
              description={
                <Progress 
                  percent={item.progress} 
                  size="small" 
                  status="active"
                />
              }
            />
            <div>
              <Tag color="#faad14">
                <ClockCircleOutlined /> Còn {item.daysLeft} ngày
              </Tag>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

// Sales Target Widget Component
const SalesTargetWidget = ({ userStats, loading }) => {
  return (
    <Card 
      loading={loading} 
      className="gamification-widget sales-target-widget"
      title={
        <Space>
          <RiseOutlined />
          <span>Mục tiêu doanh số</span>
        </Space>
      }
      size="small"
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Statistic
          value={userStats.sales.percentage}
          suffix="%"
          prefix={<FireOutlined />}
          valueStyle={{ color: '#cf1322' }}
        />
      </div>
      
      <Progress 
        percent={userStats.sales.percentage} 
        status="active"
        strokeColor={{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
      />
      
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Statistic
            title="Hiện tại"
            value={userStats.sales.current}
            formatter={value => `${(value / 1000000).toFixed(1)}M`}
            valueStyle={{ fontSize: '16px', color: '#1890ff' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Mục tiêu"
            value={userStats.sales.target}
            formatter={value => `${(value / 1000000).toFixed(1)}M`}
            valueStyle={{ fontSize: '16px', color: '#52c41a' }}
          />
        </Col>
      </Row>
      
      <Divider style={{ margin: '12px 0' }} />
      
      <div>
        <Text>Dựa trên tiến độ hiện tại, bạn cần bán thêm:</Text>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Statistic
            value={userStats.sales.target - userStats.sales.current}
            formatter={value => `${(value / 1000000).toFixed(1)}M VNĐ`}
            valueStyle={{ fontSize: '16px', fontWeight: 'bold' }}
          />
        </div>
      </div>
    </Card>
  );
};

// Rewards Widget Component
const RewardsWidget = ({ rewards, userStats, loading }) => {
  return (
    <Card 
      loading={loading} 
      className="gamification-widget rewards-widget"
      title={
        <Space>
          <GiftOutlined />
          <span>Phần thưởng khả dụng</span>
        </Space>
      }
      size="small"
      extra={<Button type="link" size="small">Đổi thưởng</Button>}
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Statistic
          title="Điểm hiện có"
          value={userStats.points}
          prefix={<StarOutlined />}
          valueStyle={{ color: '#faad14' }}
        />
      </div>
      
      <List
        grid={{ column: 3, gutter: 16 }}
        dataSource={rewards}
        renderItem={item => (
          <List.Item>
            <Popover
              content={
                <div style={{ maxWidth: 200 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>{item.title}</Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text>{item.points} điểm</Text>
                  </div>
                  <Button 
                    type="primary" 
                    size="small" 
                    disabled={userStats.points < item.points}
                  >
                    Đổi thưởng
                  </Button>
                </div>
              }
              title="Chi tiết phần thưởng"
              trigger="hover"
            >
              <Card
                hoverable
                style={{ textAlign: 'center' }}
                cover={
                  <div style={{ 
                    height: 80, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    opacity: userStats.points < item.points ? 0.5 : 1
                  }}>
                    <GiftOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                  </div>
                }
                size="small"
              >
                <Card.Meta
                  title={item.title}
                  description={<Tag color="#108ee9">{item.points} điểm</Tag>}
                />
              </Card>
            </Popover>
          </List.Item>
        )}
      />
    </Card>
  );
};

// Notifications Widget Component
const NotificationsWidget = ({ loading }) => {
  return (
    <Card 
      loading={loading} 
      className="gamification-widget notifications-widget"
      title={
        <Space>
          <BellOutlined />
          <span>Thông báo</span>
        </Space>
      }
      size="small"
      extra={<Button type="link" size="small">Xem tất cả</Button>}
    >
      <List
        dataSource={[
          {
            title: 'Chúc mừng! Bạn đã đạt được thành tích "Bán hàng xuất sắc"',
            time: '2 giờ trước',
            icon: <TrophyOutlined style={{ color: '#faad14' }} />,
            type: 'success'
          },
          {
            title: 'Thử thách "Thách thức doanh số tháng 7" sắp kết thúc',
            time: '1 ngày trước',
            icon: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
            type: 'info'
          },
          {
            title: 'Bạn đã tích lũy đủ điểm để đổi phần thưởng',
            time: '3 ngày trước',
            icon: <GiftOutlined style={{ color: '#52c41a' }} />,
            type: 'success'
          }
        ]}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar 
                  icon={item.icon}
                  style={{ 
                    backgroundColor: '#fff',
                    border: `2px solid ${item.type === 'success' ? '#52c41a' : '#1890ff'}`
                  }}
                />
              }
              title={item.title}
              description={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <ClockCircleOutlined /> {item.time}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

// Main GamificationWidgets Component
const GamificationWidgets = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [rewards, setRewards] = useState([]);

  // Load data on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUserStats(mockUserStats);
      setLeaderboard(mockLeaderboard);
      setAchievements(mockAchievements);
      setChallenges(mockChallenges);
      setRewards(mockRewards);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="gamification-widgets">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <ProfileWidget userStats={userStats || {}} loading={loading} />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <PointsWidget userStats={userStats || {}} loading={loading} />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <LeaderboardWidget leaderboard={leaderboard} loading={loading} />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <SalesTargetWidget userStats={userStats || {}} loading={loading} />
        </Col>
        <Col xs={24} sm={12} md={12} lg={8}>
          <AchievementsWidget achievements={achievements} loading={loading} />
        </Col>
        <Col xs={24} sm={12} md={12} lg={8}>
          <ChallengesWidget challenges={challenges} loading={loading} />
        </Col>
        <Col xs={24} md={24} lg={8}>
          <RewardsWidget rewards={rewards} userStats={userStats || {}} loading={loading} />
        </Col>
        <Col xs={24}>
          <NotificationsWidget loading={loading} />
        </Col>
      </Row>
    </div>
  );
};

export default GamificationWidgets; 