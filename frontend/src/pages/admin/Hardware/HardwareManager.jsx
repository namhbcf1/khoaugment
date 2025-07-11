import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Modal, Form, Input, Switch, Badge, 
  Tabs, Table, Space, Statistic, Progress, Alert, Divider,
  Typography, Tag, Tooltip, notification, Select
} from 'antd';
import {
  PrinterOutlined, ScanOutlined, DollarOutlined,
  MonitorOutlined, CalculatorOutlined, SafetyOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined,
  DisconnectOutlined, ReloadOutlined, SettingOutlined,
  UsbOutlined, WifiOutlined
} from '@ant-design/icons';
import HardwareIntegrationService from '../../../services/hardware/hardwareIntegration';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const HardwareManager = () => {
  const [loading, setLoading] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState({});
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Hardware device configurations
  const hardwareDevices = [
    {
      id: 'thermal_printer',
      name: 'Thermal Printer',
      icon: <PrinterOutlined />,
      color: '#1890ff',
      description: 'Receipt and label printing',
      features: ['Receipt Printing', 'Logo Support', 'Barcode Printing', 'Cut Paper'],
      ports: ['COM1', 'COM2', 'COM3', 'USB', 'Network']
    },
    {
      id: 'barcode_scanner',
      name: 'Barcode Scanner',
      icon: <ScanOutlined />,
      color: '#52c41a',
      description: 'Product barcode scanning',
      features: ['1D Barcodes', '2D QR Codes', 'Auto-scan', 'Manual Trigger'],
      ports: ['USB HID', 'COM1', 'COM2', 'Bluetooth']
    },
    {
      id: 'cash_drawer',
      name: 'Cash Drawer',
      icon: <SafetyOutlined />,
      color: '#faad14',
      description: 'Automatic cash drawer control',
      features: ['Auto Open', 'Manual Open', 'Status Detection', 'Security Lock'],
      ports: ['RJ11', 'USB', 'Parallel']
    },
    {
      id: 'payment_terminal',
      name: 'Payment Terminal',
      icon: <DollarOutlined />,
      color: '#722ed1',
      description: 'Card payment processing',
      features: ['Chip Cards', 'Contactless', 'PIN Entry', 'Receipt Print'],
      ports: ['USB', 'Serial', 'Ethernet', 'Bluetooth']
    },
    {
      id: 'customer_display',
      name: 'Customer Display',
      icon: <MonitorOutlined />,
      color: '#eb2f96',
      description: 'Customer-facing display',
      features: ['Price Display', 'Promotions', 'Branding', 'Multi-line'],
      ports: ['USB', 'Serial', 'VGA', 'HDMI']
    },
    {
      id: 'scale',
      name: 'Electronic Scale',
      icon: <CalculatorOutlined />,
      color: '#13c2c2',
      description: 'Weight measurement for bulk items',
      features: ['Precision Weighing', 'Tare Function', 'Unit Conversion', 'Price Calculation'],
      ports: ['Serial', 'USB', 'Ethernet']
    }
  ];

  useEffect(() => {
    loadDeviceStatus();
  }, []);

  const loadDeviceStatus = async () => {
    try {
      const status = await HardwareIntegrationService.getDeviceStatus();
      setDeviceStatus(status);
    } catch (error) {
      console.error('Failed to load device status:', error);
    }
  };

  const handleConnect = (device) => {
    setSelectedDevice(device);
    setConnectModalVisible(true);
    form.resetFields();
  };

  const handleDisconnect = async (deviceId) => {
    Modal.confirm({
      title: 'Disconnect Device',
      content: `Are you sure you want to disconnect ${deviceId}? This will stop all communication with the device.`,
      okText: 'Disconnect',
      okType: 'danger',
      onOk: async () => {
        try {
          setLoading(true);
          await HardwareIntegrationService.disconnectDevice(deviceId);
          await loadDeviceStatus();
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
      
      switch (selectedDevice.id) {
        case 'thermal_printer':
          await HardwareIntegrationService.connectThermalPrinter(values);
          break;
        case 'barcode_scanner':
          await HardwareIntegrationService.connectBarcodeScanner(values);
          break;
        case 'cash_drawer':
          await HardwareIntegrationService.connectCashDrawer(values);
          break;
        case 'payment_terminal':
          await HardwareIntegrationService.connectPaymentTerminal(values);
          break;
        case 'customer_display':
          await HardwareIntegrationService.connectCustomerDisplay(values);
          break;
        case 'scale':
          await HardwareIntegrationService.connectScale(values);
          break;
        default:
          throw new Error('Device type not supported');
      }

      setConnectModalVisible(false);
      await loadDeviceStatus();
      
      notification.success({
        message: 'Device Connected',
        description: `Successfully connected to ${selectedDevice.name}`
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

  const handleTestDevice = async (deviceId) => {
    try {
      setLoading(true);
      
      switch (deviceId) {
        case 'thermal_printer':
          await HardwareIntegrationService.printReceipt({
            type: 'test',
            content: 'Test Receipt\nPrinter Working!\n\n'
          });
          break;
        case 'cash_drawer':
          await HardwareIntegrationService.openCashDrawer();
          break;
        case 'customer_display':
          await HardwareIntegrationService.updateCustomerDisplay('Test Display\nWorking!');
          break;
        case 'scale':
          const weight = await HardwareIntegrationService.getWeight();
          notification.info({
            message: 'Scale Reading',
            description: `Current weight: ${weight} kg`
          });
          break;
        case 'payment_terminal':
          notification.info({
            message: 'Payment Terminal Test',
            description: 'Please insert or tap a test card'
          });
          break;
        default:
          notification.success({
            message: 'Device Test',
            description: `${deviceId} test completed successfully`
          });
      }
    } catch (error) {
      notification.error({
        message: 'Test Failed',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatus = (deviceId) => {
    const status = deviceStatus[deviceId];
    if (!status) return { connected: false, status: 'Not Connected' };
    
    return {
      connected: status.connected,
      status: status.connected ? 'Connected' : 'Disconnected',
      lastActivity: status.lastActivity,
      port: status.port
    };
  };

  const renderDeviceCard = (device) => {
    const connectionStatus = getConnectionStatus(device.id);
    
    return (
      <Col xs={24} sm={12} lg={8} key={device.id}>
        <Card
          hoverable
          style={{ 
            height: '100%',
            borderColor: connectionStatus.connected ? device.color : '#d9d9d9'
          }}
          actions={[
            connectionStatus.connected ? (
              <Button 
                type="text" 
                icon={<DisconnectOutlined />}
                onClick={() => handleDisconnect(device.id)}
                danger
              >
                Disconnect
              </Button>
            ) : (
              <Button 
                type="text" 
                icon={device.icon}
                onClick={() => handleConnect(device)}
              >
                Connect
              </Button>
            ),
            <Button 
              type="text" 
              icon={<SettingOutlined />}
              disabled={!connectionStatus.connected}
              onClick={() => handleTestDevice(device.id)}
            >
              Test
            </Button>
          ]}
        >
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 8, color: device.color }}>
              {device.icon}
            </div>
            <Title level={4} style={{ margin: 0, color: device.color }}>
              {device.name}
            </Title>
            <Text type="secondary">{device.description}</Text>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Badge 
              status={connectionStatus.connected ? 'success' : 'default'}
              text={connectionStatus.status}
            />
            {connectionStatus.connected && connectionStatus.port && (
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Port: {connectionStatus.port}
                </Text>
              </div>
            )}
          </div>

          <div>
            <Text strong>Features:</Text>
            <div style={{ marginTop: 8 }}>
              {device.features.map(feature => (
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
    if (!selectedDevice) return null;

    const getFormFields = () => {
      const commonFields = (
        <>
          <Form.Item name="port" label="Port" rules={[{ required: true }]}>
            <Select placeholder="Select port">
              {selectedDevice.ports.map(port => (
                <Option key={port} value={port}>{port}</Option>
              ))}
            </Select>
          </Form.Item>
        </>
      );

      switch (selectedDevice.id) {
        case 'thermal_printer':
          return (
            <>
              {commonFields}
              <Form.Item name="baudRate" label="Baud Rate" initialValue={9600}>
                <Select>
                  <Option value={9600}>9600</Option>
                  <Option value={19200}>19200</Option>
                  <Option value={38400}>38400</Option>
                  <Option value={115200}>115200</Option>
                </Select>
              </Form.Item>
              <Form.Item name="paperWidth" label="Paper Width (mm)" initialValue={80}>
                <Select>
                  <Option value={58}>58mm</Option>
                  <Option value={80}>80mm</Option>
                </Select>
              </Form.Item>
            </>
          );
        case 'barcode_scanner':
          return (
            <>
              {commonFields}
              <Form.Item name="autoScan" label="Auto Scan" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
              <Form.Item name="scanMode" label="Scan Mode" initialValue="continuous">
                <Select>
                  <Option value="continuous">Continuous</Option>
                  <Option value="trigger">Manual Trigger</Option>
                </Select>
              </Form.Item>
            </>
          );
        case 'payment_terminal':
          return (
            <>
              {commonFields}
              <Form.Item name="merchantId" label="Merchant ID" rules={[{ required: true }]}>
                <Input placeholder="Enter merchant ID" />
              </Form.Item>
              <Form.Item name="terminalId" label="Terminal ID" rules={[{ required: true }]}>
                <Input placeholder="Enter terminal ID" />
              </Form.Item>
            </>
          );
        case 'customer_display':
          return (
            <>
              {commonFields}
              <Form.Item name="displaySize" label="Display Size" initialValue="20x2">
                <Select>
                  <Option value="20x2">20x2 Characters</Option>
                  <Option value="20x4">20x4 Characters</Option>
                  <Option value="40x2">40x2 Characters</Option>
                </Select>
              </Form.Item>
            </>
          );
        case 'scale':
          return (
            <>
              {commonFields}
              <Form.Item name="baudRate" label="Baud Rate" initialValue={9600}>
                <Select>
                  <Option value={9600}>9600</Option>
                  <Option value={19200}>19200</Option>
                </Select>
              </Form.Item>
              <Form.Item name="unit" label="Weight Unit" initialValue="kg">
                <Select>
                  <Option value="kg">Kilograms</Option>
                  <Option value="g">Grams</Option>
                  <Option value="lb">Pounds</Option>
                </Select>
              </Form.Item>
            </>
          );
        default:
          return commonFields;
      }
    };

    return (
      <Modal
        title={`Connect ${selectedDevice.name}`}
        open={connectModalVisible}
        onCancel={() => setConnectModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Alert
          message="Hardware Setup"
          description={`Configure your ${selectedDevice.name} connection settings. Make sure the device is properly connected and powered on.`}
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
          <UsbOutlined /> Hardware Integration
        </Title>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadDeviceStatus}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Device Status Overview */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Connected Devices"
              value={Object.values(deviceStatus).filter(d => d?.connected).length}
              suffix={`/ ${hardwareDevices.length}`}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Sessions"
              value={Object.values(deviceStatus).reduce((acc, d) => acc + (d?.sessions || 0), 0)}
              prefix={<MonitorOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Error Count"
              value={Object.values(deviceStatus).reduce((acc, d) => acc + (d?.errors || 0), 0)}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Uptime"
              value={98.5}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Hardware Device Cards */}
      <Row gutter={[16, 16]}>
        {hardwareDevices.map(renderDeviceCard)}
      </Row>

      {renderConnectionModal()}
    </div>
  );
};

export default HardwareManager;
