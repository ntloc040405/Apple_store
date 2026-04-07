import { Router } from 'express';
import { getByProduct, create, update, remove, getAll, checkEligibility } from '../controllers/reviewController.js';
import { auth, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// Public/User routes
router.get('/product/:productId', getByProduct);
router.get('/check-eligibility/:productId', auth, checkEligibility);
router.post('/', auth, upload.array('images', 5), create);  // Max 5 images
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

// Admin routes
router.get('/admin/all', auth, admin, getAll);

export default router;
