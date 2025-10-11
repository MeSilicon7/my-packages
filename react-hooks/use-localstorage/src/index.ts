import { useState, useEffect } from 'react';

/**
 * A custom React hook for managing localStorage with TypeScript support.
 * Provides functionality for reading, saving/updating, and deleting data.
 *
 * @param key - The localStorage key to store/retrieve the data.
 * @param initialValue - The initial value to use if no data is stored in localStorage.
 * @returns A tuple containing the current stored value, a setter function, and a delete function.
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Initialize with initialValue (SSR-safe)
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Effect to read from localStorage after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  };

  // Delete the value from localStorage and reset to initial value
  const deleteValue = () => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error deleting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, deleteValue];
}

export default useLocalStorage;