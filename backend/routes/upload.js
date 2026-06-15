const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { writeLimiter } = require('../middleware/rateLimiter');

// POST /api/upload — upload image to Cloudinary (authenticated)
// PUBLIC — rate limited at write tier, auth required
router.post('/', writeLimiter, authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'pinterest-clone',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, uploaded) => {
          if (error) reject(error);
          else resolve(uploaded);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

module.exports = router;
