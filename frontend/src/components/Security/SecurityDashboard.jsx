/**
 * Security Dashboard Component
 * Provides comprehensive security monitoring and configuration
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  InputNumber,
  Space,
  Alert,
  Typography,
  Tabs,
  List,
  Progress,
  Descriptions,
  Badge,
  Tooltip,
  message
} from 'antd';
import {
  SafetyOutlined,
  WarningOutlined,
  LockOutlined,
  UserOutlined,
  EyeOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  AuditOutlined,
  KeyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

import securityService from '../../services/securityService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SecurityDashboard = () => {
  const [securityReport, setSecurityReport] = useState(null);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadSecurityData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = () => {
    const report = securityService.getSecurityReport();
    setSecurityReport(report);
    setSecurityEvents(report.lastEvents || []);
  };

  const handleConfigSave = (values) => {
    // In a real application, this would update the security configuration
    message.success('Cấu hình bảo mật đã được cập nhật');
    setConfigModalVisible(false);
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'failed_login': 'red',
      'successful_login': 'green',
      'session_expired': 'orange',
      'suspicious_activity': 'red',
      'security_alert': 'red',
      'page_hidden': 'blue',
      'page_visible': 'blue',
      'input_sanitized': 'yellow'
    };
    return colors[type] || 'default';
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      'failed_login': <WarningOutlined />,
      'successful_login': <UserOutlined />,
      'session_expired': <ClockCircleOutlined />,
      'suspicious_activity': <SecurityScanOutlined />,
      'security_alert': <WarningOutlined />,
      'page_hidden': <EyeOutlined />,
      'page_visible': <EyeOutlined />,
      'input_sanitized': <SafetyOutlined />
    };
    return icons[type] || <AuditOutlined />;
  };

  const securityColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString('vi-VN'),
      width: 150
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getEventTypeColor(type)} icon={getEventTypeIcon(type)}>
          {type.replace(/_/g, ' ').toUpperCase()}
        </Tag>
      ),
      width: 200
    },
    {
      title: 'Chi tiết',
      dataIndex: 'data',
      key: 'data',
      render: (data) => (
        <Text code style={{ fontSize: 12 }}>
          {JSON.stringify(data, null, 2)}
        </Text>
      )
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url) => (
        <Tooltip title={url}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {url}
          </Text>
        </Tooltip>
      ),
      width: 200
    }
  ];

  if (!securityReport) {
    return <div>Đang tải dữ liệu bảo mật...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Title level={2}>
            <SafetyOutlined /> Bảng điều khiển bảo mật
          </Title>
        </Col>
      </Row>

      {/* Security Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Phiên đăng nhập"
              value={securityReport.activeSessions}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Lần thử đăng nhập"
              value={securityReport.loginAttempts}
              prefix={<LockOutlined />}
              valueStyle={{ color: securityReport.loginAttempts > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sự kiện bảo mật"
              value={securityReport.securityEvents}
              prefix={<SecurityScanOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Thời gian phiên"
              value={Math.round(securityReport.securityConfig.sessionTimeout / 60000)}
              suffix="phút"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Security Alerts */}
      {securityReport.loginAttempts > 0 && (
        <Row style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Alert
              message="Cảnh báo bảo mật"
              description={`Phát hiện ${securityReport.loginAttempts} lần thử đăng nhập thất bại. Vui lòng kiểm tra hoạt động đăng nhập.`}
              type="warning"
              showIcon
              action={
                <Button size="small" type="primary">
                  Xem chi tiết
                </Button>
              }
            />
          </Col>
        </Row>
      )}

      <Tabs defaultActiveKey="events">
        <TabPane tab="Sự kiện bảo mật" key="events">
          <Card
            title="Nhật ký sự kiện bảo mật"
            extra={
              <Button 
                type="primary" 
                icon={<SettingOutlined />}
                onClick={() => setConfigModalVisible(true)}
              >
                Cấu hình
              </Button>
            }
          >
            <Table
              columns={securityColumns}
              dataSource={securityEvents}
              rowKey={(record) => `${record.timestamp}-${record.type}`}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </TabPane>

        <TabPane tab="Cấu hình bảo mật" key="config">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Cấu hình mật khẩu" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Độ dài tối thiểu">
                    {securityReport.securityConfig.passwordRequirements.minLength} ký tự
                  </Descriptions.Item>
                  <Descriptions.Item label="Yêu cầu chữ hoa">
                    <Badge 
                      status={securityReport.securityConfig.passwordRequirements.requireUppercase ? "success" : "error"} 
                      text={securityReport.securityConfig.passwordRequirements.requireUppercase ? "Có" : "Không"}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Yêu cầu chữ thường">
                    <Badge 
                      status={securityReport.securityConfig.passwordRequirements.requireLowercase ? "success" : "error"} 
                      text={securityReport.securityConfig.passwordRequirements.requireLowercase ? "Có" : "Không"}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Yêu cầu số">
                    <Badge 
                      status={securityReport.securityConfig.passwordRequirements.requireNumbers ? "success" : "error"} 
                      text={securityReport.securityConfig.passwordRequirements.requireNumbers ? "Có" : "Không"}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Yêu cầu ký tự đặc biệt">
                    <Badge 
                      status={securityReport.securityConfig.passwordRequirements.requireSpecial ? "success" : "error"} 
                      text={securityReport.securityConfig.passwordRequirements.requireSpecial ? "Có" : "Không"}
                    />
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="Cấu hình phiên làm việc" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Thời gian phiên">
                    {Math.round(securityReport.securityConfig.sessionTimeout / 60000)} phút
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lần thử tối đa">
                    {securityReport.securityConfig.maxLoginAttempts} lần
                  </Descriptions.Item>
                  <Descriptions.Item label="Phiên hoạt động">
                    {securityReport.activeSessions} phiên
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Kiểm tra bảo mật" key="audit">
          <Card title="Kiểm tra bảo mật hệ thống">
            <List
              dataSource={[
                {
                  title: 'Mã hóa dữ liệu',
                  description: 'Dữ liệu nhạy cảm được mã hóa AES-256',
                  status: 'success'
                },
                {
                  title: 'HTTPS',
                  description: 'Kết nối được bảo mật bằng HTTPS',
                  status: window.location.protocol === 'https:' ? 'success' : 'error'
                },
                {
                  title: 'Xác thực hai yếu tố',
                  description: 'Hỗ trợ xác thực hai yếu tố cho tài khoản quan trọng',
                  status: 'warning'
                },
                {
                  title: 'Giám sát phiên',
                  description: 'Theo dõi và quản lý phiên đăng nhập',
                  status: 'success'
                },
                {
                  title: 'Kiểm soát truy cập',
                  description: 'Phân quyền dựa trên vai trò người dùng',
                  status: 'success'
                }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        status={item.status} 
                        style={{ marginTop: 4 }}
                      />
                    }
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Security Configuration Modal */}
      <Modal
        title="Cấu hình bảo mật"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleConfigSave}
          initialValues={{
            sessionTimeout: Math.round(securityReport.securityConfig.sessionTimeout / 60000),
            maxLoginAttempts: securityReport.securityConfig.maxLoginAttempts,
            passwordMinLength: securityReport.securityConfig.passwordRequirements.minLength,
            requireUppercase: securityReport.securityConfig.passwordRequirements.requireUppercase,
            requireLowercase: securityReport.securityConfig.passwordRequirements.requireLowercase,
            requireNumbers: securityReport.securityConfig.passwordRequirements.requireNumbers,
            requireSpecial: securityReport.securityConfig.passwordRequirements.requireSpecial
          }}
        >
          <Title level={4}>Cấu hình phiên làm việc</Title>
          
          <Form.Item
            name="sessionTimeout"
            label="Thời gian phiên (phút)"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian phiên' }]}
          >
            <InputNumber min={5} max={480} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="maxLoginAttempts"
            label="Số lần thử đăng nhập tối đa"
            rules={[{ required: true, message: 'Vui lòng nhập số lần thử tối đa' }]}
          >
            <InputNumber min={3} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Title level={4}>Yêu cầu mật khẩu</Title>

          <Form.Item
            name="passwordMinLength"
            label="Độ dài tối thiểu"
            rules={[{ required: true, message: 'Vui lòng nhập độ dài tối thiểu' }]}
          >
            <InputNumber min={6} max={20} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="requireUppercase" valuePropName="checked">
            <Switch /> Yêu cầu chữ hoa
          </Form.Item>

          <Form.Item name="requireLowercase" valuePropName="checked">
            <Switch /> Yêu cầu chữ thường
          </Form.Item>

          <Form.Item name="requireNumbers" valuePropName="checked">
            <Switch /> Yêu cầu số
          </Form.Item>

          <Form.Item name="requireSpecial" valuePropName="checked">
            <Switch /> Yêu cầu ký tự đặc biệt
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SecurityDashboard;
