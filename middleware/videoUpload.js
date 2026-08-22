const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Videos are stored inside backend/uploads/videos
// (backend/uploads is already served statically at /uploads in server.js)
const videosDir = path.join(__dirname, "..", "uploads", "videos");
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
  console.log("✅ Videos uploads directory created at:", videosDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  },
});

// Accept any video mimetype (mp4, webm, mov, mkv, avi, etc.)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed"), false);
  }
};

// NOTE: no `limits.fileSize` is set on purpose -> allows videos of any size.
// (Large uploads are also gated by your reverse proxy / nginx client_max_body_size,
// see the note about that separately.)
const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;