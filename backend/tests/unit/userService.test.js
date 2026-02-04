const UserService = require('../services/UserService');
const User = require('../models/User');
const { Op } = require('sequelize');

// Mock User model
jest.mock('../models/User', () => ({
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return users with pagination', async () => {
      const mockUsers = {
        rows: [{ id: 1, nickname: 'Test User' }],
        count: 1,
      };
      
      User.findAndCountAll.mockResolvedValue(mockUsers);

      const result = await UserService.getUsers(1, 10, {});

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']]
      });
      expect(result.data).toEqual(mockUsers.rows);
      expect(result.pagination.total).toBe(1);
    });

    it('should apply search filter', async () => {
      const mockUsers = {
        rows: [],
        count: 0,
      };
      
      User.findAndCountAll.mockResolvedValue(mockUsers);

      await UserService.getUsers(1, 10, { search: 'test' });

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: {
          nickname: { [Op.like]: '%test%' }
        },
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']]
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 1, nickname: 'Test User' };
      User.findByPk.mockResolvedValue(mockUser);

      const result = await UserService.getUserById(1);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const result = await UserService.getUserById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        id: 1,
        nickname: 'Old Name',
        save: jest.fn().mockResolvedValue(undefined),
      };
      User.findByPk.mockResolvedValue(mockUser);

      const updateData = { nickname: 'New Name' };
      const result = await UserService.updateUser(1, updateData);

      expect(mockUser.nickname).toBe('New Name');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(UserService.updateUser(999, {}))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockUser = {
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      User.findByPk.mockResolvedValue(mockUser);

      const result = await UserService.deleteUser(1);

      expect(mockUser.destroy).toHaveBeenCalled();
      expect(result.message).toBe('User deleted successfully');
    });

    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(UserService.deleteUser(999))
        .rejects
        .toThrow('User not found');
    });
  });
});