"use client";

import { useEffect, useState } from "react";
import { discover } from "@/lib/apiClient";
import Link from "next/link";

interface TrendingPost {
  id: string;
  content: string;
  username: string;
  name: string;
  image?: string;
  likeCount: number;
  commentCount: number;
}

interface TrendingHashtag {
  id: string;
  tag: string;
  postCount: number;
}

export default function Sidebar() {
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const response = await discover.getTrendingHashtags(5);
        setTrendingHashtags(response.data.data);
      } catch (error) {
        console.error("Failed to fetch trending hashtags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="sticky top-0 h-screen p-4 bg-white border-r overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6">Trending</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-4">
            {trendingHashtags.map((hashtag) => (
              <Link
                key={hashtag.id}
                href={`/explore/hashtag/${hashtag.tag}`}
                className="block p-4 rounded-lg border hover:bg-gray-50 transition"
              >
                <div className="font-semibold text-blue-500">
                  #{hashtag.tag}
                </div>
                <div className="text-sm text-gray-500">
                  {hashtag.postCount} posts
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6">Quick Links</h2>
        <nav className="space-y-2">
          <Link
            href="/explore"
            className="block p-3 rounded-lg hover:bg-gray-100 transition"
          >
            🔍 Explore
          </Link>
          <Link
            href="/notifications"
            className="block p-3 rounded-lg hover:bg-gray-100 transition"
          >
            🔔 Notifications
          </Link>
          <Link
            href="/messages"
            className="block p-3 rounded-lg hover:bg-gray-100 transition"
          >
            💬 Messages
          </Link>
        </nav>
      </div>
    </div>
  );
}
