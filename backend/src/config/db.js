const mongoose = require('mongoose');

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/FoodApp';
  if (!uri) {
    throw new Error('MONGODB_URI not set in environment');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || 'test',
  });
  console.log('MongoDB connected');
}

module.exports = { connectToDatabase };


