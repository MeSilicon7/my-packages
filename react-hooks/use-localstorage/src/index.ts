import { useState, useEffect } from 'react';

/**
 * A custom React hook for managing localStorage with TypeScript support.
 * Provides functionality for reading, saving/updating, and deleting data from localStorage.
 * 
 * This hook is SSR-safe and handles JSON serialization/deserialization automatically.
 * It gracefully handles localStorage errors and provides a fallback to the initial value.
 *
 * @template T - The type of the value stored in localStorage
 * @param {string} key - The localStorage key to store/retrieve the data. Must be unique within your application.
 * @param {T} initialValue - The initial value to use if no data is stored in localStorage or if localStorage is unavailable (e.g., SSR).
 * 
 * @returns {[T, (value: T | ((val: T) => T)) => void, () => void]} A tuple containing:
 *   - `storedValue`: The current value from localStorage or the initial value
 *   - `setValue`: Function to update the stored value (supports both direct values and updater functions)
 *   - `deleteValue`: Function to remove the value from localStorage and reset to initial value
 * 
 * @example
 * ```typescript
 * // Basic usage with string
 * const [name, setName, deleteName] = useLocalStorage<string>('userName', '');
 * 
 * // Usage with object
 * interface User {
 *   id: number;
 *   name: string;
 * }
 * const [user, setUser, deleteUser] = useLocalStorage<User | null>('currentUser', null);
 * 
 * // Update with direct value
 * setName('John Doe');
 * 
 * // Update with function (like useState)
 * setUser(prevUser => ({ ...prevUser, name: 'Jane' }));
 * 
 * // Delete from localStorage
 * deleteUser(); // Resets to null (initial value)
 * ```
 * 
 * @example
 * ```typescript
 * // Usage with array
 * const [todos, setTodos, clearTodos] = useLocalStorage<string[]>('todoList', []);
 * 
 * // Add new todo
 * setTodos(prev => [...prev, 'New task']);
 * 
 * // Clear all todos
 * clearTodos();
 * ```
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

  /**
   * Updates the stored value in both state and localStorage.
   * Supports both direct values and updater functions (similar to useState).
   * 
   * @param {T | ((val: T) => T)} value - The new value or an updater function that receives the current value
   * 
   * @example
   * ```typescript
   * // Direct value
   * setValue('new value');
   * 
   * // Updater function
   * setValue(prevValue => prevValue + 1);
   * ```
   */
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

  /**
   * Removes the value from localStorage and resets the state to the initial value.
   * This is useful for clearing user data, resetting forms, or logging out users.
   * 
   * @example
   * ```typescript
   * // Clear user session
   * deleteValue();
   * // storedValue will now be reset to initialValue
   * ```
   */
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