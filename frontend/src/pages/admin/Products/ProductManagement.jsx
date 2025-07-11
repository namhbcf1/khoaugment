import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Card, 
  Typography, 
  Tag, 
  Dropdown, 
  Tooltip, 
  Modal, 
  message, 
  Popconfirm,
  Badge,
  Select,
  Divider,
  Row,
  Col,
  Statistic,
  Menu,
  Avatar
} from 'antd';
import { 
  DownOutlined,
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  MoreOutlined, 
  ExportOutlined, 
  ImportOutlined, 
  FilterOutlined,
  SyncOutlined,
  BarChartOutlined,
  TagOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const ProductManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // table or card
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Mock data for products
  const mockProducts = [
    {
      id: 1,
      name: 'Laptop Dell Inspiron 15',
      sku: 'DELL-INS-15',
      category: 'Laptop',
      price: 15000000,
      stock: 25,
      status: 'active',
      image: 'https://via.placeholder.com/150',
      description: 'Laptop Dell Inspiron 15 với cấu hình mạnh mẽ',
      createdAt: '2023-01-15',
      updatedAt: '2023-06-20',
    },
    {
      id: 2,
      name: 'Màn hình Dell 24"',
      sku: 'DELL-MON-24',
      category: 'Màn hình',
      price: 3500000,
      stock: 42,
      status: 'active',
      image: 'https://via.placeholder.com/150',
      description: 'Màn hình Dell 24 inch độ phân giải Full HD',
      createdAt: '2023-02-10',
      updatedAt: '2023-05-15',
    },
    {
      id: 3,
      name: 'Chuột không dây Logitech',
      sku: 'LOG-MOUSE-01',
      category: 'Phụ kiện',
      price: 450000,
      stock: 78,
      status: 'active',
      image: 'https://via.placeholder.com/150',
      description: 'Chuột không dây Logitech với độ chính xác cao',
      createdAt: '2023-03-05',
      updatedAt: '2023-04-20',
    },
    {
      id: 4,
      name: 'Bàn phím cơ AKKO',
      sku: 'AKKO-KB-01',
      category: 'Phụ kiện',
      price: 1200000,
      stock: 15,
      status: 'active',
      image: 'https://via.placeholder.com/150',
      description: 'Bàn phím cơ AKKO với switch Cherry MX Blue',
      createdAt: '2023-01-25',
      updatedAt: '2023-03-10',
    },
    {
      id: 5,
      name: 'Laptop Acer Nitro 5',
      sku: 'ACER-NIT-5',
      category: 'Laptop',
      price: 22000000,
      stock: 0,
      status: 'out_of_stock',
      image: 'https://via.placeholder.com/150',
      description: 'Laptop gaming Acer Nitro 5 với card đồ họa NVIDIA',
      createdAt: '2023-02-05',
      updatedAt: '2023-04-15',
    },
    {
      id: 6,
      name: 'Tai nghe Sony WH-1000XM4',
      sku: 'SONY-WH-1000',
      category: 'Âm thanh',
      price: 5500000,
      stock: 8,
      status: 'low_stock',
      image: 'https://via.placeholder.com/150',
      description: 'Tai nghe chống ồn Sony WH-1000XM4 cao cấp',
      createdAt: '2023-03-15',
      updatedAt: '2023-05-20',
    },
    {
      id: 7,
      name: 'Máy tính để bàn HP Pavilion',
      sku: 'HP-PAV-01',
      category: 'PC',
      price: 18000000,
      stock: 12,
      status: 'active',
      image: 'https://via.placeholder.com/150',
      description: 'Máy tính để bàn HP Pavilion cấu hình mạnh mẽ',
      createdAt: '2023-01-10',
      updatedAt: '2023-03-25',
    },
    {
      id: 8,
      name: 'Ổ cứng SSD Samsung 1TB',
      sku: 'SAM-SSD-1TB',
      category: 'Linh kiện',
      price: 2800000,
      stock: 35,
      status: 'active',
      image: 'https://via.placeholder.com/150',
      description: 'Ổ cứng SSD Samsung 1TB tốc độ cao',
      createdAt: '2023-02-20',
      updatedAt: '2023-04-05',
    },
    {
      id: 9,
      name: 'RAM Kingston 16GB DDR4',
      sku: 'KING-RAM-16',
      category: 'Linh kiện',
      price: 1500000,
      stock: 0,
      status: 'out_of_stock',
      image: 'https://via.placeholder.com/150',
      description: 'Bộ nhớ RAM Kingston 16GB DDR4 3200MHz',
      createdAt: '2023-03-10',
      updatedAt: '2023-05-05',
    },
    {
      id: 10,
      name: 'Card đồ họa NVIDIA RTX 3060',
      sku: 'NV-RTX-3060',
      category: 'Linh kiện',
      price: 9500000,
      stock: 5,
      status: 'low_stock',
      image: 'https://via.placeholder.com/150',
      description: 'Card đồ họa NVIDIA RTX 3060 12GB GDDR6',
      createdAt: '2023-01-05',
      updatedAt: '2023-06-10',
    },
  ];

  // Load data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter products based on search text and filters
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchText) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchText.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchText.toLowerCase()) ||
          product.category.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter((product) => product.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((product) => product.status === statusFilter);
    }
    
    setFilteredProducts(result);
  }, [searchText, categoryFilter, statusFilter, products]);

  // Get unique categories for filter
  const categories = [...new Set(products.map((product) => product.category))];

  // Handle row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  // Handle product deletion
  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      // In a real app, this would be an API call
      const updatedProducts = products.filter((p) => p.id !== productToDelete.id);
      setProducts(updatedProducts);
      setFilteredProducts(
        filteredProducts.filter((p) => p.id !== productToDelete.id)
      );
      message.success(`Đã xóa sản phẩm "${productToDelete.name}"`);
    }
    setIsDeleteModalVisible(false);
    setProductToDelete(null);
  };

  // Handle bulk actions
  const handleBulkDelete = () => {
    Modal.confirm({
      title: 'Xác nhận xóa hàng loạt',
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} sản phẩm đã chọn?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        // In a real app, this would be an API call
        const updatedProducts = products.filter(
          (p) => !selectedRowKeys.includes(p.id)
        );
        setProducts(updatedProducts);
        setFilteredProducts(
          filteredProducts.filter((p) => !selectedRowKeys.includes(p.id))
        );
        setSelectedRowKeys([]);
        message.success(`Đã xóa ${selectedRowKeys.length} sản phẩm`);
      },
    });
  };

  // Toggle product status (active/inactive)
  const toggleProductStatus = (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    
    // In a real app, this would be an API call
    const updatedProducts = products.map(p => 
      p.id === product.id ? { ...p, status: newStatus } : p
    );
    
    setProducts(updatedProducts);
    setFilteredProducts(
      updatedProducts.filter(p => 
        categoryFilter === 'all' || p.category === categoryFilter
      )
    );
    
    message.success(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hoá'} sản phẩm ${product.name}`);
  };

  // Render status badge
  const renderStatus = (status) => {
    switch (status) {
      case 'active':
        return <Badge status="success" text="Đang bán" />;
      case 'out_of_stock':
        return <Badge status="error" text="Hết hàng" />;
      case 'low_stock':
        return <Badge status="warning" text="Sắp hết hàng" />;
      case 'inactive':
        return <Badge status="default" text="Ngừng bán" />;
      default:
        return <Badge status="processing" text={status} />;
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
  };

  // Handle category filter change
  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
  };

  // Handle status filter change
  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchText('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  // More actions dropdown menu
  const moreActions = (record) => (
    <Menu>
      <Menu.Item 
        key="view" 
        icon={<EyeOutlined />}
        onClick={() => navigate(`/admin/products/view/${record.id}`)}
      >
        Chi tiết
      </Menu.Item>
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />}
        onClick={() => navigate(`/admin/products/edit/${record.id}`)}
      >
        Chỉnh sửa
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="toggle"
        icon={record.status === 'active' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
        onClick={() => toggleProductStatus(record)}
      >
        {record.status === 'active' ? 'Ngừng bán' : 'Kích hoạt'}
      </Menu.Item>
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />}
        danger
        onClick={() => handleDelete(record)}
      >
        Xoá
      </Menu.Item>
    </Menu>
  );

  // Define table columns
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar 
            shape="square"
            size={40}
            src={record.image}
            alt={text}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{record.sku}</div>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>,
      filters: categories.map(category => ({ text: category, value: category })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (text) => (
        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text)}</span>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (text, record) => {
        let color = 'green';
        if (text === 0) {
          color = 'red';
        } else if (text < 10) {
          color = 'orange';
        }
        
        return <span style={{ color }}>{text}</span>;
      },
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status),
      filters: [
        { text: 'Đang bán', value: 'active' },
        { text: 'Hết hàng', value: 'out_of_stock' },
        { text: 'Sắp hết hàng', value: 'low_stock' },
        { text: 'Ngừng bán', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
      responsive: ['lg'],
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/products/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Dropdown overlay={moreActions(record)} trigger={['click']}>
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Handle bulk actions
  const handleBulkAction = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn sản phẩm');
      return;
    }
    
    switch (action) {
      case 'delete':
        handleBulkDelete();
        break;
      case 'active':
        // Update products' status to active
        const updatedActiveProducts = products.map(p => 
          selectedRowKeys.includes(p.id) ? { ...p, status: 'active' } : p
        );
        setProducts(updatedActiveProducts);
        setFilteredProducts(updatedActiveProducts);
        message.success(`Đã kích hoạt ${selectedRowKeys.length} sản phẩm`);
        break;
      case 'inactive':
        // Update products' status to inactive
        const updatedInactiveProducts = products.map(p => 
          selectedRowKeys.includes(p.id) ? { ...p, status: 'inactive' } : p
        );
        setProducts(updatedInactiveProducts);
        setFilteredProducts(updatedInactiveProducts);
        message.success(`Đã vô hiệu hoá ${selectedRowKeys.length} sản phẩm`);
        break;
      default:
        break;
    }
  };

  // Bulk action menu
  const bulkActionMenu = (
    <Menu>
      <Menu.Item
        key="active"
        icon={<CheckCircleOutlined />}
        onClick={() => handleBulkAction('active')}
      >
        Kích hoạt đã chọn
      </Menu.Item>
      <Menu.Item
        key="inactive"
        icon={<CloseCircleOutlined />}
        onClick={() => handleBulkAction('inactive')}
      >
        Vô hiệu hoá đã chọn
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        danger
        onClick={() => handleBulkAction('delete')}
      >
        Xoá đã chọn
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="product-management">
      {/* Product Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={products.length}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Sản phẩm hết hàng"
              value={products.filter(p => p.stock === 0).length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={products.filter(p => p.stock > 0 && p.stock < 10).length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng giá trị kho"
              value={products.reduce((sum, p) => sum + (p.price * p.stock), 0)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND',
                maximumFractionDigits: 0 
              }).format(value)}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchText}
              onChange={handleSearch}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Lọc theo danh mục"
              style={{ width: '100%' }}
              value={categoryFilter}
              onChange={handleCategoryChange}
            >
              <Option value="all">Tất cả danh mục</Option>
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang bán</Option>
              <Option value="out_of_stock">Hết hàng</Option>
              <Option value="low_stock">Sắp hết hàng</Option>
              <Option value="inactive">Ngừng bán</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={24} lg={6} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button icon={<FilterOutlined />} onClick={handleResetFilters}>
                Xoá bộ lọc
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/products/new')}
              >
                Thêm sản phẩm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Dropdown overlay={bulkActionMenu} disabled={selectedRowKeys.length === 0}>
              <Button>
                Thao tác hàng loạt <DownOutlined />
              </Button>
            </Dropdown>
            <Button icon={<ImportOutlined />}>Nhập Excel</Button>
            <Button icon={<ExportOutlined />}>Xuất Excel</Button>
          </Space>
          <span style={{ marginLeft: 8 }}>
            {selectedRowKeys.length > 0 && (
              <span>Đã chọn {selectedRowKeys.length} sản phẩm</span>
            )}
          </span>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm` 
          }}
          loading={loading}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xoá"
        visible={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xoá"
        cancelText="Huỷ"
        okButtonProps={{ danger: true }}
      >
        {productToDelete && (
          <p>Bạn có chắc chắn muốn xoá sản phẩm "{productToDelete.name}" không?</p>
        )}
      </Modal>
    </div>
  );
};

export default ProductManagement; 