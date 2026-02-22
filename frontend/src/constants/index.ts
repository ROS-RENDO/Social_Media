/**
 * Application constants and configuration values
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  TIMEOUT: 30000, // 30 seconds
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  EXPLORE: "/explore",
  SEARCH: "/search",
  MESSAGES: "/messages",
  NOTIFICATIONS: "/notifications",
} as const;

export const UI_CONFIG = {
  POSTS_PER_PAGE: 20,
  COMMENTS_PER_LOAD: 10,
  MESSAGES_PER_PAGE: 30,
  NOTIFICATIONS_PER_PAGE: 20,
  SEARCH_DEBOUNCE_MS: 300,
  IMAGE_MAX_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
} as const;

export const NOTIFICATION_TYPES = {
  LIKE: "like",
  COMMENT: "comment",
  FOLLOW: "follow",
  MESSAGE: "message",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please try again.",
  UNAUTHORIZED: "Please log in to continue.",
  FORBIDDEN: "You do not have permission to do this.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Something went wrong. Please try again later.",
  INVALID_INPUT: "Please check your input and try again.",
  FILE_TOO_LARGE: `File size exceeds ${UI_CONFIG.IMAGE_MAX_SIZE_MB}MB limit.`,
  INVALID_FILE_TYPE: "Please upload a valid image file.",
} as const;

export const SUCCESS_MESSAGES = {
  POST_CREATED: "Post created successfully!",
  POST_DELETED: "Post deleted successfully!",
  COMMENT_CREATED: "Comment added!",
  FOLLOWED: "Following user!",
  UNFOLLOWED: "Unfollowed user!",
  PROFILE_UPDATED: "Profile updated successfully!",
} as const;
