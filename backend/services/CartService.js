const { Cart, Product, Category } = require('../models');

class CartService {
  // 获取购物车列表
  static async getCart(userId) {
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'original_price', 'stock', 'image_urls', 'is_active', 'is_on_sale'],
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }]
      }],
      order: [['created_at', 'DESC']]
    });

    // 格式化返回数据
    const items = cartItems.map(item => {
      const product = item.product;
      const imageUrls = product?.image_urls || [];
      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        selected: item.selected,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          original_price: product.original_price,
          stock: product.stock,
          image: imageUrls[0] || '',
          image_urls: imageUrls,
          is_active: product.is_active,
          is_on_sale: product.is_on_sale,
          category: product.category
        } : null
      };
    }).filter(item => item.product !== null);

    // 计算汇总信息
    const summary = this.calculateSummary(items);

    return {
      items,
      summary
    };
  }

  // 计算购物车汇总
  static calculateSummary(items) {
    let itemCount = 0;
    let selectedCount = 0;
    let subtotal = 0;

    items.forEach(item => {
      if (item.product) {
        itemCount += item.quantity;
        if (item.selected) {
          selectedCount += item.quantity;
          subtotal += parseFloat(item.product.price) * item.quantity;
        }
      }
    });

    const deliveryFee = subtotal > 0 && subtotal < 99 ? 10 : 0; // 满99免运费
    const total = subtotal + deliveryFee;

    return {
      itemCount,
      selectedCount,
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      total: total.toFixed(2)
    };
  }

  // 添加商品到购物车
  static async addToCart(userId, productId, quantity = 1) {
    // 检查商品是否存在且可购买
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('商品不存在');
    }
    if (!product.is_active || !product.is_on_sale) {
      throw new Error('商品已下架或不可购买');
    }

    // 检查购物车中是否已有该商品
    let cartItem = await Cart.findOne({
      where: { user_id: userId, product_id: productId }
    });

    if (cartItem) {
      // 更新数量
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new Error(`库存不足，当前库存: ${product.stock}`);
      }
      cartItem.quantity = newQuantity;
      cartItem.updated_at = new Date();
      await cartItem.save();
    } else {
      // 新增购物车项
      if (quantity > product.stock) {
        throw new Error(`库存不足，当前库存: ${product.stock}`);
      }
      cartItem = await Cart.create({
        user_id: userId,
        product_id: productId,
        quantity,
        selected: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return this.getCart(userId);
  }

  // 更新购物车商品数量
  static async updateCartItem(userId, cartItemId, quantity) {
    const cartItem = await Cart.findOne({
      where: { id: cartItemId, user_id: userId },
      include: [{
        model: Product,
        as: 'product'
      }]
    });

    if (!cartItem) {
      throw new Error('购物车项不存在');
    }

    if (quantity <= 0) {
      // 数量为0时删除
      await cartItem.destroy();
    } else {
      // 检查库存
      if (quantity > cartItem.product.stock) {
        throw new Error(`库存不足，当前库存: ${cartItem.product.stock}`);
      }
      cartItem.quantity = quantity;
      cartItem.updated_at = new Date();
      await cartItem.save();
    }

    return this.getCart(userId);
  }

  // 更新购物车商品选中状态
  static async updateCartItemSelected(userId, cartItemId, selected) {
    const cartItem = await Cart.findOne({
      where: { id: cartItemId, user_id: userId }
    });

    if (!cartItem) {
      throw new Error('购物车项不存在');
    }

    cartItem.selected = selected;
    cartItem.updated_at = new Date();
    await cartItem.save();

    return this.getCart(userId);
  }

  // 全选/取消全选
  static async selectAll(userId, selected) {
    await Cart.update(
      { selected, updated_at: new Date() },
      { where: { user_id: userId } }
    );

    return this.getCart(userId);
  }

  // 删除购物车商品
  static async removeFromCart(userId, cartItemId) {
    const cartItem = await Cart.findOne({
      where: { id: cartItemId, user_id: userId }
    });

    if (!cartItem) {
      throw new Error('购物车项不存在');
    }

    await cartItem.destroy();
    return this.getCart(userId);
  }

  // 批量删除购物车商品
  static async batchRemove(userId, cartItemIds) {
    await Cart.destroy({
      where: {
        id: cartItemIds,
        user_id: userId
      }
    });

    return this.getCart(userId);
  }

  // 清空购物车
  static async clearCart(userId) {
    await Cart.destroy({
      where: { user_id: userId }
    });

    return { items: [], summary: this.calculateSummary([]) };
  }

  // 清空选中的购物车商品
  static async clearSelected(userId) {
    await Cart.destroy({
      where: { user_id: userId, selected: true }
    });

    return this.getCart(userId);
  }

  // 获取购物车商品数量
  static async getCartCount(userId) {
    const count = await Cart.sum('quantity', {
      where: { user_id: userId }
    });
    return { count: count || 0 };
  }
}

module.exports = CartService;
