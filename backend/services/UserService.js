const { Op } = require('sequelize');
const User = require('../models/User');
const Order = require('../models/Order');
const Address = require('../models/Address');

class UserService {
  // 获取用户列表（管理员）
  static async getUsers(page = 1, pageSize = 10, filters = {}) {
    const offset = (page - 1) * pageSize;

    const whereClause = {};
    if (filters.search) {
      whereClause[Op.or] = [
        { nickname: { [Op.like]: `%${filters.search}%` } },
        { phone: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['openid'] }, // 不暴露openid
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      data: users.rows,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: users.count,
        totalPages: Math.ceil(users.count / pageSize)
      }
    };
  }

  // 根据ID获取用户
  static async getUserById(id, includeOpenid = false) {
    const attributes = includeOpenid ? undefined : { exclude: ['openid'] };
    return await User.findByPk(id, { attributes });
  }

  // 获取用户资料（小程序端）
  static async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nickname', 'avatar', 'phone', 'created_at', 'updated_at']
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 获取用户订单统计
    const orderCount = await Order.count({ where: { user_id: userId } });

    // 获取用户地址数量
    const addressCount = await Address.count({ where: { user_id: userId } });

    return {
      ...user.toJSON(),
      order_count: orderCount,
      address_count: addressCount
    };
  }

  // 更新用户信息（小程序端）
  static async updateUserProfile(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 只允许更新特定字段
    const allowedFields = ['nickname', 'avatar', 'phone'];
    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    Object.assign(user, filteredData, { updated_at: new Date() });
    await user.save();

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  // 更新用户信息（管理员）
  static async updateUser(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updateData, { updated_at: new Date() });
    await user.save();

    return user;
  }

  // 删除用户
  static async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }

    await user.destroy();
    return { message: 'User deleted successfully' };
  }

  // 根据openid获取用户
  static async getUserByOpenid(openid) {
    return await User.findOne({ where: { openid } });
  }

  // 创建用户
  static async createUser(userData) {
    return await User.create({
      ...userData,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // 获取用户统计信息
  static async getUserStats() {
    const totalUsers = await User.count();

    // 今日新增用户
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.count({
      where: {
        created_at: { [Op.gte]: today }
      }
    });

    // 本月新增用户
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.count({
      where: {
        created_at: { [Op.gte]: thisMonth }
      }
    });

    return {
      total: totalUsers,
      newToday: newUsersToday,
      newThisMonth: newUsersThisMonth
    };
  }
}

module.exports = UserService;
