import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// ════════════════════════════════════════════
// VALID STATUS TRANSITIONS (state machine)
// ════════════════════════════════════════════
const VALID_TRANSITIONS = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping:  ['delivered'],
  delivered: [],           // final state — cannot change
  cancelled: [],           // final state — cannot change
};

// ════════════════════════════════════════════
// USER ENDPOINTS
// ════════════════════════════════════════════

// POST /api/orders with situational MongoDB transaction (supports both standalone & replica sets)
export const createOrder = async (req, res) => {
  let session = null;
  let useTransaction = false;
  
  try {
    // ⚠️ Detect if the MongoDB cluster supports transactions (ReplicaSet or Sharded)
    const client = mongoose.connection.getClient();
    const topologyType = client.topology?.description?.type || '';
    const isReplicaSet = topologyType.includes('ReplicaSet') || topologyType.includes('Sharded');

    if (isReplicaSet) {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    } else {
      console.warn('[DB] Standalone MongoDB detected. Transactions disabled for this order.');
    }
  } catch (sessErr) {
    console.warn('[DB] Failed to initialize session/transaction subsystem:', sessErr.message);
    session = null;
    useTransaction = false;
  }

  try {
    const { shippingAddress, paymentMethod = 'cod', shippingMethod = 'standard', note = '' } = req.body;
    let orderItems = [];

    // ── Source 1: Items from request body (localStorage cart) ──
    if (req.body.items && req.body.items.length > 0) {
      for (const item of req.body.items) {
        // Query product - ONLY use session if we are actually in a transaction
        const query = Product.findById(item.product).select('name slug thumbnail price salePrice stock isActive');
        const product = await (useTransaction ? query.session(session) : query);

        if (!product) {
          if (useTransaction) await session.abortTransaction();
          return res.status(400).json({ success: false, message: `Product not found: ${item.product}` });
        }
        if (!product.isActive) {
          if (useTransaction) await session.abortTransaction();
          return res.status(400).json({ success: false, message: `"${product.name}" is no longer available.` });
        }
        if (product.stock < item.quantity) {
          if (useTransaction) await session.abortTransaction();
          return res.status(400).json({ success: false, message: `"${product.name}" only has ${product.stock} left (you requested ${item.quantity}).` });
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          thumbnail: product.thumbnail,
          color: item.color || null,
          storage: item.storage || null,
          quantity: item.quantity,
          price: item.price || product.salePrice || product.price,
        });
      }
    }
    // ── Source 2: Cart from DB ──
    else {
      const query = Cart.findOne({ user: req.user._id }).populate('items.product', 'name slug thumbnail price stock isActive');
      const cart = await (useTransaction ? query.session(session) : query);

      if (!cart || cart.items.length === 0) {
        if (useTransaction) await session.abortTransaction();
        return res.status(400).json({ success: false, message: 'Cart is empty.' });
      }
      for (const item of cart.items) {
        if (!item.product) {
          if (useTransaction) await session.abortTransaction();
          return res.status(400).json({ success: false, message: 'A product in your cart has been removed.' });
        }
        if (!item.product.isActive) {
          if (useTransaction) await session.abortTransaction();
          return res.status(400).json({ success: false, message: `"${item.product.name}" is no longer available.` });
        }
        
        const freshQuery = Product.findById(item.product._id).select('stock name');
        const fresh = await (useTransaction ? freshQuery.session(session) : freshQuery);

        if (fresh.stock < item.quantity) {
          if (useTransaction) await session.abortTransaction();
          return res.status(400).json({ success: false, message: `"${fresh.name}" only has ${fresh.stock} left.` });
        }
        orderItems.push({
          product: item.product._id, name: item.product.name, thumbnail: item.product.thumbnail,
          color: item.color, storage: item.storage, quantity: item.quantity, price: item.price,
        });
      }
    }

    if (orderItems.length === 0) {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'No items to order.' });
    }

    // ⚠️ Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName?.trim() || !shippingAddress.phone?.trim() || !shippingAddress.street?.trim() || !shippingAddress.city?.trim()) {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Please fill in all required shipping fields (name, phone, address, city).' });
    }

    // ⚠️ Validate payment method
    if (!['credit_card', 'apple_pay', 'cod', 'bank_transfer'].includes(paymentMethod)) {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Invalid payment method.' });
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingFee = shippingMethod === 'express' ? 15 : 0;
    const tax = Math.round(subtotal * 0.09 * 100) / 100;
    const total = Math.round((subtotal + shippingFee + tax) * 100) / 100;

    const orderData = {
      user: req.user._id, items: orderItems, shippingAddress, paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      shippingMethod: shippingMethod || 'standard', subtotal, shippingFee, tax, total, note,
    };
    
    // Create order - mongoose handled differently if we use array vs object
    let order;
    if (useTransaction) {
      const created = await Order.create([orderData], { session });
      order = created[0];
    } else {
      order = await Order.create(orderData);
    }

    // Decrease stock atomically for ALL items
    for (const item of orderItems) {
      const updateQuery = { _id: item.product, stock: { $gte: item.quantity } };
      const updateData = { $inc: { stock: -item.quantity } };
      const options = { new: true };
      if (useTransaction) options.session = session;

      const result = await Product.findOneAndUpdate(updateQuery, updateData, options);

      if (!result) {
        if (useTransaction) await session.abortTransaction();
        return res.status(400).json({ success: false, message: `"${item.name}" stock verification failed. Please try again.` });
      }
    }

    // Clear DB cart if it was used
    if (!req.body.items) {
      const cartQuery = Cart.findOne({ user: req.user._id });
      const cart = await (useTransaction ? cartQuery.session(session) : cartQuery);
      if (cart) {
        cart.items = [];
        await (useTransaction ? cart.save({ session }) : cart.save());
      }
    }

    // Commit transaction if it exists
    if (useTransaction) await session.commitTransaction();

    // Emit real-time event to all connected admin clients
    if (globalThis.io) {
      globalThis.io.emit('NEW_ORDER', {
        _id: order._id,
        orderNumber: order.orderNumber,
        user: { _id: req.user._id, name: req.user.name, email: req.user.email },
        total: order.total,
        status: order.status,
        items: orderItems,
        shippingAddress: shippingAddress,
        createdAt: order.createdAt,
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Đặt hàng thành công!', 
      data: { 
        orderNumber: order.orderNumber, 
        _id: order._id, 
        total: order.total, 
        status: order.status, 
        createdAt: order.createdAt 
      } 
    });
  } catch (err) {
    if (useTransaction) await session.abortTransaction();
    console.error('[Order] Critical error during creation:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (session) await session.endSession();
  }
};

// GET /api/orders/my
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status && status !== 'all') filter.status = status;
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean();
    res.json({ success: true, data: { orders, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    // Regular users can only see their own orders
    if (req.user.role !== 'admin') filter.user = req.user._id;
    const order = await Order.findOne(filter).populate('user', 'name email phone').lean();
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại.' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/cancel (user)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại.' });

    // ⚠️ CONSTRAINT: Can only cancel if pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy đơn hàng ở trạng thái "${order.status}". Chỉ hủy được khi đang "Chờ xử lý" hoặc "Đã xác nhận".`,
      });
    }

    order.status = 'cancelled';
    await order.save();

    // Restock (atomic)
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    res.json({ success: true, message: 'Đã hủy đơn hàng thành công.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════
// ADMIN ENDPOINTS
// ════════════════════════════════════════════

// GET /api/orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, startDate, endDate } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) filter.orderNumber = { $regex: search, $options: 'i' };

    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean();

    // Summary stats
    const stats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
    ]);

    res.json({ success: true, data: { orders, stats, pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit) } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/status (admin)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Trạng thái mới là bắt buộc.' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại.' });

    // ⚠️ CONSTRAINT: Validate status transition
    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Không thể chuyển từ "${order.status}" sang "${status}". Trạng thái hợp lệ tiếp theo: ${allowed.length ? allowed.join(', ') : 'không có (trạng thái cuối)'}`,
      });
    }

    const oldStatus = order.status;
    order.status = status;

    // ⚠️ Auto-update payment status when delivering COD orders
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }

    // ⚠️ If admin cancels, restock products
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    await order.save();

    // Emit real-time event to all connected admin clients
    if (globalThis.io) {
      globalThis.io.emit('ORDER_STATUS_UPDATED', {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        updatedAt: order.updatedAt,
      });
    }

    res.json({ success: true, message: `Đơn hàng đã chuyển sang "${status}".`, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/admin/stats (admin)
export const getStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const byStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
    ]);
    const recentOrders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5).lean();

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        byStatus,
        recentOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
