'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';
import { api } from '@/lib/api';

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

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      loadPosts();
    }
  }, [session, isPending, router]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPosts(session?.user?.id);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <CreatePost userId={session.user.id} onPostCreated={loadPosts} />
        
        {isLoading ? (
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 py-8">
            No posts yet. Be the first to post!
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={session.user.id}
              onUpdate={loadPosts}
            />
          ))
        )}
      </div>
    </div>
  );
}
