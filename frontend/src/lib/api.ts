const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Posts
  getPosts: (userId?: string) => fetchAPI(`/api/posts${userId ? `?userId=${userId}` : ''}`),
  getPost: (postId: string, userId?: string) => fetchAPI(`/api/posts/${postId}${userId ? `?userId=${userId}` : ''}`),
  getUserPosts: (userId: string, currentUserId?: string) => fetchAPI(`/api/posts/user/${userId}${currentUserId ? `?currentUserId=${currentUserId}` : ''}`),
  createPost: (data: { userId: string; content: string; imageUrl?: string }) => 
    fetchAPI('/api/posts', { method: 'POST', body: JSON.stringify(data) }),
  deletePost: (postId: string, userId: string) => 
    fetchAPI(`/api/posts/${postId}`, { method: 'DELETE', body: JSON.stringify({ userId }) }),

  // Users
  getUser: (userId: string) => fetchAPI(`/api/users/${userId}`),
  searchUsers: (query: string) => fetchAPI(`/api/users/search/${query}`),
  updateUser: (userId: string, data: { name?: string; bio?: string; username?: string; image?: string; currentUserId: string }) =>
    fetchAPI(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Follows
  followUser: (userId: string, followerId: string) =>
    fetchAPI(`/api/follows/${userId}`, { method: 'POST', body: JSON.stringify({ followerId }) }),
  unfollowUser: (userId: string, followerId: string) =>
    fetchAPI(`/api/follows/${userId}`, { method: 'DELETE', body: JSON.stringify({ followerId }) }),
  checkFollowStatus: (userId: string, followerId: string) =>
    fetchAPI(`/api/follows/${userId}/status?followerId=${followerId}`),
  getFollowers: (userId: string) => fetchAPI(`/api/follows/${userId}/followers`),
  getFollowing: (userId: string) => fetchAPI(`/api/follows/${userId}/following`),

  // Likes
  likePost: (postId: string, userId: string) =>
    fetchAPI(`/api/likes/${postId}`, { method: 'POST', body: JSON.stringify({ userId }) }),
  unlikePost: (postId: string, userId: string) =>
    fetchAPI(`/api/likes/${postId}`, { method: 'DELETE', body: JSON.stringify({ userId }) }),
};
