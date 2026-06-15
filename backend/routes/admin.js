const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Pin = require('../models/Pin');
const Board = require('../models/Board');
const { writeLimiter } = require('../middleware/rateLimiter');

const requireAdminSecret = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// PUBLIC — no auth required: protected by ADMIN_SECRET header instead of JWT
router.post('/seed', writeLimiter, requireAdminSecret, async (req, res) => {
  try {
    await User.deleteMany({});
    await Pin.deleteMany({});
    await Board.deleteMany({});

    const password = await bcrypt.hash('password123', 10);

    const users = await User.insertMany([
      { username: 'john', email: 'john@example.com', password, bio: 'I love photography' },
      { username: 'sarah', email: 'sarah@example.com', password, bio: 'Art enthusiast' },
      { username: 'mike', email: 'mike@example.com', password, bio: 'Travel blogger' },
    ]);

    const pins = await Pin.insertMany([
      {
        title: 'Beautiful Sunset',
        description: 'Captured this amazing sunset at the beach',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        category: 'Photography',
        tags: ['sunset', 'beach', 'nature'],
        user: users[0]._id,
      },
      {
        title: 'Modern Architecture',
        description: 'Contemporary building design in downtown',
        imageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
        category: 'Architecture',
        tags: ['architecture', 'design', 'urban'],
        user: users[1]._id,
      },
      {
        title: 'Mountain Adventure',
        description: 'Hiking in the Swiss Alps',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
        category: 'Travel',
        tags: ['mountains', 'hiking', 'travel'],
        user: users[2]._id,
      },
    ]);

    await Board.insertMany([
      {
        title: 'Travel Inspiration',
        description: 'Places I want to visit',
        user: users[0]._id,
        pins: [pins[2]._id],
      },
      {
        title: 'Architecture & Design',
        description: 'Beautiful buildings and spaces',
        user: users[1]._id,
        pins: [pins[1]._id],
      },
      {
        title: 'Nature Photography',
        description: 'Stunning natural landscapes',
        user: users[2]._id,
        pins: [pins[0]._id],
      },
    ]);

    res.json({
      message: 'Database seeded successfully',
      counts: { users: users.length, pins: pins.length, boards: 3 },
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Seed failed', error: error.message });
  }
});

module.exports = router;
