import jwt from 'jsonwebtoken';
import { Student, Class } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'edunotifysecretkey123';

export const studentLogin = async (req, res) => {
  const { studentId, classId } = req.body;

  if (!studentId || !classId) {
    return res.status(400).json({ message: 'Student ID and Class ID are required' });
  }

  try {
    const formattedStuId = studentId.toUpperCase().trim();
    const formattedClassId = classId.toUpperCase().trim();

    // Find student in DB
    const student = await Student.findOne({
      where: {
        studentId: formattedStuId,
        classId: formattedClassId
      },
      include: [Class]
    });

    if (!student) {
      return res.status(401).json({ message: 'Invalid Student ID or Class ID' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { studentId: student.studentId, classId: student.classId, role: 'student' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      user: {
        studentId: student.studentId,
        classId: student.classId,
        name: student.name,
        email: student.email,
        mobile: student.mobile,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=2563EB&color=fff`
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Simple static credentials for evaluation / admin panel
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      user: {
        username: ADMIN_USERNAME,
        role: 'admin',
        name: 'Administrator'
      },
      token
    });
  }

  return res.status(401).json({ message: 'Invalid Admin credentials' });
};
