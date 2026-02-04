const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { validate, categoryValidationSchema } = require('../middleware/validation');

// 分类相关路由
router.get('/categories', authenticateToken, CategoryController.getCategories);
router.get('/categories/:id', authenticateToken, CategoryController.getCategoryById);
router.get('/categories/tree', authenticateToken, CategoryController.getCategoryTree);
router.post('/categories', authenticateToken, checkPermission('manage_categories'), validate(categoryValidationSchema), CategoryController.createCategory);
router.put('/categories/:id', authenticateToken, checkPermission('manage_categories'), validate(categoryValidationSchema), CategoryController.updateCategory);
router.delete('/categories/:id', authenticateToken, checkPermission('manage_categories'), CategoryController.deleteCategory);

module.exports = router;