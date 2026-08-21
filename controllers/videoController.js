const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

// Get all videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isActive: true })
      .sort({ order: 1, uploadedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
      error: error.message
    });
  }
};

// Get single video
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Increment view count
    video.views += 1;
    await video.save();

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video',
      error: error.message
    });
  }
};

// Create video
exports.createVideo = async (req, res) => {
  try {
    const { title, description, videoUrl, videoType, category, duration, order } = req.body;
    
    // Check if video with same title exists
    const existingVideo = await Video.findOne({ title });
    if (existingVideo) {
      return res.status(400).json({
        success: false,
        message: 'Video with this title already exists'
      });
    }

    // Handle video upload
    let videoPath = videoUrl;
    let thumbnailPath = '';

    if (req.file) {
      // If video file is uploaded
      const videoFile = req.file;
      const ext = path.extname(videoFile.originalname);
      const filename = `${Date.now()}${ext}`;
      const uploadPath = path.join(__dirname, '../uploads/videos', filename);
      
      // Ensure directory exists
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(uploadPath, videoFile.buffer);
      videoPath = `/uploads/videos/${filename}`;
    } else if (videoUrl) {
      // If URL is provided, validate it
      try {
        new URL(videoUrl);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid video URL'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either video file or video URL is required'
      });
    }

    const video = new Video({
      title,
      description,
      videoUrl: videoPath,
      thumbnail: thumbnailPath,
      videoType: videoType || (req.file ? 'upload' : 'other'),
      category: category || 'general',
      duration: duration || '',
      order: order || 0
    });

    await video.save();

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video
    });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating video',
      error: error.message
    });
  }
};

// Update video
exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const { title, description, videoUrl, videoType, category, duration, isActive, order } = req.body;

    // Handle video file update
    let updatedVideoUrl = video.videoUrl;
    if (req.file) {
      const videoFile = req.file;
      const ext = path.extname(videoFile.originalname);
      const filename = `${Date.now()}${ext}`;
      const uploadPath = path.join(__dirname, '../uploads/videos', filename);
      
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(uploadPath, videoFile.buffer);
      
      // Delete old video file if it was uploaded
      if (video.videoType === 'upload' && video.videoUrl && video.videoUrl.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', video.videoUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      updatedVideoUrl = `/uploads/videos/${filename}`;
    } else if (videoUrl) {
      updatedVideoUrl = videoUrl;
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.videoUrl = updatedVideoUrl;
    video.videoType = videoType || video.videoType;
    video.category = category || video.category;
    video.duration = duration || video.duration;
    video.isActive = isActive !== undefined ? isActive : video.isActive;
    video.order = order !== undefined ? order : video.order;

    await video.save();

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video',
      error: error.message
    });
  }
};

// Delete video
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Delete video file if it was uploaded
    if (video.videoType === 'upload' && video.videoUrl && video.videoUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', video.videoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Video file deleted:', filePath);
      }
    }

    await video.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video',
      error: error.message
    });
  }
};

// Bulk delete videos
exports.bulkDeleteVideos = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No video IDs provided'
      });
    }

    // Delete video files
    const videos = await Video.find({ _id: { $in: ids } });
    videos.forEach(video => {
      if (video.videoType === 'upload' && video.videoUrl && video.videoUrl.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', video.videoUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    await Video.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${ids.length} videos deleted successfully`
    });
  } catch (error) {
    console.error('Error bulk deleting videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk deleting videos',
      error: error.message
    });
  }
};

// Get videos by category
exports.getVideosByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const videos = await Video.find({ category, isActive: true })
      .sort({ order: 1, uploadedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching videos by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos by category',
      error: error.message
    });
  }
};

// Search videos
exports.searchVideos = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const videos = await Video.find({
      $text: { $search: q },
      isActive: true
    }).sort({ score: { $meta: 'textScore' } });

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching videos',
      error: error.message
    });
  }
};

// Update video order (for drag and drop)
exports.updateVideoOrder = async (req, res) => {
  try {
    const { videos } = req.body;
    
    if (!Array.isArray(videos)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format'
      });
    }

    const bulkOps = videos.map((video, index) => ({
      updateOne: {
        filter: { _id: video.id },
        update: { order: index }
      }
    }));

    await Video.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Video order updated successfully'
    });
  } catch (error) {
    console.error('Error updating video order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video order',
      error: error.message
    });
  }
};