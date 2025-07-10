import React, { useState, useEffect } from 'react';
import {
  Table, Button, Input, Space, Modal, Form, Select, Card, Row, Col,
  Statistic, Tag, Avatar, Tabs, DatePicker, message, Popconfirm,
  Tooltip, Progress, Alert, Badge, Timeline, Drawer, InputNumber,
  Upload, Typography, Divider, List
} from 'antd';
import {
  InboxOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, ExportOutlined, ImportOutlined, WarningOutlined,
  CheckCircleOutlined, CloseCircleOutlined, SyncOutlined,
  BarcodeOutlined, ShoppingCartOutlined, TruckOutlined,
  AlertOutlined, FileExcelOutlined, PrinterOutlined,
  EyeOutlined, HistoryOutlined, ShopOutlined
} from '@ant-design/icons';
import { Line, Column, Gauge } from '@ant-design/plots';
import { api } from '../services/api';
import dayjs from 'dayjs';
import { MetricCard, PageHeader, ResponsiveTable, LoadingSkeleton } from '../components/ui/DesignSystem';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const Inventory = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({});
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [form] = Form.useForm();
  const [stockForm] = Form.useForm();
  const [supplierForm] = Form.useForm();

  useEffect(() => {
    loadInventoryData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchText, categoryFilter, stockFilter]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadSuppliers(),
        loadCategories(),
        loadInventoryStats(),
        loadLowStockAlerts(),
        loadStockMovements()
      ]);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: { include_inventory: true, limit: 1000 }
      });
      
      if (response.data.success) {
        setProducts(response.data.data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Mock data
      setProducts([
        {
          id: 1,
          name: 'Coca Cola 330ml',
          sku: 'CC-330-001',
          barcode: '8934673123456',
          category: 'Beverages',
          supplier_id: 1,
          supplier_name: 'Coca Cola Vietnam',
          cost_price: 8000,
          selling_price: 12000,
          current_stock: 150,
          reorder_point: 50,
          max_stock: 500,
          unit: 'can',
          status: 'active',
          last_restock: '2024-03-10',
          expiry_date: '2024-12-31'
        },
        {
          id: 2,
          name: 'Bánh mì sandwich',
          sku: 'BM-SW-001',
          barcode: '8934673123457',
          category: 'Food',
          supplier_id: 2,
          supplier_name: 'ABC Bakery',
          cost_price: 15000,
          selling_price: 25000,
          current_stock: 25,
          reorder_point: 30,
          max_stock: 100,
          unit: 'piece',
          status: 'low_stock',
          last_restock: '2024-03-15',
          expiry_date: '2024-03-17'
        },
        {
          id: 3,
          name: 'Mì tôm Hảo Hảo',
          sku: 'MT-HH-001',
          barcode: '8934673123458',
          category: 'Food',
          supplier_id: 3,
          supplier_name: 'Acecook Vietnam',
          cost_price: 3500,
          selling_price: 5000,
          current_stock: 5,
          reorder_point: 20,
          max_stock: 200,
          unit: 'pack',
          status: 'critical',
          last_restock: '2024-03-05',
          expiry_date: '2024-09-30'
        }
      ]);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      
      if (response.data.success) {
        setSuppliers(response.data.data || []);
      }
    } catch (error) {
      // Mock data
      setSuppliers([
        { id: 1, name: 'Coca Cola Vietnam', contact: '0901234567', email: 'contact@cocacola.vn' },
        { id: 2, name: 'ABC Bakery', contact: '0907654321', email: 'order@abcbakery.vn' },
        { id: 3, name: 'Acecook Vietnam', contact: '0912345678', email: 'sales@acecook.vn' }
      ]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      
      if (response.data.success) {
        setCategories(response.data.data.categories || []);
      }
    } catch (error) {
      // Mock data
      setCategories([
        { id: 1, name: 'Beverages' },
        { id: 2, name: 'Food' },
        { id: 3, name: 'Snacks' },
        { id: 4, name: 'Personal Care' }
      ]);
    }
  };

  const loadInventoryStats = async () => {
    try {
      const response = await api.get('/inventory/stats');
      
      if (response.data.success) {
        setInventoryStats(response.data.data);
      }
    } catch (error) {
      // Mock data
      setInventoryStats({
        totalProducts: 156,
        totalValue: 45600000,
        lowStockItems: 12,
        outOfStockItems: 3,
        criticalItems: 5,
        turnoverRate: 4.2,
        stockAccuracy: 98.5,
        reorderAlerts: 8
      });
    }
  };

  const loadLowStockAlerts = async () => {
    try {
      const response = await api.get('/inventory/alerts');
      
      if (response.data.success) {
        setLowStockAlerts(response.data.data || []);
      }
    } catch (error) {
      // Mock data
      setLowStockAlerts([
        { id: 1, product_name: 'Mì tôm Hảo Hảo', current_stock: 5, reorder_point: 20, status: 'critical' },
        { id: 2, product_name: 'Bánh mì sandwich', current_stock: 25, reorder_point: 30, status: 'low' },
        { id: 3, product_name: 'Nước suối', current_stock: 15, reorder_point: 25, status: 'low' }
      ]);
    }
  };

  const loadStockMovements = async () => {
    try {
      const response = await api.get('/inventory/movements', {
        params: { limit: 50 }
      });
      
      if (response.data.success) {
        setStockMovements(response.data.data || []);
      }
    } catch (error) {
      // Mock data
      setStockMovements([
        {
          id: 1,
          product_name: 'Coca Cola 330ml',
          type: 'in',
          quantity: 100,
          reason: 'Purchase Order #PO-001',
          user_name: 'Admin',
          created_at: '2024-03-15T10:30:00'
        },
        {
          id: 2,
          product_name: 'Bánh mì sandwich',
          type: 'out',
          quantity: 5,
          reason: 'Sale Order #ORD-123',
          user_name: 'Cashier',
          created_at: '2024-03-15T14:20:00'
        }
      ]);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchText) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchText.toLowerCase()) ||
        product.barcode?.includes(searchText)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'low':
          filtered = filtered.filter(product => product.status === 'low_stock');
          break;
        case 'critical':
          filtered = filtered.filter(product => product.status === 'critical');
          break;
        case 'out':
          filtered = filtered.filter(product => product.current_stock === 0);
          break;
        case 'normal':
          filtered = filtered.filter(product => product.status === 'active');
          break;
      }
    }

    setFilteredProducts(filtered);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    form.resetFields();
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setShowProductModal(true);
  };

  const handleViewProduct = async (product) => {
    setSelectedProduct(product);
    setShowDetailDrawer(true);
    
    // Load detailed product info
    try {
      const response = await api.get(`/products/${product.id}`, {
        params: { include_movements: true }
      });
      if (response.data.success) {
        setSelectedProduct(response.data.data);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
    }
  };

  const handleStockAdjustment = (product) => {
    setSelectedProduct(product);
    stockForm.resetFields();
    setShowStockModal(true);
  };

  const handleSubmitProduct = async (values) => {
    try {
      setLoading(true);
      
      if (editingProduct) {
        const response = await api.put(`/products/${editingProduct.id}`, values);
        if (response.data.success) {
          message.success('Cập nhật sản phẩm thành công');
          loadProducts();
        }
      } else {
        const response = await api.post('/products', values);
        if (response.data.success) {
          message.success('Tạo sản phẩm thành công');
          loadProducts();
        }
      }
      
      setShowProductModal(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving product:', error);
      message.error('Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleStockSubmit = async (values) => {
    try {
      setLoading(true);
      
      const response = await api.post('/inventory/adjust', {
        product_id: selectedProduct.id,
        ...values
      });
      
      if (response.data.success) {
        message.success('Điều chỉnh tồn kho thành công');
        loadProducts();
        loadStockMovements();
      }
      
      setShowStockModal(false);
      stockForm.resetFields();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      message.error('Có lỗi xảy ra khi điều chỉnh tồn kho');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/products/${productId}`);
      
      if (response.data.success) {
        message.success('Xóa sản phẩm thành công');
        loadProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStockStatus = (product) => {
    if (product.current_stock === 0) return { status: 'error', text: 'Hết hàng' };
    if (product.current_stock <= product.reorder_point * 0.5) return { status: 'error', text: 'Nguy hiểm' };
    if (product.current_stock <= product.reorder_point) return { status: 'warning', text: 'Thấp' };
    return { status: 'success', text: 'Bình thường' };
  };

  const getStockColor = (product) => {
    const status = getStockStatus(product);
    switch (status.status) {
      case 'error': return '#ff4d4f';
      case 'warning': return '#faad14';
      case 'success': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<ShoppingCartOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              SKU: {record.sku}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag>{category}</Tag>,
    },
    {
      title: 'Tồn kho',
      key: 'stock',
      render: (_, record) => {
        const status = getStockStatus(record);
        return (
          <Space>
            <Badge status={status.status} />
            <span style={{ color: getStockColor(record), fontWeight: 'bold' }}>
              {record.current_stock} {record.unit}
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Điểm đặt lại',
      dataIndex: 'reorder_point',
      key: 'reorder_point',
      render: (point, record) => `${point} ${record.unit}`,
    },
    {
      title: 'Giá vốn',
      dataIndex: 'cost_price',
      key: 'cost_price',
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Giá bán',
      dataIndex: 'selling_price',
      key: 'selling_price',
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewProduct(record)}
            />
          </Tooltip>
          <Tooltip title="Điều chỉnh tồn kho">
            <Button
              type="text"
              icon={<SyncOutlined />}
              onClick={() => handleStockAdjustment(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditProduct(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Quản lý kho hàng"
        subtitle="Quản lý tồn kho, nhập xuất hàng và cảnh báo"
        icon="cart"
        actions={[
          <Button key="import" icon={<ImportOutlined />} onClick={() => setShowImportModal(true)}>
            Import
          </Button>,
          <Button key="export" icon={<ExportOutlined />}>
            Export
          </Button>,
          <Button key="print" icon={<PrinterOutlined />}>
            In báo cáo
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleCreateProduct}>
            Thêm sản phẩm
          </Button>
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>

      {/* Inventory Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Tổng sản phẩm"
            value={inventoryStats.totalProducts}
            icon="cart"
            color="primary"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Giá trị tồn kho"
            value={formatCurrency(inventoryStats.totalValue)}
            icon="dollar"
            color="success"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Cảnh báo tồn kho"
            value={inventoryStats.reorderAlerts}
            icon="chart"
            color="warning"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Độ chính xác"
            value={`${inventoryStats.stockAccuracy}%`}
            icon="chart"
            color="success"
            loading={loading}
          />
        </Col>
      </Row>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Alert
          message="Cảnh báo tồn kho thấp"
          description={
            <div>
              <Text>Có {lowStockAlerts.length} sản phẩm cần được nhập thêm hàng:</Text>
              <List
                size="small"
                dataSource={lowStockAlerts.slice(0, 3)}
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      <WarningOutlined style={{ color: item.status === 'critical' ? '#ff4d4f' : '#faad14' }} />
                      <Text>{item.product_name}</Text>
                      <Text type="secondary">
                        Còn {item.current_stock}, cần nhập khi dưới {item.reorder_point}
                      </Text>
                    </Space>
                  </List.Item>
                )}
              />
              {lowStockAlerts.length > 3 && (
                <Text type="secondary">và {lowStockAlerts.length - 3} sản phẩm khác...</Text>
              )}
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Tabs defaultActiveKey="products">
        <TabPane tab="Danh sách sản phẩm" key="products">
          {/* Filters */}
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} lg={6}>
                <Search
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <Select
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  style={{ width: '100%' }}
                  placeholder="Danh mục"
                >
                  <Option value="all">Tất cả danh mục</Option>
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.name}>{cat.name}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <Select
                  value={stockFilter}
                  onChange={setStockFilter}
                  style={{ width: '100%' }}
                  placeholder="Trạng thái tồn kho"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="normal">Bình thường</Option>
                  <Option value="low">Tồn kho thấp</Option>
                  <Option value="critical">Nguy hiểm</Option>
                  <Option value="out">Hết hàng</Option>
                </Select>
              </Col>
              <Col xs={24} sm={24} lg={10}>
                <Space style={{ float: 'right' }}>
                  <Text type="secondary">
                    Hiển thị {filteredProducts.length} / {products.length} sản phẩm
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Products Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={filteredProducts}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} sản phẩm`,
              }}
              rowClassName={(record) => {
                const status = getStockStatus(record);
                return status.status === 'error' ? 'critical-row' :
                       status.status === 'warning' ? 'warning-row' : '';
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Lịch sử nhập xuất" key="movements">
          <Card>
            <Timeline>
              {stockMovements.map((movement) => (
                <Timeline.Item
                  key={movement.id}
                  dot={
                    movement.type === 'in' ?
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  }
                >
                  <div>
                    <Text strong>{movement.product_name}</Text>
                    <div>
                      <Space>
                        <Tag color={movement.type === 'in' ? 'green' : 'red'}>
                          {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                        </Tag>
                        <Text>{movement.reason}</Text>
                      </Space>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {dayjs(movement.created_at).format('DD/MM/YYYY HH:mm')} - {movement.user_name}
                      </Text>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </TabPane>

        <TabPane tab="Nhà cung cấp" key="suppliers">
          <Card>
            <Row gutter={[16, 16]}>
              {suppliers.map((supplier) => (
                <Col xs={24} sm={12} lg={8} key={supplier.id}>
                  <Card
                    size="small"
                    title={supplier.name}
                    extra={
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => {
                          supplierForm.setFieldsValue(supplier);
                          setShowSupplierModal(true);
                        }}
                      />
                    }
                  >
                    <Space direction="vertical" size="small">
                      <Text><TruckOutlined /> {supplier.contact}</Text>
                      <Text>{supplier.email}</Text>
                    </Space>
                  </Card>
                </Col>
              ))}
              <Col xs={24} sm={12} lg={8}>
                <Card
                  size="small"
                  style={{
                    border: '2px dashed #d9d9d9',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    supplierForm.resetFields();
                    setShowSupplierModal(true);
                  }}
                >
                  <div style={{ padding: '20px 0' }}>
                    <PlusOutlined style={{ fontSize: '24px', color: '#d9d9d9' }} />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Thêm nhà cung cấp</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* Product Form Modal */}
      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={showProductModal}
        onCancel={() => setShowProductModal(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitProduct}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sku"
                label="Mã SKU"
                rules={[{ required: true, message: 'Vui lòng nhập mã SKU' }]}
              >
                <Input placeholder="Nhập mã SKU" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="barcode" label="Mã vạch">
                <Input placeholder="Nhập mã vạch" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select placeholder="Chọn danh mục">
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.name}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="supplier_id"
                label="Nhà cung cấp"
                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
              >
                <Select placeholder="Chọn nhà cung cấp">
                  {suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.id}>{supplier.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Đơn vị tính"
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị tính' }]}
              >
                <Input placeholder="VD: cái, hộp, kg..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="cost_price"
                label="Giá vốn"
                rules={[{ required: true, message: 'Vui lòng nhập giá vốn' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="selling_price"
                label="Giá bán"
                rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="current_stock"
                label="Tồn kho hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập tồn kho' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reorder_point"
                label="Điểm đặt hàng lại"
                rules={[{ required: true, message: 'Vui lòng nhập điểm đặt hàng lại' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="max_stock"
                label="Tồn kho tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập tồn kho tối đa' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Mô tả">
                <TextArea placeholder="Nhập mô tả sản phẩm" rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={12}>
              <Button size="large" block onClick={() => setShowProductModal(false)}>
                Hủy
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" size="large" block htmlType="submit" loading={loading}>
                {editingProduct ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        title="Điều chỉnh tồn kho"
        open={showStockModal}
        onCancel={() => setShowStockModal(false)}
        footer={null}
        width={500}
      >
        {selectedProduct && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Text strong>{selectedProduct.name}</Text>
              <div>
                <Text type="secondary">Tồn kho hiện tại: </Text>
                <Text strong>{selectedProduct.current_stock} {selectedProduct.unit}</Text>
              </div>
            </Card>

            <Form
              form={stockForm}
              layout="vertical"
              onFinish={handleStockSubmit}
            >
              <Form.Item
                name="type"
                label="Loại điều chỉnh"
                rules={[{ required: true, message: 'Vui lòng chọn loại điều chỉnh' }]}
              >
                <Select placeholder="Chọn loại điều chỉnh">
                  <Option value="in">Nhập kho</Option>
                  <Option value="out">Xuất kho</Option>
                  <Option value="adjust">Điều chỉnh</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  placeholder="Nhập số lượng"
                />
              </Form.Item>

              <Form.Item
                name="reason"
                label="Lý do"
                rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
              >
                <TextArea placeholder="Nhập lý do điều chỉnh" rows={3} />
              </Form.Item>

              <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={12}>
                  <Button size="large" block onClick={() => setShowStockModal(false)}>
                    Hủy
                  </Button>
                </Col>
                <Col span={12}>
                  <Button type="primary" size="large" block htmlType="submit" loading={loading}>
                    Xác nhận
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        )}
      </Modal>

      {/* Supplier Modal */}
      <Modal
        title="Thông tin nhà cung cấp"
        open={showSupplierModal}
        onCancel={() => setShowSupplierModal(false)}
        footer={null}
        width={500}
      >
        <Form
          form={supplierForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              setLoading(true);
              const response = await api.post('/suppliers', values);
              if (response.data.success) {
                message.success('Lưu nhà cung cấp thành công');
                loadSuppliers();
                setShowSupplierModal(false);
              }
            } catch (error) {
              message.error('Có lỗi xảy ra');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Form.Item
            name="name"
            label="Tên nhà cung cấp"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <Form.Item
            name="contact"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <TextArea placeholder="Nhập địa chỉ" rows={3} />
          </Form.Item>

          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={12}>
              <Button size="large" block onClick={() => setShowSupplierModal(false)}>
                Hủy
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" size="large" block htmlType="submit" loading={loading}>
                Lưu
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Product Detail Drawer */}
      <Drawer
        title="Chi tiết sản phẩm"
        placement="right"
        onClose={() => setShowDetailDrawer(false)}
        open={showDetailDrawer}
        width={600}
      >
        {selectedProduct && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <Row align="middle" gutter={16}>
                <Col>
                  <Avatar size={64} icon={<ShoppingCartOutlined />} />
                </Col>
                <Col flex={1}>
                  <Title level={4} style={{ margin: 0 }}>
                    {selectedProduct.name}
                  </Title>
                  <Space>
                    <Tag>{selectedProduct.category}</Tag>
                    <Text type="secondary">SKU: {selectedProduct.sku}</Text>
                  </Space>
                </Col>
              </Row>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Thông tin cơ bản</Text>
                    <div>Mã vạch: <Text strong>{selectedProduct.barcode}</Text></div>
                    <div>Đơn vị: <Text strong>{selectedProduct.unit}</Text></div>
                    <div>Nhà cung cấp: <Text strong>{selectedProduct.supplier_name}</Text></div>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Giá cả</Text>
                    <div>Giá vốn: <Text strong>{formatCurrency(selectedProduct.cost_price)}</Text></div>
                    <div>Giá bán: <Text strong>{formatCurrency(selectedProduct.selling_price)}</Text></div>
                    <div>Lợi nhuận: <Text strong style={{ color: '#52c41a' }}>
                      {formatCurrency(selectedProduct.selling_price - selectedProduct.cost_price)}
                    </Text></div>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Card title="Thông tin tồn kho" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Statistic
                    title="Tồn kho hiện tại"
                    value={selectedProduct.current_stock}
                    suffix={selectedProduct.unit}
                    valueStyle={{ color: getStockColor(selectedProduct) }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Điểm đặt lại"
                    value={selectedProduct.reorder_point}
                    suffix={selectedProduct.unit}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Tồn kho tối đa"
                    value={selectedProduct.max_stock}
                    suffix={selectedProduct.unit}
                  />
                </Col>
              </Row>

              <div style={{ marginTop: 16 }}>
                <Progress
                  percent={(selectedProduct.current_stock / selectedProduct.max_stock) * 100}
                  strokeColor={getStockColor(selectedProduct)}
                  format={() => `${selectedProduct.current_stock}/${selectedProduct.max_stock}`}
                />
              </div>
            </Card>

            <Card title="Lịch sử giao dịch gần đây">
              <Timeline size="small">
                {(selectedProduct.recent_movements || []).map((movement, index) => (
                  <Timeline.Item
                    key={index}
                    dot={
                      movement.type === 'in' ?
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    }
                  >
                    <div>
                      <Space>
                        <Tag color={movement.type === 'in' ? 'green' : 'red'}>
                          {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                        </Tag>
                        <Text>{movement.reason}</Text>
                      </Space>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {dayjs(movement.created_at).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        )}
      </Drawer>

      {/* Import Modal */}
      <Modal
        title="Import sản phẩm từ Excel"
        open={showImportModal}
        onCancel={() => setShowImportModal(false)}
        footer={null}
        width={600}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Dragger
            name="file"
            multiple={false}
            accept=".xlsx,.xls"
            beforeUpload={() => false}
            onChange={(info) => {
              console.log('File selected:', info.file);
            }}
          >
            <p className="ant-upload-drag-icon">
              <FileExcelOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
            </p>
            <p className="ant-upload-text">Kéo thả file Excel vào đây hoặc click để chọn</p>
            <p className="ant-upload-hint">
              Hỗ trợ file .xlsx và .xls. Tải template mẫu để biết định dạng.
            </p>
          </Dragger>

          <div style={{ marginTop: 16 }}>
            <Button icon={<FileExcelOutlined />}>
              Tải template mẫu
            </Button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .critical-row {
          background-color: #fff2f0 !important;
        }
        .warning-row {
          background-color: #fffbe6 !important;
        }
      `}</style>
      </div>
    </div>
  );
};

export default Inventory;
