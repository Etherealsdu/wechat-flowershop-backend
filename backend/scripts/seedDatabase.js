/**
 * 数据库种子脚本
 * 用于初始化测试数据
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../utils/database');
const { User, AdminUser, Category, Product, Banner } = require('../models');

async function seedDatabase() {
  try {
    console.log('开始初始化数据库数据...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 同步数据库
    await sequelize.sync({ alter: true });

    // 创建管理员账户
    const adminPassword = await bcrypt.hash('admin123456', 10);
    const [admin, adminCreated] = await AdminUser.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        password_hash: adminPassword,
        email: 'admin@flowershop.com',
        phone: '13800000000',
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    if (adminCreated) {
      console.log('已创建管理员账户: admin / admin123456');
    } else {
      console.log('管理员账户已存在');
    }

    // 创建测试用户
    const [user, userCreated] = await User.findOrCreate({
      where: { openid: 'test_openid_001' },
      defaults: {
        openid: 'test_openid_001',
        nickname: '测试用户',
        avatar: 'https://via.placeholder.com/100',
        phone: '13800000001',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    if (userCreated) {
      console.log('已创建测试用户');
    }

    // 创建商品分类
    const categories = [
      { name: '玫瑰', description: '各种玫瑰花', sort_order: 1 },
      { name: '向日葵', description: '向日葵花束', sort_order: 2 },
      { name: '百合', description: '百合花系列', sort_order: 3 },
      { name: '康乃馨', description: '康乃馨系列', sort_order: 4 },
      { name: '混合花束', description: '多种鲜花组合', sort_order: 5 }
    ];

    for (const cat of categories) {
      await Category.findOrCreate({
        where: { name: cat.name },
        defaults: {
          ...cat,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }
    console.log('已创建商品分类');

    // 创建测试商品
    const category = await Category.findOne({ where: { name: '玫瑰' } });
    if (category) {
      const products = [
        {
          name: '红玫瑰花束',
          description: '99朵红玫瑰，代表天长地久的爱情',
          price: 299.00,
          original_price: 399.00,
          stock: 100,
          category_id: category.id,
          image_urls: ['https://via.placeholder.com/400x400?text=Red+Roses'],
          is_active: true,
          is_on_sale: true,
          sales_count: 50
        },
        {
          name: '粉玫瑰花束',
          description: '33朵粉玫瑰，温柔浪漫',
          price: 199.00,
          original_price: 259.00,
          stock: 80,
          category_id: category.id,
          image_urls: ['https://via.placeholder.com/400x400?text=Pink+Roses'],
          is_active: true,
          is_on_sale: true,
          sales_count: 30
        }
      ];

      for (const prod of products) {
        await Product.findOrCreate({
          where: { name: prod.name },
          defaults: {
            ...prod,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }
      console.log('已创建测试商品');
    }

    // 创建轮播图
    const banners = [
      {
        title: '新品上市',
        image_url: 'https://via.placeholder.com/750x350?text=New+Arrivals',
        target_type: 'page',
        sort_order: 1
      },
      {
        title: '情人节特惠',
        image_url: 'https://via.placeholder.com/750x350?text=Valentines+Day',
        target_type: 'page',
        sort_order: 2
      }
    ];

    for (const banner of banners) {
      await Banner.findOrCreate({
        where: { title: banner.title },
        defaults: {
          ...banner,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }
    console.log('已创建轮播图');

    console.log('数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

seedDatabase();
