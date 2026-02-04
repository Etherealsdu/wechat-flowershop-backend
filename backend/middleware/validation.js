const Joi = require('joi');

// 用户验证模式
const userValidationSchema = Joi.object({
  nickname: Joi.string().max(100),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).messages({
    'string.pattern.base': '手机号格式不正确'
  })
});

// 产品验证模式
const productValidationSchema = Joi.object({
  name: Joi.string().max(200).required().messages({
    'any.required': '商品名称是必填项',
    'string.max': '商品名称长度不能超过200个字符'
  }),
  description: Joi.string().max(1000),
  price: Joi.number().positive().precision(2).required().messages({
    'any.required': '价格是必填项',
    'number.positive': '价格必须大于0',
    'number.precision': '价格最多保留两位小数'
  }),
  original_price: Joi.number().positive().precision(2).optional(),
  stock: Joi.number().integer().min(0).required().messages({
    'any.required': '库存是必填项',
    'number.integer': '库存必须是整数',
    'number.min': '库存不能小于0'
  }),
  category_id: Joi.number().integer().required().messages({
    'any.required': '分类ID是必填项',
    'number.integer': '分类ID必须是整数'
  }),
  image_urls: Joi.array().items(Joi.string()).optional(),
  is_active: Joi.boolean().default(true),
  is_on_sale: Joi.boolean().default(true),
  sort_order: Joi.number().integer().default(0)
});

// 分类验证模式
const categoryValidationSchema = Joi.object({
  name: Joi.string().max(100).required().messages({
    'any.required': '分类名称是必填项',
    'string.max': '分类名称长度不能超过100个字符'
  }),
  description: Joi.string().max(500),
  image_url: Joi.string().uri().optional(),
  parent_id: Joi.number().integer().default(0),
  sort_order: Joi.number().integer().default(0),
  is_active: Joi.boolean().default(true)
});

// 订单验证模式
const orderValidationSchema = Joi.object({
  order_no: Joi.string().alphanum().max(50).required().messages({
    'any.required': '订单号是必填项',
    'string.alphanum': '订单号只能包含字母和数字',
    'string.max': '订单号长度不能超过50个字符'
  }),
  user_id: Joi.number().integer().required().messages({
    'any.required': '用户ID是必填项',
    'number.integer': '用户ID必须是整数'
  }),
  total_amount: Joi.number().positive().precision(2).required().messages({
    'any.required': '总金额是必填项',
    'number.positive': '总金额必须大于0'
  }),
  status: Joi.string().valid('pending', 'paid', 'shipped', 'delivered', 'cancelled').default('pending'),
  consignee: Joi.string().max(100).required().messages({
    'any.required': '收货人是必填项',
    'string.max': '收货人姓名长度不能超过100个字符'
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'any.required': '联系电话是必填项',
    'string.pattern.base': '联系电话格式不正确'
  }),
  address: Joi.string().max(500).required().messages({
    'any.required': '收货地址是必填项',
    'string.max': '收货地址长度不能超过500个字符'
  }),
  remark: Joi.string().max(500),
  payment_method: Joi.string().max(50),
  payment_time: Joi.date().optional(),
  shipping_time: Joi.date().optional(),
  delivered_time: Joi.date().optional()
});

// 订单状态更新验证
const orderStatusUpdateSchema = Joi.object({
  status: Joi.string().valid('pending', 'paid', 'shipped', 'delivered', 'cancelled').required().messages({
    'any.required': '订单状态是必填项'
  })
});

// 验证中间件工厂函数
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({ 
        error: '输入验证失败',
        details: errors 
      });
    }
    
    req.validatedBody = value;
    next();
  };
}

module.exports = {
  validate,
  userValidationSchema,
  productValidationSchema,
  categoryValidationSchema,
  orderValidationSchema,
  orderStatusUpdateSchema
};