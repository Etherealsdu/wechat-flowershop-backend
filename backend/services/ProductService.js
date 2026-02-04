const { Op } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');

class ProductService {
  // 获取产品列表
  static async getProducts(page = 1, pageSize = 10, filters = {}) {
    const offset = (page - 1) * pageSize;
    
    const whereClause = {};
    if (filters.category_id) {
      whereClause.category_id = filters.category_id;
    }
    if (filters.search) {
      whereClause.name = { [Op.like]: `%${filters.search}%` };
    }
    if (typeof filters.is_active !== 'undefined') {
      whereClause.is_active = filters.is_active;
    }
    if (typeof filters.is_on_sale !== 'undefined') {
      whereClause.is_on_sale = filters.is_on_sale;
    }
    
    const products = await Product.findAndCountAll({
      where: whereClause,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    });
    
    return {
      data: products.rows,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: products.count,
        totalPages: Math.ceil(products.count / pageSize)
      }
    };
  }

  // 根据ID获取产品
  static async getProductById(id) {
    return await Product.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });
  }

  // 创建产品
  static async createProduct(productData) {
    return await Product.create(productData);
  }

  // 更新产品信息
  static async updateProduct(id, updateData) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    Object.assign(product, updateData);
    await product.save();
    
    return product;
  }

  // 删除产品
  static async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    await product.destroy();
    return { message: 'Product deleted successfully' };
  }
}

module.exports = ProductService;