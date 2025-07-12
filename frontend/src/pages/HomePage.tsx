import {
  AppstoreOutlined,
  ArrowRightOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Layout,
  Row,
  Space,
  Typography,
} from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { USER_ROLES } from "../utils/constants/USER_ROLES";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

/**
 * Home Page Component
 * Landing page with role-based navigation
 */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Role-based redirection
  const handleEnterApp = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    switch (user.role) {
      case USER_ROLES.ADMIN:
        navigate("/admin/dashboard");
        break;
      case USER_ROLES.CASHIER:
        navigate("/pos");
        break;
      case USER_ROLES.STAFF:
        navigate("/staff/dashboard");
        break;
      default:
        navigate("/login");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content
        style={{ padding: "50px 50px", maxWidth: 1200, margin: "0 auto" }}
      >
        <Row gutter={[24, 24]} align="middle" justify="center">
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 40 }}>
              <Title level={1}>KhoAugment POS</Title>
              <Title level={3} style={{ fontWeight: "normal", marginTop: 0 }}>
                Hệ thống quản lý bán hàng toàn diện cho doanh nghiệp Việt Nam
              </Title>

              <Paragraph style={{ fontSize: 16, marginTop: 24 }}>
                Tối ưu hóa quy trình bán hàng, quản lý hàng tồn kho và thúc đẩy
                tăng trưởng doanh thu với nền tảng POS hiện đại, tích hợp đầy đủ
                chức năng và hoạt động trên nền tảng điện toán biên Cloudflare.
              </Paragraph>

              <Space style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleEnterApp}
                  icon={<ArrowRightOutlined />}
                >
                  {user ? "Vào hệ thống" : "Đăng nhập"}
                </Button>

                {!user && (
                  <Button size="large" onClick={() => navigate("/about")}>
                    Tìm hiểu thêm
                  </Button>
                )}
              </Space>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <img
              src="/images/hero-image.png"
              alt="KhoAugment POS Hero"
              style={{
                width: "100%",
                maxWidth: 500,
                borderRadius: 8,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              }}
            />
          </Col>
        </Row>

        <Divider style={{ margin: "60px 0 40px" }} />

        <Title level={2} style={{ textAlign: "center", marginBottom: 40 }}>
          Tính năng nổi bật
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{ height: "100%" }}
              cover={
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: 30,
                    textAlign: "center",
                  }}
                >
                  <AppstoreOutlined
                    style={{ fontSize: 48, color: "#1890ff" }}
                  />
                </div>
              }
            >
              <Card.Meta
                title="Quản lý sản phẩm"
                description="Quản lý kho hàng, danh mục, giá cả và mã vạch sản phẩm dễ dàng và hiệu quả."
              />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{ height: "100%" }}
              cover={
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: 30,
                    textAlign: "center",
                  }}
                >
                  <ShoppingOutlined
                    style={{ fontSize: 48, color: "#1890ff" }}
                  />
                </div>
              }
            >
              <Card.Meta
                title="Bán hàng đa kênh"
                description="Hỗ trợ bán hàng tại cửa hàng, trực tuyến với giao diện POS hiện đại và trực quan."
              />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card
              hoverable
              style={{ height: "100%" }}
              cover={
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: 30,
                    textAlign: "center",
                  }}
                >
                  <UserOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                </div>
              }
            >
              <Card.Meta
                title="Quản lý khách hàng"
                description="Theo dõi thông tin khách hàng, lịch sử mua hàng và chương trình khách hàng thân thiết."
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default HomePage;
