import { Router } from 'express';
import pool from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all posts (feed)
router.get('/', async (req, res) => {
  try {
    const [posts] = await pool.execute(`
      SELECT 
        p.*,
        u.id as userId,
        u.name as userName,
        u.username,
        u.image as userImage,
        COUNT(DISTINCT l.id) as likeCount,
        COUNT(DISTINCT CASE WHEN l.userId = ? THEN 1 END) as isLiked
      FROM post p
      JOIN user u ON p.userId = u.id
      LEFT JOIN \`like\` l ON p.id = l.postId
      GROUP BY p.id, u.id, u.name, u.username, u.image, p.content, p.imageUrl, p.createdAt, p.updatedAt
      ORDER BY p.createdAt DESC
      LIMIT 50
    `, [req.query.userId || null]);

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get posts by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [posts] = await pool.execute(`
      SELECT 
        p.*,
        u.id as userId,
        u.name as userName,
        u.username,
        u.image as userImage,
        COUNT(DISTINCT l.id) as likeCount,
        COUNT(DISTINCT CASE WHEN l.userId = ? THEN 1 END) as isLiked
      FROM post p
      JOIN user u ON p.userId = u.id
      LEFT JOIN \`like\` l ON p.id = l.postId
      WHERE p.userId = ?
      GROUP BY p.id, u.id, u.name, u.username, u.image, p.content, p.imageUrl, p.createdAt, p.updatedAt
      ORDER BY p.createdAt DESC
    `, [req.query.currentUserId || null, userId]);

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Get single post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const [posts] = await pool.execute(`
      SELECT 
        p.*,
        u.id as userId,
        u.name as userName,
        u.username,
        u.image as userImage,
        COUNT(DISTINCT l.id) as likeCount,
        COUNT(DISTINCT CASE WHEN l.userId = ? THEN 1 END) as isLiked
      FROM post p
      JOIN user u ON p.userId = u.id
      LEFT JOIN \`like\` l ON p.id = l.postId
      WHERE p.id = ?
      GROUP BY p.id, u.id, u.name, u.username, u.image, p.content, p.imageUrl, p.createdAt, p.updatedAt
    `, [req.query.userId || null, postId]);

    if (Array.isArray(posts) && posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(Array.isArray(posts) ? posts[0] : posts);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create post
router.post('/', async (req, res) => {
  try {
    const { userId, content, imageUrl } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: 'UserId and content are required' });
    }

    const postId = uuidv4();
    await pool.execute(
      'INSERT INTO post (id, userId, content, imageUrl) VALUES (?, ?, ?, ?)',
      [postId, userId, content, imageUrl || null]
    );

    const [posts] = await pool.execute(`
      SELECT 
        p.*,
        u.id as userId,
        u.name as userName,
        u.username,
        u.image as userImage,
        0 as likeCount,
        0 as isLiked
      FROM post p
      JOIN user u ON p.userId = u.id
      WHERE p.id = ?
    `, [postId]);

    res.status(201).json(Array.isArray(posts) ? posts[0] : posts);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Delete post
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    // Verify ownership
    const [posts] = await pool.execute(
      'SELECT userId FROM post WHERE id = ?',
      [postId]
    );

    if (Array.isArray(posts) && posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = Array.isArray(posts) ? posts[0] : posts;
    if ((post as any).userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await pool.execute('DELETE FROM post WHERE id = ?', [postId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
