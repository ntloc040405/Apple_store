import { Router } from 'express';
import { getAll, getFeatured, search, compare, getBySlug, getByCategory, getRelated, adminGetAll, create, update, remove, toggleActive } from '../controllers/productController.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();

// Public routes (order matters — specific before :slug)
router.get('/featured', getFeatured);
router.get('/search', search);
router.get('/compare', compare);
router.get('/category/:categorySlug', getByCategory);

// Admin routes (before :slug to avoid conflict)
router.get('/admin/all', auth, admin, adminGetAll);

router.get('/:slug', getBySlug);
router.get('/:id/related', getRelated);
router.get('/', getAll);

// Admin CRUD
router.post('/', auth, admin, create);
router.put('/:id', auth, admin, update);
router.put('/:id/toggle-active', auth, admin, toggleActive);
router.delete('/:id', auth, admin, remove);

export default router;
