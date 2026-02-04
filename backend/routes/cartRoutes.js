const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const { authenticateUser } = require('../middleware/auth');

// 所有购物车路由都需要用户认证
router.use(authenticateUser);

// 获取购物车
router.get('/', CartController.getCart);

// 获取购物车商品数量
router.get('/count', CartController.getCartCount);

// 添加到购物车
router.post('/', CartController.addToCart);

// 全选/取消全选
router.put('/select-all', CartController.selectAll);

// 更新购物车商品数量
router.put('/:id', CartController.updateCartItem);

// 更新购物车商品选中状态
router.put('/:id/selected', CartController.updateCartItemSelected);

// 批量删除购物车商品
router.post('/batch-remove', CartController.batchRemove);

// 清空购物车
router.post('/clear', CartController.clearCart);

// 清空选中的商品
router.post('/clear-selected', CartController.clearSelected);

// 删除购物车商品
router.delete('/:id', CartController.removeFromCart);

module.exports = router;
