import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Button, 
  Space, 
  Upload, 
  message, 
  Tabs, 
  Alert, 
  Progress, 
  Select, 
  Tag,
  Input,
  Form,
  Modal,
  Divider,
  Row, 
  Col,
  InputNumber,
  Tooltip
} from 'antd';
import { 
  UploadOutlined, 
  DownloadOutlined, 
  FileExcelOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  SyncOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Dragger } = Upload;
const { confirm } = Modal;

const BulkOperations = () => {
  const navigate = useNavigate();
  const [importData, setImportData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [importErrors, setImportErrors] = useState([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkEditForm] = Form.useForm();
  const [isBulkEditVisible, setIsBulkEditVisible] = useState(false);
  const [importStep, setImportStep] = useState('upload'); // upload, validate, import
  
  // Mock categories
  const categories = [
    'Laptop',
    'PC',
    'Màn hình',
    'Linh kiện',
    'Phụ kiện',
    'Âm thanh',
    'Thiết bị mạng',
    'Thiết bị văn phòng',
    'Phần mềm',
  ];

  // Mock suppliers
  const suppliers = [
    'Dell',
    'HP',
    'Asus',
    'Acer',
    'Lenovo',
    'Apple',
    'Samsung',
    'LG',
  ];

  // Mock Data
  const mockProducts = [
    {
      key: '1',
      name: 'Laptop Dell Inspiron 15',
      sku: 'DELL-INS-15',
      category: 'Laptop',
      price: 15000000,
      stock: 25,
      status: 'active',
    },
    {
      key: '2',
      name: 'Màn hình Dell 24"',
      sku: 'DELL-MON-24',
      category: 'Màn hình',
      price: 3500000,
      stock: 42,
      status: 'active',
    },
    {
      key: '3',
      name: 'Chuột không dây Logitech',
      sku: 'LOG-MOUSE-01',
      category: 'Phụ kiện',
      price: 450000,
      stock: 78,
      status: 'active',
    },
    {
      key: '4',
      name: 'Bàn phím cơ AKKO',
      sku: 'AKKO-KB-01',
      category: 'Phụ kiện',
      price: 1200000,
      stock: 15,
      status: 'active',
    },
    {
      key: '5',
      name: 'Laptop Acer Nitro 5',
      sku: 'ACER-NIT-5',
      category: 'Laptop',
      price: 22000000,
      stock: 0,
      status: 'out_of_stock',
    },
  ];

  // Handle file import
  const handleFileImport = (file) => {
    // This is just a mock - in a real app we would parse Excel/CSV file
    setUploadStatus('uploading');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('done');
          setImportStep('validate');
          
          // Mock import data
          const data = [
            {
              name: 'Laptop HP Pavilion 15',
              sku: 'HP-PAV-15',
              category: 'Laptop',
              price: '13500000',
              stock: '10',
              status: 'active',
              validationStatus: 'success',
              errors: [],
            },
            {
              name: 'Bàn phím Logitech G Pro',
              sku: 'LOG-KB-PRO',
              category: 'Phụ kiện',
              price: '2300000',
              stock: '15',
              status: 'active',
              validationStatus: 'success',
              errors: [],
            },
            {
              name: 'Chuột Gaming MSI',
              sku: '', // Missing SKU
              category: 'Phụ kiện',
              price: '950000',
              stock: '20',
              status: 'active',
              validationStatus: 'error',
              errors: ['SKU là trường bắt buộc'],
            },
            {
              name: 'Màn hình Asus ROG',
              sku: 'ASUS-MON-ROG',
              category: 'Màn hình',
              price: 'không phải số', // Invalid price
              stock: '8',
              status: 'active',
              validationStatus: 'error',
              errors: ['Giá không hợp lệ'],
            },
            {
              name: 'RAM Corsair 16GB',
              sku: 'CORS-RAM-16',
              category: 'Linh kiện',
              price: '1850000',
              stock: '-5', // Negative stock
              status: 'active',
              validationStatus: 'error',
              errors: ['Số lượng tồn kho không được âm'],
            },
          ];
          
          setImportData(data);
          setImportErrors(data.filter(item => item.validationStatus === 'error'));
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    return false; // Prevent default upload behavior
  };

  // Handle bulk import
  const handleBulkImport = () => {
    setImportStep('import');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Filter out only valid items
          const validItems = importData.filter(item => item.validationStatus === 'success');
          setProcessedData(validItems);
          setImportSuccess(true);
          message.success(`Đã nhập thành công ${validItems.length} sản phẩm`);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  // Handle bulk edit
  const showBulkEditModal = () => {
    if (selectedProducts.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm để chỉnh sửa hàng loạt');
      return;
    }
    
    setIsBulkEditVisible(true);
  };

  const handleBulkEditSubmit = (values) => {
    console.log('Bulk edit values:', values);
    console.log('Selected products:', selectedProducts);
    
    // In a real app, we would update these products via API
    message.success(`Đã cập nhật ${selectedProducts.length} sản phẩm`);
    setIsBulkEditVisible(false);
    bulkEditForm.resetFields();
  };

  // Download template
  const downloadTemplate = () => {
    message.success('Đang tải file mẫu nhập sản phẩm hàng loạt');
    // In a real app, this would download an Excel template
  };

  // Table columns
  const bulkEditColumns = [
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
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}</span>
      )
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color, text;
        switch (status) {
          case 'active':
            color = 'green';
            text = 'Đang bán';
            break;
          case 'out_of_stock':
            color = 'red';
            text = 'Hết hàng';
            break;
          case 'inactive':
            color = 'default';
            text = 'Ngừng bán';
            break;
          default:
            color = 'default';
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
      }
    },
  ];

  const importColumns = [
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
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Kết quả',
      dataIndex: 'validationStatus',
      key: 'validationStatus',
      render: (status, record) => {
        if (status === 'success') {
          return <Tag icon={<CheckCircleOutlined />} color="success">Hợp lệ</Tag>;
        }
        return (
          <Tooltip title={record.errors.join(', ')}>
            <Tag icon={<CloseCircleOutlined />} color="error">Lỗi</Tag>
          </Tooltip>
        );
      }
    },
  ];

  // Row selection config for bulk edit
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedProducts(selectedRows);
    },
  };

  return (
    <div className="bulk-operations">
      <Card>
        <Title level={2}>Thao tác sản phẩm hàng loạt</Title>
        <Paragraph type="secondary">
          Quản lý nhiều sản phẩm cùng lúc: nhập khẩu, xuất khẩu, và chỉnh sửa hàng loạt.
        </Paragraph>

        <Tabs defaultActiveKey="import">
          <TabPane 
            tab={
              <span>
                <UploadOutlined /> Nhập hàng loạt
              </span>
            } 
            key="import"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {importStep === 'upload' && (
                <>
                  <Alert
                    message="Hướng dẫn nhập sản phẩm hàng loạt"
                    description={
                      <ol>
                        <li>Tải xuống file mẫu Excel hoặc CSV</li>
                        <li>Điền thông tin sản phẩm theo mẫu</li>
                        <li>Tải lên file đã điền thông tin</li>
                        <li>Kiểm tra và xác nhận nhập dữ liệu</li>
                      </ol>
                    }
                    type="info"
                    showIcon
                  />
                  
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={downloadTemplate}
                    style={{ marginBottom: 16 }}
                  >
                    Tải file mẫu
                  </Button>
                  
                  <Dragger
                    name="file"
                    multiple={false}
                    beforeUpload={handleFileImport}
                    showUploadList={false}
                    accept=".xlsx,.xls,.csv"
                  >
                    <p className="ant-upload-drag-icon">
                      <FileExcelOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                    </p>
                    <p className="ant-upload-text">Nhấp hoặc kéo file vào khu vực này để tải lên</p>
                    <p className="ant-upload-hint">
                      Hỗ trợ file Excel (.xlsx, .xls) hoặc CSV (.csv)
                    </p>
                  </Dragger>
                  
                  {uploadStatus === 'uploading' && (
                    <Progress percent={progress} status="active" />
                  )}
                </>
              )}

              {importStep === 'validate' && (
                <>
                  <Alert
                    message={`Đã tìm thấy ${importData.length} sản phẩm trong file`}
                    description={
                      <>
                        <p>
                          <CheckCircleOutlined style={{ color: '#52c41a' }} /> Hợp lệ: {importData.filter(item => item.validationStatus === 'success').length} sản phẩm
                        </p>
                        <p>
                          <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Lỗi: {importErrors.length} sản phẩm
                        </p>
                      </>
                    }
                    type="info"
                    showIcon
                  />
                  
                  <Table
                    dataSource={importData}
                    columns={importColumns}
                    rowKey="sku"
                    pagination={{ pageSize: 5 }}
                    style={{ marginTop: 16 }}
                  />
                  
                  <Space style={{ marginTop: 16 }}>
                    <Button onClick={() => setImportStep('upload')}>
                      Tải lại file khác
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleBulkImport}
                      disabled={importData.filter(item => item.validationStatus === 'success').length === 0}
                    >
                      Nhập {importData.filter(item => item.validationStatus === 'success').length} sản phẩm hợp lệ
                    </Button>
                  </Space>
                </>
              )}

              {importStep === 'import' && (
                <>
                  <Progress percent={progress} status="active" />
                  
                  {importSuccess && (
                    <>
                      <Alert
                        message="Nhập dữ liệu thành công"
                        description={`Đã nhập thành công ${processedData.length} sản phẩm vào hệ thống`}
                        type="success"
                        showIcon
                        style={{ marginTop: 16, marginBottom: 16 }}
                      />
                      
                      <Table
                        dataSource={processedData}
                        columns={importColumns.slice(0, -1)}
                        rowKey="sku"
                        pagination={{ pageSize: 5 }}
                      />
                      
                      <Space style={{ marginTop: 16 }}>
                        <Button onClick={() => setImportStep('upload')}>
                          Nhập file khác
                        </Button>
                        <Button type="primary" onClick={() => navigate('/admin/products')}>
                          Xem tất cả sản phẩm
                        </Button>
                      </Space>
                    </>
                  )}
                </>
              )}
            </Space>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <EditOutlined /> Chỉnh sửa hàng loạt
              </span>
            } 
            key="bulkEdit"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Chỉnh sửa nhiều sản phẩm cùng lúc"
                description="Chọn các sản phẩm bạn muốn chỉnh sửa, sau đó cập nhật thông tin cho tất cả sản phẩm đã chọn."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  onClick={showBulkEditModal}
                  disabled={selectedProducts.length === 0}
                  icon={<EditOutlined />}
                >
                  Chỉnh sửa {selectedProducts.length > 0 ? selectedProducts.length : ''} sản phẩm đã chọn
                </Button>
              </div>
              
              <Table
                rowSelection={{
                  type: 'checkbox',
                  ...rowSelection,
                }}
                dataSource={mockProducts}
                columns={bulkEditColumns}
                rowKey="key"
              />
            </Space>
            
            {/* Bulk Edit Modal */}
            <Modal
              title={`Chỉnh sửa hàng loạt (${selectedProducts.length} sản phẩm)`}
              open={isBulkEditVisible}
              onCancel={() => setIsBulkEditVisible(false)}
              footer={[
                <Button key="back" onClick={() => setIsBulkEditVisible(false)}>
                  Hủy
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={() => bulkEditForm.submit()}
                >
                  Cập nhật
                </Button>,
              ]}
              width={700}
            >
              <Alert
                message="Lưu ý"
                description="Chỉ các trường được điền thông tin mới được cập nhật cho các sản phẩm đã chọn."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Form
                form={bulkEditForm}
                layout="vertical"
                onFinish={handleBulkEditSubmit}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="category"
                      label="Danh mục"
                    >
                      <Select placeholder="Chọn danh mục mới" allowClear>
                        {categories.map(category => (
                          <Option key={category} value={category}>{category}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      name="status"
                      label="Trạng thái"
                    >
                      <Select placeholder="Chọn trạng thái mới" allowClear>
                        <Option value="active">Đang bán</Option>
                        <Option value="inactive">Ngừng bán</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      name="supplier"
                      label="Nhà cung cấp"
                    >
                      <Select placeholder="Chọn nhà cung cấp" allowClear>
                        {suppliers.map(supplier => (
                          <Option key={supplier} value={supplier}>{supplier}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      name="tax"
                      label="Thuế (%)"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={100}
                        placeholder="Nhập % thuế mới"
                        addonAfter="%"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Divider />
                  
                  <Col span={12}>
                    <Form.Item
                      name="priceAdjustmentType"
                      label="Điều chỉnh giá"
                    >
                      <Select placeholder="Chọn loại điều chỉnh" allowClear>
                        <Option value="fixed">Giá cố định</Option>
                        <Option value="increase_percentage">Tăng theo %</Option>
                        <Option value="decrease_percentage">Giảm theo %</Option>
                        <Option value="increase_amount">Tăng theo giá trị</Option>
                        <Option value="decrease_amount">Giảm theo giá trị</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      name="priceAdjustmentValue"
                      label="Giá trị điều chỉnh"
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập giá trị"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      name="notes"
                      label="Ghi chú"
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Ghi chú về sự thay đổi này"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <DownloadOutlined /> Xuất dữ liệu
              </span>
            } 
            key="export"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Xuất dữ liệu sản phẩm"
                description="Xuất dữ liệu sản phẩm sang Excel hoặc CSV để sử dụng với các phần mềm khác."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Card title="Tùy chọn xuất dữ liệu">
                <Form layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Định dạng file"
                        name="exportFormat"
                        initialValue="excel"
                      >
                        <Select>
                          <Option value="excel">Excel (.xlsx)</Option>
                          <Option value="csv">CSV (.csv)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        label="Bao gồm"
                        name="exportInclude"
                        initialValue={['all']}
                      >
                        <Select mode="multiple" placeholder="Chọn thông tin để xuất">
                          <Option value="all">Tất cả thông tin</Option>
                          <Option value="basic">Thông tin cơ bản</Option>
                          <Option value="price">Thông tin giá</Option>
                          <Option value="inventory">Thông tin kho hàng</Option>
                          <Option value="metadata">Metadata</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col span={24}>
                      <Form.Item
                        label="Lọc sản phẩm"
                        name="exportFilter"
                      >
                        <Select allowClear placeholder="Xuất tất cả sản phẩm hoặc chọn bộ lọc">
                          <Option value="all">Tất cả sản phẩm</Option>
                          <Option value="active">Chỉ sản phẩm đang bán</Option>
                          <Option value="out_of_stock">Chỉ sản phẩm hết hàng</Option>
                          <Option value="low_stock">Chỉ sản phẩm sắp hết hàng</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Button 
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => message.success('Đang xuất dữ liệu sản phẩm')}
                  >
                    Xuất dữ liệu
                  </Button>
                </Form>
              </Card>
            </Space>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default BulkOperations; 