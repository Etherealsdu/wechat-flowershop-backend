const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

// Mock数据
const mockUserData = {
  openid: 'mock_openid_123',
  nickname: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  phone: '13800138000'
};

const mockCategoryData = {
  name: '鲜花',
  description: '各类鲜花',
  is_active: true
};

const mockProductData = {
  name: '红玫瑰',
  description: '99朵红玫瑰',
  price: 299.99,
  original_price: 399.99,
  stock: 100,
  category_id: 1,
  is_active: true,
  is_on_sale: true
};

const mockOrderData = {
  order_no: 'ORD20231201001',
  user_id: 1,
  total_amount: 299.99,
  consignee: '张三',
  phone: '13800138000',
  address: '北京市朝阳区xxx街道',
  status: 'pending'
};

describe('API Tests', () => {
  let authToken = '';
  let userId = null;
  let categoryId = null;
  let productId = null;
  let orderId = null;

  // 在所有测试前创建管理员账户并获取token
  beforeAll(async () => {
    // 注意：实际应用中需要有创建管理员账户的机制
    // 这里仅为测试目的，实际部署时需通过其他方式创建
  });

  describe('Authentication Tests', () => {
    it('should return 401 for protected routes without token', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);
        
      expect(response.body.error).toBeDefined();
    });
  });

  describe('User Management Tests', () => {
    it('should get users list', async () => {
      // 这个测试需要有效的认证token
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should get user by ID', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Category Management Tests', () => {
    it('should create a new category', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockCategoryData)
        .expect(201);
        
      expect(response.body).toHaveProperty('id');
      categoryId = response.body.id;
    });

    it('should get categories list', async () => {
      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get category by ID', async () => {
      const response = await request(app)
        .get(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(response.body.id).toBe(categoryId);
    });

    it('should update category', async () => {
      const updateData = { ...mockCategoryData, name: '鲜花类' };
      const response = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
        
      expect(response.body.name).toBe('鲜花类');
    });

    it('should get category tree', async () => {
      const response = await request(app)
        .get('/api/categories/tree')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Product Management Tests', () => {
    it('should create a new product', async () => {
      const productData = { ...mockProductData, category_id: categoryId };
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);
        
      expect(response.body).toHaveProperty('id');
      productId = response.body.id;
    });

    it('should get products list', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should get product by ID', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(response.body.id).toBe(productId);
    });

    it('should update product', async () => {
      const updateData = { ...mockProductData, name: '白玫瑰' };
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);
        
      expect(response.body.name).toBe('白玫瑰');
    });
  });

  describe('Order Management Tests', () => {
    it('should create a new order', async () => {
      const orderData = { ...mockOrderData, user_id: userId };
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);
        
      expect(response.body).toHaveProperty('id');
      orderId = response.body.id;
    });

    it('should get orders list', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should get order by ID', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(response.body.id).toBe(orderId);
    });

    it('should update order status', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'paid' })
        .expect(200);
        
      expect(response.body.status).toBe('paid');
    });

    it('should get order statistics', async () => {
      const response = await request(app)
        .get('/api/orders/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
        
      expect(response.body).toHaveProperty('pending');
      expect(response.body).toHaveProperty('paid');
      expect(response.body).toHaveProperty('shipped');
      expect(response.body).toHaveProperty('delivered');
      expect(response.body).toHaveProperty('cancelled');
    });
  });

  describe('Error Handling Tests', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
        
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
        
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/categories/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
        
      expect(response.body.error).toBeDefined();
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
        
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid status update', async () => {
      const response = await request(app)
        .put('/api/orders/999999/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
        
      expect(response.body.error).toBeDefined();
    });
  });

  // 清理测试数据
  afterAll(async () => {
    // 在实际应用中，可能需要清理测试期间创建的数据
    // 但为了演示目的，这里不做实际清理
  });
});