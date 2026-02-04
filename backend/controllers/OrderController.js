const OrderService = require('../services/OrderService');

class OrderController {
  // 获取订单列表
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

  // 根据ID获取订单
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 更新订单
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
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const order = await OrderService.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
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
      const stats = await OrderService.getOrderStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = OrderController;