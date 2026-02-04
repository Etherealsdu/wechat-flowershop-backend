const CategoryService = require('../services/CategoryService');
const Category = require('../models/Category');

// Mock Category model
jest.mock('../models/Category', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  findOne: jest.fn(),
}));

describe('CategoryService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return categories', async () => {
      const mockCategories = [{ id: 1, name: 'Test Category' }];
      Category.findAll.mockResolvedValue(mockCategories);

      const result = await CategoryService.getCategories({});

      expect(Category.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['parent_id', 'ASC'], ['sort_order', 'ASC']]
      });
      expect(result).toEqual(mockCategories);
    });

    it('should apply is_active filter', async () => {
      const mockCategories = [];
      Category.findAll.mockResolvedValue(mockCategories);

      await CategoryService.getCategories({ is_active: true });

      expect(Category.findAll).toHaveBeenCalledWith({
        where: { is_active: true },
        order: [['parent_id', 'ASC'], ['sort_order', 'ASC']]
      });
    });

    it('should apply parent_id filter', async () => {
      const mockCategories = [];
      Category.findAll.mockResolvedValue(mockCategories);

      await CategoryService.getCategories({ parent_id: 1 });

      expect(Category.findAll).toHaveBeenCalledWith({
        where: { parent_id: 1 },
        order: [['parent_id', 'ASC'], ['sort_order', 'ASC']]
      });
    });
  });

  describe('getCategoryById', () => {
    it('should return category by id', async () => {
      const mockCategory = { id: 1, name: 'Test Category' };
      Category.findByPk.mockResolvedValue(mockCategory);

      const result = await CategoryService.getCategoryById(1);

      expect(Category.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const mockCategoryData = { name: 'New Category' };
      const mockCreatedCategory = { id: 1, ...mockCategoryData };
      Category.create.mockResolvedValue(mockCreatedCategory);

      const result = await CategoryService.createCategory(mockCategoryData);

      expect(Category.create).toHaveBeenCalledWith(mockCategoryData);
      expect(result).toEqual(mockCreatedCategory);
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const mockCategory = {
        id: 1,
        name: 'Old Name',
        save: jest.fn().mockResolvedValue(undefined),
      };
      Category.findByPk.mockResolvedValue(mockCategory);

      const updateData = { name: 'New Name' };
      const result = await CategoryService.updateCategory(1, updateData);

      expect(mockCategory.name).toBe('New Name');
      expect(mockCategory.save).toHaveBeenCalled();
      expect(result).toEqual(mockCategory);
    });

    it('should throw error if category not found', async () => {
      Category.findByPk.mockResolvedValue(null);

      await expect(CategoryService.updateCategory(999, {}))
        .rejects
        .toThrow('Category not found');
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      const mockCategory = {
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      Category.findByPk.mockResolvedValue(mockCategory);

      // Mock the check for child categories to return null (no children)
      Category.findOne.mockResolvedValue(null);

      const result = await CategoryService.deleteCategory(1);

      expect(mockCategory.destroy).toHaveBeenCalled();
      expect(result.message).toBe('Category deleted successfully');
    });

    it('should throw error if category has subcategories', async () => {
      const mockCategory = { id: 1 };
      Category.findByPk.mockResolvedValue(mockCategory);

      // Mock finding a child category
      Category.findOne.mockResolvedValue({ id: 2 });

      await expect(CategoryService.deleteCategory(1))
        .rejects
        .toThrow('Cannot delete category with subcategories');
    });

    it('should throw error if category not found', async () => {
      Category.findByPk.mockResolvedValue(null);

      await expect(CategoryService.deleteCategory(999))
        .rejects
        .toThrow('Category not found');
    });
  });

  describe('getCategoryTree', () => {
    it('should return category tree structure', async () => {
      const mockCategories = [
        { id: 1, name: 'Parent', parent_id: 0 },
        { id: 2, name: 'Child', parent_id: 1 },
      ];
      Category.findAll.mockResolvedValue(mockCategories);

      const result = await CategoryService.getCategoryTree();

      expect(Category.findAll).toHaveBeenCalledWith({
        order: [['parent_id', 'ASC'], ['sort_order', 'ASC']]
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].id).toBe(2);
    });

    it('should return empty array if no categories', async () => {
      Category.findAll.mockResolvedValue([]);

      const result = await CategoryService.getCategoryTree();

      expect(result).toEqual([]);
    });
  });
});