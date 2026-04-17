const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

/* =========================
   CREATE UPLOADS DIRECTORY
========================= */

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Uploads directory created at:", uploadsDir);
}

/* =========================
   CORS CONFIGURATION
========================= */

const allowedOrigins = [
  "https://jadhavarcbse.com",
  "https://www.jadhavarcbse.com",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed by this server"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC FILES
========================= */

app.use("/uploads", express.static(uploadsDir));

/* =========================
   ROOT ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("🚀 Backend running successfully on port 5012");
});

/* =========================
   HEALTH CHECK API (FOR HOSTINGER)
========================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Backend is running perfectly 🚀",
    serverTime: new Date(),
  });
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

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.stack : {},
  });
});

/* =========================
   SERVER
========================= */

const PORT = 5012; // ✅ UPDATED PORT

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});
