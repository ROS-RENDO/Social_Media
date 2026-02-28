"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";
import { users as usersAPI } from "@/lib/apiClient";
import type { User, Post } from "@/types/index";

export default function ProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const userId = params.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const userData = await usersAPI.getProfile(userId);
      setUser(userData.data);
      // Get user's posts separately if needed
      setPosts([]);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId, loadProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 dark:text-gray-300 text-3xl font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.name}
                  </h1>
                  {user.username && (
                    <p className="text-gray-500 dark:text-gray-400">
                      @{user.username}
                    </p>
                  )}
                </div>
                {session?.user && (
                  <FollowButton
                    userId={userId}
                    currentUserId={session.user.id}
                    onUpdate={loadProfile}
                  />
                )}
              </div>
              {user.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {user.bio}
                </p>
              )}
              <div className="flex space-x-6">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user.postCount}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    Posts
                  </span>
                </div>
                <Link href={`/profile/${userId}/followers`}>
                  <div className="cursor-pointer">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user.followerCount}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      Followers
                    </span>
                  </div>
                </Link>
                <Link href={`/profile/${userId}/following`}>
                  <div className="cursor-pointer">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user.followingCount}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      Following
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Posts
          </h2>
          {posts.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-8">
              No posts yet.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={session?.user?.id}
                onUpdate={loadProfile}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
