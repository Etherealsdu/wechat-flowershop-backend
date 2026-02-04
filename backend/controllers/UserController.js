const UserService = require('../services/UserService');

class UserController {
  // 获取用户列表
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

  // 根据ID获取用户
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

  // 更新用户信息
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

  // 删除用户
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUser(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;