const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load Environment File
require('dotenv').config({
  path: process.env.ENV_FILE || '.env'
});

const app = express();

app.use(cors());
app.use(express.json());

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// ================= MongoDB Connection =================

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in environment variables.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
.then(() => {
    console.log("✅ MongoDB Connected");
    console.log(`🌍 Environment : ${process.env.ENVIRONMENT}`);
})
.catch((err) => {
    console.log("❌ MongoDB Error:", err.message);
    process.exit(1);
});

// ================= Student Schema =================

const studentSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    city: {
        type: String,
        required: true,
        trim: true
    },

    degree: {
        type: String,
        required: true,
        trim: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

const Student = mongoose.model("Student", studentSchema);

// ================= Routes =================

// Home Page

app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "public", "index.html"));

});

// Health Check

app.get("/health", (req, res) => {

    res.status(200).json({

        status: "UP",
        environment: process.env.ENVIRONMENT,
        database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"

    });

});

// ================= Create Student =================

app.post("/api/students", async (req, res) => {

    try {

        const student = await Student.create({

            name: req.body.name,
            email: req.body.email,
            city: req.body.city,
            degree: req.body.degree

        });

        res.status(201).json(student);

    } catch (err) {

        res.status(400).json({

            success: false,
            error: err.message

        });

    }

});

// ================= Read All Students =================

app.get("/api/students", async (req, res) => {

    try {

        const students = await Student.find().sort({

            createdAt: -1

        });

        res.status(200).json(students);

    }

    catch (err) {

        res.status(500).json({

            success: false,
            error: err.message

        });

    }

});

// ================= Read One Student =================

app.get("/api/students/:id", async (req, res) => {

    try {

        const student = await Student.findById(req.params.id);

        if (!student) {

            return res.status(404).json({

                error: "Student Not Found"

            });

        }

        res.json(student);

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

// ================= Update Student =================

app.put("/api/students/:id", async (req, res) => {

    try {

        const student = await Student.findByIdAndUpdate(

            req.params.id,

            req.body,

            {

                new: true,
                runValidators: true

            }

        );

        if (!student) {

            return res.status(404).json({

                error: "Student Not Found"

            });

        }

        res.json(student);

    }

    catch (err) {

        res.status(400).json({

            error: err.message

        });

    }

});

// ================= Delete Student =================

app.delete("/api/students/:id", async (req, res) => {

    try {

        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {

            return res.status(404).json({

                error: "Student Not Found"

            });

        }

        res.json({

            message: "Student Deleted Successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

// ================= Server =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

    console.log("====================================");
    console.log(`🚀 Student Management System Started`);
    console.log(`🌍 Environment : ${process.env.ENVIRONMENT}`);
    console.log(`🌐 URL : http://0.0.0.0:${PORT}`);
    console.log("====================================");

});
