const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studentDB';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// COMPLETELY FLEXIBLE SCHEMA (No rigid rules, accepts everything)
const studentSchema = new mongoose.Schema({
  name: { type: String, default: 'Student' },
  city: { type: String, default: 'City' },
  fullName: { type: String, default: 'Student' },
  fatherName: { type: String, default: 'N/A' },
  degree: { type: String, default: 'N/A' },
  mobile: { type: String, default: 'N/A' },
  email: { type: String, default: 'N/A' },
  address: { type: String, default: 'N/A' },
  background: { type: String, default: 'N/A' },
  membership: { type: String, default: 'Basic (Free)' },
  freeBook: { type: String, default: 'None' }
}, { 
  timestamps: true,
  strict: false // Flexible mode ON
});

const Student = mongoose.model('Student', studentSchema);

// GET API
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST API - Full Safety Payload Assignment
app.post('/api/students', async (req, res) => {
  try {
    const body = req.body || {};
    const nameVal = body.fullName || body.name || 'Student';
    const addressVal = body.address || body.city || 'Address';

    const newStudent = new Student({
      ...body,
      name: nameVal,
      city: addressVal,
      fullName: nameVal,
      address: addressVal
    });

    const savedStudent = await newStudent.save();
    console.log("Saved Document:", savedStudent);
    res.status(201).json(savedStudent);
  } catch (err) {
    console.error('POST Error:', err);
    res.status(400).json({ error: err.message || 'Error saving student' });
  }
});

// PUT API
app.put('/api/students/:id', async (req, res) => {
  try {
    const body = req.body || {};
    if (body.fullName) body.name = body.fullName;
    if (body.address) body.city = body.address;

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id, 
      body, 
      { new: true, runValidators: false }
    );
    res.status(200).json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE API
app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
