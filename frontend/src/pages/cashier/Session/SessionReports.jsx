import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  DatePicker,
  Select,
  Button,
  Row,
  Col,
  Statistic,
  Divider,
  Space,
  Tag,
  Tabs,
  Tooltip,
  Badge,
  Alert,
  Input
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { formatCurrency } from '../../../utils/helpers/formatters';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Search } = Input;

// Mock data for session reports
const mockSessionData = {
  currentSession: {
    id: 'S2023072001',
    cashier: 'Nguyễn Văn A',
    startTime: '2023-07-20 08:00:00',
    endTime: null,
    startAmount: 2000000,
    currentAmount: 5850000,
    expectedAmount: 5850000,
    difference: 0,
    status: 'active',
    orderCount: 18,
    totalSales: 3850000,
    cashSales: 2850000,
    cardSales: 1000000,
    otherSales: 0,
    refunds: 0,
    discounts: 150000
  },
  recentSessions: [
    {
      id: 'S2023071902',
      cashier: 'Nguyễn Văn A',
      startTime: '2023-07-19 14:00:00',
      endTime: '2023-07-19 20:00:00',
      startAmount: 2000000,
      endAmount: 6750000,
      expectedAmount: 6800000,
      difference: -50000,
      status: 'closed',
      orderCount: 25,
      totalSales: 4750000,
      cashSales: 3250000,
      cardSales: 1500000,
      otherSales: 0,
      refunds: 0,
      discounts: 200000
    },
    {
      id: 'S2023071901',
      cashier: 'Trần Thị B',
      startTime: '2023-07-19 08:00:00',
      endTime: '2023-07-19 14:00:00',
      startAmount: 2000000,
      endAmount: 5200000,
      expectedAmount: 5200000,
      difference: 0,
      status: 'closed',
      orderCount: 16,
      totalSales: 3200000,
      cashSales: 2200000,
      cardSales: 1000000,
      otherSales: 0,
      refunds: 0,
      discounts: 120000
    },
    {
      id: 'S2023071802',
      cashier: 'Nguyễn Văn A',
      startTime: '2023-07-18 14:00:00',
      endTime: '2023-07-18 20:00:00',
      startAmount: 2000000,
      endAmount: 7200000,
      expectedAmount: 7150000,
      difference: 50000,
      status: 'closed',
      orderCount: 28,
      totalSales: 5200000,
      cashSales: 3700000,
      cardSales: 1500000,
      otherSales: 0,
      refunds: 0,
      discounts: 250000
    }
  ],
  orders: [
    {
      id: 'ORD2023072001',
      time: '2023-07-20 08:45:12',
      customer: 'Khách lẻ',
      items: 3,
      total: 850000,
      payment: 'cash',
      status: 'completed'
    },
    {
      id: 'ORD2023072002',
      time: '2023-07-20 09:20:35',
      customer: 'Lê Văn C',
      items: 2,
      total: 1200000,
      payment: 'card',
      status: 'completed'
    },
    {
      id: 'ORD2023072003',
      time: '2023-07-20 10:05:48',
      customer: 'Khách lẻ',
      items: 1,
      total: 350000,
      payment: 'cash',
      status: 'completed'
    },
    {
      id: 'ORD2023072004',
      time: '2023-07-20 10:30:22',
      customer: 'Phạm Thị D',
      items: 4,
      total: 1450000,
      payment: 'cash',
      status: 'completed'
    }
  ],
  cashMovements: [
    {
      id: 'CM2023072001',
      time: '2023-07-20 08:00:00',
      type: 'cash_in',
      amount: 2000000,
      reason: 'Tiền đầu ca',
      approvedBy: 'Hoàng Văn E'
    },
    {
      id: 'CM2023072002',
      time: '2023-07-20 08:45:12',
      type: 'cash_in',
      amount: 850000,
      reason: 'Thanh toán đơn hàng ORD2023072001',
      approvedBy: null
    },
    {
      id: 'CM2023072003',
      time: '2023-07-20 10:05:48',
      type: 'cash_in',
      amount: 350000,
      reason: 'Thanh toán đơn hàng ORD2023072003',
      approvedBy: null
    },
    {
      id: 'CM2023072004',
      time: '2023-07-20 10:30:22',
      type: 'cash_in',
      amount: 1450000,
      reason: 'Thanh toán đơn hàng ORD2023072004',
      approvedBy: null
    },
    {
      id: 'CM2023072005',
      time: '2023-07-20 11:15:00',
      type: 'cash_out',
      amount: 500000,
      reason: 'Rút tiền mặt',
      approvedBy: 'Hoàng Văn E'
    }
  ]
};

const SessionReports = () => {
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [dateRange, setDateRange] = useState([dayjs().startOf('week'), dayjs()]);
  const [cashier, setCashier] = useState('all');
  const [sessionStatus, setSessionStatus] = useState('all');

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Load data on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSessionData(mockSessionData);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle reload data
  const handleReload = () => {
    setLoading(true);
    setTimeout(() => {
      setSessionData(mockSessionData);
      setLoading(false);
    }, 1000);
  };

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Handle cashier filter change
  const handleCashierChange = (value) => {
    setCashier(value);
  };

  // Handle session status filter change
  const handleStatusChange = (value) => {
    setSessionStatus(value);
  };

  // Columns for sessions table
  const sessionsColumns = [
    {
      title: 'Mã ca',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Thu ngân',
      dataIndex: 'cashier',
      key: 'cashier',
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text) => formatDate(text),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text) => text ? formatDate(text) : 'Chưa kết thúc',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'active') {
          return <Badge status="processing" text="Đang hoạt động" />;
        } else if (status === 'closed') {
          return <Badge status="success" text="Đã đóng" />;
        }
        return <Badge status="default" text={status} />;
      },
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'orderCount',
      key: 'orderCount',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalSales',
      key: 'totalSales',
      render: (text) => formatCurrency(text),
    },
    {
      title: 'Chênh lệch',
      dataIndex: 'difference',
      key: 'difference',
      render: (text) => {
        const color = text === 0 ? '' : (text > 0 ? '#52c41a' : '#f5222d');
        return (
          <span style={{ color }}>
            {text === 0 ? '0' : `${text > 0 ? '+' : ''}${formatCurrency(text)}`}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<SearchOutlined />}>Chi tiết</Button>
          <Button size="small" icon={<PrinterOutlined />}>In</Button>
        </Space>
      ),
    },
  ];

  // Columns for orders table
  const ordersColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (text) => formatDate(text),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Số mặt hàng',
      dataIndex: 'items',
      key: 'items',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (text) => formatCurrency(text),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'payment',
      key: 'payment',
      render: (payment) => {
        switch (payment) {
          case 'cash':
            return <Tag color="green">Tiền mặt</Tag>;
          case 'card':
            return <Tag color="blue">Thẻ</Tag>;
          default:
            return <Tag>{payment}</Tag>;
        }
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        switch (status) {
          case 'completed':
            return <Badge status="success" text="Hoàn thành" />;
          case 'refunded':
            return <Badge status="warning" text="Hoàn tiền" />;
          case 'cancelled':
            return <Badge status="error" text="Đã hủy" />;
          default:
            return <Badge status="default" text={status} />;
        }
      },
    },
  ];

  // Columns for cash movements table
  const cashMovementsColumns = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (text) => formatDate(text),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        switch (type) {
          case 'cash_in':
            return <Tag color="green">Tiền vào</Tag>;
          case 'cash_out':
            return <Tag color="red">Tiền ra</Tag>;
          default:
            return <Tag>{type}</Tag>;
        }
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => {
        const color = record.type === 'cash_in' ? '#52c41a' : '#f5222d';
        const prefix = record.type === 'cash_in' ? '+' : '-';
        return <span style={{ color }}>{prefix} {formatCurrency(text)}</span>;
      },
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Người duyệt',
      dataIndex: 'approvedBy',
      key: 'approvedBy',
      render: (text) => text || 'N/A',
    },
  ];

  return (
    <div className="session-reports">
      <Card loading={loading}>
        <Title level={2}>Báo cáo ca làm việc</Title>
        <Paragraph type="secondary">
          Xem thông tin chi tiết về ca làm việc, đơn hàng và giao dịch tiền mặt
        </Paragraph>

        {/* Current Session Summary */}
        {sessionData?.currentSession && (
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Ca làm việc hiện tại</span>
                <Badge status="processing" text={sessionData.currentSession.id} />
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Thu ngân"
                  value={sessionData.currentSession.cashier}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Thời gian bắt đầu"
                  value={formatDate(sessionData.currentSession.startTime)}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Số đơn hàng"
                  value={sessionData.currentSession.orderCount}
                  prefix={<ShoppingCartOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Doanh thu"
                  value={sessionData.currentSession.totalSales}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(value)}
                />
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" title="Tiền mặt">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Tiền đầu ca"
                        value={sessionData.currentSession.startAmount}
                        formatter={(value) => formatCurrency(value)}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Tiền hiện tại"
                        value={sessionData.currentSession.currentAmount}
                        formatter={(value) => formatCurrency(value)}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" title="Doanh thu theo phương thức">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Tiền mặt"
                        value={sessionData.currentSession.cashSales}
                        formatter={(value) => formatCurrency(value)}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Thẻ"
                        value={sessionData.currentSession.cardSales}
                        formatter={(value) => formatCurrency(value)}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card size="small" title="Khác">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Giảm giá"
                        value={sessionData.currentSession.discounts}
                        formatter={(value) => formatCurrency(value)}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Hoàn tiền"
                        value={sessionData.currentSession.refunds}
                        formatter={(value) => formatCurrency(value)}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Card>
        )}

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={24} md={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Thời gian:</Text>
                <div>
                  <RangePicker 
                    style={{ width: '100%' }}
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    format="DD/MM/YYYY"
                  />
                </div>
              </div>
            </Col>
            <Col xs={12} sm={12} md={4}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Thu ngân:</Text>
                <div>
                  <Select 
                    style={{ width: '100%' }}
                    value={cashier}
                    onChange={handleCashierChange}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="Nguyễn Văn A">Nguyễn Văn A</Option>
                    <Option value="Trần Thị B">Trần Thị B</Option>
                    <Option value="Lê Văn C">Lê Văn C</Option>
                  </Select>
                </div>
              </div>
            </Col>
            <Col xs={12} sm={12} md={4}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Trạng thái:</Text>
                <div>
                  <Select 
                    style={{ width: '100%' }}
                    value={sessionStatus}
                    onChange={handleStatusChange}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="active">Đang hoạt động</Option>
                    <Option value="closed">Đã đóng</Option>
                  </Select>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
              <Space>
                <Button icon={<SearchOutlined />} onClick={handleReload}>
                  Tìm kiếm
                </Button>
                <Button icon={<FileExcelOutlined />}>
                  Xuất Excel
                </Button>
                <Button icon={<FilePdfOutlined />}>
                  Xuất PDF
                </Button>
                <Button type="primary" icon={<PrinterOutlined />}>
                  In báo cáo
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Detailed Reports Tabs */}
        <Tabs defaultActiveKey="sessions">
          <TabPane 
            tab={
              <span>
                <ClockCircleOutlined /> Ca làm việc
              </span>
            } 
            key="sessions"
          >
            <Table
              columns={sessionsColumns}
              dataSource={sessionData?.recentSessions || []}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <ShoppingCartOutlined /> Đơn hàng
              </span>
            } 
            key="orders"
          >
            <Table
              columns={ordersColumns}
              dataSource={sessionData?.orders || []}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <DollarOutlined /> Giao dịch tiền mặt
              </span>
            } 
            key="cash_movements"
          >
            <Table
              columns={cashMovementsColumns}
              dataSource={sessionData?.cashMovements || []}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
              summary={(pageData) => {
                let totalCashIn = 0;
                let totalCashOut = 0;
                
                pageData.forEach(({ type, amount }) => {
                  if (type === 'cash_in') {
                    totalCashIn += amount;
                  } else if (type === 'cash_out') {
                    totalCashOut += amount;
                  }
                });
                
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <Space direction="vertical">
                        <Text type="success">Tiền vào: {formatCurrency(totalCashIn)}</Text>
                        <Text type="danger">Tiền ra: {formatCurrency(totalCashOut)}</Text>
                        <Divider style={{ margin: '4px 0' }} />
                        <Text strong>Chênh lệch: {formatCurrency(totalCashIn - totalCashOut)}</Text>
                      </Space>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} colSpan={2}></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SessionReports; 