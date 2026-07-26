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
app.use(express.static(path.join(__dirname, "public")));

// =======================
// Environment Variables
// =======================
const PORT = process.env.PORT || 3001;
const ENV = process.env.ENVIRONMENT || process.env.NODE_ENV || "dev";
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found.");
  process.exit(1);
}

// =======================
// MongoDB Connection
// =======================
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("====================================");
    console.log("🚀 Student Management System Started");
    console.log(`🌍 Environment : ${ENV}`);
    console.log(`🌐 URL : http://0.0.0.0:${PORT}`);
    console.log("====================================");
    console.log("✅ MongoDB Connected");
    console.log(`📦 Database : ${MONGO_URI}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error");
    console.error(err);
    process.exit(1);
  });

// =======================
// Student Schema
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

    // Legacy compatibility
    name: { type: String },
    city: { type: String },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Student = mongoose.model("StudentPortal", studentSchema);

// =======================
// GET All Students
// =======================
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch students",
    });
  }
});

// =======================
// GET Single Student
// =======================
app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// =======================
// CREATE Student
// =======================
app.post("/api/students", async (req, res) => {
  try {
    const payload = req.body || {};

    // Legacy fields support
    payload.name = payload.fullName || payload.name || "N/A";
    payload.city = payload.address || payload.city || "N/A";

    const student = new Student(payload);
    const savedStudent = await student.save();

    res.status(201).json(savedStudent);
  } catch (err) {
    console.error("Save Error:", err);

    res.status(400).json({
      error: err.message,
    });
  }
});

// =======================
// UPDATE Student
// =======================
app.put("/api/students/:id", async (req, res) => {
  try {
    const payload = req.body || {};

    if (payload.fullName) {
      payload.name = payload.fullName;
    }

    if (payload.address) {
      payload.city = payload.address;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: false,
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    res.status(200).json(updatedStudent);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
});

// =======================
// DELETE Student
// =======================
app.delete("/api/students/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!deletedStudent) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// =======================
// Frontend Route
// =======================
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
