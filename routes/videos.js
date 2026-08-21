const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/auth');

// Configure multer for video uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: fileFilter
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Public routes
router.get('/', videoController.getAllVideos);
router.get('/search', videoController.searchVideos);
router.get('/category/:category', videoController.getVideosByCategory);
router.get('/:id', videoController.getVideoById);

// Protected routes (require authentication)
router.post('/', authMiddleware, upload.single('videoFile'), videoController.createVideo);
router.put('/:id', authMiddleware, upload.single('videoFile'), videoController.updateVideo);
router.delete('/:id', authMiddleware, videoController.deleteVideo);
router.post('/bulk-delete', authMiddleware, videoController.bulkDeleteVideos);
router.put('/order/update', authMiddleware, videoController.updateVideoOrder);

module.exports = router;