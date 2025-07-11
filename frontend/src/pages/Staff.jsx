import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Row, Col, Typography, Progress, Badge, Avatar,
  List, Statistic, Button, Space, Tabs, Table, Tag, Timeline,
  Tooltip, Rate, Divider, Alert, notification
} from 'antd';
import {
  TrophyOutlined, StarOutlined, FireOutlined, CrownOutlined,
  RiseOutlined, TeamOutlined, GiftOutlined, ThunderboltOutlined,
  TargetOutlined, CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * Staff Dashboard with Gamification System
 * Implements achievement system, leaderboards, and performance tracking
 * as specified in CHUAN.MD
 */
const Staff = () => {
  const [loading, setLoading] = useState(false);
  const [staffData, setStaffData] = useState({
    currentUser: {
      id: 1,
      name: 'Nguyễn Văn A',
      avatar: '/avatars/staff1.jpg',
      level: 15,
      experience: 2450,
      nextLevelExp: 3000,
      rank: 'Chuyên viên bán hàng',
      totalSales: 125000000,
      achievements: 12,
      badges: ['top-seller', 'customer-favorite', 'team-player']
    },
    leaderboard: [
      { id: 1, name: 'Nguyễn Văn A', sales: 125000000, level: 15, badges: 12 },
      { id: 2, name: 'Trần Thị B', sales: 98000000, level: 12, badges: 8 },
      { id: 3, name: 'Lê Văn C', sales: 87000000, level: 11, badges: 6 },
      { id: 4, name: 'Phạm Thị D', sales: 76000000, level: 10, badges: 5 },
      { id: 5, name: 'Hoàng Văn E', sales: 65000000, level: 9, badges: 4 }
    ],
    achievements: [
      {
        id: 1,
        title: 'Người bán hàng xuất sắc',
        description: 'Đạt doanh số trên 100 triệu trong tháng',
        icon: '🏆',
        earned: true,
        earnedDate: '2024-01-15',
        points: 500
      },
      {
        id: 2,
        title: 'Khách hàng yêu thích',
        description: 'Nhận được 50+ đánh giá 5 sao từ khách hàng',
        icon: '⭐',
        earned: true,
        earnedDate: '2024-01-10',
        points: 300
      },
      {
        id: 3,
        title: 'Đồng đội tuyệt vời',
        description: 'Hỗ trợ đồng nghiệp hoàn thành 20+ đơn hàng',
        icon: '🤝',
        earned: true,
        earnedDate: '2024-01-05',
        points: 200
      },
      {
        id: 4,
        title: 'Chuyên gia sản phẩm',
        description: 'Hoàn thành 10 khóa đào tạo sản phẩm',
        icon: '📚',
        earned: false,
        progress: 7,
        total: 10,
        points: 400
      },
      {
        id: 5,
        title: 'Siêu sao bán hàng',
        description: 'Đạt doanh số 1 tỷ trong năm',
        icon: '🌟',
        earned: false,
        progress: 125000000,
        total: 1000000000,
        points: 1000
      }
    ],
    dailyTasks: [
      {
        id: 1,
        title: 'Hoàn thành 5 đơn hàng',
        progress: 3,
        total: 5,
        points: 50,
        completed: false
      },
      {
        id: 2,
        title: 'Tư vấn 10 khách hàng',
        progress: 7,
        total: 10,
        points: 30,
        completed: false
      },
      {
        id: 3,
        title: 'Cập nhật 20 sản phẩm',
        progress: 20,
        total: 20,
        points: 40,
        completed: true
      }
    ],
    weeklyChallenge: {
      title: 'Thử thách tuần này: Bán 50 laptop',
      progress: 23,
      total: 50,
      reward: '🎁 Thưởng 500.000 VNĐ + Huy hiệu đặc biệt',
      timeLeft: '3 ngày 14 giờ'
    }
  });

  // Simulate data loading
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleCompleteTask = (taskId) => {
    setStaffData(prev => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map(task =>
        task.id === taskId
          ? { ...task, completed: true, progress: task.total }
          : task
      )
    }));

    notification.success({
      message: 'Hoàn thành nhiệm vụ!',
      description: 'Bạn đã nhận được điểm thưởng.',
      icon: <TrophyOutlined style={{ color: '#52c41a' }} />
    });
  };

  const renderAchievementCard = (achievement) => (
    <Card
      key={achievement.id}
      size="small"
      style={{
        marginBottom: 16,
        opacity: achievement.earned ? 1 : 0.6,
        border: achievement.earned ? '2px solid #52c41a' : '1px solid #d9d9d9'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: '32px', marginRight: 16 }}>
          {achievement.icon}
        </div>
        <div style={{ flex: 1 }}>
          <Title level={5} style={{ margin: 0 }}>
            {achievement.title}
            {achievement.earned && <Badge count="✓" style={{ marginLeft: 8, backgroundColor: '#52c41a' }} />}
          </Title>
          <Text type="secondary">{achievement.description}</Text>
          {!achievement.earned && achievement.progress !== undefined && (
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={Math.round((achievement.progress / achievement.total) * 100)}
                size="small"
                format={() => `${achievement.progress}/${achievement.total}`}
              />
            </div>
          )}
          <div style={{ marginTop: 8 }}>
            <Text strong style={{ color: '#1677ff' }}>+{achievement.points} điểm</Text>
            {achievement.earned && (
              <Text type="secondary" style={{ marginLeft: 16 }}>
                Đạt được: {achievement.earnedDate}
              </Text>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const leaderboardColumns = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (_, __, index) => {
        const icons = ['🥇', '🥈', '🥉'];
        return icons[index] || `#${index + 1}`;
      }
    },
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar size="small" style={{ marginRight: 8 }}>
            {name.charAt(0)}
          </Avatar>
          <div>
            <div>{name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Level {record.level}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Doanh số',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales) => (
        <Text strong style={{ color: '#52c41a' }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(sales)}
        </Text>
      )
    },
    {
      title: 'Huy hiệu',
      dataIndex: 'badges',
      key: 'badges',
      render: (badges) => (
        <Badge count={badges} style={{ backgroundColor: '#1677ff' }} />
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <TeamOutlined /> Dashboard Nhân Viên - Hệ thống Gamification
          </Title>
          <Paragraph>
            Theo dõi thành tích, hoàn thành nhiệm vụ và tham gia các thử thách để nhận thưởng!
          </Paragraph>
        </div>

        {/* User Profile Card */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={24} align="middle">
            <Col>
              <Avatar size={80} style={{ backgroundColor: '#1677ff' }}>
                {staffData.currentUser.name.charAt(0)}
              </Avatar>
            </Col>
            <Col flex={1}>
              <Title level={3} style={{ margin: 0 }}>
                {staffData.currentUser.name}
              </Title>
              <Text type="secondary">{staffData.currentUser.rank}</Text>
              <div style={{ marginTop: 8 }}>
                <Text strong>Level {staffData.currentUser.level}</Text>
                <Progress
                  percent={Math.round((staffData.currentUser.experience / staffData.currentUser.nextLevelExp) * 100)}
                  size="small"
                  style={{ marginLeft: 16, width: 200 }}
                  format={() => `${staffData.currentUser.experience}/${staffData.currentUser.nextLevelExp} EXP`}
                />
              </div>
            </Col>
            <Col>
              <Space direction="vertical" align="center">
                <Statistic
                  title="Tổng doanh số"
                  value={staffData.currentUser.totalSales}
                  formatter={(value) => new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(value)}
                />
                <Space>
                  <Badge count={staffData.currentUser.achievements} style={{ backgroundColor: '#52c41a' }}>
                    <TrophyOutlined style={{ fontSize: 24, color: '#faad14' }} />
                  </Badge>
                  <Text>Thành tích</Text>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Tabs defaultActiveKey="achievements">
              <TabPane tab={<span><TrophyOutlined />Thành tích & Huy hiệu</span>} key="achievements">
                <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                  {staffData.achievements.map(renderAchievementCard)}
                </div>
              </TabPane>

              <TabPane tab={<span><TargetOutlined />Nhiệm vụ hàng ngày</span>} key="tasks">
                <List
                  dataSource={staffData.dailyTasks}
                  renderItem={(task) => (
                    <List.Item
                      actions={[
                        !task.completed && (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleCompleteTask(task.id)}
                            disabled={task.progress < task.total}
                          >
                            Hoàn thành
                          </Button>
                        ),
                        task.completed && (
                          <Tag color="success">
                            <CheckCircleOutlined /> Đã hoàn thành
                          </Tag>
                        )
                      ].filter(Boolean)}
                    >
                      <List.Item.Meta
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{task.title}</span>
                            <Text strong style={{ color: '#1677ff' }}>+{task.points} điểm</Text>
                          </div>
                        }
                        description={
                          <Progress
                            percent={Math.round((task.progress / task.total) * 100)}
                            size="small"
                            format={() => `${task.progress}/${task.total}`}
                            status={task.completed ? 'success' : 'active'}
                          />
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>

              <TabPane tab={<span><FireOutlined />Bảng xếp hạng</span>} key="leaderboard">
                <Table
                  dataSource={staffData.leaderboard}
                  columns={leaderboardColumns}
                  pagination={false}
                  size="small"
                />
              </TabPane>
            </Tabs>
          </Col>

          <Col xs={24} lg={8}>
            {/* Weekly Challenge */}
            <Card
              title={
                <span>
                  <ThunderboltOutlined style={{ color: '#faad14' }} />
                  Thử thách tuần
                </span>
              }
              style={{ marginBottom: 24 }}
            >
              <Title level={4}>{staffData.weeklyChallenge.title}</Title>
              <Progress
                percent={Math.round((staffData.weeklyChallenge.progress / staffData.weeklyChallenge.total) * 100)}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                format={() => `${staffData.weeklyChallenge.progress}/${staffData.weeklyChallenge.total}`}
              />
              <div style={{ marginTop: 16 }}>
                <Text strong>Phần thưởng:</Text>
                <br />
                <Text>{staffData.weeklyChallenge.reward}</Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  <ClockCircleOutlined /> Còn lại: {staffData.weeklyChallenge.timeLeft}
                </Text>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card title="Thống kê nhanh">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Hôm nay"
                    value={3}
                    suffix="đơn hàng"
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<RiseOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tuần này"
                    value={23}
                    suffix="đơn hàng"
                    valueStyle={{ color: '#1677ff' }}
                    prefix={<CalendarOutlined />}
                  />
                </Col>
              </Row>
              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Điểm thưởng"
                    value={2450}
                    suffix="điểm"
                    valueStyle={{ color: '#faad14' }}
                    prefix={<StarOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Hạng hiện tại"
                    value={1}
                    suffix="/50"
                    valueStyle={{ color: '#f5222d' }}
                    prefix={<CrownOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Staff;