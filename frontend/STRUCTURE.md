# Frontend Structure Guide

## Directory Organization

```
frontend/src/
├── app/                 # Next.js App Router - page routes
├── components/          # Reusable React components
│   ├── CommentSection.tsx
│   ├── CreatePost.tsx
│   ├── FollowButton.tsx
│   ├── Navbar.tsx
│   ├── PostCard.tsx
│   └── Sidebar.tsx
├── lib/                 # Core libraries and utilities
│   ├── api.ts          # API client and endpoints
│   ├── apiClient.ts    # HTTP client configuration
│   └── auth.ts         # Authentication setup
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hooks
│   ├── usePost.ts      # Post operations hook
│   ├── useUser.ts      # User operations hooks
│   └── index.ts        # Barrel export
├── types/              # TypeScript types and interfaces
│   └── index.ts        # Consolidated type definitions
├── constants/          # Application constants
│   └── index.ts        # App config, routes, error messages
├── utils/              # Utility functions
│   └── index.ts        # Helper functions (date formatting, validation, etc.)
├── styles/             # Global styles
│   └── globals.css
└── public/             # Static assets
```

## Usage Examples

### Using Hooks

```tsx
import { useProtectedRoute, usePosts } from '@/hooks';

export default function MyPage() {
  const { session, isAuthenticated } = useProtectedRoute();
  const { posts, isLoading, fetchPosts, createPost } = usePosts(session?.user?.id);

  return (
    // Your component
  );
}
```

### Using Types

```tsx
import type { Post, User, Comment } from "@/types";

const post: Post = {
  id: "123",
  content: "Hello",
  userId: "user1",
  // ... other properties
};
```

### Using Constants

```tsx
import { ROUTES, UI_CONFIG, ERROR_MESSAGES } from "@/constants";

// Navigate
router.push(ROUTES.HOME);

// Configuration
const pageSize = UI_CONFIG.POSTS_PER_PAGE;

// Messages
toast.error(ERROR_MESSAGES.NETWORK_ERROR);
```

### Using Utilities

```tsx
import { formatDate, truncateText, formatNumber, debounce } from "@/utils";

const formattedDate = formatDate(new Date().toISOString()); // "just now"
const short = truncateText("Long text...", 50); // "Long text..."
const count = formatNumber(1500); // "1.5K"
```

## Custom Hooks

### useProtectedRoute

Ensures user is authenticated before rendering page. Redirects to login if not.

### useCurrentUser

Returns the current logged-in user.

### usePosts

Manages posts - fetch, create, delete, like, unlike.

### useUser

Manages user profile data and updates.

### useFollow

Manages following/unfollowing users.

### useSearchUsers

Searches for users by query.

## Best Practices

1. **Import from barrel exports**: Use `@/hooks` instead of `@/hooks/useAuth`
2. **Type safety**: Always import types from `@/types`
3. **Use constants**: Avoid magic strings, use constants instead
4. **Utility functions**: Use provided utilities for common operations
5. **Error handling**: Use error messages from `ERROR_MESSAGES` constant

## File Organization Rules

- **Components**: One component per file, with clear responsibility
- **Hooks**: One hook per file, export in barrel file
- **Utils**: Group related utilities in one file, export individually
- **Types**: All types in one file for easy maintenance
- **Constants**: Group related constants together
