require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/user');

const app = express();
const port = process.env.PORT || 5000;

// Fix #7 - Restrict CORS to known origin (localhost:3000 for dev)
// For production, replace with your deployed frontend URL
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: origin not allowed'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth/user', userRoutes);

// Fix #8 - Warn if JWT_SECRET is not set in .env
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET is not set. Using insecure fallback. Set JWT_SECRET in .env file!');
}

// Fix #4 - Use consistent DB name from .env
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanagement';

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ Connected to MongoDB:', mongoURI);
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB', err);
    process.exit(1);
  });
