import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';

const generateAccessToken = (id) => jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpire });
const generateRefreshToken = (id) => jwt.sign({ id }, config.jwtSecret + '_refresh', { expiresIn: config.jwtRefreshExpire });

// Helper to set refresh token cookie
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('apple_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email đã tồn tại.' });

    const user = await User.create({ name, email, password, phone });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    setRefreshTokenCookie(res, refreshToken);
    
    res.status(201).json({ success: true, message: 'Đăng ký thành công', data: { user, token: accessToken } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated.' });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    setRefreshTokenCookie(res, refreshToken);
    
    res.json({ success: true, data: { user, token: accessToken } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/refresh - Refresh access token
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.apple_refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token not found. Please login again.' });
    }

    const decoded = jwt.verify(refreshToken, config.jwtSecret + '_refresh');
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      res.clearCookie('apple_refresh_token');
      return res.status(401).json({ success: false, message: 'Invalid or expired session. Please login again.' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    setRefreshTokenCookie(res, newRefreshToken);
    
    res.json({ success: true, token: newAccessToken });
  } catch (err) {
    res.clearCookie('apple_refresh_token');
    res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('apple_refresh_token');
    res.json({ success: true, message: 'Đăng xuất thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/profile
export const getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar }, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/address
export const addAddress = async (req, res) => {
  try {
    const user = req.user;
    if (req.body.isDefault) user.addresses.forEach(a => (a.isDefault = false));
    else if (user.addresses.length === 0) req.body.isDefault = true;
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ success: true, data: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/address/:addressId
export const updateAddress = async (req, res) => {
  try {
    const user = req.user;
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found.' });
    if (req.body.isDefault) user.addresses.forEach(a => (a.isDefault = false));
    Object.assign(addr, req.body);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/auth/address/:addressId
export const deleteAddress = async (req, res) => {
  try {
    const user = req.user;
    user.addresses.pull(req.params.addressId);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
