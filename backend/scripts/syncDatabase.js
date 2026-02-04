/**
 * 数据库同步脚本
 * 用于同步所有模型到数据库
 * 警告：alter: true 会修改表结构，在生产环境谨慎使用
 */

require('dotenv').config();
const sequelize = require('../utils/database');
const models = require('../models');

async function syncDatabase() {
  try {
    console.log('开始同步数据库...');
    console.log('环境:', process.env.NODE_ENV || 'development');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 获取同步选项
    const syncOptions = {
      alter: process.env.NODE_ENV !== 'production', // 生产环境不自动修改表结构
      logging: console.log
    };

    // 同步所有模型
    await sequelize.sync(syncOptions);

    console.log('数据库同步完成！');
    console.log('已同步的表:');
    Object.keys(models).forEach(modelName => {
      console.log(`  - ${modelName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('数据库同步失败:', error);
    process.exit(1);
  }
}

syncDatabase();
