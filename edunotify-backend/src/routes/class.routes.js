import { Router } from 'express';
import { getAllClasses, createClass, updateClass, deleteClass } from '../controllers/class.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Everyone can view classes, but only Admin can edit them
router.get('/', getAllClasses);
router.post('/', requireAdmin, createClass);
router.put('/:id', requireAdmin, updateClass);
router.delete('/:id', requireAdmin, deleteClass);

export default router;
