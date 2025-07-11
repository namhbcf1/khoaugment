import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Card, 
  Typography, 
  Tag, 
  Avatar, 
  Dropdown, 
  Menu,
  Tooltip, 
  Modal, 
  message, 
  Popconfirm,
  Badge,
  Select,
  Divider,
  Row,
  Col,
  Tabs,
  Drawer,
  Statistic,
  Empty,
  Timeline
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined, 
  ExportOutlined, 
  ImportOutlined, 
  UserOutlined,
  FilterOutlined,
  SyncOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  WalletOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  FileExcelOutlined,
  UserAddOutlined,
  DownOutlined,
  CheckCircleOutlined,
  StopOutlined,
  HomeOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * Trang quản lý khách hàng
 */
const CustomerManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Tải dữ liệu mẫu
  useEffect(() => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      const mockData = generateCustomerData();
      setCustomers(mockData);
      setFilteredCustomers(mockData);
      setLoading(false);
    }, 1500);
  }, []);

  // Tạo dữ liệu khách hàng mẫu
  const generateCustomerData = () => {
    const statuses = ['active', 'inactive', 'new'];
    const memberships = ['Bronze', 'Silver', 'Gold', 'Platinum', null];
    const genders = ['male', 'female', 'other'];
    
    const mockNames = [
      'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Minh Cường', 'Phạm Thị Diễm',
      'Hoàng Văn Em', 'Đỗ Thị Phương', 'Ngô Văn Giang', 'Vũ Thị Hà',
      'Đinh Văn Indra', 'Bùi Thị Kim', 'Lý Văn Long', 'Mai Thị Minh',
      'Phan Văn Nam', 'Đặng Thị Oanh', 'Huỳnh Văn Phúc', 'Chu Thị Quỳnh'
    ];

    return mockNames.map((name, index) => {
      const id = index + 1;
      const email = name.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .toLowerCase() + '@gmail.com';
      
      const createdDate = dayjs()
        .subtract(Math.floor(Math.random() * 365), 'days')
        .format('YYYY-MM-DD');
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const membership = memberships[Math.floor(Math.random() * memberships.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const phone = `0${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
      const orders = Math.floor(Math.random() * 20);
      const totalSpent = Math.floor(Math.random() * 50000000) + 500000;
      const points = Math.floor(Math.random() * 1000);
      
      return {
        id,
        name,
        email,
        phone,
        gender,
        status,
        membership,
        createdDate,
        lastOrderDate: orders > 0 
          ? dayjs(createdDate).add(Math.floor(Math.random() * dayjs().diff(dayjs(createdDate), 'days')), 'days').format('YYYY-MM-DD')
          : null,
        orders,
        totalSpent,
        points,
        address: 'Hòa Bình, Việt Nam',
        notes: Math.random() > 0.7 ? 'Khách hàng VIP, ưu tiên hỗ trợ nhanh' : '',
      };
    });
  };

  // Xử lý lọc và tìm kiếm
  useEffect(() => {
    let result = [...customers];
    
    // Tìm kiếm
    if (searchText) {
      result = result.filter(
        customer =>
          customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
          customer.phone.includes(searchText)
      );
    }
    
    // Lọc theo trạng thái
    if (statusFilter !== 'all') {
      result = result.filter(customer => customer.status === statusFilter);
    }
    
    // Lọc theo hạng thành viên
    if (membershipFilter !== 'all') {
      if (membershipFilter === 'none') {
        result = result.filter(customer => !customer.membership);
      } else {
        result = result.filter(customer => customer.membership === membershipFilter);
      }
    }
    
    setFilteredCustomers(result);
  }, [searchText, statusFilter, membershipFilter, customers]);

  // Xử lý chọn hàng
  const rowSelection = {
    selectedRowKeys,
    onChange: keys => setSelectedRowKeys(keys),
  };

  // Xử lý xóa khách hàng
  const handleDelete = customer => {
    setCustomerToDelete(customer);
    setDeleteModalVisible(true);
  };

  // Xác nhận xóa
  const confirmDelete = () => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      setCustomers(prevCustomers => 
        prevCustomers.filter(c => c.id !== customerToDelete.id)
      );
      message.success(`Đã xóa khách hàng: ${customerToDelete.name}`);
      setDeleteModalVisible(false);
      setCustomerToDelete(null);
      setLoading(false);
    }, 1000);
  };

  // Xử lý hành động trên nhiều khách hàng
  const handleBulkAction = action => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một khách hàng');
      return;
    }

    setLoading(true);
    
    // Giả lập API call
    setTimeout(() => {
      switch (action) {
        case 'delete':
          setCustomers(prevCustomers => 
            prevCustomers.filter(c => !selectedRowKeys.includes(c.id))
          );
          message.success(`Đã xóa ${selectedRowKeys.length} khách hàng`);
          break;
        case 'active':
          setCustomers(prevCustomers => 
            prevCustomers.map(c => 
              selectedRowKeys.includes(c.id) ? { ...c, status: 'active' } : c
            )
          );
          message.success(`Đã kích hoạt ${selectedRowKeys.length} khách hàng`);
          break;
        case 'inactive':
          setCustomers(prevCustomers => 
            prevCustomers.map(c => 
              selectedRowKeys.includes(c.id) ? { ...c, status: 'inactive' } : c
            )
          );
          message.success(`Đã vô hiệu hóa ${selectedRowKeys.length} khách hàng`);
          break;
        case 'export':
          message.success('Đã xuất file Excel với dữ liệu đã chọn');
          break;
        default:
          break;
      }
      
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };

  // Hiển thị chi tiết khách hàng
  const viewCustomerDetails = (customer) => {
    setCurrentCustomer(customer);
    setDrawerVisible(true);
  };

  // Format tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Menu hành động cho mỗi khách hàng
  const getActionMenu = (record) => (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => viewCustomerDetails(record)}>
        Xem chi tiết
      </Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => navigate(`/admin/customers/edit/${record.id}`)}>
        Chỉnh sửa
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />} 
        danger 
        onClick={() => handleDelete(record)}
      >
        Xóa
      </Menu.Item>
    </Menu>
  );

  // Hiển thị trạng thái khách hàng
  const renderCustomerStatus = (status) => {
    switch (status) {
      case 'active':
        return <Tag color="green">Hoạt động</Tag>;
      case 'inactive':
        return <Tag color="red">Vô hiệu</Tag>;
      case 'new':
        return <Tag color="blue">Mới</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  // Hiển thị hạng thành viên
  const renderMembership = (membership) => {
    if (!membership) return <Text type="secondary">Chưa có</Text>;
    
    let color = '';
    switch (membership) {
      case 'Bronze':
        color = '#cd7f32';
        break;
      case 'Silver':
        color = '#c0c0c0';
        break;
      case 'Gold':
        color = '#ffd700';
        break;
      case 'Platinum':
        color = '#e5e4e2';
        break;
      default:
        color = '#999';
    }
    
    return <Tag color={color} style={{ color: membership === 'Gold' ? '#5c4d00' : undefined }}>{membership}</Tag>;
  };

  // Cột cho bảng khách hàng
  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: record.gender === 'female' ? '#ff7875' : record.gender === 'male' ? '#1890ff' : '#722ed1',
              marginRight: '8px' 
            }}
          />
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'orders',
      key: 'orders',
      sorter: (a, b) => a.orders - b.orders,
      render: (text) => (
        <Badge count={text} showZero style={{ backgroundColor: text > 0 ? '#1890ff' : '#d9d9d9' }} />
      ),
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      sorter: (a, b) => dayjs(a.createdDate).unix() - dayjs(b.createdDate).unix(),
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Lần mua cuối',
      dataIndex: 'lastOrderDate',
      key: 'lastOrderDate',
      sorter: (a, b) => {
        if (!a.lastOrderDate) return 1;
        if (!b.lastOrderDate) return -1;
        return dayjs(a.lastOrderDate).unix() - dayjs(b.lastOrderDate).unix();
      },
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : <Text type="secondary">Chưa mua</Text>,
    },
    {
      title: 'Hạng thành viên',
      dataIndex: 'membership',
      key: 'membership',
      render: (membership) => renderMembership(membership),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderCustomerStatus(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
          <Button 
            type="text"
            icon={<MoreOutlined />}
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  // Menu dropdown cho bulk actions
  const bulkActionMenu = (
    <Menu>
      <Menu.Item key="active" icon={<CheckCircleOutlined />} onClick={() => handleBulkAction('active')}>
        Kích hoạt đã chọn
      </Menu.Item>
      <Menu.Item key="inactive" icon={<StopOutlined />} onClick={() => handleBulkAction('inactive')}>
        Vô hiệu hóa đã chọn
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="export" icon={<FileExcelOutlined />} onClick={() => handleBulkAction('export')}>
        Xuất Excel đã chọn
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleBulkAction('delete')}>
        Xóa đã chọn
      </Menu.Item>
    </Menu>
  );

  // Thông tin thống kê khách hàng
  const customerStats = () => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const inactive = customers.filter(c => c.status === 'inactive').length;
    const new_ = customers.filter(c => c.status === 'new').length;
    const withOrders = customers.filter(c => c.orders > 0).length;
    
    return (
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Tổng khách hàng" 
              value={total} 
              prefix={<TeamOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Đang hoạt động" 
              value={active} 
              valueStyle={{ color: '#52c41a' }} 
              prefix={<UserOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Không hoạt động" 
              value={inactive} 
              valueStyle={{ color: '#cf1322' }} 
              prefix={<UserOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Mới" 
              value={new_} 
              valueStyle={{ color: '#1890ff' }} 
              prefix={<UserAddOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Đã mua hàng" 
              value={withOrders} 
              valueStyle={{ color: '#722ed1' }} 
              prefix={<ShoppingOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic 
              title="Tỉ lệ mua hàng" 
              value={total ? (withOrders / total * 100).toFixed(1) : 0} 
              suffix="%" 
              precision={1} 
              prefix={<WalletOutlined />} 
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="customer-management">
      <Card bordered={false} className="header-card">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Title level={3}>Quản lý khách hàng</Title>
            <Text type="secondary">
              Quản lý thông tin và dữ liệu khách hàng
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => navigate('/admin/customers/add')}
              >
                Thêm khách hàng
              </Button>
              <Button icon={<ImportOutlined />}>
                Nhập Excel
              </Button>
              <Button icon={<ExportOutlined />}>
                Xuất Excel
              </Button>
              <Button 
                icon={<SyncOutlined />} 
                loading={loading}
                onClick={() => setLoading(true)}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ margin: '24px 0' }}>
        {customerStats()}
      </div>

      <Card bordered={false}>
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Search
                placeholder="Tìm khách hàng theo tên, email, SĐT..."
                allowClear
                enterButton
                onSearch={(value) => setSearchText(value)}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Lọc theo trạng thái"
                onChange={(value) => setStatusFilter(value)}
                value={statusFilter}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Vô hiệu</Option>
                <Option value="new">Mới</Option>
              </Select>
            </Col>
            <Col xs={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Lọc theo hạng thành viên"
                onChange={(value) => setMembershipFilter(value)}
                value={membershipFilter}
              >
                <Option value="all">Tất cả hạng</Option>
                <Option value="Bronze">Bronze</Option>
                <Option value="Silver">Silver</Option>
                <Option value="Gold">Gold</Option>
                <Option value="Platinum">Platinum</Option>
                <Option value="none">Chưa có hạng</Option>
              </Select>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Space>
                {selectedRowKeys.length > 0 && (
                  <Text type="secondary">
                    Đã chọn {selectedRowKeys.length} khách hàng
                  </Text>
                )}
                
                {selectedRowKeys.length > 0 && (
                  <Dropdown overlay={bulkActionMenu}>
                    <Button>
                      Thao tác <DownOutlined />
                    </Button>
                  </Dropdown>
                )}
                
                <Button 
                  icon={<FilterOutlined />}
                  onClick={() => {
                    setSearchText('');
                    setStatusFilter('all');
                    setMembershipFilter('all');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>

      {/* Modal xác nhận xóa khách hàng */}
      <Modal
        title="Xác nhận xóa khách hàng"
        visible={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa khách hàng <strong>{customerToDelete?.name}</strong>?</p>
        <p>Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến khách hàng này.</p>
      </Modal>

      {/* Drawer hiển thị chi tiết khách hàng */}
      <Drawer
        title="Chi tiết khách hàng"
        width={500}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        footer={
          <Space>
            <Button 
              onClick={() => {
                setDrawerVisible(false);
                navigate(`/admin/customers/edit/${currentCustomer?.id}`);
              }}
              type="primary"
            >
              Chỉnh sửa
            </Button>
            <Button onClick={() => setDrawerVisible(false)}>Đóng</Button>
          </Space>
        }
      >
        {currentCustomer && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar 
                size={80} 
                icon={<UserOutlined />} 
                style={{ 
                  backgroundColor: currentCustomer.gender === 'female' ? '#ff7875' : currentCustomer.gender === 'male' ? '#1890ff' : '#722ed1' 
                }}
              />
              <Title level={4} style={{ marginTop: '16px', marginBottom: '0' }}>
                {currentCustomer.name}
              </Title>
              {renderMembership(currentCustomer.membership)}
              {renderCustomerStatus(currentCustomer.status)}
            </div>

            <Divider orientation="left">Thông tin liên hệ</Divider>
            
            <p>
              <MailOutlined /> Email: <Text copyable>{currentCustomer.email}</Text>
            </p>
            <p>
              <PhoneOutlined /> Điện thoại: <Text copyable>{currentCustomer.phone}</Text>
            </p>
            <p>
              <HomeOutlined /> Địa chỉ: {currentCustomer.address}
            </p>
            
            <Divider orientation="left">Thông tin tài khoản</Divider>
            
            <p>
              <ClockCircleOutlined /> Ngày tạo: {dayjs(currentCustomer.createdDate).format('DD/MM/YYYY')}
            </p>
            <p>
              <ShoppingOutlined /> Tổng đơn hàng: {currentCustomer.orders}
            </p>
            <p>
              <WalletOutlined /> Tổng chi tiêu: {formatCurrency(currentCustomer.totalSpent)}
            </p>
            <p>
              <TrophyOutlined /> Điểm tích lũy: {currentCustomer.points} điểm
            </p>

            {currentCustomer.notes && (
              <>
                <Divider orientation="left">Ghi chú</Divider>
                <p>{currentCustomer.notes}</p>
              </>
            )}

            <Divider orientation="left">Hoạt động gần đây</Divider>

            <Tabs defaultActiveKey="orders">
              <TabPane tab="Đơn hàng" key="orders">
                {currentCustomer.orders > 0 ? (
                  <Table 
                    size="small"
                    pagination={false}
                    columns={[
                      {
                        title: 'Mã đơn',
                        dataIndex: 'code',
                        key: 'code',
                      },
                      {
                        title: 'Ngày',
                        dataIndex: 'date',
                        key: 'date',
                      },
                      {
                        title: 'Giá trị',
                        dataIndex: 'value',
                        key: 'value',
                        align: 'right',
                      },
                    ]}
                    dataSource={Array(Math.min(currentCustomer.orders, 5)).fill().map((_, i) => ({
                      key: i,
                      code: `ORD-${100000 + i}`,
                      date: dayjs(currentCustomer.lastOrderDate)
                        .subtract(i * 15, 'days')
                        .format('DD/MM/YYYY'),
                      value: formatCurrency(Math.floor(Math.random() * 5000000) + 500000),
                    }))}
                  />
                ) : (
                  <Empty description="Chưa có đơn hàng nào" />
                )}
              </TabPane>
              <TabPane tab="Lịch sử" key="history">
                <Timeline>
                  <Timeline.Item color="green">
                    Tạo tài khoản - {dayjs(currentCustomer.createdDate).format('DD/MM/YYYY')}
                  </Timeline.Item>
                  {currentCustomer.orders > 0 && (
                    <Timeline.Item color="blue">
                      Đơn hàng đầu tiên - {dayjs(currentCustomer.createdDate).add(5, 'days').format('DD/MM/YYYY')}
                    </Timeline.Item>
                  )}
                  {currentCustomer.membership && (
                    <Timeline.Item color="gold">
                      Đạt hạng {currentCustomer.membership} - {dayjs(currentCustomer.createdDate).add(30, 'days').format('DD/MM/YYYY')}
                    </Timeline.Item>
                  )}
                  {currentCustomer.orders > 3 && (
                    <Timeline.Item color="purple">
                      Lần mua hàng gần nhất - {dayjs(currentCustomer.lastOrderDate).format('DD/MM/YYYY')}
                    </Timeline.Item>
                  )}
                </Timeline>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CustomerManagement; 