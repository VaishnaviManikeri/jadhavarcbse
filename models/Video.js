const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  videoType: {
    type: String,
    enum: ['upload', 'youtube', 'vimeo', 'other'],
    default: 'upload'
  },
  category: {
    type: String,
    enum: ['academic', 'sports', 'cultural', 'events', 'general'],
    default: 'general'
  },
  duration: {
    type: String,
    default: ''
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add index for better query performance
videoSchema.index({ title: 'text' });
videoSchema.index({ category: 1 });
videoSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model('Video', videoSchema);