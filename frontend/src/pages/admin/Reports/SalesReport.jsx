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
  Tabs
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// Mock data for sales report
const mockSalesData = {
  summary: {
    totalSales: 458500000,
    comparedToLastPeriod: 12.5,
    totalOrders: 253,
    comparedToLastPeriodOrders: 8.2,
    averageOrderValue: 1812253,
    comparedToLastPeriodAOV: 3.8,
    returnRate: 2.1,
    comparedToLastPeriodReturn: -0.5
  },
  dailySales: [
    { date: '01/07/2023', orders: 12, sales: 22500000, items: 34 },
    { date: '02/07/2023', orders: 18, sales: 35200000, items: 47 },
    { date: '03/07/2023', orders: 15, sales: 28700000, items: 39 },
    { date: '04/07/2023', orders: 22, sales: 41800000, items: 56 },
    { date: '05/07/2023', orders: 16, sales: 30500000, items: 42 },
    { date: '06/07/2023', orders: 14, sales: 26900000, items: 38 },
    { date: '07/07/2023', orders: 25, sales: 48200000, items: 67 },
    { date: '08/07/2023', orders: 17, sales: 32700000, items: 45 },
    { date: '09/07/2023', orders: 19, sales: 36800000, items: 49 },
    { date: '10/07/2023', orders: 21, sales: 40200000, items: 54 },
    { date: '11/07/2023', orders: 16, sales: 31500000, items: 41 },
    { date: '12/07/2023', orders: 24, sales: 46900000, items: 63 },
    { date: '13/07/2023', orders: 13, sales: 25600000, items: 35 },
    { date: '14/07/2023', orders: 20, sales: 38700000, items: 52 }
  ],
  topProducts: [
    { id: 1, name: 'Laptop Dell Inspiron 15', sales: 45700000, quantity: 5, category: 'Laptop' },
    { id: 2, name: 'Màn hình Dell 24"', sales: 32500000, quantity: 13, category: 'Màn hình' },
    { id: 3, name: 'Chuột không dây Logitech', sales: 18600000, quantity: 62, category: 'Phụ kiện' },
    { id: 4, name: 'Laptop Acer Nitro 5', sales: 88000000, quantity: 4, category: 'Laptop' },
    { id: 5, name: 'Bàn phím cơ AKKO', sales: 13200000, quantity: 11, category: 'Phụ kiện' }
  ],
  topCategories: [
    { category: 'Laptop', sales: 185000000, quantity: 21 },
    { category: 'Phụ kiện', sales: 87500000, quantity: 125 },
    { category: 'Màn hình', sales: 65200000, quantity: 28 },
    { category: 'Linh kiện', sales: 48700000, quantity: 39 },
    { category: 'PC', sales: 72100000, quantity: 15 }
  ]
};

const SalesReport = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [reportPeriod, setReportPeriod] = useState('week');
  const [salesData, setSalesData] = useState(null);

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
      setSalesData(mockSalesData);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle reload data
  const handleReload = () => {
    setLoading(true);
    setTimeout(() => {
      setSalesData(mockSalesData);
      setLoading(false);
    }, 1000);
  };

  // Columns for daily sales table
  const dailySalesColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Số đơn hàng',
      dataIndex: 'orders',
      key: 'orders',
      sorter: (a, b) => a.orders - b.orders,
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'items',
      key: 'items',
      sorter: (a, b) => a.items - b.items,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a, b) => a.sales - b.sales,
      render: (text) => formatCurrency(text),
    }
  ];

  // Columns for top products table
  const topProductsColumns = [
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
      title: 'Số lượng bán',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a, b) => a.sales - b.sales,
      render: (text) => formatCurrency(text),
    }
  ];

  // Columns for top categories table
  const topCategoriesColumns = [
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a, b) => a.sales - b.sales,
      render: (text) => formatCurrency(text),
    }
  ];

  return (
    <div className="sales-report">
      <Card loading={loading}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={2} style={{ margin: 0 }}>Báo cáo bán hàng</Title>
          <Space>
            <RangePicker 
              onChange={setDateRange} 
              format="DD/MM/YYYY"
            />
            <Select 
              defaultValue="week" 
              style={{ width: 120 }}
              onChange={setReportPeriod}
            >
              <Option value="today">Hôm nay</Option>
              <Option value="yesterday">Hôm qua</Option>
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
        {salesData && (
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={salesData.summary.totalSales}
                  precision={0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<ArrowUpOutlined />}
                  suffix="VND"
                  formatter={(value) => formatCurrency(value)}
                />
                <div>
                  <Text type={salesData.summary.comparedToLastPeriod > 0 ? 'success' : 'danger'}>
                    {salesData.summary.comparedToLastPeriod > 0 ? '+' : ''}{salesData.summary.comparedToLastPeriod}% so với kỳ trước
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Số đơn hàng"
                  value={salesData.summary.totalOrders}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<ArrowUpOutlined />}
                />
                <div>
                  <Text type={salesData.summary.comparedToLastPeriodOrders > 0 ? 'success' : 'danger'}>
                    {salesData.summary.comparedToLastPeriodOrders > 0 ? '+' : ''}{salesData.summary.comparedToLastPeriodOrders}% so với kỳ trước
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Giá trị trung bình đơn hàng"
                  value={salesData.summary.averageOrderValue}
                  precision={0}
                  valueStyle={{ color: '#722ed1' }}
                  suffix="VND"
                  formatter={(value) => formatCurrency(value)}
                />
                <div>
                  <Text type={salesData.summary.comparedToLastPeriodAOV > 0 ? 'success' : 'danger'}>
                    {salesData.summary.comparedToLastPeriodAOV > 0 ? '+' : ''}{salesData.summary.comparedToLastPeriodAOV}% so với kỳ trước
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ hoàn trả"
                  value={salesData.summary.returnRate}
                  precision={2}
                  valueStyle={{ color: salesData.summary.returnRate > 5 ? '#cf1322' : '#3f8600' }}
                  suffix="%"
                />
                <div>
                  <Text type={salesData.summary.comparedToLastPeriodReturn < 0 ? 'success' : 'danger'}>
                    {salesData.summary.comparedToLastPeriodReturn > 0 ? '+' : ''}{salesData.summary.comparedToLastPeriodReturn}% so với kỳ trước
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        <Divider />

        {/* Detailed Reports Tabs */}
        <Tabs defaultActiveKey="daily">
          <TabPane tab="Doanh thu theo ngày" key="daily">
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Space>
                <Button icon={<FileExcelOutlined />}>Xuất Excel</Button>
                <Button icon={<FilePdfOutlined />}>Xuất PDF</Button>
                <Button type="primary" icon={<DownloadOutlined />}>Tải xuống báo cáo</Button>
              </Space>
            </div>
            <Table
              columns={dailySalesColumns}
              dataSource={salesData?.dailySales || []}
              rowKey="date"
              loading={loading}
              pagination={{ pageSize: 7 }}
              summary={(pageData) => {
                let totalSales = 0;
                let totalOrders = 0;
                let totalItems = 0;
                
                pageData.forEach(({ sales, orders, items }) => {
                  totalSales += sales;
                  totalOrders += orders;
                  totalItems += items;
                });
                
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}><strong>Tổng</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}><strong>{totalOrders}</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}><strong>{totalItems}</strong></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}><strong>{formatCurrency(totalSales)}</strong></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </TabPane>
          <TabPane tab="Top sản phẩm" key="products">
            <Table
              columns={topProductsColumns}
              dataSource={salesData?.topProducts || []}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          <TabPane tab="Top danh mục" key="categories">
            <Table
              columns={topCategoriesColumns}
              dataSource={salesData?.topCategories || []}
              rowKey="category"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SalesReport; 