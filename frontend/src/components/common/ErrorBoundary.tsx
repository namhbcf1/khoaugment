import {
  BugOutlined,
  HomeOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Result, Typography } from "antd";
import React, {
  Component,
  ErrorInfo,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

const { Paragraph, Text } = Typography;

// Define development mode - in a real app, this would be more sophisticated
const isDevelopment =
  import.meta.env?.DEV !== undefined ? import.meta.env.DEV : true; // Default to true for development if not defined

interface ErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  showDetails?: boolean;
  showRetry?: boolean;
  maxRetries?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    this.setState({
      error,
      errorInfo,
    });

    // Log to console in development
    if (isDevelopment) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo): void => {
    // Example: Send error to monitoring service
    try {
      if (window.gtag) {
        window.gtag("event", "exception", {
          description: error.toString(),
          fatal: false,
        });
      }
    } catch (e) {
      console.warn("Failed to log error to service:", e);
    }
  };

  handleRetry = (): void => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleGoHome = (): void => {
    window.location.href = "/dashboard";
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state;
      const {
        title = "Something went wrong",
        showDetails = isDevelopment,
        showRetry = true,
        maxRetries = 3,
      } = this.props;

      const canRetry = showRetry && retryCount < maxRetries;

      return (
        <div
          style={{
            padding: "50px 20px",
            minHeight: "100vh",
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card style={{ maxWidth: 600, width: "100%" }}>
            <Result
              status="error"
              icon={<BugOutlined />}
              title={title}
              subTitle="An unexpected error occurred. Our team has been notified."
              extra={[
                canRetry && (
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={this.handleRetry}
                    key="retry"
                  >
                    Try Again ({maxRetries - retryCount} attempts left)
                  </Button>
                ),
                <Button
                  icon={<HomeOutlined />}
                  onClick={this.handleGoHome}
                  key="home"
                >
                  Go to Dashboard
                </Button>,
                <Button
                  icon={<ReloadOutlined />}
                  onClick={this.handleReload}
                  key="reload"
                >
                  Reload Page
                </Button>,
              ].filter(Boolean)}
            />

            {retryCount > 0 && (
              <Alert
                message="Multiple Errors Detected"
                description={`This error has occurred ${retryCount} time(s). Consider reloading the page or contacting support.`}
                type="warning"
                icon={<WarningOutlined />}
                style={{ marginTop: 16 }}
                showIcon
              />
            )}

            {showDetails && error && (
              <Card
                title="Error Details (Development Mode)"
                style={{ marginTop: 16 }}
                size="small"
              >
                <Paragraph>
                  <Text strong>Error:</Text>
                </Paragraph>
                <Paragraph>
                  <Text code copyable>
                    {error.toString()}
                  </Text>
                </Paragraph>

                {errorInfo && (
                  <>
                    <Paragraph>
                      <Text strong>Component Stack:</Text>
                    </Paragraph>
                    <Paragraph>
                      <Text
                        code
                        style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}
                      >
                        {errorInfo.componentStack}
                      </Text>
                    </Paragraph>
                  </>
                )}

                {error.stack && (
                  <>
                    <Paragraph>
                      <Text strong>Stack Trace:</Text>
                    </Paragraph>
                    <Paragraph>
                      <Text
                        code
                        style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}
                      >
                        {error.stack}
                      </Text>
                    </Paragraph>
                  </>
                )}
              </Card>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: object) => void;
  }

  // Extend ImportMeta for Vite environment variables
  interface ImportMeta {
    env: {
      DEV?: boolean;
      PROD?: boolean;
      MODE?: string;
      [key: string]: any;
    };
  }
}

// Higher-order component for functional components
interface WithErrorBoundaryProps {
  [key: string]: any;
}

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Partial<ErrorBoundaryProps> = {}
): React.FC<P & WithErrorBoundaryProps> => {
  return function WithErrorBoundaryComponent(
    props: P & WithErrorBoundaryProps
  ) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: Error) => {
    setError(error);
  }, []);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
};

// Simple error fallback component
interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => (
  <div
    style={{
      padding: "20px",
      textAlign: "center",
      border: "1px solid #ff4d4f",
      borderRadius: "6px",
      background: "#fff2f0",
    }}
  >
    <h3 style={{ color: "#ff4d4f" }}>Something went wrong</h3>
    <p style={{ color: "#666" }}>
      {error?.message || "An unexpected error occurred"}
    </p>
    <Button onClick={resetErrorBoundary}>Try again</Button>
  </div>
);

export default ErrorBoundary;
