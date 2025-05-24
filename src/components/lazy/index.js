'use client';
import { lazy } from 'react';
import LazyWrapper from '../LazyWrapper';
import LoadingSpinner from '../LoadingSpinner';

// Lazy load heavy components
export const LazyAdminPanel = lazy(() => 
  import('../AdminPanel').catch(() => ({ default: () => <div>Admin Panel yüklenemedi</div> }))
);

export const LazyChart = lazy(() => 
  import('../Chart').catch(() => ({ default: () => <div>Grafik yüklenemedi</div> }))
);

export const LazyMap = lazy(() => 
  import('../Map').catch(() => ({ default: () => <div>Harita yüklenemedi</div> }))
);

export const LazyDataTable = lazy(() => 
  import('../DataTable').catch(() => ({ default: () => <div>Tablo yüklenemedi</div> }))
);

// Wrapper components with custom loading states
export const AdminPanelLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner size="lg" text="Admin paneli yükleniyor..." />}>
    <LazyAdminPanel {...props} />
  </LazyWrapper>
);

export const ChartLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner size="md" text="Grafik yükleniyor..." />}>
    <LazyChart {...props} />
  </LazyWrapper>
);

export const MapLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner size="lg" text="Harita yükleniyor..." />}>
    <LazyMap {...props} />
  </LazyWrapper>
);

export const DataTableLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner size="md" text="Tablo yükleniyor..." />}>
    <LazyDataTable {...props} />
  </LazyWrapper>
); 