import { supabase } from './supabase';

// Bu dosya, geçiş sürecinde kullanılmıştır. Artık Supabase entegrasyonu tamamlandığından
// ve mock veri dosyaları kaldırıldığından, gerçek göç işlemi artık mümkün değildir.
// Bu dosya sadece referans amaçlı tutulmaktadır.

// Mock veriler artık mevcut olmadığından, boş veri yapıları tanımlıyoruz
const mockUsers = [];
const mockStores = [];
const mockProducts = [];
const mockOrders = [];
const mockOrderItems = [];
const mockReviews = [];
const mockCategories = [];
const mockCampaigns = [];
const mockAddresses = [];

/**
 * Mock verilerden Supabase'e veri göçü gerçekleştirmek için kullanılan betik.
 * 
 * Bu betik Next.js uygulamasında çalıştırılabilir. 
 * Tarayıcı konsolunda aşağıdaki kodu çalıştırarak göç işlemini başlatın:
 * 
 * import { migrateAllData } from '@/lib/dataMigration';
 * migrateAllData();
 * 
 * Not: Bu betik, gerçek bir üretim ortamında değil, 
 * sadece geliştirme aşamasında kullanılmalıdır.
 */

// Kullanıcı, mağaza ve ürün ID'lerini izlemek için global değişkenler
let userIdMap = {};
let storeIdMap = {};
let productIdMap = {};

// İlk kullanıcıları sadece veritabanına kaydet (auth atla)
const migrateUsers = async () => {
  console.log('Kullanıcılar göç ettiriliyor...');
  
  for (const user of mockUsers) {
    try {
      // Supabase Auth'a kayıt yapmayı atla ve doğrudan kullanıcı profilini ekle
      // Otomatik bir UUID oluşturalım
      const userId = crypto.randomUUID ? crypto.randomUUID() : 
                     `${Date.now()}-${Math.floor(Math.random() * 1000)}-${user.email.replace('@', '-at-')}`;
      
      // Kullanıcı ID'sini haritada saklayalım
      userIdMap[user.id] = userId;
      userIdMap[user.email] = userId; // E-posta ile de erişebilmek için
      
      // Kullanıcı profili ekle - RLS politikalarını atlamak için admin yetkisi kullan
      const { error: profileError } = await supabaseAdmin.from('users').insert({
        id: userId,
        email: user.email,
        name: user.name,
        first_name: user.firstName || user.name.split(' ')[0],
        last_name: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
        phone: user.phone || '',
        role: user.role || 'user',
        avatar_url: user.avatar || null,
        created_at: user.createdAt || new Date().toISOString()
      });
      
      if (profileError) {
        console.error(`Hata: Kullanıcı profili kaydedilemedi (${user.email}):`, profileError);
        continue;
      }
      
      // Kullanıcı adresleri ekle
      if (user.addresses && user.addresses.length > 0) {
        for (const address of user.addresses) {
          const { error: addressError } = await supabaseAdmin.from('addresses').insert({
            user_id: userId,
            title: address.title || 'Ev Adresi',
            type: address.type || 'home',
            full_name: address.fullName || user.name,
            phone: address.phone || user.phone,
            city: address.city || 'İstanbul',
            district: address.district || 'Kadıköy',
            neighborhood: address.neighborhood || 'Merkez',
            full_address: address.fullAddress || 'Örnek adres bilgisi',
            postal_code: address.postalCode || '34000',
            is_default: address.isDefault || false
          });
          
          if (addressError) {
            console.error(`Hata: Adres kaydedilemedi (${user.email}):`, addressError);
          }
        }
      } else {
        // En azından bir tane varsayılan adres ekleyelim
        const { error: addressError } = await supabaseAdmin.from('addresses').insert({
          user_id: userId,
          title: 'Ev Adresi',
          type: 'home',
          full_name: user.name,
          phone: user.phone || '',
          city: 'İstanbul',
          district: 'Kadıköy',
          neighborhood: 'Merkez',
          full_address: 'Örnek adres bilgisi',
          postal_code: '34000',
          is_default: true
        });
        
        if (addressError) {
          console.error(`Hata: Varsayılan adres kaydedilemedi (${user.email}):`, addressError);
        }
      }
      
      console.log(`Kullanıcı göç ettirildi: ${user.email}`);
    } catch (error) {
      console.error(`Hata: Kullanıcı göç ettirilemedi (${user.email}):`, error);
    }
  }
  
  console.log('Kullanıcı göçü tamamlandı!');
};

// Mağazaları göç ettir - Artık kullanıcı ID'lerini önceden oluşturulmuş haritadan alacağız
const migrateStores = async () => {
  console.log('Mağazalar göç ettiriliyor...');
  
  for (const store of mockStores) {
    try {
      // Store sahibinin e-posta adresini belirle
      const ownerEmail = store.email || `store${store.id}@example.com`;
      
      // Mağaza sahibi kullanıcı ID'sini haritadan al ya da herhangi bir kullanıcı ID'sini kullan
      let ownerId;
      
      if (store.ownerEmail && userIdMap[store.ownerEmail]) {
        ownerId = userIdMap[store.ownerEmail];
      } else if (ownerEmail && userIdMap[ownerEmail]) {
        ownerId = userIdMap[ownerEmail];
      } else {
        // ID haritasındaki ilk kullanıcıyı al
        ownerId = Object.values(userIdMap)[0];
      }
      
      if (!ownerId) {
        console.error(`Hata: Mağaza sahibi bulunamadı (${store.name})`);
        continue;
      }
      
      // Mağaza kaydı oluştur
      const { data: storeData, error: storeError } = await supabaseAdmin.from('stores').insert({
        name: store.name,
        owner_id: ownerId,
        email: ownerEmail,
        phone: store.phone || '',
        address: store.address || '',
        category_id: store.categoryId || 1,
        subcategories: store.subcategories || [],
        logo: store.logo || '',
        cover_image: store.coverImage || '',
        rating: store.rating || 0,
        review_count: store.reviewCount || 0,
        status: store.status || 'active',
        description: store.description || '',
        created_at: store.createdAt || new Date().toISOString()
      }).select();
      
      if (storeError) {
        console.error(`Hata: Mağaza kaydedilemedi (${store.name}):`, storeError);
        continue;
      }
      
      // Mağaza ID'sini haritada sakla
      storeIdMap[store.id] = storeData[0].id;
      storeIdMap[store.name] = storeData[0].id; // Mağaza adıyla da erişebilmek için
      
      // Mağaza çalışma saatleri ekle
      if (store.workingHours) {
        for (const [day, hours] of Object.entries(store.workingHours)) {
          const { error: hourError } = await supabaseAdmin.from('store_working_hours').insert({
            store_id: storeData[0].id,
            day_of_week: day,
            opening_time: hours.open,
            closing_time: hours.close,
            is_closed: hours.isClosed || false
          });
          
          if (hourError) {
            console.error(`Hata: Çalışma saati kaydedilemedi (${store.name}, ${day}):`, hourError);
          }
        }
      }
      
      console.log(`Mağaza göç ettirildi: ${store.name}`);
    } catch (error) {
      console.error(`Hata: Mağaza göç ettirilemedi (${store.name}):`, error);
    }
  }
  
  console.log('Mağaza göçü tamamlandı!');
};

// Ürünleri göç ettir
const migrateProducts = async () => {
  console.log('Ürünler göç ettiriliyor...');
  
  for (const product of mockProducts) {
    try {
      // Mağazayı önce haritadan bul
      let storeId = storeIdMap[product.storeId] || storeIdMap[product.storeName];
      
      // Haritada yoksa, veritabanından sorgu yap
      if (!storeId) {
        // Son çare olarak herhangi bir mağaza ID'si al
        const { data: anyStoreData } = await supabaseAdmin
          .from('stores')
          .select('id')
          .limit(1)
          .single();
          
        if (anyStoreData) {
          storeId = anyStoreData.id;
        } else {
          console.error(`Hata: Ürün için mağaza bulunamadı (${product.name})`);
          continue;
        }
      }
      
      // Ürün kaydı oluştur
      const { data: productData, error: productError } = await supabaseAdmin.from('products').insert({
        store_id: storeId,
        name: product.name,
        description: product.description || '',
        price: product.price,
        image: product.image || '',
        category: product.category || '',
        is_available: product.isAvailable !== false
      }).select();
      
      if (productError) {
        console.error(`Hata: Ürün kaydedilemedi (${product.name}):`, productError);
        continue;
      }
      
      // Ürün ID'sini haritada sakla
      productIdMap[product.id] = productData[0].id;
      productIdMap[product.name] = productData[0].id; // Ürün adıyla da erişebilmek için
      
      console.log(`Ürün göç ettirildi: ${product.name}`);
    } catch (error) {
      console.error(`Hata: Ürün göç ettirilemedi (${product.name}):`, error);
    }
  }
  
  console.log('Ürün göçü tamamlandı!');
};

// Siparişleri göç ettir
const migrateOrders = async () => {
  console.log('Siparişler göç ettiriliyor...');
  
  for (const order of mockOrders) {
    try {
      // Müşteriyi bul - önce haritadan, sonra veritabanından
      let customerId = userIdMap[order.customerId] || userIdMap[order.customerEmail];
      
      if (!customerId) {
        // Herhangi bir kullanıcı bul
        const { data: anyUserData } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('role', 'user')
          .limit(1)
          .single();
          
        if (anyUserData) {
          customerId = anyUserData.id;
        } else {
          console.error(`Hata: Sipariş için müşteri bulunamadı (${order.id})`);
          continue;
        }
      }
      
      // Mağazayı bul - önce haritadan, sonra veritabanından
      let storeId = storeIdMap[order.storeId];
      
      if (!storeId) {
        // Herhangi bir mağaza bul
        const { data: anyStoreData } = await supabaseAdmin
          .from('stores')
          .select('id')
          .limit(1)
          .single();
          
        if (anyStoreData) {
          storeId = anyStoreData.id;
        } else {
          console.error(`Hata: Sipariş için mağaza bulunamadı (${order.id})`);
          continue;
        }
      }
      
      // Adresi bul
      let deliveryAddressId = null;
      
      // Önce kullanıcıya ait bir adres var mı diye bakalım
      const { data: addressData } = await supabaseAdmin
        .from('addresses')
        .select('id')
        .eq('user_id', customerId)
        .limit(1)
        .single();
        
      if (addressData) {
        deliveryAddressId = addressData.id;
      } else {
        // Yoksa yeni bir adres oluşturalım
        const { data: newAddressData, error: newAddressError } = await supabaseAdmin.from('addresses').insert({
          user_id: customerId,
          title: 'Teslimat Adresi',
          type: 'home',
          full_name: order.customerName || 'Müşteri',
          phone: order.customerPhone || '',
          city: 'İstanbul',
          district: 'Kadıköy',
          neighborhood: 'Merkez',
          full_address: 'Örnek teslimat adresi',
          postal_code: '34000',
          is_default: true
        }).select();
        
        if (newAddressError) {
          console.error(`Hata: Sipariş için adres oluşturulamadı (${order.id}):`, newAddressError);
        } else if (newAddressData) {
          deliveryAddressId = newAddressData[0].id;
        }
      }
      
      // Sipariş kaydı oluştur
      const { data: orderData, error: orderError } = await supabaseAdmin.from('orders').insert({
        customer_id: customerId,
        store_id: storeId,
        status: order.status || 'pending',
        order_date: order.orderDate || new Date().toISOString(),
        delivery_date: order.deliveryDate,
        subtotal: order.subtotal,
        delivery_fee: order.deliveryFee || 0,
        total: order.total,
        discount: order.discount || 0,
        payment_method: order.paymentMethod || 'cash',
        payment_status: order.paymentStatus || 'pending',
        delivery_address_id: deliveryAddressId
      }).select();
      
      if (orderError) {
        console.error(`Hata: Sipariş kaydedilemedi (${order.id}):`, orderError);
        continue;
      }
      
      // Sipariş öğelerini ekle
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          // Ürün ID'sini haritadan veya veritabanından bul
          let productId = productIdMap[item.productId] || productIdMap[item.name];
          
          if (!productId) {
            // Herhangi bir ürün bul
            const { data: anyProductData } = await supabaseAdmin
              .from('products')
              .select('id')
              .limit(1)
              .single();
              
            if (anyProductData) {
              productId = anyProductData.id;
            } else {
              console.error(`Hata: Sipariş öğesi için ürün bulunamadı (${order.id}, ${item.name})`);
              continue;
            }
          }
          
          const { error: itemError } = await supabaseAdmin.from('order_items').insert({
            order_id: orderData[0].id,
            product_id: productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            notes: item.notes || ''
          });
          
          if (itemError) {
            console.error(`Hata: Sipariş öğesi kaydedilemedi (${order.id}, ${item.name}):`, itemError);
          }
        }
      }
      
      console.log(`Sipariş göç ettirildi: #${order.id}`);
    } catch (error) {
      console.error(`Hata: Sipariş göç ettirilemedi (${order.id}):`, error);
    }
  }
  
  console.log('Sipariş göçü tamamlandı!');
};

// Kampanyaları göç ettir
const migrateCampaigns = async () => {
  console.log('Kampanyalar göç ettiriliyor...');
  
  for (const campaign of mockCampaigns) {
    try {
      // Oluşturanı bul
      let createdById = null;
      if (campaign.createdBy) {
        const { data: creatorData } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .single();
          
        if (creatorData) {
          createdById = creatorData.id;
        }
      }
      
      // Mağazayı bul
      let storeId = null;
      if (campaign.storeId) {
        storeId = storeIdMap[campaign.storeId];
        
        if (!storeId) {
          const { data: storeData } = await supabaseAdmin
            .from('stores')
            .select('id')
            .limit(1)
            .single();
            
          if (storeData) {
            storeId = storeData.id;
          }
        }
      }
      
      // Kampanya kaydı oluştur
      const { error: campaignError } = await supabaseAdmin.from('campaigns').insert({
        title: campaign.title,
        description: campaign.description || '',
        store_id: storeId,
        created_by: createdById,
        start_date: campaign.startDate || new Date().toISOString(),
        end_date: campaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        discount: campaign.discount,
        discount_type: campaign.discountType || 'percentage',
        min_order_amount: campaign.minOrderAmount || 0,
        max_discount_amount: campaign.maxDiscountAmount || null,
        code: campaign.code || '',
        status: campaign.status || 'active',
        usage: campaign.usage || 0,
        max_usage: campaign.maxUsage || null
      });
      
      if (campaignError) {
        console.error(`Hata: Kampanya kaydedilemedi (${campaign.title}):`, campaignError);
        continue;
      }
      
      console.log(`Kampanya göç ettirildi: ${campaign.title}`);
    } catch (error) {
      console.error(`Hata: Kampanya göç ettirilemedi (${campaign.title}):`, error);
    }
  }
  
  console.log('Kampanya göçü tamamlandı!');
};

// Sepet öğelerini göç ettir
const migrateCartItems = async () => {
  console.log('Sepet öğeleri göç ettiriliyor...');
  
  // Aktif kullanıcıları al
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('role', 'user')
    .limit(5);
    
  if (!users || users.length === 0) {
    console.error('Hata: Sepet öğeleri için kullanıcı bulunamadı');
    return;
  }
  
  // Ürünleri al
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, name, price, store_id')
    .limit(10);
    
  if (!products || products.length === 0) {
    console.error('Hata: Sepet öğeleri için ürün bulunamadı');
    return;
  }
  
  // Her kullanıcıya rastgele 1-3 sepet öğesi ekle
  for (const user of users) {
    try {
      const itemCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < itemCount; i++) {
        // Rastgele bir ürün seç
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        
        const { error: cartError } = await supabaseAdmin.from('cart_items').insert({
          user_id: user.id,
          product_id: product.id,
          store_id: product.store_id,
          quantity: quantity,
          price: product.price,
          total: product.price * quantity,
          notes: ''
        });
        
        if (cartError) {
          console.error(`Hata: Sepet öğesi kaydedilemedi (${user.id}, ${product.name}):`, cartError);
        } else {
          console.log(`Sepet öğesi göç ettirildi: Kullanıcı ${user.id}, ${product.name} (${quantity} adet)`);
        }
      }
    } catch (error) {
      console.error(`Hata: Kullanıcı için sepet öğeleri göç ettirilemedi (${user.id}):`, error);
    }
  }
  
  console.log('Sepet öğeleri göçü tamamlandı!');
};

// Değerlendirmeleri göç ettir
const migrateReviews = async () => {
  console.log('Değerlendirmeler göç ettiriliyor...');
  
  // Kullanıcıları al
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('role', 'user')
    .limit(5);
    
  if (!users || users.length === 0) {
    console.error('Hata: Değerlendirmeler için kullanıcı bulunamadı');
    return;
  }
  
  // Mağazaları al
  const { data: stores } = await supabaseAdmin
    .from('stores')
    .select('id, name')
    .limit(5);
    
  if (!stores || stores.length === 0) {
    console.error('Hata: Değerlendirmeler için mağaza bulunamadı');
    return;
  }
  
  // Ürünleri al
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, name')
    .limit(10);
    
  if (!products || products.length === 0) {
    console.error('Hata: Değerlendirmeler için ürün bulunamadı');
    return;
  }
  
  // Mağaza değerlendirmeleri ekle
  for (const store of stores) {
    try {
      // Her mağaza için 2-5 değerlendirme ekle
      const reviewCount = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < reviewCount; i++) {
        // Rastgele bir kullanıcı seç
        const user = users[Math.floor(Math.random() * users.length)];
        const rating = Math.floor(Math.random() * 3) + 3; // 3-5 arası puan
        
        const { error: reviewError } = await supabaseAdmin.from('store_reviews').insert({
          user_id: user.id,
          store_id: store.id,
          rating: rating,
          comment: `${store.name} için ${rating} yıldızlı değerlendirme.`,
          created_at: new Date().toISOString()
        });
        
        if (reviewError) {
          console.error(`Hata: Mağaza değerlendirmesi kaydedilemedi (${store.name}):`, reviewError);
        } else {
          console.log(`Mağaza değerlendirmesi göç ettirildi: ${store.name} (${rating} yıldız)`);
        }
      }
    } catch (error) {
      console.error(`Hata: Mağaza için değerlendirmeler göç ettirilemedi (${store.name}):`, error);
    }
  }
  
  // Ürün değerlendirmeleri ekle - 'product_reviews' değil 'reviews' tablosunu kullan
  for (const product of products) {
    try {
      // Her ürün için 1-3 değerlendirme ekle
      const reviewCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < reviewCount; i++) {
        // Rastgele bir kullanıcı seç
        const user = users[Math.floor(Math.random() * users.length)];
        const rating = Math.floor(Math.random() * 3) + 3; // 3-5 arası puan
        
        const { error: reviewError } = await supabaseAdmin.from('reviews').insert({
          user_id: user.id,
          product_id: product.id,
          rating: rating,
          comment: `${product.name} için ${rating} yıldızlı değerlendirme.`,
          created_at: new Date().toISOString()
        });
        
        if (reviewError) {
          console.error(`Hata: Ürün değerlendirmesi kaydedilemedi (${product.name}):`, reviewError);
        } else {
          console.log(`Ürün değerlendirmesi göç ettirildi: ${product.name} (${rating} yıldız)`);
        }
      }
    } catch (error) {
      console.error(`Hata: Ürün için değerlendirmeler göç ettirilemedi (${product.name}):`, error);
    }
  }
  
  console.log('Değerlendirmeler göçü tamamlandı!');
};

// Tüm veri göçünü gerçekleştir
const migrateAllData = async () => {
  try {
    console.log('Veri göçü başlatılıyor...');
    
    await migrateUsers();
    await migrateStores();
    await migrateProducts();
    await migrateOrders();
    await migrateCampaigns();
    await migrateCartItems();
    await migrateReviews();
    
    console.log('Veri göçü başarıyla tamamlandı!');
    return { success: true };
  } catch (error) {
    console.error('Veri göçü sırasında hata oluştu:', error);
    return { success: false, error };
  }
};

// Browser ortamında kullanım için fonksiyonları dışa aktar
export {
  migrateUsers,
  migrateStores,
  migrateProducts,
  migrateOrders,
  migrateCampaigns,
  migrateCartItems,
  migrateReviews,
  migrateAllData
}; 