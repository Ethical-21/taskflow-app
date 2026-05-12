const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Manager = require('../models/Manager');
const ActiveSession = require('../models/activeSession');

const router = express.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_DEPARTMENT = "Engineering";
const ALLOWED_POSITION = "Software Engineer";

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, position } = req.body;

    console.log('Signup request body:', req.body);

    if (!firstName || !lastName || !email || !password || !role || !department || !position) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (department !== ALLOWED_DEPARTMENT) {
      return res.status(400).json({ message: `Department must be ${ALLOWED_DEPARTMENT}` });
    }

    if (position !== ALLOWED_POSITION) {
      return res.status(400).json({ message: `Position must be ${ALLOWED_POSITION}` });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check across all three collections for duplicate email
    const existingUser = await User.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    const existingManager = await Manager.findOne({ email });
    if (existingUser || existingAdmin || existingManager) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === 'Admin') {
      user = new Admin({ firstName, lastName, email, password: hashedPassword, role, department, position });
    } else if (role === 'Manager') {
      user = new Manager({ firstName, lastName, email, password: hashedPassword, role, department, position });
    } else {
      user = new User({ firstName, lastName, email, password: hashedPassword, role, department, position });
    }

    await user.save();
    console.log('User created successfully:', user._id);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signin route
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Search all three collections
    let user = await User.findOne({ email });
    if (!user) user = await Admin.findOne({ email });
    if (!user) user = await Manager.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update active session with inline user info (Fix #15 - no cross-collection populate needed)
    await ActiveSession.findOneAndUpdate(
      { userId: user._id },
      {
        role: user.role,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        lastActiveAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Fix #8 - use env JWT_SECRET, add role to token payload
    const jwtSecret = process.env.JWT_SECRET || 'secretkey';
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    // Fix #1 - Include computed `name` field in response
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        avatar: user.avatar || null,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    await ActiveSession.findOneAndDelete({ userId });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active sessions route - Fix #15: no populate, use inline fields
router.get('/active-sessions', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const sessions = await ActiveSession.find(filter);
    // Map to expected structure (mimic the old populate output)
    const result = sessions.map(s => ({
      _id: s._id,
      role: s.role,
      lastActiveAt: s.lastActiveAt,
      userId: {
        _id: s.userId,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        role: s.role,
      }
    }));
    res.json(result);
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user avatar route
router.put('/user/avatar', async (req, res) => {
  try {
    const { userId, avatar } = req.body;
    if (!userId || !avatar) {
      return res.status(400).json({ message: 'User ID and avatar URL are required' });
    }
    let user = await User.findByIdAndUpdate(userId, { avatar }, { new: true });
    if (!user) user = await Admin.findByIdAndUpdate(userId, { avatar }, { new: true });
    if (!user) user = await Manager.findByIdAndUpdate(userId, { avatar }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Avatar updated successfully', user });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile route
router.put('/user/profile', async (req, res) => {
  try {
    const { userId, firstName, lastName, email, phone, address, bio, dateOfBirth, department, position } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (department && department !== ALLOWED_DEPARTMENT) {
      return res.status(400).json({ message: `Department must be ${ALLOWED_DEPARTMENT}` });
    }
    if (position && position !== ALLOWED_POSITION) {
      return res.status(400).json({ message: `Position must be ${ALLOWED_POSITION}` });
    }

    const updateData = { firstName, lastName, email, phone, address, bio, dateOfBirth, department, position };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    let user = await User.findById(userId);
    let model = User;
    if (!user) { user = await Admin.findById(userId); model = Admin; }
    if (!user) { user = await Manager.findById(userId); model = Manager; }
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updatedUser = await model.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fix #14 - Get all users (User + Admin + Manager combined)
router.get('/users', async (req, res) => {
  try {
    const [users, admins, managers] = await Promise.all([
      User.find({}).select('-password'),
      Admin.find({}).select('-password'),
      Manager.find({}).select('-password'),
    ]);
    res.json([...users, ...admins, ...managers]);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team members only
router.get('/users/members', async (req, res) => {
  try {
    const members = await User.find({ role: "Team Member" }).select('-password');
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear all active sessions (admin utility)
router.post('/clear-active-sessions', async (req, res) => {
  try {
    await ActiveSession.deleteMany({});
    res.json({ message: 'Active sessions cleared successfully' });
  } catch (error) {
    console.error('Clear active sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
