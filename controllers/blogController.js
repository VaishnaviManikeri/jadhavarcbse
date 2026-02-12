const Blog = require("../models/Blog");

/* ================= CREATE BLOG ================= */
exports.createBlog = async (req, res) => {
  try {
    console.log("CREATE BODY:", req.body);
    console.log("CREATE FILE:", req.file);

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
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

    console.log("BLOG CREATED:", blog._id);

    res.status(201).json(blog);

  } catch (err) {
    console.error("CREATE BLOG ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= BULK CREATE BLOGS ================= */
exports.bulkCreateBlogs = async (req, res) => {
  try {
    console.log("BULK CREATE BODY:", req.body);
    console.log("BULK CREATE FILES:", req.files);

    const { blogs } = req.body;
    
    if (!blogs || !Array.isArray(JSON.parse(blogs))) {
      return res.status(400).json({ message: "Invalid blogs data format" });
    }

    const parsedBlogs = JSON.parse(blogs);
    const createdBlogs = [];

    // Process each blog
    for (let i = 0; i < parsedBlogs.length; i++) {
      const blogData = parsedBlogs[i];
      const { title, description, imageIndex } = blogData;
      
      if (!title || !description) {
        console.log(`Skipping blog ${i}: Missing title or description`);
        continue;
      }

      let image = "";

      // Check if there's an image for this blog
      if (req.files && req.files[imageIndex]) {
        image = `/uploads/${req.files[imageIndex][0].filename}`;
      }

      const blog = await Blog.create({
        title,
        description,
        image
      });

      createdBlogs.push(blog);
      console.log(`BLOG CREATED ${i}:`, blog._id);
    }

    console.log(`TOTAL BLOGS CREATED: ${createdBlogs.length}`);

    res.status(201).json({
      message: `Successfully created ${createdBlogs.length} blogs`,
      blogs: createdBlogs
    });

  } catch (err) {
    console.error("BULK CREATE BLOG ERROR:", err);
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
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= BULK DELETE BLOGS ================= */
exports.bulkDeleteBlogs = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid blog IDs format" });
    }

    const result = await Blog.deleteMany({ _id: { $in: ids } });
    
    res.json({ 
      message: `Successfully deleted ${result.deletedCount} blogs`,
      deletedCount: result.deletedCount 
    });

  } catch (err) {
    console.error("BULK DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};