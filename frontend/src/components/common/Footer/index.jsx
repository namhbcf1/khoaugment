import React from 'react';
import { Layout, Typography, Row, Col, Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { 
  FacebookOutlined, 
  TwitterOutlined, 
  InstagramOutlined, 
  YoutubeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  HeartFilled
} from '@ant-design/icons';
import './styles.css';

const { Footer } = Layout;
const { Title, Text, Link: TextLink } = Typography;

/**
 * Footer component với thông tin liên hệ và liên kết
 */
const AppFooter = ({ minimal = false }) => {
  const currentYear = new Date().getFullYear();
  
  // Footer tối giản chỉ hiển thị copyright
  if (minimal) {
    return (
      <Footer className="app-footer minimal">
        <div className="copyright">
          <Text type="secondary">
            © {currentYear} Trường Phát Computer. Tất cả quyền được bảo lưu.
          </Text>
        </div>
      </Footer>
    );
  }
  
  // Footer đầy đủ với thông tin liên hệ và liên kết
  return (
    <Footer className="app-footer">
      <div className="footer-content">
        <Row gutter={[32, 24]}>
          {/* Thông tin công ty */}
          <Col xs={24} sm={24} md={8} lg={8}>
            <div className="company-info">
              <Title level={4}>Trường Phát Computer</Title>
              <Space direction="vertical" size="small">
                <div className="contact-item">
                  <EnvironmentOutlined /> Hòa Bình, Việt Nam
                </div>
                <div className="contact-item">
                  <PhoneOutlined /> 0836.768.597
                </div>
                <div className="contact-item">
                  <MailOutlined /> contact@truongphat.com
                </div>
                <div className="contact-item">
                  <GlobalOutlined /> www.truongphat.com
                </div>
              </Space>
              
              <Space className="social-links" size="middle">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <FacebookOutlined />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <TwitterOutlined />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <InstagramOutlined />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <YoutubeOutlined />
                </a>
              </Space>
            </div>
          </Col>

          {/* Liên kết hữu ích */}
          <Col xs={12} sm={12} md={8} lg={8}>
            <Title level={4}>Liên kết</Title>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <ul className="footer-links">
                  <li><Link to="/about">Về chúng tôi</Link></li>
                  <li><Link to="/products">Sản phẩm</Link></li>
                  <li><Link to="/services">Dịch vụ</Link></li>
                  <li><Link to="/contact">Liên hệ</Link></li>
                </ul>
              </Col>
              <Col span={12}>
                <ul className="footer-links">
                  <li><Link to="/faq">FAQ</Link></li>
                  <li><Link to="/terms">Điều khoản</Link></li>
                  <li><Link to="/privacy">Chính sách</Link></li>
                  <li><Link to="/sitemap">Sitemap</Link></li>
                </ul>
              </Col>
            </Row>
          </Col>

          {/* Giờ làm việc */}
          <Col xs={12} sm={12} md={8} lg={8}>
            <Title level={4}>Giờ làm việc</Title>
            <ul className="business-hours">
              <li>
                <span>Thứ 2 - Thứ 6:</span>
                <span>8:00 - 20:00</span>
              </li>
              <li>
                <span>Thứ 7:</span>
                <span>8:00 - 18:00</span>
              </li>
              <li>
                <span>Chủ nhật:</span>
                <span>9:00 - 17:00</span>
              </li>
              <li className="note">
                <span>Lễ tết:</span>
                <span>Vui lòng liên hệ</span>
              </li>
            </ul>
          </Col>
        </Row>
      </div>
      
      <Divider style={{ margin: '24px 0 16px' }} />
      
      <div className="footer-bottom">
        <div className="copyright">
          <Text type="secondary">
            © {currentYear} Trường Phát Computer. Tất cả quyền được bảo lưu.
          </Text>
        </div>
        <div className="powered-by">
          <Text type="secondary">
            Phát triển bởi <TextLink href="https://truongphat.com">Trường Phát</TextLink> với <HeartFilled style={{ color: '#ff4d4f' }} />
          </Text>
        </div>
      </div>
    </Footer>
  );
};

export default AppFooter; 