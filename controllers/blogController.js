const Blog = require("../models/Blog");

/* CREATE */

exports.createBlog = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const blog = new Blog({
      title,
      description,
      image,
    });

    await blog.save();

    console.log("CREATED:", blog._id);

    return res.status(201).json(blog);

  } catch (err) {
    console.error("CREATE BLOG ERROR FULL:", err);
    console.error("MESSAGE:", err.message);
    console.error("STACK:", err.stack);

    return res.status(500).json({
      message: err.message,
      stack: err.stack
    });
  }
};

/* GET */

exports.getBlogs = async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
};

/* UPDATE */

exports.updateBlog = async (req, res) => {
  const update = {
    title: req.body.title,
    description: req.body.description
  };

  if (req.file) update.image = `/uploads/${req.file.filename}`;

  const blog = await Blog.findByIdAndUpdate(req.params.id, update, { new: true });

  res.json(blog);
};

/* DELETE */

exports.deleteBlog = async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
