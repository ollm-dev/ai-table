import { useState, useRef } from 'react';
// 导入API URL配置
import { getUploadUrl } from '../lib/config';

export function useFileUpload(onAnalysisStart: (filePath: string) => Promise<void>, addAnalysisLog: (content: string, type?: string) => void) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  /**
   * 处理PDF文件选择
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadError(null);
    
    if (!file) {
      return;
    }
    
    // 验证文件类型
    if (file.type !== 'application/pdf') {
      setUploadError('只支持PDF文件');
      return;
    }
    
    // 验证文件大小 (限制为10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('文件大小不能超过10MB');
      return;
    }
    
    setPdfFile(file);
  };
  
  /**
   * 处理PDF文件上传
   */
  const handleUploadPdf = async (onResetAI: () => void) => {
    if (!pdfFile) {
      setUploadError('请先选择PDF文件');
      return;
    }
    
    try {
      setUploading(true);
      setUploadError(null);
      
      // 重置AI建议状态
      onResetAI();
      
      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', pdfFile);
      
      // 添加详细日志
      console.log('📤 正在上传PDF到后端API:', {
        fileName: pdfFile.name,
        fileSize: `${(pdfFile.size / 1024).toFixed(2)} KB`,
        fileType: pdfFile.type
      });
      
      // 获取并记录API URL
      const uploadUrl = getUploadUrl();
      console.log('🔗 上传API地址:', uploadUrl);
      
      addAnalysisLog(`开始上传文件: ${pdfFile.name}`, "upload-start");
      
      // 使用带有超时的fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // 清除超时
      
      console.log('📡 响应状态:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        // 检查是否为验证错误(422)
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(`验证错误: ${errorData.detail || '文件格式不正确'}`);
        }
        
        // 尝试解析错误响应
        let errorMessage = `上传失败: ${response.status} ${response.statusText}`;
        try {
          const errorBody = await response.text();
          console.error('📋 错误响应内容:', errorBody);
          
          // 尝试解析为JSON
          try {
            const errorJson = JSON.parse(errorBody);
            if (errorJson.detail) {
              errorMessage = `上传失败: ${errorJson.detail}`;
            }
          } catch (jsonError) {
            // 如果不是JSON，直接使用文本内容
            if (errorBody && errorBody.length < 500) { // 避免太长的错误信息
              errorMessage = `上传失败: ${errorBody}`;
            }
          }
        } catch (textError) {
          console.error('无法读取错误响应内容', textError);
        }
        
        throw new Error(errorMessage);
      }
      
      // 解析响应
      const result = await response.json();
      console.log('✅ 上传成功，服务器返回:', result);
      addAnalysisLog(`文件上传成功: ${result.file_name || pdfFile.name}`, "upload-success");
      
      // 开始分析
      if (result.file_path) {
        // 使用返回的文件路径调用分析API
        await onAnalysisStart(result.file_path);
      } else {
        throw new Error('服务器未返回文件路径');
      }
      
    } catch (error) {
      console.error('❌ 上传PDF出错:', error);
      const errorMessage = `上传失败: ${error instanceof Error ? error.message : '未知错误'}`;
      
      // 添加更具体的错误信息
      if (error instanceof DOMException && error.name === 'AbortError') {
        setUploadError('上传超时，请稍后重试或检查服务器状态');
        addAnalysisLog('上传超时，请稍后重试或检查服务器状态', "error");
      } else {
        setUploadError(errorMessage);
        addAnalysisLog(errorMessage, "error");
      }
    } finally {
      setUploading(false);
    }
  };
  
  /**
   * 移除已选择的PDF文件
   */
  const handleRemovePdf = () => {
    setPdfFile(null);
    setUploadError(null);
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return {
    pdfFile,
    uploading,
    uploadError,
    fileInputRef,
    handleFileChange,
    handleUploadPdf,
    handleRemovePdf
  };
} 