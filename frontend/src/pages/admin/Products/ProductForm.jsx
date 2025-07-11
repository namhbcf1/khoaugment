import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Divider, 
  Upload, 
  message, 
  Row, 
  Col,
  Switch,
  Tabs,
  Tooltip,
  Breadcrumb,
  Modal
} from 'antd';
import { 
  SaveOutlined, 
  ArrowLeftOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  InfoCircleOutlined,
  UploadOutlined,
  TagOutlined,
  DollarOutlined,
  BarcodeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import TextArea from 'antd/es/input/TextArea';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productData, setProductData] = useState(null);

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
    'Sony',
    'Logitech',
  ];

  // Mock brands
  const brands = [
    'Dell',
    'HP',
    'Asus',
    'Acer',
    'Lenovo',
    'Apple',
    'Samsung',
    'LG',
    'Sony',
    'Logitech',
    'Kingston',
    'Corsair',
    'Microsoft',
    'Intel',
    'AMD',
    'NVIDIA',
  ];

  // Mock product data for editing
  const mockProductData = {
    1: {
      name: 'Laptop Dell Inspiron 15',
      sku: 'DELL-INS-15',
      barcode: '8935236745123',
      category: 'Laptop',
      brand: 'Dell',
      supplier: 'Dell',
      price: 15000000,
      cost: 13000000,
      stock: 25,
      status: 'active',
      images: [
        {
          uid: '-1',
          name: 'dell-inspiron-15.jpg',
          status: 'done',
          url: 'https://via.placeholder.com/300',
        },
      ],
      description: 'Laptop Dell Inspiron 15 với cấu hình mạnh mẽ',
      specifications: {
        cpu: 'Intel Core i5-11300H',
        ram: '8GB DDR4',
        storage: '512GB SSD',
        display: '15.6" Full HD',
        graphics: 'NVIDIA GeForce MX350 2GB',
        os: 'Windows 11 Home',
        weight: '1.8 kg',
      },
      tax: 10,
      warranty: 12,
      featured: true,
      notes: 'Sản phẩm bán chạy',
      meta: {
        title: 'Laptop Dell Inspiron 15 - Trường Phát Computer',
        description: 'Laptop Dell Inspiron 15 với cấu hình mạnh mẽ, giá tốt tại Trường Phát Computer',
        keywords: 'dell, inspiron, laptop, dell inspiron 15',
      },
    },
  };

  // Load product data if editing
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      setLoading(true);
      
      // Simulate API call to fetch product data
      setTimeout(() => {
        const product = mockProductData[id];
        if (product) {
          setProductData(product);
          form.setFieldsValue({
            ...product,
            specifications: JSON.stringify(product.specifications, null, 2),
            meta: {
              title: product.meta.title,
              description: product.meta.description,
              keywords: product.meta.keywords,
            },
          });
          setFileList(product.images || []);
        } else {
          message.error('Không tìm thấy sản phẩm');
          navigate('/admin/products');
        }
        setLoading(false);
      }, 1000);
    }
  }, [id, form, navigate]);

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      // Prepare data for submission
      const formData = {
        ...values,
        images: fileList,
        specifications: values.specifications ? JSON.parse(values.specifications) : {},
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form data submitted:', formData);
      
      message.success(
        isEditing
          ? `Sản phẩm "${values.name}" đã được cập nhật`
          : `Sản phẩm "${values.name}" đã được tạo`
      );
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Handle image preview
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  // Convert file to base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Upload button
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  );

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space direction="vertical" size="small">
                <Breadcrumb
                  items={[
                    {
                      title: <a onClick={() => navigate('/admin/products')}>Sản phẩm</a>,
                    },
                    {
                      title: isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới',
                    },
                  ]}
                />
                <Title level={2}>{isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</Title>
                <Text type="secondary">
                  {isEditing
                    ? 'Cập nhật thông tin sản phẩm'
                    : 'Nhập thông tin chi tiết cho sản phẩm mới'}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/admin/products')}
                >
                  Quay lại
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={loading}
                  onClick={() => form.submit()}
                >
                  {isEditing ? 'Cập nhật' : 'Lưu sản phẩm'}
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            featured: false,
            tax: 10,
            warranty: 12,
          }}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="Thông tin cơ bản" key="basic">
              <Row gutter={24}>
                <Col span={16}>
                  {/* Basic Information */}
                  <Card title="Thông tin sản phẩm" bordered={false}>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="name"
                          label="Tên sản phẩm"
                          rules={[
                            { required: true, message: 'Vui lòng nhập tên sản phẩm' },
                          ]}
                        >
                          <Input placeholder="Nhập tên sản phẩm" />
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          name="sku"
                          label="Mã SKU"
                          rules={[
                            { required: true, message: 'Vui lòng nhập mã SKU' },
                          ]}
                        >
                          <Input placeholder="Nhập mã SKU" />
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          name="barcode"
                          label="Mã vạch"
                        >
                          <Input placeholder="Nhập mã vạch" />
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          name="category"
                          label="Danh mục"
                          rules={[
                            { required: true, message: 'Vui lòng chọn danh mục' },
                          ]}
                        >
                          <Select 
                            placeholder="Chọn danh mục"
                            showSearch
                            allowClear
                            dropdownRender={menu => (
                              <>
                                {menu}
                                <Divider style={{ margin: '8px 0' }} />
                                <Button
                                  type="text"
                                  icon={<PlusOutlined />}
                                  block
                                  onClick={() => message.info('Chức năng thêm danh mục đang được phát triển')}
                                >
                                  Thêm danh mục mới
                                </Button>
                              </>
                            )}
                          >
                            {categories.map(category => (
                              <Option key={category} value={category}>{category}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          name="brand"
                          label="Thương hiệu"
                        >
                          <Select 
                            placeholder="Chọn thương hiệu"
                            showSearch
                            allowClear
                          >
                            {brands.map(brand => (
                              <Option key={brand} value={brand}>{brand}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      
                      <Col span={24}>
                        <Form.Item
                          name="description"
                          label="Mô tả"
                        >
                          <TextArea 
                            rows={4} 
                            placeholder="Nhập mô tả sản phẩm"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                  
                  {/* Pricing Information */}
                  <Card title="Thông tin giá" bordered={false} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name="price"
                          label="Giá bán"
                          rules={[
                            { required: true, message: 'Vui lòng nhập giá bán' },
                          ]}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Nhập giá bán"
                            addonAfter="VNĐ"
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col span={8}>
                        <Form.Item
                          name="cost"
                          label="Giá nhập"
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Nhập giá nhập"
                            addonAfter="VNĐ"
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col span={8}>
                        <Form.Item
                          name="tax"
                          label="Thuế (%)"
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            max={100}
                            placeholder="Nhập % thuế"
                            addonAfter="%"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                  
                  {/* Inventory Information */}
                  <Card title="Thông tin kho hàng" bordered={false} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name="stock"
                          label="Số lượng tồn kho"
                          rules={[
                            { required: true, message: 'Vui lòng nhập số lượng tồn kho' },
                          ]}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder="Nhập số lượng"
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col span={8}>
                        <Form.Item
                          name="supplier"
                          label="Nhà cung cấp"
                        >
                          <Select 
                            placeholder="Chọn nhà cung cấp"
                            showSearch
                            allowClear
                          >
                            {suppliers.map(supplier => (
                              <Option key={supplier} value={supplier}>{supplier}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      
                      <Col span={8}>
                        <Form.Item
                          name="warranty"
                          label="Bảo hành (tháng)"
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder="Số tháng bảo hành"
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          name="status"
                          label="Trạng thái"
                        >
                          <Select placeholder="Chọn trạng thái">
                            <Option value="active">Còn hàng</Option>
                            <Option value="out_of_stock">Hết hàng</Option>
                            <Option value="low_stock">Sắp hết</Option>
                            <Option value="discontinued">Ngừng kinh doanh</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          name="featured"
                          label="Sản phẩm nổi bật"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                
                <Col span={8}>
                  {/* Product Images */}
                  <Card title="Hình ảnh sản phẩm" bordered={false}>
                    <Form.Item name="images" label="Hình ảnh">
                      <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleUploadChange}
                        beforeUpload={() => false} // Prevent auto upload
                        multiple
                      >
                        {fileList.length >= 5 ? null : uploadButton}
                      </Upload>
                    </Form.Item>
                    <Text type="secondary">
                      Tải lên tối đa 5 hình ảnh. Kích thước tối đa: 2MB mỗi ảnh.
                    </Text>
                  </Card>
                  
                  {/* Notes */}
                  <Card title="Ghi chú" bordered={false} style={{ marginTop: 16 }}>
                    <Form.Item name="notes" label="Ghi chú nội bộ">
                      <TextArea rows={4} placeholder="Nhập ghi chú nội bộ về sản phẩm" />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane tab="Thông số kỹ thuật" key="specifications">
              <Card bordered={false}>
                <Form.Item
                  name="specifications"
                  label="Thông số kỹ thuật (JSON)"
                  extra="Nhập thông số kỹ thuật dưới dạng JSON"
                >
                  <TextArea 
                    rows={15} 
                    placeholder='{\n  "cpu": "Intel Core i5",\n  "ram": "8GB DDR4",\n  "storage": "512GB SSD"\n}'
                  />
                </Form.Item>
              </Card>
            </TabPane>
            
            <TabPane tab="SEO & Meta" key="seo">
              <Card bordered={false}>
                <Form.Item
                  name={['meta', 'title']}
                  label="Meta Title"
                >
                  <Input placeholder="Nhập tiêu đề SEO" />
                </Form.Item>
                
                <Form.Item
                  name={['meta', 'description']}
                  label="Meta Description"
                >
                  <TextArea rows={3} placeholder="Nhập mô tả SEO" />
                </Form.Item>
                
                <Form.Item
                  name={['meta', 'keywords']}
                  label="Meta Keywords"
                >
                  <Input placeholder="Nhập từ khóa SEO, cách nhau bởi dấu phẩy" />
                </Form.Item>
              </Card>
            </TabPane>
          </Tabs>
        </Form>
      </Card>

      {/* Image preview modal */}
      <Modal
        open={previewVisible}
        title="Xem trước hình ảnh"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img
          alt="Xem trước"
          style={{ width: '100%' }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default ProductForm; 