// frontend/src/pages/staff/Dashboard/PersonalDashboard.jsx
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
  Divider,
  Calendar,
  Alert
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  FireOutlined,
  RiseOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  GiftOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  RightOutlined,
  BellOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const PersonalDashboard = () => {
  const [userStats, setUserStats] = useState({});
  const [dailyTasks, setDailyTasks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // Mock data - would be fetched from API
    setUserStats({
      name: 'Nguyễn Văn A',
      position: 'Nhân viên bán hàng',
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
      points: 1250,
      salesTarget: 50000000,
      salesProgress: 45000000,
    });

    setDailyTasks([
      { id: 1, title: 'Bán 5 sản phẩm cao cấp', progress: 3, target: 5, completed: false, reward: 50, icon: <ShoppingCartOutlined /> },
      { id: 2, title: 'Phục vụ 10 khách hàng', progress: 8, target: 10, completed: false, reward: 30, icon: <UserOutlined /> },
      { id: 3, title: 'Upsell 3 sản phẩm', progress: 3, target: 3, completed: true, reward: 75, icon: <RiseOutlined /> },
      { id: 4, title: 'Giới thiệu tính năng mới', progress: 5, target: 5, completed: true, reward: 40, icon: <StarOutlined /> }
    ]);

    setAchievements([
      { id: 1, name: 'Cao thủ bán hàng', description: 'Đạt doanh số 50tr trong ngày', icon: <TrophyOutlined style={{ color: '#ffd700' }} />, unlocked: true },
      { id: 2, name: 'Người dẫn đầu', description: 'Top 3 nhân viên xuất sắc', icon: <StarOutlined style={{ color: '#ffa940' }} />, unlocked: true },
      { id: 3, name: 'Siêu tốc', description: 'Hoàn thành 50 đơn hàng trong tuần', icon: <ThunderboltOutlined style={{ color: '#1890ff' }} />, unlocked: false },
    ]);

    setUpcomingShifts([
      { date: '2023-08-21', time: '08:00 - 17:00', role: 'Nhân viên bán hàng' },
      { date: '2023-08-22', time: '08:00 - 17:00', role: 'Nhân viên bán hàng' },
      { date: '2023-08-23', time: '12:00 - 21:00', role: 'Nhân viên thu ngân' }
    ]);

    setNotifications([
      { id: 1, title: 'Bạn đã đạt thành tích mới', description: 'Cao thủ bán hàng - Đạt doanh số 50tr trong ngày', time: '2 giờ trước', type: 'achievement' },
      { id: 2, title: 'Thưởng tháng của bạn đã được duyệt', description: '2.500.000đ đã được chuyển vào tài khoản của bạn', time: '1 ngày trước', type: 'reward' },
      { id: 3, title: 'Cuộc thi tháng 8 sắp kết thúc', description: 'Còn 3 ngày nữa để đạt mục tiêu và nhận giải thưởng', time: '2 ngày trước', type: 'contest' }
    ]);
    
  }, []);

  const renderStats = () => {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Doanh số hôm nay"
              value={userStats.todaySales}
              formatter={value => `${new Intl.NumberFormat('vi-VN').format(value)}đ`}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Doanh số tháng"
              value={userStats.monthSales}
              formatter={value => `${new Intl.NumberFormat('vi-VN').format(value)}đ`}
              prefix={<RiseOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress 
              percent={Math.round((userStats.salesProgress / userStats.salesTarget) * 100)} 
              status="active" 
              size="small" 
              style={{ marginTop: '12px' }} 
              format={percent => `${percent}%`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Row gutter={16} align="middle">
              <Col span={12}>
                <Statistic
                  title="Streak"
                  value={userStats.streakDays}
                  prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f' }}
                  suffix="ngày"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="XP"
                  value={userStats.xp}
                  prefix={<StarOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderProfile = () => {
    return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Badge count={<TrophyOutlined style={{ color: '#ffd700' }} />} offset={[0, 80]}>
            <Avatar 
              src="https://randomuser.me/api/portraits/men/1.jpg" 
              size={84} 
              style={{ marginRight: '24px' }}
            />
          </Badge>
          <div>
            <Title level={4} style={{ margin: 0 }}>{userStats.name}</Title>
            <Text type="secondary">{userStats.position}</Text>
            
            <div style={{ marginTop: '12px' }}>
              <Space size="large">
                <div>
                  <Text type="secondary">Level</Text>
                  <div>
                    <Text strong style={{ fontSize: '18px' }}>{userStats.level}</Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Xếp hạng</Text>
                  <div>
                    <Text strong style={{ fontSize: '18px' }}># {userStats.rank}</Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary">Điểm</Text>
                  <div>
                    <Text strong style={{ fontSize: '18px', color: '#722ed1' }}>{userStats.points}</Text>
                  </div>
                </div>
              </Space>
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Progress
              type="circle"
              percent={Math.round((userStats.xp / userStats.xpToNext) * 100)}
              format={() => 'XP'}
              width={80}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Text type="secondary">{userStats.xp}/{userStats.xpToNext}</Text>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderTasks = () => {
    return (
      <Card 
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} /> 
            <span>Nhiệm vụ hôm nay</span>
          </Space>
        }
        extra={<Text>{userStats.completedTasks}/{userStats.totalTasks} hoàn thành</Text>}
      >
        <List
          dataSource={dailyTasks}
          renderItem={task => (
            <List.Item
              actions={[
                <Tag color={task.completed ? 'success' : 'processing'}>
                  +{task.reward} XP
                </Tag>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={task.icon} 
                    style={{ 
                      backgroundColor: task.completed ? '#52c41a' : '#1890ff' 
                    }} 
                  />
                }
                title={
                  <span style={{ 
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#8c8c8c' : 'inherit'
                  }}>
                    {task.title}
                  </span>
                }
                description={
                  <Progress 
                    percent={Math.round((task.progress / task.target) * 100)} 
                    size="small" 
                    status={task.completed ? "success" : "active"}
                    format={() => `${task.progress}/${task.target}`}
                  />
                }
              />
            </List.Item>
          )}
        />
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Button type="primary">
            <Link to="/staff/dashboard/goals">Xem tất cả nhiệm vụ</Link>
          </Button>
        </div>
      </Card>
    );
  };

  const renderAchievements = () => {
    return (
      <Card 
        title={
          <Space>
            <TrophyOutlined style={{ color: '#ffd700' }} /> 
            <span>Thành tích</span>
          </Space>
        }
        extra={<Link to="/staff/achievements">Xem tất cả</Link>}
      >
        <List
          dataSource={achievements}
          renderItem={achievement => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={achievement.icon}
                    style={{ 
                      backgroundColor: achievement.unlocked ? 'transparent' : '#f0f0f0',
                      opacity: achievement.unlocked ? 1 : 0.5
                    }} 
                  />
                }
                title={achievement.name}
                description={achievement.description}
              />
              {achievement.unlocked ? (
                <Tag color="success">Đã đạt</Tag>
              ) : (
                <Tag color="default">Chưa đạt</Tag>
              )}
            </List.Item>
          )}
        />
      </Card>
    );
  };

  const renderUpcomingShifts = () => {
    return (
      <Card 
        title={
          <Space>
            <CalendarOutlined style={{ color: '#1890ff' }} /> 
            <span>Lịch làm việc</span>
          </Space>
        }
        extra={<Link to="/staff/profile/schedule">Xem lịch đầy đủ</Link>}
      >
        <List
          dataSource={upcomingShifts}
          renderItem={shift => (
            <List.Item>
              <List.Item.Meta
                title={shift.date}
                description={
                  <Space>
                    <Tag color="blue">{shift.time}</Tag>
                    <span>{shift.role}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    );
  };

  const renderNotifications = () => {
    return (
      <Card 
        title={
          <Space>
            <BellOutlined style={{ color: '#fa8c16' }} /> 
            <span>Thông báo</span>
          </Space>
        }
        extra={<Link to="/staff/notifications">Xem tất cả</Link>}
      >
        <List
          dataSource={notifications}
          renderItem={notification => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={
                      notification.type === 'achievement' ? <TrophyOutlined /> :
                      notification.type === 'reward' ? <GiftOutlined /> : 
                      <CalendarOutlined />
                    }
                    style={{
                      backgroundColor: 
                        notification.type === 'achievement' ? '#ffd700' :
                        notification.type === 'reward' ? '#52c41a' : 
                        '#1890ff'
                    }}
                  />
                }
                title={notification.title}
                description={
                  <div>
                    <div>{notification.description}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{notification.time}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    );
  };
  
  const renderQuickActions = () => {
    return (
      <Card title="Truy cập nhanh">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Button 
              type="default" 
              style={{ width: '100%', height: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
              onClick={() => window.location.href = '/staff/sales'}
            >
              <DollarOutlined style={{ fontSize: '24px', marginBottom: '8px', color: '#52c41a' }} />
              <div>Doanh số của tôi</div>
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              type="default" 
              style={{ width: '100%', height: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
              onClick={() => window.location.href = '/staff/leaderboard'}
            >
              <TrophyOutlined style={{ fontSize: '24px', marginBottom: '8px', color: '#ffd700' }} />
              <div>Bảng xếp hạng</div>
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              type="default" 
              style={{ width: '100%', height: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
              onClick={() => window.location.href = '/staff/rewards'}
            >
              <GiftOutlined style={{ fontSize: '24px', marginBottom: '8px', color: '#fa8c16' }} />
              <div>Đổi thưởng</div>
            </Button>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div>
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            👋 Chào mừng đến với Trường Phát Computer
          </Title>
        </Col>
      </Row>

      <Row gutter={[0, 24]}>
        <Col span={24}>
          {renderProfile()}
        </Col>

        <Col span={24}>
          {renderStats()}
        </Col>

        <Col span={24}>
          {renderQuickActions()}
        </Col>

        <Col xs={24} lg={16}>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              {renderTasks()}
            </Col>
            <Col span={24}>
              {renderAchievements()}
            </Col>
          </Row>
        </Col>
        
        <Col xs={24} lg={8}>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              {renderNotifications()}
            </Col>
            <Col span={24}>
              {renderUpcomingShifts()}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default PersonalDashboard;