import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Row, Col, Input, Button, Tag, Space, 
  Badge, DatePicker, Select, Drawer, Tabs, Descriptions,
  Typography, Divider, Statistic, Timeline, message, Popconfirm, Alert
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, PrinterOutlined, 
  ExportOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
  DollarCircleOutlined, InboxOutlined, ShoppingOutlined, UserOutlined,
  SyncOutlined, ExclamationCircleOutlined, InfoCircleOutlined, PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

const OrderManagement = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
    paymentStatus: 'all'
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    canceled: 0,
    revenue: 0
  });

  const navigate = useNavigate();

  // Fetch orders data - mock data for now
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Mock API call
        setTimeout(() => {
          const mockOrders = generateMockOrders();
          setOrders(mockOrders);
          
          // Calculate statistics
          const stats = {
            total: mockOrders.length,
            pending: mockOrders.filter(o => o.status === 'pending').length,
            completed: mockOrders.filter(o => o.status === 'completed').length,
            canceled: mockOrders.filter(o => o.status === 'canceled').length,
            revenue: mockOrders.reduce((sum, order) => 
              order.status !== 'canceled' ? sum + order.totalAmount : sum, 0)
          };
          setOrderStats(stats);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        message.error("Failed to load orders. Please try again.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Generate mock orders data
  const generateMockOrders = () => {
    const statuses = ['pending', 'processing', 'shipped', 'completed', 'canceled'];
    const paymentStatuses = ['paid', 'pending', 'refunded', 'failed'];
    const paymentMethods = ['cash', 'credit_card', 'bank_transfer', 'ewallet'];
    
    return Array.from({ length: 50 }, (_, i) => {
      const date = dayjs().subtract(Math.floor(Math.random() * 30), 'days');
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const totalItems = Math.floor(Math.random() * 10) + 1;
      const itemPrice = Math.floor(Math.random() * 500000) + 10000;
      const totalAmount = totalItems * itemPrice;
      
      return {
        id: `ORD-${1000 + i}`,
        customer: {
          id: `CUST-${100 + Math.floor(Math.random() * 500)}`,
          name: `Khách hàng ${i + 1}`,
          phone: `0${Math.floor(Math.random() * 1000000000)}`,
          email: `customer${i + 1}@example.com`
        },
        date: date.format('YYYY-MM-DD HH:mm:ss'),
        status,
        totalItems,
        totalAmount,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paymentStatus,
        shipping: {
          method: 'standard',
          address: 'Hoà Bình, Việt Nam',
          cost: Math.floor(Math.random() * 50000) + 15000
        },
        items: Array.from({ length: totalItems }, (_, j) => ({
          id: `ITEM-${1000 + j}`,
          name: `Sản phẩm ${j + 1}`,
          sku: `SKU-${1000 + j}`,
          price: itemPrice,
          quantity: 1
        }))
      };
    });
  };

  // Filter orders based on search text and filters
  const filteredOrders = orders.filter(order => {
    // Search text filter
    const searchLower = searchText.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(searchLower) ||
      order.customer.name.toLowerCase().includes(searchLower) ||
      order.customer.phone.includes(searchText) ||
      order.customer.email.toLowerCase().includes(searchLower);
    
    // Status filter
    const matchesStatus = filters.status === 'all' || order.status === filters.status;
    
    // Payment status filter
    const matchesPaymentStatus = filters.paymentStatus === 'all' || 
      order.paymentStatus === filters.paymentStatus;
    
    // Date range filter
    let matchesDateRange = true;
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const orderDate = dayjs(order.date);
      const startDate = filters.dateRange[0].startOf('day');
      const endDate = filters.dateRange[1].endOf('day');
      matchesDateRange = orderDate.isBetween(startDate, endDate, undefined, '[]');
    }
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange;
  });

  // Handle viewing order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDrawerVisible(true);
  };

  // Handle order status update
  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    message.success(`Cập nhật trạng thái đơn hàng ${orderId} thành ${newStatus}`);
  };

  // Handle payment status update
  const handleUpdatePaymentStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, paymentStatus: newStatus } : order
    ));
    message.success(`Cập nhật trạng thái thanh toán đơn hàng ${orderId} thành ${newStatus}`);
  };

  // Handle order deletion
  const handleDeleteOrder = (orderId) => {
    setOrders(orders.filter(order => order.id !== orderId));
    message.success(`Đã xoá đơn hàng ${orderId}`);
  };

  // Render status tag
  const renderStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'gold', icon: <ClockCircleOutlined />, text: 'Đang xử lý' },
      processing: { color: 'blue', icon: <SyncOutlined spin />, text: 'Đang chuẩn bị' },
      shipped: { color: 'cyan', icon: <InboxOutlined />, text: 'Đang giao hàng' },
      completed: { color: 'green', icon: <CheckCircleOutlined />, text: 'Hoàn thành' },
      canceled: { color: 'red', icon: <CloseCircleOutlined />, text: 'Đã huỷ' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Render payment status tag
  const renderPaymentTag = (status) => {
    const paymentConfig = {
      paid: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã thanh toán' },
      pending: { color: 'gold', icon: <ClockCircleOutlined />, text: 'Chờ thanh toán' },
      refunded: { color: 'blue', icon: <DollarCircleOutlined />, text: 'Đã hoàn tiền' },
      failed: { color: 'red', icon: <CloseCircleOutlined />, text: 'Thanh toán thất bại' }
    };
    
    const config = paymentConfig[status] || paymentConfig.pending;
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Format payment method
  const formatPaymentMethod = (method) => {
    const methodMap = {
      cash: 'Tiền mặt',
      credit_card: 'Thẻ tín dụng',
      bank_transfer: 'Chuyển khoản',
      ewallet: 'Ví điện tử'
    };
    
    return methodMap[method] || method;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND'
    }).format(amount);
  };

  // Table columns
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => (
        <div>
          <div>{customer.name}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{customer.phone}</div>
        </div>
      ),
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatusTag(status),
      filters: [
        { text: 'Đang xử lý', value: 'pending' },
        { text: 'Đang chuẩn bị', value: 'processing' },
        { text: 'Đang giao hàng', value: 'shipped' },
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Đã huỷ', value: 'canceled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => renderPaymentTag(status),
      filters: [
        { text: 'Đã thanh toán', value: 'paid' },
        { text: 'Chờ thanh toán', value: 'pending' },
        { text: 'Đã hoàn tiền', value: 'refunded' },
        { text: 'Thất bại', value: 'failed' },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewOrder(record)}
          >
            Xem
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/orders/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá đơn hàng này?"
            onConfirm={() => handleDeleteOrder(record.id)}
            okText="Xoá"
            cancelText="Huỷ"
            placement="left"
          >
            <Button 
              type="primary" 
              danger
              size="small" 
              icon={<DeleteOutlined />}
            >
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      dateRange: null,
      paymentStatus: 'all'
    });
    setSearchText('');
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  // Order details tabs
  const orderDetailsTabs = [
    {
      key: 'details',
      tab: 'Chi tiết',
      content: (order) => (
        <>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Mã đơn hàng" span={2}>
              <Text strong>{order.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt hàng">
              {order.date}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái đơn hàng">
              {renderStatusTag(order.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái thanh toán">
              {renderPaymentTag(order.paymentStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {formatPaymentMethod(order.paymentMethod)}
            </Descriptions.Item>
          </Descriptions>
          
          <Divider orientation="left">Thông tin khách hàng</Divider>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Tên khách hàng">
              {order.customer.name}
            </Descriptions.Item>
            <Descriptions.Item label="Mã khách hàng">
              {order.customer.id}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {order.customer.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {order.customer.email}
            </Descriptions.Item>
          </Descriptions>
          
          <Divider orientation="left">Thông tin giao hàng</Divider>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Phương thức giao hàng">
              {order.shipping.method === 'standard' ? 'Giao hàng tiêu chuẩn' : order.shipping.method}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng">
              {order.shipping.address}
            </Descriptions.Item>
            <Descriptions.Item label="Phí giao hàng">
              {formatCurrency(order.shipping.cost)}
            </Descriptions.Item>
          </Descriptions>
        </>
      )
    },
    {
      key: 'items',
      tab: 'Sản phẩm',
      content: (order) => (
        <Table 
          dataSource={order.items} 
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'Sản phẩm',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: 'SKU',
              dataIndex: 'sku',
              key: 'sku',
            },
            {
              title: 'Giá',
              dataIndex: 'price',
              key: 'price',
              render: (price) => formatCurrency(price),
            },
            {
              title: 'Số lượng',
              dataIndex: 'quantity',
              key: 'quantity',
            },
            {
              title: 'Thành tiền',
              key: 'total',
              render: (_, record) => formatCurrency(record.price * record.quantity),
            },
          ]}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="right">
                <Text strong>Tổng tiền sản phẩm:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text strong>{formatCurrency(order.totalAmount - order.shipping.cost)}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      )
    },
    {
      key: 'timeline',
      tab: 'Lịch sử',
      content: (order) => {
        // Mock timeline data
        const timelineData = [
          {
            time: dayjs(order.date).format('YYYY-MM-DD HH:mm:ss'),
            status: 'Đơn hàng được tạo',
            user: 'Khách hàng',
          },
          {
            time: dayjs(order.date).add(1, 'hours').format('YYYY-MM-DD HH:mm:ss'),
            status: 'Đơn hàng được xác nhận',
            user: 'Nhân viên',
          },
        ];

        if (order.status === 'processing' || order.status === 'shipped' || order.status === 'completed') {
          timelineData.push({
            time: dayjs(order.date).add(2, 'hours').format('YYYY-MM-DD HH:mm:ss'),
            status: 'Đang chuẩn bị hàng',
            user: 'Nhân viên kho',
          });
        }
        
        if (order.status === 'shipped' || order.status === 'completed') {
          timelineData.push({
            time: dayjs(order.date).add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
            status: 'Đã giao cho đơn vị vận chuyển',
            user: 'Nhân viên kho',
          });
        }
        
        if (order.status === 'completed') {
          timelineData.push({
            time: dayjs(order.date).add(3, 'days').format('YYYY-MM-DD HH:mm:ss'),
            status: 'Giao hàng thành công',
            user: 'Đơn vị vận chuyển',
          });
        }
        
        if (order.status === 'canceled') {
          timelineData.push({
            time: dayjs(order.date).add(5, 'hours').format('YYYY-MM-DD HH:mm:ss'),
            status: 'Đơn hàng bị huỷ',
            user: 'Khách hàng',
          });
        }
        
        return (
          <Timeline mode="left">
            {timelineData.map((item, index) => (
              <Timeline.Item
                key={index}
                label={item.time}
                color={index === timelineData.length - 1 ? 'green' : 'blue'}
                dot={index === timelineData.length - 1 ? getTimelineDot(item.status) : null}
              >
                <div>
                  <Text strong>{item.status}</Text>
                </div>
                <div>
                  <Text type="secondary">Thực hiện bởi: {item.user}</Text>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        );
      }
    },
    {
      key: 'notes',
      tab: 'Ghi chú',
      content: (order) => (
        <div>
          <Alert
            message="Ghi chú đơn hàng"
            description="Khách hàng không lấy hoá đơn VAT. Giao hàng trong giờ hành chính."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Input.TextArea 
            rows={4} 
            placeholder="Thêm ghi chú mới..." 
            style={{ marginBottom: 16 }} 
          />
          <Button type="primary">Lưu ghi chú</Button>
        </div>
      )
    },
  ];

  // Get timeline icon based on status
  const getTimelineDot = (status) => {
    if (status.includes('thành công')) {
      return <CheckCircleOutlined style={{ fontSize: '16px' }} />;
    } else if (status.includes('huỷ')) {
      return <CloseCircleOutlined style={{ fontSize: '16px' }} />;
    } else if (status.includes('giao')) {
      return <InboxOutlined style={{ fontSize: '16px' }} />;
    } else {
      return <ClockCircleOutlined style={{ fontSize: '16px' }} />;
    }
  };

  // Handle status change from detail drawer
  const handleStatusChangeFromDrawer = (newStatus) => {
    if (selectedOrder) {
      handleUpdateStatus(selectedOrder.id, newStatus);
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus
      });
    }
  };

  // Handle payment status change from detail drawer
  const handlePaymentStatusChangeFromDrawer = (newStatus) => {
    if (selectedOrder) {
      handleUpdatePaymentStatus(selectedOrder.id, newStatus);
      setSelectedOrder({
        ...selectedOrder,
        paymentStatus: newStatus
      });
    }
  };

  return (
    <div className="order-management">
      {/* Order stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={orderStats.total}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn hàng đang xử lý"
              value={orderStats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn hàng hoàn thành"
              value={orderStats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={orderStats.revenue}
              formatter={value => formatCurrency(value)}
              prefix={<DollarCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter and search */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm kiếm đơn hàng..."
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái đơn hàng"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="pending">Đang xử lý</Option>
              <Option value="processing">Đang chuẩn bị</Option>
              <Option value="shipped">Đang giao hàng</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="canceled">Đã huỷ</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái thanh toán"
              value={filters.paymentStatus}
              onChange={(value) => handleFilterChange('paymentStatus', value)}
            >
              <Option value="all">Tất cả thanh toán</Option>
              <Option value="paid">Đã thanh toán</Option>
              <Option value="pending">Chờ thanh toán</Option>
              <Option value="refunded">Đã hoàn tiền</Option>
              <Option value="failed">Thanh toán thất bại</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <RangePicker 
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} md={24}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button type="primary" icon={<FilterOutlined />} onClick={resetFilters}>
                Xoá bộ lọc
              </Button>
              <Space>
                <Button icon={<ExportOutlined />}>
                  Xuất danh sách
                </Button>
                <Button icon={<PrinterOutlined />}>
                  In danh sách
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/admin/orders/new')}
                >
                  Tạo đơn hàng mới
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Orders table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
        />
      </Card>

      {/* Order details drawer */}
      <Drawer
        title={
          selectedOrder ? (
            <Space align="center">
              <span>{`Đơn hàng: ${selectedOrder.id}`}</span>
              {renderStatusTag(selectedOrder.status)}
            </Space>
          ) : 'Chi tiết đơn hàng'
        }
        width={720}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Đóng</Button>
            <Button type="primary" onClick={() => navigate(`/admin/orders/edit/${selectedOrder?.id}`)}>
              Chỉnh sửa
            </Button>
          </Space>
        }
      >
        {selectedOrder && (
          <>
            <Row gutter={[0, 16]} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Space size="large">
                  <Statistic
                    title="Tổng giá trị"
                    value={formatCurrency(selectedOrder.totalAmount)}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Statistic
                    title="Số lượng sản phẩm"
                    value={selectedOrder.totalItems}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Statistic
                    title="Ngày đặt hàng"
                    value={dayjs(selectedOrder.date).format('DD/MM/YYYY')}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Space>
              </Col>

              <Col span={24}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Cập nhật trạng thái:</Text>
                    <Select
                      style={{ width: 200, marginLeft: 16 }}
                      value={selectedOrder.status}
                      onChange={handleStatusChangeFromDrawer}
                    >
                      <Option value="pending">Đang xử lý</Option>
                      <Option value="processing">Đang chuẩn bị</Option>
                      <Option value="shipped">Đang giao hàng</Option>
                      <Option value="completed">Hoàn thành</Option>
                      <Option value="canceled">Đã huỷ</Option>
                    </Select>
                  </div>
                  <div>
                    <Text strong>Cập nhật thanh toán:</Text>
                    <Select
                      style={{ width: 200, marginLeft: 16 }}
                      value={selectedOrder.paymentStatus}
                      onChange={handlePaymentStatusChangeFromDrawer}
                    >
                      <Option value="pending">Chờ thanh toán</Option>
                      <Option value="paid">Đã thanh toán</Option>
                      <Option value="refunded">Đã hoàn tiền</Option>
                      <Option value="failed">Thanh toán thất bại</Option>
                    </Select>
                  </div>
                </Space>
              </Col>
            </Row>

            <Tabs defaultActiveKey="details">
              {orderDetailsTabs.map(tab => (
                <TabPane tab={tab.tab} key={tab.key}>
                  {tab.content(selectedOrder)}
                </TabPane>
              ))}
            </Tabs>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default OrderManagement; 