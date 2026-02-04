const { Op, fn, col } = require('sequelize');
const Order = require('../models/Order');
const User = require('../models/User');
const sequelize = require('../utils/database');

class OrderService {
  // 获取订单列表
  static async getOrders(page = 1, pageSize = 10, filters = {}) {
    const offset = (page - 1) * pageSize;
    
    const whereClause = {};
    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.date_from) {
      whereClause.created_at = { [Op.gte]: new Date(filters.date_from) };
    }
    if (filters.date_to) {
      whereClause.created_at = { 
        ...whereClause.created_at, 
        [Op.lte]: new Date(filters.date_to) 
      };
    }
    if (filters.search) {
      // 搜索订单号或收货人
      whereClause[Op.or] = [
        { order_no: { [Op.like]: `%${filters.search}%` } },
        { consignee: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'phone']
      }],
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    return {
      data: orders.rows,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: orders.count,
        totalPages: Math.ceil(orders.count / pageSize)
      }
    };
  }

  // 根据ID获取订单
  static async getOrderById(id) {
    return await Order.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'phone']
      }]
    });
  }

  // 更新订单状态
  static async updateOrderStatus(orderId, status, updateData = {}) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    // 记录状态变更时间
    if (status) {
      order.status = status;
      
      if (status === 'paid' && !order.payment_time) {
        order.payment_time = new Date();
      } else if (status === 'shipped' && !order.shipping_time) {
        order.shipping_time = new Date();
      } else if (status === 'delivered' && !order.delivered_time) {
        order.delivered_time = new Date();
      }
    }
    
    Object.assign(order, updateData);
    await order.save();
    
    return order;
  }

  // 删除订单
  static async deleteOrder(id) {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new Error('Order not found');
    }
    
    await order.destroy();
    return { message: 'Order deleted successfully' };
  }
  
  // 获取订单统计数据
  static async getOrderStats() {
    const stats = await Order.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true
    });
    
    // 将统计结果转换为对象格式
    const statObj = {};
    stats.forEach(stat => {
      statObj[stat.status] = parseInt(stat.count);
    });
    
    // 确保所有状态都有值
    const allStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    allStatuses.forEach(status => {
      if (statObj[status] === undefined) {
        statObj[status] = 0;
      }
    });
    
    return statObj;
  }
}

module.exports = OrderService;