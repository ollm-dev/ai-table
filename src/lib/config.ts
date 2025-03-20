/**
 * 项目配置文件
 * @module Config
 * @description 管理项目中的配置参数，包括API地址等
 */

// 判断当前环境
const isDevelopment = process.env.NODE_ENV === 'development';

// 获取自定义API基础URL（如果有的话）
const customApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * API配置
 */
export const API_CONFIG = {
  // 根据环境选择不同的API基础URL
  BASE_URL: customApiBaseUrl || (isDevelopment
    ? 'http://localhost:5555' // 本地开发环境默认地址
    : 'https://api-reviewer.arxivs.com'), // 生产环境地址
  
  // API端点
  ENDPOINTS: {
    UPLOAD: '/upload',
    REVIEW: '/review'
  },
  
  /**
   * 获取完整的API URL
   * @param {string} endpoint - API端点路径
   * @returns {string} 完整的API URL
   */
  getFullUrl(endpoint: string): string {
    return `${this.BASE_URL}${endpoint}`;
  }
};

/**
 * 获取上传API的URL
 * @returns {string} 上传API的完整URL
 */
export function getUploadUrl(): string {
  return API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.UPLOAD);
}

/**
 * 获取评审API的URL
 * @returns {string} 评审API的完整URL
 */
export function getReviewUrl(): string {
  return API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.REVIEW);
} 