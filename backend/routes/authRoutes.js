const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// 微信登录
router.post('/wx-login', AuthController.wxLogin);

// 刷新token
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;
