import { Router } from 'express';
import { getAllUsers, getUserById, updateRole, toggleActive, getDashboard, exportReport, createStaff, deleteStaff } from '../controllers/adminController.js';
import { auth, admin, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(auth, admin); // All routes require admin or staff

router.get('/dashboard', getDashboard);
router.get('/reports/export', exportReport);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateRole);
router.put('/users/:id/toggle-active', toggleActive);

// Staff management (Admin only)
router.post('/staff', adminOnly, createStaff);
router.delete('/staff/:id', adminOnly, deleteStaff);

export default router;
