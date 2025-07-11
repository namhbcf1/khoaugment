/**
 * Performance optimization utilities
 * Provides lazy loading, code splitting, and performance monitoring
 */

import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// Loading component for lazy-loaded routes
export const PageLoader = ({ size = 'large', tip = 'Đang tải...' }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <Spin size={size} />
    <div style={{ color: '#8c8c8c', fontSize: '14px' }}>{tip}</div>
  </div>
);

// Enhanced lazy loading with error boundary
export const lazyLoad = (importFunc, fallback = <PageLoader />) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Preload a component
export const preloadComponent = (importFunc) => {
  const componentImport = importFunc();
  return componentImport;
};

// Lazy load with retry mechanism
export const lazyLoadWithRetry = (importFunc, retries = 3) => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attemptImport = (attempt = 1) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (attempt < retries) {
              console.warn(`Failed to load component, retrying... (${attempt}/${retries})`);
              setTimeout(() => attemptImport(attempt + 1), 1000 * attempt);
            } else {
              console.error('Failed to load component after retries:', error);
              reject(error);
            }
          });
      };
      attemptImport();
    });
  });
};

// Performance monitoring
export class PerformanceMonitor {
  static marks = new Map();
  static measures = new Map();

  // Start timing
  static mark(name) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`);
      this.marks.set(name, Date.now());
    }
  }

  // End timing and measure
  static measure(name) {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const startTime = this.marks.get(name);
      if (startTime) {
        const duration = Date.now() - startTime;
        this.measures.set(name, duration);
        
        // Log slow operations
        if (duration > 1000) {
          console.warn(`Slow operation detected: ${name} took ${duration}ms`);
        }
        
        return duration;
      }
    }
    return 0;
  }

  // Get all measurements
  static getMeasures() {
    return Object.fromEntries(this.measures);
  }

  // Clear all marks and measures
  static clear() {
    this.marks.clear();
    this.measures.clear();
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

// Bundle analyzer helper
export const analyzeBundleSize = () => {
  if (typeof window !== 'undefined' && window.__BUNDLE_ANALYZER__) {
    console.log('Bundle analysis:', window.__BUNDLE_ANALYZER__);
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof performance !== 'undefined' && performance.memory) {
    const memory = performance.memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
    };
  }
  return null;
};

// Resource loading optimization
export const optimizeResourceLoading = () => {
  // Preload critical resources
  const preloadResource = (href, as, type = null) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  };

  // Preload critical fonts
  preloadResource('/fonts/inter.woff2', 'font', 'font/woff2');
  
  // Preload critical images
  const criticalImages = [
    '/images/logo.png',
    '/images/placeholder.jpg'
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

// Debounce utility for performance
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle utility for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  if (typeof IntersectionObserver !== 'undefined') {
    return new IntersectionObserver(callback, defaultOptions);
  }
  
  // Fallback for browsers without IntersectionObserver
  return {
    observe: () => {},
    unobserve: () => {},
    disconnect: () => {}
  };
};

// Virtual scrolling helper
export const useVirtualScrolling = (items, itemHeight, containerHeight) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const bufferCount = Math.floor(visibleCount / 2);
  
  return {
    getVisibleItems: (scrollTop) => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + visibleCount + bufferCount,
        items.length
      );
      const actualStartIndex = Math.max(0, startIndex - bufferCount);
      
      return {
        items: items.slice(actualStartIndex, endIndex),
        startIndex: actualStartIndex,
        endIndex,
        offsetY: actualStartIndex * itemHeight
      };
    },
    totalHeight: items.length * itemHeight
  };
};

// Image optimization
export const optimizeImage = (src, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fallback = 'jpg'
  } = options;

  // Check WebP support
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })();

  const params = new URLSearchParams();
  if (width) params.append('w', width);
  if (height) params.append('h', height);
  params.append('q', quality);
  params.append('f', supportsWebP ? format : fallback);

  return `${src}?${params.toString()}`;
};

// Code splitting by route
export const createRouteBasedSplitting = (routes) => {
  return routes.map(route => ({
    ...route,
    component: lazyLoad(route.component)
  }));
};

// Performance budget checker
export const checkPerformanceBudget = () => {
  const budget = {
    maxBundleSize: 500 * 1024, // 500KB
    maxChunkSize: 200 * 1024,  // 200KB
    maxImageSize: 100 * 1024,  // 100KB
    maxFontSize: 50 * 1024     // 50KB
  };

  const violations = [];

  // Check if we can access performance data
  if (typeof performance !== 'undefined' && performance.getEntriesByType) {
    const resources = performance.getEntriesByType('resource');
    
    resources.forEach(resource => {
      const size = resource.transferSize || resource.encodedBodySize;
      const name = resource.name.split('/').pop();
      
      if (resource.name.includes('.js') && size > budget.maxChunkSize) {
        violations.push(`Large JS chunk: ${name} (${Math.round(size / 1024)}KB)`);
      }
      
      if (resource.name.includes('.css') && size > budget.maxChunkSize) {
        violations.push(`Large CSS file: ${name} (${Math.round(size / 1024)}KB)`);
      }
      
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(resource.name) && size > budget.maxImageSize) {
        violations.push(`Large image: ${name} (${Math.round(size / 1024)}KB)`);
      }
      
      if (/\.(woff|woff2|ttf|otf)$/i.test(resource.name) && size > budget.maxFontSize) {
        violations.push(`Large font: ${name} (${Math.round(size / 1024)}KB)`);
      }
    });
  }

  if (violations.length > 0) {
    console.warn('Performance budget violations:', violations);
  }

  return violations;
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  // Monitor page load performance
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        
        console.log(`Page load time: ${Math.round(loadTime)}ms`);
        
        // Check performance budget
        checkPerformanceBudget();
        
        // Monitor memory usage
        const memory = monitorMemoryUsage();
        if (memory) {
          console.log(`Memory usage: ${memory.used}MB / ${memory.total}MB`);
        }
      }, 1000);
    });
  }
};

export default {
  PageLoader,
  lazyLoad,
  lazyLoadWithRetry,
  preloadComponent,
  PerformanceMonitor,
  debounce,
  throttle,
  createIntersectionObserver,
  useVirtualScrolling,
  optimizeImage,
  createRouteBasedSplitting,
  checkPerformanceBudget,
  initPerformanceMonitoring
};
