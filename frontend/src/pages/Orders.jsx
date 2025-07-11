import React, { useState, useEffect } from 'react';
import {
  Table, Button, Input, Space, Modal, Card, Row, Col, Statistic,
  Tag, Typography, DatePicker, Select, Drawer, Descriptions,
  Timeline, List, Avatar, Divider, Badge, Tooltip, message
} from 'antd';
import {
  ShoppingCartOutlined, EyeOutlined, PrinterOutlined, SearchOutlined,
  CalendarOutlined, DollarOutlined, UserOutlined, PackageOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  ReloadOutlined, FilterOutlined, ExportOutlined
} from '@ant-design/icons';
import { api } from '../services/api';
import dayjs from 'dayjs';
import { MetricCard, PageHeader, ResponsiveTable, LoadingSkeleton } from '../components/ui/DesignSystem';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Orders = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    loadOrders();
    loadOrderStats();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchText, statusFilter, dateRange]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderStats = async () => {
    try {
      const response = await api.get('/orders/stats');
      if (response.data.success) {
        setOrderStats(response.data.data || {});
      }
    } catch (error) {
      console.error('Error loading order stats:', error);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        order.customer_phone?.includes(searchText)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by date range
    if (dateRange.length === 2) {
      filtered = filtered.filter(order => {
        const orderDate = dayjs(order.created_at);
        return orderDate.isAfter(dateRange[0]) && orderDate.isBefore(dateRange[1]);
      });
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'processing': 'blue',
      'completed': 'green',
      'cancelled': 'red',
      'refunded': 'purple'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'refunded': 'Đã hoàn tiền'
    };
    return texts[status] || status;
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowDetailDrawer(true);
  };

  const handlePrintOrder = (order) => {
    message.info(`In đơn hàng ${order.id}`);
    // TODO: Implement print functionality
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (id) => <Text strong>{id}</Text>
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div>{record.customer_name || 'Khách lẻ'}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.customer_phone}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 120,
      render: (amount) => (
        <Text strong style={{ color: '#1890ff' }}>
          {amount.toLocaleString()} ₫
        </Text>
      ),
      sorter: (a, b) => a.total_amount - b.total_amount
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Phương thức TT',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 120,
      render: (method) => {
        const methods = {
          'cash': 'Tiền mặt',
          'card': 'Thẻ',
          'transfer': 'Chuyển khoản',
          'vnpay': 'VNPay',
          'momo': 'MoMo'
        };
        return <Tag>{methods[method] || method}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewOrder(record)}
            />
          </Tooltip>
          <Tooltip title="In đơn hàng">
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => handlePrintOrder(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
      <PageHeader
        title="Quản lý đơn hàng"
        subtitle="Theo dõi và quản lý tất cả đơn hàng"
        icon={<ShoppingCartOutlined />}
      />

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <MetricCard
            title="Tổng đơn hàng"
            value={orderStats.total_orders || 0}
            icon={<ShoppingCartOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <MetricCard
            title="Doanh thu hôm nay"
            value={`${(orderStats.today_revenue || 0).toLocaleString()} ₫`}
            icon={<DollarOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <MetricCard
            title="Đơn chờ xử lý"
            value={orderStats.pending_orders || 0}
            icon={<ClockCircleOutlined />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <MetricCard
            title="Đơn hoàn thành"
            value={orderStats.completed_orders || 0}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
          />
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '20px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder="Tìm kiếm đơn hàng..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả</Option>
              <Option value="pending">Chờ xử lý</Option>
              <Option value="processing">Đang xử lý</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadOrders}
                loading={loading}
              >
                Tải lại
              </Button>
              <Button icon={<ExportOutlined />}>
                Xuất Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <ResponsiveTable
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn hàng`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Order Detail Drawer */}
      <Drawer
        title={`Chi tiết đơn hàng ${selectedOrder?.id}`}
        width={600}
        open={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mã đơn hàng">
                {selectedOrder.id}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.customer_name || 'Khách lẻ'}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.customer_phone || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(selectedOrder.created_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {selectedOrder.payment_method}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                  {selectedOrder.total_amount.toLocaleString()} ₫
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Sản phẩm</Divider>
            <List
              dataSource={selectedOrder.items || []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.product_name}
                    description={`Mã: ${item.product_sku}`}
                  />
                  <div>
                    <div>SL: {item.quantity}</div>
                    <div>Giá: {item.price.toLocaleString()} ₫</div>
                    <div><strong>Thành tiền: {(item.quantity * item.price).toLocaleString()} ₫</strong></div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Orders;