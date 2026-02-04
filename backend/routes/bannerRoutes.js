const express = require('express');
const router = express.Router();
const BannerController = require('../controllers/BannerController');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { validate, bannerValidationSchema } = require('../middleware/validation');

// 获取轮播图列表（公开接口）
router.get('/', BannerController.getBanners);

// 获取单个轮播图（公开接口）
router.get('/:id', BannerController.getBannerById);

// 以下路由需要管理员权限
router.post('/', authenticateToken, checkPermission('manage_banners'), validate(bannerValidationSchema), BannerController.createBanner);
router.put('/:id', authenticateToken, checkPermission('manage_banners'), validate(bannerValidationSchema), BannerController.updateBanner);
router.delete('/:id', authenticateToken, checkPermission('manage_banners'), BannerController.deleteBanner);

module.exports = router;
