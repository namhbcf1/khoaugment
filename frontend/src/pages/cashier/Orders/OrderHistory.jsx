import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Input, DatePicker, Space, 
  Tooltip, Badge, Drawer, Descriptions, Typography, 
  Divider, Tabs, Alert, Row, Col, Select
} from 'antd';
import {
  SearchOutlined, FileTextOutlined, PrinterOutlined,
  RedoOutlined, CloseOutlined, ClockCircleOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined,
  DollarOutlined, UserOutlined, ShoppingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

/**
 * Order History component for cashiers to view past orders
 */
const OrderHistory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    dateRange: null,
    searchText: '',
  });

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Mock data - would be replaced with API call
        setTimeout(() => {
          const mockOrders = Array.from({ length: 20 }, (_, i) => {
            const statuses = ['completed', 'processing', 'cancelled', 'refunded'];
            const paymentMethods = ['cash', 'card', 'bank_transfer', 'e_wallet'];
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 14));
            
            return {
              id: `ORD-${1000 + i}`,
              customer_name: `Khách hàng ${i % 2 === 0 ? 'vãng lai' : i + 1}`,
              customer_id: i % 2 === 0 ? null : `CUST-${100 + i}`,
              date: date.toISOString(),
              total: Math.floor(10000 + Math.random() * 5000000),
              status: statuses[Math.floor(Math.random() * statuses.length)],
              items_count: Math.floor(1 + Math.random() * 10),
              payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
              cashier: user?.name || 'Nhân viên thu ngân',
              items: Array.from({ length: Math.floor(1 + Math.random() * 5) }, (_, j) => ({
                id: `PROD-${100 + j}`,
                name: `Sản phẩm ${j + 1}`,
                price: Math.floor(100000 + Math.random() * 1000000),
                quantity: Math.floor(1 + Math.random() * 3),
                discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) : 0
              }))
            };
          });
          
          setOrders(mockOrders);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      completed: { color: 'success', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
      processing: { color: 'processing', text: 'Đang xử lý', icon: <ClockCircleOutlined /> },
      cancelled: { color: 'error', text: 'Đã hủy', icon: <CloseOutlined /> },
      refunded: { color: 'warning', text: 'Đã hoàn tiền', icon: <RedoOutlined /> }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status, icon: null };
    
    return (
      <Badge status={config.color} text={config.text} />
    );
  };

  // Get payment method display
  const getPaymentMethod = (method) => {
    const methodConfig = {
      cash: { text: 'Tiền mặt', icon: <DollarOutlined /> },
      card: { text: 'Thẻ', icon: <FileTextOutlined /> },
      bank_transfer: { text: 'Chuyển khoản', icon: <FileTextOutlined /> },
      e_wallet: { text: 'Ví điện tử', icon: <DollarOutlined /> }
    };
    
    const config = methodConfig[method] || { text: method, icon: null };
    
    return (
      <Space>
        {config.icon}
        {config.text}
      </Space>
    );
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDrawerVisible(true);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (filters.status && order.status !== filters.status) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateRange) {
      const orderDate = new Date(order.date).getTime();
      const startDate = filters.dateRange[0].startOf('day').valueOf();
      const endDate = filters.dateRange[1].endOf('day').valueOf();
      
      if (orderDate < startDate || orderDate > endDate) {
        return false;
      }
    }
    
    // Filter by search text
    if (filters.searchText) {
      const searchText = filters.searchText.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchText) ||
        order.customer_name.toLowerCase().includes(searchText) ||
        (order.customer_id && order.customer_id.toLowerCase().includes(searchText))
      );
    }
    
    return true;
  });

  // Table columns
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: 'Thời gian',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      width: 180,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (name, record) => (
        <Space>
          <UserOutlined />
          {name} {record.customer_id && <Tag color="blue">{record.customer_id}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Số lượng SP',
      dataIndex: 'items_count',
      key: 'items_count',
      width: 100,
      render: (count) => (
        <Space>
          <ShoppingOutlined />
          {count}
        </Space>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total) => formatCurrency(total),
      sorter: (a, b) => a.total - b.total,
      width: 150,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => getPaymentMethod(method),
      width: 140,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      width: 140,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              size="small" 
              icon={<FileTextOutlined />}
              onClick={() => viewOrderDetails(record)}
            />
          </Tooltip>
          <Tooltip title="In hóa đơn">
            <Button 
              size="small" 
              icon={<PrinterOutlined />}
              onClick={() => console.log('Print order', record.id)}
            />
          </Tooltip>
        </Space>
      ),
      width: 100,
    }
  ];

  // Calculate order summary
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => {
      const itemPrice = item.price * item.quantity;
      const discount = (itemPrice * item.discount) / 100;
      return total + itemPrice - discount;
    }, 0);
  };

  return (
    <>
      <Card 
        title="Lịch sử đơn hàng" 
        bordered={false}
        extra={
          <Button
            icon={<RedoOutlined />}
            onClick={() => setLoading(true)}
          >
            Làm mới
          </Button>
        }
      >
        {/* Filters */}
        <Space style={{ marginBottom: 16 }} wrap>
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={(dates) => handleFilterChange('dateRange', dates)}
            style={{ width: 280 }}
          />
          <Input 
            placeholder="Tìm kiếm theo mã đơn/khách hàng"
            prefix={<SearchOutlined />}
            onChange={(e) => handleFilterChange('searchText', e.target.value)}
            style={{ width: 250 }}
          />
          <Select 
            placeholder="Trạng thái"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => handleFilterChange('status', value)}
          >
            <Option value="completed">Hoàn thành</Option>
            <Option value="processing">Đang xử lý</Option>
            <Option value="cancelled">Đã hủy</Option>
            <Option value="refunded">Đã hoàn tiền</Option>
          </Select>
        </Space>

        {/* Orders table */}
        <Table
          columns={columns}
          dataSource={filteredOrders}
          loading={loading}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true, 
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng` 
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Order detail drawer */}
      <Drawer
        title={`Chi tiết đơn hàng ${selectedOrder?.id}`}
        width={500}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        extra={
          <Space>
            <Button 
              icon={<PrinterOutlined />}
              onClick={() => console.log('Print order', selectedOrder?.id)}
            >
              In hóa đơn
            </Button>
          </Space>
        }
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {new Date(selectedOrder.date).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.customer_name}
                {selectedOrder.customer_id && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {selectedOrder.customer_id}
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Thu ngân">
                {selectedOrder.cashier}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {getPaymentMethod(selectedOrder.payment_method)}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Chi tiết sản phẩm</Divider>

            <Table
              dataSource={selectedOrder.items}
              pagination={false}
              rowKey="id"
              size="small"
            >
              <Table.Column title="Sản phẩm" dataIndex="name" />
              <Table.Column 
                title="Đơn giá" 
                dataIndex="price" 
                render={(price) => formatCurrency(price)}
              />
              <Table.Column 
                title="SL" 
                dataIndex="quantity"
                width={60}
              />
              <Table.Column
                title="KM"
                dataIndex="discount"
                render={(discount) => discount > 0 ? `${discount}%` : '-'}
                width={70}
              />
              <Table.Column
                title="Thành tiền"
                render={(item) => {
                  const total = item.price * item.quantity;
                  const discount = (total * item.discount) / 100;
                  return formatCurrency(total - discount);
                }}
              />
            </Table>

            <Divider />
            
            <div style={{ textAlign: 'right' }}>
              <Text>Tổng số lượng: <Text strong>{selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</Text></Text>
              <br />
              <Text>Tổng tiền: <Text strong>{formatCurrency(calculateOrderTotal(selectedOrder.items))}</Text></Text>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
};

export default OrderHistory; 