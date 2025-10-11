# useFetch Hook

A simple and flexible React hook for fetching data from APIs with support for automatic revalidation, error handling, and data transformation.

[![npm version](https://badge.fury.io/js/@mesilicon7%2Fuse-fetch.svg?icon=si%3Anpm)](https://badge.fury.io/js/@mesilicon7%2Fuse-fetch)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@mesilicon7/use-fetch)
![license](https://img.shields.io/npm/l/@mesilicon7/use-fetch)

## Features

- 🚀 **Simple API** - Easy to use with sensible defaults
- 🔄 **Automatic Revalidation** - Keep your data fresh with configurable intervals
- 🎯 **TypeScript Support** - Full type safety with generic data types
- 🛡️ **Error Handling** - Built-in error states and handling
- 🔧 **Data Transformation** - Transform response data before setting state
- 📦 **Multiple Body Types** - Support for JSON, FormData, and custom bodies
- ⚡ **Manual Execution** - Control when requests are made
- 🎛️ **Flexible Configuration** - Extensive options for different use cases

## Installation

```bash
npm install @mesilicon7/use-fetch
# or
yarn add @mesilicon7/use-fetch
# or
pnpm add @mesilicon7/use-fetch
```

## Quick Start

```typescript
import { useFetch } from '@mesilicon7/use-fetch';

function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useFetch<User>({
    url: `/api/users/${userId}`
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
```

## API Reference

### useFetch(config)

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | `string` | - | **Required.** The URL to fetch from |
| `options` | `FetchOptions` | `{}` | Fetch options (method, headers, body, etc.) |
| `immediate` | `boolean` | `true` | Whether to fetch immediately when hook mounts |
| `transform` | `(data: any) => T` | - | Function to transform response data |
| `revalidateInterval` | `number` | `5000` | Interval in ms for automatic revalidation |
| `once` | `boolean` | `false` | If true, only fetch once and ignore revalidation |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `data` | `T \| null` | The fetched data, null if not yet loaded or error occurred |
| `error` | `Error \| null` | Error object if request failed, null otherwise |
| `loading` | `boolean` | Loading state - true when request is in progress |
| `execute` | `() => Promise<void>` | Function to manually trigger the fetch request |

## Examples

### Basic GET Request

```typescript
const { data, loading, error } = useFetch<User[]>({
  url: '/api/users'
});
```

### POST Request with Manual Execution

```typescript
function CreateUser() {
  const { execute, loading, error } = useFetch({
    url: '/api/users',
    options: {
      method: 'POST',
      body: { name: 'John Doe', email: 'john@example.com' }
    },
    immediate: false // Don't execute immediately
  });

  const handleSubmit = async () => {
    await execute();
    // Handle success...
  };

  return (
    <button onClick={handleSubmit} disabled={loading}>
      {loading ? 'Creating...' : 'Create User'}
    </button>
  );
}
```

### File Upload with FormData

```typescript
function FileUpload() {
  const { execute, loading } = useFetch({
    url: '/api/upload',
    options: {
      method: 'POST',
      body: formData // FormData object
    },
    immediate: false
  });

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    execute();
  };

  return (
    <input
      type="file"
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      disabled={loading}
    />
  );
}
```

### Data Transformation

```typescript
interface ApiResponse {
  users: RawUser[];
  total: number;
}

interface ProcessedUser {
  id: string;
  fullName: string;
  isActive: boolean;
}

const { data } = useFetch<ProcessedUser[]>({
  url: '/api/users',
  transform: (response: ApiResponse) => 
    response.users.map(user => ({
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      isActive: user.status === 'active'
    }))
});
```

### Custom Revalidation

```typescript
// Revalidate every 30 seconds
const { data } = useFetch<Stats>({
  url: '/api/stats',
  revalidateInterval: 30000
});

// Fetch only once, no revalidation
const { data } = useFetch<Config>({
  url: '/api/config',
  once: true
});
```

### Custom Headers and Authentication

```typescript
const { data } = useFetch<PrivateData>({
  url: '/api/private',
  options: {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Custom-Header': 'custom-value'
    },
    credentials: 'include'
  }
});
```

### Error Handling

```typescript
function DataComponent() {
  const { data, loading, error, execute } = useFetch<Data>({
    url: '/api/data'
  });

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={execute}>Retry</button>
      </div>
    );
  }

  return <DataDisplay data={data} />;
}
```

### Dependent Requests

```typescript
function UserPosts({ userId }: { userId?: string }) {
  const { data: posts, loading } = useFetch<Post[]>({
    url: userId ? `/api/users/${userId}/posts` : '',
    // Only fetch when userId is available
  });

  if (!userId) return <div>Select a user</div>;
  if (loading) return <div>Loading posts...</div>;

  return (
    <div>
      {posts?.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

## TypeScript Support

The hook is fully typed and supports generic type parameters:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

// data will be typed as User | null
const { data, loading, error } = useFetch<User>({
  url: '/api/user/123'
});
```

## Best Practices

1. **Use TypeScript** - Define interfaces for your API responses
2. **Handle Loading States** - Always provide feedback during requests
3. **Handle Errors** - Implement proper error handling and retry mechanisms
4. **Optimize Revalidation** - Set appropriate intervals or use `once: true` for static data
5. **Transform Data** - Use the transform function to shape data for your components
6. **Manual Execution** - Use `immediate: false` for user-triggered requests

## License

MIT
