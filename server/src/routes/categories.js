import { Router } from 'express';
import { getAll, getBySlug, adminGetAll, create, update, remove, toggleActive } from '../controllers/categoryController.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/', getAll);
router.get('/admin/all', auth, admin, adminGetAll);
router.get('/:slug', getBySlug);

// Admin CRUD
router.post('/', auth, admin, create);
router.put('/:id', auth, admin, update);
router.put('/:id/toggle-active', auth, admin, toggleActive);
router.delete('/:id', auth, admin, remove);

export default router;
