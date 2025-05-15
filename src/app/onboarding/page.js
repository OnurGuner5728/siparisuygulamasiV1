'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Button from '@/components/ui/Button';

const onboardingSteps = [
  {
    id: 1,
    title: 'Restoranları Keşfedin',
    description: 'Çevrenizdeki en iyi restoranları bulun ve menülerini inceleyin.',
    image: '/images/onboarding/onboarding-1.png',
    imageAlt: 'Restoran keşfetme'
  },
  {
    id: 2,
    title: 'Hızlı Teslimat',
    description: 'Siparişleriniz en hızlı şekilde kapınıza gelsin.',
    image: '/images/onboarding/onboarding-2.png',
    imageAlt: 'Hızlı teslimat'
  },
  {
    id: 3,
    title: 'Kolay Ödeme',
    description: 'Güvenli ve kolay ödeme seçenekleri ile siparişinizi tamamlayın.',
    image: '/images/onboarding/onboarding-3.png',
    imageAlt: 'Kolay ödeme'
  },
  {
    id: 4,
    title: 'Siparişinizi Takip Edin',
    description: 'Siparişinizin durumunu gerçek zamanlı olarak takip edin.',
    image: '/images/onboarding/onboarding-4.png',
    imageAlt: 'Sipariş takibi'
  }
];

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Geçiş animasyonu için state
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('right'); // 'right' veya 'left'
  
  // Klavye ve dokunma olayları için efekt
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStep]);
  
  // İleri git fonksiyonu
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setDirection('right');
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      // Son adımdan sonra giriş sayfasına yönlendir
      router.push('/login');
    }
  };
  
  // Geri git fonksiyonu
  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection('left');
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };
  
  // Atla fonksiyonu
  const handleSkip = () => {
    router.push('/login');
  };
  
  const currentContent = onboardingSteps[currentStep];
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="w-20">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="p-2 text-gray-600 hover:text-gray-900"
              aria-label="Önceki adım"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
        <div className="w-20 text-right">
          <button
            onClick={handleSkip}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Atla
          </button>
        </div>
      </div>

      {/* İlerleme göstergesi */}
      <div className="px-4 flex justify-center space-x-2 mt-4">
        {onboardingSteps.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentStep 
                ? 'w-8 bg-gradient-to-r from-orange-500 to-red-500' 
                : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
      
      {/* İçerik */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 max-w-md mx-auto text-center">
        <div
          className={`transform transition-all duration-300 ${
            isAnimating
              ? direction === 'right'
                ? 'opacity-0 translate-x-20'
                : 'opacity-0 -translate-x-20'
              : 'opacity-100 translate-x-0'
          }`}
        >
          <div className="relative w-64 h-64 mx-auto mb-10">
            {/* Görsel burada gösterilecek, geçici olarak yer tutucu kullanıyoruz */}
            <div className="bg-gradient-to-br from-orange-100 to-red-100 w-full h-full rounded-full flex items-center justify-center">
              <div className="text-orange-500 text-6xl">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {currentContent.title}
          </h1>
          
          <p className="text-gray-600 mb-10">
            {currentContent.description}
          </p>
        </div>
      </div>
      
      {/* Butonlar */}
      <div className="p-6">
        <Button
          onClick={handleNext}
          variant="primary"
          size="lg"
          fullWidth
        >
          {currentStep < onboardingSteps.length - 1 ? 'Devam Et' : 'Başla'}
        </Button>
      </div>
    </div>
  );
} 