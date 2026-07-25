const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studentDB';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Schema Definition with Fallbacks
const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  fatherName: { type: String, default: '' },
  degree: { type: String, default: '' },
  mobile: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  background: { type: String, default: '' },
  membership: { type: String, default: 'Basic (Free)' },
  freeBook: { type: String, default: 'None' }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// GET API
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching students' });
  }
});

// POST API - Fixed Error Response Log
app.post('/api/students', async (req, res) => {
  try {
    console.log('Received Payload:', req.body);
    const newStudent = new Student({
      fullName: req.body.fullName || 'N/A',
      fatherName: req.body.fatherName || 'N/A',
      degree: req.body.degree || 'N/A',
      mobile: req.body.mobile || 'N/A',
      email: req.body.email || 'N/A',
      address: req.body.address || 'N/A',
      background: req.body.background || 'N/A',
      membership: req.body.membership || 'Basic (Free)',
      freeBook: req.body.freeBook || 'None'
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    console.error('Save Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// PUT API
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE API
app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
