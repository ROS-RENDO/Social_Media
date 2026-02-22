-- Users table (Better Auth will handle this, but we'll create additional fields)
CREATE TABLE IF NOT EXISTS `user` (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  emailVerified BOOLEAN DEFAULT FALSE,
  image VARCHAR(500),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  bio TEXT,
  username VARCHAR(50) UNIQUE,
  INDEX idx_email (email),
  INDEX idx_username (username)
);

-- Sessions table (Better Auth)
CREATE TABLE IF NOT EXISTS session (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  expiresAt DATETIME NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES `user`(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_token (token)
);

-- Accounts table (Better Auth - for OAuth providers)
CREATE TABLE IF NOT EXISTS account (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  accountId VARCHAR(255) NOT NULL,
  providerId VARCHAR(255) NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  expiresAt DATETIME,
  password VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES `user`(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_provider (providerId, accountId)
);

-- Verification table (Better Auth)
CREATE TABLE IF NOT EXISTS verification (
  id VARCHAR(255) PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_identifier (identifier),
  INDEX idx_value (value)
);

-- Posts table
CREATE TABLE IF NOT EXISTS post (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  imageUrl VARCHAR(500),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES `user`(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_createdAt (createdAt DESC)
);

-- Follows table
CREATE TABLE IF NOT EXISTS follow (
  id VARCHAR(255) PRIMARY KEY,
  followerId VARCHAR(255) NOT NULL,
  followingId VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (followerId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (followingId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (followerId, followingId),
  INDEX idx_followerId (followerId),
  INDEX idx_followingId (followingId)
);

-- Likes table
CREATE TABLE IF NOT EXISTS `like` (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  postId VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES `user`(id) ON DELETE CASCADE,
  FOREIGN KEY (postId) REFERENCES post(id) ON DELETE CASCADE,
  UNIQUE KEY unique_like (userId, postId),
  INDEX idx_userId (userId),
  INDEX idx_postId (postId)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comment (
  id VARCHAR(255) PRIMARY KEY,
  postId VARCHAR(255) NOT NULL,
  userId VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES post(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES `user`(id) ON DELETE CASCADE,
  INDEX idx_postId (postId),
  INDEX idx_userId (userId),
  INDEX idx_createdAt (createdAt DESC)
);

-- Messages table
CREATE TABLE IF NOT EXISTS message (
  id VARCHAR(255) PRIMARY KEY,
  senderId VARCHAR(255) NOT NULL,
  recipientId VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (senderId) REFERENCES `user`(id) ON DELETE CASCADE,
  FOREIGN KEY (recipientId) REFERENCES `user`(id) ON DELETE CASCADE,
  INDEX idx_senderId (senderId),
  INDEX idx_recipientId (recipientId),
  INDEX idx_createdAt (createdAt DESC)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notification (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  triggeredBy VARCHAR(255) NOT NULL,
  postId VARCHAR(255),
  isRead BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES `user`(id) ON DELETE CASCADE,
  FOREIGN KEY (triggeredBy) REFERENCES `user`(id) ON DELETE CASCADE,
  FOREIGN KEY (postId) REFERENCES post(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_triggeredBy (triggeredBy),
  INDEX idx_createdAt (createdAt DESC)
);

-- Hashtags table
CREATE TABLE IF NOT EXISTS hashtag (
  id VARCHAR(255) PRIMARY KEY,
  tag VARCHAR(255) UNIQUE NOT NULL,
  postCount INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tag (tag)
);

-- Post Hashtags junction table
CREATE TABLE IF NOT EXISTS postHashtag (
  postId VARCHAR(255) NOT NULL,
  hashtagId VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (postId, hashtagId),
  FOREIGN KEY (postId) REFERENCES post(id) ON DELETE CASCADE,
  FOREIGN KEY (hashtagId) REFERENCES hashtag(id) ON DELETE CASCADE,
  INDEX idx_hashtagId (hashtagId)
);
