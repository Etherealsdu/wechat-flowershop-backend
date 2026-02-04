const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

// 用户地址表
const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '收货人姓名'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '联系电话'
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '省份'
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '城市'
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '区县'
  },
  detail: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '详细地址'
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否默认地址'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'addresses',
  timestamps: false
});

module.exports = Address;
