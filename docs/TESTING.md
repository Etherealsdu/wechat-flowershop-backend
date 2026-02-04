# 微信花店后台系统 - 测试指南

## 目录

1. [测试概述](#测试概述)
2. [测试环境配置](#测试环境配置)
3. [运行测试](#运行测试)
4. [测试覆盖率](#测试覆盖率)
5. [测试类型](#测试类型)
6. [API测试](#api测试)
7. [性能测试](#性能测试)
8. [安全测试](#安全测试)

---

## 测试概述

本系统采用 **Jest** 作为测试框架，结合 **Supertest** 进行 API 测试。测试覆盖率目标为 **100%**。

### 测试框架

| 工具 | 用途 |
|------|------|
| Jest | 单元测试和集成测试框架 |
| Supertest | HTTP 断言库 |
| SQLite | 测试数据库（内存模式） |

---

## 测试环境配置

### 1. 安装测试依赖

```bash
cd backend
npm install
```

### 2. 环境变量配置

测试会自动使用以下环境变量：

```bash
NODE_ENV=test
JWT_SECRET=test_jwt_secret_key_for_testing
JWT_EXPIRES_IN=1h
```

### 3. 测试数据库配置

测试使用 SQLite 内存数据库，无需额外配置。

---

## 运行测试

### 运行所有测试

```bash
npm test
```

### 运行并生成覆盖率报告

```bash
npm run test:coverage
```

### 监听模式运行测试

```bash
npm run test:watch
```

### 运行特定测试文件

```bash
npm test -- tests/unit/userService.test.js
```

### 运行特定测试用例

```bash
npm test -- --testNamePattern="should create user"
```

---

## 测试覆盖率

### 覆盖率目标

| 指标 | 目标 |
|------|------|
| 语句覆盖率 (Statements) | 100% |
| 分支覆盖率 (Branches) | 100% |
| 函数覆盖率 (Functions) | 100% |
| 行覆盖率 (Lines) | 100% |

### 查看覆盖率报告

```bash
# 运行测试并生成报告
npm run test:coverage

# 查看 HTML 报告
open coverage/lcov-report/index.html
```

### 覆盖率配置

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100,
  },
}
```

---

## 测试类型

### 1. 单元测试

测试单个函数或模块的功能。

**位置**: `tests/unit/`

**示例**:

```javascript
// tests/unit/userService.test.js
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user = await UserService.getUserById(1);
      expect(user).toBeDefined();
      expect(user.id).toBe(1);
    });

    it('should return null when not found', async () => {
      const user = await UserService.getUserById(999999);
      expect(user).toBeNull();
    });
  });
});
```

### 2. 集成测试

测试多个模块之间的交互。

**位置**: `tests/integration/`

### 3. API测试

测试 REST API 端点。

**位置**: `tests/api.test.js`

---

## API测试

### 测试工具函数

```javascript
// tests/helpers/testUtils.js

// 生成用户Token
function generateUserToken(userId, openid = 'test_openid') {
  return jwt.sign(
    { id: userId, openid, type: 'user' },
    testConfig.jwtSecret,
    { expiresIn: '1h' }
  );
}

// 生成管理员Token
function generateAdminToken(adminId, role = 'admin') {
  return jwt.sign(
    { id: adminId, role, type: 'admin' },
    testConfig.jwtSecret,
    { expiresIn: '1h' }
  );
}
```

### API 测试示例

```javascript
describe('Products API', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = generateAdminToken(1);
  });

  describe('GET /api/products', () => {
    it('should return products list', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/products/featured', () => {
    it('should return featured products', async () => {
      const response = await request(app)
        .get('/api/products/featured')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/products', () => {
    it('should create product with valid data', async () => {
      const productData = {
        name: '测试商品',
        price: 99.99,
        stock: 100,
        category_id: 1
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(productData.name);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({})
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });
});
```

---

## 性能测试

### 使用 Artillery 进行负载测试

#### 1. 安装 Artillery

```bash
npm install -g artillery
```

#### 2. 创建测试配置

```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 120
      arrivalRate: 50
      name: 'Sustained load'
    - duration: 60
      arrivalRate: 100
      name: 'Peak load'

scenarios:
  - name: 'Get products'
    weight: 50
    flow:
      - get:
          url: '/api/products'

  - name: 'Get featured products'
    weight: 30
    flow:
      - get:
          url: '/api/products/featured'

  - name: 'Search products'
    weight: 20
    flow:
      - get:
          url: '/api/products/search?keyword=玫瑰'
```

#### 3. 运行性能测试

```bash
artillery run artillery.yml
```

### 性能指标

| 指标 | 目标值 |
|------|--------|
| 响应时间 (P95) | < 200ms |
| 响应时间 (P99) | < 500ms |
| 吞吐量 | > 1000 req/s |
| 错误率 | < 0.1% |

---

## 安全测试

### 1. SQL 注入测试

```javascript
describe('SQL Injection Prevention', () => {
  it('should prevent SQL injection in search', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request(app)
      .get(`/api/products/search?keyword=${encodeURIComponent(maliciousInput)}`)
      .expect(200);

    // 应该正常返回，不应该导致数据库错误
    expect(response.body.data).toBeDefined();
  });
});
```

### 2. XSS 测试

```javascript
describe('XSS Prevention', () => {
  it('should sanitize user input', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nickname: xssPayload })
      .expect(200);

    // 应该对输入进行处理或验证
  });
});
```

### 3. 认证测试

```javascript
describe('Authentication', () => {
  it('should reject expired token', async () => {
    const expiredToken = jwt.sign(
      { id: 1, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' }
    );

    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body.error).toContain('expired');
  });

  it('should reject invalid token', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalid_token')
      .expect(403);

    expect(response.body.error).toBeDefined();
  });
});
```

---

## 测试最佳实践

### 1. 测试命名约定

```javascript
describe('ModuleName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // 测试代码
    });
  });
});
```

### 2. AAA 模式

```javascript
it('should create order successfully', async () => {
  // Arrange (准备)
  const orderData = mockData.order(userId);

  // Act (执行)
  const result = await OrderService.createOrder(userId, orderData);

  // Assert (断言)
  expect(result).toBeDefined();
  expect(result.status).toBe('pending');
});
```

### 3. 测试隔离

每个测试应该独立运行，不依赖其他测试的结果。

```javascript
beforeEach(async () => {
  // 每个测试前重置数据
  await resetDatabase();
});
```

---

## CI/CD 集成

### GitHub Actions 配置

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: test_db
        ports:
          - 3306:3306

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Run tests
        run: cd backend && npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage/lcov.info
```
