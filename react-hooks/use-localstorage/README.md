# @mesilicon7/use-localstorage

A lightweight, TypeScript-friendly React hook for managing localStorage with automatic JSON serialization, SSR safety, and comprehensive error handling.

## Features

- 🔒 **TypeScript Support** - Full type safety with generic types
- 🌐 **SSR Safe** - Works seamlessly with remix.js/react router 7 and other SSR frameworks
- 📦 **Automatic Serialization** - Handles JSON stringify/parse automatically
- 🛡️ **Error Handling** - Graceful fallbacks when localStorage is unavailable
- 🔄 **React-like API** - Similar to `useState` with additional localStorage persistence
- 🗑️ **Delete Functionality** - Built-in method to clear stored values
- 📱 **Cross-browser Compatible** - Works across all modern browsers

## Installation

```bash
npm install @mesilicon7/use-localstorage
```

```bash
yarn add @mesilicon7/use-localstorage
```

```bash
pnpm add @mesilicon7/use-localstorage
```

## Basic Usage

```typescript
import useLocalStorage from '@mesilicon7/use-localstorage';

function App() {
  const [name, setName, deleteName] = useLocalStorage<string>('userName', '');

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button onClick={deleteName}>Clear Name</button>
      <p>Hello, {name || 'Anonymous'}!</p>
    </div>
  );
}
```

## Advanced Examples

### Working with Objects

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile() {
  const [user, setUser, deleteUser] = useLocalStorage<User | null>('currentUser', null);

  const updateUser = (updates: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
  };

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.name}!</h2>
          <button onClick={() => updateUser({ name: 'Updated Name' })}>
            Update Name
          </button>
          <button onClick={deleteUser}>Logout</button>
        </div>
      ) : (
        <button onClick={() => setUser({ id: 1, name: 'John', email: 'john@example.com' })}>
          Login
        </button>
      )}
    </div>
  );
}
```

### Managing Arrays

```typescript
function TodoList() {
  const [todos, setTodos, clearTodos] = useLocalStorage<string[]>('todoList', []);

  const addTodo = (todo: string) => {
    setTodos(prev => [...prev, todo]);
  };

  const removeTodo = (index: number) => {
    setTodos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <button onClick={() => addTodo(`Task ${todos.length + 1}`)}>
        Add Todo
      </button>
      <button onClick={clearTodos}>Clear All</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo}
            <button onClick={() => removeTodo(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Complex State with Updater Functions

```typescript
interface Settings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

function SettingsPanel() {
  const [settings, setSettings, resetSettings] = useLocalStorage<Settings>('appSettings', {
    theme: 'light',
    notifications: true,
    language: 'en'
  });

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const toggleNotifications = () => {
    setSettings(prev => ({
      ...prev,
      notifications: !prev.notifications
    }));
  };

  return (
    <div>
      <h3>Settings</h3>
      <button onClick={toggleTheme}>
        Theme: {settings.theme}
      </button>
      <button onClick={toggleNotifications}>
        Notifications: {settings.notifications ? 'On' : 'Off'}
      </button>
      <button onClick={resetSettings}>Reset to Defaults</button>
    </div>
  );
}
```

## API Reference

### `useLocalStorage<T>(key: string, initialValue: T)`

#### Parameters

- **`key`** (`string`) - The localStorage key to store/retrieve the data. Must be unique within your application.
- **`initialValue`** (`T`) - The initial value to use if no data is stored in localStorage or if localStorage is unavailable.

#### Returns

A tuple containing:

- **`storedValue`** (`T`) - The current value from localStorage or the initial value
- **`setValue`** (`(value: T | ((val: T) => T)) => void`) - Function to update the stored value
- **`deleteValue`** (`() => void`) - Function to remove the value from localStorage and reset to initial value

#### TypeScript Generics

The hook supports full TypeScript generics for type safety:

```typescript
// String
const [text, setText] = useLocalStorage<string>('text', '');

// Number
const [count, setCount] = useLocalStorage<number>('count', 0);

// Boolean
const [isEnabled, setIsEnabled] = useLocalStorage<boolean>('enabled', false);

// Custom Interface
interface Config {
  apiUrl: string;
  timeout: number;
}
const [config, setConfig] = useLocalStorage<Config>('config', {
  apiUrl: 'https://api.example.com',
  timeout: 5000
});

// Union Types
const [status, setStatus] = useLocalStorage<'loading' | 'success' | 'error'>('status', 'loading');

// Optional Types
const [user, setUser] = useLocalStorage<User | null>('user', null);
```

## SSR Compatibility

This hook is designed to work seamlessly with Server-Side Rendering frameworks like remix.js/react router 7:

```typescript
// remix.js/react router 7 example
function MyComponent() {
  const [data, setData] = useLocalStorage('myData', { initialized: false });
  
  // On the server, this will use the initial value
  // On the client, it will hydrate with localStorage data
  
  return <div>{data.initialized ? 'Client' : 'Server'}</div>;
}
```

## Error Handling

The hook includes comprehensive error handling:

- **Parse Errors**: If stored data can't be parsed as JSON, falls back to initial value
- **Storage Unavailable**: If localStorage is disabled or unavailable, operates in memory-only mode
- **Quota Exceeded**: Logs errors when localStorage quota is exceeded
- **Invalid Keys**: Handles edge cases with malformed localStorage keys

## Browser Support

- Chrome ≥ 4
- Firefox ≥ 3.5
- Safari ≥ 4
- Edge ≥ 12
- Internet Explorer ≥ 8

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

[@mesilicon7](https://github.com/mesilicon7)
