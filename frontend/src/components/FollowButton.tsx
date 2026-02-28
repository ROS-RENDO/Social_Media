"use client";

import { useState, useEffect } from "react";
import { follows as followsAPI } from "@/lib/apiClient";

interface FollowButtonProps {
  userId: string;
  currentUserId: string;
  onUpdate?: () => void;
}

export default function FollowButton({
  userId,
  currentUserId,
  onUpdate,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (userId === currentUserId) {
      setIsChecking(false);
      return;
    }

    followsAPI
      .getFollowing(userId, 1)
      .then((response) => {
        const isFollowing = response.data.some(
          (follow: any) => follow.followingId === currentUserId,
        );
        setIsFollowing(isFollowing);
      })
      .catch(console.error)
      .finally(() => setIsChecking(false));
  }, [userId, currentUserId]);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await followsAPI.unfollow(userId);
        setIsFollowing(false);
      } else {
        await followsAPI.follow(userId);
        setIsFollowing(true);
      }
      onUpdate?.();
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (userId === currentUserId) {
    return null;
  }

  if (isChecking) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg transition-colors ${
        isFollowing
          ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          : "bg-blue-500 text-white hover:bg-blue-600"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
