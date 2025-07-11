import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tabs,
  Table,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Badge,
  Tooltip,
  Row,
  Col,
  Divider,
  Alert,
  Popconfirm,
  Steps,
  message,
  Checkbox,
  Tree,
  Empty,
  List,
  Avatar,
  Radio
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  ScheduleOutlined,
  HistoryOutlined,
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  CalendarOutlined,
  TeamOutlined,
  MailOutlined,
  BarsOutlined,
  DragOutlined,
  SettingOutlined,
  EyeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Report templates data
const reportTemplates = [
  {
    id: 1,
    name: 'Sales Summary',
    description: 'Overview of sales performance with key metrics',
    category: 'Sales',
    fields: ['date', 'product', 'quantity', 'revenue', 'profit'],
    thumbnail: 'sales-summary.png'
  },
  {
    id: 2,
    name: 'Inventory Status',
    description: 'Current inventory levels and stock movements',
    category: 'Inventory',
    fields: ['sku', 'product', 'stock', 'reorder_level', 'last_restock'],
    thumbnail: 'inventory-status.png'
  },
  {
    id: 3,
    name: 'Customer Insights',
    description: 'Customer demographics and purchase patterns',
    category: 'Customer',
    fields: ['customer', 'segment', 'total_spent', 'orders', 'last_purchase'],
    thumbnail: 'customer-insights.png'
  },
  {
    id: 4,
    name: 'Staff Performance',
    description: 'Employee sales and productivity metrics',
    category: 'Staff',
    fields: ['staff', 'sales', 'customers', 'average_sale', 'commission'],
    thumbnail: 'staff-performance.png'
  },
  {
    id: 5,
    name: 'Financial Statement',
    description: 'Income, expenses, and profit breakdown',
    category: 'Financial',
    fields: ['date', 'revenue', 'cogs', 'expenses', 'profit'],
    thumbnail: 'financial-statement.png'
  }
];

// Saved reports data
const savedReports = [
  {
    id: 1,
    name: 'Monthly Sales by Category',
    type: 'Sales',
    created: '2023-08-15',
    lastRun: '2023-10-01',
    schedule: 'Monthly',
    creator: 'admin@truongphat.com'
  },
  {
    id: 2,
    name: 'Low Stock Products Alert',
    type: 'Inventory',
    created: '2023-07-22',
    lastRun: '2023-10-05',
    schedule: 'Weekly',
    creator: 'admin@truongphat.com'
  },
  {
    id: 3,
    name: 'Top Customers by Revenue',
    type: 'Customer',
    created: '2023-09-10',
    lastRun: '2023-10-01',
    schedule: 'Monthly',
    creator: 'admin@truongphat.com'
  },
  {
    id: 4,
    name: 'Staff Commission Report',
    type: 'Staff',
    created: '2023-06-05',
    lastRun: '2023-09-30',
    schedule: 'Monthly',
    creator: 'admin@truongphat.com'
  },
  {
    id: 5,
    name: 'Quarterly Profit Analysis',
    type: 'Financial',
    created: '2023-04-01',
    lastRun: '2023-07-01',
    schedule: 'Quarterly',
    creator: 'admin@truongphat.com'
  }
];

// Available fields for drag and drop
const availableFields = {
  Sales: [
    { id: 'date', name: 'Date', type: 'date' },
    { id: 'product', name: 'Product', type: 'string' },
    { id: 'category', name: 'Category', type: 'string' },
    { id: 'quantity', name: 'Quantity', type: 'number' },
    { id: 'unit_price', name: 'Unit Price', type: 'currency' },
    { id: 'total', name: 'Total', type: 'currency' },
    { id: 'discount', name: 'Discount', type: 'currency' },
    { id: 'payment_method', name: 'Payment Method', type: 'string' },
    { id: 'staff', name: 'Staff Member', type: 'string' },
    { id: 'customer', name: 'Customer', type: 'string' }
  ],
  Inventory: [
    { id: 'sku', name: 'SKU', type: 'string' },
    { id: 'product', name: 'Product Name', type: 'string' },
    { id: 'category', name: 'Category', type: 'string' },
    { id: 'stock_level', name: 'Stock Level', type: 'number' },
    { id: 'reorder_point', name: 'Reorder Point', type: 'number' },
    { id: 'cost', name: 'Cost', type: 'currency' },
    { id: 'supplier', name: 'Supplier', type: 'string' },
    { id: 'last_restock', name: 'Last Restock Date', type: 'date' },
    { id: 'location', name: 'Storage Location', type: 'string' },
    { id: 'status', name: 'Status', type: 'string' }
  ],
  Customer: [
    { id: 'name', name: 'Customer Name', type: 'string' },
    { id: 'email', name: 'Email', type: 'string' },
    { id: 'phone', name: 'Phone', type: 'string' },
    { id: 'segment', name: 'Segment', type: 'string' },
    { id: 'total_orders', name: 'Total Orders', type: 'number' },
    { id: 'total_spent', name: 'Total Spent', type: 'currency' },
    { id: 'last_purchase', name: 'Last Purchase Date', type: 'date' },
    { id: 'loyalty_points', name: 'Loyalty Points', type: 'number' },
    { id: 'acquisition', name: 'Acquisition Source', type: 'string' },
    { id: 'city', name: 'City', type: 'string' }
  ],
  Financial: [
    { id: 'date', name: 'Date', type: 'date' },
    { id: 'revenue', name: 'Revenue', type: 'currency' },
    { id: 'cost_of_goods', name: 'Cost of Goods', type: 'currency' },
    { id: 'gross_profit', name: 'Gross Profit', type: 'currency' },
    { id: 'expenses', name: 'Expenses', type: 'currency' },
    { id: 'net_profit', name: 'Net Profit', type: 'currency' },
    { id: 'tax', name: 'Tax', type: 'currency' },
    { id: 'category', name: 'Category', type: 'string' },
    { id: 'department', name: 'Department', type: 'string' },
    { id: 'payment_status', name: 'Payment Status', type: 'string' }
  ]
};

// Draggable field component
const DraggableField = ({ field, onRemove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FIELD',
    item: { field },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        padding: '8px 12px',
        marginBottom: '8px',
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div>
        <DragOutlined style={{ marginRight: '8px', color: '#999' }} />
        <Text>{field.name}</Text>
        <Tag size="small" style={{ marginLeft: '8px' }}>{field.type}</Tag>
      </div>
      {onRemove && (
        <Button 
          type="text" 
          size="small" 
          danger
          icon={<DeleteOutlined />} 
          onClick={() => onRemove(field)}
        />
      )}
    </div>
  );
};

// Droppable area component
const DroppableArea = ({ fields, onDrop, onRemove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'FIELD',
    drop: (item) => onDrop(item.field),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <div
      ref={drop}
      style={{
        minHeight: '200px',
        padding: '16px',
        backgroundColor: isOver ? '#f0f5ff' : '#fafafa',
        border: '1px dashed #d9d9d9',
        borderRadius: '4px',
        transition: 'all 0.3s'
      }}
    >
      {fields.length === 0 ? (
        <Empty description="Drop fields here to add them to your report" />
      ) : (
        fields.map((field, index) => (
          <DraggableField 
            key={`${field.id}-${index}`} 
            field={field} 
            onRemove={onRemove}
          />
        ))
      )}
    </div>
  );
};

const CustomReports = () => {
  const [activeTab, setActiveTab] = useState('saved');
  const [currentStep, setCurrentStep] = useState(0);
  const [reportType, setReportType] = useState('Sales');
  const [selectedFields, setSelectedFields] = useState([]);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [dateRange, setDateRange] = useState([]);
  
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  const handleReportTypeChange = (value) => {
    setReportType(value);
    setSelectedFields([]);
  };
  
  const handleFieldDrop = (field) => {
    // Check if field already exists
    if (!selectedFields.some(f => f.id === field.id)) {
      setSelectedFields([...selectedFields, field]);
    }
  };
  
  const handleFieldRemove = (fieldToRemove) => {
    setSelectedFields(selectedFields.filter(field => field.id !== fieldToRemove.id));
  };
  
  const handleTemplateSelect = (template) => {
    setReportType(template.category);
    setReportName(`${template.name} Copy`);
    setReportDescription(template.description);
    
    // Convert template fields to field objects
    const fieldsFromTemplate = template.fields
      .map(fieldId => {
        const fieldCategory = availableFields[template.category];
        return fieldCategory.find(f => f.id === fieldId);
      })
      .filter(Boolean);
    
    setSelectedFields(fieldsFromTemplate);
    setActiveTab('create');
    setCurrentStep(1);
  };
  
  const handleSaveReport = () => {
    message.success(`Report "${reportName}" has been saved`);
    setActiveTab('saved');
    resetForm();
  };
  
  const resetForm = () => {
    setCurrentStep(0);
    setReportName('');
    setReportDescription('');
    setReportType('Sales');
    setSelectedFields([]);
    setDateRange([]);
  };
  
  const handleDeleteReport = (reportId) => {
    message.success('Report deleted successfully');
  };
  
  const handleRunReport = (reportId) => {
    message.success('Report is running. It will be available shortly.');
  };
  
  const steps = [
    {
      title: 'Select Fields',
      content: (
        <DndProvider backend={HTML5Backend}>
          <Row gutter={24}>
            <Col span={12}>
              <Title level={5}>Available Fields</Title>
              <div style={{ marginBottom: '16px' }}>
                <Select
                  value={reportType}
                  style={{ width: '100%' }}
                  onChange={handleReportTypeChange}
                >
                  <Option value="Sales">Sales Data</Option>
                  <Option value="Inventory">Inventory Data</Option>
                  <Option value="Customer">Customer Data</Option>
                  <Option value="Financial">Financial Data</Option>
                </Select>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px 0' }}>
                {availableFields[reportType]?.map(field => (
                  <DraggableField key={field.id} field={field} />
                ))}
              </div>
            </Col>
            <Col span={12}>
              <Title level={5}>Selected Fields</Title>
              <Paragraph type="secondary">
                Drag fields from the left panel. Reorder fields by dragging.
              </Paragraph>
              <DroppableArea 
                fields={selectedFields} 
                onDrop={handleFieldDrop} 
                onRemove={handleFieldRemove} 
              />
            </Col>
          </Row>
        </DndProvider>
      )
    },
    {
      title: 'Configure Options',
      content: (
        <Form layout="vertical">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Report Name"
                required
                tooltip="A descriptive name for your report"
              >
                <Input 
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                />
              </Form.Item>
              
              <Form.Item
                label="Description"
                tooltip="Brief description of what this report shows"
              >
                <Input.TextArea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Enter report description"
                  rows={4}
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Date Range"
                tooltip="Default date range for this report"
              >
                <RangePicker 
                  style={{ width: '100%' }}
                  value={dateRange}
                  onChange={setDateRange}
                />
              </Form.Item>
              
              <Form.Item
                label="Sort By"
              >
                <Select placeholder="Select field to sort by">
                  {selectedFields.map(field => (
                    <Option key={field.id} value={field.id}>{field.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                label="Sort Direction"
              >
                <Radio.Group defaultValue="desc">
                  <Radio value="asc">Ascending</Radio>
                  <Radio value="desc">Descending</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          <Form.Item
            label="Filters"
            tooltip="Add conditions to filter your report data"
          >
            <Button type="dashed" icon={<PlusOutlined />} style={{ width: '100%' }}>
              Add Filter
            </Button>
          </Form.Item>
          
          <Form.Item
            label="Grouping"
            tooltip="Group your results by specific fields"
          >
            <Select 
              mode="multiple"
              placeholder="Select fields to group by"
              style={{ width: '100%' }}
            >
              {selectedFields.map(field => (
                <Option key={field.id} value={field.id}>{field.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      )
    },
    {
      title: 'Schedule & Share',
      content: (
        <Form layout="vertical">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Schedule Report"
                tooltip="Set up automatic report generation"
              >
                <Select defaultValue="none">
                  <Option value="none">No Schedule (Run Manually)</Option>
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="quarterly">Quarterly</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                label="Run Time"
                tooltip="When should the report be generated"
              >
                <DatePicker picker="time" format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Recipients"
                tooltip="Who should receive this report"
              >
                <Select
                  mode="multiple"
                  placeholder="Select recipients"
                  style={{ width: '100%' }}
                >
                  <Option value="admin@truongphat.com">Admin</Option>
                  <Option value="manager@truongphat.com">Store Manager</Option>
                  <Option value="inventory@truongphat.com">Inventory Team</Option>
                  <Option value="sales@truongphat.com">Sales Team</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                label="Export Format"
              >
                <Radio.Group defaultValue="pdf">
                  <Radio.Button value="pdf">PDF</Radio.Button>
                  <Radio.Button value="excel">Excel</Radio.Button>
                  <Radio.Button value="csv">CSV</Radio.Button>
                  <Radio.Button value="html">HTML</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          <Form.Item label="Advanced Options">
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={12}>
                  <Checkbox value="includeCharts">Include Charts</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="includeFooter">Include Footer Summary</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="compress">Compress Output</Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox value="storeHistory">Store Report History</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      )
    }
  ];
  
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const savedReportColumns = [
    {
      title: 'Report Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          'Sales': 'blue',
          'Inventory': 'green',
          'Customer': 'purple',
          'Staff': 'orange',
          'Financial': 'red',
        };
        
        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule) => (
        schedule ? (
          <Badge 
            status="processing" 
            text={schedule} 
          />
        ) : 'Manual'
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Run Now">
            <Button
              icon={<ScheduleOutlined />}
              size="small"
              onClick={() => handleRunReport(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              icon={<DownloadOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this report?"
              onConfirm={() => handleDeleteReport(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  const renderSavedReports = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Space>
          <Input.Search placeholder="Search reports" style={{ width: '250px' }} />
          <Select defaultValue="all" style={{ width: '150px' }}>
            <Option value="all">All Types</Option>
            <Option value="Sales">Sales</Option>
            <Option value="Inventory">Inventory</Option>
            <Option value="Customer">Customer</Option>
            <Option value="Staff">Staff</Option>
            <Option value="Financial">Financial</Option>
          </Select>
        </Space>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setActiveTab('create');
            resetForm();
          }}
        >
          Create New Report
        </Button>
      </div>
      
      <Table
        columns={savedReportColumns}
        dataSource={savedReports}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
  
  const renderTemplates = () => (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Input.Search placeholder="Search templates" style={{ width: '250px' }} />
      </div>
      
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 2,
          lg: 3,
          xl: 3,
          xxl: 4,
        }}
        dataSource={reportTemplates}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div style={{ 
                  height: '120px', 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: '#f0f2f5'
                }}>
                  <FileTextOutlined style={{ fontSize: '48px', opacity: 0.5 }} />
                </div>
              }
              actions={[
                <Tooltip title="Preview">
                  <EyeOutlined key="view" />
                </Tooltip>,
                <Tooltip title="Use Template">
                  <Button 
                    type="link" 
                    icon={<PlusOutlined />} 
                    onClick={() => handleTemplateSelect(item)}
                  >
                    Use
                  </Button>
                </Tooltip>
              ]}
            >
              <Card.Meta
                title={item.name}
                description={
                  <div>
                    <Tag color="blue" style={{ marginBottom: '8px' }}>{item.category}</Tag>
                    <div>{item.description}</div>
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
  
  const renderHistory = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Space>
          <Input.Search placeholder="Search history" style={{ width: '250px' }} />
          <RangePicker />
        </Space>
      </div>
      
      <Table
        columns={[
          {
            title: 'Report',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: 'Generated',
            dataIndex: 'generated',
            key: 'generated',
            render: (date) => (
              <Space>
                <ClockCircleOutlined /> {date}
              </Space>
            ),
          },
          {
            title: 'By',
            dataIndex: 'user',
            key: 'user',
          },
          {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
          },
          {
            title: 'Actions',
            key: 'actions',
            render: () => (
              <Space>
                <Button icon={<DownloadOutlined />} size="small">Download</Button>
                <Button icon={<ShareAltOutlined />} size="small">Share</Button>
              </Space>
            ),
          },
        ]}
        dataSource={[
          {
            id: 1,
            name: 'Monthly Sales by Category',
            generated: '2023-10-01 08:00',
            user: 'System (Scheduled)',
            size: '2.4 MB'
          },
          {
            id: 2,
            name: 'Low Stock Products Alert',
            generated: '2023-10-05 09:15',
            user: 'System (Scheduled)',
            size: '1.8 MB'
          },
          {
            id: 3,
            name: 'Top Customers by Revenue',
            generated: '2023-10-01 08:30',
            user: 'System (Scheduled)',
            size: '3.2 MB'
          },
          {
            id: 4,
            name: 'Custom Sales Report',
            generated: '2023-10-03 14:22',
            user: 'admin@truongphat.com',
            size: '1.5 MB'
          },
          {
            id: 5,
            name: 'Weekly Inventory Summary',
            generated: '2023-09-28 08:00',
            user: 'System (Scheduled)',
            size: '4.7 MB'
          },
        ]}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
  
  const renderCreateReport = () => (
    <Card>
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map(item => (
          <Steps.Step key={item.title} title={item.title} />
        ))}
      </Steps>
      
      <div style={{ marginBottom: 24, minHeight: '400px' }}>
        {steps[currentStep].content}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          {currentStep > 0 && (
            <Button style={{ marginRight: 8 }} onClick={prevStep}>
              Previous
            </Button>
          )}
        </div>
        <div>
          <Button style={{ marginRight: 8 }} onClick={() => setActiveTab('saved')}>
            Cancel
          </Button>
          
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={nextStep}>
              Next
            </Button>
          )}
          
          {currentStep === steps.length - 1 && (
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={handleSaveReport}
              disabled={!reportName}
            >
              Save Report
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>
          <FileTextOutlined /> Custom Reports
        </Title>
      </div>
      
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane 
          tab={
            <span>
              <BarsOutlined /> Saved Reports
            </span>
          } 
          key="saved"
        >
          {renderSavedReports()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <SettingOutlined /> Templates
            </span>
          } 
          key="templates"
        >
          {renderTemplates()}
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <HistoryOutlined /> Report History
            </span>
          } 
          key="history"
        >
          {renderHistory()}
        </TabPane>
        
        {activeTab === 'create' && (
          <TabPane 
            tab={
              <span>
                <PlusOutlined /> Create Report
              </span>
            } 
            key="create"
          >
            {renderCreateReport()}
          </TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default CustomReports; 