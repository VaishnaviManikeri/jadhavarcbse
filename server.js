const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

// IMPORTANT: Create uploads directory with absolute path BEFORE starting the server
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Uploads directory created at:", uploadsDir);
} else {
  console.log("✅ Uploads directory already exists at:", uploadsDir);
}

// Set proper permissions for uploads directory
try {
  fs.chmodSync(uploadsDir, 0o755);
  console.log("✅ Uploads directory permissions set");
} catch (err) {
  console.error("❌ Failed to set permissions:", err);
}

/* =========================
   CORS CONFIGURATION
========================= */

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "https://jadhavarcbse.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with correct path
app.use("/uploads", express.static(uploadsDir));

/* =========================
   ROOT ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("🚀 Backend running successfully");
});

/* =========================
   DATABASE
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* =========================
   ROUTES
========================= */

app.use("/api/auth", require("./routes/auth"));
app.use("/api/gallery", require("./routes/gallery"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/careers", require("./routes/careers"));
app.use("/api/blogs", require("./routes/blogs"));

/* =========================
   ERROR HANDLING
========================= */

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: "File too large. Max size: 5MB" });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: "Unexpected file field" });
  }
  
  res.status(500).json({ 
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});