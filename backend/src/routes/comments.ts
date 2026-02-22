import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../db/connection";

const router = express.Router();

// Middleware to verify auth
const authenticateToken = (req: any, res: Response, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  // Verify token with Better Auth
  req.userId = req.headers["x-user-id"]; // This would come from Better Auth middleware
  next();
};

// GET comments for a post
router.get("/post/:postId", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const [comments] = (await pool.execute(
      `
      SELECT 
        c.id,
        c.content,
        c.createdAt,
        c.userId,
        u.name,
        u.username,
        u.image
      FROM comment c
      JOIN user u ON c.userId = u.id
      WHERE c.postId = ?
      ORDER BY c.createdAt DESC
      LIMIT ? OFFSET ?
    `,
      [postId, limit, offset],
    )) as any;

    const [countResult] = (await pool.execute(
      "SELECT COUNT(*) as total FROM comment WHERE postId = ?",
      [postId],
    )) as any;

    res.json({
      data: comments,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST create comment
router.post("/", authenticateToken, async (req: any, res: Response) => {
  try {
    const { postId, content } = req.body;
    const userId = req.userId;

    if (!content || !postId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const commentId = uuidv4();
    const now = new Date();

    await pool.execute(
      "INSERT INTO comment (id, postId, userId, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
      [commentId, postId, userId, content, now, now],
    );

    // Create notification for post owner
    const [post] = (await pool.execute("SELECT userId FROM post WHERE id = ?", [
      postId,
    ])) as any;
    if (post[0] && post[0].userId !== userId) {
      const notificationId = uuidv4();
      await pool.execute(
        "INSERT INTO notification (id, userId, type, triggeredBy, postId, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        [notificationId, post[0].userId, "comment", userId, postId, now],
      );
    }

    res.status(201).json({ id: commentId, message: "Comment created" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// PUT update comment
router.put(
  "/:commentId",
  authenticateToken,
  async (req: any, res: Response) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.userId;

      // Verify ownership
      const [comment] = (await pool.execute(
        "SELECT * FROM comment WHERE id = ?",
        [commentId],
      )) as any;
      if (!comment[0] || comment[0].userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await pool.execute(
        "UPDATE comment SET content = ?, updatedAt = ? WHERE id = ?",
        [content, new Date(), commentId],
      );

      res.json({ message: "Comment updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update comment" });
    }
  },
);

// DELETE comment
router.delete(
  "/:commentId",
  authenticateToken,
  async (req: any, res: Response) => {
    try {
      const { commentId } = req.params;
      const userId = req.userId;

      // Verify ownership
      const [comment] = (await pool.execute(
        "SELECT * FROM comment WHERE id = ?",
        [commentId],
      )) as any;
      if (!comment[0] || comment[0].userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await pool.execute("DELETE FROM comment WHERE id = ?", [commentId]);
      res.json({ message: "Comment deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  },
);

export default router;
