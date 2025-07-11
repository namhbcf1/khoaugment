import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Typography, 
  Spin, 
  Alert, 
  Card, 
  Descriptions, 
  Button, 
  Table, 
  Tag, 
  Space,
  Divider,
  Result,
  Steps,
  Timeline,
  Tooltip,
  Modal
} from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  QrcodeOutlined,
  ShoppingOutlined,
  CarOutlined,
  HomeOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { api } from '../../services/api';
import { combinedCache } from '../../utils/helpers/cacheUtils';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const QrLookup = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
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

  // Get order status step
  const getOrderStatusStep = (status) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'completed':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check cache first
        const cacheKey = `order_qr_${id}`;
        const cachedData = await combinedCache.get(cacheKey);
        
        if (cachedData) {
          setOrderData(cachedData);
          setLoading(false);
          return;
        }
        
        // Make API request
        const response = await api.get(`/customer/order/${id}`);
        
        // Cache the results
        combinedCache.set(cacheKey, response, 300); // Cache for 5 minutes
        
        setOrderData(response);
      } catch (err) {
        console.error('Error fetching order data:', err);
        setError(err.message || 'Không thể tìm thấy thông tin đơn hàng. Mã QR không hợp lệ hoặc đã hết hạn.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderData();
  }, [id]);

  // Handle PDF download
  const handleDownloadInvoice = async () => {
    if (!orderData) return;
    
    setPdfLoading(true);
    
    try {
      await api.download(
        `/customer/invoice/${orderData.order.id}`,
        {},
        `hoa-don-${orderData.order.id}.pdf`
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
  const handlePreviewInvoice = async () => {
    if (!orderData) return;
    
    setPdfLoading(true);
    
    try {
      const response = await api.get(`/customer/invoice/${orderData.order.id}/preview`, {
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
          {record.serial_number && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>Mã SN: {record.serial_number}</Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: price => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
    },
    {
      title: 'SL',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center'
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      render: (_, record) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.price * record.quantity)
    },
    {
      title: 'Bảo hành',
      dataIndex: 'warranty_expiry',
      key: 'warranty',
      render: (date, record) => {
        if (!date) return <Text type="secondary">Không bảo hành</Text>;
        
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
    }
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <div className="mt-4">
          <Text type="secondary">Đang tải thông tin đơn hàng...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Không tìm thấy thông tin đơn hàng"
        subTitle={error}
        extra={[
          <Button type="primary" key="lookup">
            <Link to="/customer-lookup">Tra cứu thủ công</Link>
          </Button>
        ]}
      />
    );
  }

  if (!orderData) {
    return null;
  }

  const { order, customer, products } = orderData;
  const orderStatus = order.status || 'pending';
  const orderStep = getOrderStatusStep(orderStatus);

  return (
    <div>
      <Title level={2} className="text-center mb-6">
        <QrcodeOutlined /> Chi tiết đơn hàng
      </Title>
      
      {orderStatus === 'cancelled' ? (
        <Alert
          message="Đơn hàng đã bị hủy"
          description="Đơn hàng này đã bị hủy và không còn hiệu lực."
          type="error"
          showIcon
          className="mb-6"
        />
      ) : (
        <Card className="mb-6">
          <Steps current={orderStep} status={orderStatus === 'cancelled' ? 'error' : 'process'}>
            <Step title="Đặt hàng" description={dayjs(order.created_at).format('DD/MM/YYYY')} />
            <Step title="Xử lý" description="Đang chuẩn bị hàng" />
            <Step title="Vận chuyển" description={order.shipped_at ? dayjs(order.shipped_at).format('DD/MM/YYYY') : 'Chờ giao hàng'} />
            <Step title="Hoàn thành" description={order.completed_at ? dayjs(order.completed_at).format('DD/MM/YYYY') : 'Chờ hoàn thành'} />
          </Steps>
        </Card>
      )}
      
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
          <div className="mb-4 md:mb-0">
            <Title level={4}>Thông tin đơn hàng</Title>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Mã đơn hàng">#{order.id}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">{dayjs(order.created_at).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={
                  orderStatus === 'completed' ? 'green' : 
                  orderStatus === 'cancelled' ? 'red' : 
                  orderStatus === 'shipped' ? 'blue' : 
                  'orange'
                }>
                  {orderStatus === 'completed' ? 'Hoàn thành' : 
                   orderStatus === 'cancelled' ? 'Đã hủy' : 
                   orderStatus === 'shipped' ? 'Đang giao hàng' : 
                   orderStatus === 'processing' ? 'Đang xử lý' : 'Chờ xác nhận'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">{order.payment_method || 'Tiền mặt'}</Descriptions.Item>
            </Descriptions>
          </div>
          
          <div>
            <Title level={4}>Thông tin khách hàng</Title>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Họ tên">{customer.name}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{customer.phone}</Descriptions.Item>
              {customer.email && (
                <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
              )}
              {order.shipping_address && (
                <Descriptions.Item label="Địa chỉ giao hàng">{order.shipping_address}</Descriptions.Item>
              )}
            </Descriptions>
          </div>
        </div>
        
        <Divider />
        
        <Space className="mb-4">
          <Tooltip title="Xem hóa đơn">
            <Button 
              icon={<FilePdfOutlined />} 
              onClick={handlePreviewInvoice}
              loading={pdfLoading}
            >
              Xem hóa đơn
            </Button>
          </Tooltip>
          <Tooltip title="Tải hóa đơn">
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadInvoice}
              loading={pdfLoading}
            >
              Tải hóa đơn
            </Button>
          </Tooltip>
        </Space>
      </Card>
      
      <Card title="Danh sách sản phẩm" className="mb-6">
        <Table 
          columns={productColumns} 
          dataSource={products.map(item => ({ ...item, key: item.id }))} 
          pagination={false}
          summary={pageData => {
            let totalPrice = 0;
            pageData.forEach(({ price, quantity }) => {
              totalPrice += price * quantity;
            });
            
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}><Text strong>Tổng tiền sản phẩm</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={2}>
                    <Text strong>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                {order.shipping_fee > 0 && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}><Text>Phí vận chuyển</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={1} colSpan={2}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.shipping_fee || 0)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                {order.discount > 0 && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}><Text>Giảm giá</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={1} colSpan={2}>
                      - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discount || 0)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}><Text strong>Tổng thanh toán</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={2}>
                    <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      </Card>
      
      <Card title="Lịch sử đơn hàng" className="mb-6">
        <Timeline mode="left">
          <Timeline.Item color="green" label={dayjs(order.created_at).format('DD/MM/YYYY HH:mm')}>
            <Text strong>Đơn hàng được tạo</Text>
            <br />
            <Text type="secondary">Đơn hàng của bạn đã được tiếp nhận</Text>
          </Timeline.Item>
          
          {orderStatus !== 'pending' && (
            <Timeline.Item color="blue" label={dayjs(order.processing_at || order.created_at).add(1, 'hour').format('DD/MM/YYYY HH:mm')}>
              <Text strong>Đang xử lý</Text>
              <br />
              <Text type="secondary">Đơn hàng đang được chuẩn bị</Text>
            </Timeline.Item>
          )}
          
          {(orderStatus === 'shipped' || orderStatus === 'completed') && (
            <Timeline.Item color="blue" label={dayjs(order.shipped_at || order.created_at).add(1, 'day').format('DD/MM/YYYY HH:mm')}>
              <Text strong>Đang giao hàng</Text>
              <br />
              <Text type="secondary">Đơn hàng đang được vận chuyển đến bạn</Text>
            </Timeline.Item>
          )}
          
          {orderStatus === 'completed' && (
            <Timeline.Item color="green" label={dayjs(order.completed_at || order.created_at).add(2, 'day').format('DD/MM/YYYY HH:mm')}>
              <Text strong>Hoàn thành</Text>
              <br />
              <Text type="secondary">Đơn hàng đã được giao thành công</Text>
            </Timeline.Item>
          )}
          
          {orderStatus === 'cancelled' && (
            <Timeline.Item color="red" label={dayjs(order.cancelled_at || order.created_at).add(1, 'hour').format('DD/MM/YYYY HH:mm')}>
              <Text strong>Đã hủy</Text>
              <br />
              <Text type="secondary">Đơn hàng đã bị hủy</Text>
            </Timeline.Item>
          )}
        </Timeline>
      </Card>
      
      <Card title="Hỗ trợ" className="mb-6">
        <Paragraph>
          Nếu bạn có bất kỳ thắc mắc nào về đơn hàng, vui lòng liên hệ với chúng tôi:
        </Paragraph>
        
        <ul className="list-none pl-0">
          <li className="mb-2">
            <PhoneOutlined className="mr-2" /> Hotline: <Text strong>1900 1234</Text> (8:00 - 21:00, cả T7 & CN)
          </li>
          <li>
            <Text type="secondary">Khi liên hệ, vui lòng cung cấp mã đơn hàng: <Text strong>#{order.id}</Text></Text>
          </li>
        </ul>
      </Card>
      
      <div className="text-center">
        <Button type="primary">
          <Link to="/customer-lookup">Tra cứu đơn hàng khác</Link>
        </Button>
      </div>
      
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

export default QrLookup; 