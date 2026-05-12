const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Admin' },
  department: { type: String, required: true },
  position: { type: String, required: true },
  dateOfBirth: { type: Date },
  phone: { type: String },
  address: { type: String },
  bio: { type: String },
  avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files' },
}, { timestamps: true });

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
