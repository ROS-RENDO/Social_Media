"use client";

import { useEffect, useState } from "react";
import { discover } from "@/lib/apiClient";
import Link from "next/link";

interface ExplorePost {
  id: string;
  content: string;
  imageUrl?: string;
  userId: string;
  name: string;
  username: string;
  image?: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  image?: string;
  bio?: string;
  followerCount: number;
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        setLoading(true);
        if (activeTab === "posts") {
          const response = await discover.getExplore(1);
          setPosts(response.data.data);
        } else {
          const response = await discover.getSuggestedUsers(10);
          setSuggestedUsers(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch explore data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExplore();
  }, [activeTab]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Explore</h1>
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "posts"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "users"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600"
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : activeTab === "posts" ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="block p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3 mb-2">
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <div className="font-semibold">{post.name}</div>
                  <div className="text-sm text-gray-600">@{post.username}</div>
                </div>
              </div>
              <p className="mb-2">{post.content}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full rounded-lg mb-2 max-h-96 object-cover"
                />
              )}
              <div className="flex gap-4 text-gray-600 text-sm">
                <span>❤️ {post.likeCount} likes</span>
                <span>💬 {post.commentCount} comments</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestedUsers.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="p-4 border rounded-lg hover:bg-gray-50 transition text-center"
            >
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2"
                />
              )}
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-gray-600">@{user.username}</div>
              {user.bio && (
                <p className="text-sm text-gray-700 mt-1">{user.bio}</p>
              )}
              <div className="text-xs text-gray-500 mt-2">
                {user.followerCount} followers
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
