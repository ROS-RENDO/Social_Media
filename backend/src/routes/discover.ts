import express, { Request, Response } from "express";
import db from "../db/connection";

const router = express.Router();

const authenticateToken = (req: any, res: Response, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  req.userId = req.headers["x-user-id"];
  next();
};

// GET trending hashtags
router.get("/trending/hashtags", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const [hashtags] = await db.query(
      `
      SELECT id, tag, postCount, createdAt
      FROM hashtag
      ORDER BY postCount DESC
      LIMIT ?
    `,
      [limit],
    );

    res.json({ data: hashtags });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trending hashtags" });
  }
});

// GET trending posts
router.get("/trending/posts", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const [posts] = await db.query(
      `
      SELECT 
        p.id,
        p.content,
        p.imageUrl,
        p.createdAt,
        p.updatedAt,
        p.userId,
        u.name,
        u.username,
        u.image,
        (SELECT COUNT(*) FROM like WHERE postId = p.id) as likeCount,
        (SELECT COUNT(*) FROM comment WHERE postId = p.id) as commentCount
      FROM post p
      JOIN user u ON p.userId = u.id
      ORDER BY (
        (SELECT COUNT(*) FROM like WHERE postId = p.id) +
        (SELECT COUNT(*) FROM comment WHERE postId = p.id) * 2
      ) DESC
      LIMIT ?
    `,
      [limit],
    );

    res.json({ data: posts });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trending posts" });
  }
});

// GET suggested users
router.get(
  "/suggested-users",
  authenticateToken,
  async (req: any, res: Response) => {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit as string) || 10;

      // Get users that current user doesn't follow and hasn't blocked
      const [users] = await db.query(
        `
      SELECT 
        u.id,
        u.name,
        u.username,
        u.image,
        u.bio,
        (SELECT COUNT(*) FROM follow WHERE followingId = u.id) as followerCount
      FROM user u
      WHERE u.id != ?
        AND u.id NOT IN (SELECT followingId FROM follow WHERE followerId = ?)
        AND u.id NOT IN (SELECT blockedId FROM block WHERE blockerId = ?)
      ORDER BY followerCount DESC
      LIMIT ?
    `,
        [userId, userId, userId, limit],
      );

      res.json({ data: users });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suggested users" });
    }
  },
);

// GET explore feed (posts from users not following)
router.get("/explore", authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const [posts] = await db.query(
      `
      SELECT 
        p.id,
        p.content,
        p.imageUrl,
        p.createdAt,
        p.userId,
        u.name,
        u.username,
        u.image,
        (SELECT COUNT(*) FROM like WHERE postId = p.id) as likeCount,
        (SELECT COUNT(*) FROM comment WHERE postId = p.id) as commentCount,
        CASE WHEN EXISTS(SELECT 1 FROM like WHERE postId = p.id AND userId = ?) THEN true ELSE false END as isLiked
      FROM post p
      JOIN user u ON p.userId = u.id
      WHERE p.userId NOT IN (
        SELECT followingId FROM follow WHERE followerId = ?
      ) AND p.userId != ?
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `,
      [userId, userId, userId, limit, offset],
    );

    res.json({ data: posts });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch explore feed" });
  }
});

export default router;
