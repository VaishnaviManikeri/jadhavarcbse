const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Gallery = require('../models/Gallery');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/* ---------------- CLOUDINARY CONFIG ---------------- */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

/* ---------------- MULTER (MEMORY STORAGE) ---------------- */
const upload = multer({ storage: multer.memoryStorage() });

/* ---------------- GET ALL GALLERY ---------------- */
router.get('/', async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------------- PROTECTED ROUTES ---------------- */
router.use(authMiddleware);

/* ---------------- CREATE GALLERY ---------------- */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image required' });
    }

    const uploadResult = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      { folder: "gallery" }
    );

    const galleryItem = new Gallery({
      title,
      description,
      category,
      imageUrl: uploadResult.secure_url
    });

    await galleryItem.save();
    res.status(201).json(galleryItem);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------------- UPDATE GALLERY ---------------- */
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const updateData = { title, description, category };

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: "gallery" }
      );
      updateData.imageUrl = uploadResult.secure_url;
    }

    const galleryItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!galleryItem) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    res.json(galleryItem);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------------- DELETE GALLERY ---------------- */
router.delete('/:id', async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    // Extract Cloudinary public_id
    const publicId = galleryItem.imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`gallery/${publicId}`);

    await galleryItem.deleteOne();
    res.json({ message: 'Gallery item deleted successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
