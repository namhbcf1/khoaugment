import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Progress,
  Badge,
  Input,
  Button,
  Select,
  Row,
  Col,
  Tooltip,
  Alert,
  Statistic,
  Divider,
  Popover,
  List
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
  UpOutlined,
  BarcodeOutlined,
  SyncOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  AreaChartOutlined,
  BellOutlined
} from '@ant-design/icons';
import useWebSocket from '../../hooks/useWebSocket';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// Mock data for inventory items
const mockInventoryItems = [
  {
    id: 'LP001',
    name: 'Laptop Dell XPS 13',
    category: 'Laptop',
    currentStock: 15,
    minStock: 5,
    maxStock: 30,
    status: 'in_stock',
    location: 'Kho chính - A1',
    lastUpdated: '2023-07-20 10:15:30',
    price: 25000000,
    supplier: 'Dell Việt Nam',
    reorderPoint: 8,
    onOrder: 0,
    reserved: 2
  },
  {
    id: 'LP002',
    name: 'Laptop HP Spectre x360',
    category: 'Laptop',
    currentStock: 8,
    minStock: 5,
    maxStock: 25,
    status: 'in_stock',
    location: 'Kho chính - A2',
    lastUpdated: '2023-07-20 09:45:12',
    price: 28000000,
    supplier: 'HP Việt Nam',
    reorderPoint: 7,
    onOrder: 5,
    reserved: 1
  },
  {
    id: 'LP003',
    name: 'Laptop Lenovo ThinkPad X1',
    category: 'Laptop',
    currentStock: 3,
    minStock: 5,
    maxStock: 20,
    status: 'low_stock',
    location: 'Kho chính - A1',
    lastUpdated: '2023-07-20 11:20:45',
    price: 32000000,
    supplier: 'Lenovo Việt Nam',
    reorderPoint: 5,
    onOrder: 10,
    reserved: 0
  },
  {
    id: 'PC001',
    name: 'PC Gaming MSI MEG Aegis Ti5',
    category: 'PC',
    currentStock: 6,
    minStock: 3,
    maxStock: 15,
    status: 'in_stock',
    location: 'Kho chính - B1',
    lastUpdated: '2023-07-19 16:30:22',
    price: 65000000,
    supplier: 'MSI Việt Nam',
    reorderPoint: 4,
    onOrder: 0,
    reserved: 1
  },
  {
    id: 'PC002',
    name: 'PC Gaming Asus ROG Strix G35',
    category: 'PC',
    currentStock: 2,
    minStock: 3,
    maxStock: 15,
    status: 'low_stock',
    location: 'Kho chính - B2',
    lastUpdated: '2023-07-20 08:15:10',
    price: 55000000,
    supplier: 'Asus Việt Nam',
    reorderPoint: 3,
    onOrder: 5,
    reserved: 0
  },
  {
    id: 'MO001',
    name: 'Màn hình Dell UltraSharp 27"',
    category: 'Màn hình',
    currentStock: 12,
    minStock: 8,
    maxStock: 25,
    status: 'in_stock',
    location: 'Kho chính - C1',
    lastUpdated: '2023-07-19 14:45:33',
    price: 8500000,
    supplier: 'Dell Việt Nam',
    reorderPoint: 10,
    onOrder: 0,
    reserved: 3
  },
  {
    id: 'MO002',
    name: 'Màn hình LG UltraGear 32" Gaming',
    category: 'Màn hình',
    currentStock: 0,
    minStock: 5,
    maxStock: 20,
    status: 'out_of_stock',
    location: 'Kho chính - C2',
    lastUpdated: '2023-07-18 11:10:05',
    price: 12000000,
    supplier: 'LG Việt Nam',
    reorderPoint: 5,
    onOrder: 15,
    reserved: 0
  },
  {
    id: 'KB001',
    name: 'Bàn phím cơ Logitech G Pro X',
    category: 'Phụ kiện',
    currentStock: 25,
    minStock: 10,
    maxStock: 50,
    status: 'in_stock',
    location: 'Kho phụ - D1',
    lastUpdated: '2023-07-20 09:30:15',
    price: 2800000,
    supplier: 'Logitech Việt Nam',
    reorderPoint: 15,
    onOrder: 0,
    reserved: 5
  },
  {
    id: 'MS001',
    name: 'Chuột Razer DeathAdder V2',
    category: 'Phụ kiện',
    currentStock: 18,
    minStock: 10,
    maxStock: 40,
    status: 'in_stock',
    location: 'Kho phụ - D2',
    lastUpdated: '2023-07-19 15:20:40',
    price: 1500000,
    supplier: 'Razer Việt Nam',
    reorderPoint: 12,
    onOrder: 0,
    reserved: 2
  },
  {
    id: 'HD001',
    name: 'Ổ cứng SSD Samsung 970 EVO 1TB',
    category: 'Linh kiện',
    currentStock: 30,
    minStock: 15,
    maxStock: 60,
    status: 'in_stock',
    location: 'Kho phụ - E1',
    lastUpdated: '2023-07-20 10:45:22',
    price: 3200000,
    supplier: 'Samsung Việt Nam',
    reorderPoint: 20,
    onOrder: 0,
    reserved: 8
  }
];

// Mock data for inventory summary
const mockInventorySummary = {
  totalItems: 10,
  totalValue: 432500000,
  lowStockItems: 2,
  outOfStockItems: 1,
  itemsOnOrder: 4,
  reservedItems: 7,
  categories: {
    Laptop: 3,
    PC: 2,
    'Màn hình': 2,
    'Phụ kiện': 2,
    'Linh kiện': 1
  }
};

// Mock data for recent activities
const mockRecentActivities = [
  {
    id: 'ACT001',
    type: 'stock_in',
    itemId: 'LP001',
    itemName: 'Laptop Dell XPS 13',
    quantity: 5,
    timestamp: '2023-07-20 10:15:30',
    user: 'Nguyễn Văn A'
  },
  {
    id: 'ACT002',
    type: 'stock_out',
    itemId: 'MO002',
    itemName: 'Màn hình LG UltraGear 32" Gaming',
    quantity: 2,
    timestamp: '2023-07-18 11:10:05',
    user: 'Trần Thị B'
  },
  {
    id: 'ACT003',
    type: 'order_placed',
    itemId: 'LP003',
    itemName: 'Laptop Lenovo ThinkPad X1',
    quantity: 10,
    timestamp: '2023-07-19 09:22:15',
    user: 'Lê Văn C'
  },
  {
    id: 'ACT004',
    type: 'reservation',
    itemId: 'HD001',
    itemName: 'Ổ cứng SSD Samsung 970 EVO 1TB',
    quantity: 3,
    timestamp: '2023-07-20 09:05:45',
    user: 'Phạm Thị D'
  },
  {
    id: 'ACT005',
    type: 'stock_adjustment',
    itemId: 'KB001',
    itemName: 'Bàn phím cơ Logitech G Pro X',
    quantity: -2,
    timestamp: '2023-07-19 16:30:10',
    user: 'Hoàng Văn E'
  }
];

const InventoryTracker = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortedInfo, setSortedInfo] = useState({});
  const [filteredInfo, setFilteredInfo] = useState({});
  const [alertVisible, setAlertVisible] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Initialize WebSocket connection
  const { lastMessage, sendMessage } = useWebSocket('ws://localhost:8080/inventory');

  // Load data on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInventoryItems(mockInventoryItems);
      setInventorySummary(mockInventorySummary);
      setRecentActivities(mockRecentActivities);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage && realTimeUpdates) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'inventory_update') {
          // Update inventory item
          setInventoryItems(prevItems => {
            return prevItems.map(item => {
              if (item.id === data.itemId) {
                return { ...item, ...data.updates };
              }
              return item;
            });
          });
        } else if (data.type === 'activity') {
          // Add new activity
          setRecentActivities(prevActivities => [data.activity, ...prevActivities]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage, realTimeUpdates]);

  // Handle search
  const handleSearch = (value) => {
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

  // Handle table change
  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
    setFilteredInfo(filters);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setInventoryItems(mockInventoryItems);
      setInventorySummary(mockInventorySummary);
      setRecentActivities(mockRecentActivities);
      setLoading(false);
    }, 1000);
  };

  // Toggle real-time updates
  const toggleRealTimeUpdates = () => {
    setRealTimeUpdates(!realTimeUpdates);
  };

  // Filter inventory items
  const getFilteredItems = () => {
    return inventoryItems.filter(item => {
      const matchesSearch = !searchText || 
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.id.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  // Render stock status
  const renderStockStatus = (status, currentStock, minStock, maxStock) => {
    switch (status) {
      case 'in_stock':
        return <Badge status="success" text="Còn hàng" />;
      case 'low_stock':
        return <Badge status="warning" text="Sắp hết hàng" />;
      case 'out_of_stock':
        return <Badge status="error" text="Hết hàng" />;
      case 'over_stock':
        return <Badge status="processing" text="Tồn kho cao" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  // Render stock level
  const renderStockLevel = (currentStock, minStock, maxStock) => {
    const percentage = (currentStock / maxStock) * 100;
    let status = 'normal';
    if (currentStock <= minStock) {
      status = 'exception';
    } else if (currentStock >= maxStock * 0.9) {
      status = 'success';
    }
    
    return (
      <Tooltip title={`${currentStock}/${maxStock} (Min: ${minStock})`}>
        <Progress 
          percent={percentage} 
          size="small" 
          status={status}
          style={{ width: 100 }}
        />
      </Tooltip>
    );
  };

  // Render activity type
  const renderActivityType = (type) => {
    switch (type) {
      case 'stock_in':
        return <Tag color="green">Nhập kho</Tag>;
      case 'stock_out':
        return <Tag color="red">Xuất kho</Tag>;
      case 'order_placed':
        return <Tag color="blue">Đặt hàng</Tag>;
      case 'reservation':
        return <Tag color="orange">Đặt trước</Tag>;
      case 'stock_adjustment':
        return <Tag color="purple">Điều chỉnh</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      sorter: (a, b) => a.id.localeCompare(b.id),
      sortOrder: sortedInfo.columnKey === 'id' && sortedInfo.order,
      render: (text) => <Text copyable>{text}</Text>
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      render: (text, record) => (
        <Space>
          <Text>{text}</Text>
          {record.onOrder > 0 && (
            <Tooltip title={`Đang đặt: ${record.onOrder}`}>
              <Tag color="blue">{record.onOrder}</Tag>
            </Tooltip>
          )}
          {record.reserved > 0 && (
            <Tooltip title={`Đã đặt trước: ${record.reserved}`}>
              <Tag color="orange">{record.reserved}</Tag>
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      filters: [
        { text: 'Laptop', value: 'Laptop' },
        { text: 'PC', value: 'PC' },
        { text: 'Màn hình', value: 'Màn hình' },
        { text: 'Phụ kiện', value: 'Phụ kiện' },
        { text: 'Linh kiện', value: 'Linh kiện' }
      ],
      filteredValue: filteredInfo.category || null,
      onFilter: (value, record) => record.category === value,
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: 'Tồn kho',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
      sorter: (a, b) => a.currentStock - b.currentStock,
      sortOrder: sortedInfo.columnKey === 'currentStock' && sortedInfo.order
    },
    {
      title: 'Mức tồn kho',
      key: 'stockLevel',
      width: 150,
      render: (_, record) => renderStockLevel(record.currentStock, record.minStock, record.maxStock)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      filters: [
        { text: 'Còn hàng', value: 'in_stock' },
        { text: 'Sắp hết hàng', value: 'low_stock' },
        { text: 'Hết hàng', value: 'out_of_stock' },
        { text: 'Tồn kho cao', value: 'over_stock' }
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
      render: (status, record) => renderStockStatus(status, record.currentStock, record.minStock, record.maxStock)
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: 150
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      sorter: (a, b) => a.price - b.price,
      sortOrder: sortedInfo.columnKey === 'price' && sortedInfo.order,
      render: (text) => formatCurrency(text)
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 180,
      sorter: (a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated),
      sortOrder: sortedInfo.columnKey === 'lastUpdated' && sortedInfo.order,
      render: (text) => formatDate(text)
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<InfoCircleOutlined />} />
          </Tooltip>
          <Tooltip title="Lịch sử">
            <Button size="small" icon={<HistoryOutlined />} />
          </Tooltip>
          <Tooltip title="Biểu đồ">
            <Button size="small" icon={<AreaChartOutlined />} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="inventory-tracker">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={4}>Theo dõi tồn kho</Title>
            <Text type="secondary">Theo dõi tồn kho theo thời gian thực</Text>
          </div>
          <Space>
            <Button
              type={realTimeUpdates ? 'primary' : 'default'}
              icon={<SyncOutlined spin={realTimeUpdates} />}
              onClick={toggleRealTimeUpdates}
            >
              {realTimeUpdates ? 'Đang cập nhật trực tiếp' : 'Cập nhật trực tiếp'}
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Làm mới
            </Button>
          </Space>
        </div>

        {alertVisible && (
          <Alert
            message="Cảnh báo tồn kho"
            description="Có 2 sản phẩm sắp hết hàng và 1 sản phẩm đã hết hàng. Vui lòng kiểm tra và đặt hàng kịp thời."
            type="warning"
            showIcon
            closable
            onClose={() => setAlertVisible(false)}
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" danger>
                Xem chi tiết
              </Button>
            }
          />
        )}

        {/* Inventory Summary */}
        {inventorySummary && (
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card size="small">
                <Statistic
                  title="Tổng số sản phẩm"
                  value={inventorySummary.totalItems}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card size="small">
                <Statistic
                  title="Tổng giá trị tồn kho"
                  value={inventorySummary.totalValue}
                  formatter={(value) => formatCurrency(value)}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card size="small">
                <Statistic
                  title="Sản phẩm sắp hết hàng"
                  value={inventorySummary.lowStockItems}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card size="small">
                <Statistic
                  title="Sản phẩm hết hàng"
                  value={inventorySummary.outOfStockItems}
                  valueStyle={{ color: '#f5222d' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Search
              placeholder="Tìm kiếm theo mã hoặc tên"
              allowClear
              enterButton
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={12} sm={8}>
            <Select
              placeholder="Lọc theo danh mục"
              style={{ width: '100%' }}
              value={categoryFilter}
              onChange={handleCategoryChange}
            >
              <Option value="all">Tất cả danh mục</Option>
              <Option value="Laptop">Laptop</Option>
              <Option value="PC">PC</Option>
              <Option value="Màn hình">Màn hình</Option>
              <Option value="Phụ kiện">Phụ kiện</Option>
              <Option value="Linh kiện">Linh kiện</Option>
            </Select>
          </Col>
          <Col xs={12} sm={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="in_stock">Còn hàng</Option>
              <Option value="low_stock">Sắp hết hàng</Option>
              <Option value="out_of_stock">Hết hàng</Option>
              <Option value="over_stock">Tồn kho cao</Option>
            </Select>
          </Col>
        </Row>

        {/* Inventory Table */}
        <Table
          columns={columns}
          dataSource={getFilteredItems()}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{ pageSize: 10 }}
          size="middle"
          scroll={{ x: 1300 }}
        />

        <Divider>Hoạt động gần đây</Divider>

        {/* Recent Activities */}
        <List
          size="small"
          bordered
          dataSource={recentActivities}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Space>
                    {renderActivityType(item.type)}
                    <Text strong>{item.itemName}</Text>
                    <Text type="secondary">({item.itemId})</Text>
                  </Space>
                }
                description={
                  <Space>
                    <Text>
                      {item.type === 'stock_adjustment' ? 'Điều chỉnh' : 'Số lượng'}: 
                      <Text strong style={{ marginLeft: 4 }}>
                        {item.type === 'stock_adjustment' && item.quantity > 0 ? '+' : ''}
                        {item.quantity}
                      </Text>
                    </Text>
                    <Text type="secondary">bởi {item.user}</Text>
                    <Text type="secondary">{formatDate(item.timestamp)}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button type="link" icon={<HistoryOutlined />}>
            Xem tất cả hoạt động
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InventoryTracker; 