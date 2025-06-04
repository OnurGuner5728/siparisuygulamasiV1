'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

/**
 * Store Kampanya Banner Bileşeni
 * Store detay sayfalarında kampanya bilgisini gösterir
 */
export default function StoreCampaignBanner({ storeId, categoryName }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkStoreCampaigns = async () => {
      try {
        setLoading(true);
        
        // Store'un kampanya başvurularını kontrol et (sadece onaylananlar)
        const applications = await api.getCampaignApplications({
          store_id: storeId,
          status: 'approved'
        });
        
        if (applications && applications.length > 0) {
          // Tüm aktif kampanyaları al
          const activeCampaigns = applications
            .filter(app => 
              app.campaign && 
              app.campaign.is_active && 
              new Date(app.campaign.end_date) > new Date()
            )
            .map(app => app.campaign);
          
          setCampaigns(activeCampaigns);
        }
      } catch (error) {
        console.error('Store kampanya kontrolü hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      checkStoreCampaigns();
    }
  }, [storeId]);

  // Kampanya sayfasına yönlendir
  const navigateToCampaign = (campaign) => {
    const categorySlug = categoryName.toLowerCase();
    router.push(`/kampanya/${categorySlug}?cid=${campaign.id}`);
  };

  // Sonraki kampanyaya geç
  const nextCampaign = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === campaigns.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Önceki kampanyaya geç
  const prevCampaign = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? campaigns.length - 1 : prevIndex - 1
    );
  };

  // Otomatik geçiş (5 saniyede bir)
  useEffect(() => {
    if (campaigns.length > 1) {
      const interval = setInterval(nextCampaign, 5000);
      return () => clearInterval(interval);
    }
  }, [campaigns.length]);

  if (loading || campaigns.length === 0) {
    return null;
  }

  const currentCampaign = campaigns[currentIndex];

  return (
    <div className="mx-4 my-2">
      {/* Kampanya Banner'ı */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg relative overflow-hidden">
        <button 
          onClick={() => navigateToCampaign(currentCampaign)}
          className="w-full p-3 text-left hover:bg-red-50/50 transition-colors rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-red-600 text-xs font-medium">🎉 KAMPANYA</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  currentCampaign.type === 'percentage' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {currentCampaign.type === 'percentage' 
                    ? `%${currentCampaign.value} İndirim` 
                    : `${currentCampaign.value}₺ İndirim`
                  }
                </span>
              
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                {currentCampaign.name}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-1">
                {currentCampaign.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(currentCampaign.end_date).toLocaleDateString('tr-TR')} tarihine kadar
                </span>
                <span className="text-xs text-red-600 font-medium">
                  Detaylar →
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Navigation Arrows - Sadece birden fazla kampanya varsa göster */}
        {campaigns.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevCampaign();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
            >
              <span className="text-gray-600 text-sm">‹</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextCampaign();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
            >
              <span className="text-gray-600 text-sm">›</span>
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator - Sadece birden fazla kampanya varsa göster */}
      {campaigns.length > 1 && (
        <div className="flex justify-center space-x-1 mt-2">
          {campaigns.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-red-500' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 