import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  Switch,
  Typography,
  Row,
  Col,
  Slider,
  InputNumber,
  Space,
  Table,
  Tag,
  Tooltip,
  Divider,
  Badge,
  Alert,
  Modal,
  message
} from 'antd';
import {
  TrophyOutlined,
  StarOutlined,
  RiseOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TeamOutlined,
  SaveOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Sample achievement data
const achievementsData = [
  {
    id: 1,
    name: 'Sales Rookie',
    description: 'Complete first 10 sales',
    pointsAwarded: 100,
    badgeImage: '🌟',
    criteria: 'sales_count >= 10',
    difficulty: 'easy',
    status: 'active'
  },
  {
    id: 2,
    name: 'Tech Wizard',
    description: 'Successfully resolve 50 technical issues',
    pointsAwarded: 250,
    badgeImage: '🔧',
    criteria: 'tech_issues_resolved >= 50',
    difficulty: 'medium',
    status: 'active'
  },
  {
    id: 3,
    name: 'Customer Champion',
    description: 'Receive 20 five-star customer ratings',
    pointsAwarded: 300,
    badgeImage: '⭐',
    criteria: 'five_star_ratings >= 20',
    difficulty: 'medium',
    status: 'active'
  },
  {
    id: 4,
    name: 'Sales Master',
    description: 'Achieve 100 million VND in sales within a month',
    pointsAwarded: 500,
    badgeImage: '🏆',
    criteria: 'monthly_sales >= 100000000',
    difficulty: 'hard',
    status: 'active'
  },
  {
    id: 5,
    name: 'Team Player',
    description: 'Help 10 colleagues with their tasks',
    pointsAwarded: 150,
    badgeImage: '🤝',
    criteria: 'colleague_assists >= 10',
    difficulty: 'easy',
    status: 'inactive'
  }
];

// Sample reward data
const rewardsData = [
  {
    id: 1,
    name: 'Extra Day Off',
    description: 'Get an additional day of paid leave',
    pointsCost: 1000,
    category: 'time_off',
    availability: 'unlimited',
    status: 'active'
  },
  {
    id: 2,
    name: 'Lunch Voucher',
    description: '200,000 VND voucher for lunch',
    pointsCost: 500,
    category: 'voucher',
    availability: '20',
    status: 'active'
  },
  {
    id: 3,
    name: 'Training Course',
    description: 'Access to premium online training course',
    pointsCost: 800,
    category: 'learning',
    availability: '10',
    status: 'active'
  },
  {
    id: 4,
    name: 'Team Dinner',
    description: 'Dinner treat for your team (up to 5 people)',
    pointsCost: 1500,
    category: 'experience',
    availability: '5',
    status: 'active'
  },
  {
    id: 5,
    name: 'Bonus Payment',
    description: '500,000 VND bonus added to salary',
    pointsCost: 2000,
    category: 'financial',
    availability: 'unlimited',
    status: 'inactive'
  }
];

// Sample level settings
const levelSettingsData = {
  basePoints: 100,
  pointsMultiplier: 1.5,
  maxLevel: 20,
  levelUpNotification: true,
  showLeaderboard: true,
  resetPointsPeriod: 'never'
};

const GamificationConfig = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [achievements, setAchievements] = useState(achievementsData);
  const [rewards, setRewards] = useState(rewardsData);
  const [levelSettings, setLevelSettings] = useState(levelSettingsData);
  
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [currentReward, setCurrentReward] = useState(null);
  
  const [achievementForm] = Form.useForm();
  const [rewardForm] = Form.useForm();
  const [levelForm] = Form.useForm();

  // Handle showing achievement modal
  const showAchievementModal = (achievement = null) => {
    setCurrentAchievement(achievement);
    
    if (achievement) {
      achievementForm.setFieldsValue({
        name: achievement.name,
        description: achievement.description,
        pointsAwarded: achievement.pointsAwarded,
        badgeImage: achievement.badgeImage,
        criteria: achievement.criteria,
        difficulty: achievement.difficulty,
        status: achievement.status === 'active'
      });
    } else {
      achievementForm.resetFields();
      achievementForm.setFieldsValue({
        status: true,
        difficulty: 'medium',
        pointsAwarded: 100
      });
    }
    
    setAchievementModalVisible(true);
  };

  // Handle achievement form submission
  const handleAchievementSubmit = () => {
    achievementForm.validateFields()
      .then(values => {
        const formData = {
          ...values,
          status: values.status ? 'active' : 'inactive'
        };
        
        if (currentAchievement) {
          // Update existing achievement
          const updatedAchievements = achievements.map(item => 
            item.id === currentAchievement.id ? { ...item, ...formData } : item
          );
          setAchievements(updatedAchievements);
          message.success('Achievement updated successfully');
        } else {
          // Add new achievement
          const newAchievement = {
            id: achievements.length + 1,
            ...formData
          };
          setAchievements([...achievements, newAchievement]);
          message.success('Achievement added successfully');
        }
        
        setAchievementModalVisible(false);
      })
      .catch(error => {
        console.log('Validation error:', error);
      });
  };

  // Handle showing reward modal
  const showRewardModal = (reward = null) => {
    setCurrentReward(reward);
    
    if (reward) {
      rewardForm.setFieldsValue({
        name: reward.name,
        description: reward.description,
        pointsCost: reward.pointsCost,
        category: reward.category,
        availability: reward.availability,
        status: reward.status === 'active'
      });
    } else {
      rewardForm.resetFields();
      rewardForm.setFieldsValue({
        status: true,
        category: 'voucher',
        availability: 'unlimited'
      });
    }
    
    setRewardModalVisible(true);
  };

  // Handle reward form submission
  const handleRewardSubmit = () => {
    rewardForm.validateFields()
      .then(values => {
        const formData = {
          ...values,
          status: values.status ? 'active' : 'inactive'
        };
        
        if (currentReward) {
          // Update existing reward
          const updatedRewards = rewards.map(item => 
            item.id === currentReward.id ? { ...item, ...formData } : item
          );
          setRewards(updatedRewards);
          message.success('Reward updated successfully');
        } else {
          // Add new reward
          const newReward = {
            id: rewards.length + 1,
            ...formData
          };
          setRewards([...rewards, newReward]);
          message.success('Reward added successfully');
        }
        
        setRewardModalVisible(false);
      })
      .catch(error => {
        console.log('Validation error:', error);
      });
  };

  // Handle level settings submission
  const handleLevelSettingsSubmit = (values) => {
    setLevelSettings({
      ...levelSettings,
      ...values
    });
    message.success('Level settings updated successfully');
  };

  // Achievement columns for table
  const achievementColumns = [
    {
      title: 'Badge',
      dataIndex: 'badgeImage',
      key: 'badgeImage',
      render: badge => <span style={{ fontSize: '24px' }}>{badge}</span>
    },
    {
      title: 'Achievement',
      key: 'achievement',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{record.description}</div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Points',
      dataIndex: 'pointsAwarded',
      key: 'pointsAwarded',
      sorter: (a, b) => a.pointsAwarded - b.pointsAwarded
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: difficulty => {
        const color = 
          difficulty === 'easy' ? 'green' : 
          difficulty === 'medium' ? 'blue' : 'red';
        
        return <Tag color={color}>{difficulty.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Easy', value: 'easy' },
        { text: 'Medium', value: 'medium' },
        { text: 'Hard', value: 'hard' }
      ],
      onFilter: (value, record) => record.difficulty === value
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        status === 'active' ? 
          <Badge status="success" text="Active" /> : 
          <Badge status="error" text="Inactive" />
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showAchievementModal(record)} 
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setAchievements(achievements.filter(item => item.id !== record.id));
                message.success('Achievement deleted');
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Reward columns for table
  const rewardColumns = [
    {
      title: 'Reward',
      key: 'reward',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{record.description}</div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Points Cost',
      dataIndex: 'pointsCost',
      key: 'pointsCost',
      sorter: (a, b) => a.pointsCost - b.pointsCost
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: category => {
        const categoryMap = {
          'time_off': { color: 'purple', icon: '🕒' },
          'voucher': { color: 'green', icon: '🎫' },
          'learning': { color: 'blue', icon: '📚' },
          'experience': { color: 'magenta', icon: '🎭' },
          'financial': { color: 'gold', icon: '💰' }
        };
        
        return (
          <Tag color={categoryMap[category]?.color || 'default'}>
            {categoryMap[category]?.icon} {category.replace('_', ' ')}
          </Tag>
        );
      },
      filters: [
        { text: 'Time Off', value: 'time_off' },
        { text: 'Voucher', value: 'voucher' },
        { text: 'Learning', value: 'learning' },
        { text: 'Experience', value: 'experience' },
        { text: 'Financial', value: 'financial' }
      ],
      onFilter: (value, record) => record.category === value
    },
    {
      title: 'Availability',
      dataIndex: 'availability',
      key: 'availability',
      render: availability => (
        availability === 'unlimited' ? 
          <Tag color="green">Unlimited</Tag> : 
          <span>{availability} remaining</span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        status === 'active' ? 
          <Badge status="success" text="Active" /> : 
          <Badge status="error" text="Inactive" />
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showRewardModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setRewards(rewards.filter(item => item.id !== record.id));
                message.success('Reward deleted');
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="gamification-config-container" style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2}><TrophyOutlined /> Gamification Configuration</Title>
            <Paragraph>Configure achievements, rewards, and gamification settings for your staff</Paragraph>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<SaveOutlined />}
            >
              Save All Settings
            </Button>
          </Col>
        </Row>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={<span><StarOutlined /> Achievements</span>}
            key="1"
          >
            <Alert 
              message="Staff Achievements" 
              description="Create and manage achievements that staff members can earn by meeting specific criteria."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showAchievementModal()}
              >
                Add Achievement
              </Button>
            </div>

            <Table
              columns={achievementColumns}
              dataSource={achievements}
              rowKey="id"
            />
          </TabPane>

          <TabPane
            tab={<span><TrophyOutlined /> Rewards</span>}
            key="2"
          >
            <Alert 
              message="Staff Rewards" 
              description="Create rewards that staff can redeem with points earned from achievements."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showRewardModal()}
              >
                Add Reward
              </Button>
            </div>

            <Table
              columns={rewardColumns}
              dataSource={rewards}
              rowKey="id"
            />
          </TabPane>

          <TabPane
            tab={<span><RiseOutlined /> Level System</span>}
            key="3"
          >
            <Alert 
              message="Staff Level System" 
              description="Configure how staff members level up and progress through the gamification system."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Card title="Level Settings" bordered={false}>
              <Form
                layout="vertical"
                initialValues={levelSettings}
                onFinish={handleLevelSettingsSubmit}
                form={levelForm}
              >
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="basePoints"
                      label="Base Points for Level 1"
                      rules={[{ required: true, message: 'Please enter base points' }]}
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="pointsMultiplier"
                      label="Points Multiplier Between Levels"
                      rules={[{ required: true, message: 'Please enter points multiplier' }]}
                      tooltip="The multiplier applied to determine points needed for next level"
                    >
                      <InputNumber min={1} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="maxLevel"
                  label="Maximum Level"
                  rules={[{ required: true, message: 'Please enter maximum level' }]}
                >
                  <InputNumber min={1} max={100} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="resetPointsPeriod"
                  label="Points Reset Period"
                >
                  <Select>
                    <Option value="never">Never</Option>
                    <Option value="monthly">Monthly</Option>
                    <Option value="quarterly">Quarterly</Option>
                    <Option value="yearly">Yearly</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="levelUpNotification"
                  valuePropName="checked"
                  label="Level Up Notifications"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="showLeaderboard"
                  valuePropName="checked"
                  label="Show Leaderboard"
                >
                  <Switch />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Save Level Settings
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Achievement Modal */}
      <Modal
        title={currentAchievement ? "Edit Achievement" : "Add New Achievement"}
        visible={achievementModalVisible}
        onOk={handleAchievementSubmit}
        onCancel={() => setAchievementModalVisible(false)}
        width={600}
      >
        <Form
          form={achievementForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Achievement Name"
            rules={[{ required: true, message: 'Please enter achievement name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter achievement description' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pointsAwarded"
                label="Points Awarded"
                rules={[{ required: true, message: 'Please enter points' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="difficulty"
                label="Difficulty Level"
                rules={[{ required: true, message: 'Please select difficulty' }]}
              >
                <Select>
                  <Option value="easy">Easy</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="hard">Hard</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="badgeImage"
            label="Badge Emoji"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="criteria"
            label="Achievement Criteria"
            tooltip="Enter the criteria as a logical expression (e.g., 'sales_count >= 10')"
            rules={[{ required: true, message: 'Please enter achievement criteria' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            valuePropName="checked"
            label="Status"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reward Modal */}
      <Modal
        title={currentReward ? "Edit Reward" : "Add New Reward"}
        visible={rewardModalVisible}
        onOk={handleRewardSubmit}
        onCancel={() => setRewardModalVisible(false)}
        width={600}
      >
        <Form
          form={rewardForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Reward Name"
            rules={[{ required: true, message: 'Please enter reward name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter reward description' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pointsCost"
                label="Points Cost"
                rules={[{ required: true, message: 'Please enter points cost' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Reward Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select>
                  <Option value="time_off">Time Off</Option>
                  <Option value="voucher">Voucher</Option>
                  <Option value="learning">Learning</Option>
                  <Option value="experience">Experience</Option>
                  <Option value="financial">Financial</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="availability"
            label="Availability"
            tooltip="Enter number of rewards available or 'unlimited'"
            rules={[{ required: true, message: 'Please enter availability' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            valuePropName="checked"
            label="Status"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GamificationConfig; 