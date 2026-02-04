const ProductService = require('../services/ProductService');

class ProductController {
  // 获取产品列表
  static async getProducts(req, res) {
    try {
      const { page = 1, pageSize = 10, categoryId, search, isActive, isOnSale } = req.query;
      const filters = { 
        category_id: categoryId, 
        search,
        is_active: isActive !== undefined ? isActive === 'true' : undefined,
        is_on_sale: isOnSale !== undefined ? isOnSale === 'true' : undefined
      };
      
      const result = await ProductService.getProducts(parseInt(page), parseInt(pageSize), filters);
      res.json(result);
    } catch (error) {
      console.error('获取产品列表失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 根据ID获取产品
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('获取产品详情失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 创建产品
  static async createProduct(req, res) {
    try {
      const productData = req.validatedBody || req.body;
      
      // 验证必要字段
      if (!productData.name || !productData.price || !productData.category_id) {
        return res.status(400).json({ error: 'Missing required fields: name, price, category_id' });
      }
      
      const product = await ProductService.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('创建产品失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 更新产品信息
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedBody || req.body;
      
      const product = await ProductService.updateProduct(id, updateData);
      res.json(product);
    } catch (error) {
      console.error('更新产品失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 删除产品
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await ProductService.deleteProduct(id);
      res.json(result);
    } catch (error) {
      console.error('删除产品失败:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProductController;