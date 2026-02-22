/**
 * Custom hook for post-related operations
 */

"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Post } from "@/types";

export const usePosts = (userId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getPosts(userId);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
      console.error("Error loading posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const createPost = useCallback(
    async (content: string, imageUrl?: string) => {
      try {
        setError(null);
        await api.createPost({ userId: userId || "", content, imageUrl });
        await fetchPosts();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create post");
        console.error("Error creating post:", err);
        return false;
      }
    },
    [userId, fetchPosts],
  );

  const deletePost = useCallback(
    async (postId: string) => {
      try {
        setError(null);
        await api.deletePost(postId, userId || "");
        setPosts(posts.filter((p) => p.id !== postId));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete post");
        console.error("Error deleting post:", err);
        return false;
      }
    },
    [userId, posts],
  );

  const likePost = useCallback(
    async (postId: string) => {
      try {
        setError(null);
        await api.likePost(postId, userId || "");
        setPosts(
          posts.map((p) =>
            p.id === postId
              ? { ...p, likeCount: p.likeCount + 1, isLiked: 1 }
              : p,
          ),
        );
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to like post");
        console.error("Error liking post:", err);
        return false;
      }
    },
    [userId, posts],
  );

  const unlikePost = useCallback(
    async (postId: string) => {
      try {
        setError(null);
        await api.unlikePost(postId, userId || "");
        setPosts(
          posts.map((p) =>
            p.id === postId
              ? { ...p, likeCount: Math.max(p.likeCount - 1, 0), isLiked: 0 }
              : p,
          ),
        );
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to unlike post");
        console.error("Error unliking post:", err);
        return false;
      }
    },
    [userId, posts],
  );

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    createPost,
    deletePost,
    likePost,
    unlikePost,
  };
};
