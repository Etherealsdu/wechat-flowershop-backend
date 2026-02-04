const jwt = require('jsonwebtoken');
const config = require('../config/config');
const AdminUser = require('../models/AdminUser');

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const adminUser = await AdminUser.findByPk(decoded.id);
    
    if (!adminUser || !adminUser.is_active) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    req.adminUser = adminUser;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// 权限检查中间件
const checkPermission = (permission) => {
  return (req, res, next) => {
    // 这里可以根据角色或权限进行更复杂的检查
    // 简单示例：只允许管理员操作
    if (req.adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  checkPermission
};