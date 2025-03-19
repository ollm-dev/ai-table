import { useState, useRef } from 'react';

export function useFileUpload(onAnalysisStart: (projectId: string, filePath: string) => Promise<void>, addAnalysisLog: (content: string, type?: string) => void) {
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
  const handleUploadPdf = async (projectId: string, onResetAI: () => void) => {
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
      
      // 直接与后端API对接 - 上传文件
      console.log('正在上传PDF到后端API:', pdfFile.name);
      
      // 使用完整的后端URL
      const response = await fetch('https://api-reviewer.arxivs.com/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        // 检查是否为验证错误(422)
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(`验证错误: ${errorData.detail || '文件格式不正确'}`);
        }
        throw new Error(`上传失败: ${response.status} ${response.statusText}`);
      }
      
      // 解析响应
      const result = await response.json();
      console.log('上传成功，服务器返回:', result);
      
      // 开始分析
      if (result.file_path) {
        // 使用返回的文件路径调用分析API
        await onAnalysisStart(projectId || "unknown", result.file_path);
      } else {
        throw new Error('服务器未返回文件路径');
      }
      
    } catch (error) {
      console.error('上传PDF出错:', error);
      setUploadError(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
      addAnalysisLog(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`, "error");
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