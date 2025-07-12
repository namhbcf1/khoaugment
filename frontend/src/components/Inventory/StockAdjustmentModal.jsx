import {
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    MinusOutlined,
    PlusOutlined,
    WarningOutlined
} from '@ant-design/icons';
import {
    Alert,
    Button,
    Col,
    Divider,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Typography
} from 'antd';
import React, { useEffect, useState } from 'react';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/**
 * Modal for adjusting product stock levels with tracking
 */
const StockAdjustmentModal = ({ visible, product, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [adjustmentType, setAdjustmentType] = useState('set');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [newStock, setNewStock] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);

  // Reset form and update stock values when product changes
  useEffect(() => {
    if (product) {
      form.resetFields();
      setCurrentStock(product.stock);
      setNewStock(product.stock);
      setAdjustmentQuantity(0);
      setAdjustmentType('set');
    }
  }, [product, form]);

  // Calculate new stock based on adjustment type and quantity
  const calculateNewStock = (type, quantity, current) => {
    switch (type) {
      case 'add':
        return current + quantity;
      case 'subtract':
        return Math.max(0, current - quantity);
      case 'set':
        return quantity;
      default:
        return current;
    }
  };

  // Handle changes to adjustment type
  const handleTypeChange = (value) => {
    setAdjustmentType(value);
    
    // Recalculate stock based on new type
    if (value === 'set') {
      setNewStock(adjustmentQuantity);
    } else {
      const calculatedStock = calculateNewStock(
        value, 
        adjustmentQuantity,
        currentStock
      );
      setNewStock(calculatedStock);
    }
  };

  // Handle changes to adjustment quantity
  const handleQuantityChange = (value) => {
    setAdjustmentQuantity(value || 0);
    
    // Recalculate stock based on new quantity
    const calculatedStock = calculateNewStock(
      adjustmentType, 
      value || 0,
      currentStock
    );
    setNewStock(calculatedStock);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({
        ...values,
        newStock
      });
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  // Handle modal cancel
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Determine if stock will be low after adjustment
  const willBeLowStock = product && newStock <= (product.min_stock || 0);
  const willBeOutOfStock = newStock <= 0;
  
  return (
    <Modal
      title={
        <div>
          <Title level={4}>Stock Adjustment</Title>
          {product && (
            <Text type="secondary">{product.name}</Text>
          )}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      {product && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Current Stock">
                <Text strong>{currentStock}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Minimum Stock Level">
                <Text strong>{product.min_stock || 0}</Text>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          <Form.Item name="adjustmentType" label="Adjustment Type">
            <Select 
              value={adjustmentType} 
              onChange={handleTypeChange}
            >
              <Option value="add">Add Stock</Option>
              <Option value="subtract">Remove Stock</Option>
              <Option value="set">Set Exact Amount</Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            name="quantity" 
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber 
              min={0}
              style={{ width: '100%' }} 
              onChange={handleQuantityChange}
              addonBefore={adjustmentType === 'add' ? <PlusOutlined /> : 
                           adjustmentType === 'subtract' ? <MinusOutlined /> : 
                           <InfoCircleOutlined />}
            />
          </Form.Item>
          
          <Form.Item label="New Stock Level">
            <Text strong style={{ fontSize: '16px' }}>
              {newStock}
            </Text>
            
            {willBeOutOfStock ? (
              <Alert 
                message="Warning: Stock will be zero or negative" 
                type="error"
                showIcon
                icon={<ExclamationCircleOutlined />}
                style={{ marginTop: '10px' }}
              />
            ) : willBeLowStock ? (
              <Alert 
                message={`Warning: Stock will be below minimum level (${product.min_stock})`} 
                type="warning"
                showIcon
                icon={<WarningOutlined />}
                style={{ marginTop: '10px' }}
              />
            ) : null}
          </Form.Item>
          
          <Form.Item 
            name="reason" 
            label="Adjustment Reason"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <Select placeholder="Select reason">
              <Option value="purchase">New Purchase</Option>
              <Option value="sale">Sale</Option>
              <Option value="return">Customer Return</Option>
              <Option value="damage">Damaged/Lost</Option>
              <Option value="count">Inventory Count</Option>
              <Option value="correction">Error Correction</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            name="notes" 
            label="Notes"
          >
            <TextArea rows={3} placeholder="Additional details about this stock adjustment" />
          </Form.Item>
          
          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  disabled={adjustmentQuantity === 0}
                >
                  Save Adjustment
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default StockAdjustmentModal; 