import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import Order from '../models/Order.js';

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role && role !== 'all') filter.role = role;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean();

    // Attach order count per user
    const enriched = await Promise.all(users.map(async (u) => {
      const orderCount = await Order.countDocuments({ user: u._id });
      const totalSpent = await Order.aggregate([
        { $match: { user: u._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]);
      return { ...u, orderCount, totalSpent: totalSpent[0]?.total || 0 };
    }));

    res.json({ success: true, data: { users: enriched, pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit) } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(10).lean();
    res.json({ success: true, data: { ...user, recentOrders: orders } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id/role
export const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ success: false, message: 'Role phải là "user" hoặc "admin".' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // ⚠️ CONSTRAINT: Cannot demote yourself
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự hạ quyền của chính mình.' });
    }

    // ⚠️ CONSTRAINT: Cannot demote last admin
    if (user.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Không thể hạ quyền admin cuối cùng. Hệ thống cần ít nhất 1 admin.' });
      }
    }

    user.role = role;
    await user.save();
    res.json({ success: true, message: `Đã cập nhật role thành "${role}".`, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/users/:id/toggle-active
export const toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // ⚠️ CONSTRAINT: Cannot deactivate yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Bạn không thể vô hiệu hóa tài khoản của chính mình.' });
    }

    // ⚠️ CONSTRAINT: Cannot deactivate last admin
    if (user.role === 'admin' && user.isActive) {
      const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdmins <= 1) {
        return res.status(400).json({ success: false, message: 'Không thể vô hiệu hóa admin cuối cùng.' });
      }
    }

    // ⚠️ CONSTRAINT: Cannot deactivate user with pending orders
    if (user.isActive) {
      const pendingOrders = await Order.countDocuments({ user: user._id, status: { $in: ['pending', 'confirmed', 'shipping'] } });
      if (pendingOrders > 0) {
        return res.status(400).json({ success: false, message: `User này còn ${pendingOrders} đơn hàng chưa hoàn tất. Hãy xử lý đơn hàng trước.` });
      }
    }

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: user.isActive ? 'Tài khoản đã được kích hoạt.' : 'Tài khoản đã bị vô hiệu hóa.', data: { isActive: user.isActive } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/dashboard
export const getDashboard = async (req, res) => {
  try {
    const Product = (await import('../models/Product.js')).default;
    const Category = (await import('../models/Category.js')).default;

    const { range, date, month } = req.query;

    // Filter logic
    const filter = {};
    const prevFilter = {};
    let isSingleDay = false;

    if (month) {
      const d = new Date(month + '-01');
      const dEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      filter.createdAt = { $gte: d, $lt: dEnd };
      const prevD = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      prevFilter.createdAt = { $gte: prevD, $lt: d };
    } else if (date) {
      isSingleDay = true;
      const d = new Date(date);
      const dEnd = new Date(date);
      dEnd.setDate(dEnd.getDate() + 1);
      filter.createdAt = { $gte: d, $lt: dEnd };
      const prevD = new Date(date);
      prevD.setDate(prevD.getDate() - 1);
      prevFilter.createdAt = { $gte: prevD, $lt: d };
    } else if (range === 'all') {
      // no date filter
    } else { // default 30days
      const d = new Date(); d.setDate(d.getDate() - 30);
      filter.createdAt = { $gte: d };
      const prevD = new Date(d);
      prevD.setDate(prevD.getDate() - 30);
      prevFilter.createdAt = { $gte: prevD, $lt: d };
    }

    const [totalUsers, totalProducts, totalCategories, activeUsers] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
    ]);

    // Current period revenue & orders
    const currentStats = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, ...filter } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);
    const totalRevenue = currentStats[0]?.total || 0;
    const totalOrders = currentStats[0]?.count || 0;

    // Previous period revenue & orders
    const prevStats = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, ...prevFilter } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);
    const prevTotalRevenue = prevStats[0]?.total || 0;
    const prevTotalOrders = prevStats[0]?.count || 0;

    const revenueGrowth = prevTotalRevenue ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue * 100).toFixed(1) : (totalRevenue ? 100 : 0);
    const ordersGrowth = prevTotalOrders ? ((totalOrders - prevTotalOrders) / prevTotalOrders * 100).toFixed(1) : (totalOrders ? 100 : 0);

    // Revenue Chart data
    let revenueChartRaw = [];
    if (isSingleDay) { // Group by hour
      revenueChartRaw = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, ...filter } },
        {
          $group: {
            _id: { hour: { $hour: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          }
        },
        { $sort: { '_id.hour': 1 } }
      ]);
      revenueChartRaw = revenueChartRaw.map(item => ({
        name: `${item._id.hour}:00`,
        revenue: item.revenue,
        orders: item.orders,
      }));
    } else { // Group by day (or month if needed, but day is fine for up to few months)
      revenueChartRaw = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, ...filter } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      revenueChartRaw = revenueChartRaw.map(item => ({
        name: `${monthNames[item._id.month - 1]} ${item._id.day}`,
        revenue: item.revenue,
        orders: item.orders,
      }));
    }

    // Orders by Status
    const ordersByStatus = await Order.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top Selling Products (Order.items)
    const topSellersAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, ...filter } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, sold: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);
    const topSellersPopulated = await Product.populate(topSellersAgg, { path: '_id', select: 'name slug price thumbnail rating reviewCount' });
    const topSellers = topSellersPopulated.map(item => ({
      product: item._id,
      revenue: item.revenue,
      sold: item.sold
    }));

    // Revenue By Category
    const revenueByCategoryAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, ...filter } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDoc' } },
      { $unwind: '$productDoc' },
      { $group: { _id: '$productDoc.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, sold: { $sum: '$items.quantity' } } },
    ]);
    const categoriesList = await Category.find().select('name').lean();
    const catMap = {};
    categoriesList.forEach(c => { catMap[c._id.toString()] = c.name; });
    const revenueByCategory = revenueByCategoryAgg.map(item => ({
      category: catMap[item._id?.toString()] || 'Unknown',
      revenue: item.revenue,
      sold: item.sold
    })).sort((a, b) => b.revenue - a.revenue);

    const recentOrders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const lowStockProducts = await Product
      .find({ isActive: true, stock: { $lte: 10 } })
      .select('name slug stock thumbnail price')
      .sort({ stock: 1 })
      .limit(10)
      .lean();

    // ── Price Range Distribution (pie chart) ──
    const priceRanges = await Product.aggregate([
      { $match: { isActive: true } },
      { $bucket: { groupBy: '$price', boundaries: [0, 300, 500, 1000, 1500, 2000, 99999], default: 'Other', output: { count: { $sum: 1 } } } },
    ]);
    const priceLabels = { 0: '$0–299', 300: '$300–499', 500: '$500–999', 1000: '$1000–1499', 1500: '$1500–1999', 2000: '$2000+' };
    const priceDistribution = priceRanges.map(r => ({ range: priceLabels[r._id] || `$${r._id}+`, count: r.count }));

    // ── Stock Overview ──
    const stockOverview = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalStock: { $sum: '$stock' }, avgStock: { $avg: '$stock' }, minStock: { $min: '$stock' }, maxStock: { $max: '$stock' } } },
    ]);

    const featuredCount = await Product.countDocuments({ isActive: true, isFeatured: true });
    const newCount = await Product.countDocuments({ isActive: true, isNewProduct: true });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalCategories,
        activeUsers,
        totalRevenue,
        revenueGrowth,
        totalOrders,
        ordersGrowth,
        revenueChartData: revenueChartRaw,
        ordersByStatus,
        recentOrders,
        lowStockProducts,
        revenueByCategory,
        priceDistribution,
        stockOverview: stockOverview[0] || { totalStock: 0, avgStock: 0, minStock: 0, maxStock: 0 },
        topSellers,
        featuredCount,
        newCount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/reports/export
export const exportReport = async (req, res) => {
  try {
    const Product = (await import('../models/Product.js')).default;
    const { range, date, month } = req.query; // 'all', '30days', '7days', specific date 'YYYY-MM-DD', or specific month 'YYYY-MM'
    const filter = {};
    let periodLabel = '30 ngày qua';

    if (month) {
      const d = new Date(month + '-01');
      const dEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      filter.createdAt = { $gte: d, $lt: dEnd };
      periodLabel = `Tháng: ${month}`;
    } else if (date) {
      const d = new Date(date);
      const dEnd = new Date(date);
      dEnd.setDate(dEnd.getDate() + 1);
      filter.createdAt = { $gte: d, $lt: dEnd };
      periodLabel = `Ngày: ${date}`;
    } else if (range === 'all') {
      periodLabel = 'Toàn thời gian';
    } else if (range === '7days') {
      const d = new Date(); d.setDate(d.getDate() - 7);
      filter.createdAt = { $gte: d };
      periodLabel = '7 ngày qua';
    } else { // default 30days
      const d = new Date(); d.setDate(d.getDate() - 30);
      filter.createdAt = { $gte: d };
      periodLabel = '30 ngày qua';
    }

    // 1. Calculate Summary Stats
    const statsAgg = await Order.aggregate([
      { $match: filter },
      { $group: { 
          _id: null, 
          totalOrders: { $sum: 1 },
          successfulRevenue: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$total', 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          cancelledRevenue: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, '$total', 0] } }
        } 
      }
    ]);
    const stats = statsAgg[0] || { totalOrders: 0, successfulRevenue: 0, cancelledOrders: 0, cancelledRevenue: 0 };

    // 2. Top Selling Products
    const topSellersAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, ...filter } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, sold: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);
    const topSellersPopulated = await Product.populate(topSellersAgg, { path: '_id', select: 'name' });

    // 3. Raw Orders Data
    const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).lean();

    // ── Build CSV String ──
    let csvContent = `--- BÁO CÁO KINH DOANH ---\n`;
    csvContent += `Kỳ báo cáo:,${periodLabel}\n`;
    csvContent += `Thời điểm xuất:,${new Date().toLocaleString()}\n\n`;

    csvContent += `--- TÓM TẮT VẬN HÀNH (EXECUTIVE SUMMARY) ---\n`;
    csvContent += `Tổng số đơn hàng:,${stats.totalOrders}\n`;
    csvContent += `Doanh thu thực tế (Thành công):,${stats.successfulRevenue}\n`;
    csvContent += `Số đơn bị hủy:,${stats.cancelledOrders}\n`;
    csvContent += `Doanh thu thất thoát (Bị hủy):,${stats.cancelledRevenue}\n\n`;

    csvContent += `--- TOP 5 SẢN PHẨM BÁN CHẠY NHẤT ---\n`;
    csvContent += `Xếp hạng,Tên sản phẩm,Số lượng bán,Doanh thu mang lại ($)\n`;
    if (topSellersPopulated.length === 0) {
      csvContent += `-,-,0,0\n`;
    } else {
      topSellersPopulated.forEach((item, index) => {
        csvContent += `${index + 1},"${item._id?.name || 'Không xác định'}",${item.sold},${item.revenue}\n`;
      });
    }
    csvContent += `\n`;

    csvContent += `--- DỮ LIỆU ĐƠN HÀNG CHI TIẾT ---\n`;
    csvContent += `Mã đơn hàng,Ngày đặt,Tên khách hàng,Email khách hàng,Trạng thái,Chi tiết mặt hàng,Tổng tiền ($)\n`;
    if (orders.length === 0) {
      csvContent += `Không có đơn hàng nào trong khoảng thời gian này.\n`;
    } else {
      orders.forEach(o => {
        const itemsStr = o.items.map(i => `${i.name} (x${i.quantity})`).join('; ');
        
        let translatedStatus = o.status;
        if (o.status === 'pending') translatedStatus = 'Chờ xử lý';
        else if (o.status === 'confirmed') translatedStatus = 'Đã xác nhận';
        else if (o.status === 'shipping') translatedStatus = 'Đang giao';
        else if (o.status === 'delivered') translatedStatus = 'Đã giao';
        else if (o.status === 'cancelled') translatedStatus = 'Đã hủy';

        csvContent += [
          `"${o.orderNumber}"`,
          `"${new Date(o.createdAt).toLocaleString()}"`,
          `"${o.user?.name || 'Khách vãng lai'}"`,
          `"${o.user?.email || 'Trống'}"`,
          `"${translatedStatus}"`,
          `"${itemsStr}"`,
          o.total
        ].join(',') + '\n';
      });
    }

    // ── Save to local folder ──
    try {
      const rootPath = path.resolve(process.cwd(), '..');
      const excelDir = path.join(rootPath, 'excel');
      if (!fs.existsSync(excelDir)) {
        fs.mkdirSync(excelDir, { recursive: true });
      }
      
      const fileName = `BaoCao_${periodLabel.replace(/[: /]/g, '_')}_${new Date().getTime()}.csv`;
      const fullPath = path.join(excelDir, fileName);
      fs.writeFileSync(fullPath, '\uFEFF' + csvContent);
      console.log(`Report archived locally: ${fullPath}`);
    } catch (saveErr) {
      console.error('Failed to save local report copy:', saveErr);
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="BaoCaoKinhDoanh_${periodLabel.replace(/ /g, '_')}.csv"`);
    res.status(200).send('\uFEFF' + csvContent); // uFEFF helps Excel recognize UTF-8 chars automatically
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
