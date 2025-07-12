import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Input, Table, Button, Space, Tag, Drawer, 
  Descriptions, Typography, Tabs, Empty, Statistic, Row, Col,
  Timeline, Avatar, Tooltip
} from 'antd';
import {
  SearchOutlined, UserOutlined, PhoneOutlined, 
  ShoppingOutlined, PlusOutlined, TagsOutlined,
  ShoppingCartOutlined, EnvironmentOutlined,
  CalendarOutlined, MailOutlined, IdcardOutlined,
  AuditOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

/**
 * Customer Search component for cashiers to find customer records
 */
const CustomerSearch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Load customer data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        
        // Mock data - would be replaced with API call
        setTimeout(() => {
          const mockCustomers = Array.from({ length: 30 }, (_, i) => {
            const customerTypes = ['retail', 'regular', 'vip', 'wholesale'];
            const joinDate = new Date();
            joinDate.setMonth(joinDate.getMonth() - Math.floor(Math.random() * 24));
            
            return {
              id: `CUST-${1000 + i}`,
              name: `Khách hàng ${i + 1}`,
              phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
              email: `customer${i + 1}@example.com`,
              type: customerTypes[Math.floor(Math.random() * customerTypes.length)],
              join_date: joinDate.toISOString(),
              total_spent: Math.floor(1000000 + Math.random() * 50000000),
              order_count: Math.floor(1 + Math.random() * 20),
              loyalty_points: Math.floor(Math.random() * 5000),
              address: `${Math.floor(100 + Math.random() * 900)} Đường ${Math.floor(Math.random() * 10) + 1}, Hòa Bình`,
              last_visit: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)).toISOString(),
              recent_purchases: Array.from({ length: Math.floor(1 + Math.random() * 5) }, (_, j) => ({
                id: `ORD-${1000 + j}`,
                date: new Date(Date.now() - Math.floor(Math.random() * 90 * 86400000)).toISOString(),
                total: Math.floor(100000 + Math.random() * 5000000),
                items: Math.floor(1 + Math.random() * 10)
              }))
            };
          });
          
          setCustomers(mockCustomers);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Failed to fetch customers:', error);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Handle customer search
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Filter customers based on search text
  const filteredCustomers = customers.filter(customer => {
    if (!searchText) return true;
    
    const query = searchText.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.id.toLowerCase().includes(query)
    );
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Get customer type tag
  const getCustomerTypeTag = (type) => {
    const typeConfig = {
      retail: { color: 'default', text: 'Khách lẻ' },
      regular: { color: 'blue', text: 'Khách thường xuyên' },
      vip: { color: 'gold', text: 'Khách VIP' },
      wholesale: { color: 'purple', text: 'Khách sỉ' }
    };
    
    const config = typeConfig[type] || { color: 'default', text: type };
    
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // View customer details
  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setDrawerVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'Mã KH',
      dataIndex: 'id',
      key: 'id',
      width: 110,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Space>
          <UserOutlined />
          {name}
        </Space>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      ),
    },
    {
      title: 'Loại khách hàng',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getCustomerTypeTag(type),
      width: 150,
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'order_count',
      key: 'order_count',
      render: (count) => (
        <Space>
          <ShoppingOutlined />
          {count}
        </Space>
      ),
      width: 100,
    },
    {
      title: 'Điểm tích lũy',
      dataIndex: 'loyalty_points',
      key: 'loyalty_points',
      render: (points) => (
        <Space>
          <TagsOutlined />
          {points}
        </Space>
      ),
      width: 120,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            onClick={() => viewCustomerDetails(record)}
          >
            Chi tiết
          </Button>
          <Button 
            size="small" 
            onClick={() => console.log('Add to order', record.id)}
          >
            Chọn
          </Button>
        </Space>
      ),
      width: 150,
    }
  ];

  return (
    <>
      <Card 
        title="Tìm kiếm khách hàng" 
        bordered={false}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => console.log('Create new customer')}
          >
            Thêm khách hàng
          </Button>
        }
      >
        <Input.Search
          placeholder="Tìm kiếm theo tên, số điện thoại, email, hoặc mã khách hàng"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true, 
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khách hàng` 
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Customer detail drawer */}
      <Drawer
        title={`Thông tin khách hàng: ${selectedCustomer?.name}`}
        width={600}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        extra={
          <Button 
            type="primary"
            onClick={() => console.log('Add to current order', selectedCustomer?.id)}
          >
            Chọn khách hàng này
          </Button>
        }
      >
        {selectedCustomer && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="Thông tin cơ bản" key="info">
              <div style={{ marginBottom: 16 }}>
                <Avatar
                  size={64}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
                />
                <Title level={4} style={{ margin: '0 0 4px 0' }}>
                  {selectedCustomer.name} {getCustomerTypeTag(selectedCustomer.type)}
                </Title>
                <Space>
                  <IdcardOutlined /> {selectedCustomer.id}
                </Space>
              </div>

              <Descriptions bordered column={1}>
                <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                  {selectedCustomer.phone}
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                  {selectedCustomer.email}
                </Descriptions.Item>
                <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>}>
                  {selectedCustomer.address}
                </Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> Ngày tham gia</>}>
                  {new Date(selectedCustomer.join_date).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label={<><AuditOutlined /> Lần cuối mua hàng</>}>
                  {new Date(selectedCustomer.last_visit).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
              </Descriptions>

              <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={8}>
                  <Statistic 
                    title="Tổng chi tiêu" 
                    value={formatCurrency(selectedCustomer.total_spent)}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="Số đơn hàng" 
                    value={selectedCustomer.order_count}
                    prefix={<ShoppingCartOutlined />} 
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="Điểm tích lũy" 
                    value={selectedCustomer.loyalty_points}
                    prefix={<TagsOutlined />} 
                  />
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Lịch sử mua hàng" key="history">
              {selectedCustomer.recent_purchases && selectedCustomer.recent_purchases.length > 0 ? (
                <Timeline mode="left">
                  {selectedCustomer.recent_purchases.map(purchase => (
                    <Timeline.Item 
                      key={purchase.id}
                      color="blue"
                      label={new Date(purchase.date).toLocaleDateString('vi-VN')}
                    >
                      <p>
                        <strong>{purchase.id}</strong>
                        <br />
                        <Text type="secondary">{purchase.items} sản phẩm</Text>
                        <br />
                        <Text strong>{formatCurrency(purchase.total)}</Text>
                      </p>
                      <Button 
                        size="small"
                        onClick={() => console.log('View order', purchase.id)}
                      >
                        Xem chi tiết
                      </Button>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty description="Khách hàng chưa có đơn hàng nào" />
              )}
            </TabPane>

            <TabPane tab="Điểm thưởng" key="loyalty">
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={24}>
                  <Card>
                    <Statistic 
                      title="Điểm tích lũy hiện tại"
                      value={selectedCustomer.loyalty_points}
                      suffix="điểm"
                      valueStyle={{ color: '#1890ff' }}
                    />
                    <Text type="secondary">
                      Tương đương {formatCurrency(selectedCustomer.loyalty_points * 1000)}
                    </Text>
                  </Card>
                </Col>
              </Row>
              
              <Button 
                type="primary" 
                icon={<TagsOutlined />}
                onClick={() => console.log('Use loyalty points')}
              >
                Sử dụng điểm thưởng
              </Button>
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </>
  );
};

export default CustomerSearch; 