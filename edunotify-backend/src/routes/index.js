import { Router } from 'express';
import adminRoutes from './admin.routes.js';
import studentRoutes from './student.routes.js';

const router = Router();

// Separate APIs: Admin vs Student
router.use('/admin', adminRoutes);
router.use('/student', studentRoutes);

export default router;
