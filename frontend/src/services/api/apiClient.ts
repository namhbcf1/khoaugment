import { message } from "antd";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiResponse } from "../../types/api";

// API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://khoaugment-backend.your-subdomain.workers.dev/api";

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError<ApiResponse>): Promise<AxiosError> => {
    // Handle different error cases based on status code or error code
    if (error.response && error.response.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    } else if (error.response && error.response.status === 429) {
      message.error("Quá nhiều yêu cầu. Vui lòng thử lại sau.");
    } else if (error.response && error.response.status >= 500) {
      message.error("Lỗi máy chủ. Vui lòng thử lại sau.");
    } else if (error.code === "ECONNABORTED") {
      message.error("Yêu cầu bị timeout. Vui lòng thử lại.");
    } else {
      const errorMessage =
        error.response?.data?.error || "Đã xảy ra lỗi không xác định";
      message.error(errorMessage);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
