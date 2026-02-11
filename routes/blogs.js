const router = require("express").Router();
const controller = require("../controllers/blogController");

router.get("/", controller.getBlogs);
router.post("/", controller.createBlog);
router.put("/:id", controller.updateBlog);
router.delete("/:id", controller.deleteBlog);

module.exports = router;
