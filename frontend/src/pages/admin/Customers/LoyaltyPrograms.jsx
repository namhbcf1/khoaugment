import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tabs, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Switch, 
  DatePicker, 
  Popconfirm, 
  Typography, 
  Tag, 
  Space,
  Row,
  Col,
  Divider,
  Alert,
  Modal,
  message,
  Tooltip,
  List,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  StarOutlined, 
  GiftOutlined, 
  CrownOutlined,
  RocketOutlined,
  HistoryOutlined,
  UserOutlined,
  SettingOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const LoyaltyPrograms = () => {
  const [activeTab, setActiveTab] = useState('programs');
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRewardModalVisible, setIsRewardModalVisible] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [editingReward, setEditingReward] = useState(null);
  const [form] = Form.useForm();
  const [rewardForm] = Form.useForm();

  // Mock data for loyalty programs
  const mockPrograms = [
    {
      id: 1,
      name: 'Chương trình thành viên cơ bản',
      description: 'Tích điểm cơ bản cho mọi đơn hàng',
      pointsPerVnd: 0.0001, // 1 điểm cho mỗi 10,000 VND
      status: 'active',
      startDate: '2023-01-01',
      endDate: null,
      memberCount: 450,
      rules: [
        'Tích 1 điểm cho mỗi 10,000 VND chi tiêu',
        'Điểm có hiệu lực trong vòng 12 tháng',
        'Áp dụng cho tất cả khách hàng đã đăng ký'
      ]
    },
    {
      id: 2,
      name: 'Chương trình khách hàng VIP',
      description: 'Đặc quyền cho khách hàng chi tiêu cao',
      pointsPerVnd: 0.0002, // 1 điểm cho mỗi 5,000 VND
      status: 'active',
      startDate: '2023-03-15',
      endDate: null,
      memberCount: 85,
      rules: [
        'Tích 1 điểm cho mỗi 5,000 VND chi tiêu',
        'Ưu đãi giảm giá đặc biệt hàng tháng',
        'Chỉ áp dụng cho khách hàng chi tiêu trên 50 triệu/năm',
        'Tặng voucher sinh nhật trị giá 500,000 VND'
      ]
    },
    {
      id: 3,
      name: 'Chương trình khuyến mãi hè 2023',
      description: 'Tích điểm tăng gấp đôi trong mùa hè',
      pointsPerVnd: 0.0002,
      status: 'inactive',
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      memberCount: 320,
      rules: [
        'Tích điểm gấp đôi cho tất cả đơn hàng',
        'Áp dụng cho tất cả khách hàng',
        'Có hiệu lực từ 01/06 đến 31/08/2023'
      ]
    }
  ];

  // Mock data for rewards
  const mockRewards = [
    {
      id: 1,
      name: 'Voucher giảm giá 50,000 VND',
      description: 'Áp dụng cho đơn hàng từ 500,000 VND',
      pointsCost: 50,
      type: 'voucher',
      status: 'active',
      redemptionCount: 125,
      expiryDays: 30,
      image: 'https://via.placeholder.com/100',
      conditions: 'Áp dụng cho đơn hàng từ 500,000 VND'
    },
    {
      id: 2,
      name: 'Voucher giảm giá 100,000 VND',
      description: 'Áp dụng cho đơn hàng từ 1,000,000 VND',
      pointsCost: 90,
      type: 'voucher',
      status: 'active',
      redemptionCount: 78,
      expiryDays: 30,
      image: 'https://via.placeholder.com/100',
      conditions: 'Áp dụng cho đơn hàng từ 1,000,000 VND'
    },
    {
      id: 3,
      name: 'Quà tặng tai nghe không dây',
      description: 'Tai nghe Bluetooth chất lượng cao',
      pointsCost: 500,
      type: 'gift',
      status: 'active',
      redemptionCount: 45,
      expiryDays: null,
      image: 'https://via.placeholder.com/100',
      conditions: 'Số lượng có hạn, chỉ áp dụng đến khi hết hàng'
    },
    {
      id: 4,
      name: 'Miễn phí vận chuyển',
      description: 'Miễn phí vận chuyển cho đơn hàng bất kỳ',
      pointsCost: 30,
      type: 'shipping',
      status: 'active',
      redemptionCount: 210,
      expiryDays: 15,
      image: 'https://via.placeholder.com/100',
      conditions: 'Áp dụng cho tất cả đơn hàng, không áp dụng cùng khuyến mãi khác'
    },
    {
      id: 5,
      name: 'Giảm giá 15%',
      description: 'Giảm giá 15% cho đơn hàng',
      pointsCost: 150,
      type: 'discount',
      status: 'inactive',
      redemptionCount: 32,
      expiryDays: 30,
      image: 'https://via.placeholder.com/100',
      conditions: 'Không áp dụng cho sản phẩm đã giảm giá'
    }
  ];

  // Simulating API call
  useEffect(() => {
    setTimeout(() => {
      setPrograms(mockPrograms);
      setRewards(mockRewards);
      setLoading(false);
    }, 1000);
  }, []);

  const showAddProgramModal = () => {
    setEditingProgram(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditProgramModal = (program) => {
    setEditingProgram(program);
    form.setFieldsValue({
      name: program.name,
      description: program.description,
      pointsPerVnd: program.pointsPerVnd,
      status: program.status,
      dateRange: program.endDate ? [new Date(program.startDate), new Date(program.endDate)] : [new Date(program.startDate), null],
      rules: program.rules.join('\n')
    });
    setIsModalVisible(true);
  };

  const showAddRewardModal = () => {
    setEditingReward(null);
    rewardForm.resetFields();
    setIsRewardModalVisible(true);
  };

  const showEditRewardModal = (reward) => {
    setEditingReward(reward);
    rewardForm.setFieldsValue({
      name: reward.name,
      description: reward.description,
      pointsCost: reward.pointsCost,
      type: reward.type,
      status: reward.status,
      expiryDays: reward.expiryDays,
      conditions: reward.conditions
    });
    setIsRewardModalVisible(true);
  };

  const handleProgramCancel = () => {
    setIsModalVisible(false);
    setEditingProgram(null);
    form.resetFields();
  };

  const handleRewardCancel = () => {
    setIsRewardModalVisible(false);
    setEditingReward(null);
    rewardForm.resetFields();
  };

  const handleProgramSubmit = () => {
    form.validateFields().then(values => {
      const { name, description, pointsPerVnd, status, dateRange, rules } = values;
      const rulesArray = rules.split('\n').filter(rule => rule.trim() !== '');
      
      if (editingProgram) {
        // Update existing program
        const updatedProgram = {
          ...editingProgram,
          name,
          description,
          pointsPerVnd,
          status,
          startDate: dateRange[0].toISOString().split('T')[0],
          endDate: dateRange[1] ? dateRange[1].toISOString().split('T')[0] : null,
          rules: rulesArray
        };
        
        const updatedPrograms = programs.map(p => 
          p.id === editingProgram.id ? updatedProgram : p
        );
        
        setPrograms(updatedPrograms);
        message.success('Cập nhật chương trình thành công!');
      } else {
        // Create new program
        const newProgram = {
          id: programs.length + 1,
          name,
          description,
          pointsPerVnd,
          status,
          startDate: dateRange[0].toISOString().split('T')[0],
          endDate: dateRange[1] ? dateRange[1].toISOString().split('T')[0] : null,
          memberCount: 0,
          rules: rulesArray
        };
        
        setPrograms([...programs, newProgram]);
        message.success('Thêm chương trình thành công!');
      }
      
      setIsModalVisible(false);
      setEditingProgram(null);
      form.resetFields();
    });
  };

  const handleRewardSubmit = () => {
    rewardForm.validateFields().then(values => {
      const { name, description, pointsCost, type, status, expiryDays, conditions } = values;
      
      if (editingReward) {
        // Update existing reward
        const updatedReward = {
          ...editingReward,
          name,
          description,
          pointsCost,
          type,
          status,
          expiryDays,
          conditions
        };
        
        const updatedRewards = rewards.map(r => 
          r.id === editingReward.id ? updatedReward : r
        );
        
        setRewards(updatedRewards);
        message.success('Cập nhật phần thưởng thành công!');
      } else {
        // Create new reward
        const newReward = {
          id: rewards.length + 1,
          name,
          description,
          pointsCost,
          type,
          status,
          expiryDays,
          redemptionCount: 0,
          image: 'https://via.placeholder.com/100',
          conditions
        };
        
        setRewards([...rewards, newReward]);
        message.success('Thêm phần thưởng thành công!');
      }
      
      setIsRewardModalVisible(false);
      setEditingReward(null);
      rewardForm.resetFields();
    });
  };

  const handleDeleteProgram = (programId) => {
    // In a real app, this would be an API call
    setPrograms(programs.filter(program => program.id !== programId));
    message.success('Đã xóa chương trình!');
  };

  const handleDeleteReward = (rewardId) => {
    // In a real app, this would be an API call
    setRewards(rewards.filter(reward => reward.id !== rewardId));
    message.success('Đã xóa phần thưởng!');
  };

  // Get status tag for programs and rewards
  const getStatusTag = (status) => {
    const colors = {
      active: 'green',
      inactive: 'orange',
      draft: 'blue',
      expired: 'red'
    };
    
    const texts = {
      active: 'Hoạt động',
      inactive: 'Tạm dừng',
      draft: 'Bản nháp',
      expired: 'Hết hạn'
    };
    
    return <Tag color={colors[status] || 'default'}>{texts[status] || status}</Tag>;
  };

  // Get reward type icon
  const getRewardTypeIcon = (type) => {
    switch (type) {
      case 'voucher':
        return <GiftOutlined style={{ color: '#1890ff' }} />;
      case 'discount':
        return <StarOutlined style={{ color: '#52c41a' }} />;
      case 'gift':
        return <CrownOutlined style={{ color: '#faad14' }} />;
      case 'shipping':
        return <RocketOutlined style={{ color: '#722ed1' }} />;
      default:
        return <GiftOutlined />;
    }
  };

  // Program columns
  const programColumns = [
    {
      title: 'Tên chương trình',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <CrownOutlined style={{ color: '#faad14' }} />
          <a onClick={() => showEditProgramModal(record)}>{text}</a>
        </Space>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Tỷ lệ điểm',
      dataIndex: 'pointsPerVnd',
      key: 'pointsPerVnd',
      render: value => `1 điểm / ${new Intl.NumberFormat('vi-VN').format(1 / value)} VND`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusTag(status)
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <>
          <div>Bắt đầu: {record.startDate}</div>
          {record.endDate && <div>Kết thúc: {record.endDate}</div>}
        </>
      )
    },
    {
      title: 'Số thành viên',
      dataIndex: 'memberCount',
      key: 'memberCount',
      sorter: (a, b) => a.memberCount - b.memberCount
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => showEditProgramModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa chương trình này?"
            onConfirm={() => handleDeleteProgram(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Reward columns
  const rewardColumns = [
    {
      title: 'Phần thưởng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {getRewardTypeIcon(record.type)}
          <a onClick={() => showEditRewardModal(record)}>{text}</a>
        </Space>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: type => {
        const types = {
          voucher: 'Voucher',
          discount: 'Giảm giá',
          gift: 'Quà tặng',
          shipping: 'Vận chuyển'
        };
        
        return types[type] || type;
      }
    },
    {
      title: 'Điểm đổi',
      dataIndex: 'pointsCost',
      key: 'pointsCost',
      sorter: (a, b) => a.pointsCost - b.pointsCost
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusTag(status)
    },
    {
      title: 'Đã đổi',
      dataIndex: 'redemptionCount',
      key: 'redemptionCount',
      sorter: (a, b) => a.redemptionCount - b.redemptionCount
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => showEditRewardModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phần thưởng này?"
            onConfirm={() => handleDeleteReward(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>Quản lý chương trình khách hàng thân thiết</Title>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Chương trình thành viên" key="programs">
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showAddProgramModal}
            >
              Thêm chương trình mới
            </Button>
          </div>
          
          <Table
            columns={programColumns}
            dataSource={programs}
            rowKey="id"
            loading={loading}
            expandable={{
              expandedRowRender: record => (
                <div>
                  <Title level={5}>Quy tắc chương trình:</Title>
                  <List
                    size="small"
                    bordered
                    dataSource={record.rules}
                    renderItem={item => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </div>
              )
            }}
          />
        </TabPane>
        
        <TabPane tab="Phần thưởng & Đổi điểm" key="rewards">
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showAddRewardModal}
            >
              Thêm phần thưởng mới
            </Button>
          </div>
          
          <Table
            columns={rewardColumns}
            dataSource={rewards}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        
        <TabPane tab="Thống kê & Báo cáo" key="stats">
          <Alert
            message="Báo cáo chương trình thành viên"
            description="Chức năng báo cáo đang được phát triển và sẽ có sẵn trong phiên bản tới."
            type="info"
            showIcon
          />
        </TabPane>
        
        <TabPane tab="Thiết lập" key="settings">
          <Card title="Thiết lập chung">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tỷ lệ tích điểm mặc định"
                    tooltip="Số điểm tích được cho mỗi VND chi tiêu"
                  >
                    <InputNumber 
                      style={{ width: '100%' }} 
                      min={0} 
                      step={0.00001} 
                      defaultValue={0.0001} 
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Thời hạn điểm (ngày)"
                    tooltip="Số ngày điểm có hiệu lực kể từ ngày tích lũy"
                  >
                    <InputNumber 
                      style={{ width: '100%' }} 
                      min={30} 
                      defaultValue={365} 
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Số tiền tối thiểu để tích điểm"
                  >
                    <InputNumber 
                      style={{ width: '100%' }} 
                      min={0} 
                      step={10000} 
                      defaultValue={0} 
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Giá trị tối thiểu để sử dụng điểm"
                  >
                    <InputNumber 
                      style={{ width: '100%' }} 
                      min={0} 
                      step={10000} 
                      defaultValue={0} 
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                label="Các cấp độ thành viên"
              >
                <Select defaultValue="basic" style={{ width: '100%' }}>
                  <Option value="basic">Cơ bản (3 cấp độ)</Option>
                  <Option value="advanced">Nâng cao (5 cấp độ)</Option>
                  <Option value="custom">Tùy chỉnh</Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary">Lưu thiết lập</Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
      
      {/* Program Modal */}
      <Modal
        title={editingProgram ? "Chỉnh sửa chương trình" : "Thêm chương trình mới"}
        visible={isModalVisible}
        onOk={handleProgramSubmit}
        onCancel={handleProgramCancel}
        width={700}
        okText={editingProgram ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên chương trình"
            rules={[{ required: true, message: 'Vui lòng nhập tên chương trình' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pointsPerVnd"
                label={
                  <span>
                    Tỷ lệ điểm
                    <Tooltip title="Số điểm tích được cho mỗi VND chi tiêu">
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ điểm' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  step={0.00001} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Tạm dừng</Option>
                  <Option value="draft">Bản nháp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="dateRange"
            label="Thời gian áp dụng"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="rules"
            label="Quy tắc chương trình (mỗi quy tắc một dòng)"
          >
            <TextArea rows={5} />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Reward Modal */}
      <Modal
        title={editingReward ? "Chỉnh sửa phần thưởng" : "Thêm phần thưởng mới"}
        visible={isRewardModalVisible}
        onOk={handleRewardSubmit}
        onCancel={handleRewardCancel}
        width={700}
        okText={editingReward ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form
          form={rewardForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên phần thưởng"
            rules={[{ required: true, message: 'Vui lòng nhập tên phần thưởng' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={2} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pointsCost"
                label="Số điểm đổi"
                rules={[{ required: true, message: 'Vui lòng nhập số điểm đổi' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại phần thưởng"
                rules={[{ required: true, message: 'Vui lòng chọn loại phần thưởng' }]}
              >
                <Select>
                  <Option value="voucher">Voucher</Option>
                  <Option value="discount">Giảm giá</Option>
                  <Option value="gift">Quà tặng</Option>
                  <Option value="shipping">Vận chuyển</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Tạm dừng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDays"
                label="Thời hạn (ngày)"
                tooltip="Số ngày phần thưởng có hiệu lực sau khi đổi. Để trống nếu không có hạn"
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="conditions"
            label="Điều kiện áp dụng"
          >
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LoyaltyPrograms; 