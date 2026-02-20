import { Router } from 'express';
import pool from '../db/connection';

const router = Router();

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [users] = await pool.execute(
      'SELECT id, name, email, image, bio, username, createdAt FROM `user` WHERE id = ?',
      [userId]
    );

    if (Array.isArray(users) && users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = Array.isArray(users) ? users[0] : users;

    // Get follower/following counts
    const [followers] = await pool.execute(
      'SELECT COUNT(*) as count FROM follow WHERE followingId = ?',
      [userId]
    );
    const [following] = await pool.execute(
      'SELECT COUNT(*) as count FROM follow WHERE followerId = ?',
      [userId]
    );

    const [posts] = await pool.execute(
      'SELECT COUNT(*) as count FROM post WHERE userId = ?',
      [userId]
    );

    res.json({
      ...user,
      followerCount: Array.isArray(followers) ? (followers[0] as any).count : 0,
      followingCount: Array.isArray(following) ? (following[0] as any).count : 0,
      postCount: Array.isArray(posts) ? (posts[0] as any).count : 0,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const [users] = await pool.execute(
      `SELECT id, name, username, image FROM \`user\` 
       WHERE name LIKE ? OR username LIKE ? 
       LIMIT 20`,
      [`%${query}%`, `%${query}%`]
    );

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, bio, username, image } = req.body;

    // Verify ownership
    if (req.body.currentUserId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await pool.execute(
      'UPDATE `user` SET name = ?, bio = ?, username = ?, image = ? WHERE id = ?',
      [name, bio, username, image, userId]
    );

    const [users] = await pool.execute(
      'SELECT id, name, email, image, bio, username, createdAt FROM `user` WHERE id = ?',
      [userId]
    );

    res.json(Array.isArray(users) ? users[0] : users);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
