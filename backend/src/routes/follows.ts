import { Router } from 'express';
import pool from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Follow a user
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { followerId } = req.body;

    if (!followerId) {
      return res.status(400).json({ error: 'FollowerId is required' });
    }

    if (followerId === userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if already following
    const [existing] = await pool.execute(
      'SELECT id FROM follow WHERE followerId = ? AND followingId = ?',
      [followerId, userId]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    const followId = uuidv4();
    await pool.execute(
      'INSERT INTO follow (id, followerId, followingId) VALUES (?, ?, ?)',
      [followId, followerId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { followerId } = req.body;

    if (!followerId) {
      return res.status(400).json({ error: 'FollowerId is required' });
    }

    await pool.execute(
      'DELETE FROM follow WHERE followerId = ? AND followingId = ?',
      [followerId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Check if following
router.get('/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { followerId } = req.query;

    if (!followerId) {
      return res.json({ isFollowing: false });
    }

    const [follows] = await pool.execute(
      'SELECT id FROM follow WHERE followerId = ? AND followingId = ?',
      [followerId, userId]
    );

    res.json({ isFollowing: Array.isArray(follows) && follows.length > 0 });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

// Get followers
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;
    const [followers] = await pool.execute(`
      SELECT u.id, u.name, u.username, u.image
      FROM follow f
      JOIN \`user\` u ON f.followerId = u.id
      WHERE f.followingId = ?
      ORDER BY f.createdAt DESC
    `, [userId]);

    res.json(followers);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Get following
router.get('/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;
    const [following] = await pool.execute(`
      SELECT u.id, u.name, u.username, u.image
      FROM follow f
      JOIN \`user\` u ON f.followingId = u.id
      WHERE f.followerId = ?
      ORDER BY f.createdAt DESC
    `, [userId]);

    res.json(following);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

export default router;
