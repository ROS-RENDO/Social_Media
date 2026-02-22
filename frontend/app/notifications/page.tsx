"use client";

import { useEffect, useState } from "react";
import { notifications as notificationsAPI } from "@/lib/apiClient";
import Link from "next/link";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "message";
  triggeredBy: string;
  postId?: string;
  isRead: boolean;
  createdAt: string;
  name: string;
  username: string;
  image?: string;
  postContent?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationsAPI.getNotifications(1);
        setNotifications(response.data.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case "like":
        return `${notification.name} liked your post`;
      case "comment":
        return `${notification.name} commented on your post`;
      case "follow":
        return `${notification.name} followed you`;
      case "message":
        return `New message from ${notification.name}`;
      default:
        return "New notification";
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={() => notificationsAPI.markAllAsRead()}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading notifications...</p>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg transition ${
                !notification.isRead ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <Link
                  href={`/profile/${notification.triggeredBy}`}
                  className="flex items-center gap-3 flex-1"
                >
                  {notification.image && (
                    <img
                      src={notification.image}
                      alt={notification.name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {getNotificationMessage(notification)}
                    </p>
                    {notification.postContent && (
                      <p className="text-sm text-gray-600 truncate">
                        "{notification.postContent}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-blue-500 hover:text-blue-700 ml-2"
                  >
                    ✓
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">No notifications yet</p>
      )}
    </div>
  );
}
