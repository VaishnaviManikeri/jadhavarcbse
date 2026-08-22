const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    author: { type: String, default: "Jadhavar International School" },
    metaTitle: String,
    metaDescription: String,
    imageAlt: String,
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
