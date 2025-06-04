'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

/**
 * Kategori Bazlı Kampanya Banner Bileşeni
 * Belirli kategoriye ait kampanyaları kaydırmalı bir banner olarak gösterir
 */
export default function CategoryCampaignBanner({ categoryId, categoryName }) {
  const [campaigns, setCampaigns] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const intervalRef = useRef(null);

  // Kategoriye göre varsayılan resim
  const getDefaultImage = useCallback((categoryId) => {
    switch (categoryId) {
      case 1: // Yemek
        return '/images/banners/yemek-default.jpg';
      case 2: // Market
        return '/images/banners/market-default.jpg';
      case 3: // Su
        return '/images/banners/su-default.jpg';
      case 4: // Aktüel
        return '/images/banners/aktuel-default.jpg';
      default:
        return '/images/banners/default.jpg';
    }
  }, []);

  // Kampanya verisini yükle
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Kategoriye göre aktif kampanyaları getir - yeni getCampaignBanners fonksiyonunu kullan
        const campaignsData = await api.getCampaignBanners(categoryName);
        
        if (!campaignsData || campaignsData.length === 0) {
          setCampaigns([]);
          setIsLoading(false);
          return;
        }
        
        // Kampanyaları uygun formata dönüştür
        const formattedCampaigns = campaignsData.map(campaign => {
          let storeName = '';
          
          // Eğer mağaza spesifik kampanya ise
          if (campaign.store_id) {
            storeName = campaign.store?.name || 'Bilinmeyen Mağaza';
          }
          
          return {
            ...campaign,
            title: campaign.name,
            image: campaign.banner_image_url || getDefaultImage(categoryId),
            storeName: storeName,
            categoryName: categoryName,
            categoryId: categoryId
          };
        });
        
        setCampaigns(formattedCampaigns);
      } catch (error) {
        console.error('Kampanya yükleme hatası:', error);
        setError('Kampanyalar yüklenirken bir sorun oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId && categoryName) {
      loadCampaigns();
    }
  }, [categoryId, categoryName, getDefaultImage]);

  // Otomatik geçiş için zamanlayıcı
  useEffect(() => {
    if (campaigns.length <= 1 || isHovered) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex(prevIndex => (prevIndex + 1) % campaigns.length);
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [campaigns.length, isHovered]);

  // Kampanya sayfasına yönlendirme
  const navigateToCampaign = (campaign) => {
    // Kampanya kategorisine göre kampanya sayfasına yönlendir - kampanya ID'si ile
    const categorySlug = categoryName.toLowerCase();
    router.push(`/kampanya/${categorySlug}?cid=${campaign.id}`);
  };

  // Tarih formatı
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  if (isLoading) {
    return (
      <div className="w-full mb-6">
        <div className="w-full h-[120px] sm:h-[140px] md:h-[180px] lg:h-[180px] bg-gray-100 animate-pulse rounded-2xl shadow-sm"></div>
      </div>
    );
  }

  if (error || campaigns.length === 0) {
    return null; // Hata durumunda veya kampanya yoksa banner gösterme
  }

  return (
    <div className="w-full mb-6">
   
      
      <div 
        className="relative w-full h-[120px] sm:h-[140px] md:h-[180px] lg:h-[180px] overflow-hidden rounded-2xl shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Banner Container - Horizontal scroll for multiple banners */}
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {campaigns.map((campaign, index) => (
            <div 
              key={campaign.id}
              className="flex-none w-full h-full relative"
            >
              <div 
                className="absolute inset-0 bg-center bg-no-repeat bg-[length:100%_100%]"
                style={{
                  backgroundImage: `url(${campaign.image})`,
                }}
              ></div>
              
              {/* Kampanya Bilgileri - Sol alt köşe overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 md:p-6 text-white">
                <div className="max-w-2xl">
                  <h3 className="text-sm sm:text-lg md:text-xl font-bold mb-1 md:mb-2 line-clamp-2">{campaign.title}</h3>
                  <p className="text-xs md:text-sm mb-1 sm:mb-2 md:mb-3 line-clamp-1 sm:line-clamp-2 opacity-90">{campaign.description}</p>
                  
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center flex-wrap gap-2">
                      
                      {(campaign.start_date || campaign.end_date) && (
                        <span className="text-xs opacity-75">
                          {campaign.start_date && formatDate(campaign.start_date)} 
                          {campaign.start_date && campaign.end_date && ' - '} 
                          {campaign.end_date && formatDate(campaign.end_date)}
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => navigateToCampaign(campaign)}
                      className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-white text-gray-800 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      <span className="hidden sm:inline">Kampanya Mağazaları</span>
                      <span className="sm:hidden">Detaylar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Dots */}
        {campaigns.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex space-x-1.5 sm:space-x-2 z-20">
            {campaigns.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                  index === activeIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Kampanya ${index + 1}`}
              />
            ))}
          </div>
        )}
        
        {/* Sol Sağ Ok Butonları - Sadece multiple banner varsa */}
        {campaigns.length > 1 && (
          <>
            <button 
              className="absolute left-1 sm:left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 sm:p-1.5 md:p-2 transition-all duration-200 z-20"
              onClick={() => setActiveIndex((activeIndex - 1 + campaigns.length) % campaigns.length)}
              aria-label="Önceki kampanya"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              className="absolute right-1 sm:right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 sm:p-1.5 md:p-2 transition-all duration-200 z-20"
              onClick={() => setActiveIndex((activeIndex + 1) % campaigns.length)}
              aria-label="Sonraki kampanya"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
} 