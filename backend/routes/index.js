const express = require('express');
const router = express.Router();

// 导入各个模块的路由
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const orderRoutes = require('./orderRoutes');
const fileRoutes = require('./fileRoutes');

// 挂载路由到对应路径
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/files', fileRoutes);

module.exports = router;