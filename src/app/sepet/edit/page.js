'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiEdit, FiCheck, FiX, FiMinus, FiPlus } from 'react-icons/fi';

// Demo ürün (gerçek uygulamada API'dan gelecektir)
const demoProduct = {
  id: 'product1',
  storeId: 'store1',
  name: 'Kral Burger Menü',
  description: 'Özel soslu büyük boy burger, patates kızartması ve içecek içerir.',
  image: '/images/products/product-placeholder.jpg',
  price: 125.90,
  options: [
    {
      id: 'size',
      name: 'Boyut',
      required: true,
      multiple: false,
      items: [
        { id: 'small', name: 'Küçük Boy', price: 0 },
        { id: 'medium', name: 'Orta Boy', price: 0 },
        { id: 'large', name: 'Büyük Boy', price: 15 }
      ]
    },
    {
      id: 'drink',
      name: 'İçecek',
      required: true,
      multiple: false,
      items: [
        { id: 'cola', name: 'Cola', price: 0 },
        { id: 'fanta', name: 'Fanta', price: 0 },
        { id: 'sprite', name: 'Sprite', price: 0 },
        { id: 'ayran', name: 'Ayran', price: 0 },
        { id: 'water', name: 'Su', price: -5 }
      ]
    },
    {
      id: 'extras',
      name: 'Ekstralar',
      required: false,
      multiple: true,
      items: [
        { id: 'cheese', name: 'Ekstra Peynir', price: 7 },
        { id: 'bacon', name: 'Bacon', price: 12 },
        { id: 'onion_rings', name: 'Soğan Halkaları', price: 10 },
        { id: 'ranch', name: 'Ranch Sos', price: 5 }
      ]
    }
  ],
  removableItems: [
    { id: 'onion', name: 'Soğan' },
    { id: 'tomato', name: 'Domates' },
    { id: 'lettuce', name: 'Marul' },
    { id: 'pickle', name: 'Turşu' }
  ]
};

// Demo sepet öğesi
const demoCartItem = {
  id: 'item1',
  productId: 'product1',
  name: 'Kral Burger Menü',
  quantity: 2,
  selectedOptions: {
    'size': 'medium', // Orta Boy
    'drink': 'cola',  // Cola
    'extras': ['cheese'] // Ekstra Peynir
  },
  removedItems: ['onion'], // Soğansız
  notes: 'Ekstra acı sos ekleyebilir misiniz?',
  price: 125.90
};

export default function EditCartItem() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get('id');
  
  // Durumlar
  const [product, setProduct] = useState(null);
  const [cartItem, setCartItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [removedItems, setRemovedItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Sayfa yüklendiğinde ürün ve sepet öğesini getir
  useEffect(() => {
    // Gerçek uygulamada API'den veri çekilir
    setLoading(true);
    
    setTimeout(() => {
      setProduct(demoProduct);
      
      // Eğer mevcut bir sepet öğesi düzenleniyorsa
      if (itemId === 'item1') { // Demoda bunu kontrol ediyoruz
        setCartItem(demoCartItem);
        setSelectedOptions(demoCartItem.selectedOptions || {});
        setRemovedItems(demoCartItem.removedItems || []);
        setNotes(demoCartItem.notes || '');
        setQuantity(demoCartItem.quantity || 1);
      }
      
      setLoading(false);
    }, 500);
  }, [itemId]);
  
  // Seçenek değiştirme işleyicisi (tekli seçim)
  const handleOptionChange = (optionId, itemId) => {
    setSelectedOptions({
      ...selectedOptions,
      [optionId]: itemId
    });
  };
  
  // Seçenek değiştirme işleyicisi (çoklu seçim)
  const handleMultiOptionChange = (optionId, itemId) => {
    const currentSelected = selectedOptions[optionId] || [];
    
    if (currentSelected.includes(itemId)) {
      // Eğer zaten seçiliyse, kaldır
      setSelectedOptions({
        ...selectedOptions,
        [optionId]: currentSelected.filter(id => id !== itemId)
      });
    } else {
      // Seçili değilse, ekle
      setSelectedOptions({
        ...selectedOptions,
        [optionId]: [...currentSelected, itemId]
      });
    }
  };
  
  // Çıkarılabilir öğe değiştirme işleyicisi
  const handleRemovableItemToggle = (itemId) => {
    if (removedItems.includes(itemId)) {
      // Eğer zaten kaldırılmışsa, geri ekle
      setRemovedItems(removedItems.filter(id => id !== itemId));
    } else {
      // Kaldırılmamışsa, kaldır
      setRemovedItems([...removedItems, itemId]);
    }
  };
  
  // Sepeti güncelleme işlemi
  const handleUpdateCart = () => {
    // Gerçek uygulamada API'ye güncelleme yapılır
    console.log('Güncellenen sepet öğesi:', {
      productId: product.id,
      selectedOptions,
      removedItems,
      notes,
      quantity
    });
    
    // Sepet sayfasına geri dön
    router.push('/sepet');
  };
  
  // Toplam fiyat hesaplaması
  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    let total = product.price;
    
    // Seçeneklerin fiyat etkilerini hesapla
    product.options.forEach(option => {
      if (option.multiple) {
        // Çoklu seçim
        const selectedItems = selectedOptions[option.id] || [];
        selectedItems.forEach(selectedItemId => {
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
    
    return total * quantity;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Ürün bulunamadı</h3>
          <p className="text-gray-500 mb-6">Bu ürün artık mevcut değil veya kaldırılmış olabilir.</p>
          <button
            onClick={() => router.push('/sepet')}
            className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-700"
          >
            Sepete Geri Dön
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Başlık */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()} 
              className="mr-3 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Geri"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Ürünü Düzenle</h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 pb-32">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="p-4">
            <h2 className="text-xl font-medium text-gray-900">{product.name}</h2>
            <p className="text-gray-600 text-sm mt-1">{product.description}</p>
            <div className="mt-2 flex items-center text-sm">
              <span className="font-medium text-gray-900">{product.price.toFixed(2)} TL</span>
            </div>
          </div>
        </div>
        
        {/* Ürün Seçenekleri */}
        {product.options.map((option) => (
          <div key={option.id} className="bg-white rounded-lg shadow-sm p-4 mb-4">
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
                        checked={isSelected}
                        onChange={() => 
                          option.multiple 
                            ? handleMultiOptionChange(option.id, item.id)
                            : handleOptionChange(option.id, item.id)
                        }
                        className={`form-${option.multiple ? 'checkbox' : 'radio'} h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500`}
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
            
            {option.required && !selectedOptions[option.id] && (
              <p className="text-xs text-red-500 mt-2">Bu seçim zorunludur</p>
            )}
          </div>
        ))}
        
        {/* Çıkarılabilir Öğeler */}
        {product.removableItems && product.removableItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
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
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="font-medium text-gray-800 mb-3">Sipariş Notu</h3>
          <textarea
            placeholder="Ekstra istekleriniz veya notlarınız (isteğe bağlı)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows="3"
          ></textarea>
        </div>
        
        {/* Miktar Seçimi */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="font-medium text-gray-800 mb-3">Miktar</h3>
          <div className="flex items-center">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full"
              disabled={quantity <= 1}
            >
              <FiMinus size={18} />
            </button>
            <span className="mx-5 text-gray-800 font-medium text-lg min-w-[30px] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full"
            >
              <FiPlus size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Alt Butonlar (Sabit) */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">Toplam</span>
          <span className="text-lg font-bold text-gray-900">{calculateTotalPrice().toFixed(2)} TL</span>
        </div>
        <button
          onClick={handleUpdateCart}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:from-orange-600 hover:to-red-700 flex items-center justify-center"
        >
          <FiCheck className="mr-2" size={18} />
          Sepeti Güncelle
        </button>
      </div>
    </div>
  );
} 