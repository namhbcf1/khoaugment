// frontend/src/components/ui/LoadingSpinner/LoadingSpinner.jsx
import { LoadingOutlined } from "@ant-design/icons";
import { Col, Row, Spin, Typography } from "antd";
import "./styles.css";

const { Text } = Typography;

/**
 * Component hiển thị loading spinner tùy chỉnh.
 *
 * @param {Object} props
 * @param {string} props.size - Kích thước spinner: 'small', 'default', 'large'
 * @param {string} props.tip - Thông báo hiển thị bên dưới spinner
 * @param {boolean} props.fullscreen - Hiển thị toàn màn hình hay không
 * @param {Object} props.style - CSS styles bổ sung
 * @param {string} props.className - CSS class bổ sung
 */
const LoadingSpinner = ({
  size = "default",
  tip = "Đang tải...",
  fullscreen = false,
  style = {},
  className = "",
  children,
}) => {
  // Icon tùy chỉnh dựa trên size
  const getSpinnerSize = () => {
    const sizeMap = {
      small: 20,
      default: 32,
      large: 48,
    };
    return sizeMap[size] || sizeMap.default;
  };

  const antIcon = (
    <LoadingOutlined style={{ fontSize: getSpinnerSize() }} spin />
  );

  // Component chỉ hiển thị spinner
  const spinner = (
    <Spin
      indicator={antIcon}
      tip={tip ? <Text className="loading-tip">{tip}</Text> : null}
      className={`custom-spinner ${className}`}
      style={style}
    />
  );

  // Trường hợp có children, cho phép spinner overlay trên nội dung
  if (children) {
    return (
      <div className="spinner-container">
        {children}
        <div className="spinner-overlay">{spinner}</div>
      </div>
    );
  }

  // Trường hợp hiển thị toàn màn hình
  if (fullscreen) {
    return (
      <div className="spinner-fullscreen">
        <Row justify="center" align="middle" style={{ height: "100%" }}>
          <Col>{spinner}</Col>
        </Row>
      </div>
    );
  }

  // Trường hợp mặc định
  return spinner;
};

export default LoadingSpinner;
