import { useEffect, useState, useRef } from 'react';
import supabase from '@/lib/supabase';

/**
 * Supabase Real-time Hook
 * Belirtilen tablo ve filtrelere göre real-time güncellemeleri dinler
 */
export const useSupabaseRealtime = (table, filters = {}, options = {}) => {
  // Güvenlik kontrolleri
  if (!table || typeof table !== 'string') {
    console.error('useSupabaseRealtime: table parameter is required and must be a string');
    return {
      data: [],
      loading: false,
      error: new Error('Invalid table parameter'),
      refresh: () => {},
      insert: async () => ({ data: null, error: new Error('Invalid table parameter') }),
      update: async () => ({ data: null, error: new Error('Invalid table parameter') }),
      remove: async () => ({ error: new Error('Invalid table parameter') })
    };
  }

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const subscriptionRef = useRef(null);
  
  const {
    select = '*',
    orderBy = { column: 'created_at', ascending: false },
    onInsert,
    onUpdate,
    onDelete,
    enabled = true
  } = options;

  // Veri yükle
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table).select(select);

      // Filtreleri uygula
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Sıralama
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending });
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      setData(result || []);
    } catch (err) {
      console.error(`Error loading ${table}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription kur
  const setupSubscription = () => {
    if (!enabled) return;
    
    // Önceki subscription'ı temizle
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Filter string oluştur
    const filterString = Object.entries(filters)
      .map(([key, value]) => `${key}=eq.${value}`)
      .join('&');

    const channel = supabase
      .channel(`${table}_${Date.now()}`) // Unique channel name
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filterString
        },
        (payload) => {
          try {
            console.log(`Real-time change in ${table}:`, payload);
            
            const { eventType, new: newRecord, old: oldRecord } = payload;

            switch (eventType) {
              case 'INSERT':
                setData(prev => {
                  // Yeni kaydı ekle ve sırala
                  const updated = [newRecord, ...prev];
                  if (orderBy) {
                    updated.sort((a, b) => {
                      const aVal = a[orderBy.column];
                      const bVal = b[orderBy.column];
                      
                      if (orderBy.ascending) {
                        return aVal > bVal ? 1 : -1;
                      } else {
                        return aVal < bVal ? 1 : -1;
                      }
                    });
                  }
                  return updated;
                });
                onInsert?.(newRecord);
                break;

              case 'UPDATE':
                setData(prev => prev.map(item => 
                  item.id === newRecord.id ? newRecord : item
                ));
                onUpdate?.(newRecord, oldRecord);
                break;

              case 'DELETE':
                setData(prev => prev.filter(item => item.id !== oldRecord.id));
                onDelete?.(oldRecord);
                break;
            }
          } catch (err) {
            console.error(`Error processing real-time change for ${table}:`, err);
          }
        }
      )
      .subscribe((status, err) => {
        console.log(`Subscription status for ${table}:`, status);
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Successfully subscribed to ${table} changes`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to ${table} changes`, err);
          // Hata durumunda subscription'ı yeniden kurmayı dene
          setTimeout(() => {
            if (enabled && subscriptionRef.current) {
              console.log(`🔄 Retrying subscription for ${table}...`);
              setupSubscription();
            }
          }, 5000); // 5 saniye sonra tekrar dene
        } else if (status === 'CLOSED') {
          console.log(`🔌 Subscription closed for ${table}`);
        } else if (status === 'TIMED_OUT') {
          console.log(`⏰ Subscription timed out for ${table}`);
          // Timeout durumunda yeniden bağlanmayı dene
          setTimeout(() => {
            if (enabled && subscriptionRef.current) {
              console.log(`🔄 Retrying subscription after timeout for ${table}...`);
              setupSubscription();
            }
          }, 3000);
        }
      });

    subscriptionRef.current = channel;
  };

  // Başlangıçta veri yükle ve subscription kur
  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      if (enabled && isMounted) {
        try {
          await loadData();
          if (isMounted) {
            setupSubscription();
          }
        } catch (err) {
          console.error(`Error initializing data for ${table}:`, err);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log(`🧹 Cleaned up subscription for ${table}`);
        } catch (err) {
          console.error(`Error cleaning up subscription for ${table}:`, err);
        }
        subscriptionRef.current = null;
      }
    };
  }, [table, JSON.stringify(filters), enabled]);

  // Manuel yenileme fonksiyonu
  const refresh = () => {
    loadData();
  };

  // Yeni kayıt ekleme fonksiyonu
  const insert = async (newData) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(newData)
        .select(select)
        .single();

      if (error) throw error;
      return { data: result, error: null };
    } catch (err) {
      console.error(`Error inserting into ${table}:`, err);
      return { data: null, error: err };
    }
  };

  // Kayıt güncelleme fonksiyonu
  const update = async (id, updates) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select(select)
        .single();

      if (error) throw error;
      return { data: result, error: null };
    } catch (err) {
      console.error(`Error updating ${table}:`, err);
      return { data: null, error: err };
    }
  };

  // Kayıt silme fonksiyonu
  const remove = async (id) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error(`Error deleting from ${table}:`, err);
      return { error: err };
    }
  };

  return {
    data,
    loading,
    error,
    refresh,
    insert,
    update,
    remove
  };
};

/**
 * Notifications için özel hook
 */
export const useNotifications = (userId, options = {}) => {
  return useSupabaseRealtime('notifications', { user_id: userId }, {
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    ...options
  });
};

/**
 * Orders için özel hook
 */
export const useOrders = (filters = {}, options = {}) => {
  return useSupabaseRealtime('orders', filters, {
    select: `
      *,
      customer:users!customer_id(id, name, email, phone),
      store:stores(name, logo, category_id),
      order_items(count)
    `,
    orderBy: { column: 'order_date', ascending: false },
    ...options
  });
};

/**
 * Reviews için özel hook
 */
export const useReviews = (storeId, options = {}) => {
  return useSupabaseRealtime('reviews', { store_id: storeId }, {
    select: `
      *,
      user:users(id, name, avatar_url),
      store:stores(id, name)
    `,
    orderBy: { column: 'created_at', ascending: false },
    ...options
  });
};

/**
 * Commission calculations için özel hook
 */
export const useCommissionCalculations = (storeId, options = {}) => {
  return useSupabaseRealtime('commission_calculations', 
    storeId ? { store_id: storeId } : {}, 
    {
      select: `
        *,
        order:orders(order_date, status, customer_id),
        store:stores(name)
      `,
      orderBy: { column: 'calculated_at', ascending: false },
      ...options
    }
  );
};

export default useSupabaseRealtime; 