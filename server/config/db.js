const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = 'mongodb://127.0.0.1:27017/ems_db';
  
  try {
    console.log('Connecting to primary MongoDB Database...');
    const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected (Primary): ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Primary connection failed: ${error.message}`);
    console.log('Attempting connection to local fallback MongoDB...');
    try {
      const conn = await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`Fallback failed: ${fallbackError.message}`);
      console.error('\n==================================================================');
      console.error('CRITICAL: Could not connect to MongoDB Atlas or local MongoDB.');
      console.error('Please check:');
      console.error('1. Your IP Address is whitelisted in MongoDB Atlas Network Security.');
      console.error('2. Your MongoDB service is running locally if using a fallback.');
      console.error('==================================================================\n');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
