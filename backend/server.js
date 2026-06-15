require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const analyticsMiddleware = require('./middleware/analytics');

const authRoutes = require('./routes/auth');
const pinsRoutes = require('./routes/pins');
const boardsRoutes = require('./routes/boards');
const commentsRoutes = require('./routes/comments');
const usersRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');

const app = express();

const ALLOWED_ORIGINS = [
  'https://frontend-ebon-phi-50.vercel.app',
  'https://frontend-samueldarius1470-8728s-projects.vercel.app',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(analyticsMiddleware);

mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/pins', pinsRoutes);
app.use('/api/boards', boardsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/upload', uploadRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

if (!process.env.VERCEL) {
  const PORT = config.PORT;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
