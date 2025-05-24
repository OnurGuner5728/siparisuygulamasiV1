'use client';
import { lazy } from 'react';
import LazyWrapper from '../LazyWrapper';
import LoadingSpinner from '../LoadingSpinner';

// Lazy load page components
export const LazyAdminPage = lazy(() => 
  import('../../app/admin/page').catch(() => ({ 
    default: () => <div className="p-8 text-center">Admin sayfası yüklenemedi</div> 
  }))
);

export const LazyCheckoutPage = lazy(() => 
  import('../../app/checkout/page').catch(() => ({ 
    default: () => <div className="p-8 text-center">Ödeme sayfası yüklenemedi</div> 
  }))
);

export const LazyProfilePage = lazy(() => 
  import('../../app/profil/page').catch(() => ({ 
    default: () => <div className="p-8 text-center">Profil sayfası yüklenemedi</div> 
  }))
);

export const LazySearchPage = lazy(() => 
  import('../../app/search/page').catch(() => ({ 
    default: () => <div className="p-8 text-center">Arama sayfası yüklenemedi</div> 
  }))
);

// Wrapper components with page-specific loading states
export const AdminPageLazy = (props) => (
  <LazyWrapper 
    fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Admin paneli yükleniyor..." />
      </div>
    }
  >
    <LazyAdminPage {...props} />
  </LazyWrapper>
);

export const CheckoutPageLazy = (props) => (
  <LazyWrapper 
    fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Ödeme sayfası yükleniyor..." />
      </div>
    }
  >
    <LazyCheckoutPage {...props} />
  </LazyWrapper>
);

export const ProfilePageLazy = (props) => (
  <LazyWrapper 
    fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Profil sayfası yükleniyor..." />
      </div>
    }
  >
    <LazyProfilePage {...props} />
  </LazyWrapper>
);

export const SearchPageLazy = (props) => (
  <LazyWrapper 
    fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Arama sayfası yükleniyor..." />
      </div>
    }
  >
    <LazySearchPage {...props} />
  </LazyWrapper>
); 