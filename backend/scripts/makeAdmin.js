const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: 'admin@foodapp.com' });
    
    if (!user) {
      console.log('Admin user not found');
      return;
    }

    // Update role to admin
    user.role = 'admin';
    await user.save();
    
    console.log('User updated to admin:', {
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

makeAdmin();
