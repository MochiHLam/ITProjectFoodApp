const Order = require('../models/Order');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const { emitToUser } = require('../services/realtime');

// Create new order
exports.createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, deliveryAddress, paymentMethod, notes } = req.body;
    const userId = req.user.id;

    // Validate products exist and get current prices
    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'Some products not found' });
    }

    // Create order items with current prices
    const orderItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.product);
      return {
        product: item.product,
        quantity: item.quantity,
        price: product.price
      };
    });

    const order = new Order({
      user: userId,
      items: orderItems,
      deliveryAddress,
      paymentMethod,
      notes
    });

    await order.save();
    await order.populate('items.product', 'name images');

    // Realtime: notify user of new order
    emitToUser(userId, 'order:created', { order });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// Get user's orders
exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    next(err);
  }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.product', 'name images price description');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Realtime: notify order owner if available
    if (order.user) {
      emitToUser(order.user.toString(), 'order:updated', { order });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }

    order.status = 'cancelled';
    await order.save();

    // Realtime: notify user of cancellation
    emitToUser(userId, 'order:cancelled', { order });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, user } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (user) query.user = user;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    next(err);
  }
};
