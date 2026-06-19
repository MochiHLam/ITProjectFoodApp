const { Router } = require('express');
const { body } = require('express-validator');
const { authenticateJWT, authorizeRoles, validateUserExists } = require('../middlewares/auth');
const { checkBusinessHours } = require('../middlewares/businessHours');
const orderController = require('../controllers/orderController');

const router = Router();

// User routes - with user validation
router.post(
  '/',
  authenticateJWT,
  validateUserExists,
  checkBusinessHours,
  [
    body('items').isArray({ min: 1 }).withMessage('Items array is required'),
    body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('deliveryAddress.street').notEmpty().withMessage('Street is required'),
    body('deliveryAddress.city').notEmpty().withMessage('City is required'),
    body('deliveryAddress.postalCode').notEmpty().withMessage('Postal code is required'),
    body('deliveryAddress.phone').notEmpty().withMessage('Phone is required'),
    body('paymentMethod').optional().isIn(['cash', 'card', 'online']).withMessage('Invalid payment method'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
  ],
  orderController.createOrder
);

router.get(
  '/my-orders',
  authenticateJWT,
  validateUserExists,
  orderController.getUserOrders
);

router.get(
  '/:id',
  authenticateJWT,
  validateUserExists,
  orderController.getOrderById
);

router.patch(
  '/:id/cancel',
  authenticateJWT,
  validateUserExists,
  orderController.cancelOrder
);

// Admin routes
router.get(
  '/',
  authenticateJWT,
  authorizeRoles('admin'),
  orderController.getAllOrders
);

router.patch(
  '/:id/status',
  authenticateJWT,
  authorizeRoles('admin'),
  [
    body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
      .withMessage('Invalid status')
  ],
  orderController.updateOrderStatus
);

// Admin cancel order (changes status, doesn't delete)
router.patch(
  '/:id/admin-cancel',
  authenticateJWT,
  authorizeRoles('admin'),
  orderController.adminCancelOrder
);

module.exports = router;
