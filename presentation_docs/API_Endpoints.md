# Backend API Endpoints Reference

**Base URL:** `http://localhost:3001`  
**Framework:** Express.js + TypeScript  
**Auth System:** Better Auth (session-based JWT stored in HttpOnly cookies)  
**Database:** MySQL via connection pool

---

## 🔐 Authentication — `/api/auth/*`
*Handled internally by Better Auth library.*

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/auth/sign-up` | Register a new user with email + password | ❌ |
| `POST` | `/api/auth/sign-in/email` | Sign in, returns session token in cookie | ❌ |
| `POST` | `/api/auth/sign-out` | Destroys session on client + server | ✅ |
| `GET`  | `/api/auth/get-session` | Returns current authenticated user object | ✅ |

**Sign-Up Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```
**Sign-Up Success Response `201`:**
```json
{
  "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com" },
  "session": { "token": "...", "expiresAt": "2026-03-07T..." }
}
```

---

## 📝 Posts — `/api/posts`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/posts?userId={id}` | Get all posts (global feed), latest 50 | ❌ |
| `GET` | `/api/posts/user/:userId?currentUserId={id}` | Get all posts by a specific user | ❌ |
| `GET` | `/api/posts/:postId?userId={id}` | Get a single post by ID | ❌ |
| `POST` | `/api/posts` | Create a new post | ✅ |
| `DELETE` | `/api/posts/:postId` | Delete a post (owner only) | ✅ |

**Create Post Request Body:**
```json
{
  "userId": "user-uuid",
  "content": "Hello world! #dev",
  "imageUrl": "https://example.com/img.png"
}
```
**Get Posts Response (each object):**
```json
{
  "id": "post-uuid",
  "content": "Hello world! #dev",
  "imageUrl": null,
  "createdAt": "2026-02-28T...",
  "userId": "user-uuid",
  "userName": "John Doe",
  "username": "johndoe",
  "userImage": "https://...",
  "likeCount": 12,
  "isLiked": 0
}
```

**SQL Join Used:**
```sql
SELECT p.*, u.name, u.username, u.image,
  COUNT(DISTINCT l.id) as likeCount,
  COUNT(DISTINCT CASE WHEN l.userId = ? THEN 1 END) as isLiked
FROM post p
JOIN `user` u ON p.userId = u.id
LEFT JOIN `like` l ON p.id = l.postId
GROUP BY p.id ...
ORDER BY p.createdAt DESC LIMIT 50
```

---

## 💬 Comments — `/api/comments`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/comments/post/:postId?page={n}` | Get paginated comments for a post | ❌ |
| `POST` | `/api/comments` | Create a comment on a post | ✅ |
| `PUT` | `/api/comments/:commentId` | Edit own comment | ✅ |
| `DELETE` | `/api/comments/:commentId` | Delete own comment | ✅ |

**Auth Pattern:** Reads Bearer token from `Authorization` header + `x-user-id` header.

**Create Comment Request Body:**
```json
{ "postId": "post-uuid", "content": "Great post!" }
```
**Create Comment Side Effect:** Automatically inserts a `notification` record for the post owner (type: `"comment"`).

**Get Comments Response:**
```json
{
  "data": [
    {
      "id": "comment-uuid",
      "content": "Great post!",
      "createdAt": "...",
      "userId": "user-uuid",
      "name": "Jane",
      "username": "jane_d",
      "image": "https://..."
    }
  ],
  "pagination": { "total": 50, "page": 1, "limit": 10, "pages": 5 }
}
```

---

## ❤️ Likes — `/api/likes`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/likes/:postId` | Like a post (idempotent guard) | ✅ |
| `DELETE` | `/api/likes/:postId` | Unlike a post | ✅ |

**Like Request Body:**
```json
{ "userId": "user-uuid" }
```
**DB Constraint:** `UNIQUE(userId, postId)` prevents double-liking at the database level.

---

## 👥 Follows — `/api/follows`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `POST` | `/api/follows/:userId` | Follow a user | ✅ |
| `DELETE` | `/api/follows/:userId` | Unfollow a user | ✅ |
| `GET` | `/api/follows/:userId/status?followerId={id}` | Check if current user is following | ❌ |
| `GET` | `/api/follows/:userId/followers` | Get list of user's followers | ❌ |
| `GET` | `/api/follows/:userId/following` | Get list of users followed by user | ❌ |

**Follow Request Body:**
```json
{ "followerId": "my-user-uuid" }
```
**Guards:** Server-side check prevents self-following and duplicate follows before inserting.

**Followers Response (array of user objects):**
```json
[
  { "id": "uuid", "name": "Alice", "username": "alice", "image": "..." }
]
```

---

## 💬 Messages — `/api/messages`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/messages/conversations?page={n}` | Get all unique conversation partners | ✅ |
| `GET` | `/api/messages/chat/:otherUserId?page={n}` | Get paginated chat history, marks messages read | ✅ |
| `POST` | `/api/messages` | Send a message to another user | ✅ |
| `GET` | `/api/messages/unread/count` | Get total unread message count | ✅ |

**Send Message Request Body:**
```json
{ "recipientId": "other-user-uuid", "content": "Hey there!" }
```
**Send Message Side Effect:** Automatically inserts a `notification` record for the recipient (type: `"message"`).

**Conversations Response (each item):**
```json
{
  "otherUserId": "uuid",
  "name": "Alice",
  "username": "alice",
  "image": "...",
  "lastMessage": "Hey there!",
  "lastMessageTime": "2026-02-28T...",
  "unreadCount": 3
}
```
**Complex SQL Used:** `CASE WHEN senderId = ? THEN recipientId ELSE senderId END` to dynamically resolve the "other person" in each conversation.

---

## 🔔 Notifications — `/api/notifications`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/notifications?page={n}` | Get paginated notifications for current user | ✅ |
| `GET` | `/api/notifications/unread/count` | Get unread notification count | ✅ |
| `PATCH` | `/api/notifications/:notificationId/read` | Mark a single notification as read | ✅ |
| `PATCH` | `/api/notifications/mark-all/read` | Mark ALL notifications as read | ✅ |
| `DELETE` | `/api/notifications/:notificationId` | Delete a notification | ✅ |

**Notification Types:** `"like"` | `"comment"` | `"follow"` | `"message"`

**Get Notifications Response (each item):**
```json
{
  "id": "notif-uuid",
  "type": "comment",
  "triggeredBy": "user-uuid",
  "postId": "post-uuid",
  "isRead": false,
  "createdAt": "...",
  "name": "Alice",
  "username": "alice",
  "image": "...",
  "postContent": "My original post text..."
}
```

---

## 🔍 Search — `/api/search`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/search?q={query}&type={all\|users\|posts\|hashtags}` | Multi-category global search | ❌ |
| `GET` | `/api/search/hashtag/:tag?page={n}` | Get all posts by an exact hashtag | ❌ |

**Search Response (type=all):**
```json
{
  "users": [ { "id": "...", "name": "...", "username": "...", "followerCount": 500 } ],
  "posts": [ { "id": "...", "content": "...", "likeCount": 12, "commentCount": 3 } ],
  "hashtags": [ { "id": "...", "tag": "dev", "postCount": 150 } ]
}
```
**Guard:** Query must be minimum 2 characters, returns `400` otherwise.

---

## 🌍 Discover — `/api/discover`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/discover/trending/hashtags?limit={n}` | Get top N hashtags by postCount | ❌ |
| `GET` | `/api/discover/trending/posts?limit={n}` | Get top N posts by engagement score | ❌ |
| `GET` | `/api/discover/suggested-users?limit={n}` | Get users not yet followed by current user | ✅ |
| `GET` | `/api/discover/explore?page={n}` | Get posts from non-followed users | ✅ |

**Engagement Score Formula (used in trending/posts):**
```sql
ORDER BY (
  (SELECT COUNT(*) FROM like WHERE postId = p.id) +
  (SELECT COUNT(*) FROM comment WHERE postId = p.id) * 2
) DESC
```
Comments are weighted **2x** heavier than likes to reward quality engagement.

**Suggested Users Query Logic:** Excludes users: (1) already followed, (2) currently logged-in user, (3) blocked users — returns sorted by most followers.

---

## 👤 Users — `/api/users`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/api/users/:userId` | Get full profile with follower/following/post counts | ❌ |
| `GET` | `/api/users/search/:query` | Search users by name or username (simple LIKE match) | ❌ |
| `PUT` | `/api/users/:userId` | Update profile (name, bio, username, image) | ✅ |

**Get Profile Response:**
```json
{
  "id": "user-uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "image": "https://...",
  "bio": "I love coding!",
  "username": "johndoe",
  "createdAt": "...",
  "followerCount": 120,
  "followingCount": 80,
  "postCount": 45
}
```

---

## ⚙️ Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Returns `{ "status": "ok" }` — used by Docker/load balancer |

---

## 🔐 Authentication Middleware Pattern

Protected routes use an inline `authenticateToken` middleware:
```typescript
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  req.userId = req.headers["x-user-id"]; // Injected by Better Auth
  next();
};
```

> **Note:** `x-user-id` is a trusted header set by the Better Auth layer upstream. In production, this would be validated against the session store.

---

## 📊 Summary Table

| Domain | # of Endpoints | Protected |
|--------|:-:|:-:|
| Authentication | 4 | Mixed |
| Posts | 5 | Partial |
| Comments | 4 | Partial |
| Likes | 2 | ✅ Yes |
| Follows | 5 | Partial |
| Messages | 4 | ✅ Yes |
| Notifications | 5 | ✅ Yes |
| Search | 2 | ❌ No |
| Discover | 4 | Partial |
| Users | 3 | Partial |
| **Total** | **38** | |
