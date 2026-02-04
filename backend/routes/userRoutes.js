const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticateToken, authenticateUser, checkPermission } = require('../middleware/auth');

// 小程序用户路由（需要用户认证）
router.get('/profile', authenticateUser, UserController.getProfile);
router.put('/profile', authenticateUser, UserController.updateProfile);

// 管理员路由（需要管理员认证）
router.get('/', authenticateToken, UserController.getUsers);
router.get('/stats', authenticateToken, UserController.getUserStats);
router.get('/:id', authenticateToken, UserController.getUserById);
router.put('/:id', authenticateToken, checkPermission('manage_users'), UserController.updateUser);
router.delete('/:id', authenticateToken, checkPermission('manage_users'), UserController.deleteUser);

module.exports = router;
