const OSS = require('ali-oss');
const config = require('../config/config');

// 创建OSS客户端
const client = new OSS({
  region: config.alioss.region,
  accessKeyId: config.alioss.accessKeyId,
  accessKeySecret: config.alioss.accessKeySecret,
  bucket: config.alioss.bucket
});

/**
 * 上传文件到阿里云OSS
 * @param {Buffer} fileBuffer - 文件内容
 * @param {string} fileName - 文件名
 * @param {string} folder - 存储目录
 * @returns {Promise<string>} 返回文件URL
 */
async function uploadFile(fileBuffer, fileName, folder = 'images') {
  try {
    // 生成唯一文件名
    const uniqueFileName = `${folder}/${Date.now()}_${fileName}`;
    
    // 上传文件
    const result = await client.put(uniqueFileName, fileBuffer);
    
    return result.url;
  } catch (error) {
    console.error('OSS上传失败:', error);
    throw new Error(`文件上传失败: ${error.message}`);
  }
}

/**
 * 上传Buffer到OSS
 * @param {Buffer} buffer - 文件Buffer
 * @param {string} fileName - 文件名
 * @param {string} folder - 存储目录
 * @returns {Promise<string>} 返回文件URL
 */
async function uploadBuffer(buffer, fileName, folder = 'images') {
  try {
    // 生成唯一文件名
    const uniqueFileName = `${folder}/${Date.now()}_${fileName}`;
    
    // 上传文件
    const result = await client.put(uniqueFileName, buffer);
    
    return result.url;
  } catch (error) {
    console.error('OSS上传失败:', error);
    throw new Error(`文件上传失败: ${error.message}`);
  }
}

/**
 * 删除OSS上的文件
 * @param {string} fileName - 文件名（包含路径）
 * @returns {Promise<boolean>} 删除结果
 */
async function deleteFile(fileName) {
  try {
    await client.delete(fileName);
    return true;
  } catch (error) {
    console.error('OSS删除失败:', error);
    throw new Error(`文件删除失败: ${error.message}`);
  }
}

/**
 * 批量删除OSS上的文件
 * @param {string[]} fileNames - 文件名数组
 * @returns {Promise<boolean>} 删除结果
 */
async function deleteFiles(fileNames) {
  try {
    await client.deleteMulti(fileNames);
    return true;
  } catch (error) {
    console.error('OSS批量删除失败:', error);
    throw new Error(`文件批量删除失败: ${error.message}`);
  }
}

module.exports = {
  uploadFile,
  uploadBuffer,
  deleteFile,
  deleteFiles
};