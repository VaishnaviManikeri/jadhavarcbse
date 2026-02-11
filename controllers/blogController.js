const Blog = require("../models/Blog");

/* ================= CREATE ================= */

exports.createBlog = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    // Handle image from file upload or URL
    let imageUrl = "";
    if (req.file) {
      // If file was uploaded via multer
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      // If image URL was provided
      imageUrl = req.body.image;
    }

    const blog = new Blog({
      title,
      description,
      image: imageUrl,
    });

    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);

  } catch (error) {
    console.error("Create Blog Error:", error);
    res.status(500).json({ message: "Server error while creating blog" });
  }
};

/* ================= GET ALL ================= */

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error("Get Blogs Error:", error);
    res.status(500).json({ message: "Server error while fetching blogs" });
  }
};

/* ================= GET SINGLE BLOG ================= */

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch (error) {
    console.error("Get Blog Error:", error);
    res.status(500).json({ message: "Server error while fetching blog" });
  }
};

/* ================= UPDATE ================= */

exports.updateBlog = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Handle image update
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update Blog Error:", error);
    res.status(500).json({ message: "Server error while updating blog" });
  }
};

/* ================= DELETE ================= */

exports.deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({ message: "Server error while deleting blog" });
  }
};