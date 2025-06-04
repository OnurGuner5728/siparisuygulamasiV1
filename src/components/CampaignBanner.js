'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

/**
 * Kampanya Banner Bileşeni
 * Ana sayfada kampanyaları kaydırmalı bir banner olarak gösterir
 */
export default function CampaignBanner() {
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
      case 4: // Çiçek
        return '/images/banners/cicek-default.jpg';
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
        
        // Aktif kampanya afişlerini getir (her kategori için)
        const [yemekBanners, marketBanners, suBanners] = await Promise.all([
          api.getCampaignBanners('Yemek'),
          api.getCampaignBanners('Market'),
          api.getCampaignBanners('Su')
        ]);
        
        // Tüm bannerleri birleştir
        const allBanners = [...yemekBanners, ...marketBanners, ...suBanners];
        
        if (!allBanners || allBanners.length === 0) {
          setCampaigns([]);
          setIsLoading(false);
          return;
        }
        
        // Banner verilerini kampanya formatına dönüştür
        const campaignsWithDetails = allBanners.map((banner) => {
          return {
            id: banner.id,
            title: banner.title,
            description: banner.description,
            image: banner.banner_image_url || getDefaultImage(getCategoryIdFromName(banner.category)),
            storeName: banner.campaign ? 'Kampanya' : 'Tüm Mağazalar',
            categoryName: getCategoryTypeFromName(banner.category),
            categoryId: getCategoryIdFromName(banner.category),
            campaign_id: banner.campaign_id,
            category: banner.category,
            priority_order: banner.priority_order,
            start_date: banner.start_date,
            end_date: banner.end_date,
            click_count: banner.click_count
          };
        });
        
        // Öncelik sırasına göre sırala
        const sortedCampaigns = campaignsWithDetails.sort((a, b) => {
          return (b.priority_order || 0) - (a.priority_order || 0);
        });
        
        setCampaigns(sortedCampaigns);
      } catch (error) {
        console.error('Kampanya yükleme hatası:', error);
        setError('Kampanyalar yüklenirken bir sorun oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaigns();
  }, [getDefaultImage]);

  // Kategori türünü ID'den belirle
  const getCategoryTypeFromId = (categoryId) => {
    if (!categoryId) return 'genel';
    
    const categoryMap = {
      1: 'yemek',
      2: 'market',
      3: 'su',
      4: 'cicek',
      5: 'tatli'
    };
    
    return categoryMap[categoryId] || 'genel';
  };

  // Kategori adından ID belirle
  const getCategoryIdFromName = (categoryName) => {
    if (!categoryName) return null;
    
    const categoryMap = {
      'Yemek': 1,
      'Market': 2,
      'Su': 3,
      'Çiçek': 4,
      'Tatlı': 5
    };
    
    return categoryMap[categoryName] || null;
  };

  // Kategori adından tip belirle
  const getCategoryTypeFromName = (categoryName) => {
    if (!categoryName) return 'genel';
    
    const categoryMap = {
      'Yemek': 'yemek',
      'Market': 'market',
      'Su': 'su',
      'Çiçek': 'cicek',
      'Tatlı': 'tatli'
    };
    
    return categoryMap[categoryName] || 'genel';
  };

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
  const navigateToStore = (campaign) => {
    if (campaign.store_id) {
      // Mağaza kampanyası ise ilgili mağazaya yönlendir
      router.push(`/${campaign.categoryName}/store/${campaign.store_id}`);
    } else if (campaign.main_category_id) {
      // Kategori kampanyası ise kategoriye yönlendir
      router.push(`/${campaign.categoryName}`);
    } else {
      // Fallback olarak ana sayfaya yönlendir
      router.push('/');
    }
  };

  // Tarih formatı
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  if (isLoading) {
    return (
      <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-lg shadow-md"></div>
    );
  }

  if (error) {
    return null; // Hata durumunda banner gösterme
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
                    {(campaign.start_date || campaign.end_date) && (
                      <span className="text-xs">
                        {campaign.start_date && formatDate(campaign.start_date)} 
                        {campaign.start_date && campaign.end_date && ' - '} 
                        {campaign.end_date && formatDate(campaign.end_date)}
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => navigateToStore(campaign)}
                    className="px-4 py-2 bg-white text-gray-800 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    {campaign.store_id ? 'Mağazaya Git' : 'Detaylar'}
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