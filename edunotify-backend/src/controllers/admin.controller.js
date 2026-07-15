import jwt from 'jsonwebtoken';
import { Class, Student, Notification, Admin } from '../models/index.js';
import { emitNewNotification, emitDeletedNotification } from '../loaders/socket.js';
import { firebaseService } from '../services/firebase.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'edunotifysecretkey123';

// --- AUTHENTICATION ---
export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const adminUser = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!adminUser) {
      return res.status(401).json({ message: 'Invalid Admin credentials' });
    }

    const isMatch = await adminUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Admin credentials' });
    }

    const token = jwt.sign(
      { username: adminUser.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      user: {
        username: adminUser.username,
        role: 'admin',
        name: adminUser.name
      },
      token
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    return res.status(500).json({ message: 'Internal server login error' });
  }
};

// --- CLASS CRUD ---
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
    return res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return res.status(500).json({ message: 'Failed to fetch classes' });
  }
};

export const createClass = async (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ message: 'Class ID and Class Name are required' });
  }
  try {
    const formattedId = id.toUpperCase().trim();
    const existingClass = await Class.findById(formattedId);
    if (existingClass) {
      return res.status(400).json({ message: `Class ${formattedId} already exists` });
    }
    const newClass = await Class.create({ _id: formattedId, name: name.trim() });
    return res.status(201).json(newClass);
  } catch (error) {
    console.error('Error creating class:', error);
    return res.status(500).json({ message: 'Failed to create class' });
  }
};

export const updateClass = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Class Name is required' });
  }
  try {
    const classObj = await Class.findByIdAndUpdate(
      id.toUpperCase(),
      { name: name.trim() },
      { new: true }
    );
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    return res.json(classObj);
  } catch (error) {
    console.error('Error updating class:', error);
    return res.status(500).json({ message: 'Failed to update class' });
  }
};

export const deleteClass = async (req, res) => {
  const { id } = req.params;
  try {
    const formattedId = id.toUpperCase();
    
    // Check if class has active students
    const studentCount = await Student.countDocuments({ classId: formattedId });
    if (studentCount > 0) {
      return res.status(400).json({ message: `Cannot delete class ${formattedId}. It has ${studentCount} active students.` });
    }

    const classObj = await Class.findByIdAndDelete(formattedId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    return res.json({ message: `Class ${id} deleted successfully` });
  } catch (error) {
    console.error('Error deleting class:', error);
    return res.status(500).json({ message: 'Failed to delete class' });
  }
};

// --- STUDENT CRUD ---
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    return res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ message: 'Failed to fetch students' });
  }
};

export const createStudent = async (req, res) => {
  const { studentId, name, classId, email, mobile } = req.body;
  if (!studentId || !name || !classId) {
    return res.status(400).json({ message: 'Student ID, Name, and Class ID are required' });
  }
  try {
    const formattedStuId = studentId.toUpperCase().trim();
    const formattedClassId = classId.toUpperCase().trim();

    const classObj = await Class.findById(formattedClassId);
    if (!classObj) {
      return res.status(404).json({ message: `Class ${formattedClassId} does not exist.` });
    }

    const existingStudent = await Student.findById(formattedStuId);
    if (existingStudent) {
      return res.status(400).json({ message: `Student ID ${formattedStuId} already exists` });
    }

    const newStudent = await Student.create({
      _id: formattedStuId,
      name: name.trim(),
      classId: formattedClassId,
      email: email ? email.trim() : null,
      mobile: mobile ? mobile.trim() : null
    });

    const response = await Student.findById(newStudent._id);
    return res.status(201).json(response);
  } catch (error) {
    console.error('Error creating student:', error);
    return res.status(500).json({ message: 'Failed to create student' });
  }
};

export const updateStudent = async (req, res) => {
  const { studentId } = req.params;
  const { name, classId, email, mobile } = req.body;
  if (!name || !classId) {
    return res.status(400).json({ message: 'Name and Class ID are required' });
  }
  try {
    const formattedStuId = studentId.toUpperCase().trim();
    const formattedClassId = classId.toUpperCase().trim();

    const classObj = await Class.findById(formattedClassId);
    if (!classObj) {
      return res.status(404).json({ message: `Class ${formattedClassId} does not exist` });
    }

    const student = await Student.findByIdAndUpdate(
      formattedStuId,
      {
        name: name.trim(),
        classId: formattedClassId,
        email: email ? email.trim() : null,
        mobile: mobile ? mobile.trim() : null
      },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({ message: 'Failed to update student' });
  }
};

export const deleteStudent = async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await Student.findByIdAndDelete(studentId.toUpperCase());
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.json({ message: `Student ${studentId} deleted successfully` });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({ message: 'Failed to delete student' });
  }
};

// --- NOTIFICATION CRUD ---
export const getAllNotifications = async (req, res) => {
  const { page, limit = 10, search, category, status, subject } = req.query;

  try {
    const query = {};
    if (category) {
      query.category = category.toLowerCase().trim();
    }
    if (status) {
      query.status = status;
    }
    if (subject) {
      query.subject = subject.trim();
    }
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { facultyName: searchRegex },
        { classId: searchRegex },
        { studentId: searchRegex },
        { subject: searchRegex }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const uniqueSubjects = await Notification.distinct('subject');

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
        limit: limitNum,
        uniqueSubjects: uniqueSubjects.filter(Boolean)
      });
    } else {
      const notifications = await Notification.find(query).sort({ dateTime: -1 });
      return res.json(notifications);
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

export const createNotification = async (req, res) => {
  const {
    title,
    description,
    facultyName,
    category,
    targetType,
    classId,
    studentId,
    status,
    scheduledFor,
    attachmentUrl,
    subject
  } = req.body;

  if (!title || !description || !facultyName || !category || !targetType) {
    return res.status(400).json({ message: 'Title, description, faculty name, category, and target type are required' });
  }

  try {
    const formattedClassId = classId ? classId.toUpperCase().trim() : null;
    const formattedStudentId = studentId ? studentId.toUpperCase().trim() : null;

    if (formattedClassId) {
      const classExists = await Class.findById(formattedClassId);
      if (!classExists) {
        return res.status(404).json({ message: `Class ${formattedClassId} not found` });
      }
    }

    if (formattedStudentId) {
      const studentExists = await Student.findById(formattedStudentId);
      if (!studentExists) {
        return res.status(404).json({ message: `Student ID ${formattedStudentId} not found` });
      }
    }

    let finalAttachmentUrl = attachmentUrl || null;
    let finalAttachmentType = null;
    if (req.file) {
      // Cloudinary storage sets req.file.path to the full Cloudinary URL
      finalAttachmentUrl = req.file.path;
      finalAttachmentType = req.file.mimetype; // e.g. 'application/pdf' or 'image/jpeg'
    }

    const isScheduled = scheduledFor ? new Date(scheduledFor) > new Date() : false;
    const initialStatus = status || 'published';

    const notification = await Notification.create({
      title: title.trim(),
      description: description.trim(),
      facultyName: facultyName.trim(),
      category: category.toLowerCase().trim(),
      targetType,
      classId: formattedClassId,
      studentId: formattedStudentId,
      status: isScheduled ? 'draft' : initialStatus,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      dateTime: scheduledFor ? new Date(scheduledFor) : new Date(),
      attachmentUrl: finalAttachmentUrl,
      attachmentType: finalAttachmentType,
      subject: subject ? subject.trim() : null
    });

    // Emit real-time update immediately if it's published and not scheduled
    if (notification.status === 'published' && !isScheduled) {
      emitNewNotification(notification);
      firebaseService.sendPushForNotification(notification);
    }

    return res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ message: 'Failed to create notification' });
  }
};

export const updateNotification = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    facultyName,
    category,
    targetType,
    classId,
    studentId,
    status,
    scheduledFor,
    attachmentUrl,
    subject
  } = req.body;

  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const formattedClassId = classId ? classId.toUpperCase().trim() : null;
    const formattedStudentId = studentId ? studentId.toUpperCase().trim() : null;

    if (formattedClassId) {
      const classExists = await Class.findById(formattedClassId);
      if (!classExists) {
        return res.status(404).json({ message: `Class ${formattedClassId} not found` });
      }
    }

    if (formattedStudentId) {
      const studentExists = await Student.findById(formattedStudentId);
      if (!studentExists) {
        return res.status(404).json({ message: `Student ID ${formattedStudentId} not found` });
      }
    }

    let finalAttachmentUrl = attachmentUrl !== undefined ? attachmentUrl : notification.attachmentUrl;
    let finalAttachmentType = notification.attachmentType || null;
    if (req.file) {
      // Cloudinary storage sets req.file.path to the full Cloudinary URL
      finalAttachmentUrl = req.file.path;
      finalAttachmentType = req.file.mimetype;
    }

    const oldStatus = notification.status;

    const updatedNotice = await Notification.findByIdAndUpdate(id, {
      title: title !== undefined ? title.trim() : notification.title,
      description: description !== undefined ? description.trim() : notification.description,
      facultyName: facultyName !== undefined ? facultyName.trim() : notification.facultyName,
      category: category !== undefined ? category.toLowerCase().trim() : notification.category,
      targetType: targetType !== undefined ? targetType : notification.targetType,
      classId: formattedClassId,
      studentId: formattedStudentId,
      status: status !== undefined ? status : notification.status,
      scheduledFor: scheduledFor !== undefined ? (scheduledFor ? new Date(scheduledFor) : null) : notification.scheduledFor,
      attachmentUrl: finalAttachmentUrl,
      attachmentType: finalAttachmentType,
      subject: subject !== undefined ? (subject ? subject.trim() : null) : notification.subject
    }, { new: true });

    // Emit if newly published
    if (updatedNotice.status === 'published' && oldStatus !== 'published') {
      emitNewNotification(updatedNotice);
      firebaseService.sendPushForNotification(updatedNotice);
    }

    return res.json(updatedNotice);
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ message: 'Failed to update notification' });
  }
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    emitDeletedNotification(notification);
    return res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Failed to delete notification' });
  }
};
