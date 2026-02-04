const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// 用户相关路由
router.get('/users', authenticateToken, UserController.getUsers);
router.get('/users/:id', authenticateToken, UserController.getUserById);
router.put('/users/:id', authenticateToken, checkPermission('manage_users'), UserController.updateUser);
router.delete('/users/:id', authenticateToken, checkPermission('manage_users'), UserController.deleteUser);

module.exports = router;