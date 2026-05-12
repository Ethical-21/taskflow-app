const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const task = new Task({
      title: req.body.title,
      description: req.body.description || '',
      status: req.body.status || 'todo',
      priority: req.body.priority || 'Medium',
      dueDate: req.body.dueDate || null,
      project: req.body.project || '',
      tags: req.body.tags || [],
      assignee: req.body.assignee || '',
      createdBy: req.body.createdBy || '',
      user: req.user.userId, // associate task with authenticated user
    });
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all tasks - role-based access
// Admin & Manager: see ALL tasks
// Team Member: see tasks assigned TO them OR created BY them
router.get('/', authMiddleware, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      tasks = await Task.find({}).sort({ createdAt: -1 });
    } else {
      // Key fix: $or matches EITHER assignee field OR the user (creator) field
      tasks = await Task.find({
        $or: [
          { assignee: req.user.userId },   // tasks assigned TO this member
          { assignee: req.user.email },    // some UIs store email as assignee
          { user: req.user.userId },       // tasks created BY this member
        ]
      }).sort({ createdAt: -1 });
    }
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a task by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    let task;
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      task = await Task.findById(req.params.id);
    } else {
      task = await Task.findOne({
        _id: req.params.id,
        $or: [
          { assignee: req.user.userId },
          { assignee: req.user.email },
          { user: req.user.userId },
        ]
      });
    }
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a task by ID
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    let updatedTask;
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
      project: req.body.project,
      tags: req.body.tags,
      assignee: req.body.assignee,
      createdBy: req.body.createdBy,
    };
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });
    } else {
      updatedTask = await Task.findOneAndUpdate(
        { _id: req.params.id, user: req.user.userId },
        updateData,
        { new: true }
      );
    }
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a task by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    let deletedTask;
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      deletedTask = await Task.findByIdAndDelete(req.params.id);
    } else {
      deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    }
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get task statistics for dashboard
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      // Match same logic as GET / — assignee OR creator
      filter = {
        $or: [
          { assignee: req.user.userId },
          { assignee: req.user.email },
          { user: req.user.userId },
        ]
      };
    }
    const [total, completed, inprogress, review, todo] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'done' }),
      Task.countDocuments({ ...filter, status: 'inprogress' }),
      Task.countDocuments({ ...filter, status: 'review' }),
      Task.countDocuments({ ...filter, status: 'todo' }),
    ]);
    // Count overdue tasks (dueDate in the past and not done)
    const overdue = await Task.countDocuments({
      ...filter,
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() },
    });
    res.json({ total, completed, inprogress, review, todo, overdue });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
