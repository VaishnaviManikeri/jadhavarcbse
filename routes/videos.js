const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos' });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Error fetching video' });
  }
});

// Create video (with upload)
router.post('/', auth, upload.single('video'), async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, duration } = req.body;
    
    let videoData = {
      title,
      description,
      duration,
      thumbnailUrl,
      isActive: true
    };

    // If file was uploaded, use the file path
    if (req.file) {
      videoData.videoUrl = `/uploads/videos/${req.file.filename}`;
      videoData.videoType = 'upload';
    } else if (videoUrl) {
      // If URL was provided, use it
      videoData.videoUrl = videoUrl;
      videoData.videoType = 'url';
    } else {
      return res.status(400).json({ message: 'Either video file or URL is required' });
    }

    const video = new Video(videoData);
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ message: 'Error creating video' });
  }
});

// Update video
router.put('/:id', auth, upload.single('video'), async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, duration, isActive } = req.body;
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Update fields
    video.title = title || video.title;
    video.description = description !== undefined ? description : video.description;
    video.duration = duration || video.duration;
    video.thumbnailUrl = thumbnailUrl || video.thumbnailUrl;
    
    if (isActive !== undefined) {
      video.isActive = isActive;
    }

    // Handle video update
    if (req.file) {
      // Delete old video file if it exists
      if (video.videoType === 'upload' && video.videoUrl) {
        const oldPath = path.join(__dirname, '..', video.videoUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      video.videoUrl = `/uploads/videos/${req.file.filename}`;
      video.videoType = 'upload';
    } else if (videoUrl) {
      // If video was uploaded via URL
      if (video.videoType === 'upload' && video.videoUrl) {
        const oldPath = path.join(__dirname, '..', video.videoUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      video.videoUrl = videoUrl;
      video.videoType = 'url';
    }

    await video.save();
    res.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Error updating video' });
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete video file if it was uploaded
    if (video.videoType === 'upload' && video.videoUrl) {
      const filePath = path.join(__dirname, '..', video.videoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await video.deleteOne();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Error deleting video' });
  }
});

module.exports = router;
