const AddressService = require('../services/AddressService');

class AddressController {
  // 获取用户地址列表
  static async getAddresses(req, res) {
    try {
      const userId = req.user.id;
      const result = await AddressService.getAddresses(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 获取单个地址
  static async getAddressById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const address = await AddressService.getAddressById(userId, id);

      if (!address) {
        return res.status(404).json({ error: '地址不存在' });
      }

      res.json(address);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 创建地址
  static async createAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressData = req.validatedBody || req.body;
      const address = await AddressService.createAddress(userId, addressData);
      res.status(201).json(address);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 更新地址
  static async updateAddress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.validatedBody || req.body;
      const address = await AddressService.updateAddress(userId, id, updateData);
      res.json(address);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 删除地址
  static async deleteAddress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await AddressService.deleteAddress(userId, id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 设为默认地址
  static async setDefaultAddress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await AddressService.setDefaultAddress(userId, id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 获取默认地址
  static async getDefaultAddress(req, res) {
    try {
      const userId = req.user.id;
      const address = await AddressService.getDefaultAddress(userId);

      if (!address) {
        return res.status(404).json({ error: '暂无默认地址' });
      }

      res.json(address);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AddressController;
