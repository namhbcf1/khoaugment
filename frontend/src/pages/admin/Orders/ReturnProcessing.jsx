import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Typography, 
  Tag, 
  Space, 
  Drawer, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Steps, 
  message, 
  Popconfirm,
  Statistic,
  Row,
  Col,
  Divider,
  Badge,
  Tooltip,
  Timeline
} from 'antd';
import { 
  ReloadOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  PrinterOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  InboxOutlined,
  RollbackOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const ReturnProcessing = () => {
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const [form] = Form.useForm();

  // Mock data for returns
  const mockReturns = [
    {
      id: 'RET-001',
      orderNumber: 'ORD-12345',
      customer: 'Nguyễn Văn A',
      products: [
        { id: 1, name: 'Laptop Dell Inspiron', quantity: 1, reason: 'Lỗi màn hình', price: 15000000 }
      ],
      totalAmount: 15000000,
      status: 'pending',
      requestDate: '2023-05-15',
      processedBy: null,
      approvalDate: null,
      notes: 'Khách hàng phàn nàn về màn hình bị chớp',
      returnMethod: 'store',
      refundMethod: 'original_payment',
      history: [
        { time: '2023-05-15 10:30', action: 'Yêu cầu hoàn trả được tạo', user: 'Nguyễn Văn A' },
        { time: '2023-05-15 14:45', action: 'Yêu cầu được tiếp nhận', user: 'Hệ thống' }
      ]
    },
    {
      id: 'RET-002',
      orderNumber: 'ORD-12346',
      customer: 'Trần Thị B',
      products: [
        { id: 2, name: 'Tai nghe Sony', quantity: 1, reason: 'Sản phẩm không đúng mô tả', price: 2500000 }
      ],
      totalAmount: 2500000,
      status: 'approved',
      requestDate: '2023-05-10',
      processedBy: 'Lê Văn C',
      approvalDate: '2023-05-12',
      notes: 'Đã kiểm tra và xác nhận sản phẩm không đúng với mô tả',
      returnMethod: 'store',
      refundMethod: 'store_credit',
      history: [
        { time: '2023-05-10 09:15', action: 'Yêu cầu hoàn trả được tạo', user: 'Trần Thị B' },
        { time: '2023-05-11 11:30', action: 'Sản phẩm đã được nhận tại cửa hàng', user: 'Phạm Minh D' },
        { time: '2023-05-12 14:20', action: 'Yêu cầu hoàn trả được chấp nhận', user: 'Lê Văn C' }
      ]
    },
    {
      id: 'RET-003',
      orderNumber: 'ORD-12350',
      customer: 'Lê Văn E',
      products: [
        { id: 3, name: 'Chuột không dây Logitech', quantity: 1, reason: 'Đổi ý', price: 450000 },
        { id: 4, name: 'Bàn phím cơ AKKO', quantity: 1, reason: 'Đổi ý', price: 1200000 }
      ],
      totalAmount: 1650000,
      status: 'completed',
      requestDate: '2023-05-05',
      processedBy: 'Lê Văn C',
      approvalDate: '2023-05-07',
      notes: 'Khách hàng đổi ý trong thời gian cho phép',
      returnMethod: 'shipping',
      refundMethod: 'original_payment',
      history: [
        { time: '2023-05-05 16:45', action: 'Yêu cầu hoàn trả được tạo', user: 'Lê Văn E' },
        { time: '2023-05-06 10:20', action: 'Sản phẩm đã được gửi trả', user: 'Lê Văn E' },
        { time: '2023-05-07 09:30', action: 'Sản phẩm đã được nhận', user: 'Kho' },
        { time: '2023-05-07 14:15', action: 'Yêu cầu hoàn trả được chấp nhận', user: 'Lê Văn C' },
        { time: '2023-05-08 11:00', action: 'Hoàn tiền thành công', user: 'Hệ thống' }
      ]
    },
    {
      id: 'RET-004',
      orderNumber: 'ORD-12355',
      customer: 'Hoàng Thị F',
      products: [
        { id: 5, name: 'Màn hình Dell 24"', quantity: 1, reason: 'Sản phẩm bị lỗi', price: 3500000 }
      ],
      totalAmount: 3500000,
      status: 'rejected',
      requestDate: '2023-05-08',
      processedBy: 'Nguyễn Văn G',
      approvalDate: '2023-05-09',
      notes: 'Sản phẩm đã quá thời gian đổi trả (30 ngày)',
      returnMethod: 'store',
      refundMethod: null,
      history: [
        { time: '2023-05-08 13:30', action: 'Yêu cầu hoàn trả được tạo', user: 'Hoàng Thị F' },
        { time: '2023-05-09 10:45', action: 'Yêu cầu hoàn trả bị từ chối', user: 'Nguyễn Văn G' }
      ]
    }
  ];

  // Simulating API call
  useEffect(() => {
    setTimeout(() => {
      setReturns(mockReturns);
      setFilteredReturns(mockReturns);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter returns based on search text, status, and date range
  useEffect(() => {
    let result = [...returns];
    
    if (searchText) {
      result = result.filter(
        item =>
          item.id.toLowerCase().includes(searchText.toLowerCase()) ||
          item.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
          item.customer.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    if (dateRange && dateRange.length === 2) {
      // Filter by date range (simplified for mock data)
      const [start, end] = dateRange;
      result = result.filter(item => {
        const returnDate = new Date(item.requestDate);
        return returnDate >= start && returnDate <= end;
      });
    }
    
    setFilteredReturns(result);
  }, [searchText, statusFilter, dateRange, returns]);

  const handleViewReturn = (record) => {
    setSelectedReturn(record);
    setDrawerVisible(true);
    form.setFieldsValue({
      status: record.status,
      notes: record.notes || '',
      refundMethod: record.refundMethod || ''
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedReturn(null);
    form.resetFields();
  };

  const handleUpdateReturnStatus = () => {
    form.validateFields().then(values => {
      // In a real app, this would be an API call
      const updatedReturn = {
        ...selectedReturn,
        status: values.status,
        notes: values.notes,
        refundMethod: values.refundMethod,
        processedBy: 'Current User', // Would come from auth context
        approvalDate: new Date().toISOString().split('T')[0]
      };
      
      // Update the returns array
      const updatedReturns = returns.map(item => 
        item.id === selectedReturn.id ? updatedReturn : item
      );
      
      setReturns(updatedReturns);
      setFilteredReturns(updatedReturns);
      message.success(`Cập nhật trạng thái yêu cầu ${selectedReturn.id} thành công!`);
      handleCloseDrawer();
    });
  };

  // Get status tag color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'blue',
      processing: 'purple',
      completed: 'green',
      rejected: 'red',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  // Get status text in Vietnamese
  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xử lý',
      approved: 'Đã phê duyệt',
      processing: 'Đang xử lý',
      completed: 'Hoàn thành',
      rejected: 'Từ chối',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  // Get return method text
  const getReturnMethodText = (method) => {
    const methods = {
      store: 'Tại cửa hàng',
      shipping: 'Gửi qua bưu điện'
    };
    return methods[method] || method;
  };

  // Get refund method text
  const getRefundMethodText = (method) => {
    const methods = {
      original_payment: 'Hoàn tiền theo phương thức thanh toán gốc',
      store_credit: 'Tín dụng cửa hàng',
      exchange: 'Đổi sản phẩm khác'
    };
    return methods[method] || 'Chưa xác định';
  };

  // Table columns
  const columns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'id',
      key: 'id',
      render: text => <a onClick={() => handleViewReturn(returns.find(r => r.id === text))}>{text}</a>
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'orderNumber',
      key: 'orderNumber'
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer'
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      key: 'requestDate',
      sorter: (a, b) => new Date(a.requestDate) - new Date(b.requestDate)
    },
    {
      title: 'Giá trị',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: amount => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            onClick={() => handleViewReturn(record)}
          >
            Chi tiết
          </Button>
        </Space>
      )
    }
  ];

  // Summary statistics
  const returnStats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    completed: returns.filter(r => r.status === 'completed').length,
    rejected: returns.filter(r => r.status === 'rejected').length,
    totalValue: returns.reduce((acc, curr) => acc + curr.totalAmount, 0)
  };

  return (
    <div>
      <Title level={2}>Quản lý đơn hoàn trả</Title>
      
      {/* Summary cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số đơn hoàn trả"
              value={returnStats.total}
              prefix={<InboxOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={returnStats.pending}
              prefix={<SyncOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={returnStats.completed}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng giá trị hoàn trả"
              value={returnStats.totalValue}
              precision={0}
              formatter={value => `${new Intl.NumberFormat('vi-VN').format(value)} VND`}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Filters and actions */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input 
            placeholder="Tìm kiếm theo mã, đơn hàng, khách hàng" 
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={value => setStatusFilter(value)}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="pending">Chờ xử lý</Option>
            <Option value="approved">Đã phê duyệt</Option>
            <Option value="processing">Đang xử lý</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="rejected">Từ chối</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
          <DatePicker.RangePicker 
            onChange={value => setDateRange(value)}
          />
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchText('');
              setStatusFilter('all');
              setDateRange([]);
            }}
          >
            Làm mới
          </Button>
        </Space>
      </Card>
      
      {/* Returns table */}
      <Table 
        columns={columns} 
        dataSource={filteredReturns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50']
        }}
      />
      
      {/* Return detail drawer */}
      <Drawer
        title={`Chi tiết yêu cầu hoàn trả: ${selectedReturn?.id}`}
        placement="right"
        width={720}
        onClose={handleCloseDrawer}
        visible={drawerVisible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseDrawer}>Đóng</Button>
              <Button type="primary" onClick={handleUpdateReturnStatus}>
                Cập nhật
              </Button>
            </Space>
          </div>
        }
      >
        {selectedReturn && (
          <>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div>
                  <Text strong>Mã đơn hàng:</Text> {selectedReturn.orderNumber}
                </div>
                <div>
                  <Text strong>Khách hàng:</Text> {selectedReturn.customer}
                </div>
                <div>
                  <Text strong>Ngày yêu cầu:</Text> {selectedReturn.requestDate}
                </div>
                <div>
                  <Text strong>Phương thức hoàn trả:</Text> {getReturnMethodText(selectedReturn.returnMethod)}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Trạng thái:</Text>{' '}
                  <Tag color={getStatusColor(selectedReturn.status)}>
                    {getStatusText(selectedReturn.status)}
                  </Tag>
                </div>
                {selectedReturn.processedBy && (
                  <div>
                    <Text strong>Người xử lý:</Text> {selectedReturn.processedBy}
                  </div>
                )}
                {selectedReturn.approvalDate && (
                  <div>
                    <Text strong>Ngày xử lý:</Text> {selectedReturn.approvalDate}
                  </div>
                )}
                {selectedReturn.refundMethod && (
                  <div>
                    <Text strong>Phương thức hoàn tiền:</Text> {getRefundMethodText(selectedReturn.refundMethod)}
                  </div>
                )}
              </Col>
            </Row>
            
            <Divider>Sản phẩm hoàn trả</Divider>
            
            <Table
              dataSource={selectedReturn.products}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Sản phẩm',
                  dataIndex: 'name',
                  key: 'name'
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity'
                },
                {
                  title: 'Lý do',
                  dataIndex: 'reason',
                  key: 'reason'
                },
                {
                  title: 'Giá trị',
                  dataIndex: 'price',
                  key: 'price',
                  render: price => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
                }
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={3}><strong>Tổng cộng</strong></Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <Text type="danger" strong>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedReturn.totalAmount)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
            
            <Divider>Cập nhật trạng thái</Divider>
            
            <Form form={form} layout="vertical">
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Option value="pending">Chờ xử lý</Option>
                  <Option value="approved">Đã phê duyệt</Option>
                  <Option value="processing">Đang xử lý</Option>
                  <Option value="completed">Hoàn thành</Option>
                  <Option value="rejected">Từ chối</Option>
                  <Option value="cancelled">Đã hủy</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="refundMethod"
                label="Phương thức hoàn tiền"
              >
                <Select>
                  <Option value="">-- Chọn phương thức --</Option>
                  <Option value="original_payment">Hoàn tiền theo phương thức thanh toán gốc</Option>
                  <Option value="store_credit">Tín dụng cửa hàng</Option>
                  <Option value="exchange">Đổi sản phẩm khác</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="notes"
                label="Ghi chú"
              >
                <TextArea rows={4} />
              </Form.Item>
            </Form>
            
            <Divider>Lịch sử xử lý</Divider>
            
            <Timeline mode="left">
              {selectedReturn.history.map((item, index) => (
                <Timeline.Item key={index} label={item.time}>
                  <p><strong>{item.action}</strong></p>
                  <p>Bởi: {item.user}</p>
                </Timeline.Item>
              ))}
            </Timeline>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default ReturnProcessing; 