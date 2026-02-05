const OSS = require('ali-oss');
const config = require('../config/config');

// OSS客户端实例
let client = null;

/**
 * 初始化OSS客户端
 * 在测试环境或没有配置时返回null
 */
function initOSSClient() {
  // 如果已经初始化过，直接返回
  if (client !== null) {
    return client;
  }

  // 检查是否在测试环境
  if (process.env.NODE_ENV === 'test') {
    console.log('OSS客户端在测试环境中被禁用');
    return null;
  }

  // 检查必要的配置
  const { accessKeyId, accessKeySecret, bucket, region } = config.alioss;
  if (!accessKeyId || !accessKeySecret || !bucket) {
    console.warn('OSS配置不完整，文件上传功能将不可用');
    return null;
  }

  try {
    client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket
    });
    console.log('OSS客户端初始化成功');
    return client;
  } catch (error) {
    console.error('OSS客户端初始化失败:', error.message);
    return null;
  }
}

// 获取OSS客户端
function getClient() {
  return initOSSClient();
}

/**
 * 上传文件到阿里云OSS
 * @param {Buffer} fileBuffer - 文件内容
 * @param {string} fileName - 文件名
 * @param {string} folder - 存储目录
 * @returns {Promise<string>} 返回文件URL
 */
async function uploadFile(fileBuffer, fileName, folder = 'images') {
  const ossClient = getClient();
  if (!ossClient) {
    throw new Error('OSS客户端未配置，无法上传文件');
  }

  try {
    // 生成唯一文件名
    const uniqueFileName = `${folder}/${Date.now()}_${fileName}`;

    // 上传文件
    const result = await ossClient.put(uniqueFileName, fileBuffer);

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
  const ossClient = getClient();
  if (!ossClient) {
    throw new Error('OSS客户端未配置，无法上传文件');
  }

  try {
    // 生成唯一文件名
    const uniqueFileName = `${folder}/${Date.now()}_${fileName}`;

    // 上传文件
    const result = await ossClient.put(uniqueFileName, buffer);

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
  const ossClient = getClient();
  if (!ossClient) {
    throw new Error('OSS客户端未配置，无法删除文件');
  }

  try {
    await ossClient.delete(fileName);
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
  const ossClient = getClient();
  if (!ossClient) {
    throw new Error('OSS客户端未配置，无法删除文件');
  }

  try {
    await ossClient.deleteMulti(fileNames);
    return true;
  } catch (error) {
    console.error('OSS批量删除失败:', error);
    throw new Error(`文件批量删除失败: ${error.message}`);
  }
}

/**
 * 检查OSS是否可用
 * @returns {boolean}
 */
function isOSSAvailable() {
  return getClient() !== null;
}

module.exports = {
  uploadFile,
  uploadBuffer,
  deleteFile,
  deleteFiles,
  isOSSAvailable
};