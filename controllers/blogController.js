const Blog = require("../models/Blog");

/* ================= CREATE ================= */

exports.createBlog = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    // Handle image from file upload
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      console.log("Image saved at:", imageUrl);
    }

    const blog = new Blog({
      title,
      description,
      image: imageUrl,
    });

    const savedBlog = await blog.save();
    console.log("Blog saved successfully:", savedBlog._id);
    
    res.status(201).json(savedBlog);

  } catch (error) {
    console.error("Create Blog Error:", error);
    res.status(500).json({ 
      message: "Server error while creating blog",
      error: error.message 
    });
  }
};

/* ================= GET ALL ================= */

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error("Get Blogs Error:", error);
    res.status(500).json({ 
      message: "Server error while fetching blogs",
      error: error.message 
    });
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
    res.status(500).json({ 
      message: "Server error while fetching blog",
      error: error.message 
    });
  }
};

/* ================= UPDATE ================= */

exports.updateBlog = async (req, res) => {
  try {
    console.log("Update request body:", req.body);
    console.log("Update request file:", req.file);

    const updateData = {
      title: req.body.title,
      description: req.body.description
    };
    
    // Handle image update
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("Blog updated successfully:", updated._id);
    res.json(updated);
  } catch (error) {
    console.error("Update Blog Error:", error);
    res.status(500).json({ 
      message: "Server error while updating blog",
      error: error.message 
    });
  }
};

/* ================= DELETE ================= */

exports.deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("Blog deleted successfully:", req.params.id);
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({ 
      message: "Server error while deleting blog",
      error: error.message 
    });
  }
};