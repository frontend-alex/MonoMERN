# React Query Hooks Documentation

This document provides comprehensive examples and use cases for the React Query wrapper hooks (`useApiQuery` and `useApiMutation`) available in the MonoMERN Stack client application.

## Table of Contents

- [useApiQuery Hook](#useapiquery-hook)
- [useApiMutation Hook](#useapimutation-hook)
- [CRUD Operations Examples](#crud-operations-examples)
- [Advanced Use Cases](#advanced-use-cases)

## useApiQuery Hook

The `useApiQuery` hook is a wrapper around TanStack Query's `useQuery` that provides automatic API integration with proper error handling and caching.

### Basic Usage

```typescript
import { useApiQuery } from '@/hooks/hook';

function UserProfile() {
  const { data, isLoading, error, refetch } = useApiQuery<User>(
    ['user', 'profile'],
    '/api/v1/users/profile'
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data?.data.username}</h1>
      <p>{data?.data.email}</p>
    </div>
  );
}
```

### With Custom Options

```typescript
import { useApiQuery } from '@/hooks/hook';

function PostsList() {
  const { data, isLoading } = useApiQuery<Post[]>(
    ['posts'],
    '/api/v1/posts',
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      enabled: true,
      onSuccess: (data) => {
        console.log('Posts loaded:', data.data.length);
      },
      onError: (error) => {
        console.error('Failed to load posts:', error.message);
      }
    }
  );

  return (
    <div>
      {isLoading ? (
        <div>Loading posts...</div>
      ) : (
        <div>
          {data?.data.map(post => (
            <div key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Data Transformation

```typescript
import { useApiQuery } from '@/hooks/hook';

function UserStats() {
  const { data } = useApiQuery<UserStats, { totalPosts: number; totalLikes: number }>(
    ['user', 'stats'],
    '/api/v1/users/stats',
    {
      select: (response) => ({
        totalPosts: response.data.posts.length,
        totalLikes: response.data.posts.reduce((sum, post) => sum + post.likes, 0)
      })
    }
  );

  return (
    <div>
      <p>Total Posts: {data?.totalPosts}</p>
      <p>Total Likes: {data?.totalLikes}</p>
    </div>
  );
}
```

## useApiMutation Hook

The `useApiMutation` hook is a wrapper around TanStack Query's `useMutation` that provides automatic API integration with query invalidation.

### Basic Usage

```typescript
import { useApiMutation } from '@/hooks/hook';

function CreatePost() {
  const createPostMutation = useApiMutation<Post, CreatePostData>(
    'POST',
    '/api/v1/posts'
  );

  const handleSubmit = async (formData: CreatePostData) => {
    try {
      const result = await createPostMutation.mutateAsync(formData);
      console.log('Post created:', result.data);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      handleSubmit(data as CreatePostData);
    }}>
      <input name="title" placeholder="Post Title" required />
      <textarea name="content" placeholder="Post Content" required />
      <button 
        type="submit" 
        disabled={createPostMutation.isPending}
      >
        {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

### With Query Invalidation

```typescript
import { useApiMutation } from '@/hooks/hook';

function UpdatePost({ postId }: { postId: string }) {
  const updatePostMutation = useApiMutation<Post, UpdatePostData>(
    'PUT',
    `/api/v1/posts/${postId}`,
    {
      invalidateQueries: [['posts'], ['post', postId]],
      onSuccess: (data) => {
        console.log('Post updated:', data.data);
      },
      onError: (error) => {
        console.error('Failed to update post:', error.message);
      }
    }
  );

  const handleUpdate = async (data: UpdatePostData) => {
    await updatePostMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      handleUpdate(data as UpdatePostData);
    }}>
      <input name="title" placeholder="Post Title" required />
      <textarea name="content" placeholder="Post Content" required />
      <button 
        type="submit" 
        disabled={updatePostMutation.isPending}
      >
        {updatePostMutation.isPending ? 'Updating...' : 'Update Post'}
      </button>
    </form>
  );
}
```

### Dynamic Endpoints

```typescript
import { useApiMutation } from '@/hooks/hook';

function DeletePost({ postId }: { postId: string }) {
  const deletePostMutation = useApiMutation<void, void>(
    'DELETE',
    (data) => `/api/v1/posts/${postId}`,
    {
      invalidateQueries: [['posts']],
      onSuccess: () => {
        console.log('Post deleted successfully');
      }
    }
  );

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deletePostMutation.mutateAsync();
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={deletePostMutation.isPending}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      {deletePostMutation.isPending ? 'Deleting...' : 'Delete Post'}
    </button>
  );
}
```

## CRUD Operations Examples

### CREATE Operations

#### User Registration

```typescript
import { useApiMutation } from '@/hooks/hook';
import { useNavigate } from 'react-router-dom';

function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useApiMutation<User, RegisterData>(
    'POST',
    '/api/v1/auth/register',
    {
      onSuccess: (data) => {
        console.log('User registered:', data.data);
        navigate('/login');
      },
      onError: (error) => {
        console.error('Registration failed:', error.message);
      }
    }
  );

  const handleRegister = async (userData: RegisterData) => {
    await registerMutation.mutateAsync(userData);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const userData = Object.fromEntries(formData);
      handleRegister(userData as RegisterData);
    }}>
      <input name="username" placeholder="Username" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button 
        type="submit" 
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

#### Creating a Post with File Upload

```typescript
import { useApiMutation } from '@/hooks/hook';

function CreatePostWithImage() {
  const createPostMutation = useApiMutation<Post, FormData>(
    'POST',
    '/api/v1/posts',
    {
      invalidateQueries: [['posts']],
      onSuccess: (data) => {
        console.log('Post created with image:', data.data);
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createPostMutation.mutateAsync(formData);
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input name="title" placeholder="Post Title" required />
      <textarea name="content" placeholder="Post Content" required />
      <input name="image" type="file" accept="image/*" />
      <button 
        type="submit" 
        disabled={createPostMutation.isPending}
      >
        {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

### READ Operations

#### Fetching User Profile

```typescript
import { useApiQuery } from '@/hooks/hook';

function UserProfile() {
  const { data: profile, isLoading, error, refetch } = useApiQuery<User>(
    ['user', 'profile'],
    '/api/v1/users/profile',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Failed to fetch profile:', error.message);
      }
    }
  );

  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div>Error loading profile: {error.message}</div>;

  return (
    <div>
      <h1>{profile?.data.username}</h1>
      <p>{profile?.data.email}</p>
      <button onClick={() => refetch()}>Refresh Profile</button>
    </div>
  );
}
```

#### Fetching Posts with Pagination

```typescript
import { useApiQuery } from '@/hooks/hook';
import { useState } from 'react';

function PostsList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, error } = useApiQuery<{ posts: Post[]; total: number }>(
    ['posts', page, limit],
    `/api/v1/posts?page=${page}&limit=${limit}`,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      keepPreviousData: true
    }
  );

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const totalPages = Math.ceil((data?.data.total || 0) / limit);

  return (
    <div>
      <div>
        {data?.data.posts.map(post => (
          <div key={post.id} className="post-item">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
      
      <div className="pagination">
        <button 
          onClick={() => setPage(page - 1)} 
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button 
          onClick={() => setPage(page + 1)} 
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

#### Search with Debouncing

```typescript
import { useApiQuery } from '@/hooks/hook';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

function SearchPosts() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading } = useApiQuery<Post[]>(
    ['posts', 'search', debouncedSearchTerm],
    `/api/v1/posts/search?q=${encodeURIComponent(debouncedSearchTerm)}`,
    {
      enabled: debouncedSearchTerm.length > 2,
      staleTime: 1 * 60 * 1000 // 1 minute
    }
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {isLoading && <div>Searching...</div>}
      
      {data?.data && (
        <div>
          {data.data.map(post => (
            <div key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### UPDATE Operations

#### Updating User Profile

```typescript
import { useApiMutation, useApiQuery } from '@/hooks/hook';

function EditProfile() {
  const { data: profile } = useApiQuery<User>(
    ['user', 'profile'],
    '/api/v1/users/profile'
  );

  const updateProfileMutation = useApiMutation<User, UpdateProfileData>(
    'PUT',
    '/api/v1/users/profile',
    {
      invalidateQueries: [['user', 'profile']],
      onSuccess: (data) => {
        console.log('Profile updated:', data.data);
      }
    }
  );

  const handleUpdate = async (profileData: UpdateProfileData) => {
    await updateProfileMutation.mutateAsync(profileData);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const profileData = Object.fromEntries(formData);
      handleUpdate(profileData as UpdateProfileData);
    }}>
      <input 
        name="username" 
        defaultValue={profile?.data.username} 
        placeholder="Username" 
      />
      <input 
        name="email" 
        type="email" 
        defaultValue={profile?.data.email} 
        placeholder="Email" 
      />
      <button 
        type="submit" 
        disabled={updateProfileMutation.isPending}
      >
        {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}
```

#### Partial Updates with PATCH

```typescript
import { useApiMutation } from '@/hooks/hook';

function UpdatePostStatus({ postId }: { postId: string }) {
  const updateStatusMutation = useApiMutation<Post, { status: string }>(
    'PATCH',
    `/api/v1/posts/${postId}/status`,
    {
      invalidateQueries: [['posts'], ['post', postId]]
    }
  );

  const handleStatusChange = async (status: string) => {
    await updateStatusMutation.mutateAsync({ status });
  };

  return (
    <div>
      <button 
        onClick={() => handleStatusChange('published')}
        disabled={updateStatusMutation.isPending}
      >
        Publish
      </button>
      <button 
        onClick={() => handleStatusChange('draft')}
        disabled={updateStatusMutation.isPending}
      >
        Save as Draft
      </button>
    </div>
  );
}
```

### DELETE Operations

#### Deleting User Account

```typescript
import { useApiMutation } from '@/hooks/hook';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function DeleteAccount() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const deleteAccountMutation = useApiMutation<void, void>(
    'DELETE',
    '/api/v1/users/account',
    {
      onSuccess: () => {
        logout();
        navigate('/');
      },
      onError: (error) => {
        console.error('Failed to delete account:', error.message);
      }
    }
  );

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      await deleteAccountMutation.mutateAsync();
    }
  };

  return (
    <div>
      <h3>Delete Account</h3>
      <p>This action cannot be undone. All your data will be permanently deleted.</p>
      <button 
        onClick={handleDeleteAccount}
        disabled={deleteAccountMutation.isPending}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
      </button>
    </div>
  );
}
```

#### Bulk Delete Operations

```typescript
import { useApiMutation } from '@/hooks/hook';

function BulkDeletePosts() {
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  
  const bulkDeleteMutation = useApiMutation<void, { postIds: string[] }>(
    'DELETE',
    '/api/v1/posts/bulk',
    {
      invalidateQueries: [['posts']],
      onSuccess: () => {
        setSelectedPosts([]);
        console.log('Posts deleted successfully');
      }
    }
  );

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedPosts.length} posts?`)) {
      await bulkDeleteMutation.mutateAsync({ postIds: selectedPosts });
    }
  };

  return (
    <div>
      <button 
        onClick={handleBulkDelete}
        disabled={selectedPosts.length === 0 || bulkDeleteMutation.isPending}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedPosts.length} Posts`}
      </button>
    </div>
  );
}
```

## Advanced Use Cases

### Optimistic Updates

```typescript
import { useApiMutation, useApiQuery } from '@/hooks/hook';
import { useQueryClient } from '@tanstack/react-query';

function LikePost({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  
  const likeMutation = useApiMutation<Post, void>(
    'POST',
    `/api/v1/posts/${postId}/like`,
    {
      onMutate: async () => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['post', postId] });
        
        // Snapshot the previous value
        const previousPost = queryClient.getQueryData(['post', postId]);
        
        // Optimistically update
        queryClient.setQueryData(['post', postId], (old: any) => ({
          ...old,
          data: {
            ...old.data,
            likes: old.data.likes + 1,
            liked: true
          }
        }));
        
        return { previousPost };
      },
      onError: (err, variables, context) => {
        // Rollback on error
        queryClient.setQueryData(['post', postId], context?.previousPost);
      },
      onSettled: () => {
        // Refetch after error or success
        queryClient.invalidateQueries({ queryKey: ['post', postId] });
      }
    }
  );

  return (
    <button 
      onClick={() => likeMutation.mutate()}
      disabled={likeMutation.isPending}
    >
      Like Post
    </button>
  );
}
```

### Real-time Updates with WebSocket

```typescript
import { useApiQuery } from '@/hooks/hook';
import { useEffect } from 'react';

function RealTimePosts() {
  const { data, refetch } = useApiQuery<Post[]>(
    ['posts'],
    '/api/v1/posts',
    {
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  );

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/ws/posts');
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'POST_CREATED':
        case 'POST_UPDATED':
        case 'POST_DELETED':
          refetch(); // Refetch when changes occur
          break;
      }
    };

    return () => ws.close();
  }, [refetch]);

  return (
    <div>
      {data?.data.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
```

### Conditional Queries

```typescript
import { useApiQuery } from '@/hooks/hook';
import { useAuth } from '@/contexts/AuthContext';

function UserDashboard() {
  const { isAuthenticated, user } = useAuth();
  
  const { data: profile } = useApiQuery<User>(
    ['user', 'profile'],
    '/api/v1/users/profile',
    {
      enabled: isAuthenticated // Only fetch when authenticated
    }
  );

  const { data: posts } = useApiQuery<Post[]>(
    ['user', 'posts'],
    '/api/v1/users/posts',
    {
      enabled: isAuthenticated && !!user?.id
    }
  );

  if (!isAuthenticated) {
    return <div>Please log in to view your dashboard</div>;
  }

  return (
    <div>
      <h1>Welcome, {profile?.data.username}</h1>
      <div>
        <h2>Your Posts</h2>
        {posts?.data.map(post => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Error Boundaries Integration

```typescript
import { useApiQuery } from '@/hooks/hook';
import { ErrorBoundary } from 'react-error-boundary';

function PostsWithErrorBoundary() {
  const { data, error } = useApiQuery<Post[]>(
    ['posts'],
    '/api/v1/posts',
    {
      onError: (error) => {
        // Log error for monitoring
        console.error('Posts query failed:', error);
      }
    }
  );

  if (error) {
    throw error; // Let ErrorBoundary handle it
  }

  return (
    <div>
      {data?.data.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong loading posts</div>}
      onError={(error) => console.error('Posts error:', error)}
    >
      <PostsWithErrorBoundary />
    </ErrorBoundary>
  );
}
```

This documentation provides comprehensive examples for using the React Query wrapper hooks (`useApiQuery` and `useApiMutation`) in the MonoMERN Stack application, covering all CRUD operations and advanced patterns.