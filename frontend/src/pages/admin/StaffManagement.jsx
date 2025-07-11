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
  Switch,
  Statistic,
  Row,
  Col,
  Tabs,
  Progress,
  Typography,
  Tooltip,
  Popconfirm,
  message
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  CalendarOutlined,
  DollarOutlined,
  TrophyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { PageHeader } from '../../components/ui/DesignSystem';
import { PermissionGuard, PermissionButton } from '../../components/auth/PermissionGuard';
import { PERMISSIONS } from '../../auth/permissions';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const StaffManagement = () => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create'); // create, edit, view
  const [activeTab, setActiveTab] = useState('list');
  const [form] = Form.useForm();

  // Mock data - in real app, this would come from API
  const mockStaffData = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@khochuan.com',
      phone: '0123456789',
      role: 'staff',
      department: 'Kho hàng',
      position: 'Nhân viên kho',
      status: 'active',
      joinDate: '2024-01-15',
      avatar: null,
      salary: 8000000,
      performance: 85,
      totalSales: 150000000,
      ordersProcessed: 245,
      achievements: ['Nhân viên xuất sắc', 'Top seller']
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      email: 'binh.tran@khochuan.com',
      phone: '0987654321',
      role: 'cashier',
      department: 'Bán hàng',
      position: 'Thu ngân',
      status: 'active',
      joinDate: '2024-02-01',
      avatar: null,
      salary: 7500000,
      performance: 92,
      totalSales: 200000000,
      ordersProcessed: 380,
      achievements: ['Nhân viên tháng', 'Dịch vụ tốt nhất']
    }
  ];

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setStaffList(mockStaffData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('Không thể tải dữ liệu nhân viên');
      setLoading(false);
    }
  };

  const handleCreateStaff = () => {
    setModalType('create');
    setSelectedStaff(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditStaff = (staff) => {
    setModalType('edit');
    setSelectedStaff(staff);
    form.setFieldsValue({
      ...staff,
      joinDate: dayjs(staff.joinDate)
    });
    setModalVisible(true);
  };

  const handleViewStaff = (staff) => {
    setModalType('view');
    setSelectedStaff(staff);
    setModalVisible(true);
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      // Simulate API call
      setStaffList(prev => prev.filter(staff => staff.id !== staffId));
      message.success('Đã xóa nhân viên thành công');
    } catch (error) {
      message.error('Không thể xóa nhân viên');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      if (modalType === 'create') {
        const newStaff = {
          id: Date.now(),
          ...values,
          joinDate: values.joinDate.format('YYYY-MM-DD'),
          status: 'active',
          performance: 0,
          totalSales: 0,
          ordersProcessed: 0,
          achievements: []
        };
        setStaffList(prev => [...prev, newStaff]);
        message.success('Đã thêm nhân viên thành công');
      } else if (modalType === 'edit') {
        const updatedStaff = {
          ...selectedStaff,
          ...values,
          joinDate: values.joinDate.format('YYYY-MM-DD')
        };
        setStaffList(prev => prev.map(staff => 
          staff.id === selectedStaff.id ? updatedStaff : staff
        ));
        message.success('Đã cập nhật nhân viên thành công');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'on_leave': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang làm việc';
      case 'inactive': return 'Nghỉ việc';
      case 'on_leave': return 'Nghỉ phép';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      key: 'employee',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserAddOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleMap = {
          admin: { text: 'Quản trị viên', color: 'red' },
          cashier: { text: 'Thu ngân', color: 'blue' },
          staff: { text: 'Nhân viên', color: 'green' }
        };
        const roleInfo = roleMap[role] || { text: role, color: 'default' };
        return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
      }
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: 'Hiệu suất',
      dataIndex: 'performance',
      key: 'performance',
      render: (performance) => (
        <Progress 
          percent={performance} 
          size="small" 
          strokeColor={performance >= 80 ? '#52c41a' : performance >= 60 ? '#faad14' : '#ff4d4f'}
        />
      )
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
      title: 'Ngày vào làm',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
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
              onClick={() => handleViewStaff(record)}
            />
          </Tooltip>
          
          <PermissionGuard permission={PERMISSIONS.STAFF_UPDATE}>
            <Tooltip title="Chỉnh sửa">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEditStaff(record)}
              />
            </Tooltip>
          </PermissionGuard>
          
          <PermissionGuard permission={PERMISSIONS.STAFF_DELETE}>
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa nhân viên này?"
              onConfirm={() => handleDeleteStaff(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa">
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </PermissionGuard>
        </Space>
      )
    }
  ];

  const renderStaffForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      disabled={modalType === 'view'}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="staff">Nhân viên</Option>
              <Option value="cashier">Thu ngân</Option>
              <Option value="admin">Quản trị viên</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="department"
            label="Phòng ban"
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
          >
            <Select placeholder="Chọn phòng ban">
              <Option value="Bán hàng">Bán hàng</Option>
              <Option value="Kho hàng">Kho hàng</Option>
              <Option value="Kế toán">Kế toán</Option>
              <Option value="Marketing">Marketing</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="position"
            label="Chức vụ"
            rules={[{ required: true, message: 'Vui lòng nhập chức vụ' }]}
          >
            <Input placeholder="Nhập chức vụ" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="joinDate"
            label="Ngày vào làm"
            rules={[{ required: true, message: 'Vui lòng chọn ngày vào làm' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="salary"
            label="Lương cơ bản"
          >
            <Input 
              type="number" 
              placeholder="Nhập lương cơ bản" 
              addonAfter="VND"
            />
          </Form.Item>
        </Col>
      </Row>

      {modalType !== 'view' && (
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {modalType === 'create' ? 'Thêm nhân viên' : 'Cập nhật'}
            </Button>
            <Button onClick={() => setModalVisible(false)}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      )}
    </Form>
  );

  return (
    <div>
      <PageHeader
        title="Quản lý nhân viên"
        subtitle="Quản lý thông tin và hiệu suất nhân viên"
        icon="user"
        actions={[
          <PermissionButton
            key="create"
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleCreateStaff}
            permission={PERMISSIONS.STAFF_CREATE}
          >
            Thêm nhân viên
          </PermissionButton>,
          <Button key="export" icon={<DownloadOutlined />}>
            Xuất Excel
          </Button>
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng nhân viên"
                value={staffList.length}
                prefix={<UserAddOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đang làm việc"
                value={staffList.filter(s => s.status === 'active').length}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Hiệu suất trung bình"
                value={staffList.reduce((acc, s) => acc + s.performance, 0) / staffList.length || 0}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng doanh số"
                value={staffList.reduce((acc, s) => acc + s.totalSales, 0)}
                formatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                prefix="₫"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Danh sách nhân viên" key="list">
              <Table
                columns={columns}
                dataSource={staffList}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `Tổng ${total} nhân viên`
                }}
              />
            </TabPane>
            
            <TabPane tab="Hiệu suất" key="performance">
              <div>Performance analytics would go here</div>
            </TabPane>
            
            <TabPane tab="Lịch làm việc" key="schedule">
              <div>Schedule management would go here</div>
            </TabPane>
          </Tabs>
        </Card>

        {/* Staff Modal */}
        <Modal
          title={
            modalType === 'create' ? 'Thêm nhân viên mới' :
            modalType === 'edit' ? 'Chỉnh sửa nhân viên' :
            'Thông tin nhân viên'
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
          {renderStaffForm()}
        </Modal>
      </div>
    </div>
  );
};

export default StaffManagement;
