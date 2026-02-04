const ProductService = require('../services/ProductService');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { Op } = require('sequelize');

// Mock models
jest.mock('../models/Product', () => ({
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('../models/Category', () => ({
  findByPk: jest.fn(),
}));

describe('ProductService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return products with pagination', async () => {
      const mockProducts = {
        rows: [{ id: 1, name: 'Test Product' }],
        count: 1,
      };
      
      Product.findAndCountAll.mockResolvedValue(mockProducts);

      const result = await ProductService.getProducts(1, 10, {});

      expect(Product.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }],
        limit: 10,
        offset: 0,
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
      });
      expect(result.data).toEqual(mockProducts.rows);
      expect(result.pagination.total).toBe(1);
    });

    it('should apply category filter', async () => {
      const mockProducts = {
        rows: [],
        count: 0,
      };
      
      Product.findAndCountAll.mockResolvedValue(mockProducts);

      await ProductService.getProducts(1, 10, { category_id: 1 });

      expect(Product.findAndCountAll).toHaveBeenCalledWith({
        where: { category_id: 1 },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }],
        limit: 10,
        offset: 0,
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
      });
    });

    it('should apply search filter', async () => {
      const mockProducts = {
        rows: [],
        count: 0,
      };
      
      Product.findAndCountAll.mockResolvedValue(mockProducts);

      await ProductService.getProducts(1, 10, { search: 'test' });

      expect(Product.findAndCountAll).toHaveBeenCalledWith({
        where: { name: { [Op.like]: '%test%' } },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }],
        limit: 10,
        offset: 0,
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
      });
    });
  });

  describe('getProductById', () => {
    it('should return product by id', async () => {
      const mockProduct = { id: 1, name: 'Test Product' };
      Product.findByPk.mockResolvedValue(mockProduct);

      const result = await ProductService.getProductById(1);

      expect(Product.findByPk).toHaveBeenCalledWith(1, {
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }]
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const mockProductData = { name: 'New Product', price: 100 };
      const mockCreatedProduct = { id: 1, ...mockProductData };
      Product.create.mockResolvedValue(mockCreatedProduct);

      const result = await ProductService.createProduct(mockProductData);

      expect(Product.create).toHaveBeenCalledWith(mockProductData);
      expect(result).toEqual(mockCreatedProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Old Name',
        save: jest.fn().mockResolvedValue(undefined),
      };
      Product.findByPk.mockResolvedValue(mockProduct);

      const updateData = { name: 'New Name' };
      const result = await ProductService.updateProduct(1, updateData);

      expect(mockProduct.name).toBe('New Name');
      expect(mockProduct.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should throw error if product not found', async () => {
      Product.findByPk.mockResolvedValue(null);

      await expect(ProductService.updateProduct(999, {}))
        .rejects
        .toThrow('Product not found');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const mockProduct = {
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      Product.findByPk.mockResolvedValue(mockProduct);

      const result = await ProductService.deleteProduct(1);

      expect(mockProduct.destroy).toHaveBeenCalled();
      expect(result.message).toBe('Product deleted successfully');
    });

    it('should throw error if product not found', async () => {
      Product.findByPk.mockResolvedValue(null);

      await expect(ProductService.deleteProduct(999))
        .rejects
        .toThrow('Product not found');
    });
  });
});