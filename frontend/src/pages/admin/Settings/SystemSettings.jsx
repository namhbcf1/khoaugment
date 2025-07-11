import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Select,
  Switch,
  Button,
  TimePicker,
  Upload,
  Space,
  Divider,
  Row,
  Col,
  Typography,
  message,
  Badge,
  Alert,
  Tooltip,
  InputNumber
} from 'antd';
import {
  SettingOutlined,
  GlobalOutlined,
  MailOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  ClockCircleOutlined,
  BellOutlined,
  DatabaseOutlined,
  UploadOutlined,
  ApiOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SystemSettings = () => {
  const [form] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [backupForm] = Form.useForm();
  const [localizationForm] = Form.useForm();
  const [integrationsForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  
  const handleSave = async (values) => {
    setLoading(true);
    try {
      console.log('Saving system settings:', values);
      message.success('System settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestEmail = () => {
    setEmailTestLoading(true);
    setTimeout(() => {
      message.success('Test email sent successfully');
      setEmailTestLoading(false);
    }, 1500);
  };
  
  const handleBackup = () => {
    setBackupLoading(true);
    setTimeout(() => {
      message.success('System backup initiated');
      setBackupLoading(false);
    }, 2000);
  };
  
  const timeFormats = ['HH:mm:ss', 'h:mm:ss a', 'h:mm a'];
  const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
  
  const currencies = [
    { code: 'VND', name: 'Vietnamese Dong' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' }
  ];
  
  const languages = [
    { code: 'vi', name: 'Vietnamese' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' }
  ];
  
  return (
    <div className="system-settings-container" style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={2}><SettingOutlined /> System Settings</Title>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={loading}
            >
              Save All Settings
            </Button>
          </div>
          
          <Alert 
            message="System Settings" 
            description="These settings affect the entire system operation. Changes may require a system restart."
            type="info" 
            showIcon 
            style={{ marginBottom: 24 }} 
          />
        </Col>
      </Row>
      
      <Tabs defaultActiveKey="general">
        <TabPane tab={<span><SettingOutlined /> General</span>} key="general">
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                storeName: 'Trường Phát Computer',
                storePhone: '0836.768.597',
                storeEmail: 'contact@truongphat.com',
                receiptFooter: 'Thank you for shopping with us!',
                autoLogout: 30,
                maintenanceMode: false,
                debugMode: false
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="storeName"
                    label="Store Name"
                    rules={[{ required: true, message: 'Please enter store name' }]}
                  >
                    <Input />
                  </Form.Item>
                  
                  <Form.Item
                    name="storePhone"
                    label="Store Phone"
                    rules={[{ required: true, message: 'Please enter store phone' }]}
                  >
                    <Input />
                  </Form.Item>
                  
                  <Form.Item
                    name="storeEmail"
                    label="Store Email"
                    rules={[{ required: true, message: 'Please enter store email' }]}
                  >
                    <Input />
                  </Form.Item>
                  
                  <Form.Item
                    name="autoLogout"
                    label="Auto Logout (minutes)"
                    rules={[{ required: true, message: 'Please enter auto logout time' }]}
                  >
                    <InputNumber min={0} max={480} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="receiptFooter"
                    label="Receipt Footer Text"
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                  
                  <Form.Item
                    name="maintenanceMode"
                    label="Maintenance Mode"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    name="debugMode"
                    label="Debug Mode"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab={<span><GlobalOutlined /> Localization</span>} key="localization">
          <Card>
            <Form
              form={localizationForm}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                language: 'vi',
                currency: 'VND',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: 'HH:mm:ss',
                timezone: 'Asia/Ho_Chi_Minh'
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="language"
                    label="Default Language"
                    rules={[{ required: true, message: 'Please select a language' }]}
                  >
                    <Select>
                      {languages.map(lang => (
                        <Option key={lang.code} value={lang.code}>{lang.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="timezone"
                    label="Timezone"
                    rules={[{ required: true, message: 'Please select a timezone' }]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="children"
                    >
                      <Option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</Option>
                      <Option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</Option>
                      <Option value="America/New_York">America/New_York (GMT-5)</Option>
                      <Option value="Europe/London">Europe/London (GMT+0)</Option>
                      <Option value="Europe/Paris">Europe/Paris (GMT+1)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="currency"
                    label="Default Currency"
                    rules={[{ required: true, message: 'Please select a currency' }]}
                  >
                    <Select>
                      {currencies.map(currency => (
                        <Option key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="dateFormat"
                    label="Date Format"
                    rules={[{ required: true, message: 'Please select a date format' }]}
                  >
                    <Select>
                      {dateFormats.map(format => (
                        <Option key={format} value={format}>{format}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="timeFormat"
                    label="Time Format"
                    rules={[{ required: true, message: 'Please select a time format' }]}
                  >
                    <Select>
                      {timeFormats.map(format => (
                        <Option key={format} value={format}>{format}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                >
                  Save Localization Settings
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab={<span><DatabaseOutlined /> Backup & Restore</span>} key="backup">
          <Card>
            <Form
              form={backupForm}
              layout="vertical"
              initialValues={{
                automaticBackup: true,
                backupTime: dayjs('03:00:00', 'HH:mm:ss'),
                keepBackups: 7,
                backupLocation: 'cloud',
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="automaticBackup"
                    label="Automatic Backups"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    name="backupTime"
                    label="Backup Time"
                  >
                    <TimePicker format="HH:mm:ss" style={{ width: '100%' }} />
                  </Form.Item>
                  
                  <Form.Item
                    name="keepBackups"
                    label="Keep Backups (days)"
                  >
                    <InputNumber min={1} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="backupLocation"
                    label="Backup Location"
                  >
                    <Select>
                      <Option value="local">Local Storage</Option>
                      <Option value="cloud">Cloud Storage</Option>
                      <Option value="both">Both (Local & Cloud)</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="cloudProvider"
                    label="Cloud Provider"
                  >
                    <Select>
                      <Option value="s3">Amazon S3</Option>
                      <Option value="gcs">Google Cloud Storage</Option>
                      <Option value="azure">Azure Blob Storage</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="compressionLevel"
                    label="Compression Level"
                  >
                    <Select>
                      <Option value="none">None</Option>
                      <Option value="low">Low</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="high">High</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Title level={5}><CloudUploadOutlined /> Manual Backup</Title>
                  <Text type="secondary">Create an immediate backup of the entire system</Text>
                  <div style={{ marginTop: 16 }}>
                    <Button 
                      type="primary" 
                      icon={<CloudUploadOutlined />} 
                      loading={backupLoading}
                      onClick={handleBackup}
                    >
                      Create Backup Now
                    </Button>
                  </div>
                </Col>
                
                <Col span={12}>
                  <Title level={5}><UploadOutlined /> Restore System</Title>
                  <Text type="secondary">Restore from a previous backup file</Text>
                  <div style={{ marginTop: 16 }}>
                    <Upload>
                      <Button icon={<UploadOutlined />}>Select Backup File</Button>
                    </Upload>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab={<span><MailOutlined /> Email Settings</span>} key="email">
          <Card>
            <Form
              form={emailForm}
              layout="vertical"
              initialValues={{
                emailProvider: 'smtp',
                smtpHost: 'smtp.gmail.com',
                smtpPort: 587,
                smtpSecure: true,
                fromName: 'Trường Phát Computer',
                fromEmail: 'noreply@truongphat.com'
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="emailProvider"
                    label="Email Provider"
                  >
                    <Select>
                      <Option value="smtp">SMTP</Option>
                      <Option value="mailgun">Mailgun</Option>
                      <Option value="sendgrid">SendGrid</Option>
                      <Option value="ses">Amazon SES</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="smtpHost"
                    label="SMTP Host"
                  >
                    <Input />
                  </Form.Item>
                  
                  <Form.Item
                    name="smtpPort"
                    label="SMTP Port"
                  >
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                  
                  <Form.Item
                    name="smtpSecure"
                    label="Use Secure Connection (TLS/SSL)"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="smtpUsername"
                    label="SMTP Username"
                  >
                    <Input />
                  </Form.Item>
                  
                  <Form.Item
                    name="smtpPassword"
                    label="SMTP Password"
                  >
                    <Input.Password />
                  </Form.Item>
                  
                  <Form.Item
                    name="fromName"
                    label="From Name"
                  >
                    <Input />
                  </Form.Item>
                  
                  <Form.Item
                    name="fromEmail"
                    label="From Email"
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider />
              
              <Row>
                <Col span={24}>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Save Email Settings
                    </Button>
                    <Button 
                      onClick={handleTestEmail}
                      loading={emailTestLoading}
                    >
                      Send Test Email
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab={<span><ApiOutlined /> Integrations</span>} key="integrations">
          <Card>
            <Form
              form={integrationsForm}
              layout="vertical"
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Badge.Ribbon text="Active" color="green">
                    <Card title="Payment Gateway Integration" bordered={false}>
                      <Form.Item
                        name="paymentGateway"
                        label="Default Payment Gateway"
                      >
                        <Select>
                          <Option value="vnpay">VNPay</Option>
                          <Option value="momo">MoMo</Option>
                          <Option value="zalopay">ZaloPay</Option>
                          <Option value="stripe">Stripe</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name="gatewayApiKey"
                        label="API Key"
                      >
                        <Input.Password />
                      </Form.Item>
                      
                      <Form.Item
                        name="gatewayEnabled"
                        label="Enable Online Payments"
                        valuePropName="checked"
                      >
                        <Switch defaultChecked />
                      </Form.Item>
                    </Card>
                  </Badge.Ribbon>
                </Col>
                
                <Col span={12}>
                  <Card title="SMS Provider Integration" bordered={false}>
                    <Form.Item
                      name="smsProvider"
                      label="SMS Provider"
                    >
                      <Select>
                        <Option value="twilio">Twilio</Option>
                        <Option value="vietguys">Vietguys</Option>
                        <Option value="esms">ESMS</Option>
                        <Option value="none">None</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      name="smsApiKey"
                      label="API Key"
                    >
                      <Input.Password />
                    </Form.Item>
                    
                    <Form.Item
                      name="smsEnabled"
                      label="Enable SMS Notifications"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={24} style={{ marginTop: 24 }}>
                <Col span={12}>
                  <Card title="Accounting Software Integration" bordered={false}>
                    <Form.Item
                      name="accountingSystem"
                      label="Accounting System"
                    >
                      <Select>
                        <Option value="misa">MISA</Option>
                        <Option value="fast">FAST Accounting</Option>
                        <Option value="3b">3B Accounting</Option>
                        <Option value="quickbooks">QuickBooks</Option>
                        <Option value="none">None</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      name="autoSync"
                      label="Auto-Synchronize Daily"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card title="E-commerce Integration" bordered={false}>
                    <Form.Item
                      name="ecommerceIntegration"
                      label="E-commerce Platform"
                    >
                      <Select mode="multiple" placeholder="Select platforms">
                        <Option value="shopee">Shopee</Option>
                        <Option value="lazada">Lazada</Option>
                        <Option value="tiki">Tiki</Option>
                        <Option value="sendo">Sendo</Option>
                        <Option value="woocommerce">WooCommerce</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item>
                      <Button>Configure E-commerce Connections</Button>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
              
              <Row style={{ marginTop: 24 }}>
                <Col span={24}>
                  <Button type="primary" htmlType="submit">
                    Save Integration Settings
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab={<span><BellOutlined /> Notifications</span>} key="notifications">
          <Card>
            <Form
              form={notificationForm}
              layout="vertical"
            >
              <Divider orientation="left">System Notifications</Divider>
              
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="lowStockNotification"
                    label="Low Stock Alert"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="lowStockThreshold"
                    label="Low Stock Threshold"
                    initialValue={5}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="lowStockChannels"
                    label="Notification Channels"
                    initialValue={['email', 'system']}
                  >
                    <Select mode="multiple">
                      <Option value="email">Email</Option>
                      <Option value="sms">SMS</Option>
                      <Option value="system">System</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="orderNotification"
                    label="New Order Notification"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="orderAmount"
                    label="Minimum Order Amount"
                    initialValue={0}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="orderChannels"
                    label="Notification Channels"
                    initialValue={['email', 'system']}
                  >
                    <Select mode="multiple">
                      <Option value="email">Email</Option>
                      <Option value="sms">SMS</Option>
                      <Option value="system">System</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="reportNotification"
                    label="Daily Reports"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="reportTime"
                    label="Report Time"
                    initialValue={dayjs('22:00:00', 'HH:mm:ss')}
                  >
                    <TimePicker format="HH:mm:ss" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="reportChannels"
                    label="Notification Channels"
                    initialValue={['email']}
                  >
                    <Select mode="multiple">
                      <Option value="email">Email</Option>
                      <Option value="system">System</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider orientation="left">Customer Notifications</Divider>
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="welcomeEmail"
                    label="Welcome Email"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    name="orderConfirmation"
                    label="Order Confirmation"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    name="shippingUpdates"
                    label="Shipping Updates"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="loyaltyUpdates"
                    label="Loyalty Program Updates"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    name="promotionalEmails"
                    label="Promotional Emails"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    name="reviewRequests"
                    label="Review Requests"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row style={{ marginTop: 24 }}>
                <Col span={24}>
                  <Button type="primary" htmlType="submit">
                    Save Notification Settings
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemSettings; 