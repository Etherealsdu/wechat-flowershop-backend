/**
 * 测试工具函数
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 测试配置
const testConfig = {
  jwtSecret: process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing',
  jwtExpiresIn: '1h'
};

/**
 * 生成用户测试Token
 */
function generateUserToken(userId, openid = 'test_openid') {
  return jwt.sign(
    {
      id: userId,
      openid: openid,
      type: 'user'
    },
    testConfig.jwtSecret,
    { expiresIn: testConfig.jwtExpiresIn }
  );
}

/**
 * 生成管理员测试Token
 */
function generateAdminToken(adminId, role = 'admin') {
  return jwt.sign(
    {
      id: adminId,
      role: role,
      type: 'admin'
    },
    testConfig.jwtSecret,
    { expiresIn: testConfig.jwtExpiresIn }
  );
}

/**
 * 生成密码哈希
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Mock数据生成器
 */
const mockData = {
  user: (overrides = {}) => ({
    openid: `test_openid_${Date.now()}`,
    nickname: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    phone: '13800138000',
    ...overrides
  }),

  adminUser: async (overrides = {}) => ({
    username: `admin_${Date.now()}`,
    password_hash: await hashPassword('password123'),
    email: 'admin@test.com',
    phone: '13900139000',
    role: 'admin',
    is_active: true,
    ...overrides
  }),

  category: (overrides = {}) => ({
    name: `Category_${Date.now()}`,
    description: 'Test category description',
    is_active: true,
    sort_order: 0,
    ...overrides
  }),

  product: (categoryId, overrides = {}) => ({
    name: `Product_${Date.now()}`,
    description: 'Test product description',
    price: 99.99,
    original_price: 129.99,
    stock: 100,
    category_id: categoryId,
    image_urls: ['https://example.com/image.jpg'],
    is_active: true,
    is_on_sale: true,
    sales_count: 0,
    ...overrides
  }),

  order: (userId, overrides = {}) => ({
    order_no: `ORD${Date.now()}`,
    user_id: userId,
    total_amount: 99.99,
    status: 'pending',
    consignee: '张三',
    phone: '13800138000',
    address: '北京市朝阳区测试街道',
    ...overrides
  }),

  orderItem: (orderId, productId, overrides = {}) => ({
    order_id: orderId,
    product_id: productId,
    product_name: 'Test Product',
    product_image: 'https://example.com/image.jpg',
    price: 99.99,
    quantity: 1,
    subtotal: 99.99,
    ...overrides
  }),

  address: (userId, overrides = {}) => ({
    user_id: userId,
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '朝阳区',
    district: '三里屯街道',
    detail: '测试地址123号',
    is_default: false,
    ...overrides
  }),

  banner: (overrides = {}) => ({
    title: `Banner_${Date.now()}`,
    image_url: 'https://example.com/banner.jpg',
    link_url: 'https://example.com',
    target_type: 'external',
    is_active: true,
    sort_order: 0,
    ...overrides
  }),

  cart: (userId, productId, overrides = {}) => ({
    user_id: userId,
    product_id: productId,
    quantity: 1,
    selected: true,
    ...overrides
  })
};

/**
 * 等待指定毫秒数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  testConfig,
  generateUserToken,
  generateAdminToken,
  hashPassword,
  mockData,
  sleep
};
