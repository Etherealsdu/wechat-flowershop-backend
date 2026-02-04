const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { validate, productValidationSchema, categoryValidationSchema } = require('../middleware/validation');

// 产品相关路由
router.get('/products', authenticateToken, ProductController.getProducts);
router.get('/products/:id', authenticateToken, ProductController.getProductById);
router.post('/products', authenticateToken, checkPermission('manage_products'), validate(productValidationSchema), ProductController.createProduct);
router.put('/products/:id', authenticateToken, checkPermission('manage_products'), validate(productValidationSchema), ProductController.updateProduct);
router.delete('/products/:id', authenticateToken, checkPermission('manage_products'), ProductController.deleteProduct);

module.exports = router;