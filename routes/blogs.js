const router = require("express").Router();
const multer = require("multer");
const controller = require("../controllers/blogController");

// MEMORY STORAGE (IMPORTANT)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get("/", controller.getBlogs);
router.post("/", upload.single("image"), controller.createBlog);
router.put("/:id", upload.single("image"), controller.updateBlog);
router.delete("/:id", controller.deleteBlog);

module.exports = router;
