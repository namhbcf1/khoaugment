import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Card, 
  Typography, 
  Space, 
  Divider, 
  Table, 
  Modal, 
  Select, 
  Radio, 
  Form,
  Input,
  Row,
  Col,
  Tooltip,
  message,
  Switch,
  Spin,
  Result
} from 'antd';
import { 
  PrinterOutlined, 
  FilePdfOutlined, 
  MailOutlined, 
  QrcodeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  ReloadOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ReceiptPrinter = ({ orderData, visible, onClose, customerInfo }) => {
  const [printMode, setPrintMode] = useState('thermal');
  const [emailReceipt, setEmailReceipt] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printComplete, setPrintComplete] = useState(false);
  const [printerError, setPrinterError] = useState(false);
  const [printerOptions, setPrinterOptions] = useState([
    { label: 'Máy in nhiệt EPSON TM-T82', value: 'thermal1' },
    { label: 'Máy in nhiệt XPRINTER XP-58', value: 'thermal2' },
    { label: 'Máy in thường HP LaserJet Pro', value: 'laser1' }
  ]);
  const [selectedPrinter, setSelectedPrinter] = useState('thermal1');
  
  const printRef = useRef();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Calculate total before tax
  const calculateSubTotal = () => {
    return orderData?.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  };

  // Handle print action
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeprint: () => {
      setIsPrinting(true);
      setPrintComplete(false);
      setPrinterError(false);
    },
    onAfterPrint: () => {
      setTimeout(() => {
        setIsPrinting(false);
        setPrintComplete(true);
        
        if (emailReceipt && orderData?.customer?.email) {
          message.success(`Đã gửi hóa đơn điện tử đến ${orderData.customer.email}`);
        }
      }, 1500);
    },
    onError: () => {
      setIsPrinting(false);
      setPrinterError(true);
    },
  });

  // Reset states when modal closes
  useEffect(() => {
    if (!visible) {
      setIsPrinting(false);
      setPrintComplete(false);
      setPrinterError(false);
    }
  }, [visible]);

  // Render thermal receipt
  const renderThermalReceipt = () => {
    return (
      <div 
        ref={printRef}
        className="thermal-receipt" 
        style={{
          width: '80mm',
          padding: '10mm 5mm',
          margin: '0 auto',
          backgroundColor: 'white',
          fontFamily: 'monospace',
          fontSize: '12px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h1 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>TRƯỜNG PHÁT COMPUTER</h1>
          <p style={{ margin: '5px 0' }}>Hòa Bình, Việt Nam</p>
          <p style={{ margin: '5px 0' }}>Hotline: 0836.768.597</p>
          <p style={{ margin: '5px 0' }}>MST: 5400 111 222</p>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '1px dashed #000', paddingBottom: '10px' }}>
          <h2 style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>HÓA ĐƠN BÁN HÀNG</h2>
          <p style={{ margin: '5px 0' }}>Số: {orderData?.id || 'POS-00001'}</p>
          <p style={{ margin: '5px 0' }}>Ngày: {formatDate(orderData?.date || new Date())}</p>
        </div>
        
        {/* Customer Info */}
        {orderData?.customer && (
          <div style={{ marginBottom: '10px', borderBottom: '1px dashed #000', paddingBottom: '10px' }}>
            <p style={{ margin: '3px 0' }}><strong>Khách hàng:</strong> {orderData.customer.name}</p>
            <p style={{ margin: '3px 0' }}><strong>SĐT:</strong> {orderData.customer.phone}</p>
            {orderData.customer.address && <p style={{ margin: '3px 0' }}><strong>Địa chỉ:</strong> {orderData.customer.address}</p>}
          </div>
        )}
        
        {/* Items */}
        <div style={{ marginBottom: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px dashed #000' }}>
                <th style={{ textAlign: 'left', paddingBottom: '5px' }}>Mặt hàng</th>
                <th style={{ textAlign: 'right', paddingBottom: '5px' }}>SL</th>
                <th style={{ textAlign: 'right', paddingBottom: '5px' }}>Đ.Giá</th>
                <th style={{ textAlign: 'right', paddingBottom: '5px' }}>T.Tiền</th>
              </tr>
            </thead>
            <tbody>
              {orderData?.items?.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px dotted #ccc' }}>
                  <td style={{ textAlign: 'left', paddingTop: '5px', paddingBottom: '5px' }}>{item.name}</td>
                  <td style={{ textAlign: 'right', paddingTop: '5px', paddingBottom: '5px' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', paddingTop: '5px', paddingBottom: '5px' }}>{formatCurrency(item.price)}</td>
                  <td style={{ textAlign: 'right', paddingTop: '5px', paddingBottom: '5px' }}>{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Summary */}
        <div style={{ marginBottom: '10px', borderBottom: '1px dashed #000', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
            <span>Tổng tiền hàng:</span>
            <span>{formatCurrency(calculateSubTotal())}</span>
          </div>
          {orderData?.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
              <span>Giảm giá:</span>
              <span>-{formatCurrency(orderData.discount)}</span>
            </div>
          )}
          {orderData?.tax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
              <span>Thuế (VAT 10%):</span>
              <span>{formatCurrency(orderData.tax)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0', fontWeight: 'bold' }}>
            <span>Thanh toán:</span>
            <span>{formatCurrency(orderData?.total || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
            <span>Tiền khách đưa:</span>
            <span>{formatCurrency(orderData?.amountPaid || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
            <span>Tiền thừa:</span>
            <span>{formatCurrency((orderData?.amountPaid || 0) - (orderData?.total || 0))}</span>
          </div>
        </div>
        
        {/* Payment method */}
        <div style={{ marginBottom: '10px', borderBottom: '1px dashed #000', paddingBottom: '10px' }}>
          <p style={{ margin: '3px 0' }}><strong>Phương thức:</strong> {orderData?.paymentMethod || 'Tiền mặt'}</p>
          <p style={{ margin: '3px 0' }}><strong>Thu ngân:</strong> {orderData?.cashier || 'Nguyễn Văn A'}</p>
        </div>
        
        {/* Footer */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <p style={{ margin: '5px 0' }}>Cảm ơn Quý khách đã mua hàng!</p>
          <p style={{ margin: '5px 0' }}>Hẹn gặp lại quý khách!</p>
          {orderData?.id && (
            <div style={{ margin: '10px auto', width: '100px', height: '100px' }}>
              <QRCodeSVG 
                value={`https://truongphat.com/invoice/${orderData.id}`} 
                size={100}
                renderAs="svg"
                level="H"
              />
            </div>
          )}
          <p style={{ margin: '5px 0', fontSize: '10px' }}>Truy cập website: truongphat.com</p>
          <p style={{ margin: '5px 0', fontSize: '10px' }}>Hotline: 0836.768.597</p>
        </div>
      </div>
    );
  };

  // Render A4 receipt
  const renderA4Receipt = () => {
    return (
      <div 
        ref={printRef}
        className="a4-receipt" 
        style={{
          width: '210mm',
          padding: '20mm',
          margin: '0 auto',
          backgroundColor: 'white',
          fontFamily: 'Arial, sans-serif',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: '0', fontSize: '24px' }}>TRƯỜNG PHÁT COMPUTER</h1>
            <p style={{ margin: '5px 0' }}>Địa chỉ: Hòa Bình, Việt Nam</p>
            <p style={{ margin: '5px 0' }}>Hotline: 0836.768.597</p>
            <p style={{ margin: '5px 0' }}>Email: contact@truongphat.com</p>
            <p style={{ margin: '5px 0' }}>MST: 5400 111 222</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: '0', fontSize: '20px', color: '#1890ff' }}>HÓA ĐƠN</h2>
            <p style={{ margin: '5px 0' }}><strong>Số:</strong> {orderData?.id || 'POS-00001'}</p>
            <p style={{ margin: '5px 0' }}><strong>Ngày:</strong> {formatDate(orderData?.date || new Date())}</p>
          </div>
        </div>
        
        <Divider style={{ margin: '10px 0' }} />
        
        {/* Customer Info */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Thông tin khách hàng</h3>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: '1' }}>
              <p style={{ margin: '5px 0' }}><strong>Khách hàng:</strong> {orderData?.customer?.name || 'Khách lẻ'}</p>
              <p style={{ margin: '5px 0' }}><strong>SĐT:</strong> {orderData?.customer?.phone || 'N/A'}</p>
            </div>
            <div style={{ flex: '1' }}>
              <p style={{ margin: '5px 0' }}><strong>Địa chỉ:</strong> {orderData?.customer?.address || 'N/A'}</p>
              <p style={{ margin: '5px 0' }}><strong>Email:</strong> {orderData?.customer?.email || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Items */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Chi tiết đơn hàng</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>STT</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Mặt hàng</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Đơn giá</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>SL</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {orderData?.items?.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{item.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Summary */}
        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '5px 0' }}>
            <span style={{ width: '150px', textAlign: 'left' }}>Tổng tiền hàng:</span>
            <span style={{ width: '150px' }}>{formatCurrency(calculateSubTotal())}</span>
          </div>
          {orderData?.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '5px 0' }}>
              <span style={{ width: '150px', textAlign: 'left' }}>Giảm giá:</span>
              <span style={{ width: '150px' }}>-{formatCurrency(orderData.discount)}</span>
            </div>
          )}
          {orderData?.tax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '5px 0' }}>
              <span style={{ width: '150px', textAlign: 'left' }}>Thuế (VAT 10%):</span>
              <span style={{ width: '150px' }}>{formatCurrency(orderData.tax)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>
            <span style={{ width: '150px', textAlign: 'left' }}>Thanh toán:</span>
            <span style={{ width: '150px' }}>{formatCurrency(orderData?.total || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '5px 0' }}>
            <span style={{ width: '150px', textAlign: 'left' }}>Tiền khách đưa:</span>
            <span style={{ width: '150px' }}>{formatCurrency(orderData?.amountPaid || 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '5px 0' }}>
            <span style={{ width: '150px', textAlign: 'left' }}>Tiền thừa:</span>
            <span style={{ width: '150px' }}>{formatCurrency((orderData?.amountPaid || 0) - (orderData?.total || 0))}</span>
          </div>
        </div>
        
        <Divider style={{ margin: '10px 0' }} />
        
        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <div style={{ textAlign: 'center', flex: '1' }}>
            <p style={{ fontWeight: 'bold' }}>Người mua hàng</p>
            <p style={{ fontStyle: 'italic', fontSize: '12px' }}>(Ký, ghi rõ họ tên)</p>
            <div style={{ height: '70px' }}></div>
            <p>{orderData?.customer?.name || ''}</p>
          </div>
          <div style={{ textAlign: 'center', flex: '1' }}>
            <p style={{ fontWeight: 'bold' }}>Người bán hàng</p>
            <p style={{ fontStyle: 'italic', fontSize: '12px' }}>(Ký, ghi rõ họ tên)</p>
            <div style={{ height: '70px' }}></div>
            <p>{orderData?.cashier || 'Nguyễn Văn A'}</p>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ marginTop: '30px', borderTop: '1px dashed #ddd', paddingTop: '10px', textAlign: 'center' }}>
          <p style={{ margin: '5px 0' }}>Cảm ơn Quý khách đã mua hàng tại Trường Phát Computer!</p>
          <p style={{ margin: '5px 0' }}>Mọi thắc mắc vui lòng liên hệ: 0836.768.597 | contact@truongphat.com</p>
          <p style={{ margin: '5px 0' }}>Website: truongphat.com</p>
          
          <div style={{ margin: '10px auto', display: 'flex', justifyContent: 'center' }}>
            {orderData?.id && (
              <div style={{ margin: '0 auto', width: '100px', height: '100px' }}>
                <QRCodeSVG 
                  value={`https://truongphat.com/invoice/${orderData.id}`} 
                  size={100}
                  renderAs="svg"
                  level="H"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      title={<><PrinterOutlined /> In hóa đơn</>}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
    >
      {printComplete ? (
        <Result
          status="success"
          title="In hóa đơn thành công!"
          subTitle="Hóa đơn đã được gửi đến máy in"
          extra={[
            <Button key="print-another" onClick={() => setPrintComplete(false)}>
              In hóa đơn khác
            </Button>,
            <Button type="primary" key="close" onClick={onClose}>
              Đóng
            </Button>,
          ]}
        />
      ) : printerError ? (
        <Result
          status="error"
          title="Lỗi khi in hóa đơn!"
          subTitle="Không thể kết nối với máy in. Vui lòng kiểm tra lại kết nối máy in."
          extra={[
            <Button key="try-again" onClick={() => setPrinterError(false)}>
              Thử lại
            </Button>,
            <Button type="primary" key="close" onClick={onClose}>
              Đóng
            </Button>,
          ]}
        />
      ) : isPrinting ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 20 }}>Đang in hóa đơn...</p>
        </div>
      ) : (
        <div style={{ padding: '0 20px' }}>
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card title="Tùy chọn in" size="small">
                <Form layout="vertical">
                  <Form.Item label="Loại hóa đơn">
                    <Radio.Group 
                      value={printMode} 
                      onChange={e => setPrintMode(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Radio value="thermal">
                          <Text>Hóa đơn nhiệt (80mm)</Text>
                        </Radio>
                        <Radio value="a4">
                          <Text>Hóa đơn A4</Text>
                        </Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item label="Máy in">
                    <Select 
                      value={selectedPrinter}
                      onChange={value => setSelectedPrinter(value)}
                      style={{ width: '100%' }}
                    >
                      {printerOptions.map(printer => (
                        <Option key={printer.value} value={printer.value}>
                          {printer.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="Tùy chọn khác">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Gửi qua email</Text>
                        <Switch 
                          checked={emailReceipt} 
                          onChange={setEmailReceipt} 
                          disabled={!orderData?.customer?.email}
                        />
                      </div>
                      {!orderData?.customer?.email && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Khách hàng không có email
                        </Text>
                      )}
                    </Space>
                  </Form.Item>
                </Form>
                
                <Divider style={{ margin: '12px 0' }} />
                
                <Space style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    icon={<PrinterOutlined />} 
                    onClick={handlePrint}
                    block
                  >
                    In hóa đơn
                  </Button>
                </Space>
                
                <Space style={{ width: '100%', marginTop: '10px' }}>
                  <Tooltip title="Lưu dưới dạng PDF">
                    <Button icon={<FilePdfOutlined />}>
                      PDF
                    </Button>
                  </Tooltip>
                  <Tooltip title="Gửi qua email">
                    <Button 
                      icon={<MailOutlined />}
                      disabled={!orderData?.customer?.email}
                    >
                      Email
                    </Button>
                  </Tooltip>
                  <Tooltip title="Lưu về máy tính">
                    <Button icon={<DownloadOutlined />}>
                      Lưu
                    </Button>
                  </Tooltip>
                </Space>
              </Card>
            </Col>

            <Col span={16}>
              <Card 
                title="Xem trước hóa đơn" 
                size="small"
                style={{ maxHeight: '600px', overflow: 'auto' }}
              >
                <div style={{ background: '#f0f2f5', padding: '20px', display: 'flex', justifyContent: 'center' }}>
                  {printMode === 'thermal' ? renderThermalReceipt() : renderA4Receipt()}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  );
};

export default ReceiptPrinter; 