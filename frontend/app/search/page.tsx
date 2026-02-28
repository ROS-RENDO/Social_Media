"use client";

import { useState } from "react";
import Image from "next/image";
import { search } from "@/lib/apiClient";
import Link from "next/link";

interface SearchUser {
  id: string;
  name: string;
  username: string;
  image?: string;
  bio?: string;
  followerCount: number;
}

interface SearchPost {
  id: string;
  content: string;
  imageUrl?: string;
  userId: string;
  name: string;
  username: string;
  image?: string;
  likeCount: number;
  commentCount: number;
}

interface SearchHashtag {
  id: string;
  tag: string;
  postCount: number;
}

interface SearchResults {
  users?: SearchUser[];
  posts?: SearchPost[];
  hashtags?: SearchHashtag[];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const response = await search.search(query, "all");
      setResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, posts, hashtags..."
          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </form>

      {loading ? (
        <p className="text-center text-gray-500">Searching...</p>
      ) : searched ? (
        <div className="space-y-8">
          {results.users && results.users.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Users</h2>
              <div className="space-y-2">
                {results.users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition flex items-center gap-3"
                  >
                    {user.image && (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-gray-600">
                        @{user.username}
                      </div>
                      {user.bio && (
                        <p className="text-xs text-gray-700 mt-1">{user.bio}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.posts && results.posts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Posts</h2>
              <div className="space-y-4">
                {results.posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {post.image && (
                        <Image
                          src={post.image}
                          alt={post.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-semibold">{post.name}</div>
                        <div className="text-sm text-gray-600">
                          @{post.username}
                        </div>
                      </div>
                    </div>
                    <p className="mb-2">{post.content}</p>
                    {post.imageUrl && (
                      <Image
                        src={post.imageUrl}
                        alt="Post"
                        width={600}
                        height={400}
                        className="rounded-lg mb-2 object-cover"
                      />
                    )}
                    <div className="flex gap-4 text-gray-600 text-sm">
                      <span>❤️ {post.likeCount}</span>
                      <span>💬 {post.commentCount}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.hashtags && results.hashtags.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Hashtags</h2>
              <div className="grid grid-cols-2 gap-4">
                {results.hashtags.map((hashtag) => (
                  <Link
                    key={hashtag.id}
                    href={`/explore/hashtag/${hashtag.tag}`}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition"
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
            </div>
          )}

          {!results.users?.length &&
            !results.posts?.length &&
            !results.hashtags?.length && (
              <p className="text-center text-gray-500">No results found</p>
            )}
        </div>
      ) : (
        <p className="text-center text-gray-500">Start typing to search</p>
      )}
    </div>
  );
}
