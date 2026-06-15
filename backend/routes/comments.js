const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Pin = require('../models/Pin');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { readLimiter, writeLimiter } = require('../middleware/rateLimiter');
const { createCommentSchema } = require('../schemas/comment.schemas');

// Get all comments for a pin
router.get('/pin/:pinId', readLimiter, async (req, res) => {
  try {
    const comments = await Comment.find({ pin: req.params.pinId })
      .populate('user', 'username avatar')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to a pin (authenticated)
router.post('/pin/:pinId', writeLimiter, authMiddleware, validate(createCommentSchema), async (req, res) => {
  try {
    const { text } = req.body;

    const pin = await Pin.findById(req.params.pinId);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    const comment = new Comment({
      text,
      user: req.user.userId,
      pin: req.params.pinId,
    });
    await comment.save();
    await comment.populate('user', 'username avatar');

    pin.comments.push(comment._id);
    await pin.save();

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment (authenticated, owner only)
router.delete('/:id', writeLimiter, authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Pin.findByIdAndUpdate(comment.pin, { $pull: { comments: comment._id } });
    await comment.deleteOne();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
