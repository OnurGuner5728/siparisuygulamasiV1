/**
 * Veritabanı Geçişi İçin Yardımcı Fonksiyonlar
 * Bu dosya, mock verilerden gerçek veritabanına geçiş yaparken kullanılabilecek
 * yardımcı fonksiyonları içerir.
 */

const { mockOrders, mockStores, mockUsers, mockAddresses, mockProducts } = require('./src/app/data/mockdatas');

/**
 * Sipariş verilerini normalize eder ve ayrı tablolar için veri hazırlar
 * @returns {Object} Normalize edilmiş sipariş ve sipariş ürünleri tabloları
 */
function normalizeOrdersData() {
  const orders = [];
  const orderItems = [];
  const orderStatusHistory = [];
  
  mockOrders.forEach(order => {
    // Ana sipariş verisini hazırla
    const normalizedOrder = {
      id: order.id,
      customerId: order.customerId,
      storeId: order.storeId,
      categoryId: order.categoryId,
      status: order.status,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      discount: order.discount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveryAddressId: order.deliveryAddressId
    };
    
    orders.push(normalizedOrder);
    
    // Sipariş ürünlerini ayrı tabloya hazırla
    if (Array.isArray(order.items)) {
      order.items.forEach(item => {
        const normalizedItem = {
          id: item.id,
          orderId: order.id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          notes: item.notes
        };
        
        orderItems.push(normalizedItem);
      });
    }
    
    // Sipariş durum geçmişini ayrı tabloya hazırla
    if (Array.isArray(order.statusHistory)) {
      order.statusHistory.forEach((statusItem, index) => {
        const historyItem = {
          id: order.id * 100 + index, // Geçici bir ID oluştur
          orderId: order.id,
          status: statusItem.status,
          timestamp: statusItem.timestamp,
          note: statusItem.note
        };
        
        orderStatusHistory.push(historyItem);
      });
    }
  });
  
  return { orders, orderItems, orderStatusHistory };
}

/**
 * Mağaza çalışma saatlerini normalize eder
 * @returns {Array} Normalize edilmiş çalışma saatleri
 */
function normalizeStoreWorkingHours() {
  const workingHours = [];
  
  mockStores.forEach(store => {
    if (store.workingHours) {
      const days = Object.keys(store.workingHours);
      
      days.forEach((day, index) => {
        const hours = store.workingHours[day];
        if (hours) {
          workingHours.push({
            id: (store.id * 100) + index,
            storeId: store.id,
            dayOfWeek: day,
            openingTime: hours.open,
            closingTime: hours.close,
            isClosed: false
          });
        }
      });
    }
  });
  
  return workingHours;
}

/**
 * Modül izinlerini normalize eder
 * @returns {Object} Modüller ve izinler tabloları
 */
function normalizeModulePermissions() {
  // Önce modülleri tanımla
  const modules = [
    { id: 1, name: 'yemek', parentId: null },
    { id: 2, name: 'market', parentId: null },
    { id: 3, name: 'su', parentId: null },
    { id: 4, name: 'aktuel', parentId: null },
    { id: 5, name: 'kampanya', parentId: null }
  ];
  
  // İzin tiplerini tanımla
  const permissions = [
    { id: 1, name: 'access', description: 'Modüle erişim' },
    { id: 2, name: 'view', description: 'İçeriği görüntüleme' },
    { id: 3, name: 'create', description: 'Yeni içerik oluşturma' },
    { id: 4, name: 'admin', description: 'Yönetici yetkileri' }
  ];
  
  const entityPermissions = [];
  let permissionId = 1;
  
  // Kullanıcı izinlerini ekle
  mockUsers.forEach(user => {
    if (user.modulePermissions) {
      // Temel modül izinleri
      Object.keys(user.modulePermissions).forEach(moduleName => {
        if (moduleName !== 'kampanya') {
          const moduleValue = user.modulePermissions[moduleName];
          
          if (typeof moduleValue === 'boolean') {
            // Modül erişim izni
            const module = modules.find(m => m.name === moduleName);
            
            if (module) {
              entityPermissions.push({
                id: permissionId++,
                entityType: 'user',
                entityId: user.id,
                moduleId: module.id,
                permissionId: 1, // access
                isGranted: moduleValue
              });
            }
          }
        }
      });
      
      // Kampanya modülü özel izinleri
      if (user.modulePermissions.kampanya) {
        const kampanyaModule = modules.find(m => m.name === 'kampanya');
        
        if (kampanyaModule) {
          // Görüntüleme izni
          if (typeof user.modulePermissions.kampanya.view === 'boolean') {
            entityPermissions.push({
              id: permissionId++,
              entityType: 'user',
              entityId: user.id,
              moduleId: kampanyaModule.id,
              permissionId: 2, // view
              isGranted: user.modulePermissions.kampanya.view
            });
          }
          
          // Oluşturma izni
          if (typeof user.modulePermissions.kampanya.create === 'boolean') {
            entityPermissions.push({
              id: permissionId++,
              entityType: 'user',
              entityId: user.id,
              moduleId: kampanyaModule.id,
              permissionId: 3, // create
              isGranted: user.modulePermissions.kampanya.create
            });
          }
          
          // Admin izni
          if (typeof user.modulePermissions.kampanya.admin === 'boolean') {
            entityPermissions.push({
              id: permissionId++,
              entityType: 'user',
              entityId: user.id,
              moduleId: kampanyaModule.id,
              permissionId: 4, // admin
              isGranted: user.modulePermissions.kampanya.admin
            });
          }
        }
      }
    }
  });
  
  // Mağaza izinlerini ekle
  mockStores.forEach(store => {
    if (store.modulePermissions) {
      // Aynı işlemleri mağazalar için de yap
      // (kullanıcılarla aynı mantık)
      Object.keys(store.modulePermissions).forEach(moduleName => {
        if (moduleName !== 'kampanya') {
          const moduleValue = store.modulePermissions[moduleName];
          
          if (typeof moduleValue === 'boolean') {
            const module = modules.find(m => m.name === moduleName);
            
            if (module) {
              entityPermissions.push({
                id: permissionId++,
                entityType: 'store',
                entityId: store.id,
                moduleId: module.id,
                permissionId: 1, // access
                isGranted: moduleValue
              });
            }
          }
        }
      });
      
      // Kampanya modülü özel izinleri
      if (store.modulePermissions.kampanya) {
        const kampanyaModule = modules.find(m => m.name === 'kampanya');
        
        if (kampanyaModule) {
          if (typeof store.modulePermissions.kampanya.view === 'boolean') {
            entityPermissions.push({
              id: permissionId++,
              entityType: 'store',
              entityId: store.id,
              moduleId: kampanyaModule.id,
              permissionId: 2, // view
              isGranted: store.modulePermissions.kampanya.view
            });
          }
          
          if (typeof store.modulePermissions.kampanya.create === 'boolean') {
            entityPermissions.push({
              id: permissionId++,
              entityType: 'store',
              entityId: store.id,
              moduleId: kampanyaModule.id,
              permissionId: 3, // create
              isGranted: store.modulePermissions.kampanya.create
            });
          }
        }
      }
    }
  });
  
  return { modules, permissions, entityPermissions };
}

/**
 * Kullanıcı adres bilgilerini normalize eder
 * @returns {Array} Normalize edilmiş adres verileri
 */
function normalizeAddresses() {
  // mockAddresses zaten normalize edilmiş yapıda, sadece alan adlarını değiştir
  return mockAddresses.map(address => ({
    id: address.id,
    userId: address.userId,
    title: address.title,
    type: address.type,
    fullName: address.fullName,
    phone: address.phone,
    city: address.city,
    district: address.district,
    neighborhood: address.neighborhood,
    fullAddress: address.fullAddress,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
    createdAt: address.createdAt
  }));
}

/**
 * Tüm normalize fonksiyonları çalıştır ve sonuçları döndür
 * @returns {Object} Tüm normalize edilmiş veriler
 */
function migrateAllData() {
  const { orders, orderItems, orderStatusHistory } = normalizeOrdersData();
  const workingHours = normalizeStoreWorkingHours();
  const { modules, permissions, entityPermissions } = normalizeModulePermissions();
  const addresses = normalizeAddresses();
  
  return {
    orders,
    orderItems,
    orderStatusHistory,
    workingHours,
    modules,
    permissions,
    entityPermissions,
    addresses
  };
}

// Standart sipariş durumları için referans verileri
const standardOrderStatuses = [
  { id: 'pending', name: 'Beklemede', description: 'Henüz işleme alınmamış sipariş', color: 'bg-yellow-100 text-yellow-800', orderIndex: 1 },
  { id: 'processing', name: 'İşleniyor', description: 'Hazırlanma aşamasında', color: 'bg-blue-100 text-blue-800', orderIndex: 2 },
  { id: 'shipping', name: 'Yolda', description: 'Teslimat aşamasında', color: 'bg-purple-100 text-purple-800', orderIndex: 3 },
  { id: 'delivered', name: 'Teslim Edildi', description: 'Müşteriye teslim edilmiş', color: 'bg-green-100 text-green-800', orderIndex: 4 },
  { id: 'cancelled', name: 'İptal Edildi', description: 'Müşteri veya mağaza tarafından iptal edilmiş', color: 'bg-red-100 text-red-800', orderIndex: 5 }
];

// Eski sipariş durumlarını yeni formatla eşleştirecek mapping
const mapOldStatusToNew = {
  'pending': 'pending',
  'in_progress': 'processing',
  'preparing': 'processing',
  'onway': 'shipping',
  'delivered': 'delivered',
  'cancelled': 'cancelled'
};

// Örnek kullanım
module.exports = {
  normalizeOrdersData,
  normalizeStoreWorkingHours,
  normalizeModulePermissions,
  normalizeAddresses,
  migrateAllData,
  standardOrderStatuses,
  mapOldStatusToNew
}; 