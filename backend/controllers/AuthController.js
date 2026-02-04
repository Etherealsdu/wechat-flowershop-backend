const AuthService = require('../services/AuthService');

class AuthController {
  // 微信登录
  static async wxLogin(req, res) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: '微信登录code是必填项' });
      }

      const result = await AuthService.wxLogin(code);
      res.json(result);
    } catch (error) {
      console.error('微信登录失败:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // 刷新token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'refresh token是必填项' });
      }

      const result = await AuthService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      console.error('刷新token失败:', error);
      res.status(401).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
