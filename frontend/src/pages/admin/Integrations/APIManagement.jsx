import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Badge,
  Typography,
  Tabs,
  Switch,
  Form,
  Input,
  Select,
  Divider,
  Row,
  Col,
  Modal,
  Alert,
  Tooltip,
  Statistic,
  Popconfirm,
  List,
  Avatar,
  Timeline,
  Descriptions,
  Radio,
  Progress,
  InputNumber,
  message
} from 'antd';
import {
  ApiOutlined,
  LockOutlined,
  KeyOutlined,
  CodeOutlined,
  BarChartOutlined,
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  SettingOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

// Sample data for API keys
const apiKeys = [
  {
    id: 1,
    name: 'Production API Key',
    key: 'pk_live_51HDx2EGKtcBDE56JowSQIwHu7FiH8nBu2p7m7ZBEgTXUJF2vXDKslT2tPis98DqCXqLCPcrdZtj1ozidCjnXObHX00xUDEkwwD',
    status: 'active',
    permissions: ['read', 'write'],
    created: '2023-06-15',
    lastUsed: '2023-10-07',
    requestCount: 12456,
    ipRestrictions: ['103.21.244.0/22', '103.22.200.0/22'],
    expiryDate: '2024-06-15'
  },
  {
    id: 2,
    name: 'Ecommerce Integration',
    key: 'pk_live_51HDx2EGKtcBDE56JowSQcdutiTVExn7PzVhw2VtSIgzpDmVGgBfGEJDtZjpvJ2CrDbRDftGglERPw3IAyYNd9TjJ00KZf41hQY',
    status: 'active',
    permissions: ['read'],
    created: '2023-08-23',
    lastUsed: '2023-10-06',
    requestCount: 5672,
    ipRestrictions: [],
    expiryDate: null
  },
  {
    id: 3,
    name: 'Mobile App',
    key: 'pk_live_51HDx2EGKtcBDE56JowSQMHJtyxCph2aIzeQWtKzVj5jH8M8iNToB7mCJXpRnbYxcjfJgVz9mHalZ4ZO8k6YQQnC900cyyvqfOx',
    status: 'active',
    permissions: ['read', 'write', 'delete'],
    created: '2023-07-12',
    lastUsed: '2023-10-07',
    requestCount: 8943,
    ipRestrictions: [],
    expiryDate: null
  },
  {
    id: 4,
    name: 'Analytics Integration',
    key: 'pk_live_51HDx2EGKtcBDE56JowSQKHcUYLJWVeVkZVLsdV1NFcBGnMTfDbwFKLW9cX9TSHFL6gfgHmG8gFjgz2OEdWHH9ae700WrZXMfz5',
    status: 'expired',
    permissions: ['read'],
    created: '2023-01-05',
    lastUsed: '2023-08-15',
    requestCount: 1254,
    ipRestrictions: [],
    expiryDate: '2023-08-31'
  },
  {
    id: 5,
    name: 'Development Key',
    key: 'pk_test_51HDx2EGKtcBDE56JowSQvnvk9GcbbDkXyJnS4YegNfpnmsVXoPxBHpBgm0vQnhKfZrheBwZFBBNlJ5lYJZTKTyQi00Sle0UgSJ',
    status: 'inactive',
    permissions: ['read', 'write', 'delete'],
    created: '2023-05-20',
    lastUsed: '2023-09-01',
    requestCount: 3452,
    ipRestrictions: [],
    expiryDate: null
  }
];

// Sample API usage data
const apiUsageData = [
  {
    date: '2023-09-01',
    requests: 1245,
    errors: 23,
    avgResponseTime: 142
  },
  {
    date: '2023-09-02',
    requests: 1312,
    errors: 18,
    avgResponseTime: 138
  },
  {
    date: '2023-09-03',
    requests: 1156,
    errors: 15,
    avgResponseTime: 145
  },
  {
    date: '2023-09-04',
    requests: 1432,
    errors: 12,
    avgResponseTime: 136
  },
  {
    date: '2023-09-05',
    requests: 1523,
    errors: 28,
    avgResponseTime: 150
  },
  {
    date: '2023-09-06',
    requests: 1387,
    errors: 14,
    avgResponseTime: 141
  },
  {
    date: '2023-09-07',
    requests: 1298,
    errors: 9,
    avgResponseTime: 138
  }
];

// Sample endpoints list
const endpoints = [
  {
    path: '/api/v1/products',
    method: 'GET',
    description: 'List all products with pagination',
    params: ['page', 'limit', 'category', 'search'],
    auth: true,
    rateLimit: '1000/hour',
    avgResponseTime: 128,
    status: 'active'
  },
  {
    path: '/api/v1/products/{id}',
    method: 'GET',
    description: 'Get a single product by ID',
    params: ['id'],
    auth: true,
    rateLimit: '1000/hour',
    avgResponseTime: 115,
    status: 'active'
  },
  {
    path: '/api/v1/products',
    method: 'POST',
    description: 'Create a new product',
    params: [],
    auth: true,
    rateLimit: '500/hour',
    avgResponseTime: 245,
    status: 'active'
  },
  {
    path: '/api/v1/products/{id}',
    method: 'PUT',
    description: 'Update an existing product',
    params: ['id'],
    auth: true,
    rateLimit: '500/hour',
    avgResponseTime: 186,
    status: 'active'
  },
  {
    path: '/api/v1/products/{id}',
    method: 'DELETE',
    description: 'Delete a product',
    params: ['id'],
    auth: true,
    rateLimit: '200/hour',
    avgResponseTime: 156,
    status: 'active'
  },
  {
    path: '/api/v1/orders',
    method: 'GET',
    description: 'List all orders with pagination',
    params: ['page', 'limit', 'status', 'customer_id'],
    auth: true,
    rateLimit: '1000/hour',
    avgResponseTime: 172,
    status: 'active'
  },
  {
    path: '/api/v1/orders/{id}',
    method: 'GET',
    description: 'Get a single order by ID',
    params: ['id'],
    auth: true,
    rateLimit: '1000/hour',
    avgResponseTime: 143,
    status: 'active'
  },
  {
    path: '/api/v1/customers',
    method: 'GET',
    description: 'List all customers with pagination',
    params: ['page', 'limit', 'search'],
    auth: true,
    rateLimit: '800/hour',
    avgResponseTime: 165,
    status: 'active'
  },
  {
    path: '/api/v1/analytics/sales',
    method: 'GET',
    description: 'Get sales analytics',
    params: ['start_date', 'end_date', 'group_by'],
    auth: true,
    rateLimit: '100/hour',
    avgResponseTime: 348,
    status: 'active'
  },
  {
    path: '/api/v1/webhooks',
    method: 'POST',
    description: 'Register a new webhook',
    params: [],
    auth: true,
    rateLimit: '50/hour',
    avgResponseTime: 205,
    status: 'active'
  }
];

const APIManagement = () => {
  const [activeTab, setActiveTab] = useState('api-keys');
  const [showSecretKey, setShowSecretKey] = useState({});
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [editKeyModal, setEditKeyModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [keyForm] = Form.useForm();
  
  const toggleKeyVisibility = (keyId) => {
    setShowSecretKey({
      ...showSecretKey,
      [keyId]: !showSecretKey[keyId]
    });
  };
  
  const showEditModal = (key) => {
    setSelectedKey(key);
    setEditKeyModal(true);
    
    keyForm.setFieldsValue({
      name: key.name,
      permissions: key.permissions,
      ipRestrictions: key.ipRestrictions.join('\n'),
      status: key.status,
      expiryDate: key.expiryDate ? moment(key.expiryDate) : null
    });
  };
  
  const handleDeleteKey = (keyId) => {
    confirm({
      title: 'Are you sure you want to delete this API key?',
      content: 'This action cannot be undone. Any applications using this key will no longer be able to access the API.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        // Delete logic would go here
        message.success('API key deleted successfully');
      }
    });
  };
  
  const handleNewKey = () => {
    keyForm.validateFields()
      .then((values) => {
        console.log('Form values:', values);
        message.success('New API key created successfully');
        setNewKeyModal(false);
        keyForm.resetFields();
      })
      .catch((errorInfo) => {
        console.log('Form validation failed:', errorInfo);
      });
  };
  
  const handleUpdateKey = () => {
    keyForm.validateFields()
      .then((values) => {
        console.log('Form values:', values);
        message.success('API key updated successfully');
        setEditKeyModal(false);
      })
      .catch((errorInfo) => {
        console.log('Form validation failed:', errorInfo);
      });
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never expires';
    return dateString;
  };
  
  const keyColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'API Key',
      dataIndex: 'key',
      key: 'key',
      render: (key, record) => (
        <Space>
          <Text code>
            {showSecretKey[record.id] 
              ? key 
              : `${key.substring(0, 8)}...${key.substring(key.length - 4)}`}
          </Text>
          <Button
            type="text"
            icon={showSecretKey[record.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => toggleKeyVisibility(record.id)}
          />
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'active') {
          return <Badge status="success" text="Active" />;
        } else if (status === 'inactive') {
          return <Badge status="default" text="Inactive" />;
        } else if (status === 'expired') {
          return <Badge status="error" text="Expired" />;
        }
        return <Badge status="warning" text={status} />;
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Expired', value: 'expired' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => (
        <Space>
          {permissions.includes('read') && <Tag color="blue">Read</Tag>}
          {permissions.includes('write') && <Tag color="green">Write</Tag>}
          {permissions.includes('delete') && <Tag color="red">Delete</Tag>}
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: 'Last Used',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          <Button
            icon={<SyncOutlined />}
            onClick={() => {
              message.success('API key regenerated. Make sure to update all applications using this key.');
            }}
          >
            Regenerate
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this API key?"
            onConfirm={() => handleDeleteKey(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  const endpointColumns = [
    {
      title: 'Endpoint',
      dataIndex: 'path',
      key: 'path',
      render: (path) => <Text code>{path}</Text>,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method) => {
        const colors = {
          'GET': 'green',
          'POST': 'blue',
          'PUT': 'orange',
          'DELETE': 'red',
          'PATCH': 'purple'
        };
        
        return <Tag color={colors[method]}>{method}</Tag>;
      },
      filters: [
        { text: 'GET', value: 'GET' },
        { text: 'POST', value: 'POST' },
        { text: 'PUT', value: 'PUT' },
        { text: 'DELETE', value: 'DELETE' }
      ],
      onFilter: (value, record) => record.method === value,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Auth Required',
      dataIndex: 'auth',
      key: 'auth',
      render: (auth) => (
        auth ? (
          <Badge status="success" text="Yes" />
        ) : (
          <Badge status="default" text="No" />
        )
      ),
      filters: [
        { text: 'Required', value: true },
        { text: 'Not Required', value: false }
      ],
      onFilter: (value, record) => record.auth === value,
    },
    {
      title: 'Rate Limit',
      dataIndex: 'rateLimit',
      key: 'rateLimit',
    },
    {
      title: 'Avg Response Time',
      dataIndex: 'avgResponseTime',
      key: 'avgResponseTime',
      render: (time) => `${time} ms`,
      sorter: (a, b) => a.avgResponseTime - b.avgResponseTime,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<CodeOutlined />}>Docs</Button>
          <Button icon={<BarChartOutlined />}>Stats</Button>
        </Space>
      ),
    },
  ];
  
  const apiKeyForm = () => (
    <Form
      form={keyForm}
      layout="vertical"
    >
      <Form.Item
        name="name"
        label="Key Name"
        rules={[{ required: true, message: 'Please enter a name for this API key' }]}
      >
        <Input placeholder="e.g., Production API Key" />
      </Form.Item>
      
      <Form.Item
        name="permissions"
        label="Permissions"
        rules={[{ required: true, message: 'Please select at least one permission' }]}
        initialValue={['read']}
      >
        <Checkbox.Group>
          <Row>
            <Col span={8}>
              <Checkbox value="read">Read</Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox value="write">Write</Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox value="delete">Delete</Checkbox>
            </Col>
          </Row>
        </Checkbox.Group>
      </Form.Item>
      
      <Form.Item
        name="ipRestrictions"
        label="IP Restrictions"
        tooltip="Enter one IP or CIDR range per line (e.g., 192.168.1.1 or 192.168.1.0/24)"
      >
        <TextArea 
          placeholder="Leave blank to allow all IPs"
          rows={3}
        />
      </Form.Item>
      
      <Form.Item
        name="expiryDate"
        label="Expiry Date"
        tooltip="Leave blank for a non-expiring key"
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      
      {editKeyModal && (
        <Form.Item
          name="status"
          label="Status"
        >
          <Radio.Group>
            <Radio.Button value="active">Active</Radio.Button>
            <Radio.Button value="inactive">Inactive</Radio.Button>
          </Radio.Group>
        </Form.Item>
      )}
    </Form>
  );
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>
          <ApiOutlined /> API Management
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            keyForm.resetFields();
            setNewKeyModal(true);
          }}
        >
          Create New API Key
        </Button>
      </div>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <KeyOutlined /> API Keys
              </span>
            } 
            key="api-keys"
          >
            <Alert 
              message="Security Notice" 
              description="API keys provide full access to your account. Never share your API keys in publicly accessible areas or client-side code. Limit their permissions and use IP restrictions where possible." 
              type="warning" 
              showIcon 
              style={{ marginBottom: '24px' }} 
            />
            
            <Table 
              columns={keyColumns}
              dataSource={apiKeys}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <BarChartOutlined /> API Usage
              </span>
            } 
            key="api-usage"
          >
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Requests (Today)"
                    value={3854}
                    valueStyle={{ color: '#3f8600' }}
                    suffix="requests"
                  />
                  <div style={{ marginTop: '10px' }}>
                    <Text type="secondary">Average: 160.6/hr</Text>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Success Rate"
                    value={98.7}
                    valueStyle={{ color: '#3f8600' }}
                    suffix="%"
                  />
                  <div style={{ marginTop: '10px' }}>
                    <Progress percent={98.7} size="small" showInfo={false} />
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Avg Response Time"
                    value={147}
                    valueStyle={{ color: '#1890ff' }}
                    suffix="ms"
                  />
                  <div style={{ marginTop: '10px' }}>
                    <Text type="success">-5% vs last week</Text>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Error Rate"
                    value={1.3}
                    valueStyle={{ color: '#cf1322' }}
                    suffix="%"
                  />
                  <div style={{ marginTop: '10px' }}>
                    <Text type="success">-0.2% vs last week</Text>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Card title="API Requests Over Time" style={{ marginBottom: '24px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={apiUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    name="Total Requests" 
                    stroke="#1890ff" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="errors" 
                    name="Error Count" 
                    stroke="#ff4d4f"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            
            <Card title="Response Time">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={apiUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar 
                    dataKey="avgResponseTime" 
                    name="Avg Response Time (ms)" 
                    fill="#52c41a" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <CodeOutlined /> Endpoints
              </span>
            } 
            key="endpoints"
          >
            <Table 
              columns={endpointColumns}
              dataSource={endpoints}
              rowKey={(record) => `${record.path}-${record.method}`}
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ padding: '0 50px' }}>
                    <Title level={5}>Parameters</Title>
                    {record.params.length > 0 ? (
                      <List
                        size="small"
                        bordered
                        dataSource={record.params}
                        renderItem={item => (
                          <List.Item>
                            <Tag color="blue">{item}</Tag>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Text type="secondary">No parameters</Text>
                    )}
                    
                    <Title level={5} style={{ marginTop: '16px' }}>Example Request</Title>
                    <Text code>
                      {`curl -X ${record.method} \\\n  "${window.location.origin}${record.path}" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"`}
                    </Text>
                  </div>
                ),
              }}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SecurityScanOutlined /> Security
              </span>
            } 
            key="security"
          >
            <Card title="API Security Settings">
              <Form layout="vertical">
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="Rate Limiting"
                      tooltip="Limit the number of requests per API key"
                    >
                      <InputNumber 
                        min={1} 
                        defaultValue={1000} 
                        addonAfter="requests/hour"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    
                    <Form.Item
                      label="Max Token Lifetime"
                      tooltip="Maximum lifetime of auth tokens"
                    >
                      <Select defaultValue="24h">
                        <Option value="1h">1 hour</Option>
                        <Option value="6h">6 hours</Option>
                        <Option value="12h">12 hours</Option>
                        <Option value="24h">24 hours</Option>
                        <Option value="7d">7 days</Option>
                        <Option value="30d">30 days</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      label="CORS Origins"
                      tooltip="Allowed origins for cross-origin requests"
                    >
                      <Select mode="tags" placeholder="Enter allowed origins (e.g., https://example.com)" />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      label="API Key Prefix"
                      tooltip="Prefix for generated API keys"
                    >
                      <Input defaultValue="pk_live_" />
                    </Form.Item>
                    
                    <Form.Item
                      label="Default API Key Expiry"
                    >
                      <Select defaultValue="never">
                        <Option value="30d">30 days</Option>
                        <Option value="90d">90 days</Option>
                        <Option value="180d">180 days</Option>
                        <Option value="365d">1 year</Option>
                        <Option value="never">Never</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      label="Security Measures"
                    >
                      <Checkbox.Group defaultValue={['ssl', 'cors', 'ip_logging']}>
                        <Row>
                          <Col span={24}>
                            <Checkbox value="ssl">Require SSL/TLS</Checkbox>
                          </Col>
                          <Col span={24}>
                            <Checkbox value="cors">Enable CORS Protection</Checkbox>
                          </Col>
                          <Col span={24}>
                            <Checkbox value="ip_logging">Log IP Addresses</Checkbox>
                          </Col>
                          <Col span={24}>
                            <Checkbox value="auto_block">Auto-block Suspicious Activity</Checkbox>
                          </Col>
                        </Row>
                      </Checkbox.Group>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Button type="primary">
                  Save Security Settings
                </Button>
              </Form>
            </Card>
            
            <Card title="API Access Log" style={{ marginTop: '24px' }}>
              <Timeline>
                <Timeline.Item dot={<CheckCircleOutlined style={{ color: 'green' }} />}>
                  <p><Text strong>Successful authentication</Text> - API Key: pk_live_***</p>
                  <p>IP: 103.21.244.2 - Timestamp: 2023-10-07 15:32:15</p>
                  <p>Endpoint: GET /api/v1/products</p>
                </Timeline.Item>
                <Timeline.Item dot={<CheckCircleOutlined style={{ color: 'green' }} />}>
                  <p><Text strong>Successful authentication</Text> - API Key: pk_live_***</p>
                  <p>IP: 103.21.244.2 - Timestamp: 2023-10-07 15:30:45</p>
                  <p>Endpoint: GET /api/v1/products/156</p>
                </Timeline.Item>
                <Timeline.Item dot={<CloseCircleOutlined style={{ color: 'red' }} />}>
                  <p><Text type="danger" strong>Authentication failed</Text> - Invalid API Key</p>
                  <p>IP: 185.176.43.87 - Timestamp: 2023-10-07 15:28:22</p>
                  <p>Endpoint: POST /api/v1/orders</p>
                </Timeline.Item>
                <Timeline.Item dot={<ClockCircleOutlined style={{ color: 'orange' }} />}>
                  <p><Text strong>Rate limit warning</Text> - API Key: pk_live_***</p>
                  <p>IP: 103.21.244.2 - Timestamp: 2023-10-07 15:25:18</p>
                  <p>Reached 85% of hourly limit (850/1000 requests)</p>
                </Timeline.Item>
                <Timeline.Item dot={<CheckCircleOutlined style={{ color: 'green' }} />}>
                  <p><Text strong>Successful authentication</Text> - API Key: pk_live_***</p>
                  <p>IP: 103.21.244.2 - Timestamp: 2023-10-07 15:22:05</p>
                  <p>Endpoint: POST /api/v1/products</p>
                </Timeline.Item>
              </Timeline>
              
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Button type="primary">View Full Access Log</Button>
              </div>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <QuestionCircleOutlined /> Documentation
              </span>
            } 
            key="documentation"
          >
            <Card>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Title level={3}>API Documentation</Title>
                <Paragraph>
                  Comprehensive documentation for integrating with the Trường Phát Computer API
                </Paragraph>
                
                <Space size="large">
                  <Button icon={<CodeOutlined />} type="primary">
                    Interactive API Explorer
                  </Button>
                  <Button icon={<DownloadOutlined />}>
                    Download OpenAPI Spec
                  </Button>
                </Space>
              </div>
              
              <Divider />
              
              <Title level={4}>Getting Started</Title>
              <Paragraph>
                To use the API, you need an API key. Follow these steps to create and use your API key:
              </Paragraph>
              
              <ol>
                <li>Create an API key in the <a>API Keys</a> section</li>
                <li>Include your API key in each request's Authorization header</li>
                <li>Make requests to the API endpoints</li>
              </ol>
              
              <Alert 
                message="Authentication Example" 
                description={
                  <div>
                    <Text code>
                      curl -X GET "https://api.truongphat.com/v1/products" \<br />
                      -H "Authorization: Bearer YOUR_API_KEY"
                    </Text>
                  </div>
                }
                type="info" 
                style={{ marginTop: '16px', marginBottom: '16px' }} 
              />
              
              <Title level={4}>API Guides</Title>
              <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={[
                  {
                    title: 'Product Management',
                    description: 'Create, update, and manage products',
                    icon: <ShopOutlined />
                  },
                  {
                    title: 'Order Processing',
                    description: 'Work with customer orders',
                    icon: <ShoppingCartOutlined />
                  },
                  {
                    title: 'Customer Data',
                    description: 'Access and manage customer information',
                    icon: <UserOutlined />
                  },
                  {
                    title: 'Inventory Management',
                    description: 'Track and update inventory',
                    icon: <DatabaseOutlined />
                  },
                  {
                    title: 'Analytics',
                    description: 'Access sales and performance data',
                    icon: <LineChartOutlined />
                  },
                  {
                    title: 'Webhooks',
                    description: 'Set up and manage event notifications',
                    icon: <ApiOutlined />
                  }
                ]}
                renderItem={item => (
                  <List.Item>
                    <Card hoverable>
                      <Card.Meta
                        avatar={<Avatar icon={item.icon} />}
                        title={item.title}
                        description={item.description}
                      />
                      <div style={{ marginTop: '16px' }}>
                        <Button type="link" style={{ padding: 0 }}>View Documentation</Button>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>
      
      <Modal
        title="Create New API Key"
        visible={newKeyModal}
        onCancel={() => setNewKeyModal(false)}
        onOk={handleNewKey}
        okText="Create API Key"
        width={600}
      >
        {apiKeyForm()}
      </Modal>
      
      <Modal
        title={`Edit API Key: ${selectedKey?.name}`}
        visible={editKeyModal}
        onCancel={() => setEditKeyModal(false)}
        onOk={handleUpdateKey}
        okText="Update API Key"
        width={600}
      >
        {apiKeyForm()}
      </Modal>
    </div>
  );
};

export default APIManagement; 