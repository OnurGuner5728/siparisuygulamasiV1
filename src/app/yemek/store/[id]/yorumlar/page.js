'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function YemekStoreReviewsRedirect() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.id;

  useEffect(() => {
    // Global review sayfasına redirect et, category ID ile
    if (storeId) {
      router.replace(`/store/${storeId}/yorumlar?cid=1`);
    }
  }, [storeId, router]);

  // Loading state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );
}