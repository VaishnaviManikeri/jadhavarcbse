const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const controller = require("../controllers/blogController");

/* ABSOLUTE UPLOAD PATH */

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* STORAGE */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get("/", controller.getBlogs);
router.post("/", upload.single("image"), controller.createBlog);
router.put("/:id", upload.single("image"), controller.updateBlog);
router.delete("/:id", controller.deleteBlog);

module.exports = router;
