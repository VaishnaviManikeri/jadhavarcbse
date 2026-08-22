const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // "url"    -> external link (YouTube / Vimeo / direct mp4 link etc.)
    // "upload" -> file uploaded to our own /uploads/videos folder
    videoType: {
      type: String,
      enum: ["url", "upload"],
      required: true,
    },
    videoUrl: {
      type: String, // used when videoType === "url"
      default: "",
    },
    videoFile: {
      type: String, // e.g. "/uploads/videos/video-12345.mp4", used when videoType === "upload"
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);