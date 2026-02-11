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

    const blog = new Blog({
      title,
      description,
      image: req.body.image || "",
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

/* ================= UPDATE ================= */

exports.updateBlog = async (req, res) => {
  try {
    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
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
