import { Router } from 'express';
import { studentLogin, adminLogin } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', studentLogin);
router.post('/admin/login', adminLogin);

export default router;
