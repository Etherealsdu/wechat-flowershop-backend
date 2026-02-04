const { Banner } = require('../models');

class BannerService {
  // 获取轮播图列表
  static async getBanners(filters = {}) {
    const whereClause = {};

    // 只返回激活状态的轮播图（前端）
    if (typeof filters.is_active !== 'undefined') {
      whereClause.is_active = filters.is_active;
    }

    const banners = await Banner.findAll({
      where: whereClause,
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    });

    return { data: banners };
  }

  // 获取单个轮播图
  static async getBannerById(id) {
    return await Banner.findByPk(id);
  }

  // 创建轮播图
  static async createBanner(bannerData) {
    return await Banner.create({
      ...bannerData,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // 更新轮播图
  static async updateBanner(id, updateData) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw new Error('轮播图不存在');
    }

    Object.assign(banner, updateData, { updated_at: new Date() });
    await banner.save();
    return banner;
  }

  // 删除轮播图
  static async deleteBanner(id) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw new Error('轮播图不存在');
    }

    await banner.destroy();
    return { message: '轮播图删除成功' };
  }
}

module.exports = BannerService;
