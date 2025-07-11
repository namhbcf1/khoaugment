import React, { useState } from 'react';
import {
  Card,
  Table,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Switch,
  Typography,
  Space,
  Tabs,
  Row,
  Col,
  Divider,
  Modal,
  message,
  Tag,
  Popconfirm,
  Radio,
  Tooltip,
  Alert
} from 'antd';
import {
  DollarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  PercentageOutlined,
  TeamOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Sample commission rule data
const commissionRulesData = [
  {
    id: 1,
    name: 'Standard Sales Commission',
    type: 'percentage',
    value: 2,
    applicableTo: 'all',
    productCategories: [],
    minSaleAmount: 0,
    active: true
  },
  {
    id: 2,
    name: 'Computer Hardware Bonus',
    type: 'percentage',
    value: 3.5,
    applicableTo: 'category',
    productCategories: ['Laptops', 'Desktops', 'Components'],
    minSaleAmount: 5000000,
    active: true
  },
  {
    id: 3,
    name: 'Accessory Commission',
    type: 'percentage',
    value: 5,
    applicableTo: 'category',
    productCategories: ['Accessories', 'Peripherals'],
    minSaleAmount: 200000,
    active: true
  },
  {
    id: 4,
    name: 'Service Plan Bonus',
    type: 'fixed',
    value: 50000,
    applicableTo: 'category',
    productCategories: ['Services', 'Warranties'],
    minSaleAmount: 0,
    active: true
  },
  {
    id: 5,
    name: 'Monthly Top Seller Bonus',
    type: 'fixed',
    value: 500000,
    applicableTo: 'special',
    productCategories: [],
    minSaleAmount: 0,
    active: true
  }
];

// Sample commission tiers data
const commissionTiersData = [
  {
    id: 1,
    name: 'Bronze Tier',
    monthlyTarget: 50000000,
    bonusType: 'percentage',
    bonusValue: 0.5,
    active: true
  },
  {
    id: 2,
    name: 'Silver Tier',
    monthlyTarget: 100000000,
    bonusType: 'percentage',
    bonusValue: 1,
    active: true
  },
  {
    id: 3,
    name: 'Gold Tier',
    monthlyTarget: 200000000,
    bonusType: 'percentage',
    bonusValue: 2,
    active: true
  },
  {
    id: 4,
    name: 'Platinum Tier',
    monthlyTarget: 500000000,
    bonusType: 'percentage',
    bonusValue: 3.5,
    active: true
  }
];

// Sample staff commission settings data
const staffCommissionData = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    role: 'Sales Manager',
    baseCommissionRate: 3,
    eligibleForBonus: true,
    customRules: ['Monthly Top Seller Bonus'],
    currentTier: 'Gold Tier'
  },
  {
    id: 2,
    name: 'Trần Thị B',
    role: 'Senior Sales',
    baseCommissionRate: 2.5,
    eligibleForBonus: true,
    customRules: [],
    currentTier: 'Silver Tier'
  },
  {
    id: 3,
    name: 'Lê Văn C',
    role: 'Sales',
    baseCommissionRate: 2,
    eligibleForBonus: true,
    customRules: [],
    currentTier: 'Bronze Tier'
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    role: 'Cashier',
    baseCommissionRate: 1.5,
    eligibleForBonus: true,
    customRules: [],
    currentTier: 'Bronze Tier'
  },
  {
    id: 5,
    name: 'Hoàng Văn E',
    role: 'Technician',
    baseCommissionRate: 1,
    eligibleForBonus: true,
    customRules: ['Service Plan Bonus'],
    currentTier: 'Bronze Tier'
  }
];

// Product categories for selection
const productCategories = [
  'Laptops',
  'Desktops',
  'Components',
  'Monitors',
  'Accessories',
  'Peripherals',
  'Networking',
  'Storage',
  'Software',
  'Services',
  'Warranties'
];

const CommissionSettings = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [commissionRules, setCommissionRules] = useState(commissionRulesData);
  const [commissionTiers, setCommissionTiers] = useState(commissionTiersData);
  const [staffCommissions, setStaffCommissions] = useState(staffCommissionData);
  
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [tierModalVisible, setTierModalVisible] = useState(false);
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  
  const [currentRule, setCurrentRule] = useState(null);
  const [currentTier, setCurrentTier] = useState(null);
  const [currentStaff, setCurrentStaff] = useState(null);
  
  const [ruleForm] = Form.useForm();
  const [tierForm] = Form.useForm();
  const [staffForm] = Form.useForm();
  
  // Handle rule modal
  const showRuleModal = (rule = null) => {
    setCurrentRule(rule);
    if (rule) {
      ruleForm.setFieldsValue({
        name: rule.name,
        type: rule.type,
        value: rule.value,
        applicableTo: rule.applicableTo,
        productCategories: rule.productCategories,
        minSaleAmount: rule.minSaleAmount,
        active: rule.active
      });
    } else {
      ruleForm.resetFields();
      ruleForm.setFieldsValue({
        type: 'percentage',
        applicableTo: 'all',
        minSaleAmount: 0,
        active: true,
        productCategories: []
      });
    }
    setRuleModalVisible(true);
  };
  
  const handleRuleSubmit = () => {
    ruleForm.validateFields()
      .then(values => {
        if (currentRule) {
          // Update existing rule
          const updatedRules = commissionRules.map(rule => 
            rule.id === currentRule.id ? { ...rule, ...values } : rule
          );
          setCommissionRules(updatedRules);
          message.success('Commission rule updated successfully');
        } else {
          // Add new rule
          const newRule = {
            id: commissionRules.length + 1,
            ...values
          };
          setCommissionRules([...commissionRules, newRule]);
          message.success('Commission rule added successfully');
        }
        setRuleModalVisible(false);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };
  
  // Handle tier modal
  const showTierModal = (tier = null) => {
    setCurrentTier(tier);
    if (tier) {
      tierForm.setFieldsValue({
        name: tier.name,
        monthlyTarget: tier.monthlyTarget,
        bonusType: tier.bonusType,
        bonusValue: tier.bonusValue,
        active: tier.active
      });
    } else {
      tierForm.resetFields();
      tierForm.setFieldsValue({
        bonusType: 'percentage',
        active: true
      });
    }
    setTierModalVisible(true);
  };
  
  const handleTierSubmit = () => {
    tierForm.validateFields()
      .then(values => {
        if (currentTier) {
          // Update existing tier
          const updatedTiers = commissionTiers.map(tier => 
            tier.id === currentTier.id ? { ...tier, ...values } : tier
          );
          setCommissionTiers(updatedTiers);
          message.success('Commission tier updated successfully');
        } else {
          // Add new tier
          const newTier = {
            id: commissionTiers.length + 1,
            ...values
          };
          setCommissionTiers([...commissionTiers, newTier]);
          message.success('Commission tier added successfully');
        }
        setTierModalVisible(false);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };
  
  // Handle staff commission modal
  const showStaffModal = (staff = null) => {
    setCurrentStaff(staff);
    if (staff) {
      staffForm.setFieldsValue({
        name: staff.name,
        role: staff.role,
        baseCommissionRate: staff.baseCommissionRate,
        eligibleForBonus: staff.eligibleForBonus,
        customRules: staff.customRules,
        currentTier: staff.currentTier
      });
    } else {
      staffForm.resetFields();
      staffForm.setFieldsValue({
        eligibleForBonus: true,
        customRules: []
      });
    }
    setStaffModalVisible(true);
  };
  
  const handleStaffSubmit = () => {
    staffForm.validateFields()
      .then(values => {
        if (currentStaff) {
          // Update existing staff commission
          const updatedStaff = staffCommissions.map(staff => 
            staff.id === currentStaff.id ? { ...staff, ...values } : staff
          );
          setStaffCommissions(updatedStaff);
          message.success('Staff commission settings updated successfully');
        } else {
          // Add new staff commission
          const newStaff = {
            id: staffCommissions.length + 1,
            ...values
          };
          setStaffCommissions([...staffCommissions, newStaff]);
          message.success('Staff commission settings added successfully');
        }
        setStaffModalVisible(false);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };
  
  // Handle rule deletion
  const handleRuleDelete = (ruleId) => {
    const updatedRules = commissionRules.filter(rule => rule.id !== ruleId);
    setCommissionRules(updatedRules);
    message.success('Commission rule deleted successfully');
  };
  
  // Handle tier deletion
  const handleTierDelete = (tierId) => {
    const updatedTiers = commissionTiers.filter(tier => tier.id !== tierId);
    setCommissionTiers(updatedTiers);
    message.success('Commission tier deleted successfully');
  };
  
  // Commission Rules Table
  const ruleColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (VND)'
      ),
      filters: [
        { text: 'Percentage', value: 'percentage' },
        { text: 'Fixed Amount', value: 'fixed' }
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Value',
      key: 'value',
      render: (text, record) => (
        record.type === 'percentage' ? 
        <span>{record.value}%</span> :
        <span>{record.value.toLocaleString()} VND</span>
      ),
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: 'Applicable To',
      key: 'applicableTo',
      render: (text, record) => {
        if (record.applicableTo === 'all') {
          return 'All Products';
        } else if (record.applicableTo === 'category') {
          return (
            <>
              <span>Categories: </span>
              {record.productCategories.map(cat => (
                <Tag key={cat}>{cat}</Tag>
              ))}
            </>
          );
        } else {
          return 'Special Conditions';
        }
      },
      filters: [
        { text: 'All Products', value: 'all' },
        { text: 'Specific Categories', value: 'category' },
        { text: 'Special Conditions', value: 'special' }
      ],
      onFilter: (value, record) => record.applicableTo === value,
    },
    {
      title: 'Min. Sale Amount',
      dataIndex: 'minSaleAmount',
      key: 'minSaleAmount',
      render: (amount) => `${amount.toLocaleString()} VND`,
      sorter: (a, b) => a.minSaleAmount - b.minSaleAmount,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        active ? 
        <Tag color="green">Active</Tag> :
        <Tag color="red">Inactive</Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false }
      ],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => showRuleModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this rule?"
            onConfirm={() => handleRuleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  // Commission Tiers Table
  const tierColumns = [
    {
      title: 'Tier Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Monthly Sales Target',
      dataIndex: 'monthlyTarget',
      key: 'monthlyTarget',
      render: (amount) => `${amount.toLocaleString()} VND`,
      sorter: (a, b) => a.monthlyTarget - b.monthlyTarget,
    },
    {
      title: 'Bonus',
      key: 'bonus',
      render: (text, record) => (
        record.bonusType === 'percentage' ? 
        <span>+{record.bonusValue}% on all commissions</span> :
        <span>+{record.bonusValue.toLocaleString()} VND fixed bonus</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        active ? 
        <Tag color="green">Active</Tag> :
        <Tag color="red">Inactive</Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false }
      ],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => showTierModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this tier?"
            onConfirm={() => handleTierDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  // Staff Commission Settings Table
  const staffColumns = [
    {
      title: 'Staff Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: [...new Set(staffCommissionData.map(item => item.role))].map(role => ({
        text: role,
        value: role,
      })),
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Base Commission Rate',
      dataIndex: 'baseCommissionRate',
      key: 'baseCommissionRate',
      render: (rate) => `${rate}%`,
      sorter: (a, b) => a.baseCommissionRate - b.baseCommissionRate,
    },
    {
      title: 'Current Tier',
      dataIndex: 'currentTier',
      key: 'currentTier',
      filters: commissionTiers.map(tier => ({
        text: tier.name,
        value: tier.name,
      })),
      onFilter: (value, record) => record.currentTier === value,
    },
    {
      title: 'Eligible for Bonus',
      dataIndex: 'eligibleForBonus',
      key: 'eligibleForBonus',
      render: (eligible) => (
        eligible ? 
        <Tag icon={<CheckCircleOutlined />} color="green">Yes</Tag> :
        <Tag icon={<CloseCircleOutlined />} color="red">No</Tag>
      ),
      filters: [
        { text: 'Yes', value: true },
        { text: 'No', value: false }
      ],
      onFilter: (value, record) => record.eligibleForBonus === value,
    },
    {
      title: 'Custom Rules',
      key: 'customRules',
      render: (text, record) => (
        <>
          {record.customRules.length > 0 ? 
            record.customRules.map(rule => <Tag key={rule}>{rule}</Tag>) :
            <Text type="secondary">None</Text>
          }
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          size="small"
          onClick={() => showStaffModal(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="commission-settings-container" style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2}>
              <DollarOutlined /> Commission Settings
            </Title>
            <Text type="secondary">
              Configure commission rules, tiers, and individual staff commission settings
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<SaveOutlined />}
            >
              Save All Settings
            </Button>
          </Col>
        </Row>
        
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={<span><PercentageOutlined /> Commission Rules</span>} 
            key="1"
          >
            <Alert
              message="Commission Rules"
              description="Define the basic commission rules that apply to different product categories and sales scenarios."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showRuleModal()}
              >
                Add Commission Rule
              </Button>
            </div>
            
            <Table 
              columns={ruleColumns} 
              dataSource={commissionRules}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          
          <TabPane 
            tab={<span><BarChartOutlined /> Commission Tiers</span>} 
            key="2"
          >
            <Alert
              message="Commission Tiers"
              description="Create performance-based commission tiers with escalating benefits for sales staff based on their monthly sales targets."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showTierModal()}
              >
                Add Commission Tier
              </Button>
            </div>
            
            <Table 
              columns={tierColumns} 
              dataSource={commissionTiers}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          
          <TabPane 
            tab={<span><TeamOutlined /> Staff Commission Settings</span>} 
            key="3"
          >
            <Alert
              message="Staff Commission Settings"
              description="Manage individual commission settings for each staff member, including base rates and eligibility for bonus programs."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showStaffModal()}
              >
                Add Staff Commission
              </Button>
            </div>
            
            <Table 
              columns={staffColumns} 
              dataSource={staffCommissions}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          
          <TabPane 
            tab={<span><CalendarOutlined /> Commission Schedule</span>} 
            key="4"
          >
            <Alert
              message="Commission Schedule"
              description="Set up the schedule for commission calculations and payouts."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Card title="Calculation and Payout Settings">
              <Form layout="vertical">
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      label="Commission Calculation Frequency"
                      name="calculationFrequency"
                      initialValue="monthly"
                    >
                      <Select>
                        <Option value="daily">Daily</Option>
                        <Option value="weekly">Weekly</Option>
                        <Option value="biweekly">Bi-Weekly</Option>
                        <Option value="monthly">Monthly</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={8}>
                    <Form.Item
                      label="Commission Payout Date"
                      name="payoutDate"
                      initialValue={10}
                      tooltip="Day of month for commission payout"
                    >
                      <InputNumber min={1} max={28} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  
                  <Col span={8}>
                    <Form.Item
                      label="Commission Processing Method"
                      name="processMethod"
                      initialValue="automatic"
                    >
                      <Select>
                        <Option value="automatic">Automatic</Option>
                        <Option value="manual">Manual Approval</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Divider />
                
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      label="Delay Commission for Returns"
                      name="delayForReturns"
                      valuePropName="checked"
                      initialValue={true}
                      tooltip="Hold commission for potential returns"
                    >
                      <Switch />
                    </Form.Item>
                    
                    <Form.Item
                      label="Return Window (days)"
                      name="returnWindow"
                      initialValue={30}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      label="Include Tax in Commission Calculation"
                      name="includeTax"
                      valuePropName="checked"
                      initialValue={false}
                    >
                      <Switch />
                    </Form.Item>
                    
                    <Form.Item
                      label="Commission Cap"
                      name="commissionCap"
                      initialValue={10000000}
                    >
                      <InputNumber 
                        style={{ width: '100%' }} 
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Button type="primary">Save Schedule Settings</Button>
              </Form>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={<span><ShoppingOutlined /> Product-Specific Settings</span>} 
            key="5"
          >
            <Alert
              message="Product-Specific Commission Settings"
              description="Configure special commission rates for specific products or product categories."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Card title="Category Commission Rates">
              <Form layout="vertical">
                {productCategories.map((category, index) => (
                  <Form.Item
                    key={index}
                    label={category}
                    name={['categoryCommission', category]}
                    initialValue={index % 3 === 0 ? 5 : index % 3 === 1 ? 3 : 2}
                  >
                    <InputNumber
                      min={0}
                      max={20}
                      formatter={value => `${value}%`}
                      parser={value => value.replace('%', '')}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                ))}
                
                <Button type="primary">Save Category Settings</Button>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
        
        {/* Commission Rule Modal */}
        <Modal
          title={currentRule ? "Edit Commission Rule" : "Add Commission Rule"}
          visible={ruleModalVisible}
          onOk={handleRuleSubmit}
          onCancel={() => setRuleModalVisible(false)}
          width={600}
        >
          <Form
            form={ruleForm}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="Rule Name"
              rules={[{ required: true, message: 'Please enter a rule name' }]}
            >
              <Input />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Commission Type"
                  rules={[{ required: true, message: 'Please select commission type' }]}
                >
                  <Radio.Group>
                    <Radio value="percentage">Percentage (%)</Radio>
                    <Radio value="fixed">Fixed Amount (VND)</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="value"
                  label="Value"
                  rules={[{ required: true, message: 'Please enter commission value' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="applicableTo"
              label="Applicable To"
              rules={[{ required: true, message: 'Please select where this rule applies' }]}
            >
              <Radio.Group>
                <Radio value="all">All Products</Radio>
                <Radio value="category">Specific Categories</Radio>
                <Radio value="special">Special Conditions</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.applicableTo !== currentValues.applicableTo}
            >
              {({ getFieldValue }) => 
                getFieldValue('applicableTo') === 'category' ? (
                  <Form.Item
                    name="productCategories"
                    label="Product Categories"
                    rules={[{ required: true, message: 'Please select at least one category' }]}
                  >
                    <Select mode="multiple" placeholder="Select product categories">
                      {productCategories.map(category => (
                        <Option key={category} value={category}>{category}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                ) : null
              }
            </Form.Item>
            
            <Form.Item
              name="minSaleAmount"
              label="Minimum Sale Amount (VND)"
              tooltip="Commission applies only to sales above this amount"
            >
              <InputNumber style={{ width: '100%' }} min={0} step={100000} />
            </Form.Item>
            
            <Form.Item
              name="active"
              valuePropName="checked"
              label="Status"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Form>
        </Modal>
        
        {/* Commission Tier Modal */}
        <Modal
          title={currentTier ? "Edit Commission Tier" : "Add Commission Tier"}
          visible={tierModalVisible}
          onOk={handleTierSubmit}
          onCancel={() => setTierModalVisible(false)}
          width={600}
        >
          <Form
            form={tierForm}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="Tier Name"
              rules={[{ required: true, message: 'Please enter a tier name' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="monthlyTarget"
              label="Monthly Sales Target (VND)"
              rules={[{ required: true, message: 'Please enter monthly sales target' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={1000000} 
                step={1000000}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="bonusType"
                  label="Bonus Type"
                  rules={[{ required: true, message: 'Please select bonus type' }]}
                >
                  <Radio.Group>
                    <Radio value="percentage">Percentage (%)</Radio>
                    <Radio value="fixed">Fixed Amount (VND)</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="bonusValue"
                  label="Bonus Value"
                  rules={[{ required: true, message: 'Please enter bonus value' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="active"
              valuePropName="checked"
              label="Status"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Form>
        </Modal>
        
        {/* Staff Commission Modal */}
        <Modal
          title={currentStaff ? "Edit Staff Commission Settings" : "Add Staff Commission Settings"}
          visible={staffModalVisible}
          onOk={handleStaffSubmit}
          onCancel={() => setStaffModalVisible(false)}
          width={600}
        >
          <Form
            form={staffForm}
            layout="vertical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Staff Name"
                  rules={[{ required: true, message: 'Please enter staff name' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="role"
                  label="Role"
                  rules={[{ required: true, message: 'Please enter staff role' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="baseCommissionRate"
              label="Base Commission Rate (%)"
              rules={[{ required: true, message: 'Please enter base commission rate' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} max={20} step={0.5} />
            </Form.Item>
            
            <Form.Item
              name="currentTier"
              label="Current Tier"
            >
              <Select>
                {commissionTiers.map(tier => (
                  <Option key={tier.id} value={tier.name}>{tier.name}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="eligibleForBonus"
              valuePropName="checked"
              label="Eligible for Bonuses"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="customRules"
              label="Custom Rules"
            >
              <Select mode="multiple" placeholder="Select custom rules">
                {commissionRules.map(rule => (
                  <Option key={rule.id} value={rule.name}>{rule.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default CommissionSettings; 