const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  
  try {
    console.log('Connecting to primary MongoDB Database...');
    const conn = await mongoose.connect(primaryUri);
    console.log(`MongoDB Connected (Primary): ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    console.error('\n==================================================================');
    console.error('CRITICAL: Could not connect to MongoDB Atlas.');
    console.error('Please check:');
    console.error('1. Your IP Address is whitelisted in MongoDB Atlas Network Security.');
    console.error('2. Your connection string in .env is correct.');
    console.error('==================================================================\n');
    process.exit(1);
  }
};

module.exports = connectDB;


