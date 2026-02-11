const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = 'uploads/blogs';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get all published blogs (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const blogs = await Blog.find({ isPublished: true })
      .select('-content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Blog.countDocuments({ isPublished: true });
    
    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Increment view count
    blog.views += 1;
    await blog.save();
    
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get blogs by category (public)
router.get('/category/:category', async (req, res) => {
  try {
    const blogs = await Blog.find({ 
      category: req.params.category,
      isPublished: true 
    }).select('-content').sort({ createdAt: -1 });
    
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- ADMIN ROUTES (Require authentication) ---

// Get all blogs (admin - includes unpublished)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new blog (admin)
router.post('/', authMiddleware, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, isPublished } = req.body;
    
    let featuredImage = '';
    if (req.file) {
      featuredImage = `/uploads/blogs/${req.file.filename}`;
    }
    
    const blog = new Blog({
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      category: category || 'General',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublished: isPublished === 'true' || isPublished === true,
      featuredImage,
      readTime: Math.ceil(content.split(' ').length / 200) // 200 words per minute
    });
    
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update blog (admin)
router.put('/:id', authMiddleware, upload.single('featuredImage'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    const { title, content, excerpt, category, tags, isPublished } = req.body;
    
    // Update fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (category) blog.category = category;
    if (tags) blog.tags = tags.split(',').map(tag => tag.trim());
    if (isPublished !== undefined) blog.isPublished = isPublished === 'true' || isPublished === true;
    
    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (blog.featuredImage) {
        const oldImagePath = path.join(__dirname, '..', blog.featuredImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      blog.featuredImage = `/uploads/blogs/${req.file.filename}`;
    }
    
    blog.readTime = Math.ceil(blog.content.split(' ').length / 200);
    
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete blog (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Delete associated image
    if (blog.featuredImage) {
      const imagePath = path.join(__dirname, '..', blog.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;