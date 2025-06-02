'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import RadioButton from '@/components/ui/RadioButton';

/**
 * Filtreleme Modalı Bileşeni
 * @param {Object} props - Filtreleme modalı özellikleri
 * @param {boolean} props.isOpen - Modal açık mı
 * @param {function} props.onClose - Kapatma işlevi
 * @param {Object} props.filters - Mevcut filtreler
 * @param {function} props.onApplyFilters - Filtreleri uygulama işlevi
 * @param {function} props.onResetFilters - Filtreleri sıfırlama işlevi
 * @param {Array} props.categories - Kategori listesi
 * @param {Array} props.cuisines - Mutfak türleri listesi
 * @param {Array} props.dietTypes - Diyet türleri listesi
 */
const FilterModal = ({
  isOpen,
  onClose,
  filters = {},
  onApplyFilters,
  onResetFilters,
  categories = [],
  cuisines = [],
  dietTypes = [],
}) => {
  // Başlangıç filtre durumu (mevcut filtreler veya boş)
  const [localFilters, setLocalFilters] = useState({
    categories: filters.categories || [],
    priceRange: filters.priceRange || '',
    rating: filters.rating || '',
    cuisines: filters.cuisines || [],
    dietTypes: filters.dietTypes || [],
    sortBy: filters.sortBy || 'popular',
    hasDelivery: filters.hasDelivery || false,
    hasDiscount: filters.hasDiscount || false,
  });
  
  // Modal açıldığında filtreleri güncelle
  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        categories: filters.categories || [],
        priceRange: filters.priceRange || '',
        rating: filters.rating || '',
        cuisines: filters.cuisines || [],
        dietTypes: filters.dietTypes || [],
        sortBy: filters.sortBy || 'popular',
        hasDelivery: filters.hasDelivery || false,
        hasDiscount: filters.hasDiscount || false,
      });
    }
  }, [isOpen, filters]);
  
  // Checkbox değişikliği
  const handleCheckboxChange = (name, value) => {
    if (localFilters[name].includes(value)) {
      // Değer zaten varsa, kaldır
      setLocalFilters({
        ...localFilters,
        [name]: localFilters[name].filter(item => item !== value),
      });
    } else {
      // Değer yoksa, ekle
      setLocalFilters({
        ...localFilters,
        [name]: [...localFilters[name], value],
      });
    }
  };
  
  // Radio buton değişikliği
  const handleRadioChange = (name, value) => {
    setLocalFilters({
      ...localFilters,
      [name]: value,
    });
  };
  
  // Boolean değer değişikliği
  const handleBooleanChange = (name) => {
    setLocalFilters({
      ...localFilters,
      [name]: !localFilters[name],
    });
  };
  
  // Filtreleri uygula
  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(localFilters);
    }
    onClose();
  };
  
  // Filtreleri sıfırla
  const handleResetFilters = () => {
    const emptyFilters = {
      categories: [],
      priceRange: '',
      rating: '',
      cuisines: [],
      dietTypes: [],
      sortBy: 'popular',
      hasDelivery: false,
      hasDiscount: false,
    };
    
    setLocalFilters(emptyFilters);
    
    if (onResetFilters) {
      onResetFilters(emptyFilters);
    }
  };
  
  // Seçili filtre sayısı
  const getSelectedFilterCount = () => {
    let count = 0;
    
    if (localFilters.categories.length > 0) count++;
    if (localFilters.priceRange) count++;
    if (localFilters.rating) count++;
    if (localFilters.cuisines.length > 0) count++;
    if (localFilters.dietTypes.length > 0) count++;
    if (localFilters.hasDelivery) count++;
    if (localFilters.hasDiscount) count++;
    
    // sortBy her zaman bir değere sahip olduğu için saymıyoruz
    
    return count;
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Filtreler"
      size="lg"
    >
      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Sol kolon - Kategoriler ve Fiyat */}
        <div className="md:w-1/2 mb-6 md:mb-0">
          {/* Kategoriler */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-semibold mb-3">Kategoriler</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <Checkbox
                  key={category.id}
                  id={`category-${category.id}`}
                  label={category.name}
                  checked={localFilters.categories.includes(category.id)}
                  onChange={() => handleCheckboxChange('categories', category.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Fiyat Aralığı */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-semibold mb-3">Fiyat Aralığı</h3>
            <div className="space-y-2">
              <RadioButton
                id="price-1"
                name="priceRange"
                value="0-50"
                label="₺0 - ₺50"
                checked={localFilters.priceRange === '0-50'}
                onChange={() => handleRadioChange('priceRange', '0-50')}
              />
              <RadioButton
                id="price-2"
                name="priceRange"
                value="50-100"
                label="₺50 - ₺100"
                checked={localFilters.priceRange === '50-100'}
                onChange={() => handleRadioChange('priceRange', '50-100')}
              />
              <RadioButton
                id="price-3"
                name="priceRange"
                value="100-200"
                label="₺100 - ₺200"
                checked={localFilters.priceRange === '100-200'}
                onChange={() => handleRadioChange('priceRange', '100-200')}
              />
              <RadioButton
                id="price-4"
                name="priceRange"
                value="200+"
                label="₺200+"
                checked={localFilters.priceRange === '200+'}
                onChange={() => handleRadioChange('priceRange', '200+')}
              />
            </div>
          </div>
          
          {/* Derecelendirme */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">Derecelendirme</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <RadioButton
                  key={rating}
                  id={`rating-${rating}`}
                  name="rating"
                  value={rating.toString()}
                  label={
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1">ve üzeri</span>
                    </div>
                  }
                  checked={localFilters.rating === rating.toString()}
                  onChange={() => handleRadioChange('rating', rating.toString())}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Sağ kolon - Mutfak, Diyet, Sıralama */}
        <div className="md:w-1/2">
          {/* Mutfak Türleri */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-semibold mb-3">Mutfak Türleri</h3>
            <div className="space-y-2">
              {cuisines.map((cuisine) => (
                <Checkbox
                  key={cuisine.id}
                  id={`cuisine-${cuisine.id}`}
                  label={cuisine.name}
                  checked={localFilters.cuisines.includes(cuisine.id)}
                  onChange={() => handleCheckboxChange('cuisines', cuisine.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Diyet Türleri */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-semibold mb-3">Diyet Türleri</h3>
            <div className="space-y-2">
              {dietTypes.map((diet) => (
                <Checkbox
                  key={diet.id}
                  id={`diet-${diet.id}`}
                  label={diet.name}
                  checked={localFilters.dietTypes.includes(diet.id)}
                  onChange={() => handleCheckboxChange('dietTypes', diet.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Sıralama ve Diğer Filtreler */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">Sıralama</h3>
            <div className="space-y-2">
              <RadioButton
                id="sort-popular"
                name="sortBy"
                value="popular"
                label="Popülerlik"
                checked={localFilters.sortBy === 'popular'}
                onChange={() => handleRadioChange('sortBy', 'popular')}
              />
              <RadioButton
                id="sort-rating"
                name="sortBy"
                value="rating"
                label="En Yüksek Puan"
                checked={localFilters.sortBy === 'rating'}
                onChange={() => handleRadioChange('sortBy', 'rating')}
              />
              <RadioButton
                id="sort-price-asc"
                name="sortBy"
                value="price-asc"
                label="Fiyat (Düşükten Yükseğe)"
                checked={localFilters.sortBy === 'price-asc'}
                onChange={() => handleRadioChange('sortBy', 'price-asc')}
              />
              <RadioButton
                id="sort-price-desc"
                name="sortBy"
                value="price-desc"
                label="Fiyat (Yüksekten Düşüğe)"
                checked={localFilters.sortBy === 'price-desc'}
                onChange={() => handleRadioChange('sortBy', 'price-desc')}
              />
            </div>
            
            <div className="mt-4 space-y-2">
              <Checkbox
                id="has-delivery"
                label="Düşük Teslimat Ücreti (15 TL ve altı)"
                checked={localFilters.hasDelivery}
                onChange={() => handleBooleanChange('hasDelivery')}
              />
              <Checkbox
                id="has-discount"
                label="İndirimli Ürünler"
                checked={localFilters.hasDiscount}
                onChange={() => handleBooleanChange('hasDiscount')}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Butonlar */}
      <div className="mt-8 flex justify-between space-x-4">
        <Button 
          variant="outline" 
          onClick={handleResetFilters}
          className="flex-1"
        >
          Filtreleri Temizle
        </Button>
        
        <Button 
          variant="primary" 
          onClick={handleApplyFilters}
          className="flex-1"
        >
          Uygula {getSelectedFilterCount() > 0 && `(${getSelectedFilterCount()})`}
        </Button>
      </div>
    </Modal>
  );
};

export default FilterModal; 