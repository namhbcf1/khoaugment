import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Space,
  Divider,
  Typography,
  Row,
  Col,
  Select,
  TimePicker,
  Switch,
  Tabs,
  message,
  Avatar,
  Tooltip,
  Tag
} from 'antd';
import {
  UploadOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  BankOutlined,
  IdcardOutlined,
  ShopOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import uploadImage from '../../../utils/helpers/uploadImage';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const CompanyProfile = () => {
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [activeTab, setActiveTab] = useState('basic');
  const [businessHours, setBusinessHours] = useState([
    { day: 'Monday', open: true, openTime: '08:00', closeTime: '17:30' },
    { day: 'Tuesday', open: true, openTime: '08:00', closeTime: '17:30' },
    { day: 'Wednesday', open: true, openTime: '08:00', closeTime: '17:30' },
    { day: 'Thursday', open: true, openTime: '08:00', closeTime: '17:30' },
    { day: 'Friday', open: true, openTime: '08:00', closeTime: '17:30' },
    { day: 'Saturday', open: true, openTime: '08:00', closeTime: '12:00' },
    { day: 'Sunday', open: false, openTime: '00:00', closeTime: '00:00' }
  ]);
  const [locations, setLocations] = useState([
    { 
      id: 1, 
      name: 'Main Store', 
      address: '123 Lê Lợi, Phường Phong Phú, Thành phố Hòa Bình, Hòa Bình',
      phone: '0836.768.597',
      email: 'main@truongphat.com',
      isHeadquarters: true
    },
    { 
      id: 2, 
      name: 'Branch Store', 
      address: '456 Trần Hưng Đạo, Phường Tân Thịnh, Thành phố Hòa Bình, Hòa Bình',
      phone: '0836.768.598',
      email: 'branch@truongphat.com',
      isHeadquarters: false
    }
  ]);
  
  const handleSave = () => {
    form.validateFields()
      .then((values) => {
        console.log('Form values:', values);
        message.success('Company profile updated successfully');
      })
      .catch((errorInfo) => {
        console.log('Form validation failed:', errorInfo);
      });
  };
  
  const handleBusinessHoursChange = (index, field, value) => {
    const updatedHours = [...businessHours];
    updatedHours[index][field] = value;
    setBusinessHours(updatedHours);
  };
  
  const handleAddLocation = () => {
    const newLocation = {
      id: locations.length + 1,
      name: `New Location ${locations.length + 1}`,
      address: '',
      phone: '',
      email: '',
      isHeadquarters: false
    };
    
    setLocations([...locations, newLocation]);
  };
  
  const handleDeleteLocation = (id) => {
    const updatedLocations = locations.filter(location => location.id !== id);
    setLocations(updatedLocations);
  };
  
  const handleLogoChange = (info) => {
    if (info.file.status === 'done') {
      // Get this url from response in real world
      setLogoUrl(URL.createObjectURL(info.file.originFileObj));
      message.success(`${info.file.name} uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} upload failed.`);
    }
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>
          <ShopOutlined /> Company Profile
        </Title>
        <Paragraph>
          Manage your company information, business details, and locations.
        </Paragraph>
        
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <InfoCircleOutlined /> Basic Information
              </span>
            } 
            key="basic"
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                companyName: 'Trường Phát Computer',
                legalName: 'Công ty TNHH Trường Phát Computer',
                industry: 'retail',
                taxId: '0123456789',
                phone: '0836.768.597',
                email: 'contact@truongphat.com',
                website: 'www.truongphat.com',
                address: '123 Lê Lợi, Phường Phong Phú',
                city: 'Thành phố Hòa Bình',
                state: 'Hòa Bình',
                postalCode: '36000',
                country: 'Vietnam',
                currency: 'VND',
                language: 'vi',
                timeZone: 'Asia/Ho_Chi_Minh',
                dateFormat: 'DD/MM/YYYY',
                fiscalYearStart: '01/01'
              }}
            >
              <Row gutter={24}>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Form.Item label="Company Logo">
                    <div style={{ marginBottom: '16px' }}>
                      <Avatar 
                        src={logoUrl} 
                        size={128}
                        shape="square"
                      />
                    </div>
                    <Upload 
                      onChange={handleLogoChange}
                      showUploadList={false}
                      customRequest={({ onSuccess }) => {
                        setTimeout(() => {
                          onSuccess("ok", null);
                        }, 0);
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Change Logo</Button>
                    </Upload>
                  </Form.Item>
                </Col>
                
                <Col span={16}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="companyName"
                        label="Company Name"
                        rules={[{ required: true, message: 'Please enter company name' }]}
                      >
                        <Input prefix={<ShopOutlined />} placeholder="Company Name" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="legalName"
                        label="Legal Business Name"
                        rules={[{ required: true, message: 'Please enter legal business name' }]}
                      >
                        <Input prefix={<BankOutlined />} placeholder="Legal Business Name" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="industry"
                        label="Industry"
                      >
                        <Select>
                          <Option value="retail">Retail</Option>
                          <Option value="wholesale">Wholesale</Option>
                          <Option value="manufacturing">Manufacturing</Option>
                          <Option value="services">Services</Option>
                          <Option value="technology">Technology</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="taxId"
                        label="Tax ID / Business Registration Number"
                      >
                        <Input prefix={<IdcardOutlined />} placeholder="Tax ID" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          { required: true, message: 'Please enter email address' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="Email Address" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="website"
                        label="Website"
                      >
                        <Input prefix={<GlobalOutlined />} placeholder="Website" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              
              <Divider>Address Information</Divider>
              
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="address"
                    label="Street Address"
                    rules={[{ required: true, message: 'Please enter street address' }]}
                  >
                    <Input prefix={<HomeOutlined />} placeholder="Street Address" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="city"
                    label="City"
                    rules={[{ required: true, message: 'Please enter city' }]}
                  >
                    <Input placeholder="City" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="state"
                    label="State/Province"
                    rules={[{ required: true, message: 'Please enter state/province' }]}
                  >
                    <Input placeholder="State/Province" />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="postalCode"
                    label="Postal Code"
                  >
                    <Input placeholder="Postal Code" />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="country"
                    label="Country"
                    rules={[{ required: true, message: 'Please select country' }]}
                  >
                    <Select>
                      <Option value="Vietnam">Vietnam</Option>
                      <Option value="United States">United States</Option>
                      <Option value="China">China</Option>
                      <Option value="Japan">Japan</Option>
                      <Option value="South Korea">South Korea</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider>System Settings</Divider>
              
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    name="currency"
                    label="Default Currency"
                    rules={[{ required: true, message: 'Please select currency' }]}
                  >
                    <Select>
                      <Option value="VND">VND (₫)</Option>
                      <Option value="USD">USD ($)</Option>
                      <Option value="EUR">EUR (€)</Option>
                      <Option value="JPY">JPY (¥)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="language"
                    label="Default Language"
                    rules={[{ required: true, message: 'Please select language' }]}
                  >
                    <Select>
                      <Option value="vi">Vietnamese</Option>
                      <Option value="en">English</Option>
                      <Option value="zh">Chinese</Option>
                      <Option value="ja">Japanese</Option>
                      <Option value="ko">Korean</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="timeZone"
                    label="Time Zone"
                    rules={[{ required: true, message: 'Please select time zone' }]}
                  >
                    <Select>
                      <Option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</Option>
                      <Option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</Option>
                      <Option value="Asia/Singapore">Asia/Singapore (GMT+8)</Option>
                      <Option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="dateFormat"
                    label="Date Format"
                    rules={[{ required: true, message: 'Please select date format' }]}
                  >
                    <Select>
                      <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                      <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                      <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                      <Option value="YYYY/MM/DD">YYYY/MM/DD</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    name="fiscalYearStart"
                    label="Fiscal Year Start"
                    tooltip="Format: DD/MM"
                  >
                    <Input placeholder="01/01" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="numberFormat"
                    label="Number Format"
                    initialValue="1,234.56"
                  >
                    <Select>
                      <Option value="1,234.56">1,234.56</Option>
                      <Option value="1.234,56">1.234,56</Option>
                      <Option value="1 234,56">1 234,56</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <ClockCircleOutlined /> Business Hours
              </span>
            } 
            key="hours"
          >
            <Card title="Set Your Business Hours">
              <div style={{ marginBottom: 16 }}>
                <Text>Define when your business is open to customers. This information will be displayed on receipts and customer-facing interfaces.</Text>
              </div>
              
              {businessHours.map((hours, index) => (
                <Row gutter={16} key={hours.day} style={{ marginBottom: 16 }}>
                  <Col span={4}>
                    <Text strong>{hours.day}</Text>
                  </Col>
                  <Col span={4}>
                    <Switch 
                      checkedChildren="Open" 
                      unCheckedChildren="Closed" 
                      checked={hours.open}
                      onChange={(checked) => handleBusinessHoursChange(index, 'open', checked)}
                    />
                  </Col>
                  <Col span={8}>
                    <TimePicker 
                      format="HH:mm"
                      value={dayjs(hours.openTime, 'HH:mm')}
                      onChange={(time, timeString) => handleBusinessHoursChange(index, 'openTime', timeString)}
                      disabled={!hours.open}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={8}>
                    <TimePicker 
                      format="HH:mm"
                      value={dayjs(hours.closeTime, 'HH:mm')}
                      onChange={(time, timeString) => handleBusinessHoursChange(index, 'closeTime', timeString)}
                      disabled={!hours.open}
                      style={{ width: '100%' }}
                    />
                  </Col>
                </Row>
              ))}
              
              <Divider />
              
              <Form layout="vertical">
                <Form.Item
                  name="holidayMessage"
                  label="Holiday Message"
                  initialValue="We will be closed on national holidays."
                >
                  <TextArea rows={3} placeholder="Enter message to display during holidays" />
                </Form.Item>
                
                <Form.Item
                  name="specialHours"
                  label="Special Hours Notice"
                  initialValue=""
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Enter any special hours information (e.g., 'We close early on Dec 24th')"
                  />
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <EnvironmentOutlined /> Locations
              </span>
            } 
            key="locations"
          >
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddLocation}
              >
                Add New Location
              </Button>
            </div>
            
            {locations.map((location, index) => (
              <Card 
                key={location.id}
                title={
                  <Space>
                    {location.name}
                    {location.isHeadquarters && (
                      <Tag color="blue">Headquarters</Tag>
                    )}
                  </Space>
                }
                style={{ marginBottom: 16 }}
                extra={
                  <Tooltip title="Delete Location">
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDeleteLocation(location.id)}
                      disabled={location.isHeadquarters}
                    />
                  </Tooltip>
                }
              >
                <Form layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Location Name"
                        initialValue={location.name}
                      >
                        <Input placeholder="Location Name" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Is Headquarters"
                        initialValue={location.isHeadquarters}
                        valuePropName="checked"
                      >
                        <Switch 
                          disabled={location.isHeadquarters}
                          checkedChildren="Yes" 
                          unCheckedChildren="No" 
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        label="Address"
                        initialValue={location.address}
                      >
                        <TextArea rows={2} placeholder="Full address" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Phone"
                        initialValue={location.phone}
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="Phone number" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Email"
                        initialValue={location.email}
                      >
                        <Input prefix={<MailOutlined />} placeholder="Email address" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            ))}
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <TeamOutlined /> Personnel
              </span>
            } 
            key="personnel"
          >
            <Form layout="vertical">
              <Row gutter={24}>
                <Col span={12}>
                  <Card title="Primary Contacts" style={{ marginBottom: 24 }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="ownerName"
                          label="Owner/CEO"
                          initialValue="Nguyen Van A"
                        >
                          <Input placeholder="Full name" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="ownerEmail"
                          label="Owner/CEO Email"
                          initialValue="owner@truongphat.com"
                        >
                          <Input placeholder="Email address" />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="managerName"
                          label="Store Manager"
                          initialValue="Tran Thi B"
                        >
                          <Input placeholder="Full name" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="managerEmail"
                          label="Manager Email"
                          initialValue="manager@truongphat.com"
                        >
                          <Input placeholder="Email address" />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="accountingName"
                          label="Accounting Contact"
                          initialValue="Le Van C"
                        >
                          <Input placeholder="Full name" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="accountingEmail"
                          label="Accounting Email"
                          initialValue="accounting@truongphat.com"
                        >
                          <Input placeholder="Email address" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card title="Department Information" style={{ marginBottom: 24 }}>
                    <Form.Item
                      name="salesDept"
                      label="Sales Department"
                      initialValue="sales@truongphat.com | 0836.768.597 (ext. 1)"
                    >
                      <Input placeholder="Contact information" />
                    </Form.Item>
                    
                    <Form.Item
                      name="supportDept"
                      label="Technical Support"
                      initialValue="support@truongphat.com | 0836.768.597 (ext. 2)"
                    >
                      <Input placeholder="Contact information" />
                    </Form.Item>
                    
                    <Form.Item
                      name="hrDept"
                      label="Human Resources"
                      initialValue="hr@truongphat.com | 0836.768.597 (ext. 3)"
                    >
                      <Input placeholder="Contact information" />
                    </Form.Item>
                    
                    <Form.Item
                      name="marketingDept"
                      label="Marketing"
                      initialValue="marketing@truongphat.com | 0836.768.597 (ext. 4)"
                    >
                      <Input placeholder="Contact information" />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
              
              <Card title="Emergency Contacts">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="emergencyName1"
                      label="Primary Emergency Contact"
                      initialValue="Nguyen Van A"
                    >
                      <Input placeholder="Full name" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="emergencyPhone1"
                      label="Phone"
                      initialValue="0912.345.678"
                    >
                      <Input placeholder="Phone number" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="emergencyRelation1"
                      label="Relationship"
                      initialValue="Owner"
                    >
                      <Input placeholder="Relationship to company" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="emergencyName2"
                      label="Secondary Emergency Contact"
                      initialValue="Tran Thi B"
                    >
                      <Input placeholder="Full name" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="emergencyPhone2"
                      label="Phone"
                      initialValue="0987.654.321"
                    >
                      <Input placeholder="Phone number" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="emergencyRelation2"
                      label="Relationship"
                      initialValue="Manager"
                    >
                      <Input placeholder="Relationship to company" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Form>
          </TabPane>
        </Tabs>
        
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Button 
            type="primary" 
            icon={<SaveOutlined />}
            onClick={handleSave}
            size="large"
          >
            Save Company Profile
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CompanyProfile; 