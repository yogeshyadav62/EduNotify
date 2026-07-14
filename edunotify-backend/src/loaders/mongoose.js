import { connectDatabase } from '../config/database.js';
import { Class, Student, Notification, Admin } from '../models/index.js';

export const initDatabase = async () => {
  // 1. Connect to MongoDB
  await connectDatabase();

  // 2. Auto-Seeder (Only seeds System Admin account if none exists)
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('🌱 Seeding database with Admin account...');
      await Admin.create({
        username: 'admin',
        password: 'admin123',
        name: 'System Administrator'
      });
      console.log('🌲 Seeded Admin account successfully.');
    }
  } catch (error) {
    console.error('🔥 Error seeding database:', error);
  }
};
