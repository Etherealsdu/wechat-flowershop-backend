const { Op } = require('sequelize');
const { Product, Category } = require('../models');

class ProductService {
  // 获取产品列表
  static async getProducts(page = 1, pageSize = 10, filters = {}) {
    const offset = (page - 1) * pageSize;

    const whereClause = {};
    if (filters.category_id) {
      whereClause.category_id = filters.category_id;
    }
    if (filters.search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    if (typeof filters.is_active !== 'undefined') {
      whereClause.is_active = filters.is_active;
    }
    if (typeof filters.is_on_sale !== 'undefined') {
      whereClause.is_on_sale = filters.is_on_sale;
    }
    // 价格范围筛选
    if (filters.min_price) {
      whereClause.price = { [Op.gte]: parseFloat(filters.min_price) };
    }
    if (filters.max_price) {
      whereClause.price = {
        ...whereClause.price,
        [Op.lte]: parseFloat(filters.max_price)
      };
    }

    // 排序方式
    let orderClause = [['sort_order', 'ASC'], ['created_at', 'DESC']];
    if (filters.sort === 'price_asc') {
      orderClause = [['price', 'ASC']];
    } else if (filters.sort === 'price_desc') {
      orderClause = [['price', 'DESC']];
    } else if (filters.sort === 'sales') {
      orderClause = [['sales_count', 'DESC']];
    } else if (filters.sort === 'newest') {
      orderClause = [['created_at', 'DESC']];
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
      order: orderClause
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

  // 获取精选/推荐商品
  static async getFeaturedProducts(limit = 10) {
    const products = await Product.findAll({
      where: {
        is_active: true,
        is_on_sale: true
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['sales_count', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    return { data: products };
  }

  // 获取新品推荐
  static async getNewProducts(limit = 10) {
    const products = await Product.findAll({
      where: {
        is_active: true,
        is_on_sale: true
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    return { data: products };
  }

  // 获取热销商品
  static async getHotProducts(limit = 10) {
    const products = await Product.findAll({
      where: {
        is_active: true,
        is_on_sale: true,
        sales_count: { [Op.gt]: 0 }
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['sales_count', 'DESC']],
      limit: parseInt(limit)
    });

    return { data: products };
  }

  // 搜索商品
  static async searchProducts(keyword, page = 1, pageSize = 10) {
    if (!keyword || keyword.trim() === '') {
      return {
        data: [],
        pagination: {
          page: 1,
          pageSize: parseInt(pageSize),
          total: 0,
          totalPages: 0
        }
      };
    }

    const offset = (page - 1) * pageSize;

    const products = await Product.findAndCountAll({
      where: {
        is_active: true,
        is_on_sale: true,
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } }
        ]
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['sales_count', 'DESC'], ['created_at', 'DESC']]
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

  // 根据分类获取产品
  static async getProductsByCategory(categoryId, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    const products = await Product.findAndCountAll({
      where: {
        category_id: categoryId,
        is_active: true,
        is_on_sale: true
      },
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

  // 创建产品
  static async createProduct(productData) {
    return await Product.create({
      ...productData,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // 更新产品信息
  static async updateProduct(id, updateData) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Product not found');
    }

    Object.assign(product, updateData, { updated_at: new Date() });
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

  // 批量更新产品状态
  static async batchUpdateStatus(ids, status) {
    const updateData = { updated_at: new Date() };
    if (status.is_active !== undefined) {
      updateData.is_active = status.is_active;
    }
    if (status.is_on_sale !== undefined) {
      updateData.is_on_sale = status.is_on_sale;
    }

    await Product.update(updateData, {
      where: { id: { [Op.in]: ids } }
    });

    return { message: 'Products updated successfully', count: ids.length };
  }

  // 更新库存
  static async updateStock(id, quantity) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Product not found');
    }

    product.stock = quantity;
    product.updated_at = new Date();
    await product.save();

    return product;
  }
}

module.exports = ProductService;
