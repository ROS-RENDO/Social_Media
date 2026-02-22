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

// GET all conversations
router.get(
  "/conversations",
  authenticateToken,
  async (req: any, res: Response) => {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const [conversations] = (await pool.execute(
        `
      SELECT DISTINCT
        CASE 
          WHEN senderId = ? THEN recipientId 
          ELSE senderId 
        END as otherUserId,
        u.name,
        u.username,
        u.image,
        (SELECT content FROM message m2 
         WHERE (m2.senderId = m.senderId AND m2.recipientId = m.recipientId)
            OR (m2.senderId = m.recipientId AND m2.recipientId = m.senderId)
         ORDER BY m2.createdAt DESC LIMIT 1) as lastMessage,
        (SELECT createdAt FROM message m2 
         WHERE (m2.senderId = m.senderId AND m2.recipientId = m.recipientId)
            OR (m2.senderId = m.recipientId AND m2.recipientId = m.senderId)
         ORDER BY m2.createdAt DESC LIMIT 1) as lastMessageTime,
        (SELECT COUNT(*) FROM message m2 
         WHERE m2.recipientId = ? 
           AND (m2.senderId = CASE 
             WHEN senderId = ? THEN recipientId 
             ELSE senderId 
           END)
           AND m2.isRead = false) as unreadCount
      FROM message m
      JOIN user u ON u.id = CASE 
        WHEN senderId = ? THEN recipientId 
        ELSE senderId 
      END
      WHERE senderId = ? OR recipientId = ?
      GROUP BY otherUserId
      ORDER BY lastMessageTime DESC
      LIMIT ? OFFSET ?
    `,
        [userId, userId, userId, userId, userId, userId, limit, offset],
      )) as any;

      res.json({ data: conversations });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  },
);

// GET messages with a user
router.get(
  "/chat/:otherUserId",
  authenticateToken,
  async (req: any, res: Response) => {
    try {
      const userId = req.userId;
      const { otherUserId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = 30;
      const offset = (page - 1) * limit;

      const [messages] = (await pool.execute(
        `
      SELECT * FROM message
      WHERE (senderId = ? AND recipientId = ?) 
         OR (senderId = ? AND recipientId = ?)
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `,
        [userId, otherUserId, otherUserId, userId, limit, offset],
      )) as any;

      // Mark messages as read
      await pool.execute(
        "UPDATE message SET isRead = true WHERE recipientId = ? AND senderId = ?",
        [userId, otherUserId],
      );

      res.json({ data: messages.reverse() });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  },
);

// POST send message
router.post("/", authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const messageId = uuidv4();
    const now = new Date();

    await pool.execute(
      "INSERT INTO message (id, senderId, recipientId, content, createdAt) VALUES (?, ?, ?, ?, ?)",
      [messageId, userId, recipientId, content, now],
    );

    // Create notification
    const notificationId = uuidv4();
    await pool.execute(
      "INSERT INTO notification (id, userId, type, triggeredBy, createdAt) VALUES (?, ?, ?, ?, ?)",
      [notificationId, recipientId, "message", userId, now],
    );

    res.status(201).json({ id: messageId, message: "Message sent" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
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
        "SELECT COUNT(*) as count FROM message WHERE recipientId = ? AND isRead = false",
        [userId],
      )) as any;
      res.json({ unreadCount: result[0].count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  },
);

export default router;
