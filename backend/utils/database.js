const { Sequelize } = require('sequelize');
const config = require('../config/config');

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: config.db.logging ? console.log : false,
    pool: config.db.pool
  }
);

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

module.exports = sequelize;