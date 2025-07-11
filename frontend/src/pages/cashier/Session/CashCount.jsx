import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Form,
  InputNumber,
  Button,
  Table,
  Row,
  Col,
  Statistic,
  Divider,
  Space,
  Alert,
  Modal,
  Result,
  Input,
  Select
} from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PrinterOutlined,
  SaveOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  CalculatorOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Định nghĩa các mệnh giá tiền Việt Nam
const denominations = [
  { value: 500000, label: '500,000₫', type: 'bill' },
  { value: 200000, label: '200,000₫', type: 'bill' },
  { value: 100000, label: '100,000₫', type: 'bill' },
  { value: 50000, label: '50,000₫', type: 'bill' },
  { value: 20000, label: '20,000₫', type: 'bill' },
  { value: 10000, label: '10,000₫', type: 'bill' },
  { value: 5000, label: '5,000₫', type: 'bill' },
  { value: 2000, label: '2,000₫', type: 'bill' },
  { value: 1000, label: '1,000₫', type: 'bill' },
  { value: 5000, label: '5,000₫', type: 'coin' },
  { value: 2000, label: '2,000₫', type: 'coin' },
  { value: 1000, label: '1,000₫', type: 'coin' },
  { value: 500, label: '500₫', type: 'coin' },
  { value: 200, label: '200₫', type: 'coin' },
  { value: 100, label: '100₫', type: 'coin' }
];

const CashCount = () => {
  const [form] = Form.useForm();
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [expectedAmount, setExpectedAmount] = useState(0);
  const [difference, setDifference] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [countType, setCountType] = useState('shift_start'); // shift_start, shift_end, mid_day
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [cashier, setCashier] = useState('Nguyễn Văn A');
  const [shift, setShift] = useState('Ca sáng (8:00 - 14:00)');

  // Tính toán tổng tiền khi counts thay đổi
  useEffect(() => {
    let sum = 0;
    Object.entries(counts).forEach(([denom, count]) => {
      sum += parseInt(denom) * (count || 0);
    });
    setTotal(sum);
    setDifference(sum - expectedAmount);
  }, [counts, expectedAmount]);

  // Xử lý khi số lượng của mệnh giá thay đổi
  const handleCountChange = (denomination, count) => {
    setCounts(prev => ({
      ...prev,
      [denomination]: count
    }));
  };

  // Xử lý khi số tiền dự kiến thay đổi
  const handleExpectedAmountChange = (value) => {
    setExpectedAmount(value || 0);
  };

  // Xử lý khi submit form
  const handleSubmit = () => {
    setLoading(true);
    
    // Giả lập gọi API để lưu dữ liệu
    setTimeout(() => {
      setIsSubmitted(true);
      setLoading(false);
    }, 1000);
  };

  // Xử lý khi xác nhận sự khác biệt
  const handleConfirmDifference = () => {
    setIsModalVisible(true);
  };

  // Xử lý khi đóng modal
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  // Xử lý khi hoàn thành
  const handleComplete = () => {
    setIsModalVisible(false);
    handleSubmit();
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Dữ liệu cho bảng
  const tableData = denominations.map(denom => ({
    key: denom.value.toString(),
    denomination: denom.label,
    type: denom.type === 'bill' ? 'Tiền giấy' : 'Tiền xu',
    count: counts[denom.value] || 0,
    value: (counts[denom.value] || 0) * denom.value
  }));

  // Cột cho bảng
  const columns = [
    {
      title: 'Mệnh giá',
      dataIndex: 'denomination',
      key: 'denomination',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
      render: (_, record) => (
        <InputNumber
          min={0}
          value={counts[record.key]}
          onChange={(value) => handleCountChange(record.key, value)}
          disabled={isSubmitted}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'value',
      key: 'value',
      render: (text) => formatCurrency(text),
    },
  ];

  // Render kết quả sau khi đếm tiền
  const renderResult = () => {
    if (!isSubmitted) return null;

    const isDifferenceSignificant = Math.abs(difference) > 10000;

    return (
      <Card style={{ marginTop: 16 }}>
        <Result
          status={isDifferenceSignificant ? "warning" : "success"}
          title={
            isDifferenceSignificant
              ? "Có sự chênh lệch đáng kể trong kết quả đếm tiền"
              : "Đếm tiền hoàn tất"
          }
          subTitle={
            <div>
              <p>
                {isDifferenceSignificant
                  ? `Chênh lệch: ${formatCurrency(difference)} (${difference > 0 ? "thừa" : "thiếu"})`
                  : "Kết quả đếm tiền đã được lưu thành công"}
              </p>
              <p>Thời gian: {new Date().toLocaleString()}</p>
              <p>Thu ngân: {cashier}</p>
              <p>Ca làm việc: {shift}</p>
              {notes && <p>Ghi chú: {notes}</p>}
            </div>
          }
          extra={[
            <Button key="print" icon={<PrinterOutlined />} type="primary">
              In báo cáo
            </Button>,
            <Button key="new" onClick={() => window.location.reload()}>
              Đếm tiền mới
            </Button>,
          ]}
        />
      </Card>
    );
  };

  return (
    <div className="cash-count">
      <Card>
        <Title level={2}>Kiểm đếm tiền</Title>
        <Paragraph type="secondary">
          Kiểm đếm tiền mặt trong quầy thu ngân để đảm bảo tính chính xác
        </Paragraph>

        {!isSubmitted && (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Form.Item label="Loại kiểm đếm">
                  <Select 
                    value={countType} 
                    onChange={setCountType}
                    disabled={Object.keys(counts).length > 0}
                  >
                    <Option value="shift_start">Đầu ca</Option>
                    <Option value="shift_end">Cuối ca</Option>
                    <Option value="mid_day">Giữa ngày</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Thu ngân">
                  <Select value={cashier} onChange={setCashier}>
                    <Option value="Nguyễn Văn A">Nguyễn Văn A</Option>
                    <Option value="Trần Thị B">Trần Thị B</Option>
                    <Option value="Lê Văn C">Lê Văn C</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Ca làm việc">
                  <Select value={shift} onChange={setShift}>
                    <Option value="Ca sáng (8:00 - 14:00)">Ca sáng (8:00 - 14:00)</Option>
                    <Option value="Ca chiều (14:00 - 20:00)">Ca chiều (14:00 - 20:00)</Option>
                    <Option value="Ca tối (20:00 - 22:00)">Ca tối (20:00 - 22:00)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {countType === 'shift_end' && (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <Alert
                    message="Số tiền dự kiến trong quầy"
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>Nhập số tiền dự kiến dựa trên báo cáo hệ thống:</Text>
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          step={10000}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                          onChange={handleExpectedAmountChange}
                          addonAfter="VND"
                          placeholder="Nhập số tiền dự kiến"
                        />
                      </Space>
                    }
                    type="info"
                    showIcon
                  />
                </Col>
              </Row>
            )}

            <Divider orientation="left">Nhập số lượng theo mệnh giá</Divider>

            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>Tổng cộng</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Text strong>{Object.values(counts).reduce((sum, count) => sum + (count || 0), 0)} tờ/đồng</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <Text strong>{formatCurrency(total)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Tổng tiền đếm được"
                    value={total}
                    precision={0}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<DollarOutlined />}
                    suffix="VND"
                    formatter={(value) => formatCurrency(value)}
                  />
                </Card>
              </Col>
              {countType === 'shift_end' && (
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Chênh lệch"
                      value={difference}
                      precision={0}
                      valueStyle={{ 
                        color: difference === 0 
                          ? '#3f8600' 
                          : Math.abs(difference) < 10000 
                            ? '#faad14' 
                            : '#cf1322' 
                      }}
                      prefix={difference === 0 
                        ? <CheckCircleOutlined /> 
                        : difference > 0 
                          ? <WarningOutlined /> 
                          : <CloseCircleOutlined />
                      }
                      suffix="VND"
                      formatter={(value) => {
                        const formatted = formatCurrency(Math.abs(value));
                        return `${value >= 0 ? '+' : '-'} ${formatted}`;
                      }}
                    />
                    {difference !== 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text type={difference > 0 ? "success" : "danger"}>
                          {difference > 0 ? "Thừa tiền" : "Thiếu tiền"}
                        </Text>
                      </div>
                    )}
                  </Card>
                </Col>
              )}
            </Row>

            <div style={{ marginTop: 16 }}>
              <Form.Item label="Ghi chú">
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập ghi chú về việc đếm tiền (nếu có)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Form.Item>
            </div>

            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Space>
                <Button icon={<SyncOutlined />} onClick={() => setCounts({})}>
                  Đặt lại
                </Button>
                <Button 
                  type="primary" 
                  icon={<CalculatorOutlined />}
                  onClick={countType === 'shift_end' && difference !== 0 ? handleConfirmDifference : handleSubmit}
                  loading={loading}
                  disabled={Object.keys(counts).length === 0}
                >
                  Hoàn tất đếm tiền
                </Button>
              </Space>
            </div>
          </>
        )}

        {renderResult()}

        <Modal
          title="Xác nhận chênh lệch"
          open={isModalVisible}
          onOk={handleComplete}
          onCancel={handleModalClose}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Alert
            message={`Chênh lệch: ${formatCurrency(difference)} (${difference > 0 ? "thừa" : "thiếu"})`}
            description="Có sự chênh lệch giữa số tiền đếm được và số tiền dự kiến. Vui lòng kiểm tra lại hoặc ghi chú lý do chênh lệch."
            type={Math.abs(difference) < 10000 ? "warning" : "error"}
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form layout="vertical">
            <Form.Item label="Lý do chênh lệch">
              <Input.TextArea
                rows={4}
                placeholder="Nhập lý do chênh lệch"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default CashCount; 