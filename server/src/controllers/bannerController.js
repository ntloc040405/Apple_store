import Banner from '../models/Banner.js';

// GET /api/banners
export const getAll = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 }).lean();
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/banners (admin)
export const create = async (req, res) => {
  try {
    const { title, subtitle, image, bgColor, type, order } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }
    
    // Validate color format (hex color)
    if (bgColor && !/^#[0-9a-fA-F]{6}$/.test(bgColor)) {
      return res.status(400).json({ success: false, message: 'Invalid color format. Use hex color (e.g., #FF5733).' });
    }
    
    // Validate type
    if (type && !['main', 'secondary', 'promo', 'featured'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid banner type.' });
    }
    
    const banner = await Banner.create({
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      image,
      bgColor,
      type: type || 'main',
      order: order || 0
    });
    
    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/banners/:id (admin)
export const update = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found.' });
    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/banners/:id (admin)
export const remove = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
