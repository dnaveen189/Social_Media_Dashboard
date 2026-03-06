
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  console.log('Testing MongoDB connection...');
  console.log('Connection string:', process.env.MONGODB_URI?.replace(/:[^:@]*@/, ':****@'));
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

testConnection();