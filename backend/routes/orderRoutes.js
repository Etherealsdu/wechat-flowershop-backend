const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authenticateToken, authenticateUser, checkPermission } = require('../middleware/auth');
const { validate, orderValidationSchema, orderStatusUpdateSchema, orderCreateSchema } = require('../middleware/validation');

// 小程序用户路由
router.get('/my', authenticateUser, OrderController.getUserOrders);
router.post('/', authenticateUser, validate(orderCreateSchema), OrderController.createOrder);
router.get('/my/stats', authenticateUser, OrderController.getOrderStats);
router.get('/my/:id', authenticateUser, OrderController.getOrderById);
router.put('/my/:id/cancel', authenticateUser, OrderController.cancelOrder);
router.put('/my/:id/confirm', authenticateUser, OrderController.confirmReceipt);

// 管理员路由
router.get('/', authenticateToken, OrderController.getOrders);
router.get('/stats', authenticateToken, OrderController.getOrderStats);
router.get('/amount-stats', authenticateToken, OrderController.getOrderAmountStats);
router.get('/:id', authenticateToken, OrderController.getOrderById);
router.put('/:id', authenticateToken, checkPermission('manage_orders'), validate(orderValidationSchema), OrderController.updateOrder);
router.put('/:id/status', authenticateToken, checkPermission('manage_orders'), validate(orderStatusUpdateSchema), OrderController.updateOrderStatus);
router.put('/:id/cancel', authenticateToken, checkPermission('manage_orders'), OrderController.cancelOrder);
router.delete('/:id', authenticateToken, checkPermission('manage_orders'), OrderController.deleteOrder);

module.exports = router;
