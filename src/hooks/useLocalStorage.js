'use client';
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue, options = {}) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true,
    validateData = () => true,
    fallbackValue = null
  } = options;

  // State initialization
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      
      if (item === null) {
        return initialValue;
      }

      const parsed = deserialize(item);
      
      // Validate the data
      if (!validateData(parsed)) {
        console.warn(`Invalid data found in localStorage for key "${key}". Using fallback.`);
        return fallbackValue || initialValue;
      }

      return parsed;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return fallbackValue || initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function to update based on previous value
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        if (valueToStore === null || valueToStore === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, serialize(valueToStore));
        }
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);

  // Sync state with localStorage changes (for cross-tab sync)
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserialize(e.newValue);
          if (validateData(newValue)) {
            setStoredValue(newValue);
          }
        } catch (error) {
          console.error(`Error syncing localStorage change for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, deserialize, validateData, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}

// Utility function for typed localStorage
export function createTypedLocalStorage(key, initialValue, validator) {
  return function useTypedLocalStorage() {
    return useLocalStorage(key, initialValue, {
      validateData: validator,
      fallbackValue: initialValue
    });
  };
}

// Common localStorage patterns
export const useAuth = createTypedLocalStorage('auth_backup', null, (data) => {
  return data === null || (typeof data === 'object' && data.id && data.email);
});

export const useCartBackup = createTypedLocalStorage('cart_backup', [], (data) => {
  return Array.isArray(data);
});

export const useUserPreferences = createTypedLocalStorage('user_preferences', {
  theme: 'light',
  language: 'tr',
  notifications: true
}, (data) => {
  return typeof data === 'object' && data.theme && data.language !== undefined;
});

// Enhanced localStorage with expiration
export function useLocalStorageWithExpiry(key, initialValue, ttlInMinutes = 60) {
  const [value, setValue, removeValue] = useLocalStorage(
    key,
    { data: initialValue, timestamp: Date.now() },
    {
      validateData: (data) => {
        if (!data || typeof data !== 'object' || !data.timestamp) {
          return false;
        }
        
        const now = Date.now();
        const ttlInMs = ttlInMinutes * 60 * 1000;
        
        // Check if data has expired
        if (now - data.timestamp > ttlInMs) {
          return false;
        }
        
        return true;
      },
      fallbackValue: { data: initialValue, timestamp: Date.now() }
    }
  );

  const setValueWithTimestamp = useCallback((newValue) => {
    setValue({
      data: newValue instanceof Function ? newValue(value?.data) : newValue,
      timestamp: Date.now()
    });
  }, [setValue, value?.data]);

  return [value?.data, setValueWithTimestamp, removeValue];
}

export default useLocalStorage; 