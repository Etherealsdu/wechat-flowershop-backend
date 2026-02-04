const { Op, fn, col } = require('sequelize');
const { Order, OrderItem, User, Product, Cart } = require('../models');
const sequelize = require('../utils/database');

class OrderService {
  // 生成订单号
  static generateOrderNo() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD${year}${month}${day}${random}`;
  }

  // 获取订单列表（管理员）
  static async getOrders(page = 1, pageSize = 10, filters = {}) {
    const offset = (page - 1) * pageSize;

    const whereClause = {};
    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.user_id) {
      whereClause.user_id = filters.user_id;
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
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'phone', 'avatar']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'image_urls']
          }]
        }
      ],
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

  // 获取用户订单列表（小程序端）
  static async getUserOrders(userId, page = 1, pageSize = 10, status = null) {
    const offset = (page - 1) * pageSize;

    const whereClause = { user_id: userId };
    if (status) {
      whereClause.status = status;
    }

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image_urls']
        }]
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
  static async getOrderById(id, userId = null) {
    const whereClause = { id };
    if (userId) {
      whereClause.user_id = userId;
    }

    return await Order.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'phone', 'avatar']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'image_urls', 'price']
          }]
        }
      ]
    });
  }

  // 创建订单（小程序端）
  static async createOrder(userId, orderData) {
    const transaction = await sequelize.transaction();

    try {
      const { items, consignee, phone, address, province, city, district, delivery_type, remark } = orderData;

      // 验证商品并计算总价
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findByPk(item.product_id, { transaction });

        if (!product) {
          throw new Error(`商品ID ${item.product_id} 不存在`);
        }
        if (!product.is_active || !product.is_on_sale) {
          throw new Error(`商品 "${product.name}" 已下架`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`商品 "${product.name}" 库存不足，当前库存: ${product.stock}`);
        }

        const price = parseFloat(product.price);
        const subtotal = price * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          product_id: product.id,
          product_name: product.name,
          product_image: product.image_urls?.[0] || '',
          price,
          quantity: item.quantity,
          subtotal
        });

        // 扣减库存
        await product.update({
          stock: product.stock - item.quantity,
          sales_count: product.sales_count + item.quantity
        }, { transaction });
      }

      // 创建订单
      const order = await Order.create({
        order_no: this.generateOrderNo(),
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
        consignee,
        phone,
        address,
        province,
        city,
        district,
        delivery_type,
        remark,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });

      // 创建订单项
      for (const item of orderItems) {
        await OrderItem.create({
          order_id: order.id,
          ...item,
          created_at: new Date()
        }, { transaction });
      }

      // 清空购物车中已下单的商品
      const productIds = items.map(item => item.product_id);
      await Cart.destroy({
        where: {
          user_id: userId,
          product_id: productIds
        },
        transaction
      });

      await transaction.commit();

      // 返回完整订单信息
      return await this.getOrderById(order.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
        order.payment_method = updateData.payment_method || 'wechat';
      } else if (status === 'shipped' && !order.shipping_time) {
        order.shipping_time = new Date();
      } else if (status === 'delivered' && !order.delivered_time) {
        order.delivered_time = new Date();
      }
    }

    Object.assign(order, updateData, { updated_at: new Date() });
    await order.save();

    return order;
  }

  // 取消订单
  static async cancelOrder(orderId, userId = null) {
    const whereClause = { id: orderId };
    if (userId) {
      whereClause.user_id = userId;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    // 检查订单状态
    if (!['pending', 'paid'].includes(order.status)) {
      throw new Error('当前订单状态不允许取消');
    }

    const transaction = await sequelize.transaction();

    try {
      // 恢复库存
      for (const item of order.items) {
        await Product.increment(
          { stock: item.quantity, sales_count: -item.quantity },
          { where: { id: item.product_id }, transaction }
        );
      }

      // 更新订单状态
      order.status = 'cancelled';
      order.updated_at = new Date();
      await order.save({ transaction });

      await transaction.commit();

      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 删除订单
  static async deleteOrder(id) {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // 只能删除已取消或已完成的订单
    if (!['cancelled', 'delivered'].includes(order.status)) {
      throw new Error('只能删除已取消或已完成的订单');
    }

    await order.destroy();
    return { message: 'Order deleted successfully' };
  }

  // 获取订单统计数据
  static async getOrderStats(userId = null) {
    const whereClause = userId ? { user_id: userId } : {};

    const stats = await Order.findAll({
      where: whereClause,
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

  // 获取订单总金额统计
  static async getOrderAmountStats(dateFrom = null, dateTo = null) {
    const whereClause = {
      status: { [Op.in]: ['paid', 'shipped', 'delivered'] }
    };

    if (dateFrom) {
      whereClause.created_at = { [Op.gte]: new Date(dateFrom) };
    }
    if (dateTo) {
      whereClause.created_at = {
        ...whereClause.created_at,
        [Op.lte]: new Date(dateTo)
      };
    }

    const result = await Order.findAll({
      where: whereClause,
      attributes: [
        [fn('SUM', col('total_amount')), 'totalAmount'],
        [fn('COUNT', col('id')), 'totalOrders']
      ],
      raw: true
    });

    return {
      totalAmount: parseFloat(result[0]?.totalAmount || 0),
      totalOrders: parseInt(result[0]?.totalOrders || 0)
    };
  }
}

module.exports = OrderService;
