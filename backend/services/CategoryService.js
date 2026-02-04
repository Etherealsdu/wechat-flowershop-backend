const { Op } = require('sequelize');
const Category = require('../models/Category');

class CategoryService {
  // 获取分类列表
  static async getCategories(filters = {}) {
    const whereClause = {};
    if (typeof filters.is_active !== 'undefined') {
      whereClause.is_active = filters.is_active;
    }
    if (filters.parent_id !== undefined) {
      whereClause.parent_id = filters.parent_id;
    }
    
    const categories = await Category.findAll({
      where: whereClause,
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    });
    
    return categories;
  }

  // 根据ID获取分类
  static async getCategoryById(id) {
    return await Category.findByPk(id);
  }

  // 创建分类
  static async createCategory(categoryData) {
    return await Category.create(categoryData);
  }

  // 更新分类信息
  static async updateCategory(id, updateData) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error('Category not found');
    }
    
    Object.assign(category, updateData);
    await category.save();
    
    return category;
  }

  // 删除分类
  static async deleteCategory(id) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error('Category not found');
    }
    
    // 检查是否有子分类或产品关联
    const childCategories = await Category.findOne({ where: { parent_id: id } });
    if (childCategories) {
      throw new Error('Cannot delete category with subcategories');
    }
    
    // TODO: 检查是否有关联的产品
    
    await category.destroy();
    return { message: 'Category deleted successfully' };
  }
  
  // 获取分类树结构
  static async getCategoryTree() {
    const categories = await Category.findAll({
      order: [['parent_id', 'ASC'], ['sort_order', 'ASC']]
    });
    
    // 构建树形结构
    const categoryMap = {};
    const roots = [];
    
    // 先创建映射
    categories.forEach(cat => {
      categoryMap[cat.id] = { ...cat.toJSON(), children: [] };
    });
    
    // 再建立父子关系
    categories.forEach(cat => {
      if (cat.parent_id === 0) {
        roots.push(categoryMap[cat.id]);
      } else if (categoryMap[cat.parent_id]) {
        categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
      }
    });
    
    return roots;
  }
}

module.exports = CategoryService;