/**
 * Jest 测试设置文件
 * 在所有测试运行之前执行
 */

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.WECHAT_APP_ID = 'test_app_id';
process.env.WECHAT_APP_SECRET = 'test_app_secret';

// 增加Jest超时时间
jest.setTimeout(30000);

// 全局测试钩子
beforeAll(async () => {
  // 测试开始前的设置
  console.log('Starting test suite...');
});

afterAll(async () => {
  // 测试结束后的清理
  console.log('Test suite completed.');
});
