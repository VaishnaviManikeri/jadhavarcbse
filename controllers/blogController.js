const Blog = require("../models/Blog");
const fs = require("fs");
const path = require("path");

/* ================= CREATE BLOG ================= */

exports.createBlog = async (req, res) => {
  try {
    console.log("========== CREATE BLOG REQUEST ==========");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Request headers:", req.headers['content-type']);

    const { title, description } = req.body;

    if (!title || !description) {
      console.log("Missing title or description");
      return res.status(400).json({ message: "Title and description required" });
    }

    let image = "";

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
      console.log("Image saved at:", image);
      console.log("File details:", {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
      });
    } else {
      console.log("No image file uploaded");
    }

    const blog = await Blog.create({
      title: title.trim(),
      description: description.trim(),
      image
    });

    console.log("✅ BLOG CREATED:", blog._id);
    console.log("================================");

    res.status(201).json(blog);

  } catch (err) {
    console.error("❌ CREATE BLOG ERROR:", err);
    console.error("Error stack:", err.stack);
    
    // If there was an error and a file was uploaded, delete it
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
        console.log("Deleted uploaded file due to error");
      } catch (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    }
    
    res.status(500).json({ 
      message: err.message || "Failed to create blog",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

/* ================= GET BLOGS ================= */

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    console.log("📚 BLOGS FETCHED:", blogs.length);
    res.json(blogs);
  } catch (err) {
    console.error("❌ GET BLOG ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */

exports.updateBlog = async (req, res) => {
  try {
    console.log("========== UPDATE BLOG REQUEST ==========");
    console.log("Blog ID:", req.params.id);
    console.log("Update body:", req.body);
    console.log("Update file:", req.file);
    
    const update = {
      title: req.body.title,
      description: req.body.description
    };

    // If there's a new image, delete the old one
    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
      
      // Get the old blog to delete its image
      const oldBlog = await Blog.findById(req.params.id);
      if (oldBlog && oldBlog.image) {
        const oldImagePath = path.join(__dirname, "..", oldBlog.image);
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("Old image deleted:", oldBlog.image);
          }
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("✅ BLOG UPDATED:", blog._id);
    console.log("================================");
    
    res.json(blog);

  } catch (err) {
    console.error("❌ UPDATE ERROR:", err);
    
    // Delete uploaded file if there was an error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
        console.log("Deleted uploaded file due to error");
      } catch (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    }
    
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE ================= */

exports.deleteBlog = async (req, res) => {
  try {
    console.log("========== DELETE BLOG REQUEST ==========");
    console.log("Blog ID:", req.params.id);
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    // Delete the associated image file
    if (blog.image) {
      const imagePath = path.join(__dirname, "..", blog.image);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log("Image deleted:", blog.image);
        }
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }
    
    await Blog.findByIdAndDelete(req.params.id);
    console.log("✅ BLOG DELETED:", req.params.id);
    console.log("================================");
    
    res.json({ message: "Blog deleted successfully" });
    
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};