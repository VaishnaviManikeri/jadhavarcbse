const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const controller = require("../controllers/blogController");

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ storage });

// Single blog routes
router.get("/", controller.getBlogs);
router.post("/", upload.single("image"), controller.createBlog);
router.put("/:id", upload.single("image"), controller.updateBlog);
router.delete("/:id", controller.deleteBlog);

// Bulk operations
router.post("/bulk", upload.any(), controller.bulkCreateBlogs);
router.post("/bulk-delete", controller.bulkDeleteBlogs);

module.exports = router;