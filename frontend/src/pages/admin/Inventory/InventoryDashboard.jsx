import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Progress,
  Select,
  Badge,
  Tooltip,
  Alert,
  Divider,
  Tabs,
  Empty
} from 'antd';
import { 
  SearchOutlined, 
  InboxOutlined, 
  SyncOutlined, 
  ExclamationCircleOutlined,
  PlusOutlined,
  ExportOutlined,
  ImportOutlined,
  DownloadOutlined,
  FilterOutlined,
  ShoppingOutlined,
  WarningOutlined,
  FileExcelOutlined,
  BarChartOutlined,
  RiseOutlined,
  LineChartOutlined,
  EditOutlined,
  StockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Link } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * Trang Dashboard quản lý kho hàng
 */
const InventoryDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState([]);
  const [stockSummary, setStockSummary] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [stockDistribution, setStockDistribution] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [topMovingItems, setTopMovingItems] = useState([]);

  // Tải dữ liệu mẫu
  useEffect(() => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      const mockData = generateMockData();
      setInventoryData(mockData);
      setFilteredData(mockData);
      setStockSummary(generateSummaryData(mockData));
      setStockDistribution(generateStockDistribution(mockData));
      setLowStockItems(mockData.filter(item => item.stock <= item.lowStockThreshold).slice(0, 5));
      setTopMovingItems(generateTopMovingItems());
      setLoading(false);
    }, 1500);
  }, []);

  // Tạo dữ liệu mẫu
  const generateMockData = () => {
    const categories = ['Laptop', 'PC', 'Màn hình', 'Linh kiện', 'Phụ kiện', 'Âm thanh', 'Gaming'];
    const products = [
      { name: 'Laptop Dell XPS 13', category: 'Laptop', price: 28500000, cost: 24000000 },
      { name: 'Laptop Macbook Air M2', category: 'Laptop', price: 27900000, cost: 23500000 },
      { name: 'PC Gaming Core i7', category: 'PC', price: 25000000, cost: 21000000 },
      { name: 'PC Văn phòng', category: 'PC', price: 12000000, cost: 9500000 },
      { name: 'Màn hình Dell 27"', category: 'Màn hình', price: 5500000, cost: 4300000 },
      { name: 'Màn hình LG Ultrawide', category: 'Màn hình', price: 8900000, cost: 7000000 },
      { name: 'RAM Kingston 16GB', category: 'Linh kiện', price: 1500000, cost: 1200000 },
      { name: 'SSD Samsung 1TB', category: 'Linh kiện', price: 2500000, cost: 1900000 },
      { name: 'Chuột Logitech MX Master', category: 'Phụ kiện', price: 1800000, cost: 1400000 },
      { name: 'Bàn phím cơ Keychron', category: 'Phụ kiện', price: 2200000, cost: 1700000 },
      { name: 'Tai nghe Sony WH-1000XM4', category: 'Âm thanh', price: 5800000, cost: 4500000 },
      { name: 'Loa JBL Flip 6', category: 'Âm thanh', price: 2500000, cost: 1800000 },
      { name: 'Card đồ họa RTX 4060', category: 'Linh kiện', price: 8500000, cost: 7200000 },
      { name: 'Bộ tản nhiệt CPU', category: 'Linh kiện', price: 1200000, cost: 850000 },
      { name: 'Tay cầm Xbox Series', category: 'Gaming', price: 1500000, cost: 1150000 },
    ];

    return products.map((product, index) => {
      const stock = Math.floor(Math.random() * 50);
      const lowStockThreshold = Math.floor(Math.random() * 5) + 3;
      const optimalStock = Math.floor(Math.random() * 20) + 15;
      
      return {
        id: index + 1,
        sku: `SKU-${100 + index}`,
        name: product.name,
        category: product.category,
        stock,
        reserved: Math.floor(Math.random() * 5),
        lowStockThreshold,
        optimalStock,
        price: product.price,
        cost: product.cost,
        value: stock * product.cost,
        status: stock <= 0 ? 'out_of_stock' : stock <= lowStockThreshold ? 'low_stock' : 'in_stock',
        lastUpdated: dayjs().subtract(Math.floor(Math.random() * 30), 'days').format('YYYY-MM-DD'),
        location: `Kệ ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(Math.random() * 20) + 1}`,
        incoming: Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : 0,
      };
    });
  };

  // Tạo dữ liệu tổng hợp
  const generateSummaryData = (data) => {
    const totalItems = data.reduce((acc, item) => acc + item.stock, 0);
    const totalValue = data.reduce((acc, item) => acc + item.value, 0);
    const lowStockCount = data.filter(item => item.status === 'low_stock').length;
    const outOfStockCount = data.filter(item => item.status === 'out_of_stock').length;
    const inStockCount = data.filter(item => item.status === 'in_stock').length;
    
    return {
      totalProducts: data.length,
      totalItems,
      totalValue,
      lowStockCount,
      outOfStockCount,
      inStockCount,
      averageValue: totalValue / totalItems,
    };
  };

  // Tạo dữ liệu phân phối tồn kho
  const generateStockDistribution = (data) => {
    const categories = [...new Set(data.map(item => item.category))];
    
    return categories.map(category => {
      const items = data.filter(item => item.category === category);
      const totalStock = items.reduce((acc, item) => acc + item.stock, 0);
      const totalValue = items.reduce((acc, item) => acc + item.value, 0);
      
      return {
        category,
        items: items.length,
        stock: totalStock,
        value: totalValue,
      };
    }).sort((a, b) => b.value - a.value);
  };

  // Tạo dữ liệu top sản phẩm chuyển động
  const generateTopMovingItems = () => {
    return [
      { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', sold: 24, restocked: 15, turnoverRate: 2.4 },
      { id: 2, name: 'Chuột Logitech MX Master', category: 'Phụ kiện', sold: 42, restocked: 50, turnoverRate: 3.8 },
      { id: 3, name: 'RAM Kingston 16GB', category: 'Linh kiện', sold: 36, restocked: 40, turnoverRate: 3.2 },
      { id: 4, name: 'Tai nghe Sony WH-1000XM4', category: 'Âm thanh', sold: 18, restocked: 20, turnoverRate: 2.2 },
      { id: 5, name: 'SSD Samsung 1TB', category: 'Linh kiện', sold: 32, restocked: 30, turnoverRate: 3.0 },
    ];
  };

  // Xử lý tìm kiếm
  useEffect(() => {
    let result = [...inventoryData];
    
    // Áp dụng tìm kiếm
    if (searchText) {
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
          item.category.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Áp dụng lọc theo danh mục
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    // Áp dụng lọc theo trạng thái tồn kho
    if (stockStatusFilter !== 'all') {
      result = result.filter(item => item.status === stockStatusFilter);
    }
    
    setFilteredData(result);
  }, [searchText, categoryFilter, stockStatusFilter, inventoryData]);

  // Danh sách danh mục unique
  const categories = [...new Set(inventoryData.map(item => item.category))];

  // Cột cho bảng tồn kho
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link onClick={() => navigate(`/admin/inventory/product/${record.id}`)}>
          {text}
        </Link>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: text => <Tag>{text}</Tag>,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a, b) => a.stock - b.stock,
      render: (text, record) => {
        let color;
        if (record.status === 'out_of_stock') {
          color = '#ff4d4f';
        } else if (record.status === 'low_stock') {
          color = '#faad14';
        } else {
          color = '#52c41a';
        }
        
        return (
          <div>
            <Badge color={color} text={text} />
            {record.incoming > 0 && (
              <Tooltip title={`${record.incoming} sắp về`}>
                <Tag color="blue" style={{ marginLeft: 8 }}>+{record.incoming}</Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color, text, icon;
        switch (status) {
          case 'in_stock':
            color = 'success';
            text = 'Còn hàng';
            icon = <CheckCircleOutlined />;
            break;
          case 'low_stock':
            color = 'warning';
            text = 'Sắp hết';
            icon = <ExclamationCircleOutlined />;
            break;
          case 'out_of_stock':
            color = 'error';
            text = 'Hết hàng';
            icon = <CloseCircleOutlined />;
            break;
          default:
            color = 'default';
            text = status;
            icon = null;
        }
        return <Tag color={color} icon={icon}>{text}</Tag>;
      },
    },
    {
      title: 'Tối ưu',
      key: 'stockLevel',
      dataIndex: 'stock',
      render: (text, record) => {
        const percent = Math.min(100, Math.round((record.stock / record.optimalStock) * 100));
        let strokeColor;
        
        if (percent <= 20) {
          strokeColor = '#ff4d4f';
        } else if (percent <= 60) {
          strokeColor = '#faad14';
        } else {
          strokeColor = '#52c41a';
        }
        
        return (
          <Tooltip title={`${record.stock}/${record.optimalStock} (${percent}%)`}>
            <Progress percent={percent} size="small" strokeColor={strokeColor} />
          </Tooltip>
        );
      },
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      sorter: (a, b) => a.value - b.value,
      render: value => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value),
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Cập nhật',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: date => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/inventory/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Cập nhật tồn kho">
            <Button 
              type="text" 
              size="small" 
              icon={<StockOutlined />} 
              onClick={() => console.log('Update stock', record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Cấu hình biểu đồ phân phối tồn kho
  const stockDistributionConfig = {
    data: stockDistribution,
    xField: 'category',
    yField: 'stock',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      category: { alias: 'Danh mục' },
      stock: { alias: 'Tồn kho' },
    },
    color: '#1890ff',
  };

  // Cấu hình biểu đồ giá trị tồn kho theo danh mục
  const stockValueConfig = {
    data: stockDistribution,
    angleField: 'value',
    colorField: 'category',
    radius: 0.8,
    label: {
      type: 'spider',
      content: '{name}\n{percentage}',
      style: {
        fontSize: 12,
      },
    },
    interactions: [{ type: 'element-active' }],
    tooltip: {
      formatter: (datum) => {
        return { name: datum.category, value: formatCurrency(datum.value) };
      },
    },
  };

  // Format tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Cột cho bảng top sản phẩm chuyển động
  const topMovingColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: text => <Tag>{text}</Tag>,
    },
    {
      title: 'Đã bán',
      dataIndex: 'sold',
      key: 'sold',
      align: 'right',
    },
    {
      title: 'Nhập mới',
      dataIndex: 'restocked',
      key: 'restocked',
      align: 'right',
    },
    {
      title: 'Tỉ lệ luân chuyển',
      dataIndex: 'turnoverRate',
      key: 'turnoverRate',
      align: 'right',
      render: rate => <Tag color="blue">{rate}</Tag>,
    },
  ];

  return (
    <div className="inventory-dashboard">
      <Card bordered={false} className="header-card">
        <Row justify="space-between" align="middle" gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Title level={3}>Quản lý kho hàng</Title>
            <Text type="secondary">
              Theo dõi tồn kho và quản lý sản phẩm trong kho
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/inventory/add')}
              >
                Nhập hàng
              </Button>
              <Button icon={<ExportOutlined />}>Xuất hàng</Button>
              <Button icon={<FileExcelOutlined />}>Xuất Excel</Button>
              <Button icon={<SyncOutlined />} loading={loading} onClick={() => setLoading(true)}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={<div><InboxOutlined /> Tổng sản phẩm</div>}
              value={stockSummary.totalProducts}
              suffix={<div style={{ fontSize: '14px' }}>{stockSummary.totalItems} đơn vị</div>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={<div><ShoppingOutlined /> Trạng thái kho</div>}
              value={stockSummary.inStockCount}
              suffix={
                <div style={{ fontSize: '14px' }}>
                  <Badge status="success" text={`${stockSummary.inStockCount} còn hàng`} />
                  <br />
                  <Badge status="warning" text={`${stockSummary.lowStockCount} sắp hết`} />
                  <br />
                  <Badge status="error" text={`${stockSummary.outOfStockCount} hết hàng`} />
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title={<div><RiseOutlined /> Giá trị tồn kho</div>}
              value={stockSummary.totalValue}
              precision={0}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card 
            title={<span><WarningOutlined /> Cảnh báo tồn kho</span>}
            bordered={false}
            loading={loading}
          >
            {lowStockItems.length > 0 ? (
              <Row gutter={[16, 16]}>
                {lowStockItems.map(item => (
                  <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                    <Card size="small" className="warning-card">
                      <div className="warning-card-content">
                        <div>
                          <Text strong>{item.name}</Text>
                          <br />
                          <Text type="secondary">{item.category}</Text>
                        </div>
                        <div>
                          <Tag color={item.status === 'out_of_stock' ? 'error' : 'warning'}>
                            {item.stock} / {item.lowStockThreshold}
                          </Tag>
                          <div style={{ marginTop: 8 }}>
                            <Button size="small" type="primary">
                              Đặt hàng
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
                
                {lowStockItems.length > 0 && (
                  <Col xs={24}>
                    <div style={{ textAlign: 'right', marginTop: 12 }}>
                      <Button type="link">Xem tất cả sản phẩm sắp hết hàng</Button>
                    </div>
                  </Col>
                )}
              </Row>
            ) : (
              <Empty description="Không có cảnh báo tồn kho" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title={<span><BarChartOutlined /> Phân bố tồn kho theo danh mục</span>}
            bordered={false}
            loading={loading}
          >
            <Column {...stockDistributionConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={<span><Pie /> Giá trị tồn kho theo danh mục</span>}
            bordered={false}
            loading={loading}
          >
            <Pie {...stockValueConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card 
            title={<span><LineChartOutlined /> Top sản phẩm chuyển động nhanh</span>}
            bordered={false}
            loading={loading}
          >
            <Table 
              dataSource={topMovingItems} 
              columns={topMovingColumns} 
              pagination={false} 
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card 
            title={<span><InboxOutlined /> Danh sách tồn kho</span>}
            bordered={false}
            loading={loading}
            extra={
              <Space>
                <Button icon={<ImportOutlined />}>Nhập từ Excel</Button>
                <Button icon={<DownloadOutlined />}>Tải Excel mẫu</Button>
              </Space>
            }
          >
            <div style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={8}>
                  <Search
                    placeholder="Tìm kiếm theo tên, SKU..."
                    allowClear
                    enterButton
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col xs={12} md={5}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Lọc theo danh mục"
                    value={categoryFilter}
                    onChange={(value) => setCategoryFilter(value)}
                  >
                    <Option value="all">Tất cả danh mục</Option>
                    {categories.map((category) => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={12} md={5}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Lọc theo trạng thái"
                    value={stockStatusFilter}
                    onChange={(value) => setStockStatusFilter(value)}
                  >
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="in_stock">Còn hàng</Option>
                    <Option value="low_stock">Sắp hết</Option>
                    <Option value="out_of_stock">Hết hàng</Option>
                  </Select>
                </Col>
                <Col xs={24} md={6} style={{ textAlign: 'right' }}>
                  <Space>
                    <Button icon={<FilterOutlined />} onClick={() => {
                      setCategoryFilter('all');
                      setStockStatusFilter('all');
                      setSearchText('');
                    }}>
                      Đặt lại bộ lọc
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InventoryDashboard; 