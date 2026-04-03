import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem, clearCart } from '../controllers/cartController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getCart);
router.post('/add', auth, addItem);
router.put('/update/:itemId', auth, updateItem);
router.delete('/remove/:itemId', auth, removeItem);
router.delete('/clear', auth, clearCart);

export default router;
