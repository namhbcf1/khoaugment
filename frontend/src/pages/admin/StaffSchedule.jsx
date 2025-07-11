import React, { useState, useEffect } from 'react';
import {
  Card,
  Calendar,
  Badge,
  Modal,
  Form,
  Select,
  TimePicker,
  Button,
  Space,
  Table,
  Tag,
  Avatar,
  Typography,
  Row,
  Col,
  Statistic,
  Tabs,
  DatePicker,
  Switch,
  message,
  Tooltip,
  Popover
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { PageHeader } from '../../components/ui/DesignSystem';
import { PermissionGuard, PermissionButton } from '../../components/auth/PermissionGuard';
import { PERMISSIONS } from '../../auth/permissions';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const StaffSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedShift, setSelectedShift] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [form] = Form.useForm();

  // Mock data
  const mockStaffList = [
    { id: 1, name: 'Nguyễn Văn An', role: 'staff', department: 'Kho hàng' },
    { id: 2, name: 'Trần Thị Bình', role: 'cashier', department: 'Bán hàng' },
    { id: 3, name: 'Lê Văn Cường', role: 'staff', department: 'Kho hàng' },
    { id: 4, name: 'Phạm Thị Dung', role: 'cashier', department: 'Bán hàng' }
  ];

  const mockScheduleData = [
    {
      id: 1,
      staffId: 1,
      staffName: 'Nguyễn Văn An',
      date: '2024-01-15',
      shiftType: 'morning',
      startTime: '08:00',
      endTime: '16:00',
      status: 'scheduled',
      department: 'Kho hàng'
    },
    {
      id: 2,
      staffId: 2,
      staffName: 'Trần Thị Bình',
      date: '2024-01-15',
      shiftType: 'afternoon',
      startTime: '14:00',
      endTime: '22:00',
      status: 'confirmed',
      department: 'Bán hàng'
    },
    {
      id: 3,
      staffId: 1,
      staffName: 'Nguyễn Văn An',
      date: '2024-01-16',
      shiftType: 'morning',
      startTime: '08:00',
      endTime: '16:00',
      status: 'completed',
      department: 'Kho hàng'
    }
  ];

  useEffect(() => {
    loadScheduleData();
    loadStaffList();
  }, []);

  const loadScheduleData = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setScheduleData(mockScheduleData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('Không thể tải dữ liệu lịch làm việc');
      setLoading(false);
    }
  };

  const loadStaffList = async () => {
    try {
      setStaffList(mockStaffList);
    } catch (error) {
      message.error('Không thể tải danh sách nhân viên');
    }
  };

  const getShiftColor = (shiftType) => {
    switch (shiftType) {
      case 'morning': return 'blue';
      case 'afternoon': return 'orange';
      case 'evening': return 'purple';
      case 'night': return 'red';
      default: return 'default';
    }
  };

  const getShiftText = (shiftType) => {
    switch (shiftType) {
      case 'morning': return 'Ca sáng';
      case 'afternoon': return 'Ca chiều';
      case 'evening': return 'Ca tối';
      case 'night': return 'Ca đêm';
      default: return shiftType;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'processing';
      case 'confirmed': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Đã lên lịch';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const handleCreateShift = (date = null) => {
    setModalType('create');
    setSelectedShift(null);
    form.resetFields();
    if (date) {
      form.setFieldsValue({ date: dayjs(date) });
    }
    setModalVisible(true);
  };

  const handleEditShift = (shift) => {
    setModalType('edit');
    setSelectedShift(shift);
    form.setFieldsValue({
      ...shift,
      date: dayjs(shift.date),
      timeRange: [dayjs(shift.startTime, 'HH:mm'), dayjs(shift.endTime, 'HH:mm')]
    });
    setModalVisible(true);
  };

  const handleDeleteShift = async (shiftId) => {
    try {
      setScheduleData(prev => prev.filter(shift => shift.id !== shiftId));
      message.success('Đã xóa ca làm việc');
    } catch (error) {
      message.error('Không thể xóa ca làm việc');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const staffMember = staffList.find(s => s.id === values.staffId);
      const [startTime, endTime] = values.timeRange;
      
      const shiftData = {
        ...values,
        staffName: staffMember.name,
        department: staffMember.department,
        date: values.date.format('YYYY-MM-DD'),
        startTime: startTime.format('HH:mm'),
        endTime: endTime.format('HH:mm'),
        status: 'scheduled'
      };

      if (modalType === 'create') {
        const newShift = {
          id: Date.now(),
          ...shiftData
        };
        setScheduleData(prev => [...prev, newShift]);
        message.success('Đã thêm ca làm việc');
      } else if (modalType === 'edit') {
        const updatedShift = {
          ...selectedShift,
          ...shiftData
        };
        setScheduleData(prev => prev.map(shift => 
          shift.id === selectedShift.id ? updatedShift : shift
        ));
        message.success('Đã cập nhật ca làm việc');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const getDateShifts = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return scheduleData.filter(shift => shift.date === dateStr);
  };

  const dateCellRender = (date) => {
    const shifts = getDateShifts(date);
    return (
      <div>
        {shifts.map(shift => (
          <Badge
            key={shift.id}
            status={getStatusColor(shift.status)}
            text={
              <Tooltip title={`${shift.staffName} - ${getShiftText(shift.shiftType)}`}>
                <Text style={{ fontSize: 11 }}>
                  {shift.staffName.split(' ').pop()}
                </Text>
              </Tooltip>
            }
          />
        ))}
      </div>
    );
  };

  const scheduleColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Nhân viên',
      key: 'staff',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div>{record.staffName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.department}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Ca làm việc',
      dataIndex: 'shiftType',
      key: 'shiftType',
      render: (shiftType) => (
        <Tag color={getShiftColor(shiftType)}>
          {getShiftText(shiftType)}
        </Tag>
      )
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{record.startTime} - {record.endTime}</Text>
        </Space>
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
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <PermissionGuard permission={PERMISSIONS.STAFF_SCHEDULE}>
            <Tooltip title="Chỉnh sửa">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEditShift(record)}
              />
            </Tooltip>
          </PermissionGuard>
          
          <PermissionGuard permission={PERMISSIONS.STAFF_SCHEDULE}>
            <Tooltip title="Xóa">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteShift(record.id)}
              />
            </Tooltip>
          </PermissionGuard>
        </Space>
      )
    }
  ];

  const renderScheduleForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="staffId"
            label="Nhân viên"
            rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
          >
            <Select placeholder="Chọn nhân viên">
              {staffList.map(staff => (
                <Option key={staff.id} value={staff.id}>
                  {staff.name} - {staff.department}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="date"
            label="Ngày làm việc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="shiftType"
            label="Ca làm việc"
            rules={[{ required: true, message: 'Vui lòng chọn ca làm việc' }]}
          >
            <Select placeholder="Chọn ca làm việc">
              <Option value="morning">Ca sáng</Option>
              <Option value="afternoon">Ca chiều</Option>
              <Option value="evening">Ca tối</Option>
              <Option value="night">Ca đêm</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="timeRange"
            label="Thời gian"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <TimePicker.RangePicker 
              style={{ width: '100%' }}
              format="HH:mm"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {modalType === 'create' ? 'Thêm ca làm việc' : 'Cập nhật'}
          </Button>
          <Button onClick={() => setModalVisible(false)}>
            Hủy
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const renderCalendarTab = () => (
    <Card>
      <Calendar
        dateCellRender={dateCellRender}
        onSelect={(date) => setSelectedDate(date)}
        headerRender={({ value, type, onChange, onTypeChange }) => (
          <div style={{ padding: 8 }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={4}>
                  {value.format('MMMM YYYY')}
                </Title>
              </Col>
              <Col>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => handleCreateShift(selectedDate)}
                  >
                    Thêm ca làm việc
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
        )}
      />
    </Card>
  );

  const renderListTab = () => (
    <Card>
      <Table
        columns={scheduleColumns}
        dataSource={scheduleData}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} ca làm việc`
        }}
      />
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Lịch làm việc"
        subtitle="Quản lý lịch làm việc của nhân viên"
        icon="calendar"
        actions={[
          <PermissionButton
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleCreateShift()}
            permission={PERMISSIONS.STAFF_SCHEDULE}
          >
            Thêm ca làm việc
          </PermissionButton>
        ]}
      />

      <div style={{ padding: '0 24px 24px' }}>
        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Ca làm việc hôm nay"
                value={scheduleData.filter(s => s.date === dayjs().format('YYYY-MM-DD')).length}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã xác nhận"
                value={scheduleData.filter(s => s.status === 'confirmed').length}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Chờ xác nhận"
                value={scheduleData.filter(s => s.status === 'scheduled').length}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng giờ làm việc"
                value={scheduleData.length * 8}
                suffix="giờ"
                valueStyle={{ color: '#722ed1' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Lịch" key="calendar">
            {renderCalendarTab()}
          </TabPane>
          
          <TabPane tab="Danh sách" key="list">
            {renderListTab()}
          </TabPane>
          
          <TabPane tab="Báo cáo" key="reports">
            <Card>
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text type="secondary">Báo cáo lịch làm việc sẽ được phát triển</Text>
              </div>
            </Card>
          </TabPane>
        </Tabs>

        {/* Schedule Modal */}
        <Modal
          title={modalType === 'create' ? 'Thêm ca làm việc' : 'Chỉnh sửa ca làm việc'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          {renderScheduleForm()}
        </Modal>
      </div>
    </div>
  );
};

export default StaffSchedule;
