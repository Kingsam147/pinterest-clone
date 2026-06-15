const multer = require('multer');

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const fileFilter = (req, file, callback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
