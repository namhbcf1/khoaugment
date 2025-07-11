import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Modal, Form, Input, Switch, Badge, 
  Tabs, Table, Space, Statistic, Progress, Alert, Divider,
  Typography, Tag, Tooltip, notification
} from 'antd';
import {
  ShopOutlined, SyncOutlined, SettingOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined,
  DisconnectOutlined, ReloadOutlined, CloudSyncOutlined,
  ShoppingCartOutlined, DollarOutlined, InboxOutlined
} from '@ant-design/icons';
import MarketplaceIntegrationService from '../../../services/ecommerce/marketplaceIntegration';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MarketplaceManager = () => {
  const [loading, setLoading] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState({});
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [syncStats, setSyncStats] = useState({});
  const [form] = Form.useForm();

  // Marketplace configurations
  const marketplaces = [
    {
      id: 'shopee',
      name: 'Shopee',
      icon: '🛒',
      color: '#ee4d2d',
      description: 'Leading e-commerce platform in Southeast Asia',
      features: ['Product Sync', 'Order Management', 'Inventory Sync', 'Price Sync']
    },
    {
      id: 'lazada',
      name: 'Lazada',
      icon: '🛍️',
      color: '#0f146d',
      description: 'Popular online shopping platform',
      features: ['Product Sync', 'Order Management', 'Inventory Sync', 'Promotion Sync']
    },
    {
      id: 'tiki',
      name: 'Tiki',
      icon: '📦',
      color: '#189eff',
      description: 'Fast delivery e-commerce platform',
      features: ['Product Sync', 'Order Management', 'Inventory Sync', 'Review Sync']
    },
    {
      id: 'sendo',
      name: 'Sendo',
      icon: '🏪',
      color: '#d0021b',
      description: 'Vietnamese e-commerce marketplace',
      features: ['Product Sync', 'Order Management', 'Inventory Sync']
    },
    {
      id: 'facebook',
      name: 'Facebook Shop',
      icon: '📘',
      color: '#1877f2',
      description: 'Social commerce on Facebook',
      features: ['Product Catalog', 'Social Selling', 'Customer Messaging']
    },
    {
      id: 'instagram',
      name: 'Instagram Shop',
      icon: '📷',
      color: '#e4405f',
      description: 'Visual commerce on Instagram',
      features: ['Product Tags', 'Stories Shopping', 'Reels Shopping']
    }
  ];

  useEffect(() => {
    loadIntegrationStatus();
    loadSyncStats();
  }, []);

  const loadIntegrationStatus = async () => {
    try {
      const status = await MarketplaceIntegrationService.getIntegrationStatus();
      setIntegrationStatus(status);
    } catch (error) {
      console.error('Failed to load integration status:', error);
    }
  };

  const loadSyncStats = async () => {
    // Mock sync statistics - in real implementation, fetch from API
    setSyncStats({
      totalProducts: 1250,
      syncedProducts: 1180,
      totalOrders: 450,
      syncedOrders: 445,
      lastSync: new Date().toISOString(),
      syncErrors: 5
    });
  };

  const handleConnect = (platform) => {
    setSelectedPlatform(platform);
    setConnectModalVisible(true);
    form.resetFields();
  };

  const handleDisconnect = async (platformId) => {
    Modal.confirm({
      title: 'Disconnect Platform',
      content: `Are you sure you want to disconnect from ${platformId}? This will stop all synchronization.`,
      okText: 'Disconnect',
      okType: 'danger',
      onOk: async () => {
        try {
          setLoading(true);
          await MarketplaceIntegrationService.disconnectPlatform(platformId);
          await loadIntegrationStatus();
        } catch (error) {
          notification.error({
            message: 'Disconnection Failed',
            description: error.message
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleConnectSubmit = async (values) => {
    try {
      setLoading(true);
      
      switch (selectedPlatform.id) {
        case 'shopee':
          await MarketplaceIntegrationService.connectShopee(values);
          break;
        case 'lazada':
          await MarketplaceIntegrationService.connectLazada(values);
          break;
        case 'tiki':
          await MarketplaceIntegrationService.connectTiki(values);
          break;
        case 'facebook':
          await MarketplaceIntegrationService.connectFacebookShop(values);
          break;
        case 'instagram':
          await MarketplaceIntegrationService.connectInstagramShop(values);
          break;
        default:
          throw new Error('Platform not supported yet');
      }

      setConnectModalVisible(false);
      await loadIntegrationStatus();
      
      notification.success({
        message: 'Integration Connected',
        description: `Successfully connected to ${selectedPlatform.name}`
      });
    } catch (error) {
      notification.error({
        message: 'Connection Failed',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setLoading(true);
      await Promise.all([
        MarketplaceIntegrationService.syncAllProducts(),
        MarketplaceIntegrationService.syncAllOrders()
      ]);
      await loadSyncStats();
      
      notification.success({
        message: 'Sync Completed',
        description: 'All platforms have been synchronized successfully'
      });
    } catch (error) {
      notification.error({
        message: 'Sync Failed',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatus = (platformId) => {
    const status = integrationStatus[platformId];
    if (!status) return { connected: false, status: 'Not Connected' };
    
    return {
      connected: status.connected,
      status: status.connected ? 'Connected' : 'Disconnected',
      lastSync: status.lastSync,
      syncCount: status.syncCount || 0
    };
  };

  const renderPlatformCard = (platform) => {
    const connectionStatus = getConnectionStatus(platform.id);
    
    return (
      <Col xs={24} sm={12} lg={8} key={platform.id}>
        <Card
          hoverable
          style={{ 
            height: '100%',
            borderColor: connectionStatus.connected ? platform.color : '#d9d9d9'
          }}
          actions={[
            connectionStatus.connected ? (
              <Button 
                type="text" 
                icon={<DisconnectOutlined />}
                onClick={() => handleDisconnect(platform.id)}
                danger
              >
                Disconnect
              </Button>
            ) : (
              <Button 
                type="text" 
                icon={<ShopOutlined />}
                onClick={() => handleConnect(platform)}
              >
                Connect
              </Button>
            ),
            <Button 
              type="text" 
              icon={<SettingOutlined />}
              disabled={!connectionStatus.connected}
            >
              Settings
            </Button>
          ]}
        >
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {platform.icon}
            </div>
            <Title level={4} style={{ margin: 0, color: platform.color }}>
              {platform.name}
            </Title>
            <Text type="secondary">{platform.description}</Text>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Badge 
              status={connectionStatus.connected ? 'success' : 'default'}
              text={connectionStatus.status}
            />
            {connectionStatus.connected && connectionStatus.lastSync && (
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Last sync: {new Date(connectionStatus.lastSync).toLocaleString()}
                </Text>
              </div>
            )}
          </div>

          <div>
            <Text strong>Features:</Text>
            <div style={{ marginTop: 8 }}>
              {platform.features.map(feature => (
                <Tag 
                  key={feature} 
                  size="small" 
                  color={connectionStatus.connected ? 'green' : 'default'}
                  style={{ marginBottom: 4 }}
                >
                  {feature}
                </Tag>
              ))}
            </div>
          </div>
        </Card>
      </Col>
    );
  };

  const renderConnectionModal = () => {
    if (!selectedPlatform) return null;

    const getFormFields = () => {
      switch (selectedPlatform.id) {
        case 'shopee':
          return (
            <>
              <Form.Item name="partnerId" label="Partner ID" rules={[{ required: true }]}>
                <Input placeholder="Enter Shopee Partner ID" />
              </Form.Item>
              <Form.Item name="partnerKey" label="Partner Key" rules={[{ required: true }]}>
                <Input.Password placeholder="Enter Shopee Partner Key" />
              </Form.Item>
              <Form.Item name="shopId" label="Shop ID" rules={[{ required: true }]}>
                <Input placeholder="Enter Shop ID" />
              </Form.Item>
              <Form.Item name="accessToken" label="Access Token" rules={[{ required: true }]}>
                <Input.Password placeholder="Enter Access Token" />
              </Form.Item>
            </>
          );
        case 'lazada':
          return (
            <>
              <Form.Item name="appKey" label="App Key" rules={[{ required: true }]}>
                <Input placeholder="Enter Lazada App Key" />
              </Form.Item>
              <Form.Item name="appSecret" label="App Secret" rules={[{ required: true }]}>
                <Input.Password placeholder="Enter App Secret" />
              </Form.Item>
              <Form.Item name="sellerId" label="Seller ID" rules={[{ required: true }]}>
                <Input placeholder="Enter Seller ID" />
              </Form.Item>
              <Form.Item name="accessToken" label="Access Token" rules={[{ required: true }]}>
                <Input.Password placeholder="Enter Access Token" />
              </Form.Item>
            </>
          );
        case 'tiki':
          return (
            <>
              <Form.Item name="clientId" label="Client ID" rules={[{ required: true }]}>
                <Input placeholder="Enter Tiki Client ID" />
              </Form.Item>
              <Form.Item name="clientSecret" label="Client Secret" rules={[{ required: true }]}>
                <Input.Password placeholder="Enter Client Secret" />
              </Form.Item>
              <Form.Item name="sellerId" label="Seller ID" rules={[{ required: true }]}>
                <Input placeholder="Enter Seller ID" />
              </Form.Item>
              <Form.Item name="accessToken" label="Access Token" rules={[{ required: true }]}>
                <Input.Password placeholder="Enter Access Token" />
              </Form.Item>
            </>
          );
        case 'facebook':
          return (
            <>
              <Form.Item name="pageId" label="Page ID" rules={[{ required: true }]}>
                <Input placeholder="Enter Facebook Page ID" />
              </Form.Item>
              <Form.Item name="accessToken" label="Access Token" rules={[{ required: true }]}>
                <Input.Password placeholder="Enter Page Access Token" />
              </Form.Item>
              <Form.Item name="catalogId" label="Catalog ID" rules={[{ required: true }]}>
                <Input placeholder="Enter Product Catalog ID" />
              </Form.Item>
            </>
          );
        case 'instagram':
          return (
            <>
              <Form.Item name="businessAccountId" label="Business Account ID" rules={[{ required: true }]}>
                <Input placeholder="Enter Instagram Business Account ID" />
              </Form.Item>
              <Form.Item name="accessToken" label="Access Token" rules={[{ required: true }]}>
                <Input.Password placeholder="Enter Access Token" />
              </Form.Item>
              <Form.Item name="catalogId" label="Catalog ID" rules={[{ required: true }]}>
                <Input placeholder="Enter Product Catalog ID" />
              </Form.Item>
            </>
          );
        default:
          return <Alert message="Platform configuration not available yet" type="info" />;
      }
    };

    return (
      <Modal
        title={`Connect to ${selectedPlatform.name}`}
        open={connectModalVisible}
        onCancel={() => setConnectModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Alert
          message="Integration Setup"
          description={`Configure your ${selectedPlatform.name} integration credentials. Make sure you have the necessary API access and permissions.`}
          type="info"
          style={{ marginBottom: 24 }}
        />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleConnectSubmit}
        >
          {getFormFields()}
        </Form>
      </Modal>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>
          <ShopOutlined /> Marketplace Integration
        </Title>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadIntegrationStatus}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<CloudSyncOutlined />}
            onClick={handleSyncAll}
            loading={loading}
          >
            Sync All
          </Button>
        </Space>
      </div>

      {/* Sync Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={syncStats.totalProducts}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Synced Products"
              value={syncStats.syncedProducts}
              prefix={<SyncOutlined />}
              suffix={
                <Progress 
                  type="circle" 
                  size={20}
                  percent={Math.round((syncStats.syncedProducts / syncStats.totalProducts) * 100)}
                  showInfo={false}
                />
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={syncStats.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sync Errors"
              value={syncStats.syncErrors}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: syncStats.syncErrors > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Marketplace Cards */}
      <Row gutter={[16, 16]}>
        {marketplaces.map(renderPlatformCard)}
      </Row>

      {renderConnectionModal()}
    </div>
  );
};

export default MarketplaceManager;
