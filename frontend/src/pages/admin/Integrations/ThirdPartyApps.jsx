import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  List,
  Avatar,
  Space,
  Tag,
  Badge,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Divider,
  Tabs,
  Table,
  Tooltip,
  Alert,
  Row,
  Col,
  Statistic,
  Empty,
  Popconfirm,
  Timeline,
  message
} from 'antd';
import {
  AppstoreOutlined,
  LinkOutlined,
  PlusOutlined,
  SettingOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  CodeOutlined,
  LockOutlined,
  CloudOutlined,
  CalendarOutlined,
  BarcodeOutlined,
  BarChartOutlined,
  PrinterOutlined,
  ShoppingCartOutlined,
  GlobalOutlined,
  RobotOutlined,
  AuditOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  MailOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Sample installed apps data
const installedApps = [
  {
    id: 1,
    name: 'Quickbooks',
    logo: '/logos/quickbooks.png',
    category: 'Accounting',
    status: 'active',
    description: 'Accounting and financial management',
    installedDate: '2023-06-15',
    lastSync: '2023-10-07 14:30',
    dataAccess: ['orders', 'customers', 'products', 'finances'],
    owner: 'admin@truongphat.com'
  },
  {
    id: 2,
    name: 'MailChimp',
    logo: '/logos/mailchimp.png',
    category: 'Marketing',
    status: 'active',
    description: 'Email marketing automation',
    installedDate: '2023-07-21',
    lastSync: '2023-10-06 18:45',
    dataAccess: ['customers', 'orders'],
    owner: 'marketing@truongphat.com'
  },
  {
    id: 3,
    name: 'Google Analytics',
    logo: '/logos/google-analytics.png',
    category: 'Analytics',
    status: 'active',
    description: 'Web analytics and reporting',
    installedDate: '2023-05-12',
    lastSync: 'Continuous',
    dataAccess: ['web_traffic', 'user_behavior'],
    owner: 'admin@truongphat.com'
  },
  {
    id: 4,
    name: 'Xero',
    logo: '/logos/xero.png',
    category: 'Accounting',
    status: 'error',
    description: 'Accounting and financial management',
    installedDate: '2023-08-03',
    lastSync: '2023-10-01 09:15',
    dataAccess: ['orders', 'finances'],
    owner: 'finance@truongphat.com',
    errorMessage: 'Authentication token expired'
  },
  {
    id: 5,
    name: 'Facebook Ads',
    logo: '/logos/facebook-ads.png',
    category: 'Marketing',
    status: 'inactive',
    description: 'Facebook advertising platform',
    installedDate: '2023-04-18',
    lastSync: '2023-09-15 11:30',
    dataAccess: ['customer_audiences'],
    owner: 'marketing@truongphat.com'
  }
];

// Sample available apps data
const availableApps = [
  {
    id: 'quickbooks',
    name: 'Quickbooks',
    logo: '/logos/quickbooks.png',
    category: 'Accounting',
    description: 'Sync orders, invoices, and payments with Quickbooks accounting software',
    pricing: 'Free',
    rating: 4.8,
    status: 'installed'
  },
  {
    id: 'mailchimp',
    name: 'MailChimp',
    logo: '/logos/mailchimp.png',
    category: 'Marketing',
    description: 'Email marketing, automations, and customer segmentation',
    pricing: 'Free',
    rating: 4.7,
    status: 'installed'
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    logo: '/logos/google-analytics.png',
    category: 'Analytics',
    description: 'Track website traffic and user behavior',
    pricing: 'Free',
    rating: 4.9,
    status: 'installed'
  },
  {
    id: 'xero',
    name: 'Xero',
    logo: '/logos/xero.png',
    category: 'Accounting',
    description: 'Cloud-based accounting software for small businesses',
    pricing: 'Free',
    rating: 4.6,
    status: 'installed'
  },
  {
    id: 'facebook-ads',
    name: 'Facebook Ads',
    logo: '/logos/facebook-ads.png',
    category: 'Marketing',
    description: 'Create and manage Facebook advertising campaigns',
    pricing: 'Free',
    rating: 4.5,
    status: 'installed'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    logo: '/logos/hubspot.png',
    category: 'CRM',
    description: 'Customer relationship management and marketing automation',
    pricing: 'Free / Paid',
    rating: 4.7,
    status: 'available'
  },
  {
    id: 'shipstation',
    name: 'ShipStation',
    logo: '/logos/shipstation.png',
    category: 'Shipping',
    description: 'Streamline order fulfillment and shipping processes',
    pricing: 'Paid',
    rating: 4.6,
    status: 'available'
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    logo: '/logos/zendesk.png',
    category: 'Support',
    description: 'Customer support and ticketing system',
    pricing: 'Paid',
    rating: 4.5,
    status: 'available'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    logo: '/logos/dropbox.png',
    category: 'File Storage',
    description: 'Cloud storage and file synchronization',
    pricing: 'Free / Paid',
    rating: 4.4,
    status: 'available'
  },
  {
    id: 'slack',
    name: 'Slack',
    logo: '/logos/slack.png',
    category: 'Communication',
    description: 'Team communication and notifications',
    pricing: 'Free / Paid',
    rating: 4.8,
    status: 'available'
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    logo: '/logos/google-drive.png',
    category: 'File Storage',
    description: 'Cloud storage and file sharing',
    pricing: 'Free / Paid',
    rating: 4.7,
    status: 'available'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    logo: '/logos/zapier.png',
    category: 'Automation',
    description: 'Connect apps and automate workflows',
    pricing: 'Free / Paid',
    rating: 4.6,
    status: 'available'
  }
];

// Integration history data
const integrationActivity = [
  {
    id: 1,
    app: 'Quickbooks',
    activity: 'Data Sync',
    timestamp: '2023-10-07 14:30:22',
    status: 'success',
    details: 'Successfully synced 24 new orders and 8 updated products'
  },
  {
    id: 2,
    app: 'MailChimp',
    activity: 'Customer Export',
    timestamp: '2023-10-06 18:45:11',
    status: 'success',
    details: 'Exported 156 new customers to mailing list'
  },
  {
    id: 3,
    app: 'Xero',
    activity: 'Authentication',
    timestamp: '2023-10-05 09:15:48',
    status: 'error',
    details: 'Authentication token expired. Please reconnect the integration.'
  },
  {
    id: 4,
    app: 'Google Analytics',
    activity: 'Tracking Update',
    timestamp: '2023-10-04 11:23:05',
    status: 'success',
    details: 'Updated tracking parameters for new campaign'
  },
  {
    id: 5,
    app: 'Quickbooks',
    activity: 'Configuration Change',
    timestamp: '2023-10-03 15:42:19',
    status: 'success',
    details: 'Updated tax settings and account mappings'
  }
];

const ThirdPartyApps = () => {
  const [activeTab, setActiveTab] = useState('installed');
  const [installModal, setInstallModal] = useState(false);
  const [configModal, setConfigModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  const filteredAvailableApps = availableApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchText.toLowerCase()) || 
                         app.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  const showInstallModal = (app) => {
    setSelectedApp(app);
    setInstallModal(true);
  };
  
  const showConfigModal = (app) => {
    setSelectedApp(app);
    setConfigModal(true);
    
    // Set form values based on the app
    appForm.setFieldsValue({
      name: app.name,
      status: app.status === 'active',
      owner: app.owner,
      dataAccess: app.dataAccess
    });
  };
  
  const handleInstall = () => {
    setLoading(true);
    
    // Simulate installation process
    setTimeout(() => {
      message.success(`${selectedApp.name} has been successfully installed`);
      setLoading(false);
      setInstallModal(false);
    }, 2000);
  };
  
  const handleSaveConfig = () => {
    appForm.validateFields()
      .then((values) => {
        console.log('Form values:', values);
        message.success(`${selectedApp.name} configuration updated successfully`);
        setConfigModal(false);
      })
      .catch((errorInfo) => {
        console.log('Form validation failed:', errorInfo);
      });
  };
  
  const handleUninstall = (app) => {
    message.success(`${app.name} has been uninstalled`);
  };
  
  const handleSync = (app) => {
    message.loading(`Syncing data with ${app.name}...`, 2);
    
    setTimeout(() => {
      message.success(`Successfully synced with ${app.name}`);
    }, 2000);
  };
  
  const activityColumns = [
    {
      title: 'Application',
      dataIndex: 'app',
      key: 'app',
    },
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'success') {
          return <Badge status="success" text="Success" />;
        } else if (status === 'error') {
          return <Badge status="error" text="Error" />;
        } else if (status === 'warning') {
          return <Badge status="warning" text="Warning" />;
        } else if (status === 'pending') {
          return <Badge status="processing" text="Pending" />;
        }
        
        return <Badge status="default" text={status} />;
      },
      filters: [
        { text: 'Success', value: 'success' },
        { text: 'Error', value: 'error' },
        { text: 'Warning', value: 'warning' },
        { text: 'Pending', value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: {
        showTitle: false,
      },
      render: details => (
        <Tooltip placement="topLeft" title={details}>
          {details}
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small">View Details</Button>
          {record.status === 'error' && (
            <Button type="primary" size="small" danger>
              Resolve
            </Button>
          )}
        </Space>
      ),
    },
  ];
  
  const getAppIcon = (category) => {
    const icons = {
      'Accounting': <FileTextOutlined />,
      'Analytics': <BarChartOutlined />,
      'Marketing': <BarChartOutlined />,
      'CRM': <UserOutlined />,
      'Shipping': <ShoppingCartOutlined />,
      'Support': <CustomerServiceOutlined />,
      'File Storage': <CloudOutlined />,
      'Communication': <MessageOutlined />,
      'Automation': <RobotOutlined />,
      'Productivity': <ToolOutlined />,
    };
    
    return icons[category] || <AppstoreOutlined />;
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>
          <AppstoreOutlined /> Third-Party Apps
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setActiveTab('marketplace')}
        >
          Add New App
        </Button>
      </div>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <AppstoreOutlined /> Installed Apps
              </span>
            } 
            key="installed"
          >
            <Row gutter={[24, 24]}>
              {installedApps.map(app => (
                <Col xs={24} sm={12} md={8} lg={6} key={app.id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    actions={[
                      <Tooltip title="Configure">
                        <Button 
                          type="text" 
                          icon={<SettingOutlined />} 
                          onClick={() => showConfigModal(app)}
                        />
                      </Tooltip>,
                      <Tooltip title="Sync Now">
                        <Button 
                          type="text" 
                          icon={<SyncOutlined />} 
                          onClick={() => handleSync(app)}
                          disabled={app.status !== 'active'}
                        />
                      </Tooltip>,
                      <Popconfirm
                        title={`Are you sure you want to uninstall ${app.name}?`}
                        onConfirm={() => handleUninstall(app)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Tooltip title="Uninstall">
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                          />
                        </Tooltip>
                      </Popconfirm>
                    ]}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {app.logo ? (
                        <Avatar size={64} src={app.logo} style={{ marginBottom: 16 }} />
                      ) : (
                        <Avatar size={64} icon={getAppIcon(app.category)} style={{ marginBottom: 16 }} />
                      )}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>{app.name}</Text>
                          {app.status === 'active' && <Badge status="success" style={{ marginLeft: 8 }} />}
                          {app.status === 'inactive' && <Badge status="default" style={{ marginLeft: 8 }} />}
                          {app.status === 'error' && (
                            <Tooltip title={app.errorMessage}>
                              <Badge status="error" style={{ marginLeft: 8 }} />
                            </Tooltip>
                          )}
                        </div>
                        <Tag color="blue">{app.category}</Tag>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Last sync: {app.lastSync}</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {installedApps.length === 0 && (
              <Empty 
                description="No apps installed"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => setActiveTab('marketplace')}>
                  Explore App Marketplace
                </Button>
              </Empty>
            )}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <ShopOutlined /> App Marketplace
              </span>
            } 
            key="marketplace"
          >
            <div style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={16}>
                  <Input.Search
                    placeholder="Search apps..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={8}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Filter by category"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                  >
                    <Option value="all">All Categories</Option>
                    <Option value="Accounting">Accounting</Option>
                    <Option value="Analytics">Analytics</Option>
                    <Option value="Marketing">Marketing</Option>
                    <Option value="CRM">CRM</Option>
                    <Option value="Shipping">Shipping</Option>
                    <Option value="Support">Support</Option>
                    <Option value="File Storage">File Storage</Option>
                    <Option value="Communication">Communication</Option>
                    <Option value="Automation">Automation</Option>
                  </Select>
                </Col>
              </Row>
            </div>
            
            <Row gutter={[24, 24]}>
              {filteredAvailableApps.map(app => (
                <Col xs={24} sm={12} md={8} lg={6} key={app.id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    actions={[
                      app.status === 'installed' ? (
                        <Button disabled>Installed</Button>
                      ) : (
                        <Button 
                          type="primary" 
                          onClick={() => showInstallModal(app)}
                        >
                          Install
                        </Button>
                      )
                    ]}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {app.logo ? (
                        <Avatar size={64} src={app.logo} style={{ marginBottom: 16 }} />
                      ) : (
                        <Avatar size={64} icon={getAppIcon(app.category)} style={{ marginBottom: 16 }} />
                      )}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>{app.name}</Text>
                        </div>
                        <Tag color="blue">{app.category}</Tag>
                        <div style={{ marginTop: 8 }}>
                          <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 12 }}>
                            {app.description}
                          </Paragraph>
                        </div>
                        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Price: {app.pricing}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>Rating: {app.rating}/5</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {filteredAvailableApps.length === 0 && (
              <Empty description="No apps found matching your search" />
            )}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <HistoryOutlined /> Activity Log
              </span>
            } 
            key="activity"
          >
            <Table
              columns={activityColumns}
              dataSource={integrationActivity}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SettingOutlined /> Integration Settings
              </span>
            } 
            key="settings"
          >
            <Card>
              <Form layout="vertical">
                <Row gutter={24}>
                  <Col span={12}>
                    <Card title="Data Sync Settings" bordered={false}>
                      <Form.Item
                        label="Default Sync Frequency"
                        name="syncFrequency"
                        initialValue="hourly"
                      >
                        <Select>
                          <Option value="realtime">Real-time</Option>
                          <Option value="15min">Every 15 minutes</Option>
                          <Option value="hourly">Hourly</Option>
                          <Option value="daily">Daily</Option>
                          <Option value="weekly">Weekly</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Sync Time Window"
                        name="syncWindow"
                        initialValue="all"
                      >
                        <Select>
                          <Option value="all">All Hours</Option>
                          <Option value="business">Business Hours (9AM-5PM)</Option>
                          <Option value="night">Off Hours (7PM-7AM)</Option>
                          <Option value="custom">Custom Schedule</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Sync Failure Notifications"
                        name="syncFailureNotifications"
                        valuePropName="checked"
                        initialValue={true}
                      >
                        <Switch />
                      </Form.Item>
                    </Card>
                  </Col>
                  
                  <Col span={12}>
                    <Card title="Integration Security" bordered={false}>
                      <Form.Item
                        label="Require Re-authentication"
                        name="reauth"
                        initialValue="90days"
                      >
                        <Select>
                          <Option value="30days">Every 30 days</Option>
                          <Option value="60days">Every 60 days</Option>
                          <Option value="90days">Every 90 days</Option>
                          <Option value="never">Never</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Auto-Disconnect Inactive Integrations"
                        name="autoDisconnect"
                        valuePropName="checked"
                        initialValue={true}
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item
                        label="Inactive Period Before Disconnection"
                        name="inactivePeriod"
                        initialValue="90days"
                      >
                        <Select>
                          <Option value="30days">30 days</Option>
                          <Option value="60days">60 days</Option>
                          <Option value="90days">90 days</Option>
                          <Option value="180days">180 days</Option>
                        </Select>
                      </Form.Item>
                    </Card>
                  </Col>
                </Row>
                
                <Row gutter={24} style={{ marginTop: 24 }}>
                  <Col span={12}>
                    <Card title="OAuth Settings" bordered={false}>
                      <Form.Item
                        label="OAuth Redirect URL"
                        name="oauthRedirect"
                      >
                        <Input readOnly defaultValue="https://truongphat.com/oauth/callback" />
                      </Form.Item>
                      
                      <Form.Item
                        label="Default OAuth Scopes"
                        name="oauthScopes"
                        initialValue={['read_products', 'read_customers', 'read_orders']}
                      >
                        <Select mode="multiple">
                          <Option value="read_products">Read Products</Option>
                          <Option value="write_products">Write Products</Option>
                          <Option value="read_customers">Read Customers</Option>
                          <Option value="write_customers">Write Customers</Option>
                          <Option value="read_orders">Read Orders</Option>
                          <Option value="write_orders">Write Orders</Option>
                        </Select>
                      </Form.Item>
                    </Card>
                  </Col>
                  
                  <Col span={12}>
                    <Card title="Developer Settings" bordered={false}>
                      <Form.Item
                        label="Enable Developer Mode"
                        name="devMode"
                        valuePropName="checked"
                        initialValue={false}
                      >
                        <Switch />
                      </Form.Item>
                      
                      <Form.Item
                        label="API Logging Level"
                        name="apiLogging"
                        initialValue="error"
                      >
                        <Select>
                          <Option value="none">None</Option>
                          <Option value="error">Errors Only</Option>
                          <Option value="info">Info + Errors</Option>
                          <Option value="debug">Debug (All)</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        label="Sandbox Testing"
                        name="sandbox"
                        valuePropName="checked"
                        initialValue={false}
                      >
                        <Switch />
                      </Form.Item>
                    </Card>
                  </Col>
                </Row>
                
                <div style={{ marginTop: 24, textAlign: 'right' }}>
                  <Button type="primary">
                    Save Settings
                  </Button>
                </div>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
      
      <Modal
        title={`Install ${selectedApp?.name}`}
        visible={installModal}
        onCancel={() => setInstallModal(false)}
        footer={[
          <Button key="back" onClick={() => setInstallModal(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading}
            onClick={handleInstall}
          >
            Install
          </Button>,
        ]}
      >
        {selectedApp && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              {selectedApp.logo ? (
                <Avatar size={64} src={selectedApp.logo} />
              ) : (
                <Avatar size={64} icon={getAppIcon(selectedApp.category)} />
              )}
              <Title level={4} style={{ marginTop: '16px', marginBottom: '8px' }}>
                {selectedApp.name}
              </Title>
              <Text>{selectedApp.description}</Text>
            </div>
            
            <Alert
              message="Permission Request"
              description={`${selectedApp.name} is requesting access to your store data. Please review the permissions below.`}
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            
            <Descriptions title="App Details" column={1} bordered>
              <Descriptions.Item label="Developer">
                {selectedApp.name} Inc.
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {selectedApp.category}
              </Descriptions.Item>
              <Descriptions.Item label="Pricing">
                {selectedApp.pricing}
              </Descriptions.Item>
              <Descriptions.Item label="Rating">
                {selectedApp.rating}/5
              </Descriptions.Item>
              <Descriptions.Item label="Permissions Required">
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li>Read product information</li>
                  <li>Read customer information</li>
                  <li>Read order information</li>
                  {selectedApp.category === 'Accounting' && (
                    <li>Read financial information</li>
                  )}
                </ul>
              </Descriptions.Item>
              <Descriptions.Item label="Privacy Policy">
                <a href="#" target="_blank">View Privacy Policy</a>
              </Descriptions.Item>
              <Descriptions.Item label="Terms of Service">
                <a href="#" target="_blank">View Terms of Service</a>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
      
      <Modal
        title={`Configure ${selectedApp?.name}`}
        visible={configModal}
        onCancel={() => setConfigModal(false)}
        footer={[
          <Button key="back" onClick={() => setConfigModal(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSaveConfig}
          >
            Save Configuration
          </Button>,
        ]}
      >
        {selectedApp && (
          <Form
            form={appForm}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="Integration Name"
              rules={[{ required: true, message: 'Please enter a name for this integration' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="status"
              label="Status"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Active" 
                unCheckedChildren="Inactive" 
              />
            </Form.Item>
            
            <Form.Item
              name="owner"
              label="Integration Owner"
              rules={[{ required: true, message: 'Please select an owner' }]}
            >
              <Select>
                <Option value="admin@truongphat.com">Admin (admin@truongphat.com)</Option>
                <Option value="marketing@truongphat.com">Marketing (marketing@truongphat.com)</Option>
                <Option value="finance@truongphat.com">Finance (finance@truongphat.com)</Option>
                <Option value="inventory@truongphat.com">Inventory (inventory@truongphat.com)</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="dataAccess"
              label="Data Access"
              rules={[{ required: true, message: 'Please select at least one data access type' }]}
            >
              <Select mode="multiple">
                <Option value="products">Products</Option>
                <Option value="customers">Customers</Option>
                <Option value="orders">Orders</Option>
                <Option value="finances">Financial Data</Option>
                <Option value="inventory">Inventory</Option>
                <Option value="web_traffic">Web Traffic</Option>
                <Option value="user_behavior">User Behavior</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="syncFrequency"
              label="Sync Frequency"
              initialValue="hourly"
            >
              <Select>
                <Option value="realtime">Real-time</Option>
                <Option value="15min">Every 15 minutes</Option>
                <Option value="hourly">Hourly</Option>
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="manual">Manual Only</Option>
              </Select>
            </Form.Item>
            
            <Divider>Advanced Configuration</Divider>
            
            <Form.Item
              name="webhookUrl"
              label="Webhook URL"
              tooltip="For receiving real-time notifications"
            >
              <Input placeholder="https://example.com/webhook" />
            </Form.Item>
            
            <Form.Item
              name="customFields"
              label="Custom Field Mapping"
              tooltip="Map custom fields between systems"
            >
              <TextArea rows={4} placeholder="Enter custom field mappings (JSON format)" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ThirdPartyApps; 