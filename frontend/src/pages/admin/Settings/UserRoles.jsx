import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  Form,
  Input,
  Checkbox,
  Divider,
  Tabs,
  Row,
  Col,
  Alert,
  Tooltip,
  Popconfirm,
  Switch,
  Tree,
  Badge,
  List,
  Avatar,
  message
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  SafetyOutlined,
  EyeOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  ShoppingOutlined,
  DashboardOutlined,
  ShopOutlined,
  FileTextOutlined,
  BarcodeOutlined,
  UserSwitchOutlined,
  AuditOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { DirectoryTree } = Tree;

// Sample data for user roles
const roles = [
  {
    id: 1,
    name: 'Administrator',
    description: 'Full system access with all permissions',
    users: 3,
    permissions: ['all'],
    isSystem: true,
    createdAt: '2023-01-15'
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Access to manage store operations, reports, and staff',
    users: 5,
    permissions: [
      'dashboard_view', 'products_view', 'products_edit', 
      'orders_view', 'orders_edit', 'customers_view', 
      'customers_edit', 'reports_view', 'staff_view', 'staff_edit'
    ],
    isSystem: true,
    createdAt: '2023-01-15'
  },
  {
    id: 3,
    name: 'Cashier',
    description: 'POS access for processing sales and managing basic customer data',
    users: 12,
    permissions: [
      'pos_access', 'orders_view', 'orders_create',
      'customers_view', 'customers_create'
    ],
    isSystem: true,
    createdAt: '2023-01-15'
  },
  {
    id: 4,
    name: 'Inventory Specialist',
    description: 'Manage product inventory and stock levels',
    users: 4,
    permissions: [
      'products_view', 'products_edit', 'inventory_view', 
      'inventory_edit', 'reports_view'
    ],
    isSystem: false,
    createdAt: '2023-03-22'
  },
  {
    id: 5,
    name: 'Marketing Specialist',
    description: 'Manage marketing campaigns and customer communications',
    users: 2,
    permissions: [
      'dashboard_view', 'customers_view', 'marketing_view', 
      'marketing_edit', 'reports_view'
    ],
    isSystem: false,
    createdAt: '2023-05-10'
  },
  {
    id: 6,
    name: 'Accountant',
    description: 'Access to financial reports and transactions',
    users: 1,
    permissions: [
      'dashboard_view', 'orders_view', 'reports_view',
      'finances_view', 'finances_edit'
    ],
    isSystem: false,
    createdAt: '2023-06-18'
  }
];

// Sample users data
const users = [
  {
    id: 1,
    name: 'Nguyen Van A',
    email: 'admin@truongphat.com',
    role: 'Administrator',
    status: 'active',
    lastLogin: '2023-10-07 09:45',
    createdAt: '2023-01-15'
  },
  {
    id: 2,
    name: 'Tran Thi B',
    email: 'manager@truongphat.com',
    role: 'Manager',
    status: 'active',
    lastLogin: '2023-10-06 17:30',
    createdAt: '2023-01-15'
  },
  {
    id: 3,
    name: 'Le Van C',
    email: 'cashier1@truongphat.com',
    role: 'Cashier',
    status: 'active',
    lastLogin: '2023-10-07 14:22',
    createdAt: '2023-01-20'
  },
  {
    id: 4,
    name: 'Pham Thi D',
    email: 'cashier2@truongphat.com',
    role: 'Cashier',
    status: 'active',
    lastLogin: '2023-10-07 13:15',
    createdAt: '2023-02-05'
  },
  {
    id: 5,
    name: 'Hoang Van E',
    email: 'inventory@truongphat.com',
    role: 'Inventory Specialist',
    status: 'active',
    lastLogin: '2023-10-05 11:30',
    createdAt: '2023-03-22'
  },
  {
    id: 6,
    name: 'Vu Thi F',
    email: 'marketing@truongphat.com',
    role: 'Marketing Specialist',
    status: 'inactive',
    lastLogin: '2023-09-28 14:45',
    createdAt: '2023-05-10'
  },
  {
    id: 7,
    name: 'Dao Van G',
    email: 'accountant@truongphat.com',
    role: 'Accountant',
    status: 'active',
    lastLogin: '2023-10-06 09:20',
    createdAt: '2023-06-18'
  }
];

// Permission categories
const permissionCategories = [
  {
    title: 'Dashboard',
    key: 'dashboard',
    children: [
      { title: 'View Dashboard', key: 'dashboard_view' },
      { title: 'Edit Dashboard Widgets', key: 'dashboard_edit' }
    ]
  },
  {
    title: 'Products',
    key: 'products',
    children: [
      { title: 'View Products', key: 'products_view' },
      { title: 'Create Products', key: 'products_create' },
      { title: 'Edit Products', key: 'products_edit' },
      { title: 'Delete Products', key: 'products_delete' },
      { title: 'Manage Categories', key: 'categories_manage' },
      { title: 'Manage Product Attributes', key: 'attributes_manage' }
    ]
  },
  {
    title: 'Inventory',
    key: 'inventory',
    children: [
      { title: 'View Inventory', key: 'inventory_view' },
      { title: 'Edit Inventory', key: 'inventory_edit' },
      { title: 'Manage Stock Transfers', key: 'inventory_transfer' },
      { title: 'Manage Suppliers', key: 'suppliers_manage' },
      { title: 'Manage Purchase Orders', key: 'purchase_orders_manage' }
    ]
  },
  {
    title: 'Orders',
    key: 'orders',
    children: [
      { title: 'View Orders', key: 'orders_view' },
      { title: 'Create Orders', key: 'orders_create' },
      { title: 'Edit Orders', key: 'orders_edit' },
      { title: 'Delete Orders', key: 'orders_delete' },
      { title: 'Process Refunds', key: 'orders_refund' },
      { title: 'Manage Shipping', key: 'shipping_manage' }
    ]
  },
  {
    title: 'Customers',
    key: 'customers',
    children: [
      { title: 'View Customers', key: 'customers_view' },
      { title: 'Create Customers', key: 'customers_create' },
      { title: 'Edit Customers', key: 'customers_edit' },
      { title: 'Delete Customers', key: 'customers_delete' },
      { title: 'Manage Customer Groups', key: 'customer_groups_manage' },
      { title: 'Manage Loyalty Programs', key: 'loyalty_manage' }
    ]
  },
  {
    title: 'Staff',
    key: 'staff',
    children: [
      { title: 'View Staff', key: 'staff_view' },
      { title: 'Create Staff', key: 'staff_create' },
      { title: 'Edit Staff', key: 'staff_edit' },
      { title: 'Delete Staff', key: 'staff_delete' },
      { title: 'Manage Commissions', key: 'commissions_manage' },
      { title: 'Manage Shifts', key: 'shifts_manage' }
    ]
  },
  {
    title: 'Reports',
    key: 'reports',
    children: [
      { title: 'View Reports', key: 'reports_view' },
      { title: 'Export Reports', key: 'reports_export' },
      { title: 'View Financial Reports', key: 'finances_view' },
      { title: 'Edit Financial Data', key: 'finances_edit' }
    ]
  },
  {
    title: 'Marketing',
    key: 'marketing',
    children: [
      { title: 'View Marketing', key: 'marketing_view' },
      { title: 'Edit Marketing', key: 'marketing_edit' },
      { title: 'Manage Promotions', key: 'promotions_manage' },
      { title: 'Manage Email Campaigns', key: 'email_campaigns_manage' }
    ]
  },
  {
    title: 'POS',
    key: 'pos',
    children: [
      { title: 'Access POS', key: 'pos_access' },
      { title: 'Apply Discounts', key: 'pos_discounts' },
      { title: 'Void Transactions', key: 'pos_void' },
      { title: 'Open Cash Drawer', key: 'pos_cash_drawer' }
    ]
  },
  {
    title: 'Settings',
    key: 'settings',
    children: [
      { title: 'View Settings', key: 'settings_view' },
      { title: 'Edit Settings', key: 'settings_edit' },
      { title: 'Manage User Roles', key: 'roles_manage' },
      { title: 'Manage Integrations', key: 'integrations_manage' },
      { title: 'Access System Logs', key: 'logs_access' }
    ]
  }
];

const UserRoles = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [roleModal, setRoleModal] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [viewPermissionsModal, setViewPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [checkedPermissions, setCheckedPermissions] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState(['dashboard', 'products']);
  
  const showRoleModal = (role = null) => {
    setSelectedRole(role);
    
    if (role) {
      // Edit mode - set form values
      roleForm.setFieldsValue({
        name: role.name,
        description: role.description
      });
      setCheckedPermissions(role.permissions);
    } else {
      // Create mode - reset form
      roleForm.resetFields();
      setCheckedPermissions([]);
    }
    
    setRoleModal(true);
  };
  
  const showUserModal = (user = null) => {
    setSelectedUser(user);
    
    if (user) {
      // Edit mode - set form values
      userForm.setFieldsValue({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status === 'active'
      });
    } else {
      // Create mode - reset form
      userForm.resetFields();
    }
    
    setUserModal(true);
  };
  
  const showViewPermissionsModal = (role) => {
    setSelectedRole(role);
    setViewPermissionsModal(true);
  };
  
  const handleSaveRole = () => {
    roleForm.validateFields()
      .then((values) => {
        console.log('Form values:', values);
        console.log('Selected permissions:', checkedPermissions);
        
        const action = selectedRole ? 'updated' : 'created';
        message.success(`Role ${values.name} ${action} successfully`);
        setRoleModal(false);
      })
      .catch((errorInfo) => {
        console.log('Form validation failed:', errorInfo);
      });
  };
  
  const handleSaveUser = () => {
    userForm.validateFields()
      .then((values) => {
        console.log('Form values:', values);
        
        const action = selectedUser ? 'updated' : 'created';
        message.success(`User ${values.name} ${action} successfully`);
        setUserModal(false);
      })
      .catch((errorInfo) => {
        console.log('Form validation failed:', errorInfo);
      });
  };
  
  const handleDeleteRole = (role) => {
    if (role.isSystem) {
      message.error('System roles cannot be deleted');
      return;
    }
    
    message.success(`Role ${role.name} deleted successfully`);
  };
  
  const handleDeleteUser = (user) => {
    message.success(`User ${user.name} deleted successfully`);
  };
  
  const onPermissionCheck = (checkedKeys) => {
    setCheckedPermissions(checkedKeys);
  };
  
  const roleColumns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {record.isSystem && <Tag color="blue">System</Tag>}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Users',
      dataIndex: 'users',
      key: 'users',
      sorter: (a, b) => a.users - b.users,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => showViewPermissionsModal(record)}
          >
            Permissions
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showRoleModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this role?"
            onConfirm={() => handleDeleteRole(record)}
            okText="Yes"
            cancelText="No"
            disabled={record.isSystem}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              disabled={record.isSystem}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: roles.map(role => ({ text: role.name, value: role.name })),
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'active') {
          return <Badge status="success" text="Active" />;
        } else {
          return <Badge status="default" text="Inactive" />;
        }
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showUserModal(record)}
          >
            Edit
          </Button>
          <Button 
            icon={<KeyOutlined />}
            onClick={() => {
              message.success('Password reset link sent to user');
            }}
          >
            Reset Password
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  const getPermissionIcon = (key) => {
    const icons = {
      'dashboard': <DashboardOutlined />,
      'products': <ShopOutlined />,
      'inventory': <BarcodeOutlined />,
      'orders': <ShoppingOutlined />,
      'customers': <UserOutlined />,
      'staff': <TeamOutlined />,
      'reports': <FileTextOutlined />,
      'marketing': <NotificationOutlined />,
      'pos': <ShoppingCartOutlined />,
      'settings': <SettingOutlined />
    };
    
    return icons[key] || <AppstoreOutlined />;
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>
          <SafetyOutlined /> User Roles & Permissions
        </Title>
      </div>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <TeamOutlined /> Roles
              </span>
            } 
            key="roles"
          >
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => showRoleModal()}
              >
                Create New Role
              </Button>
            </div>
            
            <Table 
              columns={roleColumns}
              dataSource={roles}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <UserOutlined /> Users
              </span>
            } 
            key="users"
          >
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => showUserModal()}
              >
                Create New User
              </Button>
            </div>
            
            <Table 
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <LockOutlined /> Permission Settings
              </span>
            } 
            key="permissions"
          >
            <Row gutter={24}>
              <Col span={24}>
                <Alert
                  message="Permission Management"
                  description="Configure default permissions for system roles and manage permission inheritance rules."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
                
                <Card title="System Roles" style={{ marginBottom: 24 }}>
                  <List
                    itemLayout="horizontal"
                    dataSource={roles.filter(role => role.isSystem)}
                    renderItem={role => (
                      <List.Item
                        actions={[
                          <Button 
                            key="view" 
                            onClick={() => showViewPermissionsModal(role)}
                          >
                            View Permissions
                          </Button>,
                          <Button 
                            key="edit" 
                            onClick={() => showRoleModal(role)}
                          >
                            Edit
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={role.name}
                          description={role.description}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
                
                <Card title="Permission Inheritance">
                  <Form layout="vertical">
                    <Form.Item
                      label="Enable Permission Inheritance"
                      name="inheritPermissions"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch />
                    </Form.Item>
                    
                    <Form.Item
                      label="Default Role for New Users"
                      name="defaultRole"
                      initialValue="Cashier"
                    >
                      <Select>
                        {roles.map(role => (
                          <Select.Option key={role.id} value={role.name}>
                            {role.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      label="Role Hierarchy"
                      name="roleHierarchy"
                      initialValue={['Administrator', 'Manager', 'Cashier']}
                    >
                      <Select mode="multiple">
                        {roles.map(role => (
                          <Select.Option key={role.id} value={role.name}>
                            {role.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <Button type="primary">
                      Save Permission Settings
                    </Button>
                  </Form>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
      
      {/* Create/Edit Role Modal */}
      <Modal
        title={selectedRole ? `Edit Role: ${selectedRole.name}` : 'Create New Role'}
        visible={roleModal}
        onCancel={() => setRoleModal(false)}
        onOk={handleSaveRole}
        width={800}
      >
        <Form
          form={roleForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: 'Please enter a role name' }]}
          >
            <Input placeholder="e.g., Store Manager" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea 
              placeholder="Describe the purpose and responsibilities of this role"
              rows={3}
            />
          </Form.Item>
          
          <Divider>Permissions</Divider>
          
          <Alert
            message="Select Permissions"
            description="Choose the permissions that users with this role will have. You can select individual permissions or entire categories."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <DirectoryTree
            checkable
            onCheck={onPermissionCheck}
            checkedKeys={checkedPermissions}
            treeData={permissionCategories}
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys}
            defaultExpandAll
            height={400}
            style={{ overflowY: 'auto' }}
          />
          
          <div style={{ marginTop: 16 }}>
            <Space>
              <Button
                onClick={() => setCheckedPermissions(['all'])}
              >
                Select All
              </Button>
              <Button
                onClick={() => setCheckedPermissions([])}
              >
                Clear All
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
      
      {/* Create/Edit User Modal */}
      <Modal
        title={selectedUser ? `Edit User: ${selectedUser.name}` : 'Create New User'}
        visible={userModal}
        onCancel={() => setUserModal(false)}
        onOk={handleSaveUser}
      >
        <Form
          form={userForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter the user\'s name' }]}
          >
            <Input placeholder="e.g., Nguyen Van A" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter an email address' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input placeholder="e.g., user@example.com" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select a role">
              {roles.map(role => (
                <Select.Option key={role.id} value={role.name}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          {!selectedUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter a password' }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}
          
          <Form.Item
            name="status"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive" 
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* View Permissions Modal */}
      <Modal
        title={`Permissions: ${selectedRole?.name}`}
        visible={viewPermissionsModal}
        onCancel={() => setViewPermissionsModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewPermissionsModal(false)}>
            Close
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            onClick={() => {
              setViewPermissionsModal(false);
              showRoleModal(selectedRole);
            }}
          >
            Edit Permissions
          </Button>,
        ]}
        width={800}
      >
        {selectedRole && (
          <>
            <Paragraph>{selectedRole.description}</Paragraph>
            
            {selectedRole.permissions.includes('all') ? (
              <Alert
                message="Full System Access"
                description="This role has all permissions enabled and can access all features of the system."
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            ) : (
              <div>
                <Title level={5}>Granted Permissions:</Title>
                <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={permissionCategories}
                  renderItem={category => {
                    const categoryPermissions = category.children.filter(
                      child => selectedRole.permissions.includes(child.key)
                    );
                    
                    if (categoryPermissions.length === 0) {
                      return null;
                    }
                    
                    return (
                      <List.Item>
                        <Card 
                          title={
                            <Space>
                              {getPermissionIcon(category.key)}
                              {category.title}
                            </Space>
                          } 
                          size="small"
                        >
                          <List
                            size="small"
                            dataSource={categoryPermissions}
                            renderItem={item => (
                              <List.Item>
                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                {item.title}
                              </List.Item>
                            )}
                          />
                        </Card>
                      </List.Item>
                    );
                  }}
                />
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default UserRoles; 