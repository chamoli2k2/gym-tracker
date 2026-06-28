const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gym-tracker';

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`MongoDB connection error: ${error.message}`);
      process.exit(1);
    }

    console.warn(`Local MongoDB unavailable (${error.message})`);
    console.warn('Starting in-memory database for development...');

    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri('gym-tracker');
    const conn = await mongoose.connect(memUri);
    console.log('In-memory MongoDB ready (data resets when server restarts)');
    console.log('Tip: install MongoDB for persistent storage → brew install mongodb-community');
    return conn;
  }
};

module.exports = connectDB;
