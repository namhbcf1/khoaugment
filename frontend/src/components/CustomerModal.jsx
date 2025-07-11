import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Row, Col, message } from 'antd';
import { UserAddOutlined, SaveOutlined } from '@ant-design/icons';
import { api } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

const CustomerModal = ({ visible, onClose, onCustomerCreated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const customerData = {
        name: values.name,
        email: values.email || null,
        phone: values.phone || null,
        address: values.address || null,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
        gender: values.gender || null,
        segment: values.segment || 'Regular'
      };

      const response = await api.post('/customers', customerData);
      
      if (response.data.success) {
        message.success('Tạo khách hàng thành công!');
        onCustomerCreated(response.data.data);
        form.resetFields();
        onClose();
      } else {
        message.error(response.data.message || 'Có lỗi xảy ra khi tạo khách hàng');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      message.error('Có lỗi xảy ra khi tạo khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserAddOutlined />
          <span>Thêm khách hàng mới</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Tên khách hàng"
              rules={[
                { required: true, message: 'Vui lòng nhập tên khách hàng' },
                { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }
              ]}
            >
              <Input placeholder="Nhập tên khách hàng" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ' }
              ]}
            >
              <Input placeholder="Nhập số điện thoại" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input placeholder="Nhập email" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="address"
              label="Địa chỉ"
            >
              <TextArea 
                placeholder="Nhập địa chỉ" 
                rows={3}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date_of_birth"
              label="Ngày sinh"
            >
              <DatePicker 
                placeholder="Chọn ngày sinh"
                style={{ width: '100%' }}
                size="large"
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="Giới tính"
            >
              <Select placeholder="Chọn giới tính" size="large">
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="segment"
              label="Phân khúc khách hàng"
              initialValue="Regular"
            >
              <Select size="large">
                <Option value="Regular">Khách hàng thường</Option>
                <Option value="VIP">Khách hàng VIP</Option>
                <Option value="Premium">Khách hàng Premium</Option>
                <Option value="New">Khách hàng mới</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Button 
              size="large" 
              block 
              onClick={handleCancel}
            >
              Hủy
            </Button>
          </Col>
          <Col span={12}>
            <Button 
              type="primary" 
              size="large" 
              block 
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              {loading ? 'Đang tạo...' : 'Tạo khách hàng'}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CustomerModal;
