# Quick Start Guide - Full Social Media App

## 🚀 Installation & Running

### **Prerequisites**

- Node.js 18+
- MySQL 5.7+
- npm or yarn

### **Step 1: Setup Backend**

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo "PORT=3001" > .env
echo "DATABASE_URL=mysql://root:password@localhost:3306/social_media" >> .env
echo "FRONTEND_URL=http://localhost:3000" >> .env

# Create database
mysql -u root -p -e "CREATE DATABASE social_media CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
npm run migrate

# Start server
npm run dev
```

Server will run on `http://localhost:3001`

### **Step 2: Setup Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 📋 Features Overview

### **Authentication**

- Register with email/password
- Login/logout
- Session management (Better Auth)
- Protected pages

### **Posts**

- Create/edit/delete posts
- Like/unlike posts
- Comment on posts
- View feed from following users

### **Users**

- View user profiles
- Follow/unfollow users
- See follower/following lists
- Update profile

### **Messaging** ⭐ NEW

- Direct messaging between users
- Conversation management
- Unread message tracking
- Message history

### **Notifications** ⭐ NEW

- Like notifications
- Comment notifications
- Follow notifications
- Message notifications
- Mark as read functionality

### **Discovery** ⭐ NEW

- Explore feed (non-following posts)
- Suggested users
- Trending hashtags
- Trending posts

### **Search** ⭐ NEW

- Search users by username/name
- Search posts by content
- Search hashtags
- View posts with specific hashtag

---

## 🌐 App Routes

### **Frontend Routes**

```
/                          → Home feed
/login                     → Login page
/register                  → Registration page
/profile/:userId           → User profile
/explore                   → Explore & discovery
/search                    → Global search
/messages                  → Messages list
/messages/:userId          → Chat with user
/notifications             → Activity notifications
```

### **Backend API Routes**

```
POST /api/auth/sign-up     → Register
POST /api/auth/sign-in     → Login
POST /api/auth/sign-out    → Logout

GET  /api/posts/feed       → User feed
POST /api/posts            → Create post
PUT  /api/posts/:id        → Edit post
DELETE /api/posts/:id      → Delete post

POST /api/comments         → Create comment
GET  /api/comments/post/:postId    → Get post comments
PUT  /api/comments/:id     → Edit comment
DELETE /api/comments/:id   → Delete comment

POST /api/likes            → Like post
DELETE /api/likes/:id      → Unlike post

POST /api/follows          → Follow user
DELETE /api/follows/:id    → Unfollow user
GET  /api/follows/followers/:userId → Get followers
GET  /api/follows/following/:userId → Get following

GET  /api/messages/conversations → All conversations
GET  /api/messages/chat/:userId → Messages with user
POST /api/messages         → Send message
GET  /api/messages/unread/count → Unread count

GET  /api/notifications    → All notifications
PATCH /api/notifications/:id/read → Mark as read
PATCH /api/notifications/mark-all/read → Mark all read
DELETE /api/notifications/:id → Delete notification

GET  /api/discover/trending/hashtags → Trending hashtags
GET  /api/discover/trending/posts → Trending posts
GET  /api/discover/suggested-users → Suggested users
GET  /api/discover/explore → Explore feed

GET  /api/search           → Search (users, posts, hashtags)
GET  /api/search/hashtag/:tag → Posts with hashtag
```

---

## 🧪 Testing the App

### **Test Scenario 1: Create & Like a Post**

1. Register account
2. Go to home
3. Create post with content
4. Create another account
5. First user's post appears in second user's feed
6. Second user can like post
7. First user sees like notification

### **Test Scenario 2: Direct Messaging**

1. Have 2 accounts logged in (different browsers)
2. Go to user profile of other account
3. Click "Message" button
4. Type and send message
5. Other user sees message in conversation list
6. Gets notification
7. Can reply

### **Test Scenario 3: Discovery**

1. Go to /explore
2. See posts from users you don't follow
3. See suggested users
4. Click suggested user to visit profile
5. Go to /search
6. Search for user/post/hashtag
7. See results

### **Test Scenario 4: Notifications**

1. Have 2 accounts
2. Account A follows account B
3. Account B gets "follow" notification
4. Account A likes account B's post
5. Account B gets "like" notification
6. Account A comments on account B's post
7. Account B gets "comment" notification

---

## 📊 Database Tables

```sql
-- Auth tables
user (id, name, username, email, password_hash, image, bio, createdAt, updatedAt)
session (id, userId, token, expiresAt, ipAddress, userAgent)
account (id, userId, password, providerId, accessToken, refreshToken)

-- Content tables
post (id, userId, content, imageUrl, createdAt, updatedAt)
like (id, userId, postId, createdAt)
comment (id, postId, userId, content, createdAt, updatedAt)

-- Social tables
follow (id, followerId, followingId, createdAt)
block (id, blockerId, blockedId, createdAt)

-- Messaging & notifications
message (id, senderId, recipientId, content, isRead, createdAt)
notification (id, userId, type, triggeredBy, postId, isRead, createdAt)

-- Hashtags
hashtag (id, tag, postCount, createdAt)
postHashtag (id, postId, hashtagId, createdAt)
```

---

## ⚙️ Environment Variables

### **Backend (.env)**

```
PORT=3001
DATABASE_URL=mysql://username:password@localhost:3306/database_name
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_secret_key_here
BETTER_AUTH_SECRET=your_better_auth_secret
```

### **Frontend (.env.local)**

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🐛 Troubleshooting

### **Database Connection Error**

- Ensure MySQL is running
- Check credentials in .env
- Verify database exists

### **API 401 Unauthorized**

- Make sure authentication header is set
- Check session token is valid
- Login again if session expired

### **CORS Error**

- Verify FRONTEND_URL in backend .env matches frontend URL
- Make sure credentials: 'include' is set in API requests

### **Port Already in Use**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

---

## 📦 Deployment

### **Backend Deployment (Heroku)**

```bash
git push heroku main
heroku config:set DATABASE_URL="mysql://..."
heroku config:set FRONTEND_URL="https://yourdomain.com"
```

### **Frontend Deployment (Vercel)**

```bash
npm run build
vercel deploy
```

Set environment variables in Vercel dashboard:

- `NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com/api`

---

## 📝 API Usage Examples

### **Create Post**

```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content": "Hello #world", "imageUrl": "..."}'
```

### **Send Message**

```bash
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d '{"recipientId": "user-id", "content": "Hi there!"}'
```

### **Search**

```bash
curl "http://localhost:3001/api/search?q=javascript&type=posts"
```

---

## 🔄 Development Workflow

1. **Make changes** to backend/frontend code
2. **Server auto-restarts** (npm run dev watches changes)
3. **Test changes** in browser
4. **Check console** for errors
5. **Debug** using browser DevTools
6. **Commit changes** when working

---

## 📚 Key Dependencies

### **Backend**

- `express` - Web framework
- `mysql2` - MySQL driver
- `better-auth` - Authentication
- `typescript` - Type safety
- `uuid` - Unique IDs
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

### **Frontend**

- `next` - React framework
- `react` - UI library
- `axios` - HTTP client
- `better-auth` - Auth client
- `tailwindcss` - Styling
- `typescript` - Type safety

---

## 🚀 Next Steps

1. **Enhance UI** - Add more styling/animations
2. **Add real-time** - Use WebSocket for live updates
3. **Image uploads** - Integrate Cloudinary/S3
4. **Caching** - Add Redis for performance
5. **Testing** - Add unit/integration tests
6. **Analytics** - Track user behavior
7. **Admin panel** - Manage users/posts
8. **Mobile app** - React Native version

---

## 📞 Support

For issues:

1. Check TROUBLESHOOTING section
2. Look at console logs
3. Verify .env variables
4. Check database is running
5. Restart servers

---

**Happy coding!** 🎉
