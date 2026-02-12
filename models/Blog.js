const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    default: 'Admin'
  },
  category: {
    type: String,
    required: true,
    enum: ['News', 'Updates', 'Events', 'Projects', 'Other'],
    default: 'Other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  coverImage: {
    type: String,
    default: null
  },
  readTime: {
    type: Number,
    default: 5
  },
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// Create slug from title before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Set publishedAt when published becomes true
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Blog', blogSchema);