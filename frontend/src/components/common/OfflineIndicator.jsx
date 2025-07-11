import React, { useState, useEffect } from 'react';
import { Alert, Badge, Button, Modal, Progress, Space, Typography, Divider } from 'antd';
import { 
  WifiOutlined, 
  DisconnectOutlined, 
  SyncOutlined, 
  CloudOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import OfflineManager from '../../services/offline/offlineManager';

const { Text, Title } = Typography;

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showModal, setShowModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [offlineData, setOfflineData] = useState({
    transactions: 0,
    inventoryUpdates: 0,
    customers: 0,
    products: 0
  });
  const [storageUsage, setStorageUsage] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      loadOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      loadOfflineData();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial data
    loadOfflineData();
    loadStorageUsage();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = async () => {
    try {
      const [transactions, customers, products] = await Promise.all([
        OfflineManager.getOfflineTransactions(),
        OfflineManager.getCachedCustomers(),
        OfflineManager.getCachedProducts()
      ]);

      setOfflineData({
        transactions: transactions.length,
        inventoryUpdates: 0, // Will be implemented
        customers: customers.length,
        products: products.length
      });
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const loadStorageUsage = async () => {
    try {
      const usage = await OfflineManager.getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Failed to load storage usage:', error);
    }
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      await OfflineManager.syncOfflineData();
      setSyncStatus('success');
      loadOfflineData();
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleClearOfflineData = async () => {
    Modal.confirm({
      title: 'Xóa dữ liệu offline',
      content: 'Bạn có chắc chắn muốn xóa tất cả dữ liệu offline? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await OfflineManager.clearOfflineData();
          loadOfflineData();
          loadStorageUsage();
        } catch (error) {
          console.error('Failed to clear offline data:', error);
        }
      }
    });
  };

  const getStatusColor = () => {
    if (!isOnline) return '#ff4d4f';
    if (offlineData.transactions > 0) return '#faad14';
    return '#52c41a';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (offlineData.transactions > 0) return 'Có dữ liệu chưa đồng bộ';
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <DisconnectOutlined />;
    if (offlineData.transactions > 0) return <ExclamationCircleOutlined />;
    return <WifiOutlined />;
  };

  const renderOfflineModal = () => (
    <Modal
      title={
        <Space>
          <CloudOutlined />
          <span>Trạng thái kết nối & Dữ liệu offline</span>
        </Space>
      }
      open={showModal}
      onCancel={() => setShowModal(false)}
      footer={[
        <Button key="close" onClick={() => setShowModal(false)}>
          Đóng
        </Button>,
        <Button 
          key="sync" 
          type="primary" 
          icon={<SyncOutlined />}
          loading={syncStatus === 'syncing'}
          disabled={!isOnline || offlineData.transactions === 0}
          onClick={handleSync}
        >
          Đồng bộ ngay
        </Button>
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Connection Status */}
        <div>
          <Title level={5}>Trạng thái kết nối</Title>
          <Alert
            message={
              <Space>
                {getStatusIcon()}
                <span>{getStatusText()}</span>
              </Space>
            }
            type={isOnline ? (offlineData.transactions > 0 ? 'warning' : 'success') : 'error'}
            showIcon={false}
          />
        </div>

        {/* Offline Data Summary */}
        <div>
          <Title level={5}>Dữ liệu offline</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Giao dịch chưa đồng bộ:</Text>
              <Badge count={offlineData.transactions} showZero />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Sản phẩm đã lưu:</Text>
              <Badge count={offlineData.products} showZero style={{ backgroundColor: '#1890ff' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Khách hàng đã lưu:</Text>
              <Badge count={offlineData.customers} showZero style={{ backgroundColor: '#52c41a' }} />
            </div>
          </Space>
        </div>

        {/* Storage Usage */}
        {storageUsage && (
          <div>
            <Title level={5}>Sử dụng bộ nhớ</Title>
            <Progress 
              percent={storageUsage.percentage} 
              format={() => `${storageUsage.percentage}%`}
              status={storageUsage.percentage > 80 ? 'exception' : 'normal'}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Đã sử dụng: {Math.round(storageUsage.used / 1024 / 1024)} MB / 
              Có sẵn: {Math.round(storageUsage.available / 1024 / 1024)} MB
            </Text>
          </div>
        )}

        {/* Sync Status */}
        {syncStatus !== 'idle' && (
          <div>
            <Divider />
            <Alert
              message={
                syncStatus === 'syncing' ? 'Đang đồng bộ dữ liệu...' :
                syncStatus === 'success' ? 'Đồng bộ thành công!' :
                'Đồng bộ thất bại!'
              }
              type={
                syncStatus === 'syncing' ? 'info' :
                syncStatus === 'success' ? 'success' : 'error'
              }
              showIcon
            />
          </div>
        )}

        {/* Actions */}
        <div>
          <Divider />
          <Space>
            <Button 
              icon={<DatabaseOutlined />}
              onClick={handleClearOfflineData}
              disabled={offlineData.transactions === 0 && offlineData.products === 0}
            >
              Xóa dữ liệu offline
            </Button>
          </Space>
        </div>
      </Space>
    </Modal>
  );

  return (
    <>
      <div 
        style={{ 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: isOnline ? 'transparent' : 'rgba(255, 77, 79, 0.1)'
        }}
        onClick={() => setShowModal(true)}
      >
        <Badge 
          dot={offlineData.transactions > 0}
          status={isOnline ? 'success' : 'error'}
        >
          {getStatusIcon()}
        </Badge>
        {!isOnline && (
          <Text 
            style={{ 
              marginLeft: 8, 
              color: '#ff4d4f',
              fontSize: '12px',
              fontWeight: 500
            }}
          >
            Offline
          </Text>
        )}
        {isOnline && offlineData.transactions > 0 && (
          <Badge 
            count={offlineData.transactions} 
            size="small" 
            style={{ marginLeft: 4 }}
          />
        )}
      </div>

      {renderOfflineModal()}
    </>
  );
};

export default OfflineIndicator;
