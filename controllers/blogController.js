const Blog = require("../models/Blog");

/* CREATE BLOG */

exports.createBlog = async (req, res) => {
  try {
    const { title, description } = req.body;

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!title || !description) {
      return res.status(400).json({ message: "Missing fields" });
    }

    let image = "";

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.create({
      title,
      description,
      image
    });

    res.status(201).json(blog);

  } catch (err) {
    console.error("BLOG CREATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* GET ALL BLOGS */

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE */

exports.updateBlog = async (req, res) => {
  try {
    const update = {
      title: req.body.title,
      description: req.body.description
    };

    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, update, {
      new: true
    });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE */

exports.deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
