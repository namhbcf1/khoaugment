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
  Radio,
  List,
  Avatar,
  Spin,
  message
} from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  SettingOutlined,
  LockOutlined,
  BankOutlined,
  WalletOutlined,
  GlobalOutlined,
  SafetyOutlined,
  QuestionCircleOutlined,
  CodeOutlined,
  ApiOutlined,
  HistoryOutlined,
  RiseOutlined,
  EditOutlined,
  DeleteOutlined,
  QrcodeOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// Sample data for payment gateways
const paymentGateways = [
  {
    id: 1,
    name: 'VNPay',
    logo: '/logos/vnpay.png',
    status: 'active',
    integration: 'direct',
    methods: ['credit_card', 'bank_transfer', 'qr_code'],
    fee: '2.5%',
    transactions: 1245,
    volume: 856000000
  },
  {
    id: 2,
    name: 'Momo',
    logo: '/logos/momo.png',
    status: 'active',
    integration: 'direct',
    methods: ['ewallet', 'qr_code'],
    fee: '2.2%',
    transactions: 980,
    volume: 543000000
  },
  {
    id: 3,
    name: 'ZaloPay',
    logo: '/logos/zalopay.png',
    status: 'inactive',
    integration: 'direct',
    methods: ['ewallet', 'qr_code', 'credit_card'],
    fee: '2.4%',
    transactions: 0,
    volume: 0
  },
  {
    id: 4,
    name: 'Paypal',
    logo: '/logos/paypal.png',
    status: 'active',
    integration: 'direct',
    methods: ['credit_card', 'paypal_balance'],
    fee: '3.9% + 0.3 USD',
    transactions: 65,
    volume: 158000000
  },
  {
    id: 5,
    name: 'Stripe',
    logo: '/logos/stripe.png',
    status: 'inactive',
    integration: 'available',
    methods: ['credit_card', 'bank_transfer'],
    fee: '3.4% + 0.5 USD',
    transactions: 0,
    volume: 0
  }
];

// Transaction history
const transactions = [
  {
    id: 'TXN-1001',
    date: '2023-10-07 14:32:15',
    gateway: 'VNPay',
    amount: 2450000,
    method: 'credit_card',
    status: 'success',
    customer: 'Nguyen Van A',
    orderId: 'ORD-5432'
  },
  {
    id: 'TXN-1002',
    date: '2023-10-07 13:45:21',
    gateway: 'Momo',
    amount: 1850000,
    method: 'ewallet',
    status: 'success',
    customer: 'Tran Thi B',
    orderId: 'ORD-5431'
  },
  {
    id: 'TXN-1003',
    date: '2023-10-07 11:22:45',
    gateway: 'VNPay',
    amount: 3780000,
    method: 'bank_transfer',
    status: 'success',
    customer: 'Le Van C',
    orderId: 'ORD-5430'
  },
  {
    id: 'TXN-1004',
    date: '2023-10-07 10:15:33',
    gateway: 'Paypal',
    amount: 4250000,
    method: 'credit_card',
    status: 'success',
    customer: 'John Smith',
    orderId: 'ORD-5429'
  },
  {
    id: 'TXN-1005',
    date: '2023-10-07 09:42:18',
    gateway: 'VNPay',
    amount: 1650000,
    method: 'qr_code',
    status: 'failed',
    customer: 'Hoang Van D',
    orderId: 'ORD-5428',
    errorMessage: 'Transaction timeout'
  }
];

// Available payment gateways
const availableGateways = [
  {
    id: 'vnpay',
    name: 'VNPay',
    logo: '/logos/vnpay.png',
    description: 'Leading payment gateway in Vietnam supporting bank transfer, cards, and QR payments',
    status: 'connected',
    countries: ['Vietnam'],
    currencies: ['VND']
  },
  {
    id: 'momo',
    name: 'Momo',
    logo: '/logos/momo.png',
    description: 'Popular e-wallet in Vietnam with extensive user base',
    status: 'connected',
    countries: ['Vietnam'],
    currencies: ['VND']
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    logo: '/logos/zalopay.png',
    description: 'E-wallet from Zalo with growing market share in Vietnam',
    status: 'connected',
    countries: ['Vietnam'],
    currencies: ['VND']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: '/logos/paypal.png',
    description: 'Global payment processor for international sales',
    status: 'connected',
    countries: ['Global'],
    currencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'VND']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: '/logos/stripe.png',
    description: 'Comprehensive payment platform for web and mobile transactions',
    status: 'available',
    countries: ['Global'],
    currencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'VND']
  },
  {
    id: 'onepay',
    name: 'OnePay',
    logo: '/logos/onepay.png',
    description: 'Vietnamese payment gateway for domestic and international cards',
    status: 'available',
    countries: ['Vietnam'],
    currencies: ['VND', 'USD']
  },
  {
    id: 'alepay',
    name: 'Alepay',
    logo: '/logos/alepay.png',
    description: 'Payment gateway specializing in installment payments',
    status: 'available',
    countries: ['Vietnam'],
    currencies: ['VND']
  },
  {
    id: '2checkout',
    name: '2Checkout',
    logo: '/logos/2checkout.png',
    description: 'Global payment processor with tax and compliance management',
    status: 'available',
    countries: ['Global'],
    currencies: ['USD', 'EUR', 'GBP', 'VND']
  }
];

const PaymentGateways = () => {
  const [activeTab, setActiveTab] = useState('gateways');
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [configForm] = Form.useForm();
  const [testAmount, setTestAmount] = useState(10000);
  const [loading, setLoading] = useState(false);
  
  const showConfigModal = (gateway) => {
    setSelectedGateway(gateway);
    setConfigModalVisible(true);
  };
  
  const showTestModal = (gateway) => {
    setSelectedGateway(gateway);
    setTestModalVisible(true);
  };
  
  const handleSaveConfig = () => {
    configForm.validateFields()
      .then((values) => {
        console.log('Form values:', values);
        message.success(`${selectedGateway.name} configuration saved successfully`);
        setConfigModalVisible(false);
      })
      .catch((errorInfo) => {
        console.log('Form validation failed:', errorInfo);
      });
  };
  
  const handleTestPayment = () => {
    setLoading(true);
    message.loading(`Processing test payment via ${selectedGateway.name}...`, 2);
    
    setTimeout(() => {
      setLoading(false);
      message.success('Test payment completed successfully');
      setTestModalVisible(false);
    }, 2500);
  };
  
  const handleToggleGateway = (checked, gateway) => {
    console.log(`${gateway.name} status set to ${checked ? 'active' : 'inactive'}`);
    message.success(`${gateway.name} ${checked ? 'activated' : 'deactivated'} successfully`);
    // Would update state or make API call here
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const gatewayColumns = [
    {
      title: 'Gateway',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.logo ? (
            <Avatar src={record.logo} />
          ) : (
            <Avatar icon={<CreditCardOutlined />} />
          )}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleToggleGateway(checked, record)}
        />
      ),
    },
    {
      title: 'Methods',
      dataIndex: 'methods',
      key: 'methods',
      render: (methods) => (
        <Space>
          {methods.includes('credit_card') && (
            <Tooltip title="Credit Card">
              <CreditCardOutlined style={{ fontSize: '16px' }} />
            </Tooltip>
          )}
          {methods.includes('bank_transfer') && (
            <Tooltip title="Bank Transfer">
              <BankOutlined style={{ fontSize: '16px' }} />
            </Tooltip>
          )}
          {methods.includes('ewallet') && (
            <Tooltip title="E-Wallet">
              <WalletOutlined style={{ fontSize: '16px' }} />
            </Tooltip>
          )}
          {methods.includes('qr_code') && (
            <Tooltip title="QR Code">
              <QrcodeOutlined style={{ fontSize: '16px' }} />
            </Tooltip>
          )}
          {methods.includes('paypal_balance') && (
            <Tooltip title="PayPal Balance">
              <DollarOutlined style={{ fontSize: '16px' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
    },
    {
      title: 'Transactions',
      dataIndex: 'transactions',
      key: 'transactions',
      sorter: (a, b) => a.transactions - b.transactions,
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      render: (volume) => formatCurrency(volume),
      sorter: (a, b) => a.volume - b.volume,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<SettingOutlined />}
            onClick={() => showConfigModal(record)}
          >
            Configure
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            onClick={() => showTestModal(record)}
            disabled={record.status !== 'active'}
          >
            Test
          </Button>
        </Space>
      ),
    },
  ];
  
  const transactionColumns = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Gateway',
      dataIndex: 'gateway',
      key: 'gateway',
      filters: [
        { text: 'VNPay', value: 'VNPay' },
        { text: 'Momo', value: 'Momo' },
        { text: 'ZaloPay', value: 'ZaloPay' },
        { text: 'PayPal', value: 'PayPal' },
      ],
      onFilter: (value, record) => record.gateway === value,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Payment Method',
      dataIndex: 'method',
      key: 'method',
      render: (method) => {
        const methods = {
          credit_card: { icon: <CreditCardOutlined />, text: 'Credit Card' },
          bank_transfer: { icon: <BankOutlined />, text: 'Bank Transfer' },
          ewallet: { icon: <WalletOutlined />, text: 'E-Wallet' },
          qr_code: { icon: <QrcodeOutlined />, text: 'QR Code' },
          paypal_balance: { icon: <DollarOutlined />, text: 'PayPal Balance' },
        };
        
        return (
          <Space>
            {methods[method].icon}
            {methods[method].text}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        if (status === 'success') {
          return <Badge status="success" text="Success" />;
        } else if (status === 'failed') {
          return (
            <Tooltip title={record.errorMessage || 'Transaction failed'}>
              <Badge status="error" text="Failed" />
            </Tooltip>
          );
        } else if (status === 'pending') {
          return <Badge status="processing" text="Pending" />;
        } else if (status === 'refunded') {
          return <Badge status="warning" text="Refunded" />;
        }
        
        return <Badge status="default" text={status} />;
      },
      filters: [
        { text: 'Success', value: 'success' },
        { text: 'Failed', value: 'failed' },
        { text: 'Pending', value: 'pending' },
        { text: 'Refunded', value: 'refunded' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Order',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text) => <a>{text}</a>,
    },
  ];
  
  const renderGatewayConfig = () => {
    const gateway = selectedGateway;
    
    if (!gateway) {
      return null;
    }
    
    return (
      <Form
        form={configForm}
        layout="vertical"
        initialValues={{
          environment: 'production',
          captureMethod: 'automatic',
          recurringPayments: false,
          webhookUrl: 'https://api.truongphat.com/webhooks/payments',
          notificationEmail: 'payments@truongphat.com',
          currency: 'VND',
          threeDSecure: true
        }}
      >
        <Tabs defaultActiveKey="credentials">
          <TabPane 
            tab={<span><SafetyOutlined /> Authentication</span>}
            key="credentials"
          >
            <Alert 
              message="Sensitive Information" 
              description="API keys and credentials are encrypted and stored securely. Only authorized users can view and modify these settings." 
              type="warning" 
              showIcon 
              style={{ marginBottom: '24px' }} 
            />
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="API Key"
                  name="apiKey"
                  rules={[{ required: true, message: 'API Key is required' }]}
                >
                  <Input.Password placeholder="Enter API Key" />
                </Form.Item>
                
                <Form.Item
                  label="Secret Key"
                  name="secretKey"
                  rules={[{ required: true, message: 'Secret Key is required' }]}
                >
                  <Input.Password placeholder="Enter Secret Key" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="Merchant ID"
                  name="merchantId"
                  rules={[{ required: true, message: 'Merchant ID is required' }]}
                >
                  <Input placeholder="Enter Merchant ID" />
                </Form.Item>
                
                <Form.Item
                  label="Environment"
                  name="environment"
                >
                  <Radio.Group>
                    <Radio.Button value="sandbox">Sandbox</Radio.Button>
                    <Radio.Button value="production">Production</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane 
            tab={<span><SettingOutlined /> Payment Settings</span>}
            key="settings"
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Default Currency"
                  name="currency"
                >
                  <Select>
                    <Option value="VND">VND</Option>
                    <Option value="USD">USD</Option>
                    <Option value="EUR">EUR</Option>
                    <Option value="JPY">JPY</Option>
                    <Option value="SGD">SGD</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  label="Capture Method"
                  name="captureMethod"
                  tooltip="Choose when to capture payment"
                >
                  <Select>
                    <Option value="automatic">Automatic (capture immediately)</Option>
                    <Option value="manual">Manual (authorize now, capture later)</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  label="Statement Descriptor"
                  name="statementDescriptor"
                  tooltip="Text that appears on customer's bank statement"
                >
                  <Input placeholder="E.g., Trường Phát Computer" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="3D Secure"
                  name="threeDSecure"
                  valuePropName="checked"
                  tooltip="Add an extra layer of fraud protection"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  label="Recurring Payments"
                  name="recurringPayments"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  label="Minimum Transaction Amount"
                  name="minTransaction"
                >
                  <Input 
                    type="number" 
                    prefix="₫" 
                    placeholder="0"
                    addonAfter="VND" 
                  />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane 
            tab={<span><ApiOutlined /> Webhooks & Notifications</span>}
            key="webhooks"
          >
            <Form.Item
              label="Webhook URL"
              name="webhookUrl"
              tooltip="Your server endpoint that will receive payment notifications"
            >
              <Input placeholder="https://your-website.com/webhook/payment" />
            </Form.Item>
            
            <Form.Item
              label="Webhook Secret"
              name="webhookSecret"
              tooltip="Secret key to verify webhook requests"
            >
              <Input.Password placeholder="Webhook secret" />
            </Form.Item>
            
            <Form.Item
              label="Notification Email"
              name="notificationEmail"
              tooltip="Email to receive payment notifications"
            >
              <Input type="email" placeholder="payments@yourcompany.com" />
            </Form.Item>
            
            <Form.Item
              label="Events to Notify"
              name="notifyEvents"
              initialValue={['payment_success', 'payment_failed', 'refund']}
            >
              <Checkbox.Group>
                <Row>
                  <Col span={8}>
                    <Checkbox value="payment_success">Payment Success</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="payment_failed">Payment Failed</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="payment_pending">Payment Pending</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="refund">Refund</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="dispute">Dispute</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="chargeback">Chargeback</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </TabPane>
        </Tabs>
      </Form>
    );
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>
          <CreditCardOutlined /> Payment Gateways
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setActiveTab('available')}
        >
          Add Payment Gateway
        </Button>
      </div>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <CreditCardOutlined /> Active Gateways
              </span>
            } 
            key="gateways"
          >
            <Table 
              columns={gatewayColumns}
              dataSource={paymentGateways.filter(g => g.integration !== 'available')}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <HistoryOutlined /> Transaction History
              </span>
            } 
            key="transactions"
          >
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Input.Search placeholder="Search transactions" style={{ width: 250 }} />
                <Select 
                  placeholder="Payment Gateway" 
                  style={{ width: 150 }}
                  allowClear
                >
                  <Option value="vnpay">VNPay</Option>
                  <Option value="momo">Momo</Option>
                  <Option value="zalopay">ZaloPay</Option>
                  <Option value="paypal">PayPal</Option>
                </Select>
                <Select 
                  placeholder="Status" 
                  style={{ width: 150 }}
                  allowClear
                >
                  <Option value="success">Success</Option>
                  <Option value="failed">Failed</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="refunded">Refunded</Option>
                </Select>
              </Space>
            </div>
            
            <Table
              columns={transactionColumns}
              dataSource={transactions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <PlusOutlined /> Available Gateways
              </span>
            } 
            key="available"
          >
            <Row gutter={[24, 24]}>
              {availableGateways.map(gateway => (
                <Col xs={24} sm={12} lg={8} key={gateway.id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    actions={[
                      gateway.status === 'connected' ? (
                        <Button type="default" disabled>
                          Connected
                        </Button>
                      ) : (
                        <Button 
                          type="primary" 
                          onClick={() => showConfigModal(gateway)}
                        >
                          Connect
                        </Button>
                      )
                    ]}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
                      {gateway.logo ? (
                        <Avatar size={64} src={gateway.logo} style={{ marginBottom: 16 }} />
                      ) : (
                        <Avatar size={64} icon={<CreditCardOutlined />} style={{ marginBottom: 16 }} />
                      )}
                      <Title level={4}>{gateway.name}</Title>
                      <Paragraph style={{ textAlign: 'center' }}>
                        {gateway.description}
                      </Paragraph>
                      <div style={{ marginTop: 16 }}>
                        <Space>
                          {gateway.countries.map((country, i) => (
                            <Tag key={i} icon={<GlobalOutlined />}>{country}</Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SettingOutlined /> Global Settings
              </span>
            } 
            key="settings"
          >
            <Form layout="vertical">
              <Row gutter={24}>
                <Col span={12}>
                  <Card title="Default Payment Settings" style={{ marginBottom: 24 }}>
                    <Form.Item
                      label="Default Payment Gateway"
                      name="defaultGateway"
                      initialValue="vnpay"
                    >
                      <Select>
                        <Option value="vnpay">VNPay</Option>
                        <Option value="momo">Momo</Option>
                        <Option value="zalopay">ZaloPay</Option>
                        <Option value="paypal">PayPal</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      label="Payment Page Timeout"
                      name="paymentTimeout"
                      tooltip="Time in minutes before payment session expires"
                      initialValue={30}
                    >
                      <Select>
                        <Option value={15}>15 minutes</Option>
                        <Option value={30}>30 minutes</Option>
                        <Option value={60}>1 hour</Option>
                        <Option value={120}>2 hours</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      label="Payment Methods Display Order"
                      name="methodsOrder"
                      initialValue={['card', 'ewallet', 'bank', 'qr']}
                    >
                      <Select mode="multiple">
                        <Option value="card">Credit/Debit Cards</Option>
                        <Option value="ewallet">E-Wallets</Option>
                        <Option value="bank">Bank Transfer</Option>
                        <Option value="qr">QR Payments</Option>
                      </Select>
                    </Form.Item>
                  </Card>
                  
                  <Card title="Security Settings">
                    <Form.Item
                      label="Fraud Protection"
                      name="fraudProtection"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                    
                    <Form.Item
                      label="IP Address Verification"
                      name="ipVerification"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                    
                    <Form.Item
                      label="Maximum Failed Attempts"
                      name="maxFailedAttempts"
                      tooltip="Number of failed payment attempts before blocking"
                      initialValue={5}
                    >
                      <Select>
                        <Option value={3}>3 attempts</Option>
                        <Option value={5}>5 attempts</Option>
                        <Option value={10}>10 attempts</Option>
                      </Select>
                    </Form.Item>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card title="Checkout Experience" style={{ marginBottom: 24 }}>
                    <Form.Item
                      label="Payment Form Layout"
                      name="paymentLayout"
                      initialValue="embedded"
                    >
                      <Radio.Group>
                        <Radio value="embedded">Embedded Form</Radio>
                        <Radio value="redirect">Redirect to Gateway</Radio>
                      </Radio.Group>
                    </Form.Item>
                    
                    <Form.Item
                      label="Save Payment Methods"
                      name="savePaymentMethods"
                      valuePropName="checked"
                      initialValue={true}
                      tooltip="Allow customers to save payment methods for future purchases"
                    >
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                    
                    <Form.Item
                      label="Display Payment Icons"
                      name="displayIcons"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                  </Card>
                  
                  <Card title="Notification Settings">
                    <Form.Item
                      label="Email Notifications"
                      name="emailNotifications"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                    
                    <Form.Item
                      label="Payment Receipt"
                      name="paymentReceipt"
                      valuePropName="checked"
                      initialValue={true}
                      tooltip="Send payment receipt to customers"
                    >
                      <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>
                    
                    <Form.Item
                      label="Admin Notification Email"
                      name="adminEmail"
                      initialValue="finance@truongphat.com"
                    >
                      <Input placeholder="Email to receive payment notifications" />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <Button type="primary">
                  Save Settings
                </Button>
              </div>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
      
      <Modal
        title={`Configure ${selectedGateway?.name}`}
        visible={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setConfigModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSaveConfig}>
            Save Configuration
          </Button>,
        ]}
      >
        {renderGatewayConfig()}
      </Modal>
      
      <Modal
        title={`Test Payment - ${selectedGateway?.name}`}
        visible={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setTestModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleTestPayment} loading={loading}>
            Process Test Payment
          </Button>,
        ]}
      >
        <Alert
          message="Test Mode"
          description="This will create a test transaction with the selected payment gateway. No actual money will be charged."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        <Form layout="vertical">
          <Form.Item
            label="Amount"
            name="amount"
          >
            <Input
              type="number"
              prefix="₫"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              addonAfter="VND"
              defaultValue="10000"
            />
          </Form.Item>
          
          <Form.Item
            label="Payment Method"
            name="paymentMethod"
          >
            <Select defaultValue="credit_card">
              {selectedGateway?.methods?.map((method) => {
                const methods = {
                  credit_card: { text: 'Credit Card' },
                  bank_transfer: { text: 'Bank Transfer' },
                  ewallet: { text: 'E-Wallet' },
                  qr_code: { text: 'QR Code' },
                  paypal_balance: { text: 'PayPal Balance' },
                };
                
                return (
                  <Option key={method} value={method}>
                    {methods[method]?.text || method}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentGateways; 