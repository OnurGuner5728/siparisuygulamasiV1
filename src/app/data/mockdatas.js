// Mock sipariş verileri
export const mockOrders = [
  {
    id: 1001,
    customerId: 5,
    customerName: 'Ahmet Yılmaz',
    customerPhone: '0555 111 2233',
    storeId: 1,
    categoryId: 1,
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
    deliveryAddressId: 5,
    items: [
      {
        id: 1,
        productId: 1,
        name: 'Adana Kebap',
        quantity: 1,
        price: 120.00,
        total: 120.00,
        notes: 'Acılı olsun'
      },
      {
        id: 2,
        productId: 3,
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
    storeId: 2,
    categoryId: 2,
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
    deliveryAddressId: 8,
    items: [
      {
        id: 5,
        productId: 5,
        name: 'Dana Kıyma',
        quantity: 1,
        price: 180.00,
        total: 180.00,
        notes: ''
      },
      {
        id: 8,
        productId: 9,
        name: 'Pirinç',
        quantity: 1,
        price: 35.50,
        total: 35.50,
        notes: ''
      },
      {
        id: 9,
        productId: 10,
        name: 'Makarna',
        quantity: 1,
        price: 12.90,
        total: 12.90,
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
    storeId: 3,
    categoryId: 3,
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
    deliveryAddressId: 6,
    items: [
      {
        id: 7,
        productId: 7,
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
    storeId: 8,
    categoryId: 4,
    status: 'cancelled',
    orderDate: '2023-05-18T16:45:00',
    deliveryDate: null,
    subtotal: 450.25,
    deliveryFee: 0,
    total: 450.25,
    discount: 0,
    itemCount: 1,
    paymentMethod: 'online',
    paymentStatus: 'refunded',
    deliveryAddressId: 7,
    items: [
      {
        id: 10,
        productId: 8,
        name: 'Akıllı Saat',
        quantity: 1,
        price: 2500.00,
        total: 2500.00,
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
    storeId: 6,
    categoryId: 1,
    status: 'pending',
    orderDate: '2023-05-21T19:30:00',
    deliveryDate: null,
    subtotal: 130.00,
    deliveryFee: 0.00,
    total: 130.00,
    discount: 0,
    itemCount: 2,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    deliveryAddressId: 5,
    items: [
      {
        id: 12,
        productId: 4,
        name: 'Tavuk Döner',
        quantity: 1,
        price: 85.00,
        total: 85.00,
        notes: 'Soğan olmasın'
      },
      {
        id: 13,
        productId: 3,
        name: 'Ayran',
        quantity: 3,
        price: 15.00,
        total: 45.00,
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

// Mağaza siparişleri verileri - Store Orders
export const storeOrdersData = [
  {
    id: 1,
    customer: {
      name: 'Ahmet Yılmaz',
      phone: '0555 111 2233',
      address: 'Kadıköy, İstanbul'
    },
    date: '2023-05-25T10:30:00',
    items: [
      {
        id: 1,
        name: 'Adana Kebap',
        price: 120.00,
        quantity: 1,
        total: 120.00
      },
      {
        id: 2,
        name: 'Ayran',
        price: 15.00,
        quantity: 1,
        total: 15.00
      }
    ],
    subtotal: 135.00,
    deliveryFee: 15.00,
    total: 150.00,
    status: 'delivered',
    paymentMethod: 'online',
    paymentStatus: 'paid',
    notes: 'Acılı olsun lütfen',
    statusHistory: [
      { status: 'preparing', date: '2023-05-25T10:35:00', note: 'Sipariş hazırlanıyor' },
      { status: 'onway', date: '2023-05-25T10:50:00', note: 'Kurye yola çıktı' },
      { status: 'delivered', date: '2023-05-25T11:10:00', note: 'Sipariş teslim edildi' }
    ]
  },
  {
    id: 2,
    customer: {
      name: 'Mehmet Demir',
      phone: '0533 222 4455',
      address: 'Beşiktaş, İstanbul'
    },
    date: '2023-05-25T12:15:00',
    items: [
      {
        id: 1,
        name: 'Urfa Kebap',
        price: 110.00,
        quantity: 2,
        total: 220.00
      },
      {
        id: 3,
        name: 'Baklava',
        price: 45.00,
        quantity: 1,
        total: 45.00
      }
    ],
    subtotal: 265.00,
    deliveryFee: 15.00,
    total: 280.00,
    status: 'onway',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    notes: '',
    statusHistory: [
      { status: 'preparing', date: '2023-05-25T12:20:00', note: 'Sipariş hazırlanıyor' },
      { status: 'onway', date: '2023-05-25T12:40:00', note: 'Kurye yola çıktı' }
    ]
  },
  {
    id: 3,
    customer: {
      name: 'Ayşe Şahin',
      phone: '0544 333 6677',
      address: 'Ümraniye, İstanbul'
    },
    date: '2023-05-25T15:45:00',
    items: [
      {
        id: 4,
        name: 'Tavuk Şiş',
        price: 90.00,
        quantity: 1,
        total: 90.00
      },
      {
        id: 5,
        name: 'Salata',
        price: 30.00,
        quantity: 1,
        total: 30.00
      },
      {
        id: 2,
        name: 'Ayran',
        price: 15.00,
        quantity: 2,
        total: 30.00
      }
    ],
    subtotal: 150.00,
    deliveryFee: 15.00,
    total: 165.00,
    status: 'preparing',
    paymentMethod: 'online',
    paymentStatus: 'paid',
    notes: 'Tavuğu iyi pişmiş olsun',
    statusHistory: [
      { status: 'preparing', date: '2023-05-25T15:50:00', note: 'Sipariş hazırlanıyor' }
    ]
  }
];

// Status değerleri ve açıklamaları
export const statusTypes = [
  { id: 'active', name: 'Aktif', description: 'Aktif ve görünür', color: 'bg-green-100 text-green-800' },
  { id: 'inactive', name: 'Pasif', description: 'Pasif ve gizli', color: 'bg-red-100 text-red-800' },
  { id: 'pending', name: 'Beklemede', description: 'Onay bekliyor', color: 'bg-yellow-100 text-yellow-800' }
];

// Mock mağaza verileri - Tüm uygulamada kullanılacak ortak veri
export const mockStores = [
  {
    id: 1,
    name: 'Kebapçı Ahmet',
    ownerName: 'Ahmet Yılmaz',
    email: 'kebapci@example.com',
    phone: '0505 333 4455',
    ownerId: 3,
    categoryId: 1,
    description: 'En lezzetli kebaplar',
    addressId: 1,
    rating: 4.7,
    status: 'active', // 'active': Mağaza açık ve hizmet veriyor
    isOpen: true,
    approved: true,
    registrationDate: '2023-03-10T09:30:00',
    ordersCount: 230,
    totalRevenue: 25800.50,
    averageOrderValue: 112.18,
    image: '/restaurant1.jpg',
    modulePermissions: {
      yemek: true,
      market: false,
      su: false,
      aktuel: false,
      kampanya: {
        view: true,
        create: true
      }
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
      { id: 1, name: 'Adana Kebap', price: 120.00, categoryId: 1 },
      { id: 2, name: 'Urfa Kebap', price: 110.00, categoryId: 1 },
      { id: 3, name: 'Tavuk Şiş', price: 95.00, categoryId: 1 },
      { id: 4, name: 'Lahmacun', price: 35.00, categoryId: 2 },
      { id: 5, name: 'Ayran', price: 15.00, categoryId: 3 },
      { id: 6, name: 'Künefe', price: 60.00, categoryId: 4 }
    ],
    // Restoran verileri eklendi
    cuisine: 'Kebap', 
    minOrder: 50, 
    deliveryTime: '30-45 dk', 
    menuCategories: ['Ana Yemekler', 'İçecekler', 'Tatlılar'],
    menuItems: [
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
    name: 'Süper Market',
    ownerName: 'Mehmet Demir',
    email: 'market@example.com',
    phone: '0544 444 5566',
    ownerId: 10,
    categoryId: 2,
    description: 'Her türlü ürünü bulabileceğiniz market',
    addressId: 2,
    rating: 4.3,
    status: 'active', // 'active': Mağaza açık ve hizmet veriyor
    isOpen: true,
    approved: true,
    registrationDate: '2023-02-05T08:15:00',
    ordersCount: 480,
    totalRevenue: 76500.25,
    averageOrderValue: 159.38,
    image: '/market1.jpg',
    modulePermissions: {
      yemek: false,
      market: true,
      su: false,
      aktuel: false,
      kampanya: {
        view: true,
        create: true
      }
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
    ownerId: 9,
    categoryId: 3,
    description: 'Sağlıklı ve temiz içme suyu',
    addressId: 3,
    rating: 4.5,
    status: 'active', // 'active': Mağaza açık ve hizmet veriyor
    isOpen: true,
    approved: true,
    registrationDate: '2023-04-20',
    ordersCount: 150,
    totalRevenue: 12000.00,
    image: '/water1.jpg',
    modulePermissions: {
      yemek: false,
      market: false,
      su: true,
      aktuel: false,
      kampanya: {
        view: true,
        create: true
      }
    }
  },
  {
    id: 4,
    name: 'Yeni Pizza',
    email: 'pizza@example.com',
    phone: '0555 666 7788',
    ownerId: 4,
    categoryId: 1,
    description: 'Özel tariflerle pizza çeşitleri',
    addressId: 4,
    rating: 4.6,
    status: 'active',
    isOpen: true,
    approved: true,
    registrationDate: '2023-05-15',
    ordersCount: 0,
    totalRevenue: 0,
    image: '/restaurant2.jpg',
    isOpen: true,
    modulePermissions: {
      yemek: true,
      market: false,
      su: false,
      aktuel: false,
      kampanya: {
        view: true,
        create: false
      }
    },
    // Restoran verileri eklendi
    cuisine: 'Pizza', 
    minOrder: 60, 
    deliveryTime: '40-55 dk', 
    menuCategories: ['Pizzalar', 'Makarnalar', 'İçecekler', 'Tatlılar'],
    menuItems: [
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
    id: 5,
    name: 'Organik Market',
    email: 'organik@example.com',
    phone: '0533 777 8899',
    ownerId: 10,
    categoryId: 2,
    description: 'Organik ürünler satan market',
    addressId: 5,
    rating: 4.8,
    status: 'active', // 'active': Mağaza açık ve hizmet veriyor
    isOpen: true,
    approved: true,
    registrationDate: '2023-01-12',
    ordersCount: 350,
    totalRevenue: 52000.75,
    image: '/market2.jpg',
    modulePermissions: {
      yemek: false,
      market: true,
      su: false,
      aktuel: false,
      kampanya: {
        view: true,
        create: true
      }
    }
  },
  {
    id: 6,
    name: 'Lezzetli Burger',
    email: 'burger@example.com',
    phone: '0545 888 9900',
    ownerId: 9,
    categoryId: 1,
    description: 'Enfes burgerler',
    addressId: 6,
    rating: 4.2,
    status: 'active', // 'active': Mağaza açık ve hizmet veriyor
    isOpen: true,
    approved: true,
    registrationDate: '2023-02-28',
    ordersCount: 280,
    totalRevenue: 34500.50,
    image: '/restaurant4.jpg',
    modulePermissions: {
      yemek: true,
      market: false,
      su: false,
      aktuel: false,
      kampanya: {
        view: true,
        create: true
      }
    },
    // Restoran verileri eklendi
    cuisine: 'Hamburger', 
    minOrder: 70, 
    deliveryTime: '25-40 dk', 
    menuCategories: ['Burgerler', 'Yan Ürünler', 'İçecekler']
  },
  {
    id: 7,
    name: 'Şişe Su Dağıtım',
    email: 'siseSu@example.com',
    phone: '0536 999 0011',
    ownerId: 4,
    categoryId: 3,
    description: 'Şişe su dağıtım hizmeti',
    addressId: 7,
    rating: 0,
    status: 'pending', // 'pending': Mağaza onay bekliyor
    isOpen: false,
    approved: false,
    registrationDate: '2023-05-25',
    ordersCount: 0,
    totalRevenue: 0,
    image: '/water2.jpg',
    modulePermissions: {
      yemek: false,
      market: false,
      su: true,
      aktuel: false,
      kampanya: {
        view: true,
        create: true
      }
    }
  },
  {
    id: 8,
    name: 'Aktüel Ürünler',
    email: 'aktuel@example.com',
    phone: '0556 000 1122',
    ownerId: 3,
    categoryId: 4,
    description: 'Haftalık özel aktüel ürünler',
    addressId: 8,
    rating: 4.0,
    status: 'inactive', // 'inactive': Mağaza geçici olarak kapalı
    isOpen: false,
    approved: true,
    registrationDate: '2023-03-05',
    ordersCount: 120,
    totalRevenue: 18000.00,
    image: '/water3.jpg',
    modulePermissions: {
      yemek: false,
      market: false,
      su: false,
      aktuel: true,
      kampanya: {
        view: true,
        create: true
      }
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
  },
  // Süper Market için ek ürünler
  {
    id: 9,
    name: 'Pirinç',
    description: '1kg pirinç',
    price: 35.50,
    storeId: 2,
    storeName: 'Süper Market',
    category: 'Temel Gıda',
    mainCategory: 'Market',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.2,
    reviewCount: 42,
    createdAt: '2023-02-12'
  },
  {
    id: 10,
    name: 'Makarna',
    description: '500g makarna',
    price: 12.90,
    storeId: 2,
    storeName: 'Süper Market',
    category: 'Temel Gıda',
    mainCategory: 'Market',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.0,
    reviewCount: 38,
    createdAt: '2023-02-14'
  },
  // Organik Market için ek ürünler
  {
    id: 11,
    name: 'Organik Yumurta',
    description: '10\'lu organik yumurta',
    price: 65.00,
    storeId: 5,
    storeName: 'Organik Market',
    category: 'Kahvaltılık',
    mainCategory: 'Market',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.7,
    reviewCount: 62,
    createdAt: '2023-02-16'
  },
  {
    id: 12,
    name: 'Organik Zeytinyağı',
    description: '1lt soğuk sıkım zeytinyağı',
    price: 220.00,
    storeId: 5,
    storeName: 'Organik Market',
    category: 'Temel Gıda',
    mainCategory: 'Market',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.8,
    reviewCount: 54,
    createdAt: '2023-02-18'
  },
  // Damacana Su için ek ürünler
  {
    id: 13,
    name: '5L Su',
    description: '5 litre pet şişe su',
    price: 18.00,
    storeId: 3,
    storeName: 'Damacana Su',
    category: 'İçme Suyu',
    mainCategory: 'Su',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.3,
    reviewCount: 48,
    createdAt: '2023-03-05'
  },
  {
    id: 14,
    name: 'Cam Şişe 1L',
    description: '1 litre cam şişe su',
    price: 12.00,
    storeId: 3,
    storeName: 'Damacana Su',
    category: 'İçme Suyu',
    mainCategory: 'Su',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.4,
    reviewCount: 36,
    createdAt: '2023-03-08'
  },
  // Şişe Su Dağıtım için ürünler
  {
    id: 15,
    name: '19L Premium Su',
    description: 'Özel kaynak suyu 19lt',
    price: 45.00,
    storeId: 7,
    storeName: 'Şişe Su Dağıtım',
    category: 'İçme Suyu',
    mainCategory: 'Su',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.6,
    reviewCount: 28,
    createdAt: '2023-03-12'
  },
  {
    id: 16,
    name: '0.5L Su 12\'li',
    description: '12 adet 0.5lt pet şişe su',
    price: 55.00,
    storeId: 7,
    storeName: 'Şişe Su Dağıtım',
    category: 'İçme Suyu',
    mainCategory: 'Su',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.2,
    reviewCount: 22,
    createdAt: '2023-03-15'
  },
  // Kebapçı Ahmet için ek ürünler
  {
    id: 17,
    name: 'İskender Kebap',
    description: 'Enfes tereyağlı iskender kebap',
    price: 145.00,
    storeId: 1,
    storeName: 'Kebapçı Ahmet',
    category: 'Ana Yemekler',
    mainCategory: 'Yemek',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.9,
    reviewCount: 136,
    createdAt: '2023-01-18'
  },
  {
    id: 18,
    name: 'Lahmacun',
    description: 'Acılı veya acısız lahmacun',
    price: 35.00,
    storeId: 1,
    storeName: 'Kebapçı Ahmet',
    category: 'Ana Yemekler',
    mainCategory: 'Yemek',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.5,
    reviewCount: 78,
    createdAt: '2023-01-22'
  },
  // Lezzetli Burger için ek ürünler
  {
    id: 19,
    name: 'Cheeseburger',
    description: 'Özel soslu cheddar peynirli burger',
    price: 95.00,
    storeId: 6,
    storeName: 'Lezzetli Burger',
    category: 'Ana Yemekler',
    mainCategory: 'Yemek',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.7,
    reviewCount: 98,
    createdAt: '2023-02-06'
  },
  {
    id: 20,
    name: 'Double Burger',
    description: 'İki katlı et ve peynirli burger',
    price: 120.00,
    storeId: 6,
    storeName: 'Lezzetli Burger',
    category: 'Ana Yemekler',
    mainCategory: 'Yemek',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.8,
    reviewCount: 112,
    createdAt: '2023-02-08'
  },
  {
    id: 21,
    name: 'Patates Kızartması',
    description: 'Çıtır patates kızartması',
    price: 30.00,
    storeId: 6,
    storeName: 'Lezzetli Burger',
    category: 'Yan Ürünler',
    mainCategory: 'Yemek',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.4,
    reviewCount: 86,
    createdAt: '2023-02-10'
  },
  // Yeni Pizza için ürünler (approved=false olsa da ürünleri ekleyelim)
  {
    id: 22,
    name: 'Margarita Pizza',
    description: 'Klasik domates ve mozarella peynirli pizza',
    price: 90.00,
    storeId: 4,
    storeName: 'Yeni Pizza',
    category: 'Ana Yemekler',
    mainCategory: 'Yemek',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.6,
    reviewCount: 0,
    createdAt: '2023-05-16'
  },
  {
    id: 23,
    name: 'Karışık Pizza',
    description: 'Sucuk, sosis, mantar, zeytin ve mozarella peynirli pizza',
    price: 115.00,
    storeId: 4,
    storeName: 'Yeni Pizza',
    category: 'Ana Yemekler',
    mainCategory: 'Yemek',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.7,
    reviewCount: 0,
    createdAt: '2023-05-16'
  },
  {
    id: 24,
    name: 'Vejetaryen Pizza',
    description: 'Biber, domates, mantar, mısır ve mozarella peynirli pizza',
    price: 105.00,
    storeId: 4,
    storeName: 'Yeni Pizza',
    category: 'Ana Yemekler',
    mainCategory: 'Yemek',
    status: 'active',
    image: 'https://placehold.co/150',
    rating: 4.5,
    reviewCount: 0,
    createdAt: '2023-05-16'
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
    addressIds: [5, 9],
    defaultAddressId: 5,
    registrationDate: '2023-04-15T14:30:00',
    lastLogin: '2023-05-20T09:45:00',
    orderCount: 12,
    totalSpent: 1585.50,
    favoriteCategoryId: 1,
    modulePermissions: {
      yemek: true,
      market: true,
      su: true,
      aktuel: false,
      kampanya: {
        view: true,
        create: false
      }
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
      aktuel: true,
      kampanya: {
        view: true,
        create: true,
        admin: true
      }
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
      aktuel: false,
      kampanya: {
        view: true,
        create: true
      }
    }
  },
  {
    id: 4,
    name: 'Yeni Mağaza',
    email: 'store@example.com',
    phone: '0544 444 5566',
    role: 'store',
    status: 'active',
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
      aktuel: false,
      kampanya: {
        view: true,
        create: true
      }
    }
  },
  {
    id: 5,
    name: 'Ayşe Demir',
    email: 'ayse@example.com',
    phone: '0533 555 6677',
    role: 'user',
    status: 'active',
    addressIds: [5],
    defaultAddressId: 5,
    registrationDate: '2023-04-05',
    lastLogin: '2023-05-18T16:25:00',
    ordersCount: 8,
    activeOrder: 0,
    totalSpent: 1280.50,
    favoriteCategoryId: 1,
    modulePermissions: {
      yemek: true,
      market: true,
      su: true,
      aktuel: false,
      kampanya: {
        view: true,
        create: false
      }
    }
  },
  {
    id: 6,
    name: 'Mehmet Kaya',
    email: 'mehmet@example.com',
    phone: '0554 666 7788',
    role: 'user',
    status: 'active',
    addressIds: [8],
    defaultAddressId: 8,
    registrationDate: '2023-03-22',
    lastLogin: '2023-05-19T11:30:00',
    ordersCount: 15,
    activeOrder: 1,
    totalSpent: 3450.25,
    favoriteCategoryId: 2,
    modulePermissions: {
      yemek: true,
      market: true,
      su: false,
      aktuel: false,
      kampanya: {
        view: true,
        create: false
      }
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
    favoriteCategoryId: 3,
    modulePermissions: {
      yemek: true,
      market: true,
      su: true,
      aktuel: false,
      kampanya: {
        view: false,
        create: false
      }
    }
  },
  {
    id: 8,
    name: 'Ali Yıldız',
    email: 'ali@example.com',
    phone: '0545 888 9900',
    role: 'user',
    status: 'active',
    addressIds: [7],
    defaultAddressId: 7,
    registrationDate: '2023-01-15',
    lastLogin: '2023-05-20T18:40:00',
    ordersCount: 20,
    activeOrder: 0,
    totalSpent: 4750.80,
    favoriteCategoryId: 4,
    modulePermissions: {
      yemek: true,
      market: true,
      su: true,
      aktuel: false,
      kampanya: {
        view: true,
        create: false
      }
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
      aktuel: false,
      kampanya: {
        view: true,
        create: true
      }
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
      aktuel: false,
      kampanya: {
        view: true,
        create: false
      }
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
    favoriteCategoryId: 1,
    modulePermissions: {
      yemek: true,
      market: true,
      su: true,
      aktuel: false,
      kampanya: {
        view: true,
        create: false
      }
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
    favoriteCategoryId: 2,
    modulePermissions: {
      yemek: true,
      market: false,
      su: false,
      aktuel: false,
      kampanya: {
        view: false,
        create: false
      }
    }
  }
];

// Mock categories
export const mockCategories = [
  {
    id: 1,
    name: 'Yemek', 
    description: 'Restoran ve yemek servisleri', 
    color: 'bg-red-100 text-red-800', 
    icon: 'restaurant', 
    createdAt: '2023-01-01T00:00:00',
    subcategories: [
      { id: 101, name: 'Ana Yemekler', parentId: 1 },
      { id: 102, name: 'İçecekler', parentId: 1 },
      { id: 103, name: 'Tatlılar', parentId: 1 },
      { id: 104, name: 'Yan Ürünler', parentId: 1 },
      { id: 105, name: 'Kebaplar', parentId: 1 },
      { id: 106, name: 'Burgerler', parentId: 1 },
      { id: 107, name: 'Pizzalar', parentId: 1 },
      { id: 108, name: 'Makarnalar', parentId: 1 }
    ]
  },
  {
    id: 2,
    name: 'Market', 
    description: 'Market ve bakkal servisleri', 
    color: 'bg-blue-100 text-blue-800', 
    icon: 'shopping_cart', 
    createdAt: '2023-01-01T00:00:00',
    subcategories: [
      { id: 201, name: 'Süt Ürünleri', parentId: 2 },
      { id: 202, name: 'Fırın', parentId: 2 },
      { id: 203, name: 'Kahvaltılık', parentId: 2 },
      { id: 204, name: 'Et Ürünleri', parentId: 2 },
      { id: 205, name: 'Meyve', parentId: 2 },
      { id: 206, name: 'Sebze', parentId: 2 },
      { id: 207, name: 'İçecek', parentId: 2 },
      { id: 208, name: 'Temizlik', parentId: 2 },
      { id: 209, name: 'Kişisel Bakım', parentId: 2 },
      { id: 210, name: 'Temel Gıda', parentId: 2 }
    ]
  },
  {
    id: 3,
    name: 'Su', 
    description: 'Su satış ve dağıtım servisleri', 
    color: 'bg-cyan-100 text-cyan-800', 
    icon: 'water_drop', 
    createdAt: '2023-01-01T00:00:00',
    subcategories: [
      { id: 301, name: 'Damacana', parentId: 3 },
      { id: 302, name: 'Şişe Su', parentId: 3 },
      { id: 303, name: 'Pet Şişe Su', parentId: 3 },
      { id: 304, name: 'Doğal Kaynak Suyu', parentId: 3 },
      { id: 305, name: 'Maden Suyu', parentId: 3 }
    ]
  },
  {
    id: 4,
    name: 'Aktüel', 
    description: 'Haftalık aktüel ürünler', 
    color: 'bg-purple-100 text-purple-800', 
    icon: 'new_releases', 
    createdAt: '2023-01-01T00:00:00',
    subcategories: [
      { id: 401, name: 'Elektronik', parentId: 4 },
      { id: 402, name: 'Ev Gereçleri', parentId: 4 },
      { id: 403, name: 'Giyim', parentId: 4 },
      { id: 404, name: 'Oyuncak', parentId: 4 },
      { id: 405, name: 'Mobilya', parentId: 4 },
      { id: 406, name: 'Bahçe', parentId: 4 },
      { id: 407, name: 'Kozmetik', parentId: 4 }
    ]
  }
];

// Kategori eşlemeleri - Dönüşüm kolaylığı için
export const categoryMap = {
  'Yemek': 1,
  'Market': 2,
  'Su': 3,
  'Aktüel': 4,
  'Genel': 5
};

// Alt kategoriler listesi
export const mockSubcategories = [
  // Yemek alt kategorileri
  { id: 101, name: 'Ana Yemekler', parentId: 1 },
  { id: 102, name: 'İçecekler', parentId: 1 },
  { id: 103, name: 'Tatlılar', parentId: 1 },
  { id: 104, name: 'Yan Ürünler', parentId: 1 },
  { id: 105, name: 'Kebaplar', parentId: 1 },
  { id: 106, name: 'Burgerler', parentId: 1 },
  { id: 107, name: 'Pizzalar', parentId: 1 },
  { id: 108, name: 'Makarnalar', parentId: 1 },
  
  // Market alt kategorileri
  { id: 201, name: 'Süt Ürünleri', parentId: 2 },
  { id: 202, name: 'Fırın', parentId: 2 },
  { id: 203, name: 'Kahvaltılık', parentId: 2 },
  { id: 204, name: 'Et Ürünleri', parentId: 2 },
  { id: 205, name: 'Meyve', parentId: 2 },
  { id: 206, name: 'Sebze', parentId: 2 },
  { id: 207, name: 'İçecek', parentId: 2 },
  { id: 208, name: 'Temizlik', parentId: 2 },
  { id: 209, name: 'Kişisel Bakım', parentId: 2 },
  { id: 210, name: 'Temel Gıda', parentId: 2 },
  
  // Su alt kategorileri
  { id: 301, name: 'Damacana', parentId: 3 },
  { id: 302, name: 'Şişe Su', parentId: 3 },
  { id: 303, name: 'Pet Şişe Su', parentId: 3 },
  { id: 304, name: 'Doğal Kaynak Suyu', parentId: 3 },
  { id: 305, name: 'Maden Suyu', parentId: 3 },
  
  // Aktüel alt kategorileri
  { id: 401, name: 'Elektronik', parentId: 4 },
  { id: 402, name: 'Ev Gereçleri', parentId: 4 },
  { id: 403, name: 'Giyim', parentId: 4 },
  { id: 404, name: 'Oyuncak', parentId: 4 },
  { id: 405, name: 'Mobilya', parentId: 4 },
  { id: 406, name: 'Bahçe', parentId: 4 },
  { id: 407, name: 'Kozmetik', parentId: 4 },
  
  // Genel alt kategorileri
  { id: 501, name: 'Diğer', parentId: 5 }
];

// Ana kategoriler
export const mainCategories = [
  { id: 1, name: 'Yemek' },
  { id: 2, name: 'Market' },
  { id: 3, name: 'Su' },
  { id: 4, name: 'Aktüel' }
];

// Market verileri
export const mockMarkets = [
  { 
    id: 2, // mockStores referansı
    name: 'Süper Market', // mockStores referansından alındı
    type: 'Süpermarket', 
    minOrder: 100, 
    deliveryTime: '30-45 dk', 
    productCategories: ['Süt Ürünleri', 'Fırın', 'Kahvaltılık', 'Et Ürünleri', 'Meyve', 'İçecek'],
    rating: 4.3, // mockStores referansından alındı
    isOpen: true, // mockStores referansından alındı
    image: '/market1.jpg' // mockStores referansından alındı
  },
  { 
    id: 5, // mockStores referansı
    name: 'Organik Market', // mockStores referansından alındı
    type: 'Organik Market', 
    minOrder: 200, 
    deliveryTime: '45-60 dk', 
    productCategories: ['Organik Sebzeler', 'Organik Meyveler', 'Organik Kahvaltılık'],
    rating: 4.8, // mockStores referansından alındı
    isOpen: true, // mockStores referansından alındı
    image: '/market2.jpg' // mockStores referansından alındı
  },
  { 
    id: 9, // mockStores ID'si bulunmayan bir eleman ekliyoruz
    name: 'Mini Market',
    image: '/market3.jpg', 
    type: 'Bakkal', 
    rating: 4.2, 
    minOrder: 50, 
    deliveryTime: '20-35 dk', 
    isOpen: true,
    addressId: 4
  }
];

// Su tedarikçileri verileri
export const mockWaterVendors = [
  { 
    id: 3, // mockStores referansı
    name: 'Damacana Su', // mockStores referansından alındı
    brand: 'Hayat', 
    minOrder: 40, 
    deliveryTime: '30-45 dk', 
    productCategories: ['Damacana', 'Şişe Su', 'Doğal Kaynak Suyu'],
    rating: 4.5, // mockStores referansından alındı
    isOpen: true, // mockStores referansından alındı
    image: '/water1.jpg' // mockStores referansından alındı
  },
  { 
    id: 7, // mockStores referansı
    name: 'Şişe Su Dağıtım', // mockStores referansından alındı
    brand: 'Erikli', 
    minOrder: 40, 
    deliveryTime: '20-35 dk', 
    productCategories: ['Damacana', 'Şişe Su', 'Pet Şişe Su'],
    rating: 0, // mockStores referansından alındı
    isOpen: false, // mockStores referansından alındı
    image: '/water2.jpg' // mockStores referansından alındı
  },
  { 
    id: 8, // mockStores referansı
    name: 'Aktüel Ürünler', // mockStores referansından alındı
    brand: 'Sırma', 
    minOrder: 40, 
    deliveryTime: '45-60 dk', 
    productCategories: ['Damacana', 'Şişe Su'],
    rating: 4.0, // mockStores referansından alındı
    isOpen: false, // mockStores referansından alındı
    image: '/water3.jpg' // mockStores referansından alındı
  }
];

// Detaylı Kampanya verileri
export const mockCampaigns = [
  { 
    id: 1, 
    title: '%20 İndirim', 
    description: 'Tüm menüden %20 indirim', 
    storeId: 1, // Kebapçı Ahmet
    startDate: '2023-06-01T00:00:00',
    endDate: '2023-06-30T23:59:59',
    discount: 20,
    discountType: 'percent', // 'percent' veya 'amount'
    minOrderAmount: 100,
    maxDiscountAmount: 50,
    code: 'YEMEK20',
    status: 'active',
    usage: 45,
    maxUsage: 100,
    createdAt: '2023-05-25T10:30:00',
    createdBy: {
      id: 3,
    name: 'Kebapçı Ahmet', 
      role: 'store'
    },
    categoryId: 1, // Yemek
    conditions: 'Sadece online ödemelerde geçerlidir. Diğer kampanyalarla birleştirilemez.'
  },
  { 
    id: 2, 
    title: '1 Alana 1 Bedava', 
    description: 'Tüm pizzalarda geçerli', 
    storeId: 2, // Süper Market
    startDate: '2023-06-15T00:00:00',
    endDate: '2023-07-15T23:59:59',
    discount: 100,
    discountType: 'percent', 
    minOrderAmount: 80,
    maxDiscountAmount: null,
    code: 'PIZZA2X1',
    status: 'active',
    usage: 23,
    maxUsage: 50,
    createdAt: '2023-06-10T15:45:00',
    createdBy: {
      id: 9,
      name: 'Restoran A',
      role: 'store'
    },
    categoryId: 1, // Yemek
    conditions: 'Sadece aynı ürünlerde geçerlidir. Sadece belirli pizza çeşitlerinde geçerlidir.'
  },
  { 
    id: 3, 
    title: '50 TL İndirim', 
    description: '150 TL üzeri alışverişlerde', 
    storeId: 2, // Süper Market 
    startDate: '2023-06-05T00:00:00',
    endDate: '2023-06-25T23:59:59',
    discount: 50,
    discountType: 'amount',
    minOrderAmount: 150,
    maxDiscountAmount: 50,
    code: 'MARKET50',
    status: 'active',
    usage: 78,
    maxUsage: 200,
    createdAt: '2023-06-01T09:00:00',
    createdBy: {
      id: 2,
      name: 'Admin Kullanıcı',
      role: 'admin'
    },
    categoryId: 2, // Market
    conditions: 'Sadece market kategorisinde geçerlidir. Belirli ürünler hariç tutulabilir.'
  },
  { 
    id: 4, 
    title: 'Ücretsiz Teslimat', 
    description: '100 TL üzeri siparişlerde', 
    storeId: 5, // Organik Market
    startDate: '2023-06-10T00:00:00',
    endDate: '2023-07-10T23:59:59',
    discount: 0,
    discountType: 'free_delivery',
    minOrderAmount: 100,
    maxDiscountAmount: null,
    code: 'FREESHIPORG',
    status: 'active',
    usage: 34,
    maxUsage: 100,
    createdAt: '2023-06-05T11:30:00',
    createdBy: {
      id: 2,
      name: 'Admin Kullanıcı',
      role: 'admin'
    },
    categoryId: 2, // Market
    conditions: 'Belirli bir mesafeden sonra ek ücret uygulanabilir.'
  },
  { 
    id: 5, 
    title: '%15 İndirim', 
    description: 'İlk siparişinize özel', 
    storeId: 3, // Damacana Su
    startDate: '2023-06-01T00:00:00',
    endDate: '2023-08-31T23:59:59',
    discount: 15,
    discountType: 'percent',
    minOrderAmount: 40,
    maxDiscountAmount: 30,
    code: 'ILKSIPARIS',
    status: 'active',
    usage: 56,
    maxUsage: 500,
    createdAt: '2023-05-20T08:15:00',
    createdBy: {
      id: 2,
      name: 'Admin Kullanıcı',
      role: 'admin'
    },
    categoryId: 3, // Su
    conditions: 'Sadece ilk siparişlerde geçerlidir.'
  },
  { 
    id: 6, 
    title: 'Çarşamba Fırsatı', 
    description: 'Her Çarşamba %25 indirim', 
    storeId: 6, // Lezzetli Burger
    startDate: '2023-06-07T00:00:00',
    endDate: '2023-12-27T23:59:59',
    discount: 25,
    discountType: 'percent',
    minOrderAmount: 60,
    maxDiscountAmount: 40,
    code: 'CARSAMBA25',
    status: 'active',
    usage: 12,
    maxUsage: null,
    createdAt: '2023-06-05T14:20:00',
    createdBy: {
      id: 6, // Lezzetli Burger mağazasının ID'si ile aynı
      name: 'Lezzetli Burger',
      role: 'store'
    },
    categoryId: 1, // Yemek
    conditions: 'Sadece Çarşamba günleri geçerlidir. Bazı ürünler hariç tutulabilir.'
  },
  { 
    id: 7, 
    title: 'Hafta Sonu Kampanyası', 
    description: '2 damacana alana 1 damacana bedava', 
    storeId: 3, // Damacana Su
    startDate: '2023-06-23T00:00:00',
    endDate: '2023-07-31T23:59:59',
    discount: 33,
    discountType: 'percent',
    minOrderAmount: null,
    maxDiscountAmount: null,
    code: 'HAFTASONU3AL2ODE',
    status: 'inactive',
    usage: 0,
    maxUsage: 100,
    createdAt: '2023-06-15T16:45:00',
    createdBy: {
      id: 2,
      name: 'Admin Kullanıcı',
      role: 'admin'
    },
    categoryId: 3, // Su
    conditions: 'Sadece 19L damacana su için geçerlidir. Cumartesi ve Pazar günleri geçerlidir.'
  }
];

// Kampanya tipleri
export const campaignTypes = [
  { id: 'percent', name: 'Yüzde İndirim', description: 'Toplam tutarda yüzde indirim' },
  { id: 'amount', name: 'Tutar İndirim', description: 'Toplam tutarda sabit tutar indirim' },
  { id: 'free_delivery', name: 'Ücretsiz Teslimat', description: 'Teslimat ücretinde indirim' },
  { id: 'buy_x_get_y', name: 'X Al Y Kazan', description: 'Belirli sayıda ürün alımında indirim' },
  { id: 'bundle', name: 'Paket İndirimi', description: 'Belirli ürün kombinasyonlarında indirim' }
];

// Kampanya kategori verileri
export const campaignCategories = [
  { id: 1, name: 'Yemek', color: 'bg-blue-100 text-blue-800' },
  { id: 2, name: 'Market', color: 'bg-green-100 text-green-800' },
  { id: 3, name: 'Su', color: 'bg-indigo-100 text-indigo-800' },
  { id: 4, name: 'Aktüel', color: 'bg-purple-100 text-purple-800' },
  { id: 5, name: 'Genel', color: 'bg-gray-100 text-gray-800' }
];

// Adres verileri
export const mockAddresses = [
  { 
    id: 1, 
    userId: 3, // Kebapçı Ahmet'in sahibi
    title: 'İş Yeri',
    type: 'business',
    fullName: 'Ahmet Yılmaz',
    phone: '0505 333 4455',
    city: 'İstanbul',
    district: 'Kadıköy',
    neighborhood: 'Caddebostan',
    fullAddress: 'Bağdat Cad. No:123',
    postalCode: '34728',
    isDefault: true,
    createdAt: '2023-03-10T09:00:00'
  },
  { 
    id: 2, 
    userId: 10, // Süper Market'in sahibi
    title: 'İş Yeri',
    type: 'business',
    fullName: 'Mehmet Demir',
    phone: '0544 444 5566',
    city: 'İstanbul',
    district: 'Beyoğlu',
    neighborhood: 'İstiklal',
    fullAddress: 'İstiklal Cad. No:45',
    postalCode: '34435',
    isDefault: true,
    createdAt: '2023-02-05T08:00:00'
  },
  { 
    id: 3, 
    userId: 9, // Damacana Su'nun sahibi
    title: 'İş Yeri',
    type: 'business',
    fullName: 'Restoran A',
    phone: '0532 222 3344',
    city: 'İstanbul',
    district: 'Ataşehir',
    neighborhood: 'Atatürk',
    fullAddress: 'Atatürk Cad. No:78',
    postalCode: '34758',
    isDefault: true,
    createdAt: '2023-04-20T10:15:00'
  },
  {
    id: 4,
    userId: 4, // Yeni Pizza'nın sahibi
    title: 'İş Yeri',
    type: 'business',
    fullName: 'Fatih Yıldız',
    phone: '0555 666 7788',
    city: 'İstanbul',
    district: 'Eyüp',
    neighborhood: 'Göktürk',
    fullAddress: 'Göktürk Cad. No:42',
    postalCode: '34077',
    isDefault: true,
    createdAt: '2023-05-15T11:30:00'
  },
  {
    id: 5,
    userId: 5, // Ahmet Yılmaz müşteri
    title: 'Ev',
    type: 'home',
    fullName: 'Ahmet Yılmaz',
    phone: '0555 111 2233',
    city: 'İstanbul',
    district: 'Kadıköy',
    neighborhood: 'Göztepe',
    fullAddress: 'Örnek Sokak No:1 D:5',
    postalCode: '34730',
    isDefault: true,
    createdAt: '2023-05-01T14:20:00'
  },
  {
    id: 6,
    userId: 6, // Zeynep Demir müşteri
    title: 'Ev',
    type: 'home',
    fullName: 'Zeynep Demir',
    phone: '0544 333 7788',
    city: 'İstanbul',
    district: 'Ataşehir',
    neighborhood: 'Atatürk',
    fullAddress: 'Çamlık Sok. No:5 D:3',
    postalCode: '34758',
    isDefault: true,
    createdAt: '2023-04-15T09:45:00'
  },
  {
    id: 7,
    userId: 7, // Ali Kaya müşteri
    title: 'Ev',
    type: 'home',
    fullName: 'Ali Kaya',
    phone: '0532 444 9900',
    city: 'İstanbul',
    district: 'Üsküdar',
    neighborhood: 'Acıbadem',
    fullAddress: 'Tepe Sokak No:8 D:12',
    postalCode: '34660',
    isDefault: true,
    createdAt: '2023-05-10T16:30:00'
  },
  {
    id: 8,
    userId: 8, // Mehmet Kaya müşteri
    title: 'Ev',
    type: 'home',
    fullName: 'Mehmet Kaya',
    phone: '0533 222 5566',
    city: 'İstanbul',
    district: 'Beşiktaş',
    neighborhood: 'Levent',
    fullAddress: 'Yeni Cad. No:12 D:8',
    postalCode: '34330',
    isDefault: true,
    createdAt: '2023-04-22T10:15:00'
  },
  {
    id: 9,
    userId: 5, // Ahmet Yılmaz müşteri (iş adresi)
    title: 'İş',
    type: 'work',
    fullName: 'Ahmet Yılmaz',
    phone: '0555 111 2233',
    city: 'İstanbul',
    district: 'Şişli',
    neighborhood: 'Mecidiyeköy',
    fullAddress: 'Büyükdere Cad. No:54 K:5',
    postalCode: '34394',
    isDefault: false,
    createdAt: '2023-05-05T11:30:00'
  }
]; 