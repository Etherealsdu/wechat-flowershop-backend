const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

// 轮播图表
const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  link_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  target_type: {
    type: DataTypes.ENUM('product', 'category', 'page', 'external'),
    defaultValue: 'external'
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'banners',
  timestamps: false
});

module.exports = Banner;