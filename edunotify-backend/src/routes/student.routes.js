import { Router } from 'express';
import { 
  studentLogin, 
  getStudentNotifications, 
  updateFCMToken, 
  markNotificationDelivered, 
  markNotificationSeen,
  getStudentProfile,
  updateStudentProfile,
  updateStudentAvatar
} from '../controllers/student.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

// Student Login
router.post('/auth/login', studentLogin);

// Fetch target-filtered notifications (Student only)
router.get('/notifications', verifyToken, getStudentNotifications);

// Register/update device FCM Token
router.put('/fcm-token', verifyToken, updateFCMToken);

// Mark notification status (delivered, seen)
router.put('/notifications/:id/delivered', verifyToken, markNotificationDelivered);
router.put('/notifications/:id/seen', verifyToken, markNotificationSeen);

// Profile management
router.get('/profile', verifyToken, getStudentProfile);
router.put('/profile', verifyToken, updateStudentProfile);
router.put('/profile/avatar', verifyToken, upload.single('avatar'), updateStudentAvatar);

export default router;
