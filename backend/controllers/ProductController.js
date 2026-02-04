const ProductService = require('../services/ProductService');

class ProductController {
  // 获取产品列表
  static async getProducts(req, res) {
    try {
      const { page = 1, pageSize = 10, categoryId, search, isActive, isOnSale, sort, minPrice, maxPrice } = req.query;
      const filters = {
        category_id: categoryId,
        search,
        is_active: isActive !== undefined ? isActive === 'true' : undefined,
        is_on_sale: isOnSale !== undefined ? isOnSale === 'true' : undefined,
        sort,
        min_price: minPrice,
        max_price: maxPrice
      };

      const result = await ProductService.getProducts(parseInt(page), parseInt(pageSize), filters);
      res.json(result);
    } catch (error) {
      console.error('获取产品列表失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 获取精选/推荐商品
  static async getFeaturedProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      const result = await ProductService.getFeaturedProducts(parseInt(limit));
      res.json(result);
    } catch (error) {
      console.error('获取精选商品失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 获取新品推荐
  static async getNewProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      const result = await ProductService.getNewProducts(parseInt(limit));
      res.json(result);
    } catch (error) {
      console.error('获取新品推荐失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 获取热销商品
  static async getHotProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      const result = await ProductService.getHotProducts(parseInt(limit));
      res.json(result);
    } catch (error) {
      console.error('获取热销商品失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 搜索商品
  static async searchProducts(req, res) {
    try {
      const { keyword, page = 1, pageSize = 10 } = req.query;
      const result = await ProductService.searchProducts(keyword, parseInt(page), parseInt(pageSize));
      res.json(result);
    } catch (error) {
      console.error('搜索商品失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 根据分类获取产品
  static async getProductsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { page = 1, pageSize = 10 } = req.query;
      const result = await ProductService.getProductsByCategory(categoryId, parseInt(page), parseInt(pageSize));
      res.json(result);
    } catch (error) {
      console.error('获取分类商品失败:', error);
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

  // 批量更新产品状态
  static async batchUpdateStatus(req, res) {
    try {
      const { ids, is_active, is_on_sale } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: '请选择要更新的商品' });
      }

      const result = await ProductService.batchUpdateStatus(ids, { is_active, is_on_sale });
      res.json(result);
    } catch (error) {
      console.error('批量更新产品状态失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 更新库存
  static async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      if (typeof stock !== 'number' || stock < 0) {
        return res.status(400).json({ error: '库存必须是非负整数' });
      }

      const product = await ProductService.updateStock(id, stock);
      res.json(product);
    } catch (error) {
      console.error('更新库存失败:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProductController;
