'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import FollowButton from '@/components/FollowButton';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  username?: string;
  image?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
}

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  userId: string;
  userName: string;
  username?: string;
  userImage?: string;
  likeCount: number;
  isLiked: number;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = params.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const [userData, postsData] = await Promise.all([
        api.getUser(userId),
        api.getUserPosts(userId, session?.user?.id),
      ]);
      setUser(userData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
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
                    <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
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
                <p className="text-gray-700 dark:text-gray-300 mb-4">{user.bio}</p>
              )}
              <div className="flex space-x-6">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user.postCount}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">Posts</span>
                </div>
                <Link href={`/profile/${userId}/followers`}>
                  <div className="cursor-pointer">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user.followerCount}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">Followers</span>
                  </div>
                </Link>
                <Link href={`/profile/${userId}/following`}>
                  <div className="cursor-pointer">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user.followingCount}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">Following</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Posts</h2>
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
