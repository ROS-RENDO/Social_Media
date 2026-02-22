# Social Media App - Full Architecture & Design

## 📋 System Overview

This is a comprehensive social media platform with real-time messaging, notifications, trending features, and full user interaction capabilities. The architecture uses **Better Auth for authentication**, **Express.js for backend**, and **Next.js with TypeScript for frontend**.

---

## 🏗️ Architecture Diagram

````
FRONTEND (Next.js)
├── Pages
│   ├── page.tsx (Feed)
│   ├── explore/page.tsx (Explore & Trending)
│   ├── search/page.tsx (Search)
│   ├── notifications/page.tsx
│   ├── messages/page.tsx
│   ├── messages/[userId]/page.tsx (Chat)
│   └── profile/[userId]/page.tsx
├── Components
│   ├── Navbar.tsx
│   ├── PostCard.tsx
│   ├── CommentSection.tsx
│   ├── FollowButton.tsx
│   ├── Sidebar.tsx
│   ├── CreatePost.tsx
│   └── More...
└── Lib
    ├── api.ts (Better Auth)
    ├── apiClient.ts (Centralized API calls)
    └── auth.ts

BACKEND (Express.js + TypeScript)
├── Routes
│   ├── auth.ts (Better Auth integration)
│   ├── posts.ts (CRUD + Feed)
│   ├── comments.ts (Comments)
│   ├── likes.ts (Likes)
│   ├── follows.ts (Follows)
│   ├── messages.ts (Direct Messaging)
│   ├── notifications.ts (Notifications)
│   ├── discover.ts (Trending, Explore)
│   └── search.ts (Global Search)
├── DB
│   ├── connection.ts (MySQL connection)
│   └── schema.sql (Database schema)
└── Middleware
    └── Authentication (Better Auth tokens)

---

## 📊 Database Schema Details

### **user** table
```sql
- id (primary key)
- name, username (unique)
- email, emailVerified
- image (profile picture)
- bio, website
- createdAt, updatedAt
````

### **session** table

```sql
- id (primary key)
- userId (foreign key to user.id)
- token (JWT token)
- expiresAt
- userAgent, ipAddress (for security)
```

### **post** table

```sql
- id (primary key)
- userId (foreign key)
- content (post text)
- imageUrl (optional)
- createdAt, updatedAt
- indexes: userId, createdAt
```

### **like** table

```sql
- id (primary key)
- userId, postId (foreign keys)
- createdAt (timestamp)
- Purpose: Track who liked which post
```

### **comment** table

```sql
- id (primary key)
- postId, userId (foreign keys)
- content (comment text)
- createdAt, updatedAt
```

### **follow** table

```sql
- id (primary key)
- followerId, followingId (both user IDs)
- createdAt
- Purpose: Track follower relationships
```

### **message** table

```sql
- id (primary key)
- senderId, recipientId (user IDs)
- content (message text)
- isRead boolean
- createdAt
- Purpose: Direct messaging
```

### **notification** table

```sql
- id (primary key)
- userId (who gets notified)
- type: 'like' | 'comment' | 'follow' | 'message'
- triggeredBy (user who triggered it)
- postId (optional, for post-related notifications)
- isRead boolean
- createdAt
```

### **block** table

```sql
- id (primary key)
- blockerId, blockedId (user IDs)
- createdAt
- Purpose: Blocking users
```

### **hashtag** table

```sql
- id (primary key)
- tag (unique)
- postCount (counter)
- createdAt
```

### **postHashtag** table

```sql
- id (primary key)
- postId, hashtagId (foreign keys)
- Purpose: Many-to-many relationship between posts and hashtags
```

---

## 🛣️ API Endpoints Reference

### Authentication

- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login user
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

### Posts

- `GET /api/posts/feed` - Get user feed (paginated)
- `GET /api/posts/:id` - Get single post with details
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Edit post
- `DELETE /api/posts/:id` - Delete post

### Comments

- `GET /api/comments/post/:postId` - Get comments for a post
- `POST /api/comments` - Add comment
- `PUT /api/comments/:id` - Edit comment
- `DELETE /api/comments/:id` - Delete comment

### Likes

- `POST /api/likes` - Like a post
- `DELETE /api/likes/:id` - Unlike a post

### Follows

- `POST /api/follows` - Follow a user
- `DELETE /api/follows/:id` - Unfollow
- `GET /api/follows/followers/:userId` - Get followers list
- `GET /api/follows/following/:userId` - Get following list

### Messages

- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/chat/:userId` - Get messages with a user
- `POST /api/messages` - Send message
- `GET /api/messages/unread/count` - Unread count

### Notifications

- `GET /api/notifications` - Get all notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/mark-all/read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/unread/count` - Unread count

### Discover

- `GET /api/discover/trending/hashtags` - Get trending hashtags
- `GET /api/discover/trending/posts` - Get trending posts
- `GET /api/discover/suggested-users` - Get suggested users
- `GET /api/discover/explore` - Get explore feed

### Search

- `GET /api/search?q=query&type=all|users|posts|hashtags` - Global search
- `GET /api/search/hashtag/:tag` - Get posts with hashtag

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/search?username=...` - Search users

---

## 🔐 Authentication & Security

### Session Management

1. **User logs in** → Better Auth creates JWT token + session record
2. **Session stored in DB** with fields:
   - `token`: JWT token
   - `userId`: User identifier
   - `expiresAt`: Expiration time
   - `userAgent`: Device info
   - `ipAddress`: Login location
3. **Token sent to frontend** → Stored in HttpOnly cookie (secure)
4. **On each request** → Backend verifies token matches session
5. **Advantages**: Can revoke sessions, detect suspicious logins, logout all devices

### Why Sessions + JWT?

- **JWT alone**: Can't revoke until expiration
- **Sessions + JWT**: Best of both worlds - fast verification + revocation ability

---

## 🎨 Frontend Pages & Components

### Pages

1. **Home (/)**
   - User feed with posts from following users
   - Create post form
   - Pagination for loading more posts

2. **Explore (/explore)**
   - Posts from non-following users
   - Suggested users to follow
   - Trending hashtags sidebar

3. **Search (/search)**
   - Search users, posts, hashtags
   - Display results in tabs
   - Hashtag post feed

4. **Notifications (/notifications)**
   - All activity notifications
   - Mark as read functionality
   - Different notification types

5. **Messages (/messages and /messages/[userId])**
   - Conversation list
   - Private chat interface
   - Message history

6. **Profile (/profile/[userId])**
   - User information
   - User's posts
   - Follow/Unfollow button
   - Follower/Following lists

### Components

- **Navbar**: Navigation + search
- **PostCard**: Display post with interactions
- **CommentSection**: Show/add comments
- **FollowButton**: Follow/unfollow action
- **CreatePost**: Post composition
- **Sidebar**: Trending + quick links

---

## 🚀 Key Features Explained

### 1. **Feed Algorithm**

```sql
SELECT posts FROM users WHERE userId IN followingIds
ORDER BY createdAt DESC
LIMIT 20 OFFSET page*20
```

- Shows posts only from followed users
- Paginated for performance
- Could be enhanced with engagement scoring

### 2. **Trending Calculation**

```
Score = (likeCount + commentCount*2) / daysSinceCreation
```

- Posts with more engagement rank higher
- Comments weighted more than likes
- Time decay prevents old posts from staying trending

### 3. **Notification Types**

- **like**: Someone liked your post
- **comment**: Someone commented on your post
- **follow**: Someone started following you
- **message**: Someone sent you a DM

### 4. **Search Implementation**

- Simultaneously searches: users (name/username), posts (content), hashtags (tag name)
- Pagination support
- Type-specific filtering

### 5. **Hashtag System**

- Auto-extract from post content (regex: `#\w+`)
- Track popularity (postCount)
- Link all posts with hashtag
- Trending calculation based on usage

---

## 📈 Scalability Considerations

### Current Implementation

- Direct database queries
- No caching layer
- Real-time data (no eventual consistency)

### Improvements for Scale

1. **Add Redis Cache**
   - Cache trending hashtags
   - Cache feed (user-specific)
   - Cache user profiles

2. **Message Queue** (e.g., RabbitMQ)
   - Offload notification creation
   - Async hashtag indexing
   - Batch email notifications

3. **Search Index** (e.g., Elasticsearch)
   - Fast full-text search
   - Autocomplete
   - Advanced search filters

4. **Database Optimization**
   - Add more indexes
   - Partition large tables
   - Archive old posts

5. **Frontend Optimization**
   - Infinite scroll + virtual lists
   - Service Workers for offline
   - Image lazy loading

---

## 🧪 Testing Flow

### 1. Create User Account

```
POST /api/auth/sign-up
{ email, password, name }
Response: { user, session, token }
```

### 2. Create Post

```
POST /api/posts
{ content: "Hello #world", imageUrl }
Response: { id, createdAt }
```

### 3. View Feed

```
GET /api/posts/feed?page=1
Response: Posts with engagement counts
```

### 4. Like Post

```
POST /api/likes
{ postId }
Response: { id, likeId }
```

### 5. Comment

```
POST /api/comments
{ postId, content }
Response: { id, commentId }
Triggers: Notification to post owner
```

### 6. Send Message

```
POST /api/messages
{ recipientId, content }
Response: { id, messageId }
Triggers: Notification to recipient
```

---

## 🧑‍💻 Development Workflow

### Backend Development

1. Create new route file in `backend/src/routes/`
2. Export router from file
3. Import and mount in `backend/src/index.ts`
4. Test with API client (Postman, Thunder Client, etc.)

### Frontend Development

1. Create page in `app/` or component in `src/components/`
2. Use `apiClient` for API calls
3. Use React hooks (useState, useEffect) for state management
4. Style with Tailwind CSS classes

### Database Changes

1. Update schema in `backend/src/db/schema.sql`
2. Create migration script
3. Run migration: `npm run migrate`
4. Update TypeScript types accordingly

---

## 📝 Example: Adding a New Feature (Stories)

### 1. Database (Add story table)

```sql
CREATE TABLE story (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  mediaUrl VARCHAR(255) NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id)
);
```

### 2. Backend (Create route)

```typescript
// backend/src/routes/stories.ts
- GET /api/stories (get all active stories)
- POST /api/stories (create new story)
- DELETE /api/stories/:id (delete story)
```

### 3. Frontend (Add page & component)

```typescript
// frontend/app/stories/page.tsx
// frontend/src/components/StoryViewer.tsx
```

### 4. Update main index.ts

```typescript
import storiesRouter from "./routes/stories";
app.use("/api/stories", storiesRouter);
```

---

## 🔮 Future Enhancements

1. **Real-time Updates** (WebSocket)
2. **Image Upload** (Cloudinary/S3)
3. **Stories Feature** (24hr expiring content)
4. **Reels/Video** (Short videos)
5. **Recommendation Engine** (ML-based)
6. **Live Streaming**
7. **Payment System** (Stars/Tips)
8. **Moderation** (Report/Ban system)
9. **Analytics Dashboard** (For creators)
10. **Dark Mode**

---

This comprehensive architecture provides a solid foundation for a production-grade social media application!

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
