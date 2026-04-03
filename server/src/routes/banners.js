import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/bannerController.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();

router.get('/', getAll);
router.post('/', auth, admin, create);
router.put('/:id', auth, admin, update);
router.delete('/:id', auth, admin, remove);

export default router;
