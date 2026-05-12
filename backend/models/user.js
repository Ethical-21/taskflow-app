const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  dateOfBirth: { type: Date },
  phone: { type: String },
  address: { type: String },
  bio: { type: String },
  avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files' },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
