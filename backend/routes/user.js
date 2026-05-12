const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Manager = require('../models/Manager');

const router = express.Router();

// Fix #2/#3 - Use consistent DB name from env; use main mongoose connection for GridFSBucket
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanagement';

// Fix #3 - Use the MAIN mongoose connection for GridFSBucket instead of creating a duplicate
let gfs;
mongoose.connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'avatars',
  });
  console.log('✅ GridFSBucket initialized for avatars');
});

// GridFsStorage still needs a URL to work, but we minimise extra connections this way
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true },
  file: (req, file) => {
    return {
      filename: 'avatar_' + Date.now(),
      bucketName: 'avatars',
    };
  },
});

// Fix #10 - File type and size validation
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
});

// GET user profile by userId
router.get('/profile', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    let user = await User.findById(userId).select('-password');
    if (!user) user = await Admin.findById(userId).select('-password');
    if (!user) user = await Manager.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Always include computed `name` field (Fix #1)
    const userObj = user.toObject();
    userObj.name = `${userObj.firstName} ${userObj.lastName}`;
    res.json(userObj);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update user profile fields
router.put('/profile', async (req, res) => {
  try {
    const { userId, firstName, lastName, email, phone, dateOfBirth, address, bio, department, position } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const updateData = { firstName, lastName, email, phone, dateOfBirth, address, bio, department, position };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    let user = await User.findById(userId);
    if (!user) user = await Admin.findById(userId);
    if (!user) user = await Manager.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let updatedUser;
    if (user.role === 'Admin') {
      updatedUser = await Admin.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    } else if (user.role === 'Manager') {
      updatedUser = await Manager.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    } else {
      updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    }

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    const userObj = updatedUser.toObject();
    userObj.name = `${userObj.firstName} ${userObj.lastName}`;
    res.json(userObj);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update user avatar image (GridFS)
router.put('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let updatedUser = await User.findByIdAndUpdate(userId, { avatar: req.file.id }, { new: true }).select('-password');
    if (!updatedUser) updatedUser = await Admin.findByIdAndUpdate(userId, { avatar: req.file.id }, { new: true }).select('-password');
    if (!updatedUser) updatedUser = await Manager.findByIdAndUpdate(userId, { avatar: req.file.id }, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Avatar updated successfully', avatarId: req.file.id });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET avatar image by id
router.get('/avatar/:id', async (req, res) => {
  try {
    if (!gfs) return res.status(503).json({ error: 'File storage not ready' });
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await mongoose.connection.db.collection('avatars.files').find({ _id: fileId }).toArray();
    if (!files || files.length === 0) return res.status(404).json({ error: 'File not found' });
    const file = files[0];
    res.set('Content-Type', file.contentType || 'image/jpeg');
    const downloadStream = gfs.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error fetching avatar image:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all users (User collection only - for assignee list)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('firstName lastName _id');
    console.log("Users fetched from DB:", users.length);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET team members
router.get('/team-members', async (req, res) => {
  try {
    const users = await User.find().select('firstName lastName _id');
    res.json(users);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET admins
router.get('/admins', async (req, res) => {
  try {
    const admins = await Admin.find().select('firstName lastName _id');
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET managers
router.get('/managers', async (req, res) => {
  try {
    const managers = await Manager.find().select('firstName lastName _id');
    res.json(managers);
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all users combined (for assignee dropdown)
router.get('/all-users', async (req, res) => {
  try {
    const [users, admins, managers] = await Promise.all([
      User.find().select('firstName lastName _id role'),
      Admin.find().select('firstName lastName _id role'),
      Manager.find().select('firstName lastName _id role'),
    ]);
    const allUsers = [...users, ...admins, ...managers].map(u => ({
      id: u._id,
      name: `${u.firstName} ${u.lastName}`,
      role: u.role,
    }));
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
