const CartService = require('../services/CartService');

class CartController {
  // 获取购物车
  static async getCart(req, res) {
    try {
      const userId = req.user.id;
      const result = await CartService.getCart(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 添加到购物车
  static async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { product_id, quantity = 1 } = req.body;

      if (!product_id) {
        return res.status(400).json({ error: '商品ID是必填项' });
      }

      const result = await CartService.addToCart(userId, product_id, quantity);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 更新购物车商品数量
  static async updateCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { quantity } = req.body;

      if (typeof quantity !== 'number') {
        return res.status(400).json({ error: '数量是必填项' });
      }

      const result = await CartService.updateCartItem(userId, id, quantity);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 更新购物车商品选中状态
  static async updateCartItemSelected(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { selected } = req.body;

      if (typeof selected !== 'boolean') {
        return res.status(400).json({ error: '选中状态是必填项' });
      }

      const result = await CartService.updateCartItemSelected(userId, id, selected);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 全选/取消全选
  static async selectAll(req, res) {
    try {
      const userId = req.user.id;
      const { selected } = req.body;

      if (typeof selected !== 'boolean') {
        return res.status(400).json({ error: '选中状态是必填项' });
      }

      const result = await CartService.selectAll(userId, selected);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 删除购物车商品
  static async removeFromCart(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await CartService.removeFromCart(userId, id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 批量删除购物车商品
  static async batchRemove(req, res) {
    try {
      const userId = req.user.id;
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: '请选择要删除的商品' });
      }

      const result = await CartService.batchRemove(userId, ids);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 清空购物车
  static async clearCart(req, res) {
    try {
      const userId = req.user.id;
      const result = await CartService.clearCart(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 清空选中的商品
  static async clearSelected(req, res) {
    try {
      const userId = req.user.id;
      const result = await CartService.clearSelected(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 获取购物车商品数量
  static async getCartCount(req, res) {
    try {
      const userId = req.user.id;
      const result = await CartService.getCartCount(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CartController;
