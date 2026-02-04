const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { validate, orderValidationSchema, orderStatusUpdateSchema } = require('../middleware/validation');

// 订单相关路由
router.get('/orders', authenticateToken, OrderController.getOrders);
router.get('/orders/:id', authenticateToken, OrderController.getOrderById);
router.put('/orders/:id', authenticateToken, checkPermission('manage_orders'), validate(orderValidationSchema), OrderController.updateOrder);
router.put('/orders/:id/status', authenticateToken, checkPermission('manage_orders'), validate(orderStatusUpdateSchema), OrderController.updateOrderStatus);
router.delete('/orders/:id', authenticateToken, checkPermission('manage_orders'), OrderController.deleteOrder);
router.get('/orders/stats', authenticateToken, OrderController.getOrderStats);

module.exports = router;