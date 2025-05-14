// Mock sipariş verileri
export const mockOrders = [
  {
    id: 1001,
    customerId: 5,
    customerName: 'Ahmet Yılmaz',
    customerPhone: '0555 111 2233',
    customerEmail: 'ahmet@example.com',
    storeId: 1,
    storeName: 'Kebapçı Ahmet',
    storePhone: '0505 333 4455',
    category: 'Yemek',
    status: 'delivered',
    orderDate: '2023-05-20T10:30:00',
    deliveryDate: '2023-05-20T11:15:00',
    subtotal: 135.00,
    deliveryFee: 15.75,
    total: 150.75,
    discount: 0,
    itemCount: 2,
    paymentMethod: 'online',
    paymentStatus: 'paid',
    deliveryAddress: {
      fullName: 'Ahmet Yılmaz',
      phone: '0555 111 2233',
      city: 'İstanbul',
      district: 'Kadıköy',
      neighborhood: 'Göztepe',
      fullAddress: 'Örnek Sokak No:1 D:5'
    },
    items: [
      {
        id: 1,
        name: 'Adana Kebap',
        quantity: 1,
        price: 120.00,
        total: 120.00,
        notes: 'Acılı olsun'
      },
      {
        id: 2,
        name: 'Ayran',
        quantity: 1,
        price: 15.00,
        total: 15.00,
        notes: ''
      }
    ],
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2023-05-20T10:30:00',
        note: 'Sipariş alındı'
      },
      {
        status: 'in_progress',
        timestamp: '2023-05-20T10:35:00',
        note: 'Mağaza tarafından onaylandı'
      },
      {
        status: 'in_progress',
        timestamp: '2023-05-20T10:50:00',
        note: 'Sipariş hazırlanıyor'
      },
      {
        status: 'in_progress',
        timestamp: '2023-05-20T11:00:00',
        note: 'Kurye yola çıktı'
      },
      {
        status: 'delivered',
        timestamp: '2023-05-20T11:15:00',
        note: 'Sipariş teslim edildi'
      }
    ]
  },
  {
    id: 1002,
    customerId: 8,
    customerName: 'Mehmet Kaya',
    customerPhone: '0533 222 5566',
    customerEmail: 'mehmet@example.com',
    storeId: 2,
    storeName: 'Süper Market',
    storePhone: '0532 444 7788',
    category: 'Market',
    status: 'in_progress',
    orderDate: '2023-05-21T14:45:00',
    deliveryDate: null,
    subtotal: 220.50,
    deliveryFee: 15.00,
    total: 235.50,
    discount: 0,
    itemCount: 3,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    deliveryAddress: {
      fullName: 'Mehmet Kaya',
      phone: '0533 222 5566',
      city: 'İstanbul',
      district: 'Beşiktaş',
      neighborhood: 'Levent',
      fullAddress: 'Yeni Cad. No:12 D:8'
    },
    items: [
      {
        id: 5,
        name: 'Dana Kıyma',
        quantity: 1,
        price: 180.00,
        total: 180.00,
        notes: ''
      },
      {
        id: 8,
        name: 'Ekmek',
        quantity: 2,
        price: 7.50,
        total: 15.00,
        notes: 'Taze olsun'
      },
      {
        id: 9,
        name: 'Yumurta (10\'lu)',
        quantity: 1,
        price: 25.50,
        total: 25.50,
        notes: ''
      }
    ],
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2023-05-21T14:45:00',
        note: 'Sipariş alındı'
      },
      {
        status: 'in_progress',
        timestamp: '2023-05-21T14:50:00',
        note: 'Mağaza tarafından onaylandı'
      },
      {
        status: 'in_progress',
        timestamp: '2023-05-21T15:05:00',
        note: 'Sipariş hazırlanıyor'
      }
    ]
  },
  {
    id: 1003,
    customerId: 6,
    customerName: 'Zeynep Demir',
    customerPhone: '0544 333 7788',
    customerEmail: 'zeynep@example.com',
    storeId: 3,
    storeName: 'Damacana Su',
    storePhone: '0534 555 9900',
    category: 'Su',
    status: 'delivered',
    orderDate: '2023-05-19T09:15:00',
    deliveryDate: '2023-05-19T10:00:00',
    subtotal: 40.00,
    deliveryFee: 10.00,
    total: 30.00,
    discount: 20.00,
    itemCount: 1,
    paymentMethod: 'online',
    paymentStatus: 'paid',
    deliveryAddress: {
      fullName: 'Zeynep Demir',
      phone: '0544 333 7788',
      city: 'İstanbul',
      district: 'Ataşehir',
      neighborhood: 'Atatürk',
      fullAddress: 'Çamlık Sok. No:5 D:3'
    },
    items: [
      {
        id: 7,
        name: '19L Su',
        quantity: 1,
        price: 40.00,
        total: 40.00,
        notes: 'Kapıya bırakın'
      }
    ],
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2023-05-19T09:15:00',
        note: 'Sipariş alındı'
      },
      {
        status: 'in_progress',
        timestamp: '2023-05-19T09:20:00',
        note: 'Mağaza tarafından onaylandı'
      },
      {
        status: 'delivered',
        timestamp: '2023-05-19T10:00:00',
        note: 'Sipariş teslim edildi'
      }
    ]
  },
  {
    id: 1004,
    customerId: 7,
    customerName: 'Ali Öztürk',
    customerPhone: '0555 777 8899',
    customerEmail: 'ali@example.com',
    storeId: 8,
    storeName: 'Aktüel Ürünler',
    storePhone: '0532 111 2233',
    category: 'Aktüel',
    status: 'cancelled',
    orderDate: '2023-05-18T16:45:00',
    deliveryDate: null,
    subtotal: 450.25,
    deliveryFee: 0,
    total: 450.25,
    discount: 0,
    itemCount: 2,
    paymentMethod: 'online',
    paymentStatus: 'refunded',
    deliveryAddress: {
      fullName: 'Ali Öztürk',
      phone: '0555 777 8899',
      city: 'İstanbul',
      district: 'Üsküdar',
      neighborhood: 'Acıbadem',
      fullAddress: 'Örnek Sok. No:22 D:8'
    },
    items: [
      {
        id: 10,
        name: 'Elektrikli Süpürge',
        quantity: 1,
        price: 399.99,
        total: 399.99,
        notes: ''
      },
      {
        id: 11,
        name: 'Tost Makinesi',
        quantity: 1,
        price: 50.26,
        total: 50.26,
        notes: ''
      }
    ],
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2023-05-18T16:45:00',
        note: 'Sipariş alındı'
      },
      {
        status: 'cancelled',
        timestamp: '2023-05-18T17:30:00',
        note: 'Stokta ürün kalmadığı için iptal edildi'
      }
    ]
  },
  {
    id: 1005,
    customerId: 5,
    customerName: 'Ahmet Yılmaz',
    customerPhone: '0555 111 2233',
    customerEmail: 'ahmet@example.com',
    storeId: 6,
    storeName: 'Lezzetli Burger',
    storePhone: '0544 888 9977',
    category: 'Yemek',
    status: 'pending',
    orderDate: '2023-05-21T19:30:00',
    deliveryDate: null,
    subtotal: 85.50,
    deliveryFee: 0.00,
    total: 85.50,
    discount: 0,
    itemCount: 2,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    deliveryAddress: {
      fullName: 'Ahmet Yılmaz',
      phone: '0555 111 2233',
      city: 'İstanbul',
      district: 'Kadıköy',
      neighborhood: 'Göztepe',
      fullAddress: 'Örnek Sokak No:1 D:5'
    },
    items: [
      {
        id: 12,
        name: 'Cheeseburger',
        quantity: 1,
        price: 65.50,
        total: 65.50,
        notes: 'Soğan olmasın'
      },
      {
        id: 13,
        name: 'Kola',
        quantity: 1,
        price: 20.00,
        total: 20.00,
        notes: ''
      }
    ],
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2023-05-21T19:30:00',
        note: 'Sipariş alındı'
      }
    ]
  }
];

// Mağaza paneli için sipariş verileri (farklı format)
export const storeOrdersData = [
  {
    id: 1001,
    customer: {
      id: 5,
      name: 'Ahmet Yılmaz',
      phone: '0555 111 2233',
      address: 'Kadıköy, İstanbul',
      fullAddress: 'Göztepe Mah. Örnek Sokak No:1 D:5 Kadıköy/İstanbul'
    },
    items: [
      { id: 1, name: 'Adana Kebap', price: 120, quantity: 1, total: 120 },
      { id: 2, name: 'Ayran', price: 15, quantity: 1, total: 15 }
    ],
    status: 'preparing', // preparing, onway, delivered, cancelled
    statusHistory: [
      { status: 'preparing', date: '2023-05-20T10:30:00', note: 'Sipariş alındı' }
    ],
    total: 150.75,
    subtotal: 135.00,
    discount: 0,
    deliveryFee: 15.75,
    date: '2023-05-20T10:30:00',
    paymentMethod: 'card',
    notes: 'Acılı olsun',
    deliveryTime: '30-40 dk',
    estimatedDelivery: '2023-05-20T11:10:00'
  },
  {
    id: 1002,
    customer: {
      id: 8,
      name: 'Mehmet Kaya',
      phone: '0533 222 5566',
      address: 'Beşiktaş, İstanbul',
      fullAddress: 'Levent Mah. Yeni Cad. No:12 D:8 Beşiktaş/İstanbul'
    },
    items: [
      { id: 5, name: 'Dana Kıyma', price: 180, quantity: 1, total: 180 },
      { id: 8, name: 'Ekmek', price: 7.50, quantity: 2, total: 15 },
      { id: 9, name: 'Yumurta (10\'lu)', price: 25.50, quantity: 1, total: 25.50 }
    ],
    status: 'onway',
    statusHistory: [
      { status: 'preparing', date: '2023-05-21T14:45:00', note: 'Sipariş alındı' },
      { status: 'onway', date: '2023-05-21T15:05:00', note: 'Kurye yola çıktı' }
    ],
    total: 235.50,
    subtotal: 220.50,
    discount: 0,
    deliveryFee: 15.00,
    date: '2023-05-21T14:45:00',
    paymentMethod: 'cash',
    notes: 'Taze olsun',
    deliveryTime: '20-30 dk',
    estimatedDelivery: '2023-05-21T15:15:00'
  },
  {
    id: 1003,
    customer: {
      id: 6,
      name: 'Zeynep Demir',
      phone: '0544 333 7788',
      address: 'Ataşehir, İstanbul',
      fullAddress: 'Atatürk Mah. Çamlık Sok. No:5 D:3 Ataşehir/İstanbul'
    },
    items: [
      { id: 7, name: '19L Su', price: 40, quantity: 1, total: 40 }
    ],
    status: 'delivered',
    statusHistory: [
      { status: 'preparing', date: '2023-05-19T09:15:00', note: 'Sipariş alındı' },
      { status: 'onway', date: '2023-05-19T09:30:00', note: 'Kurye yola çıktı' },
      { status: 'delivered', date: '2023-05-19T10:00:00', note: 'Sipariş teslim edildi' }
    ],
    total: 30.00,
    subtotal: 40.00,
    discount: 20.00,
    deliveryFee: 10.00,
    date: '2023-05-19T09:15:00',
    paymentMethod: 'card',
    notes: 'Kapıya bırakın',
    deliveryTime: '30-45 dk',
    estimatedDelivery: '2023-05-19T10:00:00'
  }
];

// Mock mağaza verileri - Tüm uygulamada kullanılacak ortak veri
export const mockStores = [
  {
    id: 1,
    name: 'Kebapçı Ahmet',
    ownerName: 'Ahmet Yılmaz',
    email: 'kebapci@example.com',
    phone: '0505 333 4455',
    category: 'Yemek',
    description: 'En lezzetli kebaplar',
    address: 'Bağdat Cad. No:123 Kadıköy/İstanbul',
    rating: 4.7,
    status: 'active',
    approved: true,
    registrationDate: '2023-03-10',
    ordersCount: 230,
    totalRevenue: 25800.50,
    averageOrderValue: 112.18,
    modulePermissions: {
      yemek: true,
      market: false,
      su: false,
      aktuel: true
    },
    workingHours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' }
    },
    menu: [
      { id: 1, name: 'Adana Kebap', price: 120.00, category: 'Ana Yemek' },
      { id: 2, name: 'Urfa Kebap', price: 110.00, category: 'Ana Yemek' },
      { id: 3, name: 'Tavuk Şiş', price: 95.00, category: 'Ana Yemek' },
      { id: 4, name: 'Lahmacun', price: 35.00, category: 'Ara Sıcak' },
      { id: 5, name: 'Ayran', price: 15.00, category: 'İçecek' },
      { id: 6, name: 'Künefe', price: 60.00, category: 'Tatlı' }
    ]
  },
  {
    id: 2,
    name: 'Süper Market',
    ownerName: 'Mehmet Demir',
    email: 'market@example.com',
    phone: '0544 444 5566',
    category: 'Market',
    description: 'Her türlü ürünü bulabileceğiniz market',
    address: 'İstiklal Cad. No:45 Beyoğlu/İstanbul',
    rating: 4.3,
    status: 'active',
    approved: true,
    registrationDate: '2023-02-05',
    ordersCount: 480,
    totalRevenue: 76500.25,
    averageOrderValue: 159.38,
    modulePermissions: {
      yemek: false,
      market: true,
      su: false,
      aktuel: true
    },
    workingHours: {
      monday: { open: '08:00', close: '23:00' },
      tuesday: { open: '08:00', close: '23:00' },
      wednesday: { open: '08:00', close: '23:00' },
      thursday: { open: '08:00', close: '23:00' },
      friday: { open: '08:00', close: '23:00' },
      saturday: { open: '08:00', close: '23:00' },
      sunday: { open: '09:00', close: '22:00' }
    },
    products: [
      { id: 1, name: 'Süt (1L)', price: 28.90, category: 'Süt Ürünleri' },
      { id: 2, name: 'Ekmek', price: 7.50, category: 'Fırın' },
      { id: 3, name: 'Yumurta (10\'lu)', price: 45.00, category: 'Kahvaltılık' },
      { id: 4, name: 'Dana Kıyma (kg)', price: 350.00, category: 'Et Ürünleri' },
      { id: 5, name: 'Elma (kg)', price: 30.00, category: 'Meyve' },
      { id: 6, name: 'Çay (1kg)', price: 120.00, category: 'İçecek' }
    ]
  },
  {
    id: 3,
    name: 'Damacana Su',
    email: 'su@example.com',
    phone: '0532 222 3344',
    category: 'Su',
    description: 'Sağlıklı ve temiz içme suyu',
    address: 'Atatürk Cad. No:78 Ataşehir/İstanbul',
    rating: 4.5,
    status: 'active',
    approved: true,
    registrationDate: '2023-04-20',
    ordersCount: 150,
    totalRevenue: 12000.00,
    modulePermissions: {
      yemek: false,
      market: false,
      su: true,
      aktuel: false
    }
  },
  {
    id: 4,
    name: 'Yeni Pizza',
    email: 'pizza@example.com',
    phone: '0555 666 7788',
    category: 'Yemek',
    description: 'Özel tariflerle pizza çeşitleri',
    rating: 0,
    status: 'pending',
    approved: false,
    registrationDate: '2023-05-15',
    ordersCount: 0,
    totalRevenue: 0,
    modulePermissions: {
      yemek: true,
      market: false,
      su: false,
      aktuel: false
    }
  },
  {
    id: 5,
    name: 'Organik Market',
    email: 'organik@example.com',
    phone: '0533 777 8899',
    category: 'Market',
    description: 'Organik ürünler satan market',
    rating: 4.8,
    status: 'active',
    approved: true,
    registrationDate: '2023-01-12',
    ordersCount: 350,
    totalRevenue: 52000.75,
    modulePermissions: {
      yemek: false,
      market: true,
      su: false,
      aktuel: true
    }
  },
  {
    id: 6,
    name: 'Lezzetli Burger',
    email: 'burger@example.com',
    phone: '0545 888 9900',
    category: 'Yemek',
    description: 'Enfes burgerler',
    rating: 4.2,
    status: 'active',
    approved: true,
    registrationDate: '2023-02-28',
    ordersCount: 280,
    totalRevenue: 34500.50,
    modulePermissions: {
      yemek: true,
      market: false,
      su: false,
      aktuel: true
    }
  },
  {
    id: 7,
    name: 'Şişe Su Dağıtım',
    email: 'siseSu@example.com',
    phone: '0536 999 0011',
    category: 'Su',
    description: 'Şişe su dağıtım hizmeti',
    rating: 0,
    status: 'pending',
    approved: false,
    registrationDate: '2023-05-25',
    ordersCount: 0,
    totalRevenue: 0,
    modulePermissions: {
      yemek: false,
      market: false,
      su: true,
      aktuel: false
    }
  },
  {
    id: 8,
    name: 'Aktüel Ürünler',
    email: 'aktuel@example.com',
    phone: '0556 000 1122',
    category: 'Aktüel',
    description: 'Haftalık özel aktüel ürünler',
    rating: 4.0,
    status: 'inactive',
    approved: true,
    registrationDate: '2023-03-05',
    ordersCount: 120,
    totalRevenue: 18000.00,
    modulePermissions: {
      yemek: false,
      market: false,
      su: false,
      aktuel: true
    }
  }
];

// Mock ürün verileri
export const mockProducts = [
  {
    id: 1,
    name: 'Adana Kebap',
    description: 'Lezzetli Adana kebap',
    price: 120.00,
    storeId: 1,
    storeName: 'Kebapçı Ahmet',
    category: 'Ana Yemekler',
    mainCategory: 'Yemek',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.8,
    reviewCount: 120,
    createdAt: '2023-01-15'
  },
  {
    id: 2,
    name: 'Urfa Kebap',
    description: 'Lezzetli Urfa kebap',
    price: 110.00,
    storeId: 1,
    storeName: 'Kebapçı Ahmet',
    category: 'Ana Yemekler',
    mainCategory: 'Yemek',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.7,
    reviewCount: 95,
    createdAt: '2023-01-20'
  },
  {
    id: 3,
    name: 'Ayran',
    description: 'Soğuk ayran',
    price: 15.00,
    storeId: 1,
    storeName: 'Kebapçı Ahmet',
    category: 'İçecekler',
    mainCategory: 'Yemek',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.5,
    reviewCount: 80,
    createdAt: '2023-01-25'
  },
  {
    id: 4,
    name: 'Tavuk Döner',
    description: 'Lezzetli tavuk döner',
    price: 85.00,
    storeId: 6,
    storeName: 'Lezzetli Burger',
    category: 'Ana Yemekler',
    mainCategory: 'Yemek',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.6,
    reviewCount: 110,
    createdAt: '2023-02-05'
  },
  {
    id: 5,
    name: 'Dana Kıyma',
    description: '500g dana kıyma',
    price: 180.00,
    storeId: 2,
    storeName: 'Süper Market',
    category: 'Et Ürünleri',
    mainCategory: 'Market',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.4,
    reviewCount: 65,
    createdAt: '2023-02-10'
  },
  {
    id: 6,
    name: 'Salkım Domates',
    description: '1kg salkım domates',
    price: 45.00,
    storeId: 5,
    storeName: 'Organik Market',
    category: 'Meyve Sebze',
    mainCategory: 'Market',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.3,
    reviewCount: 58,
    createdAt: '2023-02-15'
  },
  {
    id: 7,
    name: '19L Su',
    description: '19 litre damacana su',
    price: 40.00,
    storeId: 3,
    storeName: 'Damacana Su',
    category: 'İçme Suyu',
    mainCategory: 'Su',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.5,
    reviewCount: 72,
    createdAt: '2023-03-01'
  },
  {
    id: 8,
    name: 'Akıllı Saat',
    description: 'Çok fonksiyonlu akıllı saat',
    price: 2500.00,
    storeId: 8,
    storeName: 'Aktüel Ürünler',
    category: 'Elektronik',
    mainCategory: 'Aktüel',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.2,
    reviewCount: 45,
    createdAt: '2023-03-10'
  }
];

// Mock kullanıcı verileri
export const mockUsers = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '0555 111 2233',
    role: 'user',
    status: 'active',
    registrationDate: '2023-02-15',
    lastLogin: '2023-05-20T14:30:00',
    ordersCount: 12,
    activeOrder: 1,
    totalSpent: 2450.75,
    addresses: [
      {
        id: 1,
        title: 'Ev',
        fullName: 'Ahmet Yılmaz',
        phone: '0555 111 2233',
        city: 'İstanbul',
        district: 'Kadıköy',
        neighborhood: 'Göztepe',
        fullAddress: 'Örnek Sokak No:1 D:5',
        isDefault: true
      },
      {
        id: 2,
        title: 'İş',
        fullName: 'Ahmet Yılmaz',
        phone: '0555 111 2233',
        city: 'İstanbul',
        district: 'Şişli',
        neighborhood: 'Mecidiyeköy',
        fullAddress: 'İş Merkezi No:10 Kat:5',
        isDefault: false
      }
    ],
    modulePermissions: {
      yemek: true,
      market: true,
      su: true,
      aktuel: false
    }
  },
  {
    id: 2,
    name: 'Admin Kullanıcı',
    email: 'admin@example.com',
    phone: '0532 222 3344',
    role: 'admin',
    status: 'active',
    registrationDate: '2023-01-01',
    lastLogin: '2023-05-21T08:15:00',
    ordersCount: 0,
    activeOrder: 0,
    totalSpent: 0,
    addresses: [],
    modulePermissions: {
      yemek: true,
      market: true,
      su: true,
      aktuel: true
    }
  },
  {
    id: 3,
    name: 'Kebapçı Ahmet',
    email: 'kebapci@example.com',
    phone: '0505 333 4455',
    role: 'store',
    status: 'active',
    registrationDate: '2023-03-10',
    lastLogin: '2023-05-20T22:10:00',
    ordersCount: 0,
    activeOrder: 0,
    totalSpent: 0,
    addresses: [],
    modulePermissions: {
      yemek: true,
      market: false,
      su: false,
      aktuel: true
    }
  },
  {
    id: 4,
    name: 'Yeni Mağaza',
    email: 'store@example.com',
    phone: '0544 444 5566',
    role: 'store',
    status: 'pending',
    registrationDate: '2023-05-20',
    lastLogin: '2023-05-20T09:45:00',
    ordersCount: 0,
    activeOrder: 0,
    totalSpent: 0,
    addresses: [],
    modulePermissions: {
      yemek: false,
      market: true,
      su: false,
      aktuel: false
    }
  },
  {
    id: 5,
    name: 'Ayşe Demir',
    email: 'ayse@example.com',
    phone: '0533 555 6677',
    role: 'user',
    status: 'active',
    registrationDate: '2023-04-05',
    lastLogin: '2023-05-18T16:25:00',
    ordersCount: 8,
    activeOrder: 0,
    totalSpent: 1280.50,
    addresses: [
      {
        id: 1,
        title: 'Ev',
        fullName: 'Ayşe Demir',
        phone: '0533 555 6677',
        city: 'İstanbul',
        district: 'Beylikdüzü',
        neighborhood: 'Adnan Kahveci',
        fullAddress: 'Çiçek Sokak No:15 D:8',
        isDefault: true
      }
    ],
    modulePermissions: {
      yemek: true,
      market: true,
      su: true,
      aktuel: true
    }
  },
  {
    id: 6,
    name: 'Mehmet Kaya',
    email: 'mehmet@example.com',
    phone: '0554 666 7788',
    role: 'user',
    status: 'active',
    registrationDate: '2023-03-22',
    lastLogin: '2023-05-19T11:30:00',
    ordersCount: 15,
    activeOrder: 1,
    totalSpent: 3450.25,
    addresses: [
      {
        id: 1,
        title: 'Ev',
        fullName: 'Mehmet Kaya',
        phone: '0554 666 7788',
        city: 'İstanbul',
        district: 'Beşiktaş',
        neighborhood: 'Levent',
        fullAddress: 'Yeni Cad. No:12 D:8',
        isDefault: true
      }
    ],
    modulePermissions: {
      yemek: true,
      market: true,
      su: false,
      aktuel: false
    }
  },
  {
    id: 7,
    name: 'Zeynep Şahin',
    email: 'zeynep@example.com',
    phone: '0535 777 8899',
    role: 'user',
    status: 'inactive',
    registrationDate: '2023-02-28',
    lastLogin: '2023-05-01T09:15:00',
    ordersCount: 3,
    activeOrder: 0,
    totalSpent: 450.00,
    addresses: [],
    modulePermissions: {
      yemek: true,
      market: true,
      su: true,
      aktuel: true
    }
  },
  {
    id: 8,
    name: 'Ali Yıldız',
    email: 'ali@example.com',
    phone: '0545 888 9900',
    role: 'user',
    status: 'active',
    registrationDate: '2023-01-15',
    lastLogin: '2023-05-20T18:40:00',
    ordersCount: 20,
    activeOrder: 0,
    totalSpent: 4750.80,
    addresses: [
      {
        id: 1,
        title: 'Ev',
        fullName: 'Ali Yıldız',
        phone: '0545 888 9900',
        city: 'İstanbul',
        district: 'Üsküdar',
        neighborhood: 'Acıbadem',
        fullAddress: 'Örnek Sok. No:22 D:8',
        isDefault: true
      }
    ],
    modulePermissions: {
      yemek: true,
      market: true,
      su: true,
      aktuel: true
    }
  },
  {
    id: 9,
    name: 'Restoran A',
    email: 'restaurant@example.com',
    phone: '0536 999 0011',
    role: 'store',
    status: 'active',
    registrationDate: '2023-04-18',
    lastLogin: '2023-05-20T21:10:00',
    ordersCount: 0,
    activeOrder: 0,
    totalSpent: 0,
    addresses: [],
    modulePermissions: {
      yemek: true,
      market: false,
      su: false,
      aktuel: false
    }
  },
  {
    id: 10,
    name: 'Market B',
    email: 'market@example.com',
    phone: '0556 000 1122',
    role: 'store',
    status: 'pending',
    registrationDate: '2023-05-12',
    lastLogin: '2023-05-12T10:20:00',
    ordersCount: 0,
    activeOrder: 0,
    totalSpent: 0,
    addresses: [],
    modulePermissions: {
      yemek: false,
      market: true,
      su: false,
      aktuel: false
    }
  },
  {
    id: 11,
    name: 'Gizem Öztürk',
    email: 'gizem@example.com',
    phone: '0537 111 2233',
    role: 'user',
    status: 'active',
    registrationDate: '2023-04-30',
    lastLogin: '2023-05-19T20:15:00',
    ordersCount: 5,
    activeOrder: 0,
    totalSpent: 880.25,
    addresses: [],
    modulePermissions: {
      yemek: true,
      market: true,
      su: true,
      aktuel: false
    }
  },
  {
    id: 12,
    name: 'Burak Koç',
    email: 'burak@example.com',
    phone: '0548 222 3344',
    role: 'user',
    status: 'inactive',
    registrationDate: '2023-03-15',
    lastLogin: '2023-04-25T14:30:00',
    ordersCount: 2,
    activeOrder: 0,
    totalSpent: 225.50,
    addresses: [],
    modulePermissions: {
      yemek: true,
      market: false,
      su: false,
      aktuel: false
    }
  }
];

// Mock kategori verileri
export const mockCategories = [
  {
    id: 1,
    name: 'Ana Yemekler',
    description: 'Tüm ana yemekler',
    mainCategory: 'Yemek',
    image: 'https://placehold.co/150',
    productsCount: 45,
    status: 'active',
    createdAt: '2023-01-10'
  },
  {
    id: 2,
    name: 'İçecekler',
    description: 'Tüm içecekler',
    mainCategory: 'Yemek',
    image: 'https://placehold.co/150',
    productsCount: 30,
    status: 'active',
    createdAt: '2023-01-12'
  },
  {
    id: 3,
    name: 'Yan Ürünler',
    description: 'Tüm yan ürünler',
    mainCategory: 'Yemek',
    image: 'https://placehold.co/150',
    productsCount: 25,
    status: 'active',
    createdAt: '2023-01-15'
  },
  {
    id: 4,
    name: 'Tatlılar',
    description: 'Tüm tatlılar',
    mainCategory: 'Yemek',
    image: 'https://placehold.co/150',
    productsCount: 20,
    status: 'active',
    createdAt: '2023-01-18'
  },
  {
    id: 5,
    name: 'Et Ürünleri',
    description: 'Tüm et ürünleri',
    mainCategory: 'Market',
    image: 'https://placehold.co/150',
    productsCount: 35,
    status: 'active',
    createdAt: '2023-02-05'
  },
  {
    id: 6,
    name: 'Meyve Sebze',
    description: 'Tüm meyve ve sebzeler',
    mainCategory: 'Market',
    image: 'https://placehold.co/150',
    productsCount: 40,
    status: 'active',
    createdAt: '2023-02-08'
  },
  {
    id: 7,
    name: 'Kahvaltılık',
    description: 'Tüm kahvaltılık ürünler',
    mainCategory: 'Market',
    image: 'https://placehold.co/150',
    productsCount: 25,
    status: 'active',
    createdAt: '2023-02-10'
  },
  {
    id: 8,
    name: 'İçme Suyu',
    description: 'Tüm içme suları',
    mainCategory: 'Su',
    image: 'https://placehold.co/150',
    productsCount: 15,
    status: 'active',
    createdAt: '2023-03-01'
  },
  {
    id: 9,
    name: 'Elektronik',
    description: 'Tüm elektronik ürünler',
    mainCategory: 'Aktüel',
    image: 'https://placehold.co/150',
    productsCount: 10,
    status: 'active',
    createdAt: '2023-03-10'
  },
  {
    id: 10,
    name: 'Ev Gereçleri',
    description: 'Tüm ev gereçleri',
    mainCategory: 'Aktüel',
    image: 'https://placehold.co/150',
    productsCount: 8,
    status: 'active',
    createdAt: '2023-03-15'
  }
];

// Ana kategoriler
export const mainCategories = [
  { id: 'Yemek', name: 'Yemek' },
  { id: 'Market', name: 'Market' },
  { id: 'Su', name: 'Su' },
  { id: 'Aktüel', name: 'Aktüel' }
];

// Restaurant verileri (Yemek sayfaları için)
export const mockRestaurants = [
  { 
    id: 1, 
    name: 'Kebapçı Ahmet', 
    image: '/restaurant1.jpg', 
    cuisine: 'Kebap', 
    rating: 4.5, 
    minOrder: 50, 
    deliveryTime: '30-45 dk', 
    isOpen: true,
    address: 'Bağdat Cad. No:123, İstanbul',
    description: 'En lezzetli Adana ve Urfa kebap çeşitleri. Tüm kebaplarımız odun ateşinde hazırlanmaktadır.',
    categories: ['Ana Yemekler', 'İçecekler', 'Tatlılar'],
    menu: [
      { id: 101, name: 'Adana Kebap', category: 'Ana Yemekler', price: 120, description: 'Acılı zırh kıyma kebabı', image: '/kebap1.jpg' },
      { id: 102, name: 'Urfa Kebap', category: 'Ana Yemekler', price: 110, description: 'Acısız zırh kıyma kebabı', image: '/kebap2.jpg' },
      { id: 103, name: 'Tavuk Şiş', category: 'Ana Yemekler', price: 95, description: 'Marine edilmiş tavuk şiş', image: '/kebap3.jpg' },
      { id: 104, name: 'Lahmacun', category: 'Ana Yemekler', price: 35, description: 'Acılı veya acısız', image: '/kebap4.jpg' },
      { id: 105, name: 'Ayran', category: 'İçecekler', price: 15, description: 'Ev yapımı ayran', image: '/icecek1.jpg' },
      { id: 106, name: 'Kola', category: 'İçecekler', price: 20, description: 'Kutu kola', image: '/icecek2.jpg' },
      { id: 107, name: 'Künefe', category: 'Tatlılar', price: 60, description: 'Özel peynirli künefe', image: '/tatli1.jpg' },
      { id: 108, name: 'Baklava', category: 'Tatlılar', price: 75, description: 'Fıstıklı baklava (4 dilim)', image: '/tatli2.jpg' },
    ]
  },
  { 
    id: 2, 
    name: 'Pizza Dünyası', 
    image: '/restaurant2.jpg', 
    cuisine: 'Pizza', 
    rating: 4.2, 
    minOrder: 60, 
    deliveryTime: '40-55 dk', 
    isOpen: true,
    address: 'İstiklal Cad. No:456, İstanbul',
    description: 'İtalyan usulü ince hamur pizzalar ve taze malzemelerle hazırlanan özel tarifler.',
    categories: ['Pizzalar', 'Makarnalar', 'İçecekler', 'Tatlılar'],
    menu: [
      { id: 201, name: 'Margarita Pizza', category: 'Pizzalar', price: 75, description: 'Domates sos, mozarella ve fesleğen', image: '/pizza1.jpg' },
      { id: 202, name: 'Karışık Pizza', category: 'Pizzalar', price: 95, description: 'Domates sos, mozarella, sosis, sucuk, mantar, biber ve zeytin', image: '/pizza2.jpg' },
      { id: 203, name: 'Dört Peynirli Pizza', category: 'Pizzalar', price: 90, description: 'Mozarella, parmesan, rokfor ve kaşar peyniri', image: '/pizza3.jpg' },
      { id: 204, name: 'Spagetti Bolonez', category: 'Makarnalar', price: 65, description: 'Bolonez soslu spagetti makarna', image: '/makarna1.jpg' },
      { id: 205, name: 'Fettuccine Alfredo', category: 'Makarnalar', price: 70, description: 'Krema soslu fettuccine makarna', image: '/makarna2.jpg' },
      { id: 206, name: 'Kola', category: 'İçecekler', price: 15, description: 'Soğuk kutu kola', image: '/icecek2.jpg' },
      { id: 207, name: 'Ayran', category: 'İçecekler', price: 10, description: 'Geleneksel Türk içeceği', image: '/icecek1.jpg' },
      { id: 208, name: 'Tiramisu', category: 'Tatlılar', price: 45, description: 'Geleneksel İtalyan tatlısı', image: '/tatli3.jpg' },
      { id: 209, name: 'Çikolatalı Sufle', category: 'Tatlılar', price: 40, description: 'Sıcak servis edilen özel çikolatalı sufle', image: '/tatli4.jpg' },
    ]
  },
  { 
    id: 3, 
    name: 'Sushi Express', 
    image: '/restaurant3.jpg', 
    cuisine: 'Japon', 
    rating: 4.7, 
    minOrder: 150, 
    deliveryTime: '45-60 dk', 
    isOpen: false,
    address: 'Nispetiye Cad. No:789, İstanbul',
    categories: ['Sushi', 'Çorbalar', 'İçecekler']
  },
  { 
    id: 4, 
    name: 'Burger House', 
    image: '/restaurant4.jpg', 
    cuisine: 'Hamburger', 
    rating: 4.3, 
    minOrder: 70, 
    deliveryTime: '25-40 dk', 
    isOpen: true,
    address: 'Bağdat Cad. No:101, İstanbul',
    categories: ['Burgerler', 'Yan Ürünler', 'İçecekler']
  },
  { 
    id: 5, 
    name: 'Köfteci Ramiz', 
    image: '/restaurant5.jpg', 
    cuisine: 'Türk', 
    rating: 4.6, 
    minOrder: 80, 
    deliveryTime: '30-45 dk', 
    isOpen: true,
    address: 'Kadıköy Meydan No:202, İstanbul',
    categories: ['Köfteler', 'Mezeler', 'İçecekler']
  },
  { 
    id: 6, 
    name: 'Çin Lokantası', 
    image: '/restaurant6.jpg', 
    cuisine: 'Çin', 
    rating: 4.1, 
    minOrder: 100, 
    deliveryTime: '40-55 dk', 
    isOpen: false,
    address: 'Barbaros Bulvarı No:303, İstanbul',
    categories: ['Çin Mutfağı', 'Pilavlar', 'İçecekler']
  }
];

// Market verileri
export const mockMarkets = [
  { 
    id: 1, 
    name: 'Süper Market',
    image: '/market1.jpg', 
    type: 'Süpermarket', 
    rating: 4.5, 
    minOrder: 100, 
    deliveryTime: '30-45 dk', 
    isOpen: true,
    address: 'Bağdat Cad. No:123, İstanbul'
  },
  { 
    id: 2, 
    name: 'Mini Market',
    image: '/market2.jpg', 
    type: 'Bakkal', 
    rating: 4.2, 
    minOrder: 50, 
    deliveryTime: '20-35 dk', 
    isOpen: true,
    address: 'İstiklal Cad. No:456, İstanbul'
  },
  { 
    id: 3, 
    name: 'Organik Pazar',
    image: '/market3.jpg', 
    type: 'Organik Market', 
    rating: 4.7, 
    minOrder: 200, 
    deliveryTime: '45-60 dk', 
    isOpen: true,
    address: 'Nispetiye Cad. No:789, İstanbul'
  }
];

// Su tedarikçileri verileri
export const mockWaterVendors = [
  { 
    id: 1, 
    name: 'Saf Su',
    image: '/water1.jpg', 
    brand: 'Hayat', 
    rating: 4.5, 
    minOrder: 40, 
    deliveryTime: '30-45 dk', 
    isOpen: true,
    address: 'Bağdat Cad. No:123, İstanbul'
  },
  { 
    id: 2, 
    name: 'Su Dünyası',
    image: '/water2.jpg', 
    brand: 'Erikli', 
    rating: 4.2, 
    minOrder: 40, 
    deliveryTime: '20-35 dk', 
    isOpen: true,
    address: 'İstiklal Cad. No:456, İstanbul'
  },
  { 
    id: 3, 
    name: 'Damacana Express',
    image: '/water3.jpg', 
    brand: 'Sırma', 
    rating: 4.7, 
    minOrder: 40, 
    deliveryTime: '45-60 dk', 
    isOpen: false,
    address: 'Nispetiye Cad. No:789, İstanbul'
  }
];

// Kampanya verileri
export const mockCampaigns = [
  { id: 1, title: '%20 İndirim', description: 'Tüm menüden %20 indirim', store: 'Kebapçı Ahmet' },
  { id: 2, title: '1 Alana 1 Bedava', description: 'Tüm pizzalarda geçerli', store: 'Pizza Dünyası' },
  { id: 3, title: '50 TL İndirim', description: '150 TL üzeri alışverişlerde', store: 'Süper Market' },
  { id: 4, title: 'Ücretsiz Teslimat', description: '100 TL üzeri siparişlerde', store: 'Organik Pazar' },
  { id: 5, title: '%15 İndirim', description: 'İlk siparişinize özel', store: 'Saf Su' }
]; 