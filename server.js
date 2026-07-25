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

// Student Schema Definition
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

// API Routes

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (err) {
    console.error('GET Error:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Create new student
app.post('/api/students', async (req, res) => {
  try {
    console.log('Incoming Data:', req.body);
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
    console.error('POST Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedStudent);
  } catch (err) {
    console.error('PUT Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('DELETE Error:', err.message);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
