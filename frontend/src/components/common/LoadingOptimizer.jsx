import React, { useState, useEffect, useRef } from 'react';
import { Spin, Skeleton, Progress, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { PerformanceMonitor } from '../../utils/performance';

const { Text } = Typography;

/**
 * Optimized loading component with progressive enhancement
 */
export const OptimizedLoader = ({ 
  type = 'spin',
  size = 'default',
  tip = 'Đang tải...',
  delay = 200,
  timeout = 10000,
  showProgress = false,
  progressSteps = [],
  onTimeout,
  className = ''
}) => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    // Delay showing loader to prevent flash
    const delayTimer = setTimeout(() => {
      setVisible(true);
      PerformanceMonitor.mark('loader-visible');
    }, delay);

    // Set timeout for loading
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        if (onTimeout) {
          onTimeout();
        } else {
          console.warn('Loading timeout reached');
        }
      }, timeout);
    }

    // Progress simulation
    if (showProgress && progressSteps.length > 0) {
      progressRef.current = setInterval(() => {
        setCurrentStep(prev => {
          const next = Math.min(prev + 1, progressSteps.length - 1);
          setProgress((next / (progressSteps.length - 1)) * 100);
          return next;
        });
      }, 1000);
    }

    return () => {
      clearTimeout(delayTimer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [delay, timeout, onTimeout, showProgress, progressSteps]);

  if (!visible) {
    return null;
  }

  const renderLoader = () => {
    switch (type) {
      case 'skeleton':
        return (
          <div className={`optimized-loader skeleton-loader ${className}`}>
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        );

      case 'skeleton-card':
        return (
          <div className={`optimized-loader skeleton-card-loader ${className}`}>
            <Skeleton.Image style={{ width: '100%', height: 200 }} />
            <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
          </div>
        );

      case 'skeleton-list':
        return (
          <div className={`optimized-loader skeleton-list-loader ${className}`}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <Skeleton.Avatar size="large" />
                <Skeleton active paragraph={{ rows: 1 }} style={{ marginLeft: 16 }} />
              </div>
            ))}
          </div>
        );

      case 'progress':
        return (
          <div className={`optimized-loader progress-loader ${className}`}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Progress
                type="circle"
                percent={Math.round(progress)}
                size={size === 'large' ? 120 : size === 'small' ? 60 : 80}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ marginTop: 16 }}>
                <Text strong>{tip}</Text>
                {progressSteps[currentStep] && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">{progressSteps[currentStep]}</Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className={`optimized-loader minimal-loader ${className}`}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '20px',
              gap: '12px'
            }}>
              <LoadingOutlined style={{ fontSize: size === 'large' ? 24 : 16 }} />
              <Text type="secondary">{tip}</Text>
            </div>
          </div>
        );

      default:
        return (
          <div className={`optimized-loader spin-loader ${className}`}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <Spin size={size} />
              <Text type="secondary">{tip}</Text>
            </div>
          </div>
        );
    }
  };

  return renderLoader();
};

/**
 * Smart loading component that adapts based on context
 */
export const SmartLoader = ({ 
  context = 'page',
  estimatedTime = 2000,
  ...props 
}) => {
  const getLoaderConfig = () => {
    switch (context) {
      case 'page':
        return {
          type: 'skeleton',
          tip: 'Đang tải trang...',
          delay: 300,
          timeout: 15000
        };

      case 'data':
        return {
          type: 'spin',
          tip: 'Đang tải dữ liệu...',
          delay: 100,
          timeout: 10000
        };

      case 'form':
        return {
          type: 'minimal',
          tip: 'Đang xử lý...',
          delay: 0,
          timeout: 5000
        };

      case 'image':
        return {
          type: 'skeleton-card',
          tip: 'Đang tải hình ảnh...',
          delay: 200,
          timeout: 8000
        };

      case 'list':
        return {
          type: 'skeleton-list',
          tip: 'Đang tải danh sách...',
          delay: 200,
          timeout: 12000
        };

      case 'upload':
        return {
          type: 'progress',
          tip: 'Đang tải lên...',
          delay: 0,
          timeout: 30000,
          showProgress: true,
          progressSteps: [
            'Chuẩn bị tệp...',
            'Đang tải lên...',
            'Xử lý tệp...',
            'Hoàn thành'
          ]
        };

      default:
        return {
          type: 'spin',
          tip: 'Đang tải...',
          delay: 200,
          timeout: 10000
        };
    }
  };

  const config = { ...getLoaderConfig(), ...props };
  return <OptimizedLoader {...config} />;
};

/**
 * Lazy loading wrapper with optimized loading states
 */
export const LazyWrapper = ({ 
  children, 
  fallback,
  context = 'page',
  errorBoundary = true 
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error('Lazy loading error:', error);
      setHasError(true);
    };

    if (errorBoundary) {
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
  }, [errorBoundary]);

  if (hasError) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        color: '#ff4d4f'
      }}>
        <Text>Có lỗi xảy ra khi tải nội dung. Vui lòng thử lại.</Text>
      </div>
    );
  }

  return (
    <React.Suspense 
      fallback={fallback || <SmartLoader context={context} />}
    >
      {children}
    </React.Suspense>
  );
};

/**
 * Performance-aware image loader
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  lazy = true,
  placeholder = true,
  onLoad,
  onError,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = imgRef.current;
          img.src = src;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src, lazy]);

  const handleLoad = (e) => {
    setLoaded(true);
    PerformanceMonitor.measure('image-load');
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setError(true);
    if (onError) onError(e);
  };

  return (
    <div style={{ position: 'relative', width, height }}>
      {placeholder && !loaded && !error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Spin size="small" />
        </div>
      )}
      
      <img
        ref={imgRef}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
          ...props.style
        }}
        {...(lazy ? {} : { src })}
        {...props}
      />
      
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8c8c8c'
        }}>
          Không thể tải hình ảnh
        </div>
      )}
    </div>
  );
};

export default {
  OptimizedLoader,
  SmartLoader,
  LazyWrapper,
  OptimizedImage
};
