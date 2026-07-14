import { Notification, Class, Student } from '../models/index.js';
import { emitNewNotification, emitDeletedNotification } from '../loaders/socket.js';
import { Op } from 'sequelize';

// Fetch notifications (Filtered for Students, All for Admin)
export const getNotifications = async (req, res) => {
  const { role, classId, studentId } = req.user || {};

  try {
    let whereClause = {};

    if (role === 'student') {
      // Students only see published, non-scheduled (or already past scheduled time) notices matching their target
      whereClause = {
        status: 'published',
        [Op.or]: [
          {
            [Op.and]: [
              { scheduledFor: null },
              { dateTime: { [Op.lte]: new Date() } }
            ]
          },
          {
            scheduledFor: { [Op.lte]: new Date() }
          }
        ],
        classId: classId.toUpperCase(),
        [Op.or]: [
          { targetType: 'class' },
          { 
            [Op.and]: [
              { targetType: 'student' },
              { studentId: studentId.toUpperCase() }
            ]
          }
        ]
      };
    } else if (role === 'admin') {
      // Admin sees everything
      whereClause = {};
    } else {
      // Public / Unauthenticated fallback (or just return all published for testing)
      whereClause = { status: 'published' };
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      include: [Class, Student],
      order: [['dateTime', 'DESC']]
    });

    return res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Create a new notification
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
    attachmentUrl
  } = req.body;

  if (!title || !description || !facultyName || !category || !targetType) {
    return res.status(400).json({ message: 'Title, description, faculty name, category, and target type are required' });
  }

  try {
    const formattedClassId = classId ? classId.toUpperCase().trim() : null;
    const formattedStudentId = studentId ? studentId.toUpperCase().trim() : null;

    // Validate relationships
    if (formattedClassId) {
      const classExists = await Class.findByPk(formattedClassId);
      if (!classExists) {
        return res.status(404).json({ message: `Class ${formattedClassId} not found` });
      }
    }

    if (formattedStudentId) {
      const studentExists = await Student.findByPk(formattedStudentId);
      if (!studentExists) {
        return res.status(404).json({ message: `Student ID ${formattedStudentId} not found` });
      }
    }

    // Determine absolute image path if file uploaded
    let finalAttachmentUrl = attachmentUrl || null;
    if (req.file) {
      finalAttachmentUrl = `/uploads/${req.file.filename}`;
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
      status: isScheduled ? 'draft' : initialStatus, // Keep scheduled as draft until the timer triggers, or just schedule it
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      dateTime: scheduledFor ? new Date(scheduledFor) : new Date(),
      attachmentUrl: finalAttachmentUrl
    });

    const response = await Notification.findByPk(notification.id, { include: [Class, Student] });

    // Emit real-time update immediately if it's published and not scheduled for later
    if (response.status === 'published' && !isScheduled) {
      emitNewNotification(response);
    }

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ message: 'Failed to create notification' });
  }
};

// Update an existing notification
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
    attachmentUrl
  } = req.body;

  try {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const formattedClassId = classId ? classId.toUpperCase().trim() : null;
    const formattedStudentId = studentId ? studentId.toUpperCase().trim() : null;

    if (formattedClassId) {
      const classExists = await Class.findByPk(formattedClassId);
      if (!classExists) {
        return res.status(404).json({ message: `Class ${formattedClassId} not found` });
      }
    }

    if (formattedStudentId) {
      const studentExists = await Student.findByPk(formattedStudentId);
      if (!studentExists) {
        return res.status(404).json({ message: `Student ID ${formattedStudentId} not found` });
      }
    }

    let finalAttachmentUrl = attachmentUrl !== undefined ? attachmentUrl : notification.attachmentUrl;
    if (req.file) {
      finalAttachmentUrl = `/uploads/${req.file.filename}`;
    }

    const oldStatus = notification.status;

    await notification.update({
      title: title !== undefined ? title.trim() : notification.title,
      description: description !== undefined ? description.trim() : notification.description,
      facultyName: facultyName !== undefined ? facultyName.trim() : notification.facultyName,
      category: category !== undefined ? category.toLowerCase().trim() : notification.category,
      targetType: targetType !== undefined ? targetType : notification.targetType,
      classId: formattedClassId,
      studentId: formattedStudentId,
      status: status !== undefined ? status : notification.status,
      scheduledFor: scheduledFor !== undefined ? (scheduledFor ? new Date(scheduledFor) : null) : notification.scheduledFor,
      attachmentUrl: finalAttachmentUrl
    });

    const response = await Notification.findByPk(notification.id, { include: [Class, Student] });

    // Emit real-time update if newly published
    if (response.status === 'published' && oldStatus !== 'published') {
      emitNewNotification(response);
    }

    return res.json(response);
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ message: 'Failed to update notification' });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.destroy();
    emitDeletedNotification(notification);
    return res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Failed to delete notification' });
  }
};
