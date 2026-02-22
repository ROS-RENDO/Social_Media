"use client";

import { useEffect } from "react";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import { useProtectedRoute, usePosts } from "@/hooks";
import type { Post } from "@/types";

export default function Home() {
  const { session, isPending, isAuthenticated } = useProtectedRoute();
  const { posts, isLoading, fetchPosts } = usePosts(session?.user?.id);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchPosts();
    }
  }, [isAuthenticated, fetchPosts, isLoading]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <CreatePost
          userId={session?.user?.id || ""}
          onPostCreated={fetchPosts}
        />

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
              currentUserId={session?.user?.id || ""}
              onUpdate={fetchPosts}
            />
          ))
        )}
      </div>
    </div>
  );
}
