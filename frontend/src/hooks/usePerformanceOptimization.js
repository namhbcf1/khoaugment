/**
 * Performance Optimization Hook
 * Provides performance monitoring and optimization utilities
 */

import { useEffect, useCallback, useRef, useMemo } from 'react';
import { debounce, throttle } from 'lodash';
import performanceService from '../services/performanceService';

export const usePerformanceOptimization = (componentName, options = {}) => {
  const {
    enableMonitoring = true,
    enableMemoryTracking = true,
    debounceDelay = 300,
    throttleDelay = 100
  } = options;

  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const mountTime = useRef(Date.now());

  // Track component renders
  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (enableMonitoring) {
      performanceService.recordMetric('componentRender', {
        component: componentName,
        renderCount: renderCount.current,
        timeSinceLastRender,
        timestamp: now
      });
    }
  });

  // Track component mount/unmount
  useEffect(() => {
    if (enableMonitoring) {
      performanceService.startRenderTiming(componentName);
    }

    return () => {
      if (enableMonitoring) {
        performanceService.endRenderTiming(componentName);
        const totalMountTime = Date.now() - mountTime.current;
        
        performanceService.recordMetric('componentLifecycle', {
          component: componentName,
          totalMountTime,
          totalRenders: renderCount.current,
          timestamp: Date.now()
        });
      }
    };
  }, [componentName, enableMonitoring]);

  // Memory tracking
  useEffect(() => {
    if (!enableMemoryTracking || typeof window === 'undefined' || !window.performance?.memory) {
      return;
    }

    const trackMemory = () => {
      const memory = window.performance.memory;
      performanceService.recordMetric('componentMemory', {
        component: componentName,
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        timestamp: Date.now()
      });
    };

    const interval = setInterval(trackMemory, 5000); // Track every 5 seconds
    return () => clearInterval(interval);
  }, [componentName, enableMemoryTracking]);

  // Optimized debounce function
  const createDebouncedCallback = useCallback((callback, delay = debounceDelay) => {
    return debounce(callback, delay);
  }, [debounceDelay]);

  // Optimized throttle function
  const createThrottledCallback = useCallback((callback, delay = throttleDelay) => {
    return throttle(callback, delay);
  }, [throttleDelay]);

  // Memoized performance metrics
  const performanceMetrics = useMemo(() => {
    return {
      renderCount: renderCount.current,
      averageRenderTime: renderCount.current > 0 ? 
        (Date.now() - mountTime.current) / renderCount.current : 0,
      mountTime: mountTime.current
    };
  }, [renderCount.current]);

  // Performance warning system
  const checkPerformance = useCallback(() => {
    const metrics = performanceMetrics;
    const warnings = [];

    if (metrics.renderCount > 100) {
      warnings.push({
        type: 'excessive_renders',
        message: `Component ${componentName} has rendered ${metrics.renderCount} times`,
        severity: 'warning'
      });
    }

    if (metrics.averageRenderTime > 16) { // 60fps = 16.67ms per frame
      warnings.push({
        type: 'slow_renders',
        message: `Component ${componentName} average render time is ${metrics.averageRenderTime.toFixed(2)}ms`,
        severity: 'error'
      });
    }

    return warnings;
  }, [componentName, performanceMetrics]);

  // Optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const warnings = checkPerformance();
    const suggestions = [];

    warnings.forEach(warning => {
      switch (warning.type) {
        case 'excessive_renders':
          suggestions.push({
            type: 'React.memo',
            description: 'Consider wrapping component with React.memo to prevent unnecessary re-renders',
            implementation: `const ${componentName} = React.memo(() => { ... });`
          });
          suggestions.push({
            type: 'useMemo/useCallback',
            description: 'Use useMemo for expensive calculations and useCallback for event handlers',
            implementation: 'const memoizedValue = useMemo(() => expensiveCalculation(), [deps]);'
          });
          break;
        case 'slow_renders':
          suggestions.push({
            type: 'Code Splitting',
            description: 'Consider lazy loading this component if it\'s not immediately needed',
            implementation: `const ${componentName} = lazy(() => import('./${componentName}'));`
          });
          suggestions.push({
            type: 'Virtualization',
            description: 'If rendering large lists, consider using react-window or react-virtualized',
            implementation: 'import { FixedSizeList as List } from "react-window";'
          });
          break;
      }
    });

    return suggestions;
  }, [checkPerformance, componentName]);

  // Performance report
  const getPerformanceReport = useCallback(() => {
    return {
      component: componentName,
      metrics: performanceMetrics,
      warnings: checkPerformance(),
      suggestions: getOptimizationSuggestions(),
      timestamp: Date.now()
    };
  }, [componentName, performanceMetrics, checkPerformance, getOptimizationSuggestions]);

  return {
    // Performance metrics
    performanceMetrics,
    
    // Optimization utilities
    createDebouncedCallback,
    createThrottledCallback,
    
    // Performance analysis
    checkPerformance,
    getOptimizationSuggestions,
    getPerformanceReport,
    
    // Performance monitoring controls
    startTiming: () => performanceService.startRenderTiming(componentName),
    endTiming: () => performanceService.endRenderTiming(componentName),
    
    // Memory utilities
    getCurrentMemoryUsage: () => {
      if (typeof window !== 'undefined' && window.performance?.memory) {
        return {
          used: window.performance.memory.usedJSHeapSize,
          total: window.performance.memory.totalJSHeapSize,
          limit: window.performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    }
  };
};

// Hook for API performance monitoring
export const useAPIPerformance = () => {
  const apiMetrics = useRef(new Map());

  const trackAPICall = useCallback(async (apiCall, identifier) => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      apiMetrics.current.set(identifier, {
        duration,
        success: true,
        timestamp: Date.now()
      });
      
      performanceService.recordMetric('apiCall', {
        identifier,
        duration,
        success: true,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      apiMetrics.current.set(identifier, {
        duration,
        success: false,
        error: error.message,
        timestamp: Date.now()
      });
      
      performanceService.recordMetric('apiCall', {
        identifier,
        duration,
        success: false,
        error: error.message,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }, []);

  const getAPIMetrics = useCallback(() => {
    return Array.from(apiMetrics.current.entries()).map(([id, metrics]) => ({
      id,
      ...metrics
    }));
  }, []);

  return {
    trackAPICall,
    getAPIMetrics
  };
};

// Hook for bundle size monitoring
export const useBundleMonitoring = () => {
  const getBundleSize = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      
      const totalJS = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const totalCSS = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      
      return {
        javascript: totalJS,
        css: totalCSS,
        total: totalJS + totalCSS,
        resources: {
          js: jsResources.length,
          css: cssResources.length
        }
      };
    }
    return null;
  }, []);

  const analyzeBundlePerformance = useCallback(() => {
    const bundleSize = getBundleSize();
    if (!bundleSize) return null;
    
    const recommendations = [];
    
    if (bundleSize.total > 1000000) { // 1MB
      recommendations.push({
        type: 'bundle_size',
        message: 'Bundle size is large, consider code splitting',
        priority: 'high'
      });
    }
    
    if (bundleSize.javascript > 800000) { // 800KB
      recommendations.push({
        type: 'js_size',
        message: 'JavaScript bundle is large, consider lazy loading',
        priority: 'medium'
      });
    }
    
    return {
      bundleSize,
      recommendations
    };
  }, [getBundleSize]);

  return {
    getBundleSize,
    analyzeBundlePerformance
  };
};

export default usePerformanceOptimization;
