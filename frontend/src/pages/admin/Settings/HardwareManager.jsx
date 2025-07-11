import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Switch,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  Divider,
  Tooltip,
  Alert,
  Badge
} from 'antd';
import {
  SyncOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  PrinterOutlined,
  BarcodeOutlined,
  InboxOutlined,
  DollarOutlined,
  WifiOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  DisconnectOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Mock data for hardware devices
const mockDevices = [
  {
    id: 1,
    name: 'Máy quét mã vạch Symbol LS2208',
    type: 'barcode_scanner',
    port: 'USB',
    status: 'connected',
    connectedAt: '2023-07-20 08:30:15',
    lastUsed: '2023-07-20 13:45:22',
    assignedTo: 'Quầy thu ngân 1',
    ipAddress: null,
    macAddress: null,
  },
  {
    id: 2,
    name: 'Máy in hóa đơn Epson TM-T82II',
    type: 'receipt_printer',
    port: 'USB',
    status: 'connected',
    connectedAt: '2023-07-20 08:32:05',
    lastUsed: '2023-07-20 13:50:18',
    assignedTo: 'Quầy thu ngân 1',
    ipAddress: null,
    macAddress: null,
  },
  {
    id: 3,
    name: 'Ngăn kéo đựng tiền EC-410',
    type: 'cash_drawer',
    port: 'RJ11',
    status: 'connected',
    connectedAt: '2023-07-20 08:35:10',
    lastUsed: '2023-07-20 13:52:30',
    assignedTo: 'Quầy thu ngân 1',
    ipAddress: null,
    macAddress: null,
  },
  {
    id: 4,
    name: 'Máy in hóa đơn Star TSP143',
    type: 'receipt_printer',
    port: 'Ethernet',
    status: 'offline',
    connectedAt: '2023-07-20 08:40:22',
    lastUsed: '2023-07-20 10:15:45',
    assignedTo: 'Quầy thu ngân 2',
    ipAddress: '192.168.1.110',
    macAddress: 'E4:B9:7A:C1:2D:8F',
  },
  {
    id: 5,
    name: 'Đầu đọc thẻ Ingenico IPP320',
    type: 'card_reader',
    port: 'USB',
    status: 'connected',
    connectedAt: '2023-07-20 08:45:30',
    lastUsed: '2023-07-20 12:30:15',
    assignedTo: 'Quầy thu ngân 2',
    ipAddress: null,
    macAddress: null,
  },
  {
    id: 6,
    name: 'Máy quét mã vạch Datalogic QW2120',
    type: 'barcode_scanner',
    port: 'USB',
    status: 'disconnected',
    connectedAt: '2023-07-19 14:20:10',
    lastUsed: '2023-07-19 17:45:35',
    assignedTo: 'Quầy thu ngân 3',
    ipAddress: null,
    macAddress: null,
  }
];

// Device type options
const deviceTypes = [
  { value: 'barcode_scanner', label: 'Máy quét mã vạch', icon: <BarcodeOutlined /> },
  { value: 'receipt_printer', label: 'Máy in hóa đơn', icon: <PrinterOutlined /> },
  { value: 'cash_drawer', label: 'Ngăn kéo đựng tiền', icon: <InboxOutlined /> },
  { value: 'card_reader', label: 'Đầu đọc thẻ', icon: <DollarOutlined /> },
  { value: 'customer_display', label: 'Màn hình khách hàng', icon: <WifiOutlined /> },
  { value: 'scale', label: 'Cân điện tử', icon: <SafetyCertificateOutlined /> },
];

// POS terminal options
const posTerminals = [
  { value: 'Quầy thu ngân 1', label: 'Quầy thu ngân 1' },
  { value: 'Quầy thu ngân 2', label: 'Quầy thu ngân 2' },
  { value: 'Quầy thu ngân 3', label: 'Quầy thu ngân 3' },
  { value: 'Quầy thu ngân 4', label: 'Quầy thu ngân 4' },
];

// Connection port options
const connectionPorts = [
  { value: 'USB', label: 'USB' },
  { value: 'Ethernet', label: 'Ethernet' },
  { value: 'Bluetooth', label: 'Bluetooth' },
  { value: 'WiFi', label: 'WiFi' },
  { value: 'Serial', label: 'Serial' },
  { value: 'RJ11', label: 'RJ11' },
];

const HardwareManager = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [testingDevice, setTestingDevice] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [isTestModalVisible, setIsTestModalVisible] = useState(false);

  // Load devices on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDevices(mockDevices);
      setLoading(false);
    }, 1000);
  }, []);

  // Get icon for device type
  const getDeviceTypeIcon = (type) => {
    const deviceType = deviceTypes.find(t => t.value === type);
    return deviceType ? deviceType.icon : <QuestionCircleOutlined />;
  };

  // Get label for device type
  const getDeviceTypeLabel = (type) => {
    const deviceType = deviceTypes.find(t => t.value === type);
    return deviceType ? deviceType.label : 'Không xác định';
  };

  // Handle device edit
  const handleEditDevice = (device) => {
    setCurrentDevice(device);
    form.setFieldsValue({
      name: device.name,
      type: device.type,
      port: device.port,
      assignedTo: device.assignedTo,
      ipAddress: device.ipAddress || '',
      macAddress: device.macAddress || '',
    });
    setIsModalVisible(true);
  };

  // Handle device add
  const handleAddDevice = () => {
    setCurrentDevice(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle modal submit
  const handleModalOk = () => {
    form.validateFields()
      .then((values) => {
        if (currentDevice) {
          // Update existing device
          const updatedDevices = devices.map(device => 
            device.id === currentDevice.id ? { ...device, ...values } : device
          );
          setDevices(updatedDevices);
        } else {
          // Add new device
          const newDevice = {
            id: devices.length + 1,
            ...values,
            status: 'disconnected',
            connectedAt: null,
            lastUsed: null,
          };
          setDevices([...devices, newDevice]);
        }
        setIsModalVisible(false);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  // Handle device delete
  const handleDeleteDevice = (id) => {
    setDevices(devices.filter(device => device.id !== id));
  };

  // Handle device test
  const handleTestDevice = (device) => {
    setTestingDevice(device);
    setTestResult(null);
    setIsTestModalVisible(true);
    
    // Simulate testing device
    setTimeout(() => {
      // For demo purposes, all devices except id 6 will pass the test
      const success = device.id !== 6;
      setTestResult({
        success,
        message: success 
          ? 'Thiết bị hoạt động bình thường' 
          : 'Không thể kết nối đến thiết bị. Vui lòng kiểm tra lại kết nối.'
      });
    }, 2000);
  };

  // Handle device status toggle
  const handleToggleStatus = (device) => {
    const newStatus = device.status === 'connected' ? 'disconnected' : 'connected';
    const updatedDevices = devices.map(d => 
      d.id === device.id ? { 
        ...d, 
        status: newStatus, 
        connectedAt: newStatus === 'connected' ? new Date().toLocaleString() : d.connectedAt 
      } : d
    );
    setDevices(updatedDevices);
  };

  // Filter devices based on search and filters
  const filteredDevices = devices.filter(device => {
    const matchesSearch = !searchText || device.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = !typeFilter || device.type === typeFilter;
    const matchesStatus = !statusFilter || device.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Render status badge
  const renderStatus = (status) => {
    switch (status) {
      case 'connected':
        return <Badge status="success" text="Đang kết nối" />;
      case 'disconnected':
        return <Badge status="default" text="Đã ngắt kết nối" />;
      case 'offline':
        return <Badge status="error" text="Ngoại tuyến" />;
      case 'error':
        return <Badge status="warning" text="Lỗi" />;
      default:
        return <Badge status="processing" text={status} />;
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Thiết bị',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <div style={{ fontSize: '20px', color: '#1890ff', marginRight: '8px' }}>
            {getDeviceTypeIcon(record.type)}
          </div>
          <div>
            <div>{text}</div>
            <Text type="secondary">{getDeviceTypeLabel(record.type)}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Kết nối',
      dataIndex: 'port',
      key: 'port',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Tag color="blue">{text}</Tag>
          {record.ipAddress && <Text type="secondary">IP: {record.ipAddress}</Text>}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status),
    },
    {
      title: 'Gán cho',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: 'Lần dùng cuối',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
      render: (text) => text || 'Chưa sử dụng',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Kiểm tra thiết bị">
            <Button
              size="small"
              icon={<SearchOutlined />}
              onClick={() => handleTestDevice(record)}
            />
          </Tooltip>
          <Tooltip title="Cài đặt">
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handleEditDevice(record)}
            />
          </Tooltip>
          <Switch
            size="small"
            checked={record.status === 'connected'}
            onChange={() => handleToggleStatus(record)}
            checkedChildren="Kết nối"
            unCheckedChildren="Ngắt"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa thiết bị này?"
            onConfirm={() => handleDeleteDevice(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="hardware-manager">
      <Card>
        <Title level={2}>Quản lý thiết bị phần cứng</Title>
        <Paragraph type="secondary">
          Quản lý và cấu hình các thiết bị phần cứng kết nối với hệ thống POS
        </Paragraph>

        {/* Filters and Add Button */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Space>
              <Input
                placeholder="Tìm kiếm thiết bị"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
                allowClear
              />
              <Select
                placeholder="Loại thiết bị"
                style={{ width: 180 }}
                value={typeFilter}
                onChange={setTypeFilter}
                allowClear
              >
                {deviceTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    <Space>
                      {type.icon}
                      <span>{type.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Trạng thái"
                style={{ width: 150 }}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
              >
                <Option value="connected">Đang kết nối</Option>
                <Option value="disconnected">Đã ngắt kết nối</Option>
                <Option value="offline">Ngoại tuyến</Option>
                <Option value="error">Lỗi</Option>
              </Select>
              <Button
                icon={<SyncOutlined />}
                onClick={() => setLoading(true)}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddDevice}
            >
              Thêm thiết bị
            </Button>
          </Col>
        </Row>

        {/* Status Summary */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card size="small">
              <Space>
                <Badge status="success" text={`${devices.filter(d => d.status === 'connected').length} thiết bị đang kết nối`} />
                <Divider type="vertical" />
                <Badge status="default" text={`${devices.filter(d => d.status === 'disconnected').length} thiết bị đã ngắt kết nối`} />
                <Divider type="vertical" />
                <Badge status="error" text={`${devices.filter(d => d.status === 'offline').length} thiết bị ngoại tuyến`} />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Devices Table */}
        <Table
          columns={columns}
          dataSource={filteredDevices}
          rowKey="id"
          loading={loading}
          pagination={false}
        />

        {/* Add/Edit Device Modal */}
        <Modal
          title={currentDevice ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => setIsModalVisible(false)}
          okText={currentDevice ? 'Cập nhật' : 'Thêm'}
          cancelText="Hủy"
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="Tên thiết bị"
              rules={[{ required: true, message: 'Vui lòng nhập tên thiết bị' }]}
            >
              <Input placeholder="Nhập tên thiết bị" />
            </Form.Item>
            <Form.Item
              name="type"
              label="Loại thiết bị"
              rules={[{ required: true, message: 'Vui lòng chọn loại thiết bị' }]}
            >
              <Select placeholder="Chọn loại thiết bị">
                {deviceTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    <Space>
                      {type.icon}
                      <span>{type.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="port"
              label="Cổng kết nối"
              rules={[{ required: true, message: 'Vui lòng chọn cổng kết nối' }]}
            >
              <Select placeholder="Chọn cổng kết nối">
                {connectionPorts.map(port => (
                  <Option key={port.value} value={port.value}>{port.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="assignedTo"
              label="Gán cho máy tính"
              rules={[{ required: true, message: 'Vui lòng chọn máy tính' }]}
            >
              <Select placeholder="Chọn máy tính">
                {posTerminals.map(terminal => (
                  <Option key={terminal.value} value={terminal.value}>{terminal.label}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Divider>Thông tin nâng cao</Divider>
            
            <Form.Item
              name="ipAddress"
              label="Địa chỉ IP"
              rules={[{ pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: 'Địa chỉ IP không hợp lệ' }]}
            >
              <Input placeholder="VD: 192.168.1.100" />
            </Form.Item>
            <Form.Item
              name="macAddress"
              label="Địa chỉ MAC"
            >
              <Input placeholder="VD: 00:1B:44:11:3A:B7" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Test Device Modal */}
        <Modal
          title="Kiểm tra thiết bị"
          open={isTestModalVisible}
          onCancel={() => setIsTestModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsTestModalVisible(false)}>
              Đóng
            </Button>
          ]}
        >
          {testingDevice && (
            <div>
              <Paragraph>
                <Space>
                  {getDeviceTypeIcon(testingDevice.type)}
                  <span><strong>{testingDevice.name}</strong></span>
                </Space>
              </Paragraph>
              <Divider />
              
              {testResult ? (
                <div>
                  {testResult.success ? (
                    <Alert
                      message="Kiểm tra thành công"
                      description={testResult.message}
                      type="success"
                      showIcon
                      icon={<CheckCircleOutlined />}
                    />
                  ) : (
                    <Alert
                      message="Kiểm tra thất bại"
                      description={testResult.message}
                      type="error"
                      showIcon
                      icon={<CloseCircleOutlined />}
                    />
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <SyncOutlined spin style={{ fontSize: '24px' }} />
                  <Paragraph style={{ marginTop: '8px' }}>Đang kiểm tra kết nối đến thiết bị...</Paragraph>
                </div>
              )}
              
              {testResult && (
                <div style={{ marginTop: '16px' }}>
                  <Title level={5}>Thông tin kết nối:</Title>
                  <Paragraph>
                    <Text strong>Loại thiết bị:</Text> {getDeviceTypeLabel(testingDevice.type)}
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Cổng kết nối:</Text> {testingDevice.port}
                  </Paragraph>
                  {testingDevice.ipAddress && (
                    <Paragraph>
                      <Text strong>Địa chỉ IP:</Text> {testingDevice.ipAddress}
                    </Paragraph>
                  )}
                  <Paragraph>
                    <Text strong>Trạng thái:</Text> {renderStatus(testingDevice.status)}
                  </Paragraph>
                </div>
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default HardwareManager; 