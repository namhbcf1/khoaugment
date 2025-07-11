/**
 * Performance Dashboard Component
 * Real-time monitoring and optimization recommendations
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Button,
  Alert,
  Typography,
  Tabs,
  List,
  Space,
  Tooltip,
  Modal,
  Descriptions,
  Badge,
  Timeline,
  message
} from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  MemoryOutlined,
  DatabaseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  OptimizationOutlined,
  MonitorOutlined
} from '@ant-design/icons';

import performanceService from '../../services/performanceService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const PerformanceDashboard = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadPerformanceData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadPerformanceData, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadPerformanceData = () => {
    try {
      const summary = performanceService.getPerformanceSummary();
      const metrics = performanceService.getMetrics();
      
      setPerformanceData({
        summary,
        metrics,
        lastUpdated: new Date().toLocaleTimeString()
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading performance data:', error);
      setLoading(false);
    }
  };

  const getPerformanceScore = (value, threshold) => {
    if (!value || !threshold) return 100;
    const score = Math.max(0, Math.min(100, 100 - ((value / threshold) * 100)));
    return Math.round(score);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const handleExportMetrics = () => {
    try {
      const data = performanceService.exportMetrics();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-metrics-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('Performance metrics exported successfully');
    } catch (error) {
      message.error('Failed to export metrics');
    }
  };

  const handleClearMetrics = () => {
    Modal.confirm({
      title: 'Clear Performance Metrics',
      content: 'Are you sure you want to clear all performance metrics? This action cannot be undone.',
      onOk: () => {
        performanceService.clearMetrics();
        loadPerformanceData();
        message.success('Performance metrics cleared');
      }
    });
  };

  if (loading || !performanceData) {
    return <div>Loading performance data...</div>;
  }

  const { summary, metrics } = performanceData;

  // Calculate performance scores
  const pageLoadScore = getPerformanceScore(summary.pageLoad, 3000);
  const apiResponseScore = getPerformanceScore(summary.apiResponse, 1000);
  const renderScore = getPerformanceScore(summary.renderTime, 100);
  const memoryScore = getPerformanceScore(summary.memoryUsage, 50000000);

  const overallScore = Math.round((pageLoadScore + apiResponseScore + renderScore + memoryScore) / 4);

  const performanceIssues = metrics.performanceIssue || [];
  const recentIssues = performanceIssues.slice(-5);

  const optimizationSuggestions = [
    {
      type: 'Code Splitting',
      description: 'Implement dynamic imports for large components',
      impact: 'High',
      effort: 'Medium'
    },
    {
      type: 'Image Optimization',
      description: 'Use WebP format and lazy loading for images',
      impact: 'Medium',
      effort: 'Low'
    },
    {
      type: 'Bundle Analysis',
      description: 'Analyze and remove unused dependencies',
      impact: 'High',
      effort: 'High'
    },
    {
      type: 'Caching Strategy',
      description: 'Implement service worker for offline caching',
      impact: 'Medium',
      effort: 'Medium'
    }
  ];

  const performanceColumns = [
    {
      title: 'Metric',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{type.toUpperCase()}</Tag>
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value) => `${Math.round(value)}ms`
    },
    {
      title: 'Threshold',
      dataIndex: 'threshold',
      key: 'threshold',
      render: (threshold) => `${threshold}ms`
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const isGood = record.value <= record.threshold;
        return (
          <Badge 
            status={isGood ? 'success' : 'error'} 
            text={isGood ? 'Good' : 'Needs Attention'}
          />
        );
      }
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleTimeString()
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2}>
                  <MonitorOutlined /> Performance Dashboard
                </Title>
                <Text type="secondary">
                  Last updated: {performanceData.lastUpdated}
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={loadPerformanceData}
                  >
                    Refresh
                  </Button>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={handleExportMetrics}
                  >
                    Export
                  </Button>
                  <Button 
                    danger
                    onClick={handleClearMetrics}
                  >
                    Clear Data
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Performance Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Overall Score"
              value={overallScore}
              suffix="/100"
              valueStyle={{ color: getScoreColor(overallScore) }}
              prefix={<DashboardOutlined />}
            />
            <Progress 
              percent={overallScore} 
              strokeColor={getScoreColor(overallScore)}
              size="small"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Page Load"
              value={summary.pageLoad}
              suffix="ms"
              valueStyle={{ color: getScoreColor(pageLoadScore) }}
              prefix={<ClockCircleOutlined />}
            />
            <Progress 
              percent={pageLoadScore} 
              strokeColor={getScoreColor(pageLoadScore)}
              size="small"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="API Response"
              value={summary.apiResponse}
              suffix="ms"
              valueStyle={{ color: getScoreColor(apiResponseScore) }}
              prefix={<ThunderboltOutlined />}
            />
            <Progress 
              percent={apiResponseScore} 
              strokeColor={getScoreColor(apiResponseScore)}
              size="small"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Memory Usage"
              value={Math.round(summary.memoryUsage / 1024 / 1024)}
              suffix="MB"
              valueStyle={{ color: getScoreColor(memoryScore) }}
              prefix={<MemoryOutlined />}
            />
            <Progress 
              percent={memoryScore} 
              strokeColor={getScoreColor(memoryScore)}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Issues Alert */}
      {recentIssues.length > 0 && (
        <Row style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Alert
              message="Performance Issues Detected"
              description={`${recentIssues.length} performance issues detected in the last session. Check the details below for optimization recommendations.`}
              type="warning"
              showIcon
              action={
                <Button size="small" type="primary">
                  View Details
                </Button>
              }
            />
          </Col>
        </Row>
      )}

      <Tabs defaultActiveKey="metrics">
        <TabPane tab="Performance Metrics" key="metrics">
          <Card title="Recent Performance Issues">
            <Table
              columns={performanceColumns}
              dataSource={recentIssues}
              rowKey={(record) => `${record.type}-${record.timestamp}`}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </TabPane>

        <TabPane tab="Optimization Suggestions" key="optimization">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Recommended Optimizations">
                <List
                  dataSource={optimizationSuggestions}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Tag color={item.impact === 'High' ? 'red' : item.impact === 'Medium' ? 'orange' : 'green'}>
                          {item.impact} Impact
                        </Tag>,
                        <Tag color={item.effort === 'High' ? 'red' : item.effort === 'Medium' ? 'orange' : 'green'}>
                          {item.effort} Effort
                        </Tag>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<OptimizationOutlined />}
                        title={item.type}
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="System Health" key="health">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Performance Health Check">
                <Descriptions column={1} size="small">
                  <Descriptions.Item 
                    label="Page Load Performance"
                    span={3}
                  >
                    <Badge 
                      status={getScoreStatus(pageLoadScore)} 
                      text={`${pageLoadScore}/100`}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label="API Response Time"
                    span={3}
                  >
                    <Badge 
                      status={getScoreStatus(apiResponseScore)} 
                      text={`${apiResponseScore}/100`}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label="Render Performance"
                    span={3}
                  >
                    <Badge 
                      status={getScoreStatus(renderScore)} 
                      text={`${renderScore}/100`}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label="Memory Efficiency"
                    span={3}
                  >
                    <Badge 
                      status={getScoreStatus(memoryScore)} 
                      text={`${memoryScore}/100`}
                    />
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="Performance Timeline">
                <Timeline size="small">
                  <Timeline.Item 
                    color={overallScore >= 80 ? 'green' : overallScore >= 60 ? 'orange' : 'red'}
                    dot={overallScore >= 80 ? <CheckCircleOutlined /> : <WarningOutlined />}
                  >
                    <p><strong>Overall Performance</strong></p>
                    <p>Score: {overallScore}/100</p>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <p><strong>Bundle Size</strong></p>
                    <p>{Math.round(summary.bundleSize / 1024)} KB</p>
                  </Timeline.Item>
                  <Timeline.Item color="purple">
                    <p><strong>Issues Detected</strong></p>
                    <p>{summary.issues} performance issues</p>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
