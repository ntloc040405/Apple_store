import { Router } from 'express';
import { getWishlist, toggle } from '../controllers/wishlistController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getWishlist);
router.post('/toggle', auth, toggle);

export default router;
