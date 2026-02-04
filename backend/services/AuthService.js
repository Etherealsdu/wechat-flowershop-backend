const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');

class AuthService {
  // 微信登录
  static async wxLogin(code) {
    if (!code) {
      throw new Error('微信登录code不能为空');
    }

    // 调用微信接口获取openid和session_key
    const wxLoginUrl = 'https://api.weixin.qq.com/sns/jscode2session';
    const params = {
      appid: config.wechat.appId,
      secret: config.wechat.appSecret,
      js_code: code,
      grant_type: 'authorization_code'
    };

    let wxResponse;
    try {
      wxResponse = await axios.get(wxLoginUrl, { params });
    } catch (error) {
      throw new Error('微信服务器请求失败: ' + error.message);
    }

    const { openid, session_key, errcode, errmsg } = wxResponse.data;

    if (errcode) {
      throw new Error(`微信登录失败: ${errmsg || '未知错误'} (错误码: ${errcode})`);
    }

    if (!openid) {
      throw new Error('获取openid失败');
    }

    // 查找或创建用户
    let user = await User.findOne({ where: { openid } });

    if (!user) {
      user = await User.create({
        openid,
        nickname: '微信用户',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        id: user.id,
        openid: user.openid,
        type: 'user' // 区分小程序用户和管理员
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // 生成refresh token
    const refreshToken = jwt.sign(
      {
        id: user.id,
        openid: user.openid,
        type: 'refresh'
      },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    };
  }

  // 刷新token
  static async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('refresh token不能为空');
    }

    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret);

      if (decoded.type !== 'refresh') {
        throw new Error('无效的refresh token');
      }

      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 生成新token
      const newToken = jwt.sign(
        {
          id: user.id,
          openid: user.openid,
          type: 'user'
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return { token: newToken };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('refresh token已过期，请重新登录');
      }
      throw error;
    }
  }
}

module.exports = AuthService;
