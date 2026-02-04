# WeChat Flower Admin API 文档

## 概述

本文档描述了微信花店小程序后台管理系统的API接口规范。

- **基础URL**: `/api`
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`

## 认证

大多数API端点需要认证。认证方式为在请求头中添加JWT令牌：

```
Authorization: Bearer <jwt_token>
```

## 通用响应格式

成功响应：
```json
{
  "data": {},
  "pagination": {}
}
```

错误响应：
```json
{
  "error": "错误消息"
}
```

## 用户管理

### 获取用户列表

- **URL**: `/users`
- **方法**: `GET`
- **认证**: 必需
- **权限**: 管理员

**查询参数**:
- `page` (可选): 页码，默认为1
- `pageSize` (可选): 每页条数，默认为10
- `search` (可选): 搜索关键词

**响应**:
```json
{
  "data": [
    {
      "id": 1,
      "openid": "o123456789",
      "nickname": "张三",
      "avatar": "https://...",
      "phone": "13800138000",
      "created_at": "2023-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 获取用户详情

- **URL**: `/users/:id`
- **方法**: `GET`
- **认证**: 必需
- **权限**: 管理员

**响应**:
```json
{
  "id": 1,
  "openid": "o123456789",
  "nickname": "张三",
  "avatar": "https://...",
  "phone": "13800138000",
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T10:00:00Z"
}
```

### 更新用户信息

- **URL**: `/users/:id`
- **方法**: `PUT`
- **认证**: 必需
- **权限**: 管理员

**请求体**:
```json
{
  "nickname": "新昵称",
  "phone": "13900139000"
}
```

**响应**:
```json
{
  "id": 1,
  "openid": "o123456789",
  "nickname": "新昵称",
  "avatar": "https://...",
  "phone": "13900139000",
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-02T10:00:00Z"
}
```

### 删除用户

- **URL**: `/users/:id`
- **方法**: `DELETE`
- **认证**: 必需
- **权限**: 管理员

**响应**:
```json
{
  "message": "User deleted successfully"
}
```

## 商品管理

### 获取商品列表

- **URL**: `/products`
- **方法**: `GET`
- **认证**: 必需
- **权限**: 管理员

**查询参数**:
- `page` (可选): 页码，默认为1
- `pageSize` (可选): 每页条数，默认为10
- `categoryId` (可选): 分类ID
- `search` (可选): 搜索关键词
- `isActive` (可选): 是否激活 (true/false)
- `isOnSale` (可选): 是否在售 (true/false)

**响应**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "红玫瑰",
      "description": "99朵红玫瑰",
      "price": "299.99",
      "original_price": "399.99",
      "stock": 100,
      "category_id": 1,
      "image_urls": ["https://...", "..."],
      "is_active": true,
      "is_on_sale": true,
      "sort_order": 0,
      "sales_count": 0,
      "created_at": "2023-12-01T10:00:00Z",
      "category": {
        "id": 1,
        "name": "鲜花"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 获取商品详情

- **URL**: `/products/:id`
- **方法**: `GET`
- **认证**: 必需
- **权限**: 管理员

**响应**:
```json
{
  "id": 1,
  "name": "红玫瑰",
  "description": "99朵红玫瑰",
  "price": "299.99",
  "original_price": "399.99",
  "stock": 100,
  "category_id": 1,
  "image_urls": ["https://...", "..."],
  "is_active": true,
  "is_on_sale": true,
  "sort_order": 0,
  "sales_count": 0,
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T10:00:00Z",
  "category": {
    "id": 1,
    "name": "鲜花"
  }
}
```

### 创建商品

- **URL**: `/products`
- **方法**: `POST`
- **认证**: 必需
- **权限**: 管理员

**请求体**:
```json
{
  "name": "白玫瑰",
  "description": "12朵白玫瑰",
  "price": 199.99,
  "original_price": 299.99,
  "stock": 50,
  "category_id": 1,
  "image_urls": ["https://example.com/image1.jpg"],
  "is_active": true,
  "is_on_sale": true,
  "sort_order": 0
}
```

**响应**:
```json
{
  "id": 2,
  "name": "白玫瑰",
  "description": "12朵白玫瑰",
  "price": "199.99",
  "original_price": "299.99",
  "stock": 50,
  "category_id": 1,
  "image_urls": ["https://example.com/image1.jpg"],
  "is_active": true,
  "is_on_sale": true,
  "sort_order": 0,
  "sales_count": 0,
  "created_at": "2023-12-02T10:00:00Z",
  "updated_at": "2023-12-02T10:00:00Z"
}
```

### 更新商品

- **URL**: `/products/:id`
- **方法**: `PUT`
- **认证**: 必需
- **权限**: 管理员

**请求体**:
```json
{
  "name": "升级版白玫瑰",
  "price": 249.99
}
```

**响应**:
```json
{
  "id": 2,
  "name": "升级版白玫瑰",
  "description": "12朵白玫瑰",
  "price": "249.99",
  "original_price": "299.99",
  "stock": 50,
  "category_id": 1,
  "image_urls": ["https://example.com/image1.jpg"],
  "is_active": true,
  "is_on_sale": true,
  "sort_order": 0,
  "sales_count": 0,
  "created_at": "2023-12-02T10:00:00Z",
  "updated_at": "2023-12-02T11:00:00Z"
}
```

### 删除商品

- **URL**: `/products/:id`
- **方法**: `DELETE`
- **认证**: 必需
- **权限**: 管理员

**响应**:
```json
{
  "message": "Product deleted successfully"
}
```

## 分类管理

### 获取分类列表

- **URL**: `/categories`
- **方法**: `GET`
- **认证**: 必需
- **权限**: 管理员

**查询参数**:
- `isActive` (可选): 是否激活 (true/false)
- `parentId` (可选): 父分类ID

**响应**:
```json
{
  "id": 1,
  "name": "鲜花",
  "description": "各类鲜花",
  "image_url": "https://...",
  "parent_id": 0,
  "sort_order": 0,
  "is_active": true,
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T10:00:00Z"
}
```

### 获取分类树

- **URL**: `/categories/tree`
- **方法**: `GET`
- **认证**: 必需
- **权限**: 管理员

**响应**:
```json
[
  {
    "id": 1,
    "name": "鲜花",
    "description": "各类鲜花",
    "image_url": "https://...",
    "parent_id": 0,
    "sort_order": 0,
    "is_active": true,
    "created_at": "2023-12-01T10:00:00Z",
    "updated_at": "2023-12-01T10:00:00Z",
    "children": [
      {
        "id": 2,
        "name": "玫瑰",
        "description": "各种玫瑰",
        "image_url": "https://...",
        "parent_id": 1,
        "sort_order": 0,
        "is_active": true,
        "created_at": "2023-12-01T10:00:00Z",
        "updated_at": "2023-12-01T10:00:00Z",
        "children": []
      }
    ]
  }
]
```

### 创建分类

- **URL**: `/categories`
- **方法**: `POST`
- **认证**: 必需
- **权限**: 管理员

**请求体**:
```json
{
  "name": "绿植",
  "description": "室内绿植",
  "image_url": "https://...",
  "parent_id": 0,
  "sort_order": 1,
  "is_active": true
}
```

**响应**:
```json
{
  "id": 3,
  "name": "绿植",
  "description": "室内绿植",
  "image_url": "https://...",
  "parent_id": 0,
  "sort_order": 1,
  "is_active": true,
  "created_at": "2023-12-02T10:00:00Z",
  "updated_at": "2023-12-02T10:00:00Z"
}
```

### 更新分类

- **URL**: `/categories/:id`
- **方法**: `PUT`
- **认证**: 必需
- **权限**: 管理员

**请求体**:
```json
{
  "name": "多肉植物",
  "description": "各种多肉植物"
}
```

**响应**:
```json
{
  "id": 3,
  "name": "多肉植物",
  "description": "各种多肉植物",
  "image_url": "https://...",
  "parent_id": 0,
  "sort_order": 1,
  "is_active": true,
  "created_at": "2023-12-02T10:00:00Z",
  "updated_at": "2023-12-02T11:00:00Z"
}
```

### 删除分类

- **URL**: `/categories/:id`
- **方法**: `DELETE`
- **认证**: 必需
- **权限**: 管理员

**响应**:
```json
{
  "message": "Category deleted successfully"
}
```

## 订单管理

### 获取订单列表

- **URL**: `/orders`
- **方法**: `GET`
- **认证**: 必需
- **权限**: 管理员

**查询参数**:
- `page` (可选): 页码，默认为1
- `pageSize` (可选): 每页条数，默认为10
- `status` (可选): 订单状态
- `dateFrom` (可选): 开始日期
- `dateTo` (可选): 结束日期
- `search` (可选): 搜索关键词（订单号或收货人）

**响应**:
```json
{
  "data": [
    {
      "id": 1,
      "order_no": "ORD20231201001",
      "user_id": 1,
      "total_amount": "299.99",
      "status": "paid",
      "consignee": "张三",
      "phone": "13800138000",
      "address": "北京市朝阳区xxx街道",
      "remark": "",
      "payment_method": "wechat",
      "payment_time": "2023-12-01T11:00:00Z",
      "shipping_time": null,
      "delivered_time": null,
      "created_at": "2023-12-01T10:00:00Z",
      "updated_at": "2023-12-01T11:00:00Z",
      "user": {
        "id": 1,
        "nickname": "张三",
        "phone": "13800138000"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 获取订单详情

- **URL**: `/orders/:id`
- **方法**: `GET`
- **认证**: 必需
- **权限**: 管理员

**响应**:
```json
{
  "id": 1,
  "order_no": "ORD20231201001",
  "user_id": 1,
  "total_amount": "299.99",
  "status": "paid",
  "consignee": "张三",
  "phone": "13800138000",
  "address": "北京市朝阳区xxx街道",
  "remark": "",
  "payment_method": "wechat",
  "payment_time": "2023-12-01T11:00:00Z",
  "shipping_time": null,
  "delivered_time": null,
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T11:00:00Z",
  "user": {
    "id": 1,
    "nickname": "张三",
    "phone": "13800138000"
  }
}
```

### 更新订单

- **URL**: `/orders/:id`
- **方法**: `PUT`
- **认证**: 必需
- **权限**: 管理员

**请求体**:
```json
{
  "remark": "客户要求尽快发货"
}
```

**响应**:
```json
{
  "id": 1,
  "order_no": "ORD20231201001",
  "user_id": 1,
  "total_amount": "299.99",
  "status": "paid",
  "consignee": "张三",
  "phone": "13800138000",
  "address": "北京市朝阳区xxx街道",
  "remark": "客户要求尽快发货",
  "payment_method": "wechat",
  "payment_time": "2023-12-01T11:00:00Z",
  "shipping_time": null,
  "delivered_time": null,
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T12:00:00Z"
}
```

### 更新订单状态

- **URL**: `/orders/:id/status`
- **方法**: `PUT`
- **认证**: 必需
- **权限**: 管理员

**请求体**:
```json
{
  "status": "shipped"
}
```

**响应**:
```json
{
  "id": 1,
  "order_no": "ORD20231201001",
  "user_id": 1,
  "total_amount": "299.99",
  "status": "shipped",
  "consignee": "张三",
  "phone": "13800138000",
  "address": "北京市朝阳区xxx街道",
  "remark": "客户要求尽快发货",
  "payment_method": "wechat",
  "payment_time": "2023-12-01T11:00:00Z",
  "shipping_time": "2023-12-01T14:00:00Z",
  "delivered_time": null,
  "created_at": "2023-12-01T10:00:00Z",
  "updated_at": "2023-12-01T14:00:00Z"
}
```

### 删除订单

- **URL**: `/orders/:id`
- **方法**: `DELETE`
- **认证**: 必需
- **权限**: 管理员

**响应**:
```json
{
  "message": "Order deleted successfully"
}
```

### 获取订单统计

- **URL**: `/orders/stats`
- **方法**: `GET`
- **认证**: 必需
- **权限**: 管理员

**响应**:
```json
{
  "pending": 5,
  "paid": 12,
  "shipped": 8,
  "delivered": 25,
  "cancelled": 3
}
```