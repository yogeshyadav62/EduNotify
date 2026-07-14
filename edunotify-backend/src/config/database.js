import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edunotify';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connection established successfully.');
  } catch (error) {
    console.error('🔥 MongoDB connection failed:', error.message);
    console.error('💡 Please make sure MongoDB is running locally (e.g. netstart MongoDB), or configure a valid MONGODB_URI (like a free MongoDB Atlas connection string) in backend/.env.');
    process.exit(1);
  }
};

export default mongoose;
