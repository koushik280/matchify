require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await User.findOne({ email: 'admin@example.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit();
  }
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const admin = new User({
    email: 'admin@example.com',
    passwordHash,
    name: 'Admin User',
    role: 'superadmin',
    isVerified: true,
    isBlocked: false,
    photos: [],
  });
  await admin.save();
  console.log('Admin created: admin@example.com / Admin123!');
  process.exit();
};
createAdmin();