import Blog from '../models/Blog.js';

// GET /api/blogs
export const getAll = async (req, res) => {
  try {
    const { isFeatured, limit = 8, category } = req.query;
    const filter = { isActive: true };

    if (isFeatured) filter.isFeatured = isFeatured === 'true';
    if (category) filter.category = category;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({ success: true, data: blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/blogs/:slug
export const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, isActive: true }).lean();
    if (!blog) return res.status(404).json({ success: false, message: 'Bài viết không tồn tại.' });
    
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
