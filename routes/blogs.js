const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const controller = require("../controllers/blogController");

/* ABSOLUTE UPLOAD PATH */
const uploadDir = path.join(__dirname, "../uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Blogs route created uploads directory:", uploadDir);
}

/* STORAGE CONFIGURATION - FIXED */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Clean filename and add timestamp
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${Date.now()}-${cleanName}`;
    cb(null, filename);
  }
});

/* FILE FILTER - Only allow images */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/* ROUTES */
router.get("/", controller.getBlogs);
router.post("/", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ 
        message: err.message,
        error: err.toString()
      });
    }
    next();
  });
}, controller.createBlog);

router.put("/:id", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ 
        message: err.message,
        error: err.toString()
      });
    }
    next();
  });
}, controller.updateBlog);

router.delete("/:id", controller.deleteBlog);

module.exports = router;