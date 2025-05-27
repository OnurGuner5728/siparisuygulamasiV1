'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiX, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import api from '@/lib/api';

const ProductDetailModal = ({ 
  isOpen, 
  onClose, 
  product, 
  storeType = 'yemek',
  onAddToCart 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [productDetails, setProductDetails] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const { addToCart } = useCart();
  const { error, warning } = useToast();

  // Modal açıldığında ürün detaylarını ve seçeneklerini yükle
  useEffect(() => {
    if (isOpen && product?.id) {
      loadProductDetails();
    }
  }, [isOpen, product?.id]);

  // Toplam fiyatı hesapla
  useEffect(() => {
    if (productDetails) {
      let basePrice = parseFloat(productDetails.price) || 0;
      let optionsPrice = 0;

      // Seçilen seçeneklerin fiyatlarını topla
      Object.values(selectedOptions).forEach(option => {
        if (option && option.price_modifier) {
          optionsPrice += parseFloat(option.price_modifier) || 0;
        }
      });

      setTotalPrice((basePrice + optionsPrice) * quantity);
    }
  }, [productDetails, selectedOptions, quantity]);

  const loadProductDetails = async () => {
    setLoading(true);
    try {
      const details = await api.getProductWithOptions(product.id);
      setProductDetails(details);
      
      // Varsayılan seçenekleri ayarla
      if (details.option_groups) {
        const defaultSelections = {};
        details.option_groups.forEach(group => {
          if (group.is_required && group.options) {
            const defaultOption = group.options.find(opt => opt.is_default) || group.options[0];
            if (defaultOption) {
              defaultSelections[group.id] = {
                option_id: defaultOption.id,
                option_group_id: group.id,
                option_group_name: group.name,
                option_name: defaultOption.name,
                price_modifier: defaultOption.price_modifier || 0
              };
            }
          }
        });
        setSelectedOptions(defaultSelections);
      }
    } catch (error) {
      console.error('Ürün detayları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (groupId, option, group) => {
    if (group.type === 'single') {
      setSelectedOptions(prev => ({
        ...prev,
        [groupId]: {
          option_id: option.id,
          option_group_id: groupId,
          option_group_name: group.name,
          option_name: option.name,
          price_modifier: option.price_modifier || 0
        }
      }));
    } else {
      // Multiple selection logic burada implement edilecek
      setSelectedOptions(prev => {
        const current = prev[groupId] || [];
        const exists = current.find(item => item.option_id === option.id);
        
        if (exists) {
          // Remove option
          return {
            ...prev,
            [groupId]: current.filter(item => item.option_id !== option.id)
          };
        } else {
          // Add option
          return {
            ...prev,
            [groupId]: [...current, {
              option_id: option.id,
              option_group_id: groupId,
              option_group_name: group.name,
              option_name: option.name,
              price_modifier: option.price_modifier || 0
            }]
          };
        }
      });
    }
  };

  const isOptionSelected = (groupId, optionId) => {
    const selection = selectedOptions[groupId];
    if (Array.isArray(selection)) {
      return selection.some(item => item.option_id === optionId);
    }
    return selection?.option_id === optionId;
  };

  const canAddToCart = () => {
    if (!productDetails?.option_groups) return true;
    
    // Zorunlu grupların seçilip seçilmediğini kontrol et
    return productDetails.option_groups.every(group => {
      if (!group.is_required) return true;
      const selection = selectedOptions[group.id];
      return selection && (Array.isArray(selection) ? selection.length > 0 : true);
    });
  };

  const handleAddToCart = async () => {
    if (!canAddToCart()) {
      warning('Lütfen zorunlu seçenekleri seçiniz');
      return;
    }

    try {
      // Seçenekleri düz bir array'e çevir
      const optionsArray = [];
      Object.values(selectedOptions).forEach(selection => {
        if (Array.isArray(selection)) {
          optionsArray.push(...selection);
        } else if (selection) {
          optionsArray.push(selection);
        }
      });

      const productWithOptions = {
        ...productDetails,
        selectedOptions: optionsArray,
        finalPrice: totalPrice / quantity // birim fiyat
      };

      if (onAddToCart) {
        await onAddToCart(productWithOptions, quantity);
      } else {
        const productWithStore = {
          ...productWithOptions,
          store_id: product.store_id,
          store_name: product.store_name || '',
          store_type: storeType
        };
        await addToCart(productWithStore, quantity, storeType);
      }
      
      onClose();
    } catch (err) {
      console.error('Sepete ekleme hatası:', err);
      error('Ürün sepete eklenirken hata oluştu');
    }
  };

  const getThemeColors = () => {
    switch (storeType) {
      case 'yemek':
        return {
          primary: 'orange',
          primaryHex: '#f97316',
          primaryLight: 'orange-50',
          primaryDark: 'orange-600'
        };
      case 'market':
        return {
          primary: 'green',
          primaryHex: '#16a34a',
          primaryLight: 'green-50',
          primaryDark: 'green-600'
        };
      case 'su':
        return {
          primary: 'sky',
          primaryHex: '#0ea5e9',
          primaryLight: 'sky-50',
          primaryDark: 'sky-600'
        };
      default:
        return {
          primary: 'orange',
          primaryHex: '#f97316',
          primaryLight: 'orange-50',
          primaryDark: 'orange-600'
        };
    }
  };

  const theme = getThemeColors();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
          
          {/* Product Image */}
          <div className="h-64 bg-gray-100 relative">
            {product?.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Yükleniyor...</p>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{productDetails?.name}</h2>
                {productDetails?.description && (
                  <p className="text-gray-600 text-sm mb-4">{productDetails.description}</p>
                )}
                <p className={`text-2xl font-bold text-${theme.primary}-600`}>
                  ₺{totalPrice.toFixed(2)}
                </p>
              </div>

              {/* Options */}
              {productDetails?.option_groups && productDetails.option_groups.map(group => (
                <div key={group.id} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    {group.is_required && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        Zorunlu
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {group.options && group.options.map(option => (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          isOptionSelected(group.id, option.id)
                            ? `border-${theme.primary}-500 bg-${theme.primaryLight}`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type={group.type === 'single' ? 'radio' : 'checkbox'}
                            name={group.id}
                            checked={isOptionSelected(group.id, option.id)}
                            onChange={() => handleOptionChange(group.id, option, group)}
                            className={`w-4 h-4 text-${theme.primary}-600 border-gray-300 focus:ring-${theme.primary}-500`}
                          />
                          <span className="text-gray-900">{option.name}</span>
                        </div>
                        {option.price_modifier && option.price_modifier > 0 && (
                          <span className={`text-${theme.primary}-600 font-medium`}>
                            +₺{option.price_modifier}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Adet</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`w-10 h-10 rounded-full border border-${theme.primary}-300 flex items-center justify-center text-${theme.primary}-600 hover:bg-${theme.primaryLight}`}
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-semibold min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className={`w-10 h-10 rounded-full border border-${theme.primary}-300 flex items-center justify-center text-${theme.primary}-600 hover:bg-${theme.primaryLight}`}
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart()}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white flex items-center justify-center space-x-2 transition-colors ${
                  canAddToCart()
                    ? `bg-${theme.primary}-500 hover:bg-${theme.primaryDark}`
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                style={{ backgroundColor: canAddToCart() ? theme.primaryHex : '#d1d5db' }}
              >
                <FiShoppingCart className="w-5 h-5" />
                <span>Sepete Ekle - ₺{totalPrice.toFixed(2)}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal; 