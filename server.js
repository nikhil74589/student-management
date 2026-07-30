const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

// Load env file dynamically
dotenv.config({
  path: process.env.ENV_FILE || ".env",
});

const app = express();

// =======================
// Middlewares
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve Static Frontend Files from public/
app.use(express.static(path.join(__dirname, "public")));

// =======================
// Environment Variables
// =======================
const PORT = process.env.PORT || 3001;
const ENV = process.env.ENVIRONMENT || process.env.NODE_ENV || "dev";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/studentDB";

// =======================
// MongoDB Connection
// =======================
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`✅ MongoDB Connected | ENV: ${ENV}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// =======================
// Student Schema (Strict Mode OFF)
// =======================
const studentSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "N/A" },
    fatherName: { type: String, default: "N/A" },
    degree: { type: String, default: "N/A" },
    mobile: { type: String, default: "N/A" },
    email: { type: String, default: "N/A" },
    address: { type: String, default: "N/A" },
    background: { type: String, default: "N/A" },
    membership: { type: String, default: "Basic (Free)" },
    freeBook: { type: String, default: "None" },

    // Legacy fields fallback
    name: { type: String },
    city: { type: String },
  },
  {
    timestamps: true,
    strict: false, // Prevents 400 Path required validation errors
  }
);

// Changed Model Name to bypass old DB strict indexes
const Student = mongoose.model("StudentPortalV2", studentSchema);

// =======================
// API Routes
// =======================

// GET All Students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// CREATE Student
app.post("/api/students", async (req, res) => {
  try {
    const payload = req.body || {};

    // Legacy Fallbacks
    payload.name = payload.fullName || payload.name || "N/A";
    payload.city = payload.address || payload.city || "N/A";

    const student = new Student(payload);
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    console.error("Save Error:", err);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE Student
app.put("/api/students/:id", async (req, res) => {
  try {
    const payload = req.body || {};
    if (payload.fullName) payload.name = payload.fullName;
    if (payload.address) payload.city = payload.address;

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: false }
    );
    res.status(200).json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE Student
app.delete("/api/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// Serve Frontend Index.html
// =======================
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
