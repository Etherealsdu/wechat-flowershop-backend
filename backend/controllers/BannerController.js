const BannerService = require('../services/BannerService');

class BannerController {
  // 获取轮播图列表
  static async getBanners(req, res) {
    try {
      const { is_active } = req.query;
      const filters = {};

      if (is_active !== undefined) {
        filters.is_active = is_active === 'true';
      }

      const result = await BannerService.getBanners(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 获取单个轮播图
  static async getBannerById(req, res) {
    try {
      const { id } = req.params;
      const banner = await BannerService.getBannerById(id);

      if (!banner) {
        return res.status(404).json({ error: '轮播图不存在' });
      }

      res.json(banner);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 创建轮播图
  static async createBanner(req, res) {
    try {
      const bannerData = req.validatedBody || req.body;
      const banner = await BannerService.createBanner(bannerData);
      res.status(201).json(banner);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 更新轮播图
  static async updateBanner(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedBody || req.body;
      const banner = await BannerService.updateBanner(id, updateData);
      res.json(banner);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 删除轮播图
  static async deleteBanner(req, res) {
    try {
      const { id } = req.params;
      const result = await BannerService.deleteBanner(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = BannerController;
