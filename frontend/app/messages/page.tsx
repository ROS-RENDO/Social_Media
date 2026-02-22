"use client";

import { useEffect, useState } from "react";
import { messages as messagesAPI } from "@/lib/apiClient";
import Link from "next/link";

interface Conversation {
  otherUserId: string;
  name: string;
  username: string;
  image?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await messagesAPI.getConversations(1);
        setConversations(response.data.data);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading conversations...</p>
      ) : conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <Link
              key={conversation.otherUserId}
              href={`/messages/${conversation.otherUserId}`}
              className="block p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {conversation.image && (
                    <img
                      src={conversation.image}
                      alt={conversation.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-semibold">{conversation.name}</div>
                    <div className="text-sm text-gray-600 truncate max-w-xs">
                      {conversation.lastMessage}
                    </div>
                  </div>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">No conversations yet</p>
      )}
    </div>
  );
}
