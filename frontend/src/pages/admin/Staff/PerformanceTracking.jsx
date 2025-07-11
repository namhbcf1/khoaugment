import React, { useState } from 'react';
import {
  Card,
  Table,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Space,
  Tag,
  Divider,
  Badge,
  Alert,
  Tooltip,
  Empty
} from 'antd';
import {
  LineChartOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  RiseOutlined,
  TrophyOutlined,
  StarOutlined,
  BarChartOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  PieChartOutlined,
  DotChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Sample staff data
const staffData = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    role: 'Sales Manager',
    department: 'Sales',
    salesPerformance: 95,
    customerSatisfaction: 92,
    attendanceRate: 98,
    targetCompletion: 110,
    badges: ['Top Performer', 'Customer Champion'],
    status: 'outstanding',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: 2,
    name: 'Trần Thị B',
    role: 'Sales Staff',
    department: 'Sales',
    salesPerformance: 88,
    customerSatisfaction: 95,
    attendanceRate: 92,
    targetCompletion: 103,
    badges: ['Customer Champion'],
    status: 'good',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: 3,
    name: 'Lê Văn C',
    role: 'Technician',
    department: 'Technical',
    salesPerformance: 60,
    customerSatisfaction: 85,
    attendanceRate: 95,
    targetCompletion: 90,
    badges: ['Tech Wizard'],
    status: 'average',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    role: 'Cashier',
    department: 'Operations',
    salesPerformance: 70,
    customerSatisfaction: 80,
    attendanceRate: 97,
    targetCompletion: 85,
    badges: [],
    status: 'average',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
  },
  {
    id: 5,
    name: 'Hoàng Văn E',
    role: 'Sales Staff',
    department: 'Sales',
    salesPerformance: 65,
    customerSatisfaction: 75,
    attendanceRate: 85,
    targetCompletion: 75,
    badges: [],
    status: 'needs_improvement',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg'
  }
];

// Sample KPI data
const kpiCategories = [
  {
    key: 'sales',
    name: 'Sales Performance',
    metrics: [
      { key: 'sales_value', name: 'Sales Value', target: 100000000, unit: 'VND' },
      { key: 'sales_count', name: 'Number of Sales', target: 50, unit: 'transactions' },
      { key: 'upsell_rate', name: 'Upsell Rate', target: 30, unit: '%' },
      { key: 'conversion_rate', name: 'Conversion Rate', target: 25, unit: '%' }
    ]
  },
  {
    key: 'customer',
    name: 'Customer Service',
    metrics: [
      { key: 'satisfaction_score', name: 'Satisfaction Score', target: 90, unit: '%' },
      { key: 'response_time', name: 'Response Time', target: 15, unit: 'minutes' },
      { key: 'resolution_time', name: 'Issue Resolution Time', target: 2, unit: 'days' },
      { key: 'repeat_customers', name: 'Repeat Customers', target: 60, unit: '%' }
    ]
  },
  {
    key: 'operational',
    name: 'Operational Efficiency',
    metrics: [
      { key: 'attendance', name: 'Attendance Rate', target: 95, unit: '%' },
      { key: 'task_completion', name: 'Task Completion Rate', target: 90, unit: '%' },
      { key: 'process_adherence', name: 'Process Adherence', target: 95, unit: '%' },
      { key: 'error_rate', name: 'Error Rate', target: 5, unit: '%' }
    ]
  }
];

// Sample performance data by month
const performanceByMonth = [
  { month: 'Jan', sales: 85, service: 80, efficiency: 90 },
  { month: 'Feb', sales: 88, service: 82, efficiency: 92 },
  { month: 'Mar', sales: 90, service: 85, efficiency: 88 },
  { month: 'Apr', sales: 92, service: 88, efficiency: 90 },
  { month: 'May', sales: 89, service: 90, efficiency: 91 },
  { month: 'Jun', sales: 95, service: 92, efficiency: 94 }
];

const PerformanceTracking = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [searchText, setSearchText] = useState('');
  
  // Filter staff data based on selected filters
  const filteredStaff = staffData.filter(staff => {
    return (!selectedDepartment || staff.department === selectedDepartment) &&
           (!selectedRole || staff.role === selectedRole) &&
           (!searchText || 
             staff.name.toLowerCase().includes(searchText.toLowerCase()) ||
             staff.role.toLowerCase().includes(searchText.toLowerCase()));
  });
  
  // Calculate overall performance scores
  const calculateOverallScore = (staff) => {
    return Math.round(
      (staff.salesPerformance * 0.4) + 
      (staff.customerSatisfaction * 0.3) + 
      (staff.attendanceRate * 0.1) + 
      (staff.targetCompletion * 0.2)
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedDepartment(null);
    setSelectedRole(null);
    setSearchText('');
    setSelectedDateRange([dayjs().subtract(30, 'day'), dayjs()]);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'outstanding':
        return '#52c41a';
      case 'good':
        return '#1890ff';
      case 'average':
        return '#faad14';
      case 'needs_improvement':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };
  
  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'outstanding':
        return 'Outstanding';
      case 'good':
        return 'Good';
      case 'average':
        return 'Average';
      case 'needs_improvement':
        return 'Needs Improvement';
      default:
        return 'Unknown';
    }
  };
  
  // Staff performance table columns
  const staffColumns = [
    {
      title: 'Staff',
      key: 'staff',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', marginRight: 12 }}>
            <img src={record.avatar} alt={record.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{record.role}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      filters: [...new Set(staffData.map(item => item.department))].map(dept => ({
        text: dept,
        value: dept
      })),
      onFilter: (value, record) => record.department === value,
    },
    {
      title: 'Sales',
      dataIndex: 'salesPerformance',
      key: 'salesPerformance',
      render: value => <Progress percent={value} size="small" />,
      sorter: (a, b) => a.salesPerformance - b.salesPerformance,
    },
    {
      title: 'Customer Sat.',
      dataIndex: 'customerSatisfaction',
      key: 'customerSatisfaction',
      render: value => <Progress percent={value} size="small" status="success" />,
      sorter: (a, b) => a.customerSatisfaction - b.customerSatisfaction,
    },
    {
      title: 'Attendance',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      render: value => <Progress percent={value} size="small" />,
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
    },
    {
      title: 'Target %',
      dataIndex: 'targetCompletion',
      key: 'targetCompletion',
      render: value => `${value}%`,
      sorter: (a, b) => a.targetCompletion - b.targetCompletion,
    },
    {
      title: 'Overall',
      key: 'overall',
      render: (text, record) => {
        const score = calculateOverallScore(record);
        let status = 'normal';
        if (score >= 90) status = 'success';
        else if (score < 70) status = 'exception';
        
        return <Progress percent={score} size="small" status={status} />;
      },
      sorter: (a, b) => calculateOverallScore(a) - calculateOverallScore(b),
    },
    {
      title: 'Status',
      key: 'status',
      render: (text, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
      filters: [
        { text: 'Outstanding', value: 'outstanding' },
        { text: 'Good', value: 'good' },
        { text: 'Average', value: 'average' },
        { text: 'Needs Improvement', value: 'needs_improvement' }
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // KPI metrics table columns
  const kpiColumns = [
    {
      title: 'Metric',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Target',
      key: 'target',
      render: (text, record) => `${record.target} ${record.unit}`,
    },
    {
      title: 'Current',
      key: 'current',
      render: () => {
        // Generate random current value for demo
        const randomPercent = Math.floor(Math.random() * 40) + 60;
        return `${Math.round(randomPercent / 100 * staffData[0].targetCompletion)}%`;
      },
    },
    {
      title: 'Progress',
      key: 'progress',
      render: () => {
        // Generate random progress for demo
        const randomPercent = Math.floor(Math.random() * 40) + 60;
        return <Progress percent={randomPercent} size="small" />;
      },
    },
  ];

  return (
    <div className="performance-tracking-container" style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2}><LineChartOutlined /> Staff Performance Tracking</Title>
            <Paragraph>Track and analyze staff performance metrics and KPIs</Paragraph>
          </Col>
          <Col>
            <Space>
              <Button icon={<DownloadOutlined />}>
                Export Report
              </Button>
              <Select 
                style={{ width: 200 }}
                placeholder="Select Time Period"
                defaultValue="last30days"
              >
                <Option value="last7days">Last 7 Days</Option>
                <Option value="last30days">Last 30 Days</Option>
                <Option value="last90days">Last 90 Days</Option>
                <Option value="thisYear">This Year</Option>
                <Option value="custom">Custom Range</Option>
              </Select>
            </Space>
          </Col>
        </Row>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={<span><TeamOutlined /> Staff Overview</span>}
            key="1"
          >
            <Alert 
              message="Performance Overview" 
              description="This dashboard shows the performance metrics of all staff members. Use the filters to narrow down results."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            {/* Performance Summary Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic 
                    title="Average Performance" 
                    value={85}
                    suffix="%" 
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<RiseOutlined />}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Progress percent={85} size="small" />
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic 
                    title="Top Performers" 
                    value={2} 
                    prefix={<TrophyOutlined />}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">40% of total staff</Text>
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic 
                    title="Customer Satisfaction" 
                    value={88} 
                    suffix="%" 
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<StarOutlined />}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Progress percent={88} size="small" status="active" />
                  </div>
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic 
                    title="Target Completion" 
                    value={92} 
                    suffix="%" 
                    valueStyle={{ color: '#722ed1' }}
                    prefix={<BarChartOutlined />}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Progress percent={92} size="small" strokeColor="#722ed1" />
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Filters */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col flex="auto">
                <Input.Search
                  placeholder="Search by name or role"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col>
                <Select
                  placeholder="Filter by Department"
                  style={{ width: 180 }}
                  allowClear
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                >
                  {[...new Set(staffData.map(item => item.department))].map(dept => (
                    <Option key={dept} value={dept}>{dept}</Option>
                  ))}
                </Select>
              </Col>
              <Col>
                <Select
                  placeholder="Filter by Role"
                  style={{ width: 180 }}
                  allowClear
                  value={selectedRole}
                  onChange={setSelectedRole}
                >
                  {[...new Set(staffData.map(item => item.role))].map(role => (
                    <Option key={role} value={role}>{role}</Option>
                  ))}
                </Select>
              </Col>
              <Col>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={resetFilters}
                  tooltip="Reset Filters"
                />
              </Col>
            </Row>

            <Table
              columns={staffColumns}
              dataSource={filteredStaff}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane
            tab={<span><PieChartOutlined /> KPI Metrics</span>}
            key="2"
          >
            <Alert 
              message="Key Performance Indicators" 
              description="Track and analyze the key performance indicators for staff across different categories."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Select 
                  placeholder="Select Staff Member"
                  style={{ width: '100%' }}
                  defaultValue={1}
                >
                  {staffData.map(staff => (
                    <Option key={staff.id} value={staff.id}>{staff.name}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={8}>
                <RangePicker
                  style={{ width: '100%' }}
                  value={selectedDateRange}
                  onChange={setSelectedDateRange}
                />
              </Col>
              <Col span={8}>
                <Button type="primary">Generate KPI Report</Button>
              </Col>
            </Row>

            {kpiCategories.map(category => (
              <Card 
                title={category.name}
                key={category.key}
                style={{ marginBottom: 16 }}
                extra={<Tag color="blue">{category.metrics.length} metrics</Tag>}
              >
                <Table
                  columns={kpiColumns}
                  dataSource={category.metrics}
                  rowKey="key"
                  pagination={false}
                  size="small"
                />
              </Card>
            ))}
          </TabPane>

          <TabPane
            tab={<span><DotChartOutlined /> Performance Trends</span>}
            key="3"
          >
            <Alert 
              message="Performance Trends" 
              description="Analyze performance trends over time to identify patterns and areas for improvement."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Select 
                  placeholder="Select Staff Member"
                  style={{ width: '100%' }}
                  defaultValue="all"
                >
                  <Option value="all">All Staff</Option>
                  {staffData.map(staff => (
                    <Option key={staff.id} value={staff.id}>{staff.name}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={12}>
                <Select 
                  placeholder="Select Metric"
                  style={{ width: '100%' }}
                  defaultValue="overall"
                >
                  <Option value="overall">Overall Performance</Option>
                  <Option value="sales">Sales Performance</Option>
                  <Option value="customer">Customer Satisfaction</Option>
                  <Option value="attendance">Attendance Rate</Option>
                  <Option value="target">Target Completion</Option>
                </Select>
              </Col>
            </Row>

            {/* This would normally be a real chart, but for this example we'll just show a placeholder */}
            <Card>
              <Empty 
                description="Performance trend chart would be displayed here" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <Divider />
              <div style={{ padding: '0 24px' }}>
                <Title level={4}>Monthly Performance Breakdown</Title>
                <div style={{ marginTop: 16 }}>
                  <Table
                    dataSource={performanceByMonth}
                    rowKey="month"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'Month',
                        dataIndex: 'month',
                        key: 'month',
                      },
                      {
                        title: 'Sales Performance',
                        dataIndex: 'sales',
                        key: 'sales',
                        render: value => <Progress percent={value} size="small" />
                      },
                      {
                        title: 'Customer Service',
                        dataIndex: 'service',
                        key: 'service',
                        render: value => <Progress percent={value} size="small" status="success" />
                      },
                      {
                        title: 'Operational Efficiency',
                        dataIndex: 'efficiency',
                        key: 'efficiency',
                        render: value => <Progress percent={value} size="small" strokeColor="#722ed1" />
                      }
                    ]}
                  />
                </div>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PerformanceTracking; 