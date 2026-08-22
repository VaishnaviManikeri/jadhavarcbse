const express = require("express");
const router = express.Router();

const upload = require("../middleware/videoUpload");
const authMiddleware = require("../middleware/auth");
const {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
} = require("../controllers/videoController");

/* Public routes */
router.get("/", getVideos);
router.get("/:id", getVideoById);

/* Protected admin routes (require Bearer token) */
router.post("/", authMiddleware, upload.single("video"), createVideo);
router.put("/:id", authMiddleware, upload.single("video"), updateVideo);
router.delete("/:id", authMiddleware, deleteVideo);

module.exports = router;