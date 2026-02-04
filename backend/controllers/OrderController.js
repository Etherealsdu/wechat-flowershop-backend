const OrderService = require('../services/OrderService');

class OrderController {
  // 获取订单列表（管理员）
  static async getOrders(req, res) {
    try {
      const { page = 1, pageSize = 10, status, dateFrom, dateTo, search } = req.query;
      const filters = {
        status,
        date_from: dateFrom,
        date_to: dateTo,
        search
      };

      const result = await OrderService.getOrders(parseInt(page), parseInt(pageSize), filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 获取用户订单列表（小程序端）
  static async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 10, status } = req.query;

      const result = await OrderService.getUserOrders(userId, parseInt(page), parseInt(pageSize), status);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 根据ID获取订单
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      // 如果是小程序用户，只能查看自己的订单
      const userId = req.user?.id || null;
      const order = await OrderService.getOrderById(id, userId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 创建订单（小程序端）
  static async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const orderData = req.validatedBody || req.body;

      const order = await OrderService.createOrder(userId, orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error('创建订单失败:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // 更新订单（管理员）
  static async updateOrder(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const order = await OrderService.updateOrderStatus(id, null, updateData);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 更新订单状态
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, payment_method } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const order = await OrderService.updateOrderStatus(id, status, { payment_method });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 取消订单
  static async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      // 如果是小程序用户，只能取消自己的订单
      const userId = req.user?.id || null;

      const order = await OrderService.cancelOrder(id, userId);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 确认收货（小程序端）
  static async confirmReceipt(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // 验证订单属于当前用户
      const order = await OrderService.getOrderById(id, userId);
      if (!order) {
        return res.status(404).json({ error: '订单不存在' });
      }

      if (order.status !== 'shipped') {
        return res.status(400).json({ error: '订单状态不允许确认收货' });
      }

      const updatedOrder = await OrderService.updateOrderStatus(id, 'delivered');
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 删除订单
  static async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const result = await OrderService.deleteOrder(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 获取订单统计数据
  static async getOrderStats(req, res) {
    try {
      // 如果是小程序用户，只统计自己的订单
      const userId = req.user?.id || null;
      const stats = await OrderService.getOrderStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 获取订单金额统计（管理员）
  static async getOrderAmountStats(req, res) {
    try {
      const { dateFrom, dateTo } = req.query;
      const stats = await OrderService.getOrderAmountStats(dateFrom, dateTo);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = OrderController;
