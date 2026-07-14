import sequelize from '../config/database.js';
import { Class, Student, Notification } from '../models/index.js';

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database tables
    await sequelize.sync({ force: false }); // Set to true if you need to wipe it, false to persist
    console.log('✅ Database tables synchronized.');

    // Seed mock data if database is empty
    await seedInitialData();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const seedInitialData = async () => {
  const classCount = await Class.count();
  if (classCount === 0) {
    console.log('🌱 Seeding database...');

    // 1. Seed Classes
    const classes = await Class.bulkCreate([
      { id: 'CS-202', name: 'Computer Science - Year 2' },
      { id: 'CS-101', name: 'Computer Science - Year 1' },
      { id: 'BCA-2A', name: 'Bachelor of Computer Applications - 2A' },
      { id: 'MBA-SEM-1', name: 'Master of Business Administration - Sem 1' },
    ]);

    // 2. Seed Students (Mapping to credentials from readme)
    await Student.bulkCreate([
      {
        studentId: 'STU-101',
        name: 'Aarav Sharma',
        classId: 'CS-202',
        email: 'aarav.sharma@institution.edu',
        mobile: '+919876543210',
      },
      {
        studentId: 'STU-102',
        name: 'Neha Patel',
        classId: 'CS-202',
        email: 'neha.patel@institution.edu',
        mobile: '+918765432109',
      },
      {
        studentId: 'STU-301',
        name: 'Rohan Das',
        classId: 'CS-101',
        email: 'rohan.das@institution.edu',
        mobile: '+917654321098',
      },
    ]);

    // 3. Seed Notifications
    await Notification.bulkCreate([
      {
        title: 'Mid-Semester Exam Schedule',
        description: 'The mid-semester examinations for CS-202 will commence on July 20th. Please check the timetable attached on the board or refer to the syllabus document for detailed topics.',
        facultyName: 'Dr. Ramesh Kumar',
        category: 'academic',
        dateTime: new Date(Date.now() - 3600000 * 24), // 1 day ago
        targetType: 'class',
        classId: 'CS-202',
        studentId: null,
        status: 'published',
      },
      {
        title: 'Library Fee Pending',
        description: 'You have a pending library overdue fine of ₹150 for the book "Introduction to Algorithms". Please clear this amount at the library counter before July 18th to avoid account block.',
        facultyName: 'Mrs. Sunita Verma (Librarian)',
        category: 'fees',
        dateTime: new Date(Date.now() - 3600000 * 5), // 5 hours ago
        targetType: 'student',
        classId: 'CS-202',
        studentId: 'STU-101', // Personal to Aarav Sharma
        status: 'published',
      },
      {
        title: 'Annual Coding Hackathon 2026',
        description: 'Register for CodeStorm 2026, our university\'s annual coding hackathon. Over ₹50,000 in cash prizes up for grabs! Teams of 2-4 members are allowed.',
        facultyName: 'Prof. Alok Gupta',
        category: 'events',
        dateTime: new Date(Date.now() - 3600000 * 12), // 12 hours ago
        targetType: 'class',
        classId: 'CS-202',
        studentId: null,
        status: 'published',
      },
      {
        title: 'Route-5 Bus Delay Notice',
        description: 'Route-5 bus is running 25 minutes late today due to severe waterlogging on the main bypass. We apologize for the inconvenience caused.',
        facultyName: 'Mr. Jagdish Singh (Transport In-charge)',
        category: 'transport',
        dateTime: new Date(Date.now()), // Just now
        targetType: 'class',
        classId: 'CS-101', // For CS-101 class (Rohan Das)
        studentId: null,
        status: 'published',
      },
    ]);

    console.log('🌲 Seeding completed successfully!');
  }
};
