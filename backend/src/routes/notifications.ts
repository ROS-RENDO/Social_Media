import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../db/connection";

const router = express.Router();

const authenticateToken = (req: any, res: Response, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  req.userId = req.headers["x-user-id"];
  next();
};

// GET all notifications
router.get("/", authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const [notifications] = (await pool.execute(
      `
      SELECT 
        n.id,
        n.type,
        n.triggeredBy,
        n.postId,
        n.isRead,
        n.createdAt,
        u.name,
        u.username,
        u.image,
        p.content as postContent
      FROM notification n
      JOIN user u ON n.triggeredBy = u.id
      LEFT JOIN post p ON n.postId = p.id
      WHERE n.userId = ?
      ORDER BY n.createdAt DESC
      LIMIT ? OFFSET ?
    `,
      [userId, limit, offset],
    )) as any;

    const [countResult] = (await pool.execute(
      "SELECT COUNT(*) as total FROM notification WHERE userId = ?",
      [userId],
    )) as any;

    res.json({
      data: notifications,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// GET unread count
router.get(
  "/unread/count",
  authenticateToken,
  async (req: any, res: Response) => {
    try {
      const userId = req.userId;
      const [result] = (await pool.execute(
        "SELECT COUNT(*) as count FROM notification WHERE userId = ? AND isRead = false",
        [userId],
      )) as any;
      res.json({ unreadCount: result[0].count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  },
);

// PATCH mark as read
router.patch(
  "/:notificationId/read",
  authenticateToken,
  async (req: any, res: Response) => {
    try {
      const { notificationId } = req.params;
      const userId = req.userId;

      // Verify ownership
      const [notification] = (await pool.execute(
        "SELECT * FROM notification WHERE id = ?",
        [notificationId],
      )) as any;

      if (!notification[0] || notification[0].userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await pool.execute("UPDATE notification SET isRead = true WHERE id = ?", [
        notificationId,
      ]);

      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification" });
    }
  },
);

// PATCH mark all as read
router.patch(
  "/mark-all/read",
  authenticateToken,
  async (req: any, res: Response) => {
    try {
      const userId = req.userId;

      await pool.execute(
        "UPDATE notification SET isRead = true WHERE userId = ?",
        [userId],
      );

      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all as read" });
    }
  },
);

// DELETE notification
router.delete(
  "/:notificationId",
  authenticateToken,
  async (req: any, res: Response) => {
    try {
      const { notificationId } = req.params;
      const userId = req.userId;

      // Verify ownership
      const [notification] = (await pool.execute(
        "SELECT * FROM notification WHERE id = ?",
        [notificationId],
      )) as any;

      if (!notification[0] || notification[0].userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await pool.execute("DELETE FROM notification WHERE id = ?", [
        notificationId,
      ]);
      res.json({ message: "Notification deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete notification" });
    }
  },
);

export default router;
