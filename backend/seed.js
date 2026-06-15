const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');
const User = require('./models/User');
const Pin = require('./models/Pin');
const Board = require('./models/Board');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Pin.deleteMany({});
    await Board.deleteMany({});

    // Create test users
    const password = await bcrypt.hash('password123', 10);
    const users = await User.insertMany([
      {
        username: 'john',
        email: 'john@example.com',
        password,
        bio: 'I love photography',
      },
      {
        username: 'sarah',
        email: 'sarah@example.com',
        password,
        bio: 'Art enthusiast',
      },
      {
        username: 'mike',
        email: 'mike@example.com',
        password,
        bio: 'Travel blogger',
      },
    ]);

    // Create test pins
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

    // Create test boards
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

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 