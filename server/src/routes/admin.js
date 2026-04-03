import { Router } from 'express';
import { getAllUsers, getUserById, updateRole, toggleActive, getDashboard, exportReport } from '../controllers/adminController.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();

router.use(auth, admin); // All routes require admin

router.get('/dashboard', getDashboard);
router.get('/reports/export', exportReport);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateRole);
router.put('/users/:id/toggle-active', toggleActive);

export default router;
