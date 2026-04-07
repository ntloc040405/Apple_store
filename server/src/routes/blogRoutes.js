import express from 'express';
import { getAll, getBySlug } from '../controllers/blogController.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:slug', getBySlug);

export default router;
