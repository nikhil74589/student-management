// 1. Load dotenv on top (Fixes PORT and MONGO_URI from .env file)
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// MONGO DB CONNECT
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/libraryDB';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// FLEXIBLE SCHEMA FOR ALL 9 FIELDS
const StudentSchema = new mongoose.Schema({
  fullName: { type: String, default: '' },
  name: { type: String, default: '' },
  fatherName: { type: String, default: '' },
  degree: { type: String, default: '' },
  mobile: { type: String, default: '' },
  email: { type: String, default: '' },
  background: { type: String, default: 'Analytical Mindset' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  membership: { type: String, default: 'Basic Access' },
  freeBook: { type: String, default: 'None' }
}, { timestamps: true });

const Student = mongoose.model('Student', StudentSchema);

// 1. GET ALL STUDENTS
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE NEW STUDENT
app.post('/api/students', async (req, res) => {
  try {
    const data = req.body;
    // Fallback sync for legacy fields
    if (!data.fullName && data.name) data.fullName = data.name;
    if (!data.name && data.fullName) data.name = data.fullName;
    if (!data.address && data.city) data.address = data.city;
    if (!data.city && data.address) data.city = data.address;

    const newStudent = new Student(data);
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE STUDENT (EDIT)
app.put('/api/students/:id', async (req, res) => {
  try {
    const data = req.body;
    if (!data.fullName && data.name) data.fullName = data.name;
    if (!data.name && data.fullName) data.name = data.fullName;
    if (!data.address && data.city) data.address = data.city;

    const updated = await Student.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ error: "Student not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE STUDENT
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic PORT Parsing & 0.0.0.0 Interface Binding Fix
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} [ENV: ${ENV}]`);
});
