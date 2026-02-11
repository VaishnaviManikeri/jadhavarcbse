const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const controller = require("../controllers/blogController");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "blog-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Routes
router.get("/", controller.getBlogs);
router.get("/:id", controller.getBlogById);
router.post("/", (req, res, next) => {
  upload.single("image")(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    } else if (err) {
      console.error("Unknown error:", err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, controller.createBlog);

router.put("/:id", (req, res, next) => {
  upload.single("image")(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    } else if (err) {
      console.error("Unknown error:", err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, controller.updateBlog);

router.delete("/:id", controller.deleteBlog);

module.exports = router;