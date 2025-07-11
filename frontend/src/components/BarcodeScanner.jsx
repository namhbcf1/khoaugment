import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Input, Alert, Space, Typography, Card, Row, Col } from 'antd';
import { CameraOutlined, ScanOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const BarcodeScanner = ({ visible, onClose, onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [error, setError] = useState('');
  const [lastScanned, setLastScanned] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (visible && !manualMode) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [visible, manualMode]);

  const startCamera = async () => {
    try {
      setError('');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera không được hỗ trợ trên trình duyệt này');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // Simulate barcode detection for demo
        simulateBarcodeDetection();
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setError(err.message || 'Không thể truy cập camera');
      setManualMode(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const simulateBarcodeDetection = () => {
    // Simulate finding a barcode after 3 seconds for demo
    setTimeout(() => {
      if (isScanning) {
        const demoBarcode = '8934673123456';
        handleBarcodeDetected(demoBarcode);
      }
    }, 3000);
  };

  const handleBarcodeDetected = (barcode) => {
    setLastScanned(barcode);
    setError('');
    onScan(barcode);
    
    // Auto close after successful scan
    setTimeout(() => {
      handleClose();
    }, 1000);
  };

  const handleManualScan = () => {
    const barcode = manualBarcode.trim();
    if (!barcode) {
      setError('Vui lòng nhập mã vạch');
      return;
    }
    handleBarcodeDetected(barcode);
  };

  const toggleMode = () => {
    if (manualMode) {
      setManualMode(false);
      startCamera();
    } else {
      setManualMode(true);
      stopCamera();
    }
    setError('');
    setManualBarcode('');
  };

  const handleClose = () => {
    stopCamera();
    setManualBarcode('');
    setError('');
    setLastScanned('');
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <ScanOutlined />
          <span>Quét mã vạch</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div style={{ padding: '16px 0' }}>
        {!manualMode ? (
          // Camera Scanner Mode
          <Card>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '300px',
                  backgroundColor: '#000',
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
              {isScanning && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    height: '2px',
                    backgroundColor: '#ff4d4f',
                    boxShadow: '0 0 10px #ff4d4f',
                    animation: 'scan 2s ease-in-out infinite'
                  }}
                />
              )}
            </div>
            
            <Row gutter={[8, 8]}>
              <Col span={8}>
                <Button
                  type="primary"
                  icon={<CameraOutlined />}
                  onClick={startCamera}
                  disabled={isScanning}
                  block
                >
                  {isScanning ? 'Đang quét...' : 'Bắt đầu quét'}
                </Button>
              </Col>
              <Col span={8}>
                <Button
                  icon={<CloseOutlined />}
                  onClick={stopCamera}
                  disabled={!isScanning}
                  block
                >
                  Dừng quét
                </Button>
              </Col>
              <Col span={8}>
                <Button
                  icon={<EditOutlined />}
                  onClick={toggleMode}
                  block
                >
                  Nhập thủ công
                </Button>
              </Col>
            </Row>
          </Card>
        ) : (
          // Manual Input Mode
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={5}>Nhập mã vạch thủ công</Title>
              <Input
                placeholder="Nhập hoặc quét mã vạch..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onPressEnter={handleManualScan}
                size="large"
                style={{ fontFamily: 'monospace' }}
                autoFocus
              />
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Button
                    type="primary"
                    icon={<ScanOutlined />}
                    onClick={handleManualScan}
                    disabled={!manualBarcode.trim()}
                    block
                  >
                    Xử lý
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    icon={<CameraOutlined />}
                    onClick={toggleMode}
                    block
                  >
                    Quét camera
                  </Button>
                </Col>
              </Row>
            </Space>
          </Card>
        )}

        {/* Status Messages */}
        <div style={{ marginTop: 16 }}>
          {isScanning && (
            <Alert
              message="Đang quét mã vạch..."
              description="Đặt mã vạch trong khung hình để quét tự động"
              type="info"
              showIcon
              style={{ marginBottom: 8 }}
            />
          )}
          
          {lastScanned && (
            <Alert
              message={`Đã quét thành công: ${lastScanned}`}
              type="success"
              showIcon
              style={{ marginBottom: 8 }}
            />
          )}
          
          {error && (
            <Alert
              message="Lỗi"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 8 }}
            />
          )}
        </div>

        {/* Instructions */}
        <Card size="small" style={{ marginTop: 16, backgroundColor: '#f6f6f6' }}>
          <Title level={5}>Hướng dẫn sử dụng:</Title>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Đặt mã vạch trong khung hình để quét tự động</li>
            <li>Đảm bảo mã vạch rõ nét và đủ ánh sáng</li>
            <li>Có thể nhập thủ công nếu không quét được</li>
            <li>Nhấn Enter hoặc nút Xử lý để tìm sản phẩm</li>
          </ul>
        </Card>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { 
            transform: translate(-50%, -100px); 
            opacity: 0.5; 
          }
          50% { 
            transform: translate(-50%, 100px); 
            opacity: 1; 
          }
        }
      `}</style>
    </Modal>
  );
};

export default BarcodeScanner;
