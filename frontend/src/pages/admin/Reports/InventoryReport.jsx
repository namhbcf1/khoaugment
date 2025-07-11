import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Typography,
  DatePicker,
  Space,
  Select,
  Button,
  Row,
  Col,
  Statistic,
  Divider,
  Tabs,
  Tag,
  Progress,
  Tooltip,
  Alert
} from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InboxOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// Mock data for inventory report
const mockInventoryData = {
  summary: {
    totalItems: 1850,
    totalValue: 3725000000,
    lowStockItems: 34,
    outOfStockItems: 12,
    overStockItems: 27,
    inventoryTurnover: 4.2,
    comparedToLastPeriod: 0.5,
    averageDaysToSell: 86
  },
  inventoryStatus: [
    { status: 'Đủ tồn kho', count: 1777, percentage: 96, color: '#52c41a' },
    { status: 'Sắp hết hàng', count: 34, percentage: 1.8, color: '#faad14' },
    { status: 'Hết hàng', count: 12, percentage: 0.7, color: '#f5222d' },
    { status: 'Tồn kho cao', count: 27, percentage: 1.5, color: '#1890ff' }
  ],
  lowStockItems: [
    { id: 1, sku: 'DELL-INS-15', name: 'Laptop Dell Inspiron 15', category: 'Laptop', stock: 2, minStock: 5, status: 'low_stock', value: 30000000 },
    { id: 2, sku: 'LG-MON-27', name: 'Màn hình LG 27" UltraGear', category: 'Màn hình', stock: 3, minStock: 8, status: 'low_stock', value: 18000000 },
    { id: 3, sku: 'AKKO-KB-01', name: 'Bàn phím cơ AKKO', category: 'Phụ kiện', stock: 4, minStock: 10, status: 'low_stock', value: 4800000 },
    { id: 4, sku: 'SAMSUNG-SSD-1TB', name: 'SSD Samsung 1TB', category: 'Linh kiện', stock: 3, minStock: 15, status: 'low_stock', value: 8400000 },
    { id: 5, sku: 'CORSAIR-RAM-16', name: 'RAM Corsair 16GB DDR4', category: 'Linh kiện', stock: 5, minStock: 12, status: 'low_stock', value: 7500000 }
  ],
  overStockItems: [
    { id: 11, sku: 'HP-MOUSE-01', name: 'Chuột HP Wireless', category: 'Phụ kiện', stock: 145, maxStock: 50, status: 'over_stock', value: 32625000, daysSinceLastSale: 45 },
    { id: 12, sku: 'ADATA-USB-64', name: 'USB ADATA 64GB', category: 'Phụ kiện', stock: 220, maxStock: 100, status: 'over_stock', value: 33000000, daysSinceLastSale: 60 },
    { id: 13, sku: 'FANTECH-HEAD-01', name: 'Tai nghe Fantech', category: 'Phụ kiện', stock: 78, maxStock: 40, status: 'over_stock', value: 31200000, daysSinceLastSale: 30 },
    { id: 14, sku: 'COUGAR-PAD-L', name: 'Lót chuột Cougar', category: 'Phụ kiện', stock: 95, maxStock: 50, status: 'over_stock', value: 8550000, daysSinceLastSale: 75 }
  ],
  mostSoldItems: [
    { id: 21, sku: 'LOGITECH-M185', name: 'Chuột Logitech M185', category: 'Phụ kiện', sold: 120, stock: 45, turnoverRate: 7.2, value: 11250000 },
    { id: 22, sku: 'KINGSTON-SSD-240', name: 'SSD Kingston 240GB', category: 'Linh kiện', sold: 95, stock: 28, turnoverRate: 6.8, value: 14000000 },
    { id: 23, sku: 'DELL-MON-24', name: 'Màn hình Dell 24"', category: 'Màn hình', sold: 82, stock: 15, turnoverRate: 5.5, value: 37500000 },
    { id: 24, sku: 'HP-KB-100', name: 'Bàn phím HP KB100', category: 'Phụ kiện', sold: 78, stock: 32, turnoverRate: 5.2, value: 9600000 },
    { id: 25, sku: 'TP-LINK-WR', name: 'Bộ phát WiFi TP-Link', category: 'Mạng', sold: 65, stock: 22, turnoverRate: 4.3, value: 13200000 }
  ]
};

const InventoryReport = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [reportPeriod, setReportPeriod] = useState('month');
  const [inventoryData, setInventoryData] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Load data on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInventoryData(mockInventoryData);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle reload data
  const handleReload = () => {
    setLoading(true);
    setTimeout(() => {
      setInventoryData(mockInventoryData);
      setLoading(false);
    }, 1000);
  };

  // Render status tag
  const renderStatusTag = (status) => {
    switch (status) {
      case 'out_of_stock':
        return <Tag color="red">Hết hàng</Tag>;
      case 'low_stock':
        return <Tag color="orange">Sắp hết hàng</Tag>;
      case 'over_stock':
        return <Tag color="blue">Tồn kho cao</Tag>;
      default:
        return <Tag color="green">Đủ tồn kho</Tag>;
    }
  };

  // Render stock level with progress bar
  const renderStockLevel = (stock, minStock) => {
    const percentage = minStock > 0 ? Math.min(Math.round((stock / minStock) * 100), 100) : 100;
    let strokeColor = '#52c41a';
    
    if (percentage < 30) {
      strokeColor = '#f5222d';
    } else if (percentage < 70) {
      strokeColor = '#faad14';
    }
    
    return (
      <Tooltip title={`${stock}/${minStock} (${percentage}%)`}>
        <Progress percent={percentage} size="small" strokeColor={strokeColor} />
      </Tooltip>
    );
  };

  // Columns for low stock items table
  const lowStockColumns = [
    {
      title: 'Mã SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: '15%',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: '15%',
    },
    {
      title: 'Tồn kho/Tối thiểu',
      key: 'stock',
      width: '15%',
      render: (text, record) => (
        <Space>
          <Tag color="red">{record.stock}</Tag>
          <span>/</span>
          <Tag>{record.minStock}</Tag>
        </Space>
      ),
    },
    {
      title: 'Mức tồn kho',
      key: 'stockLevel',
      width: '15%',
      render: (text, record) => renderStockLevel(record.stock, record.minStock),
    },
    {
      title: 'Giá trị tồn kho',
      dataIndex: 'value',
      key: 'value',
      width: '15%',
      render: (text) => formatCurrency(text),
    },
  ];

  // Columns for over stock items table
  const overStockColumns = [
    {
      title: 'Mã SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Tồn kho/Tối đa',
      key: 'stock',
      render: (text, record) => (
        <Space>
          <Tag color="blue">{record.stock}</Tag>
          <span>/</span>
          <Tag>{record.maxStock}</Tag>
        </Space>
      ),
    },
    {
      title: 'Giá trị tồn kho',
      dataIndex: 'value',
      key: 'value',
      render: (text) => formatCurrency(text),
    },
    {
      title: 'Ngày từ lần bán cuối',
      dataIndex: 'daysSinceLastSale',
      key: 'daysSinceLastSale',
      render: (days) => (
        <Tag color={days > 60 ? 'red' : days > 30 ? 'orange' : 'green'}>
          {days} ngày
        </Tag>
      ),
    },
  ];

  // Columns for most sold items
  const mostSoldColumns = [
    {
      title: 'Mã SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Số lượng đã bán',
      dataIndex: 'sold',
      key: 'sold',
      sorter: (a, b) => a.sold - b.sold,
    },
    {
      title: 'Tồn kho hiện tại',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Tỷ lệ luân chuyển',
      dataIndex: 'turnoverRate',
      key: 'turnoverRate',
      render: (rate) => `${rate.toFixed(1)}x`,
      sorter: (a, b) => a.turnoverRate - b.turnoverRate,
    },
    {
      title: 'Giá trị tồn kho',
      dataIndex: 'value',
      key: 'value',
      render: (text) => formatCurrency(text),
    },
  ];

  return (
    <div className="inventory-report">
      <Card loading={loading}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0 }}>Báo cáo kho hàng</Title>
          <Space>
            <RangePicker 
              onChange={setDateRange} 
              format="DD/MM/YYYY"
            />
            <Select 
              defaultValue="month" 
              style={{ width: 120 }}
              onChange={setReportPeriod}
            >
              <Option value="week">Tuần này</Option>
              <Option value="month">Tháng này</Option>
              <Option value="quarter">Quý này</Option>
              <Option value="year">Năm nay</Option>
            </Select>
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleReload}>
              Cập nhật
            </Button>
          </Space>
        </div>

        {/* Summary Statistics */}
        {inventoryData && (
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng giá trị tồn kho"
                  value={inventoryData.summary.totalValue}
                  precision={0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<InboxOutlined />}
                  suffix="VND"
                  formatter={(value) => formatCurrency(value)}
                />
                <div>
                  <Text>
                    {inventoryData.summary.totalItems} sản phẩm trong kho
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Sản phẩm sắp hết hàng"
                  value={inventoryData.summary.lowStockItems}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<ExclamationCircleOutlined />}
                />
                <div>
                  <Text>
                    {inventoryData.summary.outOfStockItems} sản phẩm hết hàng
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ luân chuyển kho"
                  value={inventoryData.summary.inventoryTurnover}
                  precision={1}
                  valueStyle={{ color: '#1890ff' }}
                  suffix="x"
                />
                <div>
                  <Text type={inventoryData.summary.comparedToLastPeriod > 0 ? 'success' : 'danger'}>
                    {inventoryData.summary.comparedToLastPeriod > 0 ? '+' : ''}{inventoryData.summary.comparedToLastPeriod}x so với kỳ trước
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Số ngày bán trung bình"
                  value={inventoryData.summary.averageDaysToSell}
                  precision={0}
                  valueStyle={{ color: '#722ed1' }}
                  suffix="ngày"
                />
                <div>
                  <Text type="secondary">
                    Thời gian từ nhập đến bán
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Inventory Status Distribution */}
        {inventoryData && (
          <Card style={{ marginTop: 16 }}>
            <Title level={4}>Phân bố trạng thái kho hàng</Title>
            <Row gutter={16}>
              {inventoryData.inventoryStatus.map(item => (
                <Col xs={24} sm={12} md={6} key={item.status}>
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Statistic
                      title={item.status}
                      value={item.count}
                      valueStyle={{ color: item.color }}
                    />
                    <Progress 
                      percent={item.percentage} 
                      strokeColor={item.color}
                      size="small"
                    />
                    <Text type="secondary">{item.percentage}% tổng số mặt hàng</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        <Divider />

        {/* Detailed Reports Tabs */}
        <Tabs defaultActiveKey="low_stock">
          <TabPane 
            tab={
              <span>
                <WarningOutlined />
                Sản phẩm sắp hết hàng
              </span>
            } 
            key="low_stock"
          >
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16} align="middle">
                <Col>
                  <Select 
                    defaultValue="all" 
                    style={{ width: 150 }}
                    onChange={setCategoryFilter}
                  >
                    <Option value="all">Tất cả danh mục</Option>
                    <Option value="Laptop">Laptop</Option>
                    <Option value="Màn hình">Màn hình</Option>
                    <Option value="Phụ kiện">Phụ kiện</Option>
                    <Option value="Linh kiện">Linh kiện</Option>
                  </Select>
                </Col>
                <Col flex="auto">
                  <Alert 
                    message="Cảnh báo: 5 sản phẩm sắp hết hàng cần được đặt lại ngay lập tức" 
                    type="warning" 
                    showIcon 
                    style={{ marginBottom: 0 }}
                  />
                </Col>
                <Col>
                  <Space>
                    <Button icon={<FileExcelOutlined />}>Xuất Excel</Button>
                    <Button type="primary" icon={<DownloadOutlined />}>Tải báo cáo</Button>
                  </Space>
                </Col>
              </Row>
            </div>
            <Table
              columns={lowStockColumns}
              dataSource={inventoryData?.lowStockItems.filter(item => categoryFilter === 'all' || item.category === categoryFilter) || []}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <ArrowUpOutlined />
                Tồn kho cao
              </span>
            } 
            key="over_stock"
          >
            <div style={{ marginBottom: 16 }}>
              <Alert 
                message="Cảnh báo: Các sản phẩm tồn kho cao có thể ảnh hưởng đến dòng tiền và chi phí lưu kho" 
                type="info" 
                showIcon 
              />
            </div>
            <Table
              columns={overStockColumns}
              dataSource={inventoryData?.overStockItems || []}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <CheckCircleOutlined />
                Sản phẩm bán chạy
              </span>
            } 
            key="most_sold"
          >
            <div style={{ marginBottom: 16 }}>
              <Alert 
                message="Các sản phẩm bán chạy cần được theo dõi kho hàng thường xuyên để đảm bảo luôn đủ hàng" 
                type="success" 
                showIcon 
              />
            </div>
            <Table
              columns={mostSoldColumns}
              dataSource={inventoryData?.mostSoldItems || []}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default InventoryReport; 