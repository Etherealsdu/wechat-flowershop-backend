const UserService = require('../services/UserService');

class UserController {
  // 获取用户列表（管理员）
  static async getUsers(req, res) {
    try {
      const { page = 1, pageSize = 10, search } = req.query;
      const filters = { search };

      const result = await UserService.getUsers(parseInt(page), parseInt(pageSize), filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 根据ID获取用户（管理员）
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 获取当前用户资料（小程序端）
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await UserService.getUserProfile(userId);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 更新当前用户资料（小程序端）
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      const profile = await UserService.updateUserProfile(userId, updateData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 更新用户信息（管理员）
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await UserService.updateUser(id, updateData);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 删除用户（管理员）
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUser(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 获取用户统计（管理员）
  static async getUserStats(req, res) {
    try {
      const stats = await UserService.getUserStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;
