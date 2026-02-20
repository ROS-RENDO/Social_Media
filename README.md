# Social Media MVP App

A full-stack social media application built with MySQL, Better Auth, Express backend, and Next.js TypeScript frontend.

## Features

- ✅ User authentication (email/password) with Better Auth
- ✅ Create and view posts
- ✅ Like posts
- ✅ Follow/unfollow users
- ✅ User profiles
- ✅ Feed with posts from all users
- ✅ Responsive design with dark mode support

## Tech Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MySQL** - Database
- **Better Auth** - Authentication library (single package, no separate adapters needed)
- **mysql2** - MySQL driver

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Better Auth React** - Authentication client

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## Setup Instructions

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE social_media;
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=mysql://user:password@localhost:3306/social_media
# OR use individual variables:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=social_media

BETTER_AUTH_SECRET=your-secret-key-change-this-in-production
BETTER_AUTH_URL=http://localhost:3001
PORT=3001
FRONTEND_URL=http://localhost:3000
```

Run database migrations:

```bash
npm run migrate
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.ts      # MySQL connection pool
│   │   │   ├── schema.sql         # Database schema
│   │   │   └── migrate.ts         # Migration script
│   │   ├── routes/
│   │   │   ├── posts.ts           # Post CRUD endpoints
│   │   │   ├── users.ts           # User endpoints
│   │   │   ├── follows.ts         # Follow/unfollow endpoints
│   │   │   └── likes.ts           # Like/unlike endpoints
│   │   ├── auth.ts                # Better Auth configuration
│   │   └── index.ts               # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/
    │   │   └── register/
    │   ├── profile/
    │   │   └── [userId]/
    │   ├── layout.tsx
    │   └── page.tsx               # Home feed
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── PostCard.tsx
    │   │   ├── CreatePost.tsx
    │   │   └── FollowButton.tsx
    │   └── lib/
    │       ├── auth.ts            # Better Auth client
    │       └── api.ts             # API client functions
    └── package.json
```

## API Endpoints

### Authentication (Better Auth)
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

### Posts
- `GET /api/posts` - Get all posts (feed)
- `GET /api/posts/:postId` - Get single post
- `GET /api/posts/user/:userId` - Get user's posts
- `POST /api/posts` - Create post
- `DELETE /api/posts/:postId` - Delete post

### Users
- `GET /api/users/:userId` - Get user profile
- `GET /api/users/search/:query` - Search users
- `PUT /api/users/:userId` - Update user profile

### Follows
- `POST /api/follows/:userId` - Follow user
- `DELETE /api/follows/:userId` - Unfollow user
- `GET /api/follows/:userId/status` - Check follow status
- `GET /api/follows/:userId/followers` - Get followers
- `GET /api/follows/:userId/following` - Get following list

### Likes
- `POST /api/likes/:postId` - Like post
- `DELETE /api/likes/:postId` - Unlike post

## Database Schema

- **user** - User accounts (managed by Better Auth)
- **session** - User sessions (Better Auth)
- **account** - OAuth accounts (Better Auth)
- **verification** - Email verification tokens (Better Auth)
- **post** - User posts
- **follow** - User follow relationships
- **like** - Post likes

## Development

### Backend
```bash
cd backend
npm run dev    # Development with hot reload
npm run build  # Build for production
npm start      # Run production build
```

### Frontend
```bash
cd frontend
npm run dev    # Development server
npm run build  # Build for production
npm start      # Run production build
```

## Notes

- Chat feature is not included (as requested)
- Better Auth handles user registration, login, and session management
- The app uses MySQL for data persistence
- All API endpoints require authentication (except auth endpoints)
- CORS is configured to allow requests from the frontend URL

## License

ISC
