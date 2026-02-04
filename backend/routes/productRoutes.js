const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { authenticateToken, checkPermission, optionalAuthenticateUser } = require('../middleware/auth');
const { validate, productValidationSchema } = require('../middleware/validation');

// 公开路由（无需认证或可选认证）
router.get('/', optionalAuthenticateUser, ProductController.getProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/new', ProductController.getNewProducts);
router.get('/hot', ProductController.getHotProducts);
router.get('/search', ProductController.searchProducts);
router.get('/category/:categoryId', ProductController.getProductsByCategory);
router.get('/:id', optionalAuthenticateUser, ProductController.getProductById);

// 管理员路由（需要管理员认证和权限）
router.post('/', authenticateToken, checkPermission('manage_products'), validate(productValidationSchema), ProductController.createProduct);
router.put('/batch-status', authenticateToken, checkPermission('manage_products'), ProductController.batchUpdateStatus);
router.put('/:id', authenticateToken, checkPermission('manage_products'), ProductController.updateProduct);
router.put('/:id/stock', authenticateToken, checkPermission('manage_products'), ProductController.updateStock);
router.delete('/:id', authenticateToken, checkPermission('manage_products'), ProductController.deleteProduct);

module.exports = router;
