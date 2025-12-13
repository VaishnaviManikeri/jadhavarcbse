const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const admin = new User({
      username: "admin",      // CHANGE USERNAME IF YOU WANT
      password: "admin123",   // CHANGE PASSWORD IF YOU WANT
      role: "admin"
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log("👤 Username:", admin.username);
    console.log("🔑 Password: admin123");
    process.exit();
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
