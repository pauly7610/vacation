import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Ensure we're in a browser environment
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value: T) => {
    try {
      // Ensure we're in a browser environment
      if (typeof window === 'undefined') {
        console.warn('localStorage not available in this environment');
        return;
      }
      
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
      
      // Dispatch a custom event to sync across components
      window.dispatchEvent(new CustomEvent('wanderlist-storage-update', {
        detail: { key, value }
      }));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    const handleCustomStorageUpdate = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for changes from same tab
    window.addEventListener('wanderlist-storage-update', handleCustomStorageUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wanderlist-storage-update', handleCustomStorageUpdate as EventListener);
    };
  }, [key]);

  return [storedValue, setValue];
}