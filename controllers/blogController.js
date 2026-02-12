const Blog = require("../models/Blog");

/* ================= CREATE BLOG ================= */

exports.createBlog = async (req, res) => {
  try {
    console.log("CREATE BODY:", req.body);
    console.log("CREATE FILE:", req.file);
    console.log("CREATE HEADERS:", req.headers['content-type']);

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }

    let image = "";

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
      console.log("Image saved at:", image);
    } else {
      console.log("No image file uploaded");
    }

    const blog = await Blog.create({
      title,
      description,
      image
    });

    console.log("BLOG CREATED:", blog._id);
    res.status(201).json(blog);

  } catch (err) {
    console.error("CREATE BLOG ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET BLOGS ================= */

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    console.log("BLOGS FETCHED:", blogs.length);
    res.json(blogs);
  } catch (err) {
    console.error("GET BLOG ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */

exports.updateBlog = async (req, res) => {
  try {
    console.log("UPDATE BODY:", req.body);
    console.log("UPDATE FILE:", req.file);
    
    const update = {
      title: req.body.title,
      description: req.body.description
    };

    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    console.log("BLOG UPDATED:", blog?._id);
    res.json(blog);

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE ================= */

exports.deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    console.log("BLOG DELETED:", req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};