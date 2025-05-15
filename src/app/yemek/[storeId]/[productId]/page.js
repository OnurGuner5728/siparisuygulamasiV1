'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiMinus, FiPlus, FiCheckCircle, FiStar, FiShoppingBag } from 'react-icons/fi';
import { mockStores, mockProducts } from '@/app/data/mockdatas';
import { useCart } from '@/contexts/CartContext';

export default function ProductDetail({ params }) {
  const router = useRouter();
  const { storeId, productId } = params;
  
  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [removedItems, setRemovedItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  
  // CartContext
  const { addToCart: contextAddToCart } = useCart();
  
  // Ürün ve restoran verilerini yükle
  useEffect(() => {
    // API çağrısı simülasyonu
    setTimeout(() => {
      // Restoran bilgilerini al
      const storeData = mockStores.find(s => s.id === Number(storeId));
      setStore(storeData);
      
      // Ürün bilgilerini al (storeData.menuItems içinden)
      if (storeData && storeData.menuItems) {
        const productData = storeData.menuItems.find(p => p.id === Number(productId));
        setProduct(productData);
        
        // Varsayılan seçenekleri ayarla
        if (productData && productData.options) {
          const defaultOptions = {};
          productData.options.forEach(option => {
            if (option.required && !option.multiple && option.items.length > 0) {
              // Varsayılan olarak ilk seçeneği seç (zorunlu ve tekli seçimler için)
              defaultOptions[option.id] = option.items[0].id;
            } else if (option.multiple) {
              // Çoklu seçimler için boş bir dizi başlat
              defaultOptions[option.id] = [];
            }
          });
          setSelectedOptions(defaultOptions);
        }
      }
      
      setLoading(false);
    }, 500);
  }, [storeId, productId]);
  
  // Miktar arttırma
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  // Miktar azaltma
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  // Seçenek değiştirme (tekli seçim)
  const handleOptionChange = (optionId, itemId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: itemId
    }));
  };
  
  // Seçenek değiştirme (çoklu seçim)
  const handleMultiOptionChange = (optionId, itemId) => {
    setSelectedOptions(prev => {
      const current = prev[optionId] || [];
      
      if (current.includes(itemId)) {
        // Eğer zaten seçiliyse, kaldır
        return {
          ...prev,
          [optionId]: current.filter(id => id !== itemId)
        };
      } else {
        // Seçili değilse, ekle
        return {
          ...prev,
          [optionId]: [...current, itemId]
        };
      }
    });
  };
  
  // Çıkarılabilir öğe değiştirme
  const handleRemovableItemToggle = (itemId) => {
    setRemovedItems(prev => {
      if (prev.includes(itemId)) {
        // Eğer zaten kaldırılmışsa, geri ekle
        return prev.filter(id => id !== itemId);
      } else {
        // Kaldırılmamışsa, kaldır
        return [...prev, itemId];
      }
    });
  };
  
  // Sepete ekle
  const addToCart = () => {
    // Ürün seçeneklerini hazırla
    const selectedItems = [];
    
    if (product && product.options) {
      product.options.forEach(option => {
        if (option.multiple) {
          // Çoklu seçim
          const selected = selectedOptions[option.id] || [];
          selected.forEach(selectedItemId => {
            const item = option.items.find(i => i.id === selectedItemId);
            if (item) {
              selectedItems.push(item.name + (item.price > 0 ? ` (+${item.price.toFixed(2)} TL)` : item.price < 0 ? ` (${item.price.toFixed(2)} TL)` : ''));
            }
          });
        } else {
          // Tekli seçim
          const selectedItemId = selectedOptions[option.id];
          if (selectedItemId) {
            const item = option.items.find(i => i.id === selectedItemId);
            if (item) {
              selectedItems.push(item.name + (item.price > 0 ? ` (+${item.price.toFixed(2)} TL)` : item.price < 0 ? ` (${item.price.toFixed(2)} TL)` : ''));
            }
          }
        }
      });
    }
    
    // Çıkarılan öğeleri hazırla
    const removedNames = [];
    if (product && product.removableItems) {
      removedItems.forEach(removedItemId => {
        const item = product.removableItems.find(i => i.id === removedItemId);
        if (item) {
          removedNames.push(item.name);
        }
      });
    }
    
    // Toplam fiyatı hesapla
    const basePrice = product ? product.price : 0;
    let totalPrice = basePrice;
    
    // Seçeneklerin fiyat etkilerini hesapla
    if (product && product.options) {
      product.options.forEach(option => {
        if (option.multiple) {
          // Çoklu seçim
          const selected = selectedOptions[option.id] || [];
          selected.forEach(selectedItemId => {
            const item = option.items.find(i => i.id === selectedItemId);
            if (item) totalPrice += item.price;
          });
        } else {
          // Tekli seçim
          const selectedItemId = selectedOptions[option.id];
          if (selectedItemId) {
            const item = option.items.find(i => i.id === selectedItemId);
            if (item) totalPrice += item.price;
          }
        }
      });
    }
    
    // Ürün nesnesini oluştur
    const cartItem = {
      id: Date.now(), // Gerçek uygulamada API bir ID atayacak
      productId: product.id,
      storeId: store.id,
      name: product.name,
      image: product.image || '/images/products/product-placeholder.jpg',
      price: totalPrice,
      basePrice: basePrice,
      quantity: quantity,
      options: selectedItems,
      removedItems: removedNames,
      notes: notes
    };
    
    try {
      // CartContext'i kullanarak ürünü sepete ekle
      // CartContext otomatik olarak localStorage'a kaydeder
      contextAddToCart(cartItem);
      
      // Başarılı mesajını göster
      setShowAddedToCart(true);
      
      // 3 saniye sonra mesajı gizle
      setTimeout(() => {
        setShowAddedToCart(false);
      }, 3000);
      
      // Sepet sidebar'ı otomatik açılmasın, sadece ürün eklendiğini bildiren mesaj gösterilsin
    } catch (error) {
      console.error('Sepete eklenirken hata oluştu:', error);
    }
  };
  
  // Toplam fiyat hesaplaması
  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    let total = product.price;
    
    // Seçeneklerin fiyat etkilerini hesapla
    if (product.options) {
      product.options.forEach(option => {
        if (option.multiple) {
          // Çoklu seçim
          const selected = selectedOptions[option.id] || [];
          selected.forEach(selectedItemId => {
            const item = option.items.find(i => i.id === selectedItemId);
            if (item) total += item.price;
          });
        } else {
          // Tekli seçim
          const selectedItemId = selectedOptions[option.id];
          if (selectedItemId) {
            const item = option.items.find(i => i.id === selectedItemId);
            if (item) total += item.price;
          }
        }
      });
    }
    
    return total * quantity;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!product || !store) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 max-w-sm mx-auto">
          <div className="text-red-500 text-5xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ürün Bulunamadı</h2>
          <p className="text-gray-600 mb-6">Aradığınız ürün bulunamadı veya artık mevcut değil.</p>
          <Link
            href={`/yemek/store/${storeId}`}
            className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700"
          >
            Restorana Geri Dön
          </Link>
        </div>
      </div>
    );
  }
  
  const total = calculateTotalPrice();
  
  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Başlık */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Geri"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 truncate">{product.name}</h1>
          </div>
        </div>
      </div>
      
      {/* Ürün Görseli */}
      <div className="bg-white">
        <div className="container mx-auto p-4">
          <div className="h-60 w-full bg-gray-200 rounded-lg overflow-hidden relative">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                Ürün görseli yok
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Ürün Bilgileri */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
              <div className="flex items-center mt-1">
                <div className="flex items-center text-yellow-500">
                  <FiStar className="fill-current" />
                  <span className="ml-1 text-sm">{product.rating || 4.5}</span>
                </div>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-sm text-gray-500">{product.reviewCount || 120} değerlendirme</span>
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{product.price.toFixed(2)} TL</div>
          </div>
          
          <p className="text-gray-600 mt-4">{product.description || 'Bu ürün hakkında henüz bir açıklama eklenmemiştir.'}</p>
        </div>
        
        {/* Ürün Seçenekleri */}
        {product.options && product.options.length > 0 && (
          <div className="space-y-4">
            {product.options.map((option) => (
              <div key={option.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-800">
                    {option.name}
                    {option.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {option.multiple ? 
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Çoklu Seçim</span> :
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Tekli Seçim</span>
                  }
                </div>
                
                <div className="space-y-2">
                  {option.items.map((item) => {
                    // Seçili mi kontrolü
                    let isSelected = false;
                    
                    if (option.multiple) {
                      const selectedItems = selectedOptions[option.id] || [];
                      isSelected = selectedItems.includes(item.id);
                    } else {
                      isSelected = selectedOptions[option.id] === item.id;
                    }
                    
                    return (
                      <label 
                        key={item.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isSelected 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <input 
                            type={option.multiple ? "checkbox" : "radio"}
                            name={option.id}
                            checked={isSelected}
                            onChange={() => 
                              option.multiple 
                                ? handleMultiOptionChange(option.id, item.id)
                                : handleOptionChange(option.id, item.id)
                            }
                            className={`${option.multiple ? 'form-checkbox' : 'form-radio'} h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500`}
                          />
                          <span className="ml-3 text-gray-700">{item.name}</span>
                        </div>
                        
                        {item.price !== 0 && (
                          <span className={`text-sm font-medium ${
                            item.price > 0 ? 'text-gray-700' : 'text-green-600'
                          }`}>
                            {item.price > 0 ? `+${item.price.toFixed(2)}` : item.price.toFixed(2)} TL
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Çıkarılabilir Malzemeler */}
        {product.removableItems && product.removableItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
            <h3 className="font-medium text-gray-800 mb-3">Çıkarmak İstediğiniz Malzemeler</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {product.removableItems.map((item) => (
                <label 
                  key={item.id} 
                  className={`flex items-center p-3 rounded-lg border ${
                    removedItems.includes(item.id) 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input 
                    type="checkbox"
                    checked={removedItems.includes(item.id)}
                    onChange={() => handleRemovableItemToggle(item.id)}
                    className="form-checkbox h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="ml-3 text-gray-700">{item.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Özel Notlar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
          <h3 className="font-medium text-gray-800 mb-3">Sipariş Notu</h3>
          <textarea
            placeholder="Ekstra istekleriniz veya notlarınız (isteğe bağlı)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows="3"
          ></textarea>
        </div>
      </div>
      
      {/* Alt Butonlar (Sabit) */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 z-10">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className={`p-2 rounded-full ${
                  quantity <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FiMinus size={18} />
              </button>
              <span className="mx-4 text-lg font-medium">{quantity}</span>
              <button
                onClick={increaseQuantity}
                className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
              >
                <FiPlus size={18} />
              </button>
            </div>
            
            <button
              onClick={addToCart}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 flex items-center justify-center sm:justify-between"
            >
              <span className="flex items-center">
                <FiShoppingBag className="mr-2" />
                Sepete Ekle
              </span>
              <span className="font-bold">{total.toFixed(2)} TL</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Sepete Eklendi Bildirimi */}
      {showAddedToCart && (
        <div className="fixed top-16 inset-x-0 flex justify-center items-center z-50">
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
            <FiCheckCircle className="mr-2" size={20} />
            <span>Ürün sepete eklendi</span>
          </div>
        </div>
      )}
    </div>
  );
} 