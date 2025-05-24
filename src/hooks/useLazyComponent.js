'use client';
import { lazy, useMemo } from 'react';

export function useLazyComponent(importFn, options = {}) {
  const {
    retryCount = 3,
    retryDelay = 1000,
    preload = false
  } = options;

  const LazyComponent = useMemo(() => {
    let retries = 0;
    
    const retryImport = async () => {
      try {
        return await importFn();
      } catch (error) {
        if (retries < retryCount) {
          retries++;
          console.warn(`Lazy import failed, retrying... (${retries}/${retryCount})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return retryImport();
        }
        throw error;
      }
    };

    return lazy(retryImport);
  }, [importFn, retryCount, retryDelay]);

  // Preload component if requested
  useMemo(() => {
    if (preload) {
      importFn().catch(console.error);
    }
  }, [importFn, preload]);

  return LazyComponent;
}

// Utility function for creating lazy pages
export function createLazyPage(importFn, options = {}) {
  return function LazyPage(props) {
    const Component = useLazyComponent(importFn, options);
    return <Component {...props} />;
  };
}

export default useLazyComponent; 