import { Router } from 'express';
import { getNotifications, createNotification, updateNotification, deleteNotification } from '../controllers/notification.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

// Retrieve notifications - uses token verification to check if the caller is a student
router.get('/', verifyToken, getNotifications);

// Admin-only write endpoints, supporting file uploads
router.post('/', requireAdmin, upload.single('attachment'), createNotification);
router.put('/:id', requireAdmin, upload.single('attachment'), updateNotification);
router.delete('/:id', requireAdmin, deleteNotification);

export default router;
