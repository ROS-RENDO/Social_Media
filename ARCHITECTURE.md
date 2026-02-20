# Social Media MVP - Architecture & Flow Explanation

## 📐 Overall Architecture

```
┌─────────────────┐         HTTP/REST API         ┌─────────────────┐
│                 │◄──────────────────────────────►│                 │
│   Next.js       │    (Port 3000)                │   Express.js    │
│   Frontend      │                               │   Backend       │
│   (React)       │                               │   (Port 3001)   │
│                 │                               │                 │
└─────────────────┘                               └─────────────────┘
                                                           │
                                                           │ MySQL Queries
                                                           ▼
                                                  ┌─────────────────┐
                                                  │   MySQL         │
                                                  │   Database      │
                                                  │   (Port 3306)   │
                                                  └─────────────────┘
```

---

## 🔄 Complete User Flow

### 1. **Authentication Flow**
```
User visits app → Redirected to /login (if not authenticated)
  ↓
User enters email/password → Frontend calls Better Auth API
  ↓
POST /api/auth/sign-in → Better Auth validates credentials
  ↓
Session created → Cookie set → User redirected to home feed
```

### 2. **Viewing Feed Flow**
```
User on home page → useSession() checks authentication
  ↓
If authenticated → Calls api.getPosts(userId)
  ↓
GET /api/posts?userId=xxx → Backend queries database
  ↓
SELECT posts + user info + like counts → Returns JSON
  ↓
Frontend renders PostCard components → User sees feed
```

### 3. **Creating Post Flow**
```
User types in CreatePost component → Clicks "Post"
  ↓
api.createPost({ userId, content, imageUrl })
  ↓
POST /api/posts → Backend inserts into `post` table
  ↓
Returns new post → Frontend refreshes feed
```

### 4. **Like Post Flow**
```
User clicks heart icon → PostCard calls api.likePost()
  ↓
POST /api/likes/:postId → Backend inserts into `like` table
  ↓
Returns success → Frontend updates UI (like count + icon state)
```

### 5. **Follow User Flow**
```
User visits profile → FollowButton checks follow status
  ↓
GET /api/follows/:userId/status → Checks if following
  ↓
User clicks Follow → POST /api/follows/:userId
  ↓
Backend inserts into `follow` table → UI updates
```

---

## 🗄️ Database Structure

### **Core Tables**

#### 1. `user` Table (Better Auth + Custom Fields)
```sql
- id (VARCHAR) - Primary key, UUID
- name (VARCHAR) - User's full name
- email (VARCHAR) - Unique email address
- emailVerified (BOOLEAN) - Email verification status
- image (VARCHAR) - Profile picture URL
- bio (TEXT) - User biography
- username (VARCHAR) - Unique username
- createdAt, updatedAt (DATETIME) - Timestamps
```

**Relationships:**
- One user can have many posts (`post.userId → user.id`)
- One user can follow many users (`follow.followerId → user.id`)
- One user can be followed by many users (`follow.followingId → user.id`)
- One user can like many posts (`like.userId → user.id`)

#### 2. `session` Table (Better Auth)
```sql
- id (VARCHAR) - Session ID
- userId (VARCHAR) - Foreign key to user
- token (VARCHAR) - Session token
- expiresAt (DATETIME) - When session expires
- ipAddress, userAgent - Security tracking
```

**Purpose:** Manages user authentication sessions

#### 3. `account` Table (Better Auth)
```sql
- id (VARCHAR) - Account ID
- userId (VARCHAR) - Foreign key to user
- password (VARCHAR) - Hashed password (email/password auth)
- providerId (VARCHAR) - Auth provider (e.g., "credential")
```

**Purpose:** Stores authentication credentials

#### 4. `post` Table
```sql
- id (VARCHAR) - Primary key, UUID
- userId (VARCHAR) - Foreign key to user (who created it)
- content (TEXT) - Post text content
- imageUrl (VARCHAR) - Optional image URL
- createdAt, updatedAt (DATETIME) - Timestamps
```

**Indexes:**
- `idx_userId` - Fast lookup of user's posts
- `idx_createdAt` - Fast sorting by date (DESC)

#### 5. `follow` Table (Many-to-Many Relationship)
```sql
- id (VARCHAR) - Primary key
- followerId (VARCHAR) - User who is following
- followingId (VARCHAR) - User being followed
- createdAt (DATETIME) - When follow happened
```

**Constraints:**
- `UNIQUE (followerId, followingId)` - Can't follow same person twice
- Foreign keys to `user` table (both directions)

**Example:**
- User A (id: "abc") follows User B (id: "xyz")
- Row: `{ followerId: "abc", followingId: "xyz" }`

#### 6. `like` Table (Many-to-Many Relationship)
```sql
- id (VARCHAR) - Primary key
- userId (VARCHAR) - User who liked
- postId (VARCHAR) - Post that was liked
- createdAt (DATETIME) - When like happened
```

**Constraints:**
- `UNIQUE (userId, postId)` - Can't like same post twice
- Foreign keys to `user` and `post` tables

**Example:**
- User A likes Post 123
- Row: `{ userId: "abc", postId: "123" }`

### **Database Relationships Diagram**

```
user (1) ──┐
           │
           ├──► (many) post
           │
           ├──► (many) follow (as follower)
           │
           ├──► (many) follow (as following)
           │
           └──► (many) like

post (1) ──┐
           │
           └──► (many) like
```

---

## 🖥️ Backend Structure

```
backend/
├── src/
│   ├── index.ts              # Express app entry point
│   ├── auth.ts               # Better Auth configuration
│   ├── db/
│   │   ├── connection.ts     # MySQL connection pool
│   │   ├── schema.sql        # Database schema
│   │   └── migrate.ts        # Migration script
│   └── routes/
│       ├── posts.ts          # POST CRUD operations
│       ├── users.ts          # User profile operations
│       ├── follows.ts        # Follow/unfollow operations
│       └── likes.ts          # Like/unlike operations
├── package.json
└── tsconfig.json
```

### **Backend Flow**

#### **1. Server Startup (`index.ts`)**
```typescript
1. Load environment variables (.env)
2. Create Express app
3. Setup CORS (allow frontend origin)
4. Mount Better Auth handler at /api/auth/*
5. Mount JSON middleware
6. Mount API routes:
   - /api/posts → postsRouter
   - /api/users → usersRouter
   - /api/follows → followsRouter
   - /api/likes → likesRouter
7. Start listening on port 3001
```

#### **2. Authentication (`auth.ts`)**
```typescript
- Configures Better Auth with MySQL database
- Enables email/password authentication
- Sets session expiration (7 days)
- Exports auth instance for use in routes
```

#### **3. Database Connection (`db/connection.ts`)**
```typescript
- Creates MySQL connection pool
- Supports DATABASE_URL or individual env vars
- Sets timezone to 'Z' (required by Better Auth)
- Exports pool for use in routes
```

#### **4. Route Handlers**

**Posts Route (`routes/posts.ts`):**
- `GET /api/posts` - Get all posts (feed) with user info and like counts
- `GET /api/posts/:postId` - Get single post
- `GET /api/posts/user/:userId` - Get user's posts
- `POST /api/posts` - Create new post
- `DELETE /api/posts/:postId` - Delete post (owner only)

**Users Route (`routes/users.ts`):**
- `GET /api/users/:userId` - Get user profile with counts
- `GET /api/users/search/:query` - Search users by name/username
- `PUT /api/users/:userId` - Update user profile

**Follows Route (`routes/follows.ts`):**
- `POST /api/follows/:userId` - Follow a user
- `DELETE /api/follows/:userId` - Unfollow a user
- `GET /api/follows/:userId/status` - Check if following
- `GET /api/follows/:userId/followers` - Get followers list
- `GET /api/follows/:userId/following` - Get following list

**Likes Route (`routes/likes.ts`):**
- `POST /api/likes/:postId` - Like a post
- `DELETE /api/likes/:postId` - Unlike a post

---

## 🎨 Frontend Structure

```
frontend/
├── app/
│   ├── (auth)/              # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx     # Login page
│   │   └── register/
│   │       └── page.tsx     # Registration page
│   ├── profile/
│   │   └── [userId]/
│   │       └── page.tsx     # User profile page
│   ├── layout.tsx            # Root layout (includes Navbar)
│   ├── page.tsx              # Home feed page
│   └── globals.css           # Global styles
├── src/
│   ├── components/
│   │   ├── Navbar.tsx        # Navigation bar
│   │   ├── PostCard.tsx      # Post display component
│   │   ├── CreatePost.tsx    # Post creation form
│   │   └── FollowButton.tsx  # Follow/unfollow button
│   └── lib/
│       ├── auth.ts           # Better Auth client
│       └── api.ts            # API client functions
├── package.json
└── tsconfig.json
```

### **Frontend Flow**

#### **1. App Entry (`app/layout.tsx`)**
```typescript
- Root HTML structure
- Includes Navbar component (always visible)
- Wraps all pages
```

#### **2. Authentication (`src/lib/auth.ts`)**
```typescript
- Creates Better Auth client instance
- Exports: signIn, signUp, signOut, useSession
- useSession() hook provides current user session
```

#### **3. API Client (`src/lib/api.ts`)**
```typescript
- Centralized API functions
- Handles fetch requests with credentials
- Error handling
- All functions return promises
```

#### **4. Pages**

**Home Page (`app/page.tsx`):**
```
1. Check authentication (useSession)
2. If not authenticated → redirect to /login
3. If authenticated:
   - Load posts (api.getPosts)
   - Render CreatePost component
   - Render PostCard for each post
4. Handle loading/empty states
```

**Login Page (`app/(auth)/login/page.tsx`):**
```
1. Form with email/password inputs
2. On submit → signIn.email()
3. On success → redirect to home
4. Show error if login fails
```

**Register Page (`app/(auth)/register/page.tsx`):**
```
1. Form with name, email, password
2. On submit → signUp.email()
3. On success → redirect to home
4. Show error if registration fails
```

**Profile Page (`app/profile/[userId]/page.tsx`):**
```
1. Get userId from URL params
2. Load user data (api.getUser)
3. Load user's posts (api.getUserPosts)
4. Render profile info + FollowButton
5. Render user's posts
```

#### **5. Components**

**Navbar (`components/Navbar.tsx`):**
- Shows app name
- If logged in: Profile link + Sign Out button
- If logged out: Sign In + Sign Up buttons

**PostCard (`components/PostCard.tsx`):**
- Displays post content, author info, timestamp
- Like button (heart icon)
- Handles like/unlike actions
- Shows like count

**CreatePost (`components/CreatePost.tsx`):**
- Textarea for post content
- Optional image URL input
- Submit button
- Calls api.createPost() on submit

**FollowButton (`components/FollowButton.tsx`):**
- Checks follow status on mount
- Shows "Follow" or "Following" button
- Handles follow/unfollow actions
- Updates on success

---

## 🔗 How Everything Connects

### **Example: User Likes a Post**

```
1. User clicks heart icon in PostCard
   ↓
2. PostCard calls api.likePost(postId, userId)
   ↓
3. api.ts sends POST /api/likes/:postId with { userId }
   ↓
4. Express receives request → routes to likesRouter
   ↓
5. likes.ts handler:
   - Checks if already liked
   - Inserts into `like` table
   - Returns success
   ↓
6. Frontend receives success → Updates UI
   - Sets isLiked = true
   - Increments likeCount
   - Changes heart icon color
```

### **Example: User Views Feed**

```
1. User visits home page
   ↓
2. page.tsx checks useSession()
   ↓
3. If authenticated, calls api.getPosts(userId)
   ↓
4. Express receives GET /api/posts?userId=xxx
   ↓
5. posts.ts handler executes SQL:
   SELECT p.*, u.name, u.username, u.image,
          COUNT(l.id) as likeCount,
          COUNT(CASE WHEN l.userId = ? THEN 1 END) as isLiked
   FROM post p
   JOIN `user` u ON p.userId = u.id
   LEFT JOIN `like` l ON p.id = l.postId
   GROUP BY p.id
   ORDER BY p.createdAt DESC
   ↓
6. MySQL returns results
   ↓
7. Backend sends JSON array to frontend
   ↓
8. Frontend maps over posts → Renders PostCard for each
```

---

## 🔐 Security & Authentication

### **Session Management**
- Better Auth handles session creation/validation
- Sessions stored in `session` table
- Cookies sent with credentials: 'include'
- Session expires after 7 days of inactivity

### **Authorization**
- Most routes require authentication (check session)
- Post deletion checks ownership (userId matches)
- User updates check ownership (currentUserId matches)

### **CORS**
- Backend only accepts requests from frontend URL
- Credentials included for cookie-based auth

---

## 📊 Data Flow Summary

```
User Action → Frontend Component → API Call → Express Route → MySQL Query → Response → UI Update
```

**Key Points:**
- Frontend is **stateless** - relies on API for all data
- Backend is **RESTful** - standard HTTP methods (GET, POST, DELETE, PUT)
- Database uses **foreign keys** - ensures data integrity
- **Better Auth** handles all authentication complexity
- **TypeScript** provides type safety across the stack

---

## 🚀 Key Features Implemented

✅ User registration and login  
✅ Session management  
✅ Create/view posts  
✅ Like/unlike posts  
✅ Follow/unfollow users  
✅ User profiles  
✅ Feed with all posts  
✅ Responsive UI with dark mode  

---

This architecture follows **separation of concerns**:
- **Frontend** = Presentation layer (React/Next.js)
- **Backend** = Business logic layer (Express)
- **Database** = Data persistence layer (MySQL)
