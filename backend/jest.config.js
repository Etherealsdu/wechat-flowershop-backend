// jest.config.js
module.exports = {
  testEnvironment: 'node',
  rootDir: __dirname,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/__tests__/**/*.test.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  // 模块目录，允许测试从 rootDir 直接导入模块
  modulePaths: ['<rootDir>'],
  verbose: true,
  testTimeout: 30000,
  maxWorkers: 1,
};
