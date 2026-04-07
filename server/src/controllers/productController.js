import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import { validatePagination, validateString, escapeRegex } from '../utils/validators.js';

// ════════════════════════════════════════════
// VALIDATION HELPERS
// ════════════════════════════════════════════
const validateProduct = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate) {
    if (!data.name?.trim()) errors.push('Tên sản phẩm là bắt buộc.');
    if (!data.slug?.trim()) errors.push('Slug là bắt buộc.');
    if (!data.category) errors.push('Danh mục là bắt buộc.');
    if (data.price == null) errors.push('Giá là bắt buộc.');
  }

  // Price constraints
  if (data.price != null && (typeof data.price !== 'number' || data.price <= 0)) {
    errors.push('Giá sản phẩm phải lớn hơn 0.');
  }
  if (data.salePrice != null && data.salePrice !== null) {
    if (typeof data.salePrice !== 'number' || data.salePrice <= 0) errors.push('Giá sale phải lớn hơn 0.');
    if (data.price && data.salePrice >= data.price) errors.push('Giá sale phải nhỏ hơn giá gốc.');
  }
  if (data.monthlyPrice != null && data.monthlyPrice !== null) {
    if (typeof data.monthlyPrice !== 'number' || data.monthlyPrice <= 0) errors.push('Giá trả góp phải lớn hơn 0.');
  }

  // Stock constraint — NEVER negative
  if (data.stock != null && (typeof data.stock !== 'number' || data.stock < 0)) {
    errors.push('Số lượng tồn kho không được âm.');
  }

  // Storage priceAdd >= 0
  if (data.storageOptions?.length) {
    data.storageOptions.forEach((opt, i) => {
      if (!opt.capacity?.trim()) errors.push(`Storage option ${i + 1}: capacity là bắt buộc.`);
      if (opt.priceAdd != null && opt.priceAdd < 0) errors.push(`Storage option ${i + 1}: phụ thu không được âm.`);
    });
  }

  // Colors validation
  if (data.colors?.length) {
    data.colors.forEach((c, i) => {
      if (!c.name?.trim()) errors.push(`Color ${i + 1}: tên màu là bắt buộc.`);
      if (!c.hex?.trim()) errors.push(`Color ${i + 1}: hex color là bắt buộc.`);
    });
  }

  return errors;
};

// ════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ════════════════════════════════════════════

// GET /api/products
export const getAll = async (req, res) => {
  try {
    const { category, subCategory, minPrice, maxPrice, color, storage, sort, page, limit, search } = req.query;
    const { page: validPage, limit: validLimit } = validatePagination(page, limit);
    
    const filter = { isActive: true };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
    if (subCategory) filter.subCategory = subCategory;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (color) filter['colors.name'] = { $regex: color, $options: 'i' };
    if (storage) filter['storageOptions.capacity'] = storage;
    if (search) filter.$text = { $search: search };

    const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, newest: { createdAt: -1 }, popular: { reviewCount: -1 }, rating: { rating: -1 } };
    const sortOpt = sortMap[sort] || { createdAt: -1 };

    const total = await Product.countDocuments(filter);
    const skip = (validPage - 1) * validLimit;
    const products = await Product.find(filter).populate('category', 'name slug').sort(sortOpt).skip(skip).limit(validLimit).lean();

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: validPage,
          limit: validLimit,
          totalPages: Math.ceil(total / validLimit),
          hasNext: skip + products.length < total,
          hasPrev: validPage > 1
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/featured
export const getFeatured = async (req, res) => {
  try {
    const highlights = await Product.find({ 
      $or: [
        { rating: { $gte: 4.8 } },
        { isFeatured: true }
      ],
      isActive: true 
    })
    .populate('category', 'name slug')
    .sort({ rating: -1, reviewCount: -1 })
    .limit(6)
    .lean();

    const newArrivals = await Product.find({ isNewProduct: true, isActive: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    res.json({ success: true, data: { highlights, newArrivals } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/search
export const search = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q || !q.trim()) return res.json({ success: true, data: { products: [], total: 0 } });
    
    // Validate and sanitize limit
    const validLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    
    // Escape regex to prevent ReDoS attacks and limit search query length
    const safeQuery = escapeRegex(q.trim()).slice(0, 100);
    
    const filter = {
      isActive: true,
      $or: [
        { name: { $regex: safeQuery, $options: 'i' } },
        { tagline: { $regex: safeQuery, $options: 'i' } },
        { description: { $regex: safeQuery, $options: 'i' } },
      ],
    };
    const products = await Product.find(filter).populate('category', 'name slug').limit(validLimit).lean();
    res.json({ success: true, data: { products, total: products.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Search failed. Please try again.' });
  }
};

// GET /api/products/suggestions?q=...
export const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, data: [] });
    
    const suggestions = await Product.find(
      { name: { $regex: q, $options: 'i' }, isActive: true },
      'name slug price thumbnail tagline category'
    ).populate('category', 'name').limit(8).lean();

    res.json({ success: true, data: suggestions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/compare?ids=id1,id2,id3
export const compare = async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (!ids.length) return res.status(400).json({ success: false, message: 'Provide product IDs.' });
    if (ids.length > 4) return res.status(400).json({ success: false, message: 'Chỉ được so sánh tối đa 4 sản phẩm.' });
    const products = await Product.find({ _id: { $in: ids }, isActive: true }).select('name slug thumbnail price specs highlights colors storageOptions').lean();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:slug
export const getBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug').lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/category/:categorySlug
export const getByCategory = async (req, res) => {
  try {
    const cat = await Category.findOne({ slug: req.params.categorySlug });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    const products = await Product.find({ category: cat._id, isActive: true }).populate('category', 'name slug').lean();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id/related
export const getRelated = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const related = await Product.find({ category: product.category, _id: { $ne: product._id }, isActive: true }).limit(4).lean();
    res.json({ success: true, data: related });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════
// ADMIN ENDPOINTS (with strict validation)
// ════════════════════════════════════════════

// POST /api/products (admin)
export const create = async (req, res) => {
  try {
    const errors = validateProduct(req.body, false);
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });

    // Check slug uniqueness
    const slugExists = await Product.findOne({ slug: req.body.slug });
    if (slugExists) return res.status(400).json({ success: false, message: 'Slug đã tồn tại, vui lòng chọn slug khác.' });

    // Check category exists
    const catExists = await Category.findById(req.body.category);
    if (!catExists) return res.status(400).json({ success: false, message: 'Danh mục không tồn tại.' });

    const product = await Product.create(req.body);

    // Emit real-time event
    if (globalThis.io) {
      globalThis.io.emit('PRODUCT_UPDATED', { type: 'create', product });
    }

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Slug sản phẩm đã tồn tại.' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id (admin)
export const update = async (req, res) => {
  try {
    const errors = validateProduct(req.body, true);
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // If changing slug, check uniqueness
    if (req.body.slug && req.body.slug !== product.slug) {
      const slugExists = await Product.findOne({ slug: req.body.slug, _id: { $ne: product._id } });
      if (slugExists) return res.status(400).json({ success: false, message: 'Slug đã tồn tại.' });
    }

    // If changing category, check it exists
    if (req.body.category && req.body.category.toString() !== product.category.toString()) {
      const catExists = await Category.findById(req.body.category);
      if (!catExists) return res.status(400).json({ success: false, message: 'Danh mục không tồn tại.' });
    }

    // ⚠️ Cannot set stock below 0
    if (req.body.stock != null && req.body.stock < 0) {
      return res.status(400).json({ success: false, message: 'Tồn kho không được âm.' });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // Emit real-time event
    if (globalThis.io) {
      globalThis.io.emit('PRODUCT_UPDATED', { type: 'update', product: updated });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Slug sản phẩm đã tồn tại.' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id (admin)
export const remove = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // ⚠️ CONSTRAINT: Cannot delete product if it has orders
    const orderCount = await Order.countDocuments({ 'items.product': product._id });
    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa sản phẩm này vì đã có ${orderCount} đơn hàng liên quan. Bạn chỉ có thể ẩn sản phẩm (đặt isActive = false).`,
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    // Emit real-time event
    if (globalThis.io) {
      globalThis.io.emit('PRODUCT_UPDATED', { type: 'delete', id: req.params.id });
    }

    res.json({ success: true, message: 'Sản phẩm đã được xóa.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id/toggle-active (admin) — soft delete alternative
export const toggleActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    product.isActive = !product.isActive;
    await product.save();

    // Emit real-time event
    if (globalThis.io) {
      globalThis.io.emit('PRODUCT_UPDATED', { type: 'toggle', product });
    }

    res.json({ success: true, message: product.isActive ? 'Sản phẩm đã được kích hoạt.' : 'Sản phẩm đã bị ẩn.', data: { isActive: product.isActive } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/admin/all (admin) — includes inactive products
export const adminGetAll = async (req, res) => {
  try {
    const { category, search, isActive, isFeatured, page = 1, limit = 20, sort = 'newest' } = req.query;
    const filter = {};

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { slug: { $regex: search, $options: 'i' } }];
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, newest: { createdAt: -1 }, oldest: { createdAt: 1 }, name_asc: { name: 1 }, stock_low: { stock: 1 } };
    const sortOpt = sortMap[sort] || { createdAt: -1 };

    const total = await Product.countDocuments(filter);
    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(filter).populate('category', 'name slug').sort(sortOpt).skip(skip).limit(Number(limit)).lean();

    res.json({
      success: true,
      data: { products, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
