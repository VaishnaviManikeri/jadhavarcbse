const fs = require("fs");
const path = require("path");
const Video = require("../models/Video");

// Helper to safely delete an uploaded video file from disk
const deleteFileIfExists = (relativePath) => {
  if (!relativePath) return;
  const absolutePath = path.join(__dirname, "..", relativePath.replace(/^\//, ""));
  fs.access(absolutePath, fs.constants.F_OK, (err) => {
    if (!err) {
      fs.unlink(absolutePath, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting video file:", unlinkErr);
      });
    }
  });
};

// @desc   Get all videos
// @route  GET /api/videos
// @access Public
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    console.error("Get videos error:", error);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
};

// @desc   Get single video
// @route  GET /api/videos/:id
// @access Public
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.status(200).json(video);
  } catch (error) {
    console.error("Get video error:", error);
    res.status(500).json({ message: "Failed to fetch video" });
  }
};

// @desc   Create a video (via URL or file upload)
// @route  POST /api/videos
// @access Private (admin)
exports.createVideo = async (req, res) => {
  try {
    const { title, description, videoType, videoUrl } = req.body;

    if (!title || !videoType) {
      return res.status(400).json({ message: "Title and videoType are required" });
    }

    if (!["url", "upload"].includes(videoType)) {
      return res.status(400).json({ message: "videoType must be 'url' or 'upload'" });
    }

    if (videoType === "url" && !videoUrl) {
      return res.status(400).json({ message: "videoUrl is required when videoType is 'url'" });
    }

    if (videoType === "upload" && !req.file) {
      return res.status(400).json({ message: "A video file is required when videoType is 'upload'" });
    }

    const newVideo = new Video({
      title,
      description: description || "",
      videoType,
      videoUrl: videoType === "url" ? videoUrl : "",
      videoFile: videoType === "upload" ? `/uploads/videos/${req.file.filename}` : "",
    });

    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (error) {
    if (req.file?.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== "ENOENT") {
          console.error("Error cleaning up failed video upload:", unlinkErr);
        }
      });
    }
    console.error("Create video error:", error);
    res.status(500).json({ message: "Failed to create video" });
  }
};

// @desc   Update a video
// @route  PUT /api/videos/:id
// @access Private (admin)
exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const { title, description, videoType, videoUrl } = req.body;

    if (videoType !== undefined && !["url", "upload"].includes(videoType)) {
      return res.status(400).json({ message: "videoType must be 'url' or 'upload'" });
    }

    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;

    if (videoType === "url") {
      // switching to / staying on URL type -> drop any old uploaded file
      if (video.videoFile) deleteFileIfExists(video.videoFile);
      video.videoFile = "";
      video.videoUrl = videoUrl !== undefined ? videoUrl : video.videoUrl;
      video.videoType = "url";
    } else if (videoType === "upload" || req.file) {
      // switching to / staying on upload type
      if (req.file) {
        if (video.videoFile) deleteFileIfExists(video.videoFile);
        video.videoFile = `/uploads/videos/${req.file.filename}`;
        video.videoUrl = "";
      }
      video.videoType = "upload";
    }

    await video.save();
    res.status(200).json(video);
  } catch (error) {
    console.error("Update video error:", error);
    res.status(500).json({ message: "Failed to update video" });
  }
};

// @desc   Delete a video
// @route  DELETE /api/videos/:id
// @access Private (admin)
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.videoFile) deleteFileIfExists(video.videoFile);

    await video.deleteOne();
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({ message: "Failed to delete video" });
  }
};
