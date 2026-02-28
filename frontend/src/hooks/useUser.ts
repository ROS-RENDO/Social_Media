/**
 * Custom hook for user-related operations
 */

"use client";

import { useState, useCallback } from "react";
import { users as usersAPI, follows as followsAPI } from "@/lib/apiClient";
import { User, Follow } from "@/types/index";

export const useUser = (userId?: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await usersAPI.getProfile(userId);
      setUser(response.data);
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
        const response = await usersAPI.updateProfile(updates);
        setUser(response.data);
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
    async (targetUserId: string) => {
      if (!userId) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await followsAPI.getFollowing(userId, 1);
        const isFollowing = response.data.some(
          (follow: Follow) => follow.followingId === targetUserId,
        );
        setIsFollowing(isFollowing);
      } catch (err) {
        console.error("Error checking follow status:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  const follow = useCallback(
    async (targetUserId: string) => {
      if (!userId) return false;
      try {
        setError(null);
        await followsAPI.follow(targetUserId);
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
    async (followId: string) => {
      if (!userId) return false;
      try {
        setError(null);
        await followsAPI.unfollow(followId);
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
      const response = await usersAPI.searchUsers(query);
      setResults(response.data);
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
