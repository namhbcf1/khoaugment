import React, { useState, useEffect } from 'react';
import {
  Table, Button, Input, Space, Modal, Form, Select,
  Card, Row, Col, Statistic, Tag, Avatar, Tabs,
  DatePicker, message, Popconfirm, Tooltip, Progress,
  List, Typography, Divider, Badge, Timeline, Drawer
} from 'antd';
import {
  UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, ExportOutlined, ImportOutlined, StarOutlined,
  ShoppingCartOutlined, DollarOutlined, CalendarOutlined,
  PhoneOutlined, MailOutlined, HomeOutlined, CrownOutlined,
  GiftOutlined, TrophyOutlined, HeartOutlined, TeamOutlined,
  EyeOutlined, HistoryOutlined
} from '@ant-design/icons';
import { Pie, Column } from '@ant-design/plots';
import { api } from '../services/api';
import dayjs from 'dayjs';
import { MetricCard, PageHeader, ResponsiveTable, LoadingSkeleton } from '../components/ui/DesignSystem';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { TextArea } = Input;

const Customers = () => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerStats, setCustomerStats] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [form] = Form.useForm();

  useEffect(() => {
    loadCustomers();
    loadCustomerStats();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchText, segmentFilter]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers', {
        params: { limit: 1000 }
      });

      if (response.data.success) {
        setCustomers(response.data.data.customers || []);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      // Mock data
      setCustomers([
        {
          id: 1,
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          phone: '0901234567',
          address: '123 Nguyễn Huệ, Q1, TP.HCM',
          segment: 'VIP',
          loyalty_points: 1250,
          total_spent: 5500000,
          total_orders: 45,
          last_order_date: '2024-03-15',
          created_at: '2024-01-15',
          is_active: true
        },
        {
          id: 2,
          name: 'Trần Thị B',
          email: 'tranthib@email.com',
          phone: '0907654321',
          address: '456 Lê Lợi, Q3, TP.HCM',
          segment: 'Premium',
          loyalty_points: 890,
          total_spent: 3200000,
          total_orders: 28,
          last_order_date: '2024-03-14',
          created_at: '2024-02-01',
          is_active: true
        },
        {
          id: 3,
          name: 'Lê Văn C',
          email: 'levanc@email.com',
          phone: '0912345678',
          address: '789 Võ Văn Tần, Q3, TP.HCM',
          segment: 'Regular',
          loyalty_points: 320,
          total_spent: 1200000,
          total_orders: 12,
          last_order_date: '2024-03-10',
          created_at: '2024-02-15',
          is_active: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerStats = async () => {
    try {
      const response = await api.get('/analytics/customers');

      if (response.data.success) {
        setCustomerStats(response.data.data);
      }
    } catch (error) {
      // Mock data
      setCustomerStats({
        totalCustomers: 892,
        newCustomers: 45,
        vipCustomers: 89,
        premiumCustomers: 156,
        regularCustomers: 647,
        avgLifetimeValue: 2850000,
        avgOrderValue: 125000,
        retentionRate: 78.5,
        segmentDistribution: [
          { type: 'VIP', value: 10, color: '#ff4d4f' },
          { type: 'Premium', value: 17.5, color: '#faad14' },
          { type: 'Regular', value: 72.5, color: '#52c41a' }
        ]
      });
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchText) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.phone.includes(searchText)
      );
    }

    if (segmentFilter !== 'all') {
      filtered = filtered.filter(customer => customer.segment === segmentFilter);
    }

    setFilteredCustomers(filtered);
  };

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    form.resetFields();
    setShowModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      ...customer,
      date_of_birth: customer.date_of_birth ? dayjs(customer.date_of_birth) : null
    });
    setShowModal(true);
  };

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setShowDetailDrawer(true);

    // Load customer details including order history
    try {
      const response = await api.get(`/customers/${customer.id}`);
      if (response.data.success) {
        setSelectedCustomer(response.data.data);
      }
    } catch (error) {
      console.error('Error loading customer details:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const customerData = {
        ...values,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null
      };

      if (editingCustomer) {
        const response = await api.put(`/customers/${editingCustomer.id}`, customerData);
        if (response.data.success) {
          message.success('Cập nhật khách hàng thành công');
          loadCustomers();
        }
      } else {
        const response = await api.post('/customers', customerData);
        if (response.data.success) {
          message.success('Tạo khách hàng thành công');
          loadCustomers();
        }
      }

      setShowModal(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving customer:', error);
      message.error('Có lỗi xảy ra khi lưu khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/customers/${customerId}`);

      if (response.data.success) {
        message.success('Xóa khách hàng thành công');
        loadCustomers();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      message.error('Có lỗi xảy ra khi xóa khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateLoyaltyPoints = async (customerId, points, action) => {
    try {
      const response = await api.put(`/customers/${customerId}/loyalty`, {
        points,
        action
      });

      if (response.data.success) {
        message.success('Cập nhật điểm thưởng thành công');
        loadCustomers();
        if (selectedCustomer && selectedCustomer.id === customerId) {
          setSelectedCustomer(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error updating loyalty points:', error);
      message.error('Có lỗi xảy ra khi cập nhật điểm thưởng');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getSegmentColor = (segment) => {
    switch (segment) {
      case 'VIP': return 'red';
      case 'Premium': return 'gold';
      case 'Regular': return 'green';
      default: return 'default';
    }
  };

  const getSegmentIcon = (segment) => {
    switch (segment) {
      case 'VIP': return <CrownOutlined />;
      case 'Premium': return <TrophyOutlined />;
      case 'Regular': return <UserOutlined />;
      default: return <UserOutlined />;
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ID: {record.id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>
            <PhoneOutlined /> {record.phone}
          </div>
          <div>
            <MailOutlined /> {record.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Phân khúc',
      dataIndex: 'segment',
      key: 'segment',
      render: (segment) => (
        <Tag color={getSegmentColor(segment)} icon={getSegmentIcon(segment)}>
          {segment}
        </Tag>
      ),
    },
    {
      title: 'Điểm thưởng',
      dataIndex: 'loyalty_points',
      key: 'loyalty_points',
      render: (points) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          {points?.toLocaleString() || 0}
        </Space>
      ),
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (amount) => formatCurrency(amount || 0),
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'total_orders',
      key: 'total_orders',
      render: (count) => (
        <Space>
          <ShoppingCartOutlined />
          {count || 0}
        </Space>
      ),
    },
    {
      title: 'Lần mua cuối',
      dataIndex: 'last_order_date',
      key: 'last_order_date',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'Chưa có',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewCustomer(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditCustomer(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa khách hàng này?"
            onConfirm={() => handleDeleteCustomer(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const segmentChartConfig = {
    data: customerStats.segmentDistribution || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Quản lý khách hàng"
        subtitle="Quản lý thông tin và chương trình khách hàng thân thiết"
        icon="user"
        actions={[
          <Button key="import" icon={<ImportOutlined />}>
            Import
          </Button>,
          <Button key="export" icon={<ExportOutlined />}>
            Export
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleCreateCustomer}>
            Thêm khách hàng
          </Button>
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>

      {/* Customer Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={customerStats.totalCustomers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách hàng mới"
              value={customerStats.newCustomers}
              prefix={<UserOutlined />}
              suffix="tháng này"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Giá trị trung bình"
              value={customerStats.avgLifetimeValue}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tỷ lệ giữ chân"
              value={customerStats.retentionRate}
              suffix="%"
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="list">
        <TabPane tab="Danh sách khách hàng" key="list">
          {/* Filters */}
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} lg={8}>
                <Search
                  placeholder="Tìm kiếm khách hàng..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <Select
                  value={segmentFilter}
                  onChange={setSegmentFilter}
                  style={{ width: '100%' }}
                >
                  <Option value="all">Tất cả phân khúc</Option>
                  <Option value="VIP">VIP</Option>
                  <Option value="Premium">Premium</Option>
                  <Option value="Regular">Regular</Option>
                </Select>
              </Col>
              <Col xs={24} sm={24} lg={12}>
                <Space style={{ float: 'right' }}>
                  <Text type="secondary">
                    Hiển thị {filteredCustomers.length} / {customers.length} khách hàng
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Customer Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={filteredCustomers}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} khách hàng`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Phân tích khách hàng" key="analytics">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Phân khúc khách hàng">
                <Pie {...segmentChartConfig} height={300} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Top khách hàng VIP">
                <List
                  dataSource={customers.filter(c => c.segment === 'VIP').slice(0, 10)}
                  renderItem={(customer) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<CrownOutlined />} style={{ backgroundColor: '#ff4d4f' }} />}
                        title={customer.name}
                        description={
                          <Space direction="vertical" size="small">
                            <Text>Tổng chi tiêu: {formatCurrency(customer.total_spent)}</Text>
                            <Text>Điểm thưởng: {customer.loyalty_points?.toLocaleString()}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Customer Form Modal */}
      <Modal
        title={editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Tên khách hàng"
                rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
              >
                <Input placeholder="Nhập tên khách hàng" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="address" label="Địa chỉ">
                <TextArea placeholder="Nhập địa chỉ" rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date_of_birth" label="Ngày sinh">
                <DatePicker
                  placeholder="Chọn ngày sinh"
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính">
                <Select placeholder="Chọn giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="segment" label="Phân khúc khách hàng" initialValue="Regular">
                <Select>
                  <Option value="Regular">Khách hàng thường</Option>
                  <Option value="Premium">Khách hàng Premium</Option>
                  <Option value="VIP">Khách hàng VIP</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={12}>
              <Button size="large" block onClick={() => setShowModal(false)}>
                Hủy
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" size="large" block htmlType="submit" loading={loading}>
                {editingCustomer ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Customer Detail Drawer */}
      <Drawer
        title="Chi tiết khách hàng"
        placement="right"
        onClose={() => setShowDetailDrawer(false)}
        open={showDetailDrawer}
        width={600}
      >
        {selectedCustomer && (
          <div>
            {/* Customer Info */}
            <Card style={{ marginBottom: 16 }}>
              <Row align="middle" gutter={16}>
                <Col>
                  <Avatar size={64} icon={<UserOutlined />} />
                </Col>
                <Col flex={1}>
                  <Title level={4} style={{ margin: 0 }}>
                    {selectedCustomer.name}
                  </Title>
                  <Space>
                    <Tag color={getSegmentColor(selectedCustomer.segment)} icon={getSegmentIcon(selectedCustomer.segment)}>
                      {selectedCustomer.segment}
                    </Tag>
                    <Text type="secondary">ID: {selectedCustomer.id}</Text>
                  </Space>
                </Col>
              </Row>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Liên hệ</Text>
                    <div><PhoneOutlined /> {selectedCustomer.phone}</div>
                    <div><MailOutlined /> {selectedCustomer.email}</div>
                    <div><HomeOutlined /> {selectedCustomer.address}</div>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Thống kê</Text>
                    <div>Tổng chi tiêu: <Text strong>{formatCurrency(selectedCustomer.total_spent || 0)}</Text></div>
                    <div>Tổng đơn hàng: <Text strong>{selectedCustomer.total_orders || 0}</Text></div>
                    <div>Điểm thưởng: <Text strong style={{ color: '#faad14' }}>{selectedCustomer.loyalty_points?.toLocaleString() || 0}</Text></div>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Loyalty Points Management */}
            <Card title="Quản lý điểm thưởng" style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<GiftOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Thêm điểm thưởng',
                      content: (
                        <div>
                          <p>Thêm 100 điểm thưởng cho khách hàng?</p>
                        </div>
                      ),
                      onOk: () => updateLoyaltyPoints(selectedCustomer.id, 100, 'add')
                    });
                  }}
                >
                  Thêm điểm
                </Button>
                <Button
                  icon={<StarOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Trừ điểm thưởng',
                      content: (
                        <div>
                          <p>Trừ 50 điểm thưởng từ khách hàng?</p>
                        </div>
                      ),
                      onOk: () => updateLoyaltyPoints(selectedCustomer.id, 50, 'subtract')
                    });
                  }}
                >
                  Trừ điểm
                </Button>
              </Space>
            </Card>

            {/* Recent Orders */}
            <Card title="Đơn hàng gần đây">
              <List
                dataSource={selectedCustomer.recent_orders || []}
                renderItem={(order) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`Đơn hàng #${order.order_number}`}
                      description={
                        <Space direction="vertical" size="small">
                          <Text>Tổng tiền: {formatCurrency(order.total)}</Text>
                          <Text type="secondary">
                            {dayjs(order.created_at).format('DD/MM/YYYY HH:mm')}
                          </Text>
                        </Space>
                      }
                    />
                    <Tag color={order.status === 'completed' ? 'green' : 'orange'}>
                      {order.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                    </Tag>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Drawer>
      </div>
    </div>
  );
};

export default Customers;