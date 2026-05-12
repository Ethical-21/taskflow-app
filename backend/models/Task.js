const mongoose = require('mongoose');

// Fix #4 - Expanded Task schema to support full Kanban functionality
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['todo', 'inprogress', 'review', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  dueDate: {
    type: Date,
  },
  project: {
    type: String,
    default: '',
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  assignee: {
    type: String,
    default: '',
  },
  createdBy: {
    type: String,
    default: '',
  },
  // The user who owns/created this task (for auth scoping)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
