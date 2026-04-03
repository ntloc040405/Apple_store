import Category from '../models/Category.js';
import Product from '../models/Product.js';

// ════════════════════════════════════════════
// VALIDATION
// ════════════════════════════════════════════
const validateCategory = (data, isUpdate = false) => {
  const errors = [];
  if (!isUpdate) {
    if (!data.name?.trim()) errors.push('Tên danh mục là bắt buộc.');
    if (!data.slug?.trim()) errors.push('Slug là bắt buộc.');
  }
  if (data.order != null && (typeof data.order !== 'number' || data.order < 0)) {
    errors.push('Thứ tự hiển thị phải >= 0.');
  }
  if (data.subCategories?.length) {
    data.subCategories.forEach((sub, i) => {
      if (!sub.name?.trim()) errors.push(`Sub-category ${i + 1}: tên là bắt buộc.`);
      if (!sub.slug?.trim()) errors.push(`Sub-category ${i + 1}: slug là bắt buộc.`);
    });
  }
  return errors;
};

// ════════════════════════════════════════════
// PUBLIC
// ════════════════════════════════════════════

// GET /api/categories
export const getAll = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/categories/:slug
export const getBySlug = async (req, res) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    const productCount = await Product.countDocuments({ category: cat._id, isActive: true });
    res.json({ success: true, data: { ...cat, productCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════════

// GET /api/categories/admin/all — includes inactive
export const adminGetAll = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 }).lean();
    // Attach product count per category
    const enriched = await Promise.all(categories.map(async (cat) => {
      const productCount = await Product.countDocuments({ category: cat._id });
      return { ...cat, productCount };
    }));
    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/categories (admin)
export const create = async (req, res) => {
  try {
    const errors = validateCategory(req.body, false);
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });

    // Check slug uniqueness
    const exists = await Category.findOne({ slug: req.body.slug });
    if (exists) return res.status(400).json({ success: false, message: 'Slug danh mục đã tồn tại.' });

    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Slug danh mục đã tồn tại.' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/categories/:id (admin)
export const update = async (req, res) => {
  try {
    const errors = validateCategory(req.body, true);
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });

    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });

    // If changing slug, check uniqueness
    if (req.body.slug && req.body.slug !== cat.slug) {
      const slugExists = await Category.findOne({ slug: req.body.slug, _id: { $ne: cat._id } });
      if (slugExists) return res.status(400).json({ success: false, message: 'Slug đã tồn tại.' });
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Slug danh mục đã tồn tại.' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/categories/:id (admin)
export const remove = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });

    // ⚠️ CONSTRAINT: Cannot delete category if it has products
    const productCount = await Product.countDocuments({ category: cat._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục "${cat.name}" vì còn ${productCount} sản phẩm thuộc danh mục này. Hãy chuyển hoặc xóa sản phẩm trước.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Danh mục đã được xóa.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/categories/:id/toggle-active (admin)
export const toggleActive = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });

    // ⚠️ CONSTRAINT: Cannot deactivate category with active products
    if (cat.isActive) {
      const activeProducts = await Product.countDocuments({ category: cat._id, isActive: true });
      if (activeProducts > 0) {
        return res.status(400).json({
          success: false,
          message: `Không thể ẩn danh mục này vì còn ${activeProducts} sản phẩm đang hoạt động. Hãy ẩn sản phẩm trước.`,
        });
      }
    }

    cat.isActive = !cat.isActive;
    await cat.save();
    res.json({ success: true, message: cat.isActive ? 'Danh mục đã được kích hoạt.' : 'Danh mục đã bị ẩn.', data: { isActive: cat.isActive } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
