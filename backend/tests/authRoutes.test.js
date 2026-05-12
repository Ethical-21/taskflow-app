const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/authRoutes');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Manager = require('../models/Manager');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  const mongoURI = 'mongodb://localhost:27017/task-management-app-test';
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  await User.deleteMany({});
  await Admin.deleteMany({});
  await Manager.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  test('Signup and signin for Admin', async () => {
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin',
      department: 'Engineering',
      position: 'Software Engineer',
    };

    // Signup
    const signupRes = await request(app).post('/api/auth/signup').send(adminData);
    expect(signupRes.statusCode).toBe(201);
    expect(signupRes.body.message).toBe('User created successfully');

    // Signin
    const signinRes = await request(app).post('/api/auth/signin').send({
      email: adminData.email,
      password: adminData.password,
    });
    expect(signinRes.statusCode).toBe(200);
    expect(signinRes.body.user.email).toBe(adminData.email);
    expect(signinRes.body.user.role).toBe('Admin');
  });

  test('Signup and signin for Manager', async () => {
    const managerData = {
      firstName: 'Manager',
