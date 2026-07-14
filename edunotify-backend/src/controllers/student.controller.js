import jwt from 'jsonwebtoken';
import { Student, Notification } from '../models/index.js';
import { emitNewNotification } from '../loaders/socket.js';

const JWT_SECRET = process.env.JWT_SECRET || 'edunotifysecretkey123';

// --- STUDENT AUTHENTICATION ---
export const studentLogin = async (req, res) => {
  const { studentId, classId } = req.body;

  if (!studentId || !classId) {
    return res.status(400).json({ message: 'Student ID and Class ID are required' });
  }

  try {
    const formattedStuId = studentId.toUpperCase().trim();
    const formattedClassId = classId.toUpperCase().trim();

    // Verify student exists in MongoDB
    const student = await Student.findOne({
      _id: formattedStuId,
      classId: formattedClassId
    }).populate('classId');

    if (!student) {
      return res.status(401).json({ message: 'Invalid Student ID or Class ID' });
    }

    const token = jwt.sign(
      { studentId: student._id, classId: student.classId._id || student.classId, role: 'student' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      user: {
        studentId: student._id,
        classId: student.classId._id || student.classId,
        name: student.name,
        email: student.email,
        mobile: student.mobile,
        avatarUrl: student.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=2563EB&color=fff`
      },
      token
    });
  } catch (error) {
    console.error('Student Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

// --- GET STUDENT NOTIFICATIONS (SECURE TARGET FILTERING) ---
export const getStudentNotifications = async (req, res) => {
  const { studentId, classId, role } = req.user || {};
  const { page, limit = 10 } = req.query;

  if (role !== 'student' || !studentId || !classId) {
    return res.status(403).json({ message: 'Access denied. Student authorization required.' });
  }

  try {
    const now = new Date();

    // Filter query: must be published AND scheduled date has passed (or is null) AND target matches student class or student ID
    const query = {
      status: 'published',
      $or: [
        { scheduledFor: null },
        { scheduledFor: { $lte: now } }
      ],
      classId: classId.toUpperCase(),
      $or: [
        { targetType: 'class' },
        { targetType: 'student', studentId: studentId.toUpperCase() }
      ]
    };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum) {
      const skip = (pageNum - 1) * limitNum;
      const totalCount = await Notification.countDocuments(query);
      const notifications = await Notification.find(query)
        .sort({ dateTime: -1 })
        .skip(skip)
        .limit(limitNum);

      return res.json({
        notifications,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum
      });
    } else {
      const notifications = await Notification.find(query).sort({ dateTime: -1 });
      return res.json(notifications);
    }
  } catch (error) {
    console.error('Error fetching student notifications:', error);
    return res.status(500).json({ message: 'Failed to retrieve notifications' });
  }
};

// --- UPDATE FCM TOKEN ---
export const updateFCMToken = async (req, res) => {
  const { studentId, role } = req.user || {};
  const { fcmToken } = req.body;

  if (role !== 'student' || !studentId) {
    return res.status(403).json({ message: 'Access denied. Student authorization required.' });
  }

  if (!fcmToken) {
    return res.status(400).json({ message: 'FCM Token is required.' });
  }

  try {
    const student = await Student.findByIdAndUpdate(
      studentId.toUpperCase(),
      { fcmToken },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    console.log(`📱 FCM Token registered for student ${studentId}:`, fcmToken);
    return res.json({ message: 'FCM Token updated successfully.' });
  } catch (error) {
    console.error('Error updating FCM Token:', error);
    return res.status(500).json({ message: 'Failed to update FCM Token.' });
  }
};

// --- MARK NOTIFICATION DELIVERED ---
export const markNotificationDelivered = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isDelivered: true, deliveredAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    // Emit socket notification to update Admin dashboard status in real-time
    emitNewNotification(notification);

    return res.json(notification);
  } catch (error) {
    console.error('Error marking notification delivered:', error);
    return res.status(500).json({ message: 'Failed to mark notification delivered.' });
  }
};

// --- MARK NOTIFICATION SEEN (READ) ---
export const markNotificationSeen = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isSeen: true, seenAt: new Date(), isDelivered: true }, // Mark delivered too if not already
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    // Emit socket notification to update Admin dashboard status in real-time
    emitNewNotification(notification);

    return res.json(notification);
  } catch (error) {
    console.error('Error marking notification seen:', error);
    return res.status(500).json({ message: 'Failed to mark notification seen.' });
  }
};

// --- GET STUDENT PROFILE ---
export const getStudentProfile = async (req, res) => {
  const { studentId } = req.user || {};
  if (!studentId) {
    return res.status(403).json({ message: 'Access denied. Student authorization required.' });
  }

  try {
    const student = await Student.findById(studentId).populate('classId');
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    return res.json({
      studentId: student._id,
      name: student.name,
      classId: student.classId._id || student.classId,
      className: student.classId.name || '',
      email: student.email,
      mobile: student.mobile,
      avatarUrl: student.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=2563EB&color=fff`
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return res.status(500).json({ message: 'Failed to fetch profile.' });
  }
};

// --- UPDATE STUDENT PROFILE ---
export const updateStudentProfile = async (req, res) => {
  const { studentId } = req.user || {};
  if (!studentId) {
    return res.status(403).json({ message: 'Access denied. Student authorization required.' });
  }

  const { name, email, mobile } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    if (name !== undefined) student.name = name.trim();
    if (email !== undefined) student.email = email.trim() || null;
    if (mobile !== undefined) student.mobile = mobile.trim() || null;
    
    await student.save();

    return res.json({
      studentId: student._id,
      name: student.name,
      classId: student.classId,
      email: student.email,
      mobile: student.mobile,
      avatarUrl: student.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=2563EB&color=fff`
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
};

// --- UPDATE STUDENT AVATAR (DP) ---
export const updateStudentAvatar = async (req, res) => {
  const { studentId } = req.user || {};
  if (!studentId) {
    return res.status(403).json({ message: 'Access denied. Student authorization required.' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    student.profilePicUrl = req.file.path; // Cloudinary URL
    await student.save();

    return res.json({
      avatarUrl: student.profilePicUrl
    });
  } catch (error) {
    console.error('Error uploading student avatar:', error);
    return res.status(500).json({ message: 'Failed to upload profile picture.' });
  }
};
