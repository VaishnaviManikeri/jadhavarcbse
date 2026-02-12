const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
