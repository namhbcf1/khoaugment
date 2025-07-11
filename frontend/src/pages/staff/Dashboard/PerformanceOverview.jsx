import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Progress, 
  Statistic, 
  Avatar, 
  Badge, 
  Space, 
  Button,
  List,
  Tag,
  Tooltip,
  Timeline,
  Divider
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  FireOutlined,
  CrownOutlined,
  RiseOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  GiftOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  SketchOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PerformanceOverview = () => {
  const [userStats, setUserStats] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);

  useEffect(() => {
    // Demo data
    setUserStats({
      level: 12,
      xp: 2847,
      xpToNext: 3000,
      rank: 3,
      totalSales: 45000000,
      todaySales: 2500000,
      monthSales: 45000000,
      streakDays: 7,
      completedTasks: 15,
      totalTasks: 20,
      badges: 23,
      points: 1250
    });

    setAchievements([
      { 
        id: 1, 
        name: 'Siêu sao bán hàng', 
        description: 'Bán được 50 sản phẩm trong 1 ngày',
        icon: <StarOutlined style={{ color: '#ffd700' }} />,
        rarity: 'legendary',
        unlocked: true,
        progress: 100
      },
      { 
        id: 2, 
        name: 'Khách hàng thân thiết', 
        description: 'Phục vụ 100 khách hàng',
        icon: <HeartOutlined style={{ color: '#ff69b4' }} />,
        rarity: 'epic',
        unlocked: true,
        progress: 100
      },
      { 
        id: 3, 
        name: 'Tốc độ ánh sáng', 
        description: 'Hoàn thành 10 giao dịch trong 1 giờ',
        icon: <ThunderboltOutlined style={{ color: '#1890ff' }} />,
        rarity: 'rare',
        unlocked: false,
        progress: 70
      },
      { 
        id: 4, 
        name: 'Thạch kim cương', 
        description: 'Đạt doanh thu 100 triệu trong tháng',
        icon: <SketchOutlined style={{ color: '#b37feb' }} />,
        rarity: 'legendary',
        unlocked: false,
        progress: 45
      }
    ]);

    setLeaderboard([
      { name: 'Nguyễn Minh', avatar: 'NM', sales: 67000000, level: 15, rank: 1 },
      { name: 'Trần Hương', avatar: 'TH', sales: 54000000, level: 13, rank: 2 },
      { name: 'Bạn', avatar: 'B', sales: 45000000, level: 12, rank: 3, isCurrentUser: true },
      { name: 'Lê Tuấn', avatar: 'LT', sales: 38000000, level: 11, rank: 4 },
      { name: 'Phạm Linh', avatar: 'PL', sales: 32000000, level: 10, rank: 5 }
    ]);

    setDailyTasks([
      { id: 1, title: 'Bán 5 sản phẩm', progress: 5, target: 5, completed: true, reward: 50 },
      { id: 2, title: 'Phục vụ 10 khách hàng', progress: 8, target: 10, completed: false, reward: 30 },
      { id: 3, title: 'Upsell 3 sản phẩm', progress: 2, target: 3, completed: false, reward: 75 },
      { id: 4, title: 'Không có khiếu nại', progress: 1, target: 1, completed: true, reward: 25 }
    ]);
  }, []);

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#8c8c8c',
      rare: '#1890ff',
      epic: '#722ed1',
      legendary: '#ffd700'
    };
    return colors[rarity] || '#8c8c8c';
  };

  const getRarityText = (rarity) => {
    const texts = {
      common: 'Thường',
      rare: 'Hiếm',
      epic: 'Sử thi',
      legendary: 'Huyền thoại'
    };
    return texts[rarity] || 'Thường';
  };

  const getLevelProgress = () => {
    return Math.round((userStats.xp / userStats.xpToNext) * 100);
  };

  const getTaskProgress = () => {
    return Math.round((userStats.completedTasks / userStats.totalTasks) * 100);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          🖥️ Trường Phát Computer - Hiệu suất
        </Title>
        <Text type="secondary">
          Theo dõi hiệu suất và thành tích của bạn
        </Text>
      </div>

      {/* User Level & Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Badge.Ribbon text={`Level ${userStats.level}`} color="purple">
                <Avatar 
                  size={80} 
                  style={{ 
                    backgroundColor: '#1890ff',
                    fontSize: '32px',
                    marginBottom: '16px'
                  }}
                >
                  B
                </Avatar>
              </Badge.Ribbon>
              
              <Title level={4} style={{ margin: '16px 0 8px 0' }}>
                Ninja Level {userStats.level}
              </Title>
              
              <div style={{ marginBottom: '16px' }}>
                <Text type="secondary">XP Progress</Text>
                <Progress 
                  percent={getLevelProgress()} 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  format={() => `${userStats.xp}/${userStats.xpToNext}`}
                />
              </div>

              <Space size="large">
                <Statistic
                  title="Xếp hạng"
                  value={userStats.rank}
                  prefix={<TrophyOutlined style={{ color: '#ffd700' }} />}
                  suffix={`/${leaderboard.length}`}
                />
                <Statistic
                  title="Streak"
                  value={userStats.streakDays}
                  prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
                  suffix="ngày"
                />
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Doanh thu hôm nay"
                  value={userStats.todaySales}
                  prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                  suffix="VND"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Doanh thu tháng"
                  value={userStats.monthSales}
                  prefix={<RiseOutlined style={{ color: '#1890ff' }} />}
                  suffix="VND"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Nhiệm vụ hoàn thành"
                  value={userStats.completedTasks}
                  prefix={<ShoppingCartOutlined style={{ color: '#722ed1' }} />}
                  suffix={`/${userStats.totalTasks}`}
                  valueStyle={{ color: '#722ed1' }}
                />
                <Progress 
                  percent={getTaskProgress()} 
                  showInfo={false}
                  strokeColor="#722ed1"
                  size="small"
                  style={{ marginTop: '8px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Điểm thưởng"
                  value={userStats.points}
                  prefix={<GiftOutlined style={{ color: '#fa8c16' }} />}
                  suffix="pts"
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Daily Tasks */}
        <Col xs={24} lg={8}>
          <Card 
            title="📋 Nhiệm vụ hàng ngày"
            extra={<Badge count={dailyTasks.filter(t => !t.completed).length} />}
          >
            <List
              dataSource={dailyTasks}
              renderItem={(task) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          backgroundColor: task.completed ? '#52c41a' : '#1890ff',
                          fontSize: '12px'
                        }}
                      >
                        {task.completed ? '✓' : task.progress}
                      </Avatar>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ 
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? '#8c8c8c' : 'inherit'
                        }}>
                          {task.title}
                        </span>
                        <Tag color="gold">+{task.reward} XP</Tag>
                      </div>
                    }
                    description={
                      <Progress 
                        percent={Math.round((task.progress / task.target) * 100)} 
                        size="small"
                        format={() => `${task.progress}/${task.target}`}
                        strokeColor={task.completed ? '#52c41a' : '#1890ff'}
                      />
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Achievements */}
        <Col xs={24} lg={8}>
          <Card 
            title="🏆 Thành tích"
            extra={<Badge count={achievements.filter(a => a.unlocked).length} />}
          >
            <List
              dataSource={achievements}
              renderItem={(achievement) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge dot={!achievement.unlocked}>
                        <Avatar 
                          style={{ 
                            backgroundColor: achievement.unlocked ? getRarityColor(achievement.rarity) : '#d9d9d9',
                            opacity: achievement.unlocked ? 1 : 0.5
                          }}
                        >
                          {achievement.icon}
                        </Avatar>
                      </Badge>
                    }
                    title={
                      <div>
                        <Space>
                          <Text strong style={{ 
                            color: achievement.unlocked ? 'inherit' : '#8c8c8c' 
                          }}>
                            {achievement.name}
                          </Text>
                          <Tag 
                            color={getRarityColor(achievement.rarity)}
                            style={{ fontSize: '10px' }}
                          >
                            {getRarityText(achievement.rarity)}
                          </Tag>
                        </Space>
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {achievement.description}
                        </Text>
                        {!achievement.unlocked && (
                          <Progress 
                            percent={achievement.progress} 
                            size="small"
                            strokeColor={getRarityColor(achievement.rarity)}
                            style={{ marginTop: '4px' }}
                          />
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Leaderboard */}
        <Col xs={24} lg={8}>
          <Card 
            title="🥇 Bảng xếp hạng"
            extra={<Text type="secondary">Tháng này</Text>}
          >
            <List
              dataSource={leaderboard}
              renderItem={(player) => (
                <List.Item style={{ 
                  backgroundColor: player.isCurrentUser ? '#f6ffed' : 'transparent',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '8px'
                }}>
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        count={player.rank} 
                        style={{ 
                          backgroundColor: player.rank === 1 ? '#ffd700' : 
                                         player.rank === 2 ? '#c0c0c0' : 
                                         player.rank === 3 ? '#cd7f32' : '#1890ff'
                        }}
                      >
                        <Avatar style={{ backgroundColor: '#1890ff' }}>
                          {player.avatar}
                        </Avatar>
                      </Badge>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          <Text strong style={{ color: player.isCurrentUser ? '#52c41a' : 'inherit' }}>
                            {player.name}
                          </Text>
                          {player.rank === 1 && <CrownOutlined style={{ color: '#ffd700' }} />}
                          {player.isCurrentUser && <Text type="secondary">(Bạn)</Text>}
                        </Space>
                        <Tag color="blue">Lv.{player.level}</Tag>
                      </div>
                    }
                    description={
                      <Text strong style={{ color: '#52c41a' }}>
                        {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND',
                          notation: 'compact'
                        }).format(player.sales)}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="📈 Hoạt động gần đây">
            <Timeline>
              <Timeline.Item color="green">
                <Text strong>Hoàn thành nhiệm vụ "Bán 5 sản phẩm"</Text>
                <br />
                <Text type="secondary">2 giờ trước • +50 XP</Text>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <Text strong>Đạt thành tích "Khách hàng thân thiết"</Text>
                <br />
                <Text type="secondary">1 ngày trước • +100 XP</Text>
              </Timeline.Item>
              <Timeline.Item color="red">
                <Text strong>Tăng lên Level 12</Text>
                <br />
                <Text type="secondary">3 ngày trước • Mở khóa tính năng mới</Text>
              </Timeline.Item>
              <Timeline.Item>
                <Text strong>Tham gia thử thách "Tốc độ ánh sáng"</Text>
                <br />
                <Text type="secondary">5 ngày trước • Tiến độ 70%</Text>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceOverview; 