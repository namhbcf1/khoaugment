import React, { useState } from 'react';
import {
  Card,
  Typography,
  Tabs,
  Table,
  Button,
  Space,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Badge,
  Tag,
  Tooltip,
  Divider,
  Statistic,
  Alert,
  List,
  Avatar,
  Menu,
  Dropdown
} from 'antd';
import {
  FileTextOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
  ShareAltOutlined,
  StarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  ScheduleOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  PrinterOutlined,
  MailOutlined,
  MoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Sample report categories
const reportCategories = [
  { key: 'sales', name: 'Sales Reports', icon: <DollarOutlined /> },
  { key: 'inventory', name: 'Inventory Reports', icon: <BarChartOutlined /> },
  { key: 'customer', name: 'Customer Reports', icon: <TeamOutlined /> },
  { key: 'staff', name: 'Staff Performance', icon: <LineChartOutlined /> },
  { key: 'financial', name: 'Financial Reports', icon: <PieChartOutlined /> }
];

// Sample reports data
const reportsData = [
  {
    id: 1,
    name: 'Daily Sales Summary',
    category: 'sales',
    description: 'Summary of daily sales transactions',
    lastRun: '2023-10-15',
    scheduledFrequency: 'daily',
    format: 'excel',
    creator: 'System',
    starred: true
  },
  {
    id: 2,
    name: 'Monthly Revenue Analysis',
    category: 'financial',
    description: 'Detailed monthly revenue breakdown by product categories',
    lastRun: '2023-10-01',
    scheduledFrequency: 'monthly',
    format: 'pdf',
    creator: 'Admin',
    starred: true
  },
  {
    id: 3,
    name: 'Inventory Stock Levels',
    category: 'inventory',
    description: 'Current stock levels and reorder points',
    lastRun: '2023-10-14',
    scheduledFrequency: 'weekly',
    format: 'excel',
    creator: 'System',
    starred: false
  },
  {
    id: 4,
    name: 'Top Selling Products',
    category: 'sales',
    description: 'Ranking of products by sales volume and revenue',
    lastRun: '2023-10-10',
    scheduledFrequency: 'weekly',
    format: 'pdf',
    creator: 'Admin',
    starred: false
  },
  {
    id: 5,
    name: 'Customer Retention Analysis',
    category: 'customer',
    description: 'Analysis of customer retention and repeat purchase patterns',
    lastRun: '2023-09-30',
    scheduledFrequency: 'monthly',
    format: 'excel',
    creator: 'Marketing Manager',
    starred: true
  },
  {
    id: 6,
    name: 'Staff Performance Metrics',
    category: 'staff',
    description: 'Performance evaluation metrics for all staff members',
    lastRun: '2023-10-05',
    scheduledFrequency: 'monthly',
    format: 'pdf',
    creator: 'HR Manager',
    starred: false
  },
  {
    id: 7,
    name: 'Quarterly Financial Statement',
    category: 'financial',
    description: 'Complete quarterly financial report with P&L statement',
    lastRun: '2023-09-30',
    scheduledFrequency: 'quarterly',
    format: 'pdf',
    creator: 'Finance Director',
    starred: true
  },
  {
    id: 8,
    name: 'Low Stock Alert',
    category: 'inventory',
    description: 'Products with inventory levels below reorder point',
    lastRun: '2023-10-15',
    scheduledFrequency: 'daily',
    format: 'excel',
    creator: 'System',
    starred: false
  }
];

// Sample recently viewed reports
const recentReports = [
  {
    id: 1,
    name: 'Daily Sales Summary',
    viewedAt: '2023-10-15 14:30',
    category: 'sales'
  },
  {
    id: 5,
    name: 'Customer Retention Analysis',
    viewedAt: '2023-10-14 11:20',
    category: 'customer'
  },
  {
    id: 3,
    name: 'Inventory Stock Levels',
    viewedAt: '2023-10-14 09:45',
    category: 'inventory'
  },
  {
    id: 7,
    name: 'Quarterly Financial Statement',
    viewedAt: '2023-10-13 16:15',
    category: 'financial'
  }
];

// Sample scheduled reports
const scheduledReports = [
  {
    id: 1,
    name: 'Daily Sales Summary',
    nextRun: '2023-10-16 00:00',
    frequency: 'Daily',
    recipients: ['admin@truongphat.com', 'sales@truongphat.com']
  },
  {
    id: 3,
    name: 'Inventory Stock Levels',
    nextRun: '2023-10-21 00:00',
    frequency: 'Weekly',
    recipients: ['admin@truongphat.com', 'inventory@truongphat.com']
  },
  {
    id: 8,
    name: 'Low Stock Alert',
    nextRun: '2023-10-16 08:00',
    frequency: 'Daily',
    recipients: ['inventory@truongphat.com', 'purchasing@truongphat.com']
  }
];

const ReportCenter = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [starred, setStarred] = useState(reportsData.map(report => report.starred));
  
  // Filter reports based on search, category and format
  const filteredReports = reportsData.filter(report => {
    const matchesSearch = !searchText || 
                         report.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !selectedCategory || report.category === selectedCategory;
    const matchesFormat = !selectedFormat || report.format === selectedFormat;
    
    return matchesSearch && matchesCategory && matchesFormat;
  });
  
  // Toggle starred status
  const toggleStar = (reportId) => {
    const newStarred = [...starred];
    const reportIndex = reportsData.findIndex(report => report.id === reportId);
    newStarred[reportIndex] = !newStarred[reportIndex];
    setStarred(newStarred);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchText('');
    setSelectedCategory(null);
    setSelectedFormat(null);
    setSelectedDateRange([dayjs().subtract(30, 'days'), dayjs()]);
  };
  
  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'sales':
        return 'green';
      case 'inventory':
        return 'blue';
      case 'customer':
        return 'purple';
      case 'staff':
        return 'orange';
      case 'financial':
        return 'red';
      default:
        return 'default';
    }
  };
  
  // Get format icon
  const getFormatIcon = (format) => {
    switch (format) {
      case 'pdf':
        return <FileTextOutlined style={{ color: '#ff4d4f' }} />;
      case 'excel':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      case 'csv':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      default:
        return <FileTextOutlined />;
    }
  };
  
  // Reports table columns
  const reportsColumns = [
    {
      title: 'Report Name',
      key: 'name',
      render: (text, record, index) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={starred[index] ? <StarOutlined style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={() => toggleStar(record.id)}
            style={{ marginRight: 8 }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{record.description}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Tag>
      ),
      filters: reportCategories.map(category => ({
        text: category.name,
        value: category.key
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Format',
      dataIndex: 'format',
      key: 'format',
      render: (format) => (
        <Space>
          {getFormatIcon(format)}
          <span>{format.toUpperCase()}</span>
        </Space>
      ),
      filters: [
        { text: 'PDF', value: 'pdf' },
        { text: 'Excel', value: 'excel' },
        { text: 'CSV', value: 'csv' }
      ],
      onFilter: (value, record) => record.format === value,
    },
    {
      title: 'Last Generated',
      dataIndex: 'lastRun',
      key: 'lastRun',
      sorter: (a, b) => new Date(a.lastRun) - new Date(b.lastRun),
    },
    {
      title: 'Frequency',
      dataIndex: 'scheduledFrequency',
      key: 'scheduledFrequency',
      render: (frequency) => (
        <Badge
          status={frequency === 'daily' ? 'processing' : frequency === 'weekly' ? 'success' : 'default'}
          text={frequency.charAt(0).toUpperCase() + frequency.slice(1)}
        />
      ),
      filters: [
        { text: 'Daily', value: 'daily' },
        { text: 'Weekly', value: 'weekly' },
        { text: 'Monthly', value: 'monthly' },
        { text: 'Quarterly', value: 'quarterly' },
        { text: 'Yearly', value: 'yearly' }
      ],
      onFilter: (value, record) => record.scheduledFrequency === value,
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Report">
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Download Report">
            <Button type="text" icon={<DownloadOutlined />} />
          </Tooltip>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1" icon={<ScheduleOutlined />}>Schedule</Menu.Item>
                <Menu.Item key="2" icon={<MailOutlined />}>Email</Menu.Item>
                <Menu.Item key="3" icon={<PrinterOutlined />}>Print</Menu.Item>
                <Menu.Item key="4" icon={<ShareAltOutlined />}>Share</Menu.Item>
              </Menu>
            }
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="report-center-container" style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2}><FileTextOutlined /> Report Center</Title>
            <Paragraph>Access, generate, and schedule all system reports</Paragraph>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<BarChartOutlined />}>
                Generate New Report
              </Button>
              <RangePicker
                value={selectedDateRange}
                onChange={setSelectedDateRange}
              />
            </Space>
          </Col>
        </Row>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={<span><FileTextOutlined /> All Reports</span>}
            key="1"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Alert 
                  message="Report Management" 
                  description="Browse, search, and manage all system reports. Use the filters to quickly find specific reports." 
                  type="info" 
                  showIcon 
                  style={{ marginBottom: 16 }} 
                />
                
                {/* Report Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col flex="auto">
                    <Input.Search
                      placeholder="Search reports by name or description"
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col>
                    <Select
                      placeholder="Category"
                      style={{ width: 150 }}
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      allowClear
                    >
                      {reportCategories.map(category => (
                        <Option key={category.key} value={category.key}>
                          <Space>
                            {category.icon}
                            {category.name}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col>
                    <Select
                      placeholder="Format"
                      style={{ width: 120 }}
                      value={selectedFormat}
                      onChange={setSelectedFormat}
                      allowClear
                    >
                      <Option value="pdf">PDF</Option>
                      <Option value="excel">Excel</Option>
                      <Option value="csv">CSV</Option>
                    </Select>
                  </Col>
                  <Col>
                    <Button
                      icon={<FilterOutlined />}
                      onClick={resetFilters}
                    >
                      Reset
                    </Button>
                  </Col>
                </Row>

                <Table
                  columns={reportsColumns}
                  dataSource={filteredReports}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={<span><StarOutlined /> Favorites</span>}
            key="2"
          >
            <Alert 
              message="Favorite Reports" 
              description="Quick access to your starred reports. Star any report to add it to this list." 
              type="info" 
              showIcon 
              style={{ marginBottom: 16 }} 
            />
            
            <Table
              columns={reportsColumns}
              dataSource={filteredReports.filter((_, index) => starred[index])}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane
            tab={<span><ClockCircleOutlined /> Scheduled</span>}
            key="3"
          >
            <Alert 
              message="Scheduled Reports" 
              description="View and manage automatically generated reports based on your defined schedules." 
              type="info" 
              showIcon 
              style={{ marginBottom: 16 }} 
            />
            
            <List
              itemLayout="horizontal"
              dataSource={scheduledReports}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<EditOutlined />}>Edit</Button>,
                    <Button type="link" danger icon={<DeleteOutlined />}>Cancel</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<ScheduleOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={item.name}
                    description={
                      <>
                        <Space>
                          <CalendarOutlined /> Next run: {item.nextRun}
                        </Space>
                        <br />
                        <Space>
                          <HistoryOutlined /> Frequency: {item.frequency}
                        </Space>
                        <br />
                        <Space>
                          <MailOutlined /> Recipients: {item.recipients.join(', ')}
                        </Space>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane
            tab={<span><HistoryOutlined /> Recent</span>}
            key="4"
          >
            <Alert 
              message="Recently Viewed Reports" 
              description="Quick access to reports you've recently viewed or generated." 
              type="info" 
              showIcon 
              style={{ marginBottom: 16 }} 
            />
            
            <List
              itemLayout="horizontal"
              dataSource={recentReports}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button type="text" icon={<EyeOutlined />}>View</Button>,
                    <Button type="text" icon={<DownloadOutlined />}>Download</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<FileTextOutlined />} 
                        style={{ backgroundColor: getCategoryColor(item.category) }} 
                      />
                    }
                    title={item.name}
                    description={
                      <Text type="secondary">
                        <ClockCircleOutlined /> Viewed on {item.viewedAt}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReportCenter; 