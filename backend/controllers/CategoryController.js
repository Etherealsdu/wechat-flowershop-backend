const CategoryService = require('../services/CategoryService');

class CategoryController {
  // 获取分类列表
  static async getCategories(req, res) {
    try {
      const { isActive, parentId } = req.query;
      const filters = { 
        is_active: isActive !== undefined ? isActive === 'true' : undefined,
        parent_id: parentId
      };
      
      const categories = await CategoryService.getCategories(filters);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 根据ID获取分类
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 获取分类树结构
  static async getCategoryTree(req, res) {
    try {
      const tree = await CategoryService.getCategoryTree();
      res.json(tree);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 创建分类
  static async createCategory(req, res) {
    try {
      const categoryData = req.body;
      
      // 验证必要字段
      if (!categoryData.name) {
        return res.status(400).json({ error: 'Missing required field: name' });
      }
      
      const category = await CategoryService.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 更新分类信息
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const category = await CategoryService.updateCategory(id, updateData);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 删除分类
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await CategoryService.deleteCategory(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CategoryController;