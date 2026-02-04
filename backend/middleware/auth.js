const jwt = require('jsonwebtoken');
const config = require('../config/config');
const AdminUser = require('../models/AdminUser');
const User = require('../models/User');

// 管理员JWT认证中间件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // 检查是否是管理员token
    if (decoded.type && decoded.type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const adminUser = await AdminUser.findByPk(decoded.id);

    if (!adminUser || !adminUser.is_active) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.adminUser = adminUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired.' });
    }
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// 小程序用户JWT认证中间件
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // 检查是否是用户token
    if (decoded.type !== 'user') {
      return res.status(403).json({ error: 'User access required.' });
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired.' });
    }
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// 可选用户认证（用于公开接口但需要用户信息的场景）
const optionalAuthenticateUser = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    if (decoded.type === 'user') {
      const user = await User.findByPk(decoded.id);
      req.user = user || null;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// 权限检查中间件（管理员权限）
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // 超级管理员拥有所有权限
    if (req.adminUser.role === 'admin' || req.adminUser.role === 'superadmin') {
      return next();
    }

    // 基于角色的权限检查
    const rolePermissions = {
      staff: ['manage_orders', 'view_products', 'view_categories'],
      editor: ['manage_products', 'manage_categories', 'manage_banners'],
      admin: ['manage_users', 'manage_products', 'manage_categories', 'manage_orders', 'manage_banners', 'manage_files']
    };

    const userPermissions = rolePermissions[req.adminUser.role] || [];

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authenticateUser,
  optionalAuthenticateUser,
  checkPermission
};
