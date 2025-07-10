import React from 'react';
import { Button, Card, Typography, Space, Row, Col, Tag, Avatar, Badge } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import './DesignSystem.css';

const { Title, Text, Paragraph } = Typography;

// Standardized Icon Component
export const Icon = ({ 
  name, 
  size = 'base', 
  color = 'default',
  className = '',
  ...props 
}) => {
  const iconMap = {
    user: UserOutlined,
    cart: ShoppingCartOutlined,
    dollar: DollarOutlined,
    chart: BarChartOutlined,
    success: CheckCircleOutlined,
    warning: ExclamationCircleOutlined,
    info: InfoCircleOutlined,
    error: CloseCircleOutlined,
  };

  const IconComponent = iconMap[name] || UserOutlined;
  
  const sizeClass = `icon-${size}`;
  const colorClass = color !== 'default' ? `text-${color}` : '';
  
  return (
    <IconComponent 
      className={`${sizeClass} ${colorClass} ${className}`}
      {...props}
    />
  );
};

// Standardized Status Badge
export const StatusBadge = ({ status, children, ...props }) => {
  const statusConfig = {
    success: { color: 'success', icon: 'success' },
    warning: { color: 'warning', icon: 'warning' },
    error: { color: 'error', icon: 'error' },
    info: { color: 'info', icon: 'info' },
    processing: { color: 'processing', icon: 'info' },
    default: { color: 'default', icon: 'info' }
  };

  const config = statusConfig[status] || statusConfig.default;

  return (
    <Tag color={config.color} icon={<Icon name={config.icon} size="sm" />} {...props}>
      {children}
    </Tag>
  );
};

// Standardized Metric Card
export const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  color = 'primary',
  loading = false,
  ...props 
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <Icon name="success" size="sm" />;
    if (trend === 'down') return <Icon name="error" size="sm" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'success';
    if (trend === 'down') return 'error';
    return 'secondary';
  };

  return (
    <Card 
      className="metric-card"
      loading={loading}
      {...props}
    >
      <div className="metric-card-content">
        <div className="metric-header">
          <Text className="metric-title text-secondary">{title}</Text>
          {icon && <Icon name={icon} size="lg" color={color} />}
        </div>
        
        <div className="metric-value">
          <Title level={2} className="metric-number">
            {value}
          </Title>
          
          {trend && trendValue && (
            <div className={`metric-trend text-${getTrendColor()}`}>
              {getTrendIcon()}
              <Text className={`text-${getTrendColor()}`}>
                {trendValue}
              </Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Standardized Page Header
export const PageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  actions, 
  breadcrumb,
  ...props 
}) => {
  return (
    <div className="page-header" {...props}>
      {breadcrumb && (
        <div className="page-breadcrumb">
          {breadcrumb}
        </div>
      )}
      
      <div className="page-header-content">
        <div className="page-header-main">
          <div className="page-title-wrapper">
            {icon && <Icon name={icon} size="xl" className="page-icon" />}
            <div className="page-title-content">
              <Title level={2} className="page-title">
                {title}
              </Title>
              {subtitle && (
                <Text className="page-subtitle text-secondary">
                  {subtitle}
                </Text>
              )}
            </div>
          </div>
        </div>
        
        {actions && (
          <div className="page-actions">
            <Space size="middle">
              {actions}
            </Space>
          </div>
        )}
      </div>
    </div>
  );
};

// Standardized Loading Skeleton
export const LoadingSkeleton = ({ 
  type = 'card', 
  rows = 3, 
  avatar = false,
  ...props 
}) => {
  if (type === 'table') {
    return (
      <div className="loading-skeleton" {...props}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="skeleton-row">
            <div className="skeleton-cell skeleton-text-lg"></div>
            <div className="skeleton-cell skeleton-text"></div>
            <div className="skeleton-cell skeleton-text-sm"></div>
            <div className="skeleton-cell skeleton-text"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <Card className="loading-skeleton" {...props}>
        {avatar && <div className="skeleton-avatar"></div>}
        <div className="skeleton-title"></div>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="skeleton-text"></div>
        ))}
      </Card>
    );
  }

  return (
    <div className="loading-skeleton" {...props}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton-text"></div>
      ))}
    </div>
  );
};

// Standardized Empty State
export const EmptyState = ({ 
  icon = 'info', 
  title, 
  description, 
  action,
  ...props 
}) => {
  return (
    <div className="empty-state" {...props}>
      <Icon name={icon} size="2xl" color="tertiary" className="empty-icon" />
      <Title level={4} className="empty-title text-secondary">
        {title}
      </Title>
      {description && (
        <Paragraph className="empty-description text-tertiary">
          {description}
        </Paragraph>
      )}
      {action && (
        <div className="empty-action">
          {action}
        </div>
      )}
    </div>
  );
};

// Design System Demo Component (for testing)
export const DesignSystemDemo = () => {
  return (
    <div className="design-system-demo">
      <PageHeader
        title="Design System Demo"
        subtitle="Standardized components for KhoAugment POS"
        icon="chart"
        actions={[
          <Button type="primary" key="primary">Primary Action</Button>,
          <Button key="secondary">Secondary Action</Button>
        ]}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <MetricCard
            title="Total Revenue"
            value="₫125.6M"
            icon="dollar"
            trend="up"
            trendValue="15.2%"
            color="success"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <MetricCard
            title="Total Orders"
            value="2,847"
            icon="cart"
            trend="up"
            trendValue="8.7%"
            color="primary"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <MetricCard
            title="Active Users"
            value="1,234"
            icon="user"
            trend="down"
            trendValue="2.1%"
            color="warning"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <MetricCard
            title="Conversion Rate"
            value="3.2%"
            icon="chart"
            trend="up"
            trendValue="0.5%"
            color="info"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Status Badges">
            <Space wrap>
              <StatusBadge status="success">Success</StatusBadge>
              <StatusBadge status="warning">Warning</StatusBadge>
              <StatusBadge status="error">Error</StatusBadge>
              <StatusBadge status="info">Info</StatusBadge>
              <StatusBadge status="processing">Processing</StatusBadge>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Icons">
            <Space wrap>
              <Icon name="user" size="sm" />
              <Icon name="cart" size="base" />
              <Icon name="dollar" size="lg" />
              <Icon name="chart" size="xl" />
              <Icon name="success" size="2xl" color="success" />
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <LoadingSkeleton type="card" rows={3} avatar />
        </Col>
        <Col xs={24} md={12}>
          <EmptyState
            title="No Data Available"
            description="There are no items to display at the moment."
            action={<Button type="primary">Add New Item</Button>}
          />
        </Col>
      </Row>
    </div>
  );
};

export default {
  Icon,
  StatusBadge,
  MetricCard,
  PageHeader,
  LoadingSkeleton,
  EmptyState,
  DesignSystemDemo
};
