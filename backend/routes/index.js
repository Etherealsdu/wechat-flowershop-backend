const express = require('express');
const router = express.Router();

// 导入各个模块的路由
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const orderRoutes = require('./orderRoutes');
const fileRoutes = require('./fileRoutes');
const bannerRoutes = require('./bannerRoutes');
const addressRoutes = require('./addressRoutes');
const cartRoutes = require('./cartRoutes');

// 挂载路由到对应路径
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/users/addresses', addressRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/files', fileRoutes);
router.use('/banners', bannerRoutes);
router.use('/cart', cartRoutes);

module.exports = router;
