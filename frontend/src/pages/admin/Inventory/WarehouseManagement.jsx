import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Input, Modal, Form, 
  Typography, Select, Tabs, Row, Col, Statistic, Tag, Tooltip
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined,
  BarChartOutlined, SyncOutlined, EnvironmentOutlined, CarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { confirm } = Modal;

/**
 * Warehouse Management component for managing physical storage locations
 */
const WarehouseManagement = () => {
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [activeTab, setActiveTab] = useState("list");

  // Load warehouse data
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setLoading(true);
        
        // Mock data - would be replaced with API call
        setTimeout(() => {
          const mockWarehouses = [
            {
              id: "wh-001",
              name: "Kho chính",
              location: "Hòa Bình",
              manager: "Nguyễn Văn A",
              capacity: 10000,
              usedSpace: 7500,
              status: "active",
              productCount: 120,
              lastInventory: "2023-10-15",
              phone: "0912345678",
              address: "123 Đường Thống Nhất, TP Hòa Bình"
            },
            {
              id: "wh-002",
              name: "Kho phụ",
              location: "Hòa Bình",
              manager: "Trần Thị B",
              capacity: 5000,
              usedSpace: 2300,
              status: "active",
              productCount: 75,
              lastInventory: "2023-11-05",
              phone: "0987654321",
              address: "456 Đường Lê Lợi, TP Hòa Bình"
            },
            {
              id: "wh-003",
              name: "Kho ngoại vi",
              location: "Hà Nội",
              manager: "Lê Văn C",
              capacity: 8000,
              usedSpace: 6200,
              status: "maintenance",
              productCount: 95,
              lastInventory: "2023-09-20",
              phone: "0909123456",
              address: "789 Đường Cầu Diễn, Nam Từ Liêm, Hà Nội"
            }
          ];
          
          setWarehouses(mockWarehouses);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("Failed to fetch warehouses:", err);
        setLoading(false);
      }
    };
    
    fetchWarehouses();
  }, []);
  
  const showModal = (warehouse = null) => {
    setEditingWarehouse(warehouse);
    
    if (warehouse) {
      warehouseForm.setFieldsValue({
        name: warehouse.name,
        location: warehouse.location,
        manager: warehouse.manager,
        capacity: warehouse.capacity,
        status: warehouse.status,
        phone: warehouse.phone,
        address: warehouse.address
      });
    } else {
      warehouseForm.resetFields();
    }
    
    setIsModalVisible(true);
  };
  
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };
  
  const handleModalSubmit = () => {
    warehouseForm.validateFields()
      .then(values => {
        console.log('Form values:', values);
        // Here would be API call to save the warehouse
        
        // Mock response
        setTimeout(() => {
          let updatedWarehouses;
          
          if (editingWarehouse) {
            // Update existing warehouse
            updatedWarehouses = warehouses.map(wh => 
              wh.id === editingWarehouse.id ? { ...editingWarehouse, ...values } : wh
            );
          } else {
            // Add new warehouse
            const newWarehouse = {
              id: `wh-${String(warehouses.length + 1).padStart(3, '0')}`,
              ...values,
              usedSpace: 0,
              productCount: 0,
              lastInventory: new Date().toISOString().split('T')[0]
            };
            updatedWarehouses = [...warehouses, newWarehouse];
          }
          
          setWarehouses(updatedWarehouses);
          setIsModalVisible(false);
          warehouseForm.resetFields();
        }, 500);
      });
  };
  
  const showDeleteConfirm = (warehouseId) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa kho này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        // Here would be API call to delete
        const updatedWarehouses = warehouses.filter(wh => wh.id !== warehouseId);
        setWarehouses(updatedWarehouses);
      }
    });
  };
  
  const getUsagePercentage = (used, capacity) => {
    return Math.round((used / capacity) * 100);
  };
  
  const getStatusTag = (status) => {
    const statusMap = {
      active: { color: 'green', text: 'Hoạt động' },
      inactive: { color: 'orange', text: 'Không hoạt động' },
      maintenance: { color: 'red', text: 'Bảo trì' }
    };
    
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    
    return <Tag color={color}>{text}</Tag>;
  };
  
  const columns = [
    {
      title: 'Mã kho',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Tên kho',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      render: (location) => (
        <Space>
          <EnvironmentOutlined />
          {location}
        </Space>
      )
    },
    {
      title: 'Người quản lý',
      dataIndex: 'manager',
      key: 'manager'
    },
    {
      title: 'Công suất',
      key: 'capacity',
      render: (_, record) => {
        const usagePercent = getUsagePercentage(record.usedSpace, record.capacity);
        let color = 'green';
        
        if (usagePercent > 90) {
          color = 'red';
        } else if (usagePercent > 70) {
          color = 'orange';
        }
        
        return (
          <Tooltip title={`${record.usedSpace}/${record.capacity} sản phẩm (${usagePercent}%)`}>
            <div>
              <div style={{ width: '100px', background: '#f0f0f0', borderRadius: '10px' }}>
                <div
                  style={{
                    width: `${usagePercent}%`,
                    height: '10px',
                    background: color,
                    borderRadius: '10px'
                  }}
                />
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>{usagePercent}%</Text>
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: 'Số lượng sản phẩm',
      dataIndex: 'productCount',
      key: 'productCount',
      render: (count) => `${count} sản phẩm`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record.id)}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <Tabs defaultActiveKey="list" onChange={setActiveTab}>
        <TabPane tab="Danh sách kho" key="list">
          <Card 
            title="Quản lý kho hàng" 
            bordered={false}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
              >
                Thêm kho mới
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={warehouses}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="Tổng quan" key="overview">
          <Card title="Tổng quan kho hàng" bordered={false}>
            <Row gutter={16}>
              {warehouses.map(warehouse => (
                <Col key={warehouse.id} xs={24} sm={12} md={8} style={{ marginBottom: 16 }}>
                  <Card size="small" title={warehouse.name}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Trạng thái:</Text> {getStatusTag(warehouse.status)}
                      </div>
                      <div>
                        <Text strong>Vị trí:</Text> <Text>{warehouse.location}</Text>
                      </div>
                      <div>
                        <Text strong>Người quản lý:</Text> <Text>{warehouse.manager}</Text>
                      </div>
                      <div>
                        <Text strong>Sử dụng:</Text>
                        <div style={{ width: '100%', background: '#f0f0f0', borderRadius: '10px', marginTop: '5px' }}>
                          <div
                            style={{
                              width: `${getUsagePercentage(warehouse.usedSpace, warehouse.capacity)}%`,
                              height: '10px',
                              background: getUsagePercentage(warehouse.usedSpace, warehouse.capacity) > 70 ? '#ff4d4f' : '#52c41a',
                              borderRadius: '10px'
                            }}
                          />
                        </div>
                        <Text type="secondary">{warehouse.usedSpace}/{warehouse.capacity} ({getUsagePercentage(warehouse.usedSpace, warehouse.capacity)}%)</Text>
                      </div>
                      <div>
                        <Text strong>Số lượng sản phẩm:</Text> <Text>{warehouse.productCount}</Text>
                      </div>
                      <div>
                        <Text strong>Kiểm kê gần nhất:</Text> <Text>{warehouse.lastInventory}</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* Warehouse form modal */}
      <Modal
        title={editingWarehouse ? "Chỉnh sửa kho hàng" : "Thêm kho hàng mới"}
        visible={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={handleModalCancel}
        destroyOnClose={true}
        okText={editingWarehouse ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form
          form={warehouseForm}
          layout="vertical"
          initialValues={{ status: 'active' }}
        >
          <Form.Item
            name="name"
            label="Tên kho"
            rules={[{ required: true, message: 'Vui lòng nhập tên kho!' }]}
          >
            <Input placeholder="Tên kho" />
          </Form.Item>
          
          <Form.Item
            name="location"
            label="Vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí kho!' }]}
          >
            <Input placeholder="Vị trí" />
          </Form.Item>
          
          <Form.Item
            name="manager"
            label="Người quản lý"
            rules={[{ required: true, message: 'Vui lòng nhập tên người quản lý!' }]}
          >
            <Input placeholder="Tên người quản lý" />
          </Form.Item>
          
          <Form.Item
            name="capacity"
            label="Sức chứa"
            rules={[
              { required: true, message: 'Vui lòng nhập sức chứa kho!' },
              { type: 'number', min: 1, message: 'Sức chứa phải lớn hơn 0!' }
            ]}
          >
            <Input type="number" placeholder="Sức chứa" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Trạng thái"
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
              <Option value="maintenance">Bảo trì</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input placeholder="Số điện thoại" />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea placeholder="Địa chỉ chi tiết" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default WarehouseManagement; 