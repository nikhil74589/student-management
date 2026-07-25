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

// Environment specific Database name dynamic pick karega
const ENV = process.env.NODE_ENV || 'dev';
const MONGO_URI = process.env.MONGO_URI || `mongodb://localhost:27017/studentDB_${ENV}`;

mongoose.connect(MONGO_URI)
  .then(() => console.log(`MongoDB Connected [${ENV} Environment]`))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Dynamic & Flexible Schema (Validation Error Blocked)
const studentSchema = new mongoose.Schema({
  fullName: { type: String, default: 'N/A' },
  fatherName: { type: String, default: 'N/A' },
  degree: { type: String, default: 'N/A' },
  mobile: { type: String, default: 'N/A' },
  email: { type: String, default: 'N/A' },
  address: { type: String, default: 'N/A' },
  background: { type: String, default: 'N/A' },
  membership: { type: String, default: 'Basic (Free)' },
  freeBook: { type: String, default: 'None' },
  // Compatibility for old fields
  name: { type: String },
  city: { type: String }
}, { 
  timestamps: true,
  strict: false 
});

const Student = mongoose.model('StudentPortal', studentSchema);

// GET API
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST API
app.post('/api/students', async (req, res) => {
  try {
    const payload = req.body || {};
    payload.name = payload.fullName || 'N/A';
    payload.city = payload.address || 'N/A';

    const newStudent = new Student(payload);
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    console.error('Save Error:', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT API
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id, 
      req.body, 
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
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Serve Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT} [ENV: ${ENV}]`));
