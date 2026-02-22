/**
 * Consolidated type definitions for the social media application
 */

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  image?: string;
  bio?: string;
  createdAt?: string;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  userId: string;
  userName: string;
  username?: string;
  userImage?: string;
  likeCount: number;
  commentCount?: number;
  isLiked: number;
  isLikedByUser?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  userName?: string;
  userImage?: string;
  username?: string;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "like" | "comment" | "follow" | "message";
  triggeredBy: string;
  postId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Session {
  user?: User;
  token?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
