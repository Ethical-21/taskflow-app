const mongoose = require('mongoose');

// Fix #15 - Changed ref from 'User' to no strict ref (Mixed ObjectId)
// because Admins/Managers are in separate collections.
// Using Mixed type allows storing IDs from any collection.
const activeSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    // No ref: populate won't work cross-collection, but
    // we store role separately to avoid needing to populate
  },
  role: { type: String, required: true },
  email: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  lastActiveAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('ActiveSession', activeSessionSchema);
