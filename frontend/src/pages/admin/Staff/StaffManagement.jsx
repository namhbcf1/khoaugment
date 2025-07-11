import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Form,
  Modal,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  Typography,
  Row,
  Col,
  Avatar,
  Badge,
  Divider,
  DatePicker,
  message,
  Tabs,
  Upload,
  Switch
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  TeamOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  CalendarOutlined,
  DollarOutlined,
  LockOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilterOutlined,
  ReloadOutlined,
  ImportOutlined,
  ExportOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Sample staff data
const staffData = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@truongphat.com',
    phone: '0912345678',
    role: 'admin',
    department: 'Management',
    status: 'active',
    hireDate: '2020-01-15',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@truongphat.com',
    phone: '0923456789',
    role: 'cashier',
    department: 'Sales',
    status: 'active',
    hireDate: '2020-03-22',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@truongphat.com',
    phone: '0934567890',
    role: 'technician',
    department: 'Technical',
    status: 'inactive',
    hireDate: '2021-05-10',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    email: 'phamthid@truongphat.com',
    phone: '0945678901',
    role: 'inventory',
    department: 'Warehouse',
    status: 'active',
    hireDate: '2021-07-05',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
  },
  {
    id: 5,
    name: 'Hoàng Văn E',
    email: 'hoangvane@truongphat.com',
    phone: '0956789012',
    role: 'cashier',
    department: 'Sales',
    status: 'active',
    hireDate: '2022-01-20',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg'
  }
];

// Department data
const departments = [
  { id: 1, name: 'Management' },
  { id: 2, name: 'Sales' },
  { id: 3, name: 'Technical' },
  { id: 4, name: 'Warehouse' },
  { id: 5, name: 'Customer Service' },
  { id: 6, name: 'Accounting' }
];

// Role data
const roles = [
  { id: 1, name: 'admin', description: 'Full system access' },
  { id: 2, name: 'manager', description: 'Department management' },
  { id: 3, name: 'cashier', description: 'Sales and checkout' },
  { id: 4, name: 'inventory', description: 'Inventory management' },
  { id: 5, name: 'technician', description: 'Technical support' }
];

const StaffManagement = () => {
  const [staffList, setStaffList] = useState(staffData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);

  // Filter staff data based on search and filters
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = 
      !searchText || 
      staff.name.toLowerCase().includes(searchText.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchText.toLowerCase()) ||
      staff.phone.includes(searchText);
      
    const matchesRole = !filterRole || staff.role === filterRole;
    const matchesDepartment = !filterDepartment || staff.department === filterDepartment;
    const matchesStatus = !filterStatus || staff.status === filterStatus;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && staff.status === 'active') ||
                      (activeTab === 'inactive' && staff.status === 'inactive');
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus && matchesTab;
  });

  // Show add/edit staff modal
  const showModal = (staff = null) => {
    setCurrentStaff(staff);
    if (staff) {
      form.setFieldsValue({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        department: staff.department,
        status: staff.status,
        hireDate: staff.hireDate ? dayjs(staff.hireDate) : null
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Handle modal submission
  const handleModalOk = () => {
    form.validateFields()
      .then(values => {
        if (currentStaff) {
          // Update existing staff
          const updatedStaff = staffList.map(staff => 
            staff.id === currentStaff.id ? { ...staff, ...values } : staff
          );
          setStaffList(updatedStaff);
          message.success('Staff member updated successfully');
        } else {
          // Add new staff
          const newStaff = {
            id: staffList.length + 1,
            ...values,
            avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${staffList.length + 1}.jpg`
          };
          setStaffList([...staffList, newStaff]);
          message.success('Staff member added successfully');
        }
        setIsModalVisible(false);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  // Delete staff member
  const handleDelete = (staffId) => {
    const updatedStaff = staffList.filter(staff => staff.id !== staffId);
    setStaffList(updatedStaff);
    message.success('Staff member deleted successfully');
  };

  // Reset filters
  const resetFilters = () => {
    setSearchText('');
    setFilterRole(null);
    setFilterDepartment(null);
    setFilterStatus(null);
  };

  // Show staff details
  const showStaffDetails = (staff) => {
    setSelectedStaffDetails(staff);
    setDetailsVisible(true);
  };

  // Import staff from Excel (mock)
  const importStaff = () => {
    message.info('Import functionality would be implemented here');
  };

  // Export staff to Excel (mock)
  const exportStaff = () => {
    message.info('Export functionality would be implemented here');
  };

  // Table columns
  const columns = [
    {
      title: 'Staff',
      key: 'staff',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={record.avatar} size={40} />
          <div style={{ marginLeft: 12 }}>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{record.email}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: role => {
        let color;
        switch (role) {
          case 'admin':
            color = 'red';
            break;
          case 'manager':
            color = 'purple';
            break;
          case 'cashier':
            color = 'blue';
            break;
          case 'inventory':
            color = 'green';
            break;
          case 'technician':
            color = 'orange';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
      filters: roles.map(role => ({ text: role.name.toUpperCase(), value: role.name })),
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Badge 
          status={status === 'active' ? 'success' : 'error'} 
          text={status === 'active' ? 'Active' : 'Inactive'} 
        />
      ),
    },
    {
      title: 'Hire Date',
      dataIndex: 'hireDate',
      key: 'hireDate',
      sorter: (a, b) => new Date(a.hireDate) - new Date(b.hireDate),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<UserOutlined />} 
              onClick={() => showStaffDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this staff member?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="staff-management-container" style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 20 }}>
          <Row gutter={24} align="middle">
            <Col flex="auto">
              <Title level={2}><TeamOutlined /> Staff Management</Title>
            </Col>
            <Col>
              <Space>
                <Button 
                  type="primary" 
                  icon={<UserAddOutlined />}
                  onClick={() => showModal()}
                >
                  Add Staff
                </Button>
                <Tooltip title="Import Staff">
                  <Button icon={<ImportOutlined />} onClick={importStaff}>
                    Import
                  </Button>
                </Tooltip>
                <Tooltip title="Export Staff">
                  <Button icon={<ExportOutlined />} onClick={exportStaff}>
                    Export
                  </Button>
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </div>

        <Tabs 
          defaultActiveKey="all" 
          onChange={setActiveTab}
          style={{ marginBottom: 16 }}
        >
          <TabPane tab={`All Staff (${staffData.length})`} key="all" />
          <TabPane tab={`Active (${staffData.filter(s => s.status === 'active').length})`} key="active" />
          <TabPane tab={`Inactive (${staffData.filter(s => s.status === 'inactive').length})`} key="inactive" />
        </Tabs>
        
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col flex="auto">
              <Input
                placeholder="Search by name, email or phone"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col>
              <Select
                placeholder="Filter by Role"
                style={{ width: 150 }}
                allowClear
                value={filterRole}
                onChange={setFilterRole}
              >
                {roles.map(role => (
                  <Option key={role.id} value={role.name}>{role.name}</Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Filter by Department"
                style={{ width: 150 }}
                allowClear
                value={filterDepartment}
                onChange={setFilterDepartment}
              >
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.name}>{dept.name}</Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Filter by Status"
                style={{ width: 150 }}
                allowClear
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Col>
            <Col>
              <Tooltip title="Reset Filters">
                <Button icon={<ReloadOutlined />} onClick={resetFilters} />
              </Tooltip>
            </Col>
          </Row>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredStaff}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        {/* Add/Edit Staff Modal */}
        <Modal
          title={currentStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
          width={600}
          maskClosable={false}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter staff name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Full Name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Phone" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="department"
                  label="Department"
                  rules={[{ required: true, message: 'Please select department' }]}
                >
                  <Select placeholder="Select Department">
                    {departments.map(dept => (
                      <Option key={dept.id} value={dept.name}>{dept.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label="Role"
                  rules={[{ required: true, message: 'Please select role' }]}
                >
                  <Select placeholder="Select Role">
                    {roles.map(role => (
                      <Option key={role.id} value={role.name}>
                        {role.name} - {role.description}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select placeholder="Select Status">
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="hireDate"
              label="Hire Date"
              rules={[{ required: true, message: 'Please select hire date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            {!currentStaff && (
              <>
                <Divider>Account Setup</Divider>
                
                <Form.Item
                  name="password"
                  label="Initial Password"
                  rules={[{ required: !currentStaff, message: 'Please enter password' }]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                
                <Form.Item
                  name="sendCredentials"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch /> Send login credentials by email
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
        
        {/* Staff Details Modal */}
        <Modal
          title="Staff Details"
          visible={detailsVisible}
          onCancel={() => setDetailsVisible(false)}
          footer={[
            <Button key="edit" type="primary" onClick={() => {
              setDetailsVisible(false);
              showModal(selectedStaffDetails);
            }}>
              Edit
            </Button>,
            <Button key="close" onClick={() => setDetailsVisible(false)}>
              Close
            </Button>
          ]}
          width={700}
        >
          {selectedStaffDetails && (
            <div className="staff-details">
              <div style={{ display: 'flex', marginBottom: 24 }}>
                <Avatar src={selectedStaffDetails.avatar} size={100} />
                <div style={{ marginLeft: 24 }}>
                  <Title level={3}>{selectedStaffDetails.name}</Title>
                  <div>
                    <Tag color={selectedStaffDetails.role === 'admin' ? 'red' : 'blue'}>
                      {selectedStaffDetails.role.toUpperCase()}
                    </Tag>
                    <Badge 
                      status={selectedStaffDetails.status === 'active' ? 'success' : 'error'} 
                      text={selectedStaffDetails.status === 'active' ? 'Active' : 'Inactive'} 
                    />
                  </div>
                </div>
              </div>
              
              <Divider />
              
              <Row gutter={24}>
                <Col span={12}>
                  <p>
                    <MailOutlined /> <strong>Email:</strong> {selectedStaffDetails.email}
                  </p>
                  <p>
                    <PhoneOutlined /> <strong>Phone:</strong> {selectedStaffDetails.phone}
                  </p>
                  <p>
                    <TeamOutlined /> <strong>Department:</strong> {selectedStaffDetails.department}
                  </p>
                </Col>
                <Col span={12}>
                  <p>
                    <CalendarOutlined /> <strong>Hire Date:</strong> {selectedStaffDetails.hireDate}
                  </p>
                  <p>
                    <IdcardOutlined /> <strong>Staff ID:</strong> {selectedStaffDetails.id}
                  </p>
                  <p>
                    <DollarOutlined /> <strong>Commission:</strong> View Commission History
                  </p>
                </Col>
              </Row>
              
              <Divider />
              
              <Tabs defaultActiveKey="1">
                <TabPane tab="Performance" key="1">
                  <p>Performance data would be displayed here...</p>
                </TabPane>
                <TabPane tab="Schedule" key="2">
                  <p>Schedule information would be displayed here...</p>
                </TabPane>
                <TabPane tab="Permissions" key="3">
                  <p>Permission settings would be displayed here...</p>
                </TabPane>
                <TabPane tab="Activity Log" key="4">
                  <p>Recent activity would be displayed here...</p>
                </TabPane>
              </Tabs>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default StaffManagement; 