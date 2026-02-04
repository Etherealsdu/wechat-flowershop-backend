const OrderService = require('../services/OrderService');
const Order = require('../models/Order');
const User = require('../models/User');
const { Op, fn, col } = require('sequelize');

// Mock models
jest.mock('../models/Order', () => ({
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('../models/User', () => ({
  findByPk: jest.fn(),
}));

// Mock sequelize
jest.mock('../utils/database', () => ({
  fn: jest.fn(),
  col: jest.fn(),
}));

describe('OrderService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should return orders with pagination', async () => {
      const mockOrders = {
        rows: [{ id: 1, order_no: 'ORD001' }],
        count: 1,
      };
      
      Order.findAndCountAll.mockResolvedValue(mockOrders);

      const result = await OrderService.getOrders(1, 10, {});

      expect(Order.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'phone']
        }],
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']]
      });
      expect(result.data).toEqual(mockOrders.rows);
      expect(result.pagination.total).toBe(1);
    });

    it('should apply status filter', async () => {
      const mockOrders = {
        rows: [],
        count: 0,
      };
      
      Order.findAndCountAll.mockResolvedValue(mockOrders);

      await OrderService.getOrders(1, 10, { status: 'pending' });

      expect(Order.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 'pending' },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'phone']
        }],
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']]
      });
    });

    it('should apply date range filter', async () => {
      const mockOrders = {
        rows: [],
        count: 0,
      };
      
      Order.findAndCountAll.mockResolvedValue(mockOrders);

      const dateFrom = '2023-01-01';
      const dateTo = '2023-12-31';
      await OrderService.getOrders(1, 10, { date_from: dateFrom, date_to: dateTo });

      expect(Order.findAndCountAll).toHaveBeenCalledWith({
        where: {
          created_at: {
            [Op.gte]: new Date(dateFrom),
            [Op.lte]: new Date(dateTo)
          }
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'phone']
        }],
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']]
      });
    });

    it('should apply search filter', async () => {
      const mockOrders = {
        rows: [],
        count: 0,
      };
      
      Order.findAndCountAll.mockResolvedValue(mockOrders);

      await OrderService.getOrders(1, 10, { search: 'ORD001' });

      expect(Order.findAndCountAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { order_no: { [Op.like]: '%ORD001%' } },
            { consignee: { [Op.like]: '%ORD001%' } }
          ]
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'phone']
        }],
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']]
      });
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      const mockOrder = { id: 1, order_no: 'ORD001' };
      Order.findByPk.mockResolvedValue(mockOrder);

      const result = await OrderService.getOrderById(1);

      expect(Order.findByPk).toHaveBeenCalledWith(1, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'phone']
        }]
      });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const mockOrder = {
        id: 1,
        status: 'pending',
        save: jest.fn().mockResolvedValue(undefined),
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      const result = await OrderService.updateOrderStatus(1, 'paid');

      expect(mockOrder.status).toBe('paid');
      expect(mockOrder.payment_time).toBeDefined();
      expect(mockOrder.save).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should update shipping time when status is shipped', async () => {
      const mockOrder = {
        id: 1,
        status: 'paid',
        shipping_time: null,
        save: jest.fn().mockResolvedValue(undefined),
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      const result = await OrderService.updateOrderStatus(1, 'shipped');

      expect(mockOrder.status).toBe('shipped');
      expect(mockOrder.shipping_time).toBeDefined();
      expect(mockOrder.save).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should update delivered time when status is delivered', async () => {
      const mockOrder = {
        id: 1,
        status: 'shipped',
        delivered_time: null,
        save: jest.fn().mockResolvedValue(undefined),
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      const result = await OrderService.updateOrderStatus(1, 'delivered');

      expect(mockOrder.status).toBe('delivered');
      expect(mockOrder.delivered_time).toBeDefined();
      expect(mockOrder.save).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should update additional fields', async () => {
      const mockOrder = {
        id: 1,
        status: 'pending',
        remark: '',
        save: jest.fn().mockResolvedValue(undefined),
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      const updateData = { remark: 'Special request' };
      const result = await OrderService.updateOrderStatus(1, 'pending', updateData);

      expect(mockOrder.remark).toBe('Special request');
      expect(mockOrder.save).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw error if order not found', async () => {
      Order.findByPk.mockResolvedValue(null);

      await expect(OrderService.updateOrderStatus(999, 'paid'))
        .rejects
        .toThrow('Order not found');
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      const mockOrder = {
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      Order.findByPk.mockResolvedValue(mockOrder);

      const result = await OrderService.deleteOrder(1);

      expect(mockOrder.destroy).toHaveBeenCalled();
      expect(result.message).toBe('Order deleted successfully');
    });

    it('should throw error if order not found', async () => {
      Order.findByPk.mockResolvedValue(null);

      await expect(OrderService.deleteOrder(999))
        .rejects
        .toThrow('Order not found');
    });
  });

  describe('getOrderStats', () => {
    it('should return order statistics', async () => {
      const mockStats = [
        { status: 'pending', count: 5 },
        { status: 'paid', count: 10 },
      ];
      Order.findAll.mockResolvedValue(mockStats);

      const result = await OrderService.getOrderStats();

      expect(Order.findAll).toHaveBeenCalledWith({
        attributes: ['status', [expect.any(Function), 'count']],
        group: ['status'],
        raw: true
      });
      expect(result.pending).toBe(5);
      expect(result.paid).toBe(10);
      expect(result.shipped).toBe(0);
      expect(result.delivered).toBe(0);
      expect(result.cancelled).toBe(0);
    });

    it('should return zero counts for missing statuses', async () => {
      const mockStats = [
        { status: 'pending', count: 5 },
        // Missing other statuses
      ];
      Order.findAll.mockResolvedValue(mockStats);

      const result = await OrderService.getOrderStats();

      expect(result.pending).toBe(5);
      expect(result.paid).toBe(0);
      expect(result.shipped).toBe(0);
      expect(result.delivered).toBe(0);
      expect(result.cancelled).toBe(0);
    });
  });
});