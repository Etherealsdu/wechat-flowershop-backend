require('dotenv').config();

module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'wechat_flowershop',
    dialect: 'mysql',
    logging: console.log,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key_for_dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  alioss: {
    region: process.env.ALI_OSS_REGION || 'oss-cn-hangzhou',
    accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET || '',
    bucket: process.env.ALI_OSS_BUCKET || ''
  },
  port: process.env.PORT || 3000
};