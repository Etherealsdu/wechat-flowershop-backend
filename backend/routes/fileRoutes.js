const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadFile, uploadBuffer } = require('../utils/oss');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// 单文件上传
router.post('/upload', authenticateToken, checkPermission('manage_files'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有文件被上传' });
    }

    // 将本地文件上传到OSS
    const fileUrl = await uploadBuffer(
      req.file.buffer, 
      req.file.originalname,
      'uploads'
    );

    res.status(200).json({
      message: '文件上传成功',
      url: fileUrl,
      filename: req.file.filename,
      originalname: req.file.originalname
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 多文件上传
router.post('/uploads', authenticateToken, checkPermission('manage_files'), upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '没有文件被上传' });
    }

    // 并行上传所有文件到OSS
    const uploadPromises = req.files.map(file => 
      uploadBuffer(file.buffer, file.originalname, 'uploads')
    );

    const urls = await Promise.all(uploadPromises);

    res.status(200).json({
      message: '文件上传成功',
      urls: urls,
      count: req.files.length
    });
  } catch (error) {
    console.error('多文件上传失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;