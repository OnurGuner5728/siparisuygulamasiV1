'use client';
import useSWR from 'swr';
import { useSWRConfig } from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

// Base fetcher function
const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('API request failed');
    error.status = response.status;
    error.response = response;
    throw error;
  }
  return response.json();
};

// Mutation fetcher
const mutationFetcher = async (url, { arg }) => {
  const { method = 'POST', data, headers = {} } = arg;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = new Error('API request failed');
    error.status = response.status;
    error.response = response;
    throw error;
  }

  return response.json();
};

// Products hooks
export function useProducts(category = null, storeId = null) {
  const key = category || storeId
    ? `/api/products?category=${category || ''}&storeId=${storeId || ''}`
    : '/api/products';

  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });
}

export function useProduct(productId) {
  return useSWR(
    productId ? `/api/products/${productId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );
}

// Stores hooks
export function useStores(category = null) {
  const key = category ? `/api/stores?category=${category}` : '/api/stores';

  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 minutes
  });
}

export function useStore(storeId) {
  return useSWR(
    storeId ? `/api/stores/${storeId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );
}

// Cart hooks
export function useCart() {
  const { user } = useAuth();

  return useSWR(
    user?.id ? `/api/cart/${user.id}` : null,
    async () => {
      if (!user?.id) return [];
      return await api.getUserCartItems(user.id);
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );
}

export function useAddToCart() {
  const { mutate } = useSWRConfig(); return {
    trigger: async (data) => {
      const result = await api.addToCart(data); mutate(key => typeof key === 'string' && key.includes('/api/cart/')); return result;
    }
  };
} export function useUpdateCartItem() {
  const { mutate } = useSWRConfig(); return {
    trigger: async (itemId, data) => {
      const result = await api.updateCartItem(itemId, data);
      mutate(key => typeof key === 'string' && key.includes('/api/cart/')); return result;
    }
  };
} export function useRemoveFromCart() {
  const { mutate } = useSWRConfig(); return {
    trigger: async (itemId) => {
      const result = await api.removeFromCart(itemId);          mutate(key => typeof key === 'string' && key.includes('/api/cart/'));      return result;    }  };}

      // Orders hooks
      export function useOrders() {
        const { user } = useAuth();

        return useSWR(
          user?.id ? `/api/orders/${user.id}` : null,
          async () => {
            if (!user?.id) return [];
            return await api.getUserOrders(user.id);
          },
          {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 1 minute
          }
        );
      }

      export function useOrder(orderId) {
        return useSWR(
          orderId ? `/api/orders/detail/${orderId}` : null,
          fetcher,
          {
            revalidateOnFocus: false,
            dedupingInterval: 300000, // 5 minutes
          }
        );
      }

      export function useCreateOrder() {
        const { mutate } = useSWRConfig(); return {
          trigger: async (orderData) => {
            const result = await api.createOrder(orderData); mutate(key => typeof key === 'string' && key.includes('/api/orders/')); return result;
          }
        };
      }

      // User profile hooks
      export function useProfile() {
        const { user } = useAuth();

        return useSWR(
          user?.id ? `/api/profile/${user.id}` : null,
          async () => {
            if (!user?.id) return null;
            return await api.getUserProfile(user.id);
          },
          {
            revalidateOnFocus: false,
            dedupingInterval: 300000, // 5 minutes
          }
        );
      }

      export function useUpdateProfile() {
        const { mutate } = useSWRConfig(); return {
          trigger: async (profileData) => {
            const result = await api.updateUserProfile(profileData); mutate(key => typeof key === 'string' && key.includes('/api/profile/')); return result;
          }
        };
      }

      // Search hooks
      export function useSearch(query, category = null) {
        const key = query
          ? `/api/search?q=${encodeURIComponent(query)}&category=${category || ''}`
          : null;

        return useSWR(key, fetcher, {
          revalidateOnFocus: false,
          dedupingInterval: 30000, // 30 seconds
        });
      }

      // Admin hooks
      export function useAdminStats() {
        const { user } = useAuth();

        return useSWR(
          user?.role === 'admin' ? '/api/admin/stats' : null,
          fetcher,
          {
            revalidateOnFocus: true,
            refreshInterval: 60000, // 1 minute
          }
        );
      }

      export function useAdminOrders() {
        const { user } = useAuth();

        return useSWR(
          user?.role === 'admin' ? '/api/admin/orders' : null,
          fetcher,
          {
            revalidateOnFocus: true,
            dedupingInterval: 30000, // 30 seconds
          }
        );
      }

      // Generic hooks
      export function useApiData(endpoint, options = {}) {
        return useSWR(endpoint, fetcher, {
          revalidateOnFocus: false,
          dedupingInterval: 60000,
          ...options,
        });
      }

      export function useApiMutation(endpoint, mutationFn) {

        const { mutate } = useSWRConfig(); return {
          trigger: async (data) => {
            const result = await mutationFn(data);
            mutate(endpoint); return result;
          }
        };
      } 
    