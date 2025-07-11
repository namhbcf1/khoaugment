import React from 'react';
import { ConfigProvider, Button, Typography, Layout, Space } from 'antd';
import viVN from 'antd/locale/vi_VN';
import './styles/globals.css';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

// Simple theme
const theme = {
  token: {
    colorPrimary: '#1890ff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
};

function App() {
  return (
    <ConfigProvider locale={viVN} theme={theme}>
      <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)' }}>
        <Content style={{ padding: '50px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'white', maxWidth: '600px' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>💻</div>
            <Title level={1} style={{ color: 'white', marginBottom: '10px' }}>
              Trường Phát Computer
            </Title>
            <Title level={3} style={{ color: 'white', fontWeight: 'normal', marginBottom: '30px' }}>
              Hệ thống quản lý bán hàng
            </Title>
            <Paragraph style={{ color: 'white', fontSize: '16px', marginBottom: '40px' }}>
              Chào mừng bạn đến với hệ thống POS hiện đại của Trường Phát Computer Hòa Bình
            </Paragraph>
            <Space size="large">
              <Button type="primary" size="large" style={{ background: 'white', color: '#1677ff', border: 'none' }}>
                Đăng nhập
              </Button>
              <Button size="large" style={{ background: 'transparent', color: 'white', borderColor: 'white' }}>
                Tìm hiểu thêm
              </Button>
            </Space>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;