import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
}

/**
 * Professional Performance Monitoring Hook
 * Tracks component render times and performance metrics
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);
  const updateCount = useRef<number>(0);
  const isFirstRender = useRef<boolean>(true);

  // Start timing before render
  renderStartTime.current = performance.now();

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    if (isFirstRender.current) {
      mountTime.current = renderTime;
      isFirstRender.current = false;
      
      if (__DEV__) {
        console.log(`🚀 ${componentName} mounted in ${renderTime.toFixed(2)}ms`);
      }
    } else {
      updateCount.current += 1;
      
      if (__DEV__ && renderTime > 16) { // 60fps threshold
        console.warn(`⚠️ ${componentName} slow render: ${renderTime.toFixed(2)}ms (update #${updateCount.current})`);
      }
    }

    // Log performance metrics in development
    if (__DEV__) {
      const metrics: PerformanceMetrics = {
        componentName,
        renderTime,
        mountTime: mountTime.current,
        updateCount: updateCount.current,
      };
      
      // You can send these metrics to analytics service in production
      // Analytics.track('component_performance', metrics);
    }
  });

  return {
    renderTime: performance.now() - renderStartTime.current,
    mountTime: mountTime.current,
    updateCount: updateCount.current,
  };
}