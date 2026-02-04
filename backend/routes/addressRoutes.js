const express = require('express');
const router = express.Router();
const AddressController = require('../controllers/AddressController');
const { authenticateUser } = require('../middleware/auth');
const { validate, addressValidationSchema } = require('../middleware/validation');

// 所有地址路由都需要用户认证
router.use(authenticateUser);

// 获取用户地址列表
router.get('/', AddressController.getAddresses);

// 获取默认地址
router.get('/default', AddressController.getDefaultAddress);

// 获取单个地址
router.get('/:id', AddressController.getAddressById);

// 创建地址
router.post('/', validate(addressValidationSchema), AddressController.createAddress);

// 更新地址
router.put('/:id', validate(addressValidationSchema), AddressController.updateAddress);

// 设为默认地址
router.put('/:id/default', AddressController.setDefaultAddress);

// 删除地址
router.delete('/:id', AddressController.deleteAddress);

module.exports = router;
