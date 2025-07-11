import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Table, 
  Tag, 
  Space, 
  Empty, 
  Alert, 
  Spin, 
  Tabs, 
  Tooltip, 
  Divider,
  Modal
} from 'antd';
import { 
  SearchOutlined, 
  PhoneOutlined, 
  BarcodeOutlined, 
  DownloadOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import { api } from '../../services/api';
import { combinedCache } from '../../utils/helpers/cacheUtils';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CustomerLookup = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // Function to calculate warranty status and days remaining
  const calculateWarrantyStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'unknown', text: 'Không xác định' };
    
    const today = dayjs();
    const expiry = dayjs(expiryDate);
    const daysRemaining = expiry.diff(today, 'day');
    
    if (daysRemaining < 0) {
      return { 
        status: 'expired', 
        text: 'Hết hạn', 
        daysText: `Hết hạn ${Math.abs(daysRemaining)} ngày trước`
      };
    } else if (daysRemaining <= 30) {
      return { 
        status: 'expiring', 
        text: 'Sắp hết hạn', 
        daysText: `Còn ${daysRemaining} ngày`
      };
    } else {
      return { 
        status: 'active', 
        text: 'Còn hiệu lực', 
        daysText: `Còn ${daysRemaining} ngày`
      };
    }
  };

  // Handle form submission
  const handleSearch = async (values) => {
    setLoading(true);
    setError(null);
    setSearchResults(null);
    
    try {
      // Check cache first
      const cacheKey = `customer_lookup_${values.searchType}_${values.searchValue}`;
      const cachedResults = await combinedCache.get(cacheKey);
      
      if (cachedResults) {
        setSearchResults(cachedResults);
        setLoading(false);
        return;
      }
      
      // Make API request
      const response = await api.get('/customer/lookup', {
        params: {
          type: values.searchType,
          value: values.searchValue
        }
      });
      
      // Cache the results
      combinedCache.set(cacheKey, response, 300); // Cache for 5 minutes
      
      setSearchResults(response);
    } catch (err) {
      console.error('Error looking up customer information:', err);
      setError(err.message || 'Không thể tìm thấy thông tin. Vui lòng kiểm tra lại số điện thoại hoặc mã đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF download
  const handleDownloadInvoice = async (orderId) => {
    setPdfLoading(true);
    
    try {
      await api.download(
        `/customer/invoice/${orderId}`,
        {},
        `hoa-don-${orderId}.pdf`
      );
    } catch (err) {
      console.error('Error downloading invoice:', err);
      Modal.error({
        title: 'Không thể tải hóa đơn',
        content: 'Đã xảy ra lỗi khi tải hóa đơn. Vui lòng thử lại sau.'
      });
    } finally {
      setPdfLoading(false);
    }
  };

  // Handle invoice preview
  const handlePreviewInvoice = async (orderId) => {
    setPdfLoading(true);
    
    try {
      const response = await api.get(`/customer/invoice/${orderId}/preview`, {
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(response);
      setPreviewImage(url);
      setPreviewVisible(true);
    } catch (err) {
      console.error('Error previewing invoice:', err);
      Modal.error({
        title: 'Không thể xem hóa đơn',
        content: 'Đã xảy ra lỗi khi tải hóa đơn. Vui lòng thử lại sau.'
      });
    } finally {
      setPdfLoading(false);
    }
  };

  // Product columns for table
  const productColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>Mã SN: {record.serial_number}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Ngày mua',
      dataIndex: 'purchase_date',
      key: 'purchase_date',
      render: date => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Bảo hành',
      dataIndex: 'warranty_expiry',
      key: 'warranty',
      render: (date, record) => {
        const warranty = calculateWarrantyStatus(date);
        let color = 'green';
        let icon = <CheckCircleOutlined />;
        
        if (warranty.status === 'expired') {
          color = 'red';
          icon = <ExclamationCircleOutlined />;
        } else if (warranty.status === 'expiring') {
          color = 'orange';
          icon = <ClockCircleOutlined />;
        }
        
        return (
          <div>
            <Tag color={color} icon={icon}>
              {warranty.text}
            </Tag>
            <div style={{ marginTop: '4px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>{warranty.daysText}</Text>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'order_id',
      key: 'order',
      render: (orderId) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => setActiveTab('orders')}
        >
          #{orderId}
        </Button>
      )
    }
  ];

  // Order columns for table
  const orderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: id => <Text strong>#{id}</Text>
    },
    {
      title: 'Ngày mua',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: amount => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'blue';
        if (status === 'completed') color = 'green';
        if (status === 'cancelled') color = 'red';
        
        return <Tag color={color}>{status === 'completed' ? 'Hoàn thành' : status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}</Tag>;
      }
    },
    {
      title: 'Hóa đơn',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem hóa đơn">
            <Button 
              type="text" 
              icon={<FilePdfOutlined />} 
              onClick={() => handlePreviewInvoice(record.id)}
              loading={pdfLoading}
            />
          </Tooltip>
          <Tooltip title="Tải hóa đơn">
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={() => handleDownloadInvoice(record.id)}
              loading={pdfLoading}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2} className="text-center mb-6">Tra cứu sản phẩm & bảo hành</Title>
      
      <Card className="mb-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          initialValues={{ searchType: 'phone' }}
        >
          <Form.Item name="searchType" label="Tìm kiếm theo">
            <Tabs onChange={value => form.setFieldsValue({ searchType: value })}>
              <TabPane 
                tab={<span><PhoneOutlined /> Số điện thoại</span>} 
                key="phone"
              />
              <TabPane 
                tab={<span><BarcodeOutlined /> Mã đơn hàng</span>} 
                key="order"
              />
            </Tabs>
          </Form.Item>
          
          <Form.Item
            name="searchValue"
            label="Nhập thông tin tìm kiếm"
            rules={[
              { required: true, message: 'Vui lòng nhập thông tin tìm kiếm' },
              {
                validator: (_, value) => {
                  const searchType = form.getFieldValue('searchType');
                  
                  if (searchType === 'phone' && value) {
                    // Simple Vietnamese phone number validation
                    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
                    if (!phoneRegex.test(value)) {
                      return Promise.reject('Số điện thoại không hợp lệ');
                    }
                  } else if (searchType === 'order' && value) {
                    // Simple order number validation (alphanumeric)
                    const orderRegex = /^[a-zA-Z0-9-]{3,20}$/;
                    if (!orderRegex.test(value)) {
                      return Promise.reject('Mã đơn hàng không hợp lệ');
                    }
                  }
                  
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input 
              placeholder={form.getFieldValue('searchType') === 'phone' ? 'Nhập số điện thoại' : 'Nhập mã đơn hàng'}
              size="large"
              allowClear
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SearchOutlined />} 
              loading={loading}
              size="large"
              block
            >
              Tra cứu
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      {loading && (
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-4">
            <Text type="secondary">Đang tìm kiếm thông tin...</Text>
          </div>
        </div>
      )}
      
      {error && (
        <Alert
          message="Không tìm thấy thông tin"
          description={error}
          type="error"
          showIcon
          className="mb-6"
        />
      )}
      
      {searchResults && (
        <div>
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <Title level={4}>Thông tin khách hàng</Title>
                <Paragraph>
                  <Text strong>Họ tên:</Text> {searchResults.customer.name}
                </Paragraph>
                <Paragraph>
                  <Text strong>Số điện thoại:</Text> {searchResults.customer.phone}
                </Paragraph>
                {searchResults.customer.email && (
                  <Paragraph>
                    <Text strong>Email:</Text> {searchResults.customer.email}
                  </Paragraph>
                )}
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Text type="secondary">Tổng sản phẩm đã mua: </Text>
                <Text strong>{searchResults.products.length}</Text>
                <br />
                <Text type="secondary">Tổng đơn hàng: </Text>
                <Text strong>{searchResults.orders.length}</Text>
              </div>
            </div>
          </Card>
          
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Sản phẩm & Bảo hành" key="products">
              <Table 
                columns={productColumns} 
                dataSource={searchResults.products.map(item => ({ ...item, key: item.id }))} 
                pagination={{ pageSize: 5 }}
                locale={{ emptyText: 'Không có sản phẩm nào' }}
              />
            </TabPane>
            <TabPane tab="Đơn hàng" key="orders">
              <Table 
                columns={orderColumns} 
                dataSource={searchResults.orders.map(item => ({ ...item, key: item.id }))} 
                pagination={{ pageSize: 5 }}
                locale={{ emptyText: 'Không có đơn hàng nào' }}
              />
            </TabPane>
          </Tabs>
        </div>
      )}
      
      {!loading && !error && !searchResults && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Nhập thông tin để tra cứu sản phẩm và bảo hành"
        />
      )}
      
      <Modal
        visible={previewVisible}
        title="Xem hóa đơn"
        footer={null}
        onCancel={() => {
          setPreviewVisible(false);
          URL.revokeObjectURL(previewImage);
        }}
        width={800}
      >
        <iframe
          src={previewImage}
          style={{ width: '100%', height: '70vh' }}
          title="Invoice Preview"
        />
      </Modal>
    </div>
  );
};

export default CustomerLookup; 