import { Router } from 'express';
import upload from '../middleware/upload.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();

// POST /api/upload (admin only)
router.post('/', auth, admin, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn file để tải lên.' });
        }

        // Return the relative path for the frontend to use
        // Note: index.js sets up app.use('/uploads', express.static('uploads'));
        const filePath = `/uploads/${req.file.filename}`;
        
        res.json({
            success: true,
            data: {
                url: filePath,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/upload/avatar (user avatar upload)
router.post('/avatar', auth, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn file để tải lên.' });
        }

        // Return the relative path for the frontend to use
        const filePath = `/uploads/${req.file.filename}`;
        
        res.json({
            success: true,
            data: {
                url: filePath,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
