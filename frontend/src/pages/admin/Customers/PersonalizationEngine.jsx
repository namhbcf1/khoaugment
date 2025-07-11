import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Switch,
  Select,
  Input,
  Form,
  Row,
  Col,
  Divider,
  Tooltip,
  Modal,
  Alert,
  Badge,
  Popconfirm,
  Progress,
  List,
  Avatar,
  Radio
} from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  RobotOutlined,
  BulbOutlined,
  TagOutlined,
  ShoppingOutlined,
  MailOutlined,
  GiftOutlined,
  BellOutlined,
  AimOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Mock data for personalization rules
const mockRules = [
  {
    id: 1,
    name: 'Chào mừng khách hàng mới',
    description: 'Hiển thị thông báo chào mừng cho khách hàng lần đầu mua hàng',
    trigger: 'first_purchase',
    action: 'show_notification',
    content: 'Chào mừng quý khách đến với Trường Phát Computer! Sử dụng mã WELCOME10 để được giảm 10% cho đơn hàng đầu tiên.',
    status: 'active',
    segment: 'new_customers',
    priority: 1,
    createdAt: '2023-06-15',
    lastRun: '2023-07-20',
    performance: {
      impressions: 124,
      engagements: 98,
      conversions: 45,
      conversionRate: 36.3
    }
  },
  {
    id: 2,
    name: 'Đề xuất phụ kiện laptop',
    description: 'Hiển thị phụ kiện liên quan khi khách hàng mua laptop',
    trigger: 'product_category_view',
    action: 'show_recommendations',
    content: 'Laptop',
    status: 'active',
    segment: 'all',
    priority: 2,
    createdAt: '2023-06-18',
    lastRun: '2023-07-20',
    performance: {
      impressions: 256,
      engagements: 120,
      conversions: 68,
      conversionRate: 26.6
    }
  },
  {
    id: 3,
    name: 'Nhắc nhở giỏ hàng bị bỏ quên',
    description: 'Gửi email nhắc nhở khi khách hàng bỏ quên giỏ hàng sau 24h',
    trigger: 'cart_abandonment',
    action: 'send_email',
    content: 'Quý khách có sản phẩm trong giỏ hàng đang chờ thanh toán. Hoàn tất đơn hàng ngay để không bỏ lỡ sản phẩm yêu thích!',
    status: 'active',
    segment: 'all',
    priority: 3,
    createdAt: '2023-06-20',
    lastRun: '2023-07-19',
    performance: {
      impressions: 87,
      engagements: 32,
      conversions: 18,
      conversionRate: 20.7
    }
  },
  {
    id: 4,
    name: 'Khuyến mãi sinh nhật',
    description: 'Gửi mã giảm giá vào ngày sinh nhật của khách hàng',
    trigger: 'birthday',
    action: 'send_coupon',
    content: 'BIRTHDAY20',
    status: 'active',
    segment: 'registered_customers',
    priority: 1,
    createdAt: '2023-06-25',
    lastRun: '2023-07-20',
    performance: {
      impressions: 45,
      engagements: 38,
      conversions: 30,
      conversionRate: 66.7
    }
  },
  {
    id: 5,
    name: 'Đề xuất nâng cấp PC',
    description: 'Hiển thị đề xuất nâng cấp cho khách hàng đã mua PC trước đây',
    trigger: 'previous_purchase',
    action: 'show_recommendations',
    content: 'PC',
    status: 'inactive',
    segment: 'returning_customers',
    priority: 4,
    createdAt: '2023-07-05',
    lastRun: null,
    performance: {
      impressions: 0,
      engagements: 0,
      conversions: 0,
      conversionRate: 0
    }
  }
];

// Mock data for segments
const mockSegments = [
  {
    id: 'all',
    name: 'Tất cả khách hàng',
    description: 'Tất cả khách hàng trong hệ thống',
    count: 2450,
    createdAt: '2023-06-10'
  },
  {
    id: 'new_customers',
    name: 'Khách hàng mới',
    description: 'Khách hàng lần đầu mua hàng trong 30 ngày qua',
    count: 187,
    createdAt: '2023-06-10'
  },
  {
    id: 'returning_customers',
    name: 'Khách hàng quay lại',
    description: 'Khách hàng đã mua hàng ít nhất 2 lần',
    count: 780,
    createdAt: '2023-06-10'
  },
  {
    id: 'registered_customers',
    name: 'Khách hàng đã đăng ký',
    description: 'Khách hàng đã tạo tài khoản',
    count: 1842,
    createdAt: '2023-06-10'
  },
  {
    id: 'vip_customers',
    name: 'Khách hàng VIP',
    description: 'Khách hàng chi tiêu trên 20 triệu VNĐ',
    count: 245,
    createdAt: '2023-06-15'
  }
];

// Mock data for triggers
const triggerOptions = [
  { value: 'first_purchase', label: 'Lần đầu mua hàng', icon: <ShoppingOutlined /> },
  { value: 'product_category_view', label: 'Xem danh mục sản phẩm', icon: <TagOutlined /> },
  { value: 'cart_abandonment', label: 'Bỏ quên giỏ hàng', icon: <ShoppingOutlined /> },
  { value: 'birthday', label: 'Sinh nhật khách hàng', icon: <GiftOutlined /> },
  { value: 'previous_purchase', label: 'Mua hàng trước đây', icon: <ShoppingOutlined /> },
  { value: 'login', label: 'Đăng nhập', icon: <UserOutlined /> },
  { value: 'inactivity', label: 'Không hoạt động', icon: <CloseCircleOutlined /> }
];

// Mock data for actions
const actionOptions = [
  { value: 'show_notification', label: 'Hiển thị thông báo', icon: <BellOutlined /> },
  { value: 'show_recommendations', label: 'Hiển thị đề xuất', icon: <BulbOutlined /> },
  { value: 'send_email', label: 'Gửi email', icon: <MailOutlined /> },
  { value: 'send_coupon', label: 'Gửi mã giảm giá', icon: <GiftOutlined /> },
  { value: 'show_popup', label: 'Hiển thị popup', icon: <FileTextOutlined /> }
];

const PersonalizationEngine = () => {
  const [rules, setRules] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [segmentFilter, setSegmentFilter] = useState(null);

  // Load data on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRules(mockRules);
      setSegments(mockSegments);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle rule edit
  const handleEditRule = (rule) => {
    setCurrentRule(rule);
    form.setFieldsValue({
      name: rule.name,
      description: rule.description,
      trigger: rule.trigger,
      action: rule.action,
      content: rule.content,
      status: rule.status,
      segment: rule.segment,
      priority: rule.priority
    });
    setIsModalVisible(true);
  };

  // Handle rule add
  const handleAddRule = () => {
    setCurrentRule(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'active',
      priority: 5,
      segment: 'all'
    });
    setIsModalVisible(true);
  };

  // Handle modal submit
  const handleModalOk = () => {
    form.validateFields()
      .then((values) => {
        if (currentRule) {
          // Update existing rule
          const updatedRules = rules.map(rule => 
            rule.id === currentRule.id ? { 
              ...rule, 
              ...values,
              lastRun: rule.lastRun // Preserve last run date
            } : rule
          );
          setRules(updatedRules);
        } else {
          // Add new rule
          const newRule = {
            id: rules.length + 1,
            ...values,
            createdAt: new Date().toISOString().split('T')[0],
            lastRun: null,
            performance: {
              impressions: 0,
              engagements: 0,
              conversions: 0,
              conversionRate: 0
            }
          };
          setRules([...rules, newRule]);
        }
        setIsModalVisible(false);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  // Handle rule delete
  const handleDeleteRule = (id) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  // Handle rule status toggle
  const handleToggleStatus = (rule) => {
    const newStatus = rule.status === 'active' ? 'inactive' : 'active';
    const updatedRules = rules.map(r => 
      r.id === rule.id ? { ...r, status: newStatus } : r
    );
    setRules(updatedRules);
  };

  // Filter rules based on search and filters
  const filteredRules = rules.filter(rule => {
    const matchesSearch = !searchText || 
      rule.name.toLowerCase().includes(searchText.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || rule.status === statusFilter;
    const matchesSegment = !segmentFilter || rule.segment === segmentFilter;
    return matchesSearch && matchesStatus && matchesSegment;
  });

  // Get label for trigger
  const getTriggerLabel = (triggerValue) => {
    const trigger = triggerOptions.find(t => t.value === triggerValue);
    return trigger ? trigger.label : triggerValue;
  };

  // Get label for action
  const getActionLabel = (actionValue) => {
    const action = actionOptions.find(a => a.value === actionValue);
    return action ? action.label : actionValue;
  };

  // Get segment name
  const getSegmentName = (segmentId) => {
    const segment = segments.find(s => s.id === segmentId);
    return segment ? segment.name : segmentId;
  };

  // Render status tag
  const renderStatus = (status) => {
    switch (status) {
      case 'active':
        return <Badge status="success" text="Đang hoạt động" />;
      case 'inactive':
        return <Badge status="default" text="Không hoạt động" />;
      default:
        return <Badge status="processing" text={status} />;
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Quy tắc',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Text type="secondary">{record.description}</Text>
        </div>
      ),
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'trigger',
      key: 'trigger',
      render: (trigger) => getTriggerLabel(trigger),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (action) => getActionLabel(action),
    },
    {
      title: 'Phân khúc',
      dataIndex: 'segment',
      key: 'segment',
      render: (segment) => <Tag color="blue">{getSegmentName(segment)}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status),
    },
    {
      title: 'Hiệu suất',
      key: 'performance',
      render: (_, record) => (
        <Tooltip title={`Tỷ lệ chuyển đổi: ${record.performance.conversionRate}%`}>
          <Progress 
            percent={record.performance.conversionRate} 
            size="small" 
            status={record.performance.conversionRate > 0 ? "active" : "exception"}
            style={{ width: 100 }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Thao tác',
      key: 'operations',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditRule(record)}
          >
            Sửa
          </Button>
          <Switch
            size="small"
            checked={record.status === 'active'}
            onChange={() => handleToggleStatus(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa quy tắc này?"
            onConfirm={() => handleDeleteRule(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Segment columns
  const segmentColumns = [
    {
      title: 'Tên phân khúc',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Số khách hàng',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Thao tác',
      key: 'operations',
      render: () => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />}>Sửa</Button>
          <Button size="small" icon={<AimOutlined />}>Xem khách hàng</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="personalization-engine">
      <Card>
        <Title level={2}>Công cụ cá nhân hóa</Title>
        <Paragraph type="secondary">
          Tạo và quản lý các quy tắc cá nhân hóa để cung cấp trải nghiệm tùy chỉnh cho khách hàng
        </Paragraph>

        <Tabs defaultActiveKey="rules">
          <TabPane 
            tab={
              <span>
                <SettingOutlined /> Quy tắc cá nhân hóa
              </span>
            } 
            key="rules"
          >
            {/* Filters and Add Button */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col flex="auto">
                <Space>
                  <Input
                    placeholder="Tìm kiếm quy tắc"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 200 }}
                    allowClear
                  />
                  <Select
                    placeholder="Trạng thái"
                    style={{ width: 150 }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    allowClear
                  >
                    <Option value="active">Đang hoạt động</Option>
                    <Option value="inactive">Không hoạt động</Option>
                  </Select>
                  <Select
                    placeholder="Phân khúc"
                    style={{ width: 180 }}
                    value={segmentFilter}
                    onChange={setSegmentFilter}
                    allowClear
                  >
                    {segments.map(segment => (
                      <Option key={segment.id} value={segment.id}>{segment.name}</Option>
                    ))}
                  </Select>
                </Space>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddRule}
                >
                  Thêm quy tắc mới
                </Button>
              </Col>
            </Row>

            {/* Rules Table */}
            <Table
              columns={columns}
              dataSource={filteredRules}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <UserOutlined /> Phân khúc khách hàng
              </span>
            } 
            key="segments"
          >
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
              >
                Tạo phân khúc mới
              </Button>
            </div>
            <Table
              columns={segmentColumns}
              dataSource={segments}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <ExperimentOutlined /> A/B Testing
              </span>
            } 
            key="ab_testing"
          >
            <Alert
              message="Tính năng đang phát triển"
              description="Tính năng A/B Testing đang được phát triển và sẽ sớm ra mắt."
              type="info"
              showIcon
            />
          </TabPane>
        </Tabs>

        {/* Add/Edit Rule Modal */}
        <Modal
          title={currentRule ? 'Chỉnh sửa quy tắc' : 'Thêm quy tắc mới'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
          width={700}
          okText={currentRule ? 'Cập nhật' : 'Thêm'}
          cancelText="Hủy"
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Tên quy tắc"
                  rules={[{ required: true, message: 'Vui lòng nhập tên quy tắc' }]}
                >
                  <Input placeholder="Nhập tên quy tắc" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Mô tả"
                >
                  <Input.TextArea placeholder="Mô tả ngắn về quy tắc này" rows={2} />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Điều kiện</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="trigger"
                  label="Kích hoạt khi"
                  rules={[{ required: true, message: 'Vui lòng chọn điều kiện kích hoạt' }]}
                >
                  <Select placeholder="Chọn điều kiện kích hoạt">
                    {triggerOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        <Space>
                          {option.icon}
                          <span>{option.label}</span>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="segment"
                  label="Áp dụng cho phân khúc"
                  rules={[{ required: true, message: 'Vui lòng chọn phân khúc' }]}
                >
                  <Select placeholder="Chọn phân khúc khách hàng">
                    {segments.map(segment => (
                      <Option key={segment.id} value={segment.id}>{segment.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider>Hành động</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="action"
                  label="Thực hiện hành động"
                  rules={[{ required: true, message: 'Vui lòng chọn hành động' }]}
                >
                  <Select placeholder="Chọn hành động">
                    {actionOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        <Space>
                          {option.icon}
                          <span>{option.label}</span>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="content"
                  label="Nội dung"
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                >
                  <Input.TextArea placeholder="Nội dung của hành động" rows={2} />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Cài đặt</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                >
                  <Radio.Group>
                    <Radio value="active">Hoạt động</Radio>
                    <Radio value="inactive">Không hoạt động</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="Độ ưu tiên (1-10, 1 là cao nhất)"
                  rules={[{ required: true, message: 'Vui lòng nhập độ ưu tiên' }]}
                >
                  <Select placeholder="Chọn độ ưu tiên">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <Option key={num} value={num}>{num}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default PersonalizationEngine; 