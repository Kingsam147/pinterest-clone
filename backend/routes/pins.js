const express = require('express');
const router = express.Router();
const Pin = require('../models/Pin');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { readLimiter, writeLimiter } = require('../middleware/rateLimiter');
const { createPinSchema, updatePinSchema } = require('../schemas/pin.schemas');

// Search pins — must be defined before /:id to avoid route conflict
router.get('/search', readLimiter, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const pins = await Pin.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
    }).populate('user', 'username avatar').sort({ createdAt: -1 });
    res.json(pins);
  } catch (error) {
    console.error('Search pins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all pins
router.get('/', readLimiter, async (req, res) => {
  try {
    const pins = await Pin.find().populate('user', 'username avatar').sort({ createdAt: -1 });
    res.json(pins);
  } catch (error) {
    console.error('Get pins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pin by ID
router.get('/:id', readLimiter, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id).populate('user', 'username avatar');
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }
    res.json(pin);
  } catch (error) {
    console.error('Get pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create pin (authenticated)
router.post('/', writeLimiter, authMiddleware, validate(createPinSchema), async (req, res) => {
  try {
    const { title, description, imageUrl, category, tags, boardId } = req.body;
    const pin = new Pin({
      title,
      description,
      imageUrl,
      category,
      tags,
      board: boardId || undefined,
      user: req.user.userId,
    });
    await pin.save();
    await pin.populate('user', 'username avatar');
    res.status(201).json(pin);
  } catch (error) {
    console.error('Create pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update pin (authenticated, owner only)
router.put('/:id', writeLimiter, authMiddleware, validate(updatePinSchema), async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }
    if (pin.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this pin' });
    }
    const { title, description } = req.body;
    pin.title = title ?? pin.title;
    pin.description = description ?? pin.description;
    await pin.save();
    res.json(pin);
  } catch (error) {
    console.error('Update pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete pin (authenticated, owner only)
router.delete('/:id', writeLimiter, authMiddleware, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }
    if (pin.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this pin' });
    }
    await pin.deleteOne();
    res.json({ message: 'Pin deleted' });
  } catch (error) {
    console.error('Delete pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
