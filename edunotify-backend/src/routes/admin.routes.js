import { Router } from 'express';
import {
  adminLogin,
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification
} from '../controllers/admin.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

// Authentication
router.post('/auth/login', adminLogin);

// Class CRUD (Admin Only)
router.get('/classes', requireAdmin, getAllClasses);
router.post('/classes', requireAdmin, createClass);
router.put('/classes/:id', requireAdmin, updateClass);
router.delete('/classes/:id', requireAdmin, deleteClass);

// Student CRUD (Admin Only)
router.get('/students', requireAdmin, getAllStudents);
router.post('/students', requireAdmin, createStudent);
router.put('/students/:studentId', requireAdmin, updateStudent);
router.delete('/students/:studentId', requireAdmin, deleteStudent);

// Notification CRUD (Admin Only)
router.get('/notifications', requireAdmin, getAllNotifications);
router.post('/notifications', requireAdmin, upload.single('attachment'), createNotification);
router.put('/notifications/:id', requireAdmin, upload.single('attachment'), updateNotification);
router.delete('/notifications/:id', requireAdmin, deleteNotification);

export default router;
