"use client";

import { useEffect, useState } from "react";
import { messages as messagesAPI } from "@/lib/apiClient";
import { useParams } from "next/navigation";

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  createdAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const otherUserId = params.userId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await messagesAPI.getChat(otherUserId, 1);
        setMessages(response.data.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (otherUserId) {
      fetchMessages();
    }
  }, [otherUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await messagesAPI.sendMessage(otherUserId, newMessage);
      setNewMessage("");
      // Refresh messages
      const response = await messagesAPI.getChat(otherUserId, 1);
      setMessages(response.data.data);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Chat</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === otherUserId
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.senderId === otherUserId
                      ? "bg-gray-200"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  <p>{message.content}</p>
                  <small className="text-xs opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No messages yet</p>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
