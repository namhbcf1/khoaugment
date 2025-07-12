// frontend/src/components/ui/ErrorBoundary.jsx
import {
  BugOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Result, Space, Typography } from "antd";
import React from "react";
import "./ErrorBoundary.css";

const { Text, Paragraph } = Typography;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
    };

    console.error("Error Report:", errorReport);
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReportBug = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log("Bug report:", errorDetails);
    alert("Báo cáo lỗi đã được gửi. Cảm ơn bạn!");
  };

  render() {
    if (this.state.hasError) {
      const {
        fallback,
        showErrorDetails = false,
        showRetryButton = true,
        showHomeButton = true,
        title = "Oops! Có lỗi xảy ra",
        subtitle = "Ứng dụng gặp sự cố không mong muốn. Chúng tôi đã ghi nhận và sẽ khắc phục sớm nhất.",
        className = "",
      } = this.props;

      if (fallback) {
        return typeof fallback === "function"
          ? fallback(this.state.error, this.state.errorInfo, this.handleRetry)
          : fallback;
      }

      return (
        <div className={`error-boundary ${className}`}>
          <Result
            status="error"
            icon={<ExclamationCircleOutlined />}
            title={title}
            subTitle={subtitle}
            extra={
              <Space direction="vertical" align="center">
                <Space wrap>
                  {showRetryButton && (
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={this.handleRetry}
                    >
                      Thử lại
                    </Button>
                  )}

                  {showHomeButton && (
                    <Button icon={<HomeOutlined />} onClick={this.handleGoHome}>
                      Về trang chủ
                    </Button>
                  )}

                  <Button icon={<BugOutlined />} onClick={this.handleReportBug}>
                    Báo cáo lỗi
                  </Button>
                </Space>

                {this.state.errorId && (
                  <Alert
                    message={
                      <Space>
                        <InfoCircleOutlined />
                        <Text>Mã lỗi: {this.state.errorId}</Text>
                      </Space>
                    }
                    type="info"
                    size="small"
                    style={{ marginTop: 16 }}
                  />
                )}
              </Space>
            }
          />

          {showErrorDetails && this.state.error && (
            <Card
              title="Chi tiết lỗi (Development)"
              size="small"
              style={{ margin: "20px", textAlign: "left" }}
              type="inner"
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>Error Message:</Text>
                  <Paragraph code copyable>
                    {this.state.error.message}
                  </Paragraph>
                </div>

                <div>
                  <Text strong>Stack Trace:</Text>
                  <Paragraph code copyable style={{ whiteSpace: "pre-wrap" }}>
                    {this.state.error.stack}
                  </Paragraph>
                </div>

                {this.state.errorInfo && (
                  <div>
                    <Text strong>Component Stack:</Text>
                    <Paragraph code copyable style={{ whiteSpace: "pre-wrap" }}>
                      {this.state.errorInfo.componentStack}
                    </Paragraph>
                  </div>
                )}
              </Space>
            </Card>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export const useErrorHandler = () => {
  const handleError = (error, errorInfo = {}) => {
    console.error("Handled error:", error);

    const errorReport = {
      message: error.message || "Unknown error",
      stack: error.stack,
      ...errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  };

  return { handleError };
};

export const NetworkErrorFallback = ({ onRetry }) => (
  <Result
    status="warning"
    title="Lỗi kết nối mạng"
    subTitle="Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet."
    extra={
      <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
        Thử lại
      </Button>
    }
  />
);

export const NotFoundErrorFallback = ({ onGoHome }) => (
  <Result
    status="404"
    title="404"
    subTitle="Trang bạn tìm kiếm không tồn tại."
    extra={
      <Button type="primary" icon={<HomeOutlined />} onClick={onGoHome}>
        Về trang chủ
      </Button>
    }
  />
);

export const PermissionErrorFallback = ({ onGoBack }) => (
  <Result
    status="403"
    title="403"
    subTitle="Bạn không có quyền truy cập trang này."
    extra={
      <Button type="primary" onClick={onGoBack}>
        Quay lại
      </Button>
    }
  />
);

export const MaintenanceErrorFallback = () => (
  <Result
    status="warning"
    title="Hệ thống đang bảo trì"
    subTitle="Chúng tôi đang nâng cấp hệ thống. Vui lòng quay lại sau."
    extra={
      <Button type="primary" onClick={() => window.location.reload()}>
        Làm mới trang
      </Button>
    }
  />
);

export default ErrorBoundary;
