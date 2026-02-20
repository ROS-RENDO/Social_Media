import { Router } from 'express';
import pool from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Like a post
router.post('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
    }

    // Check if already liked
    const [existing] = await pool.execute(
      'SELECT id FROM `like` WHERE userId = ? AND postId = ?',
      [userId, postId]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    const likeId = uuidv4();
    await pool.execute(
      'INSERT INTO `like` (id, userId, postId) VALUES (?, ?, ?)',
      [likeId, userId, postId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Unlike a post
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
    }

    await pool.execute(
      'DELETE FROM `like` WHERE userId = ? AND postId = ?',
      [userId, postId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

export default router;
