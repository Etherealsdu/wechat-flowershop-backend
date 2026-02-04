const { Address } = require('../models');

class AddressService {
  // 获取用户地址列表
  static async getAddresses(userId) {
    const addresses = await Address.findAll({
      where: { user_id: userId },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    return {
      data: addresses.map(addr => ({
        ...addr.toJSON(),
        fullAddress: `${addr.province}${addr.city}${addr.district}${addr.detail}`
      }))
    };
  }

  // 根据ID获取地址
  static async getAddressById(userId, addressId) {
    const address = await Address.findOne({
      where: { id: addressId, user_id: userId }
    });

    if (!address) {
      return null;
    }

    return {
      ...address.toJSON(),
      fullAddress: `${address.province}${address.city}${address.district}${address.detail}`
    };
  }

  // 创建地址
  static async createAddress(userId, addressData) {
    // 如果是第一个地址或设为默认，则清除其他默认地址
    if (addressData.is_default) {
      await Address.update(
        { is_default: false },
        { where: { user_id: userId } }
      );
    }

    // 检查是否是用户的第一个地址，如果是则设为默认
    const count = await Address.count({ where: { user_id: userId } });
    if (count === 0) {
      addressData.is_default = true;
    }

    const address = await Address.create({
      user_id: userId,
      ...addressData,
      created_at: new Date(),
      updated_at: new Date()
    });

    return {
      ...address.toJSON(),
      fullAddress: `${address.province}${address.city}${address.district}${address.detail}`
    };
  }

  // 更新地址
  static async updateAddress(userId, addressId, updateData) {
    const address = await Address.findOne({
      where: { id: addressId, user_id: userId }
    });

    if (!address) {
      throw new Error('地址不存在');
    }

    // 如果设为默认地址，清除其他默认
    if (updateData.is_default) {
      await Address.update(
        { is_default: false },
        { where: { user_id: userId, id: { [require('sequelize').Op.ne]: addressId } } }
      );
    }

    Object.assign(address, updateData, { updated_at: new Date() });
    await address.save();

    return {
      ...address.toJSON(),
      fullAddress: `${address.province}${address.city}${address.district}${address.detail}`
    };
  }

  // 删除地址
  static async deleteAddress(userId, addressId) {
    const address = await Address.findOne({
      where: { id: addressId, user_id: userId }
    });

    if (!address) {
      throw new Error('地址不存在');
    }

    await address.destroy();

    // 如果删除的是默认地址，将最新的地址设为默认
    if (address.is_default) {
      const latestAddress = await Address.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });
      if (latestAddress) {
        latestAddress.is_default = true;
        await latestAddress.save();
      }
    }

    return { message: '地址删除成功' };
  }

  // 设置默认地址
  static async setDefaultAddress(userId, addressId) {
    const address = await Address.findOne({
      where: { id: addressId, user_id: userId }
    });

    if (!address) {
      throw new Error('地址不存在');
    }

    // 清除其他默认地址
    await Address.update(
      { is_default: false },
      { where: { user_id: userId } }
    );

    // 设置新的默认地址
    address.is_default = true;
    address.updated_at = new Date();
    await address.save();

    return {
      id: address.id,
      is_default: true
    };
  }

  // 获取默认地址
  static async getDefaultAddress(userId) {
    const address = await Address.findOne({
      where: { user_id: userId, is_default: true }
    });

    if (!address) {
      // 如果没有默认地址，返回最新的地址
      return await Address.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });
    }

    return {
      ...address.toJSON(),
      fullAddress: `${address.province}${address.city}${address.district}${address.detail}`
    };
  }
}

module.exports = AddressService;
