import { Router } from 'express';
import { getByProduct, create, update, remove } from '../controllers/reviewController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', getByProduct);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

export default router;
