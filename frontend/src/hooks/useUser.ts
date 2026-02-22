/**
 * Custom hook for user-related operations
 */

"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { User } from "@/types";

export const useUser = (userId?: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getUser(userId);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
      console.error("Error loading user:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!userId) return false;
      try {
        setError(null);
        await api.updateUser(userId, {
          ...updates,
          currentUserId: userId,
        });
        setUser((prev) => (prev ? { ...prev, ...updates } : null));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update user");
        console.error("Error updating user:", err);
        return false;
      }
    },
    [userId],
  );

  return {
    user,
    isLoading,
    error,
    fetchUser,
    updateUser,
  };
};

/**
 * Custom hook for follow operations
 */
export const useFollow = (userId?: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkFollowStatus = useCallback(
    async (followerId: string) => {
      if (!userId) return;
      try {
        setIsLoading(true);
        setError(null);
        const status = await api.checkFollowStatus(userId, followerId);
        setIsFollowing(status);
      } catch (err) {
        console.error("Error checking follow status:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  const follow = useCallback(
    async (followerId: string) => {
      if (!userId) return false;
      try {
        setError(null);
        await api.followUser(userId, followerId);
        setIsFollowing(true);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to follow user");
        console.error("Error following user:", err);
        return false;
      }
    },
    [userId],
  );

  const unfollow = useCallback(
    async (followerId: string) => {
      if (!userId) return false;
      try {
        setError(null);
        await api.unfollowUser(userId, followerId);
        setIsFollowing(false);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to unfollow user",
        );
        console.error("Error unfollowing user:", err);
        return false;
      }
    },
    [userId],
  );

  return {
    isFollowing,
    isLoading,
    error,
    checkFollowStatus,
    follow,
    unfollow,
  };
};

/**
 * Custom hook for searching users
 */
export const useSearchUsers = () => {
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.searchUsers(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      console.error("Error searching users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
  };
};
