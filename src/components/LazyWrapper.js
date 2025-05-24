'use client';
import { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

const LazyWrapper = ({ 
  children, 
  fallback = <LoadingSpinner size="lg" text="Sayfa yükleniyor..." />,
  errorFallback = null 
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyWrapper; 