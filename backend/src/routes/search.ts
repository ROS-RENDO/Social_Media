import express, { Request, Response } from "express";
import pool from "../db/connection";

const router = express.Router();

// GET search - users, posts, hashtags
router.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const type = (req.query.type as string) || "all"; // 'users', 'posts', 'hashtags', 'all'

    if (!query || query.length < 2) {
      return res
        .status(400)
        .json({ error: "Query must be at least 2 characters" });
    }

    const searchTerm = `%${query}%`;
    const limit = 20;

    const results: any = {};

    if (type === "all" || type === "users") {
      const [users] = (await pool.execute(
        `
        SELECT 
          id,
          name,
          username,
          image,
          bio,
          (SELECT COUNT(*) FROM follow WHERE followingId = user.id) as followerCount
        FROM user
        WHERE name LIKE ? OR username LIKE ? OR bio LIKE ?
        LIMIT ?
      `,
        [searchTerm, searchTerm, searchTerm, limit],
      )) as any;
      results.users = users;
    }

    if (type === "all" || type === "posts") {
      const [posts] = (await pool.execute(
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
          (SELECT COUNT(*) FROM comment WHERE postId = p.id) as commentCount
        FROM post p
        JOIN user u ON p.userId = u.id
        WHERE p.content LIKE ?
        ORDER BY p.createdAt DESC
        LIMIT ?
      `,
        [searchTerm, limit],
      )) as any;
      results.posts = posts;
    }

    if (type === "all" || type === "hashtags") {
      const [hashtags] = (await pool.execute(
        `
        SELECT id, tag, postCount, createdAt
        FROM hashtag
        WHERE tag LIKE ?
        ORDER BY postCount DESC
        LIMIT ?
      `,
        [searchTerm, limit],
      )) as any;
      results.hashtags = hashtags;
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

// GET posts by hashtag
router.get("/hashtag/:tag", async (req: Request, res: Response) => {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const [posts] = (await pool.execute(
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
        (SELECT COUNT(*) FROM comment WHERE postId = p.id) as commentCount
      FROM post p
      JOIN user u ON p.userId = u.id
      JOIN postHashtag ph ON p.id = ph.postId
      JOIN hashtag h ON ph.hashtagId = h.id
      WHERE h.tag = ?
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `,
      [tag, limit, offset],
    )) as any;

    const [countResult] = (await pool.execute(
      `SELECT COUNT(*) as total FROM post p
       JOIN postHashtag ph ON p.id = ph.postId
       JOIN hashtag h ON ph.hashtagId = h.id
       WHERE h.tag = ?`,
      [tag],
    )) as any;

    res.json({
      data: posts,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hashtag posts" });
  }
});

export default router;
