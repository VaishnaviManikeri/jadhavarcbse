const Blog = require("../models/Blog");

/* CREATE BLOG */

exports.createBlog = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title & Description required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const blog = new Blog({
      title,
      description,
      image
    });

    await blog.save();

    return res.status(201).json(blog);

  } catch (err) {
    console.error("CREATE BLOG:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* GET BLOGS */

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.json(blogs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* UPDATE */

exports.updateBlog = async (req, res) => {
  try {
    const update = {
      title: req.body.title,
      description: req.body.description,
    };

    if (req.file) update.image = `/uploads/${req.file.filename}`;

    const blog = await Blog.findByIdAndUpdate(req.params.id, update, { new: true });

    return res.json(blog);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* DELETE */

exports.deleteBlog = async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  return res.json({ message: "Deleted" });
};
