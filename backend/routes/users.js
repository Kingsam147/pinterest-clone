const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Pin = require('../models/Pin');
const authMiddleware = require('../middleware/auth');
const { readLimiter, writeLimiter } = require('../middleware/rateLimiter');

// Get user profile by ID
router.get('/:id', readLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pins created by a user
router.get('/:id/pins', readLimiter, async (req, res) => {
  try {
    const pins = await Pin.find({ user: req.params.id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(pins);
  } catch (error) {
    console.error('Get user pins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow or unfollow a user (authenticated)
router.put('/:id/follow', writeLimiter, authMiddleware, async (req, res) => {
  try {
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user.userId);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      currentUser.following.pull(req.params.id);
      targetUser.followers.pull(req.user.userId);
    } else {
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user.userId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ following: !isFollowing });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
