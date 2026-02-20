'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface PostCardProps {
  post: {
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
  };
  currentUserId?: string;
  onUpdate?: () => void;
}

export default function PostCard({ post, currentUserId, onUpdate }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked > 0);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    try {
      if (isLiked) {
        await api.unlikePost(post.id, currentUserId);
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await api.likePost(post.id, currentUserId);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-start space-x-4">
        <Link href={`/profile/${post.userId}`}>
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
            {post.userImage ? (
              <img src={post.userImage} alt={post.userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-600 dark:text-gray-300 font-semibold">
                {post.userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Link href={`/profile/${post.userId}`}>
              <span className="font-semibold text-gray-900 dark:text-white hover:underline">
                {post.userName}
              </span>
            </Link>
            {post.username && (
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                @{post.username}
              </span>
            )}
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              · {formatDate(post.createdAt)}
            </span>
          </div>
          <p className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-wrap">
            {post.content}
          </p>
          {post.imageUrl && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img src={post.imageUrl} alt="Post image" className="w-full max-h-96 object-cover" />
            </div>
          )}
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              disabled={!currentUserId || isLoading}
              className={`flex items-center space-x-2 ${
                isLiked
                  ? 'text-red-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
              } transition-colors`}
            >
              <svg
                className="w-5 h-5"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
