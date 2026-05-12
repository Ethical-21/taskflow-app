const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Manager = require('../models/Manager');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/task-management-app';

async function migrateUsers() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Migrate Managers
    const managers = await User.find({ role: 'Manager' });
    for (const manager of managers) {
      const { _id, ...managerData } = manager.toObject();
      // Remove _id to let MongoDB generate a new one
      delete managerData._id;
      const newManager = new Manager(managerData);
      await newManager.save();
      await User.deleteOne({ _id });
      console.log(`Migrated Manager: ${manager.firstName} ${manager.lastName}`);
    }

    // Migrate Admins
    const admins = await User.find({ role: 'Admin' });
    for (const admin of admins) {
      const { _id, ...adminData } = admin.toObject();
      delete adminData._id;
      const newAdmin = new Admin(adminData);
      await newAdmin.save();
      await User.deleteOne({ _id });
      console.log(`Migrated Admin: ${admin.firstName} ${admin.lastName}`);
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateUsers();
