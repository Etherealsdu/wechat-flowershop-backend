const { Op } = require('sequelize');
const User = require('../models/User');

class UserService {
  // 获取用户列表
  static async getUsers(page = 1, pageSize = 10, filters = {}) {
    const offset = (page - 1) * pageSize;
    
    const whereClause = {};
    if (filters.search) {
      whereClause.nickname = { [Op.like]: `%${filters.search}%` };
    }
    
    const users = await User.findAndCountAll({
      where: whereClause,
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
  static async getUserById(id) {
    return await User.findByPk(id);
  }

  // 更新用户信息
  static async updateUser(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    Object.assign(user, updateData);
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
}

module.exports = UserService;