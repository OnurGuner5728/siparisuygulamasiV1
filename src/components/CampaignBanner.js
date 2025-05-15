'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { mockCampaigns, mockStores, mockCategories } from '@/app/data/mockdatas';
import Link from 'next/link';

/**
 * Kampanya Banner Bileşeni
 * Ana sayfada kampanyaları kaydırmalı bir banner olarak gösterir
 */
export default function CampaignBanner() {
  const [campaigns, setCampaigns] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const intervalRef = useRef(null);

  // Kategori adını ID'ye göre bul
  const getCategoryName = useCallback((categoryId) => {
    const category = mockCategories.find(c => c.id === categoryId);
    return category ? category.name.toLowerCase() : 'genel';
  }, []);

  // Mağaza adını ID'ye göre bul
  const getStoreName = useCallback((storeId) => {
    const store = mockStores.find(s => s.id === storeId);
    return store ? store.name : 'Bilinmeyen Mağaza';
  }, []);

  // Kategoriye göre varsayılan resim
  const getDefaultImage = useCallback((categoryId) => {
    const categoryName = getCategoryName(categoryId);
    
    switch (categoryName) {
      case 'yemek':
        return '/images/banners/yemek-default.jpg';
      case 'market':
        return '/images/banners/market-default.jpg';
      case 'su':
        return '/images/banners/su-default.jpg';
      default:
        return '/images/banners/default.jpg';
    }
  }, [getCategoryName]);

  // Kampanya verisini yükle
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        // API çağrısı simülasyonu
        setTimeout(() => {
          // Aktif kampanyaları filtrele
          const activeCampaigns = mockCampaigns
            .filter(c => c.status === 'active')
            .map(campaign => ({
              ...campaign,
              image: campaign.image || getDefaultImage(campaign.categoryId),
              storeName: getStoreName(campaign.storeId),
              categoryName: getCategoryName(campaign.categoryId)
            }));
          
          setCampaigns(activeCampaigns);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Kampanya yükleme hatası:', error);
        setIsLoading(false);
      }
    };

    loadCampaigns();
  }, [getDefaultImage, getCategoryName, getStoreName]);

  // Otomatik geçiş için zamanlayıcı
  useEffect(() => {
    if (campaigns.length <= 1 || isHovered) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex(prevIndex => (prevIndex + 1) % campaigns.length);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [campaigns.length, isHovered]);

  // Mağaza sayfasına yönlendirme
  const navigateToStore = (storeId, categoryName) => {
    router.push(`/${categoryName}/${storeId}`);
  };

  // Tarih formatı
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  if (isLoading) {
    return (
      <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-lg shadow-md"></div>
    );
  }

  if (campaigns.length === 0) {
    return null; // Kampanya yoksa banner gösterme
  }

  return (
    <div 
      className="relative w-full h-[300px] overflow-hidden rounded-lg shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Kampanya Görselleri */}
      <div className="relative w-full h-full">
        {campaigns.map((campaign, index) => (
          <div 
            key={campaign.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
              index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img 
              src={campaign.image} 
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            
            {/* Kampanya Bilgileri - Sol alt köşe overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold mb-2">{campaign.title}</h2>
                <p className="text-sm mb-3">{campaign.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm bg-white/20 px-2 py-1 rounded mr-3">
                      {campaign.storeName}
                    </span>
                    <span className="text-xs">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => navigateToStore(campaign.storeId, campaign.categoryName)}
                    className="px-4 py-2 bg-white text-gray-800 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Mağazaya Git
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Geçiş Navigasyonu */}
      <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
        {campaigns.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-3 h-3 rounded-full ${
              index === activeIndex ? 'bg-white' : 'bg-white/40'
            }`}
            aria-label={`Kampanya ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Sol Sağ Ok Butonları */}
      {campaigns.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors z-20"
            onClick={() => setActiveIndex((activeIndex - 1 + campaigns.length) % campaigns.length)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors z-20"
            onClick={() => setActiveIndex((activeIndex + 1) % campaigns.length)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
} 