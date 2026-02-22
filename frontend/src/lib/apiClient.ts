import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Posts
export const posts = {
  getFeed: (page = 1) => apiClient.get(`/posts/feed?page=${page}`),
  getPost: (id: string) => apiClient.get(`/posts/${id}`),
  createPost: (content: string, imageUrl?: string) =>
    apiClient.post("/posts", { content, imageUrl }),
  updatePost: (id: string, content: string) =>
    apiClient.put(`/posts/${id}`, { content }),
  deletePost: (id: string) => apiClient.delete(`/posts/${id}`),
};

// Comments
export const comments = {
  getComments: (postId: string, page = 1) =>
    apiClient.get(`/comments/post/${postId}?page=${page}`),
  createComment: (postId: string, content: string) =>
    apiClient.post("/comments", { postId, content }),
  updateComment: (id: string, content: string) =>
    apiClient.put(`/comments/${id}`, { content }),
  deleteComment: (id: string) => apiClient.delete(`/comments/${id}`),
};

// Likes
export const likes = {
  like: (postId: string) => apiClient.post("/likes", { postId }),
  unlike: (id: string) => apiClient.delete(`/likes/${id}`),
};

// Messages
export const messages = {
  getConversations: (page = 1) =>
    apiClient.get(`/messages/conversations?page=${page}`),
  getChat: (userId: string, page = 1) =>
    apiClient.get(`/messages/chat/${userId}?page=${page}`),
  sendMessage: (recipientId: string, content: string) =>
    apiClient.post("/messages", { recipientId, content }),
  getUnreadCount: () => apiClient.get("/messages/unread/count"),
};

// Notifications
export const notifications = {
  getNotifications: (page = 1) => apiClient.get(`/notifications?page=${page}`),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch("/notifications/mark-all/read"),
  deleteNotification: (id: string) => apiClient.delete(`/notifications/${id}`),
  getUnreadCount: () => apiClient.get("/notifications/unread/count"),
};

// Users
export const users = {
  getProfile: (id: string) => apiClient.get(`/users/${id}`),
  updateProfile: (data: any) => apiClient.put("/users/profile", data),
  searchUsers: (username: string) =>
    apiClient.get(`/users/search?username=${username}`),
};

// Follows
export const follows = {
  follow: (userId: string) =>
    apiClient.post("/follows", { followingId: userId }),
  unfollow: (id: string) => apiClient.delete(`/follows/${id}`),
  getFollowers: (userId: string, page = 1) =>
    apiClient.get(`/follows/followers/${userId}?page=${page}`),
  getFollowing: (userId: string, page = 1) =>
    apiClient.get(`/follows/following/${userId}?page=${page}`),
};

// Discover
export const discover = {
  getTrendingHashtags: (limit = 10) =>
    apiClient.get(`/discover/trending/hashtags?limit=${limit}`),
  getTrendingPosts: (limit = 20) =>
    apiClient.get(`/discover/trending/posts?limit=${limit}`),
  getSuggestedUsers: (limit = 10) =>
    apiClient.get(`/discover/suggested-users?limit=${limit}`),
  getExplore: (page = 1) => apiClient.get(`/discover/explore?page=${page}`),
};

// Search
export const search = {
  search: (q: string, type = "all") =>
    apiClient.get(`/search?q=${q}&type=${type}`),
  getHashtagPosts: (tag: string, page = 1) =>
    apiClient.get(`/search/hashtag/${tag}?page=${page}`),
};

export default apiClient;
