import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Progress, Avatar, List, Badge, Tabs, Statistic,
  Space, Typography, Button, Modal, Table, Tag, Timeline, Tooltip
} from 'antd';
import {
  TrophyOutlined, StarOutlined, FireOutlined, CrownOutlined,
  RocketOutlined, ThunderboltOutlined, GiftOutlined, AimOutlined,
  CalendarOutlined, TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Gamification = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUserStats(),
        loadAchievements(),
        loadLeaderboard(),
        loadChallenges(),
        loadRecentActivities()
      ]);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await api.get(`/gamification/stats/${user.id}`);
      if (response.data.success) {
        setUserStats(response.data.data);
      }
    } catch (error) {
      // Mock data
      setUserStats({
        level: 8,
        xp: 1250,
        xpToNext: 1500,
        totalSales: 2500000,
        totalOrders: 125,
        rank: 2,
        badges: 12,
        streak: 7,
        completedChallenges: 15
      });
    }
  };

  const loadAchievements = async () => {
    try {
      const response = await api.get(`/gamification/achievements/${user.id}`);
      if (response.data.success) {
        setAchievements(response.data.data);
      }
    } catch (error) {
      // Mock data
      setAchievements([
        {
          id: 1,
          name: 'First Sale',
          description: 'Complete your first sale',
          icon: '🎯',
          completed: true,
          completedAt: '2024-01-15',
          xpReward: 100,
          category: 'sales'
        },
        {
          id: 2,
          name: 'Sales Master',
          description: 'Complete 100 sales',
          icon: '👑',
          completed: true,
          completedAt: '2024-02-20',
          xpReward: 1000,
          category: 'sales'
        },
        {
          id: 3,
          name: 'Customer Champion',
          description: 'Serve 50 different customers',
          icon: '🤝',
          completed: true,
          completedAt: '2024-03-10',
          xpReward: 500,
          category: 'customer'
        },
        {
          id: 4,
          name: 'Speed Demon',
          description: 'Process 10 orders in 1 hour',
          icon: '⚡',
          completed: false,
          progress: 70,
          xpReward: 300,
          category: 'efficiency'
        },
        {
          id: 5,
          name: 'Revenue King',
          description: 'Achieve 5M VND in sales',
          icon: '💰',
          completed: false,
          progress: 50,
          xpReward: 2000,
          category: 'sales'
        }
      ]);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await api.get('/gamification/leaderboard');
      if (response.data.success) {
        setLeaderboard(response.data.data);
      }
    } catch (error) {
      // Mock data
      setLeaderboard([
        { id: 1, name: 'Nguyễn Văn A', level: 10, xp: 2500, sales: 3500000, avatar: null, rank: 1 },
        { id: 2, name: user.name, level: 8, xp: 1250, sales: 2500000, avatar: null, rank: 2 },
        { id: 3, name: 'Trần Thị B', level: 7, xp: 1100, sales: 2200000, avatar: null, rank: 3 },
        { id: 4, name: 'Lê Văn C', level: 6, xp: 990, sales: 1980000, avatar: null, rank: 4 },
        { id: 5, name: 'Phạm Thị D', level: 6, xp: 870, sales: 1750000, avatar: null, rank: 5 }
      ]);
    }
  };

  const loadChallenges = async () => {
    try {
      const response = await api.get('/gamification/challenges');
      if (response.data.success) {
        setChallenges(response.data.data);
      }
    } catch (error) {
      // Mock data
      setChallenges([
        {
          id: 1,
          name: 'Daily Sales Target',
          description: 'Achieve 500K VND in sales today',
          type: 'daily',
          target: 500000,
          current: 320000,
          reward: 50,
          expiresAt: '2024-12-31T23:59:59',
          status: 'active'
        },
        {
          id: 2,
          name: 'Customer Satisfaction',
          description: 'Get 5-star rating from 10 customers',
          type: 'weekly',
          target: 10,
          current: 7,
          reward: 200,
          expiresAt: '2024-12-31T23:59:59',
          status: 'active'
        },
        {
          id: 3,
          name: 'Upselling Champion',
          description: 'Successfully upsell 20 customers',
          type: 'monthly',
          target: 20,
          current: 12,
          reward: 500,
          expiresAt: '2024-12-31T23:59:59',
          status: 'active'
        }
      ]);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const response = await api.get(`/gamification/activities/${user.id}`);
      if (response.data.success) {
        setRecentActivities(response.data.data);
      }
    } catch (error) {
      // Mock data
      setRecentActivities([
        { id: 1, type: 'achievement', description: 'Earned "Customer Champion" badge', xp: 500, timestamp: '2024-03-10T10:30:00' },
        { id: 2, type: 'level_up', description: 'Reached Level 8!', xp: 0, timestamp: '2024-03-09T15:45:00' },
        { id: 3, type: 'challenge', description: 'Completed Daily Sales Target', xp: 50, timestamp: '2024-03-08T18:20:00' },
        { id: 4, type: 'sale', description: 'Processed order #ORD-1234', xp: 10, timestamp: '2024-03-08T14:15:00' }
      ]);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getLevelColor = (level) => {
    if (level >= 10) return '#ff4d4f';
    if (level >= 7) return '#faad14';
    if (level >= 4) return '#52c41a';
    return '#1890ff';
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <CrownOutlined style={{ color: '#faad14' }} />;
      case 2: return <TrophyOutlined style={{ color: '#c0c0c0' }} />;
      case 3: return <TrophyOutlined style={{ color: '#cd7f32' }} />;
      default: return <span style={{ fontWeight: 'bold' }}>#{rank}</span>;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'achievement': return <TrophyOutlined style={{ color: '#faad14' }} />;
      case 'level_up': return <RocketOutlined style={{ color: '#52c41a' }} />;
      case 'challenge': return <AimOutlined style={{ color: '#1890ff' }} />;
      case 'sale': return <FireOutlined style={{ color: '#ff4d4f' }} />;
      default: return <StarOutlined />;
    }
  };

  const getChallengeTypeColor = (type) => {
    switch (type) {
      case 'daily': return 'blue';
      case 'weekly': return 'green';
      case 'monthly': return 'purple';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <TrophyOutlined /> Gamification
          </Title>
          <Text type="secondary">Hệ thống thành tích và thử thách</Text>
        </Col>
      </Row>

      <Tabs defaultActiveKey="overview">
        <TabPane tab="Tổng quan" key="overview">
          {/* User Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={8}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <Avatar size={80} style={{ backgroundColor: getLevelColor(userStats.level), fontSize: '24px' }}>
                    {userStats.level}
                  </Avatar>
                  <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
                    Level {userStats.level}
                  </Title>
                  <Progress
                    percent={(userStats.xp / userStats.xpToNext) * 100}
                    showInfo={false}
                    strokeColor={getLevelColor(userStats.level)}
                  />
                  <Text type="secondary">
                    {userStats.xp} / {userStats.xpToNext} XP
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={16}>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Xếp hạng"
                      value={userStats.rank}
                      prefix={getRankIcon(userStats.rank)}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Huy hiệu"
                      value={userStats.badges}
                      prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Streak"
                      value={userStats.streak}
                      suffix="ngày"
                      prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Thử thách"
                      value={userStats.completedChallenges}
                      prefix={<AimOutlined style={{ color: '#52c41a' }} />}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Recent Activities */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Hoạt động gần đây" loading={loading}>
                <Timeline>
                  {recentActivities.map((activity) => (
                    <Timeline.Item
                      key={activity.id}
                      dot={getActivityIcon(activity.type)}
                    >
                      <div>
                        <Text>{activity.description}</Text>
                        {activity.xp > 0 && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            +{activity.xp} XP
                          </Tag>
                        )}
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {new Date(activity.timestamp).toLocaleString('vi-VN')}
                          </Text>
                        </div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Thử thách hiện tại" loading={loading}>
                <List
                  dataSource={challenges}
                  renderItem={(challenge) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<AimOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                        title={
                          <Space>
                            {challenge.name}
                            <Tag color={getChallengeTypeColor(challenge.type)}>
                              {challenge.type}
                            </Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <Text type="secondary">{challenge.description}</Text>
                            <Progress
                              percent={(challenge.current / challenge.target) * 100}
                              size="small"
                              format={() => `${challenge.current}/${challenge.target}`}
                              style={{ marginTop: 8 }}
                            />
                            <div style={{ marginTop: 4 }}>
                              <Text type="secondary">
                                Phần thưởng: <Text strong>+{challenge.reward} XP</Text>
                              </Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Thành tích" key="achievements">
          <Row gutter={[16, 16]}>
            {achievements.map((achievement) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={achievement.id}>
                <Card
                  hoverable
                  onClick={() => {
                    setSelectedAchievement(achievement);
                    setShowAchievementModal(true);
                  }}
                  style={{
                    opacity: achievement.completed ? 1 : 0.6,
                    border: achievement.completed ? '2px solid #52c41a' : '1px solid #d9d9d9'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: 16 }}>
                      {achievement.icon}
                    </div>
                    <Title level={5} style={{ marginBottom: 8 }}>
                      {achievement.name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {achievement.description}
                    </Text>
                    {achievement.completed ? (
                      <div style={{ marginTop: 12 }}>
                        <Badge status="success" text="Hoàn thành" />
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {new Date(achievement.completedAt).toLocaleDateString('vi-VN')}
                          </Text>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 12 }}>
                        <Progress
                          percent={achievement.progress || 0}
                          size="small"
                          showInfo={false}
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {achievement.progress || 0}% hoàn thành
                        </Text>
                      </div>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <Tag color="blue">+{achievement.xpReward} XP</Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane tab="Bảng xếp hạng" key="leaderboard">
          <Card title="Top nhân viên xuất sắc" loading={loading}>
            <Table
              dataSource={leaderboard}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Hạng',
                  dataIndex: 'rank',
                  key: 'rank',
                  width: 80,
                  render: (rank) => (
                    <div style={{ textAlign: 'center', fontSize: '18px' }}>
                      {getRankIcon(rank)}
                    </div>
                  ),
                },
                {
                  title: 'Nhân viên',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => (
                    <Space>
                      <Avatar style={{ backgroundColor: getLevelColor(record.level) }}>
                        {record.level}
                      </Avatar>
                      <div>
                        <div style={{ fontWeight: record.name === user.name ? 'bold' : 'normal' }}>
                          {text} {record.name === user.name && <Text type="secondary">(Bạn)</Text>}
                        </div>
                        <Text type="secondary">Level {record.level}</Text>
                      </div>
                    </Space>
                  ),
                },
                {
                  title: 'XP',
                  dataIndex: 'xp',
                  key: 'xp',
                  render: (value) => (
                    <Space>
                      <StarOutlined style={{ color: '#faad14' }} />
                      {value.toLocaleString()}
                    </Space>
                  ),
                },
                {
                  title: 'Doanh thu',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (value) => formatCurrency(value),
                },
              ]}
              rowClassName={(record) => record.name === user.name ? 'highlight-row' : ''}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Achievement Detail Modal */}
      <Modal
        title={selectedAchievement?.name}
        open={showAchievementModal}
        onCancel={() => setShowAchievementModal(false)}
        footer={null}
        width={400}
      >
        {selectedAchievement && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: 16 }}>
              {selectedAchievement.icon}
            </div>
            <Title level={4}>{selectedAchievement.name}</Title>
            <Text type="secondary">{selectedAchievement.description}</Text>
            <div style={{ marginTop: 16 }}>
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                +{selectedAchievement.xpReward} XP
              </Tag>
            </div>
            {selectedAchievement.completed ? (
              <div style={{ marginTop: 16 }}>
                <Badge status="success" text="Đã hoàn thành" />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    Hoàn thành vào: {new Date(selectedAchievement.completedAt).toLocaleDateString('vi-VN')}
                  </Text>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                <Progress
                  percent={selectedAchievement.progress || 0}
                  strokeColor="#1890ff"
                />
                <Text type="secondary">
                  {selectedAchievement.progress || 0}% hoàn thành
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .highlight-row {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
};

export default Gamification;
