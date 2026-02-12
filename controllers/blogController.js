const Blog = require("../models/Blog");

/* CREATE */

exports.createBlog = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }

    let image = "";

    if (req.file) {
      // Convert buffer to base64
      image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const blog = await Blog.create({
      title,
      description,
      image
    });

    return res.status(201).json(blog);

  } catch (err) {
    console.error("BLOG CREATE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* GET */

exports.getBlogs = async (req,res)=>{
  const blogs = await Blog.find().sort({createdAt:-1});
  res.json(blogs);
};

/* UPDATE */

exports.updateBlog = async (req,res)=>{
  const update={
    title:req.body.title,
    description:req.body.description
  };

  if(req.file){
    update.image=`data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  }

  const blog=await Blog.findByIdAndUpdate(req.params.id,update,{new:true});
  res.json(blog);
};

/* DELETE */

exports.deleteBlog = async(req,res)=>{
  await Blog.findByIdAndDelete(req.params.id);
  res.json({message:"Deleted"});
};
