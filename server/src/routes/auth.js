import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refreshAccessToken, logout, getProfile, updateProfile, changePassword, addAddress, updateAddress, deleteAddress } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Rate limiting: max 5 attempts per 15 minutes for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased to 100 entries for development to avoid 429 error
  message: 'Quá nhiều lần đăng nhập/đăng ký thất bại, vui lòng thử lại sau 15 phút.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/address', auth, addAddress);
router.put('/address/:addressId', auth, updateAddress);
router.delete('/address/:addressId', auth, deleteAddress);

export default router;
