'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import AuthGuard from '../../../components/AuthGuard';
import api from '@/lib/api';

export default function AdminStores() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminStoresContent />
    </AuthGuard>
  );
}

function AdminStoresContent() {
  const router = useRouter();
  const [allStores, setAllStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [mainCategories, setMainCategories] = useState([]);
  const storesPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mağazaları getir
        const storesData = await api.getStores();
        // Kategorileri getir
        const categoriesData = await api.getMainCategories();
        
        // Mağazalara kategori isimlerini ekle
        const storesWithCategoryNames = storesData.map(store => {
          const category = categoriesData.find(cat => cat.id === store.category_id);
          return {
            ...store,
            category: category ? category.name : 'Tanımlanmamış'
          };
        });
        
        setAllStores(storesWithCategoryNames || []);
        setMainCategories(categoriesData || []);
      } catch (error) {
        console.error("Mağaza ve kategori verileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStores = allStores.filter(store => {
    const ownerName = store.owner?.name?.toLowerCase() || '';
    const mainCategoryOfStore = mainCategories.find(cat => cat.id === store.category_id);
    const categoryName = mainCategoryOfStore?.name?.toLowerCase() || '';

    const matchesSearch = 
      (store.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (store.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      ownerName.includes(searchTerm.toLowerCase()) ||
      categoryName.includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || store.category_id === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        matchesStatus = !store.is_approved;
      } else if (statusFilter === 'approved') {
        matchesStatus = store.is_approved;
      } else if (statusFilter === 'active') {
        matchesStatus = store.is_approved && store.status === 'active';
      } else if (statusFilter === 'inactive') {
        matchesStatus = store.is_approved && store.status === 'inactive';
      }
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sayfalama
  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = filteredStores.slice(indexOfFirstStore, indexOfLastStore);
  const totalPages = Math.ceil(filteredStores.length / storesPerPage);

  // Sayfa değiştirme
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Mağaza silme
  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Bu mağazayı silmek istediğinize emin misiniz?')) {
      try {
        // Veritabanından mağazayı sil
        await api.deleteStore(storeId);
        
        // UI'ı güncelle
        setAllStores(allStores.filter(store => store.id !== storeId));
        
        // Başarı mesajı göster
        alert('Mağaza başarıyla silindi!');
      } catch (error) {
        console.error("Mağaza silinirken hata:", error);
        alert("Mağaza silinirken bir hata oluştu!");
      }
    }
  };

  // Mağaza durumunu değiştirme
  const handleToggleStatus = async (storeId) => {
    try {
      // Mağazayı önce veritabanından al
      const store = allStores.find(store => store.id === storeId);
      if (!store) return;
      
      // Yeni durum değeri
      const newStatus = store.status === 'active' ? 'inactive' : 'active';
      
      // Veritabanını güncelle
      await api.updateStore(storeId, { status: newStatus });
      
      // UI'ı güncelle
      const updatedStores = allStores.map(s => {
        if (s.id === storeId) {
          return {
            ...s,
            status: newStatus
          };
        }
        return s;
      });
      
      setAllStores(updatedStores);
      
      // Başarı mesajı göster
      alert(`Mağaza durumu "${newStatus}" olarak güncellendi!`);
    } catch (error) {
      console.error("Mağaza durumu güncellenirken hata:", error);
      alert("Mağaza durumu güncellenirken bir hata oluştu!");
    }
  };

  // Mağaza onay durumunu değiştirme
  const handleToggleApproval = async (storeId) => {
    try {
      // Mağazayı önce veritabanından al
      const store = allStores.find(store => store.id === storeId);
      if (!store) return;
      
      const newApprovalStatus = !store.is_approved;
      // Yeni durum değeri - eğer onaylanıyorsa active, değilse inactive
      const newStatus = newApprovalStatus ? 'active' : 'inactive';
      
      // Veritabanını güncelle
      await api.updateStore(storeId, { 
        is_approved: newApprovalStatus,
        status: newStatus
      });
      
      // UI'ı güncelle
      const updatedStores = allStores.map(s => {
        if (s.id === storeId) {
          return {
            ...s,
            is_approved: newApprovalStatus,
            status: newStatus
          };
        }
        return s;
      });
      
      setAllStores(updatedStores);
      
      // Başarı mesajı göster
      alert(newApprovalStatus ? 'Mağaza başarıyla onaylandı!' : 'Mağaza onayı kaldırıldı!');
    } catch (error) {
      console.error("Mağaza onay durumu güncellenirken hata:", error);
      alert("Mağaza onay durumu güncellenirken bir hata oluştu!");
    }
  };

  // Mağaza durumunu formatla
  const formatStatus = (status, is_approved) => {
    if (!is_approved) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Onay Bekliyor</span>;
    }
    
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Aktif</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Pasif</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Bilinmiyor</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mağaza Yönetimi</h1>
          <p className="text-gray-600 mt-1">Tüm mağazaları görüntüle, düzenle veya sil</p>
        </div>
        <Link 
          href="/admin"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Admin Paneli
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Mağaza adı veya e-posta ara..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="yemek">Yemek</option>
              <option value="market">Market</option>
              <option value="su">Su</option>
              <option value="aktüel">Aktüel</option>
            </select>
            <select
              className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tüm Durumlar</option>
              <option value="approved">Onaylanmış</option>
              <option value="pending">Onay Bekleyen</option>
            </select>
            <Link 
              href="/admin/stores/add"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Mağaza
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mağaza
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Komisyon
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {store.name.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{store.name}</div>
                        <div className="text-sm text-gray-500">ID: {store.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{store.email}</div>
                    <div className="text-sm text-gray-500">{store.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {store.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatStatus(store.status, store.is_approved)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {store.rating > 0 ? (
                        <>
                          <span className="text-sm font-medium text-gray-900 mr-1">{store.rating}</span>
                          <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Henüz puanlanmadı</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">%{store.commission_rate?.toFixed(2) || '0.00'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/stores/${store.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Görüntüle
                      </Link>
                      {!store.is_approved ? (
                        <button
                          onClick={() => handleToggleApproval(store.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Onayla
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggleStatus(store.id)}
                          className={`${store.status === 'active' ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {store.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteStore(store.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              Toplam <span className="font-medium">{filteredStores.length}</span> mağazadan{' '}
              <span className="font-medium">{indexOfFirstStore + 1}</span>-
              <span className="font-medium">
                {indexOfLastStore > filteredStores.length ? filteredStores.length : indexOfLastStore}
              </span>{' '}
              arası gösteriliyor
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Önceki
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => paginate(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNumber
                        ? 'z-10 bg-blue-600 text-white'
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 