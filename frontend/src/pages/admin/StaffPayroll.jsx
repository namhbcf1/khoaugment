import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Statistic,
  Row,
  Col,
  Tabs,
  Progress,
  Typography,
  Tooltip,
  Popconfirm,
  message,
  Descriptions,
  Divider
} from 'antd';
import {
  DollarOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { PageHeader } from '../../components/ui/DesignSystem';
import { PermissionGuard, PermissionButton } from '../../components/auth/PermissionGuard';
import { PERMISSIONS } from '../../auth/permissions';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const StaffPayroll = () => {
  const [loading, setLoading] = useState(false);
  const [payrollData, setPayrollData] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [activeTab, setActiveTab] = useState('current');
  const [selectedPeriod, setSelectedPeriod] = useState(dayjs().format('YYYY-MM'));
  const [form] = Form.useForm();

  // Mock payroll data
  const mockPayrollData = [
    {
      id: 1,
      staffId: 1,
      staffName: 'Nguyễn Văn An',
      department: 'Kho hàng',
      position: 'Nhân viên kho',
      period: '2024-01',
      baseSalary: 8000000,
      overtime: 500000,
      bonus: 1000000,
      commission: 300000,
      allowances: 200000,
      deductions: 150000,
      tax: 450000,
      insurance: 320000,
      netSalary: 9080000,
      workingDays: 22,
      overtimeHours: 10,
      status: 'paid',
      paidDate: '2024-01-31'
    },
    {
      id: 2,
      staffId: 2,
      staffName: 'Trần Thị Bình',
      department: 'Bán hàng',
      position: 'Thu ngân',
      period: '2024-01',
      baseSalary: 7500000,
      overtime: 300000,
      bonus: 1500000,
      commission: 800000,
      allowances: 150000,
      deductions: 100000,
      tax: 520000,
      insurance: 300000,
      netSalary: 9330000,
      workingDays: 24,
      overtimeHours: 6,
      status: 'pending',
      paidDate: null
    }
  ];

  useEffect(() => {
    loadPayrollData();
  }, [selectedPeriod]);

  const loadPayrollData = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setPayrollData(mockPayrollData.filter(p => p.period === selectedPeriod));
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('Không thể tải dữ liệu lương');
      setLoading(false);
    }
  };

  const handleViewPayroll = (payroll) => {
    setModalType('view');
    setSelectedPayroll(payroll);
    setModalVisible(true);
  };

  const handleEditPayroll = (payroll) => {
    setModalType('edit');
    setSelectedPayroll(payroll);
    form.setFieldsValue(payroll);
    setModalVisible(true);
  };

  const handleCalculatePayroll = async (payrollId) => {
    try {
      // Simulate payroll calculation
      const updatedPayroll = payrollData.map(p => {
        if (p.id === payrollId) {
          const grossSalary = p.baseSalary + p.overtime + p.bonus + p.commission + p.allowances;
          const totalDeductions = p.deductions + p.tax + p.insurance;
          return {
            ...p,
            netSalary: grossSalary - totalDeductions,
            status: 'calculated'
          };
        }
        return p;
      });
      
      setPayrollData(updatedPayroll);
      message.success('Đã tính toán lương thành công');
    } catch (error) {
      message.error('Không thể tính toán lương');
    }
  };

  const handlePaySalary = async (payrollId) => {
    try {
      const updatedPayroll = payrollData.map(p => {
        if (p.id === payrollId) {
          return {
            ...p,
            status: 'paid',
            paidDate: dayjs().format('YYYY-MM-DD')
          };
        }
        return p;
      });
      
      setPayrollData(updatedPayroll);
      message.success('Đã thanh toán lương thành công');
    } catch (error) {
      message.error('Không thể thanh toán lương');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const grossSalary = values.baseSalary + (values.overtime || 0) + (values.bonus || 0) + 
                         (values.commission || 0) + (values.allowances || 0);
      const totalDeductions = (values.deductions || 0) + (values.tax || 0) + (values.insurance || 0);
      const netSalary = grossSalary - totalDeductions;
      
      const updatedPayroll = {
        ...selectedPayroll,
        ...values,
        netSalary
      };
      
      setPayrollData(prev => prev.map(p => 
        p.id === selectedPayroll.id ? updatedPayroll : p
      ));
      
      message.success('Đã cập nhật thông tin lương');
      setModalVisible(false);
    } catch (error) {
      message.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'calculated': return 'blue';
      case 'paid': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'calculated': return 'Đã tính toán';
      case 'paid': return 'Đã thanh toán';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const columns = [
    {
      title: 'Nhân viên',
      key: 'employee',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.staffName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.department} - {record.position}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      key: 'baseSalary',
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => a.baseSalary - b.baseSalary
    },
    {
      title: 'Thưởng & Phụ cấp',
      key: 'bonuses',
      render: (_, record) => {
        const total = (record.overtime || 0) + (record.bonus || 0) + 
                     (record.commission || 0) + (record.allowances || 0);
        return formatCurrency(total);
      },
      sorter: (a, b) => {
        const totalA = (a.overtime || 0) + (a.bonus || 0) + (a.commission || 0) + (a.allowances || 0);
        const totalB = (b.overtime || 0) + (b.bonus || 0) + (b.commission || 0) + (b.allowances || 0);
        return totalA - totalB;
      }
    },
    {
      title: 'Khấu trừ',
      key: 'deductions',
      render: (_, record) => {
        const total = (record.deductions || 0) + (record.tax || 0) + (record.insurance || 0);
        return formatCurrency(total);
      }
    },
    {
      title: 'Lương thực nhận',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => a.netSalary - b.netSalary
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
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
              onClick={() => handleViewPayroll(record)}
            />
          </Tooltip>
          
          <PermissionGuard permission={PERMISSIONS.STAFF_PAYROLL}>
            <Tooltip title="Chỉnh sửa">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEditPayroll(record)}
                disabled={record.status === 'paid'}
              />
            </Tooltip>
          </PermissionGuard>
          
          {record.status === 'pending' && (
            <PermissionGuard permission={PERMISSIONS.STAFF_PAYROLL}>
              <Tooltip title="Tính toán lương">
                <Button 
                  type="text" 
                  icon={<CalculatorOutlined />} 
                  onClick={() => handleCalculatePayroll(record.id)}
                />
              </Tooltip>
            </PermissionGuard>
          )}
          
          {record.status === 'calculated' && (
            <PermissionGuard permission={PERMISSIONS.STAFF_PAYROLL}>
              <Popconfirm
                title="Xác nhận thanh toán lương?"
                onConfirm={() => handlePaySalary(record.id)}
                okText="Thanh toán"
                cancelText="Hủy"
              >
                <Tooltip title="Thanh toán">
                  <Button 
                    type="text" 
                    icon={<CheckCircleOutlined />}
                    style={{ color: '#52c41a' }}
                  />
                </Tooltip>
              </Popconfirm>
            </PermissionGuard>
          )}
        </Space>
      )
    }
  ];

  const renderPayrollDetails = () => {
    if (!selectedPayroll) return null;

    const grossSalary = selectedPayroll.baseSalary + (selectedPayroll.overtime || 0) + 
                       (selectedPayroll.bonus || 0) + (selectedPayroll.commission || 0) + 
                       (selectedPayroll.allowances || 0);
    const totalDeductions = (selectedPayroll.deductions || 0) + (selectedPayroll.tax || 0) + 
                           (selectedPayroll.insurance || 0);

    return (
      <div>
        <Descriptions title="Thông tin nhân viên" bordered size="small">
          <Descriptions.Item label="Họ tên">{selectedPayroll.staffName}</Descriptions.Item>
          <Descriptions.Item label="Phòng ban">{selectedPayroll.department}</Descriptions.Item>
          <Descriptions.Item label="Chức vụ">{selectedPayroll.position}</Descriptions.Item>
          <Descriptions.Item label="Kỳ lương">{selectedPayroll.period}</Descriptions.Item>
          <Descriptions.Item label="Ngày công">{selectedPayroll.workingDays}</Descriptions.Item>
          <Descriptions.Item label="Giờ tăng ca">{selectedPayroll.overtimeHours}</Descriptions.Item>
        </Descriptions>

        <Divider />

        <Row gutter={16}>
          <Col span={12}>
            <Card title="Thu nhập" size="small">
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Lương cơ bản">
                  {formatCurrency(selectedPayroll.baseSalary)}
                </Descriptions.Item>
                <Descriptions.Item label="Tăng ca">
                  {formatCurrency(selectedPayroll.overtime || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Thưởng">
                  {formatCurrency(selectedPayroll.bonus || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Hoa hồng">
                  {formatCurrency(selectedPayroll.commission || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Phụ cấp">
                  {formatCurrency(selectedPayroll.allowances || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng thu nhập">
                  <Text strong>{formatCurrency(grossSalary)}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="Khấu trừ" size="small">
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Khấu trừ khác">
                  {formatCurrency(selectedPayroll.deductions || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Thuế TNCN">
                  {formatCurrency(selectedPayroll.tax || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Bảo hiểm">
                  {formatCurrency(selectedPayroll.insurance || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng khấu trừ">
                  <Text strong>{formatCurrency(totalDeductions)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Lương thực nhận">
                  <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                    {formatCurrency(selectedPayroll.netSalary)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderPayrollForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="baseSalary" label="Lương cơ bản">
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="overtime" label="Tăng ca">
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="bonus" label="Thưởng">
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="commission" label="Hoa hồng">
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="allowances" label="Phụ cấp">
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="deductions" label="Khấu trừ">
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="tax" label="Thuế TNCN">
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="insurance" label="Bảo hiểm">
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Cập nhật
          </Button>
          <Button onClick={() => setModalVisible(false)}>
            Hủy
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  return (
    <div>
      <PageHeader
        title="Quản lý lương"
        subtitle="Tính toán và quản lý lương nhân viên"
        icon="dollar"
        actions={[
          <Select
            key="period"
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            style={{ width: 150 }}
          >
            <Option value="2024-01">Tháng 1/2024</Option>
            <Option value="2024-02">Tháng 2/2024</Option>
            <Option value="2024-03">Tháng 3/2024</Option>
          </Select>,
          <Button key="export" icon={<DownloadOutlined />}>
            Xuất báo cáo
          </Button>
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng chi lương"
                value={payrollData.reduce((acc, p) => acc + p.netSalary, 0)}
                formatter={(value) => formatCurrency(value)}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã thanh toán"
                value={payrollData.filter(p => p.status === 'paid').length}
                suffix={`/ ${payrollData.length}`}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Chờ xử lý"
                value={payrollData.filter(p => p.status === 'pending').length}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Lương trung bình"
                value={payrollData.reduce((acc, p) => acc + p.netSalary, 0) / payrollData.length || 0}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card>
          <Table
            columns={columns}
            dataSource={payrollData}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} bản ghi`
            }}
          />
        </Card>

        {/* Payroll Modal */}
        <Modal
          title={
            modalType === 'view' ? 'Chi tiết bảng lương' : 'Chỉnh sửa bảng lương'
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={modalType === 'view' ? [
            <Button key="close" onClick={() => setModalVisible(false)}>
              Đóng
            </Button>
          ] : null}
          width={800}
        >
          {modalType === 'view' ? renderPayrollDetails() : renderPayrollForm()}
        </Modal>
      </div>
    </div>
  );
};

export default StaffPayroll;
