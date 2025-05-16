'use client';

import { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';
import Link from 'next/link';

export default function DbExplorerPage() {
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);

  useEffect(() => {
    async function fetchTables() {
      try {
        // API endpoint ile tabloları al
        const response = await fetch('/api/supabase-tables');
        const apiData = await response.json();
        
        if (apiData.tables && apiData.tables.length > 0) {
          setTables(apiData.tables);
          setLoading(false);
          return;
        }
        
        // API endpoint başarısız olursa, direkt yöntem deneyelim
        const potentialTables = [
          'addresses', 'admin_roles', 'campaign_participants', 'campaigns',
          'categories', 'commission_links', 'commissions', 'favorites',
          'help_requests', 'notification_preferences', 'notifications',
          'order_items', 'orders', 'partners', 'payments', 'products',
          'promo_banners', 'reviews', 'settings', 'store_restrictions',
          'store_working_hours', 'users'
        ];
        
        const existingTables = [];
        
        // Her tabloyu kontrol et
        for (const tableName of potentialTables) {
          const { error } = await supabase.from(tableName).select('*').limit(1);
          if (!error) {
            existingTables.push(tableName);
          }
        }
        
        if (existingTables.length > 0) {
          setTables(existingTables);
        } else {
          throw new Error('Hiç tablo bulunamadı');
        }
      } catch (err) {
        console.error('Tablolar yüklenirken hata oluştu:', err);
        setError('Veritabanı tablolarına erişilemiyor. Bu genellikle eksik yetkiler veya hatalı yapılandırmadan kaynaklanır. Hata: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTables();
  }, []);

  const fetchTableData = async (tableName) => {
    setSelectedTable(tableName);
    setLoading(true);
    
    try {
      // Önce tablo kolonlarını almaya çalışalım
      // Doğrudan veri çekerek kolonları bulalım
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (error) throw error;
      
      // Kolonları veri yapısından çıkaralım
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]).map(column => ({
          column_name: column,
          data_type: typeof data[0][column] === 'object' ? 'object' : typeof data[0][column],
          is_nullable: 'YES' // Bu bilgiyi alamıyoruz, varsayılan olarak YES
        }));
        setTableColumns(columns);
      } else {
        setTableColumns([]);
      }
      
      // Sonra tablo verisini al
      const { data: fullData, error: fullDataError } = await supabase
        .from(tableName)
        .select('*')
        .limit(10);
        
      if (fullDataError) throw fullDataError;
      setTableData(fullData || []);
    } catch (err) {
      console.error(`${tableName} tablosu yüklenirken hata:`, err);
      setError(`"${tableName}" tablosu yüklenirken hata oluştu: ${err.message}`);
      setTableData([]);
      setTableColumns([]);
    } finally {
      setLoading(false);
    }
  };

  // API endpoint aracılığıyla tabloları alma
  const fetchTablesWithAPI = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/supabase-direct');
      const apiData = await response.json();
      
      if (apiData.success) {
        // Ana kullanıcı tablosu
        const tables = ['users'];
        
        // Diğer mevcut tabloları ekleyelim
        if (apiData.table_statuses && apiData.table_statuses.length > 0) {
          apiData.table_statuses.forEach(status => {
            if (status.exists) {
              tables.push(status.table);
            }
          });
        }
        
        setTables(tables);
        setError(null);
      } else {
        throw new Error(apiData.message || 'Tablolar alınamadı');
      }
    } catch (err) {
      console.error('API ile tablolar alınamadı:', err);
      setError(`Tablolar alınamadı: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Supabase Veritabanı Gezgini</h1>
        <Link href="/db-setup" className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
          Tabloları Oluştur
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          <p className="font-medium">Hata</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-3">Tablolar</h2>
          
          {loading && !tables.length ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
            </div>
          ) : tables.length > 0 ? (
            <ul className="bg-white shadow-md rounded-lg overflow-hidden">
              {tables.map((table) => (
                <li key={table}>
                  <button
                    onClick={() => fetchTableData(table)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${selectedTable === table ? 'bg-orange-50 text-orange-600 font-medium' : ''}`}
                  >
                    {table}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <p className="text-gray-500 mb-4">Veritabanında tablo bulunamadı veya tablolara erişim izniniz yok.</p>
              <button
                onClick={() => fetchTablesWithAPI()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                API ile Yeniden Dene
              </button>
            </div>
          )}
        </div>
        
        <div className="md:col-span-3">
          {selectedTable ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{selectedTable} Tablosu</h2>
                {loading && <div className="animate-spin h-5 w-5 border-2 border-orange-500 rounded-full border-t-transparent"></div>}
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <h3 className="text-md font-medium bg-gray-50 px-4 py-2 border-b">Tablo Yapısı</h3>
                {tableColumns.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kolon Adı</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veri Tipi</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NULL Olabilir</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableColumns.map((column, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{column.column_name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{column.data_type}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{column.is_nullable === 'YES' ? 'Evet' : 'Hayır'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="p-4 text-gray-500">Yapı bilgisi bulunamadı.</p>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <h3 className="text-md font-medium bg-gray-50 px-4 py-2 border-b">Tablo Verisi (İlk 10 kayıt)</h3>
                {tableData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(tableData[0]).map((column) => (
                            <th key={column} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {Object.keys(row).map((column, colIndex) => (
                              <td key={`${rowIndex}-${colIndex}`} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {typeof row[column] === 'object' 
                                  ? JSON.stringify(row[column])
                                  : String(row[column] !== null ? row[column] : 'NULL')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="p-4 text-gray-500">Bu tabloda veri bulunamadı veya verilere erişim sağlanamadı.</p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">Detayları görüntülemek için sol taraftan bir tablo seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 