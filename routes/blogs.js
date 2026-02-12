const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const controller = require("../controllers/blogController");

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get("/", controller.getBlogs);
router.post("/", upload.single("image"), controller.createBlog);
router.put("/:id", upload.single("image"), controller.updateBlog);
router.delete("/:id", controller.deleteBlog);

module.exports = router;
