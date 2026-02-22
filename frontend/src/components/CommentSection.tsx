"use client";

import { useState } from "react";
import { comments as commentsAPI } from "@/lib/apiClient";

interface Comment {
  id: string;
  content: string;
  userId: string;
  name: string;
  username: string;
  image?: string;
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
  userId?: string;
}

export default function CommentSection({
  postId,
  userId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentsAPI.getComments(postId, 1);
      setComments(response.data.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentsAPI.createComment(postId, newComment);
      setNewComment("");
      await fetchComments();
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-semibold mb-4">Comments</h3>

      {userId && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Post Comment
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading comments...</p>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-l-2 pl-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{comment.name}</span>
                <span className="text-gray-500">@{comment.username}</span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No comments yet</p>
      )}
    </div>
  );
}
