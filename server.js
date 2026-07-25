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

// Schema Definition (Backward compatible for old & new fields)
const studentSchema = new mongoose.Schema({
  name: { type: String },
  city: { type: String },
  fullName: { type: String, required: true },
  fatherName: { type: String, default: 'N/A' },
  degree: { type: String, default: 'N/A' },
  mobile: { type: String, default: 'N/A' },
  email: { type: String, default: 'N/A' },
  address: { type: String, default: 'N/A' },
  background: { type: String, default: 'N/A' },
  membership: { type: String, default: 'Basic (Free)' },
  freeBook: { type: String, default: 'None' }
}, { timestamps: true });

// Auto-fill legacy fields before MongoDB validation runs
studentSchema.pre('validate', function(next) {
  if (!this.name && this.fullName) {
    this.name = this.fullName;
  }
  if (!this.city && this.address) {
    this.city = this.address;
  }
  next();
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

// POST API
app.post('/api/students', async (req, res) => {
  try {
    const nameVal = req.body.fullName || req.body.name || 'N/A';
    const cityVal = req.body.address || req.body.city || 'N/A';

    const newStudent = new Student({
      name: nameVal,
      city: cityVal,
      fullName: nameVal,
      fatherName: req.body.fatherName || 'N/A',
      degree: req.body.degree || 'N/A',
      mobile: req.body.mobile || 'N/A',
      email: req.body.email || 'N/A',
      address: cityVal,
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

// PUT API
app.put('/api/students/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.fullName) updateData.name = updateData.fullName;
    if (updateData.address) updateData.city = updateData.address;

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id, 
      updateData, 
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
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
