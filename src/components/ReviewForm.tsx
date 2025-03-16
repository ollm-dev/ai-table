'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LightbulbIcon } from "@/components/ui/icons";
import { FileIcon, UploadIcon, XIcon } from "lucide-react";

interface ReviewFormProps {
  data: typeof import('@/data/reviewFormData').reviewFormData;
}

/**
 * 项目评审表单组件
 * @param {ReviewFormProps} props - 组件属性
 * @param {Object} props.data - 评审表单数据
 * @returns {JSX.Element} 渲染的表单组件
 */
export default function ReviewForm({ data }: ReviewFormProps) {
  const [formState, setFormState] = useState(() => {
    // 初始化表单状态
    const evaluations = data.evaluationSections.reduce((acc, section) => {
      acc[section.id] = "";
      return acc;
    }, {} as Record<string, string>);
    
    const textEvals = data.textualEvaluations.reduce((acc, section) => {
      acc[section.id] = "";
      return acc;
    }, {} as Record<string, string>);
    
    return { evaluations, textEvals };
  });
  
  // 修改默认值为 false，默认不显示 AI 建议
  const [showEvaluationAI, setShowEvaluationAI] = useState(false);
  
  // 添加一个状态来保存原始文本
  const [originalText, setOriginalText] = useState<Record<string, string>>({});
  
  // 添加PDF上传相关状态
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 添加分析日志状态
  const [analysisLogs, setAnalysisLogs] = useState<Array<{time: string, content: string, type: string}>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 添加后端数据加载状态
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // 添加AI建议数据状态
  const [aiRecommendationsAvailable, setAiRecommendationsAvailable] = useState(false);
  
  // 添加项目信息编辑状态
  const [projectInfo, setProjectInfo] = useState({
    projectTitle: "",
    projectType: "",
    researchField: "",
    applicantName: "",
    applicationId: ""
  });
  
  // 添加编辑状态跟踪
  const [editingField, setEditingField] = useState<string | null>(null);
  
  // 在组件加载时调用fetchReviewData
  useEffect(() => {
    // 如果有项目ID，则获取评审数据
    if (data.projectInfo.applicationId) {
      fetchReviewData(data.projectInfo.applicationId);
    }
  }, [data.projectInfo.applicationId]); // 依赖项为项目ID，当ID变化时重新获取数据
  
  // 从后端获取评审数据 - 这个只获取基础表单数据，不包含AI建议
  const fetchReviewData = async (projectId: string) => {
    try {
      setIsLoadingData(true);
      
      // 实际项目中，这里应该调用后端API获取数据
      // 示例代码:
      // const response = await fetch(`/api/review-data/${projectId}`);
      // if (!response.ok) {
      //   throw new Error('获取评审数据失败');
      // }
      // const reviewData = await response.json();
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟从后端获取的数据 - 实际项目中应使用API返回的数据
      // 注意：这里只获取基础表单数据，不包含AI建议
      const reviewData = {
        textEvaluations: data.textualEvaluations.reduce((acc, section) => {
          // 初始化为空字符串，而不是AI建议
          acc[section.id] = "";
          return acc;
        }, {} as Record<string, string>)
      };
      
      // 更新表单状态
      setFormState(prev => ({
        ...prev,
        textEvals: reviewData.textEvaluations
      }));
      
      setDataLoaded(true);
      console.log('评审数据加载成功');
    } catch (error) {
      console.error('获取评审数据失败:', error);
      addAnalysisLog(`获取评审数据失败: ${error instanceof Error ? error.message : '未知错误'}`, "error");
    } finally {
      setIsLoadingData(false);
    }
  };
  
  // 模拟添加分析日志
  const addAnalysisLog = (content: string, type: string = "normal") => {
    const now = new Date();
    const timeStr = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} PM]`;
    
    setAnalysisLogs(prev => [...prev, { time: timeStr, content, type }]);
    
    // 使用 requestAnimationFrame 确保在DOM更新后再滚动
    requestAnimationFrame(() => {
      const logContainer = document.getElementById('log-container');
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    });
  };
  
  // 与后端API对接的分析方法
  const startAnalysisWithBackend = async (projectId: string, fileId: string) => {
    try {
      // 这里将是与后端API对接的代码
      // 示例：
      // const response = await fetch('/api/analyze-document', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ projectId, fileId }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('分析失败');
      // }
      
      // 可以从后端获取实时分析状态并更新日志
      // const analysisStream = await response.json();
      
      // 在实际实现中，这里可能是WebSocket或SSE连接来获取实时分析进度
      
      // 为演示目的，使用模拟数据
      simulateAnalysis();
      
    } catch (error) {
      console.error('文档分析出错:', error);
      addAnalysisLog(`分析出错: ${error instanceof Error ? error.message : '未知错误'}`, "error");
      setIsAnalyzing(false);
    }
  };
  
  // 模拟分析过程 - 在实际应用中可使用后端返回的真实数据
  const simulateAnalysis = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    setAnalysisLogs([]);
    
    // 初始化日志
    addAnalysisLog("初始化: 准备文档分析模型...", "init");
    
    // 模拟分析过程 - 使用函数来避免重复代码
    const simulateStep = async (content: string, type: string, delay: number) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      addAnalysisLog(content, type);
    };
    
    // 更丰富的分析步骤
    await simulateStep("加载: 加载文档内容...", "loading", 800);
    await simulateStep("加载: 建立文档索引...", "loading", 600);
    await simulateStep("解析: 提取文本与结构内容...", "parsing", 1200);
    await simulateStep("解析: 识别文档结构与章节...", "parsing", 900);
    await simulateStep("解析: 特殊图表与公式识别中...", "parsing", 1100);
    await simulateStep("解析: 完成文档结构化处理 ✓", "parsing-success", 700);
    
    await simulateStep("分析: 正在分析研究方法论...", "analysis", 1000);
    await simulateStep("分析: 提取关键研究假设...", "analysis", 800);
    await simulateStep("分析: 评估实验设计合理性...", "analysis", 1100);
    await simulateStep("分析: 检测创新点与贡献...", "analysis", 900);
    await simulateStep("分析: 完成内容深度分析 ✓", "analysis-success", 600);
    
    await simulateStep("评估: 与历史优质项目对比中...", "evaluation", 1200);
    await simulateStep("评估: 计算相似度矩阵...", "evaluation", 800);
    await simulateStep("评估: 应用评分模型...", "evaluation", 1000);
    await simulateStep("评估: 生成多维度评分...", "evaluation", 900);
    await simulateStep("评估: 完成项目价值评估 ✓", "evaluation-success", 700);
    
    await simulateStep("推理: 综合各维度评分结果...", "reasoning", 1100);
    await simulateStep("推理: 应用决策树模型...", "reasoning", 900);
    await simulateStep("推理: 生成最终推荐意见...", "reasoning", 800);
    await simulateStep("推理: 完成评审建议生成 ✓", "reasoning-success", 600);
    
    await simulateStep("✨ 分析完成: 已生成评审建议", "complete", 500);
    
    setIsAnalyzing(false);
    
    // 分析完成后，设置项目信息
    setProjectInfo({
      projectTitle: data.projectInfo.projectTitle,
      projectType: data.projectInfo.projectType,
      researchField: data.projectInfo.researchField,
      applicantName: data.projectInfo.applicantName,
      applicationId: data.projectInfo.applicationId
    });
    
    // 分析完成后，设置AI建议可用状态
    // 实际项目中，这里应该是从后端获取AI建议数据
    // 示例代码:
    // const aiRecommendationsResponse = await fetch(`/api/ai-recommendations/${projectId}`);
    // if (aiRecommendationsResponse.ok) {
    //   const aiRecommendationsData = await aiRecommendationsResponse.json();
    //   // 更新AI建议数据
    //   // ...
    //   setAiRecommendationsAvailable(true);
    //   setShowEvaluationAI(true);
    // }
    
    // 模拟AI建议数据获取成功
    setTimeout(() => {
      setAiRecommendationsAvailable(true);
      setShowEvaluationAI(true);
    }, 100);
  };
  
  /**
   * 处理单选按钮值变更
   * @param {string} sectionId - 评估部分ID
   * @param {string} value - 选中的值
   */
  const handleRadioChange = (sectionId: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      evaluations: {
        ...prev.evaluations,
        [sectionId]: prev.evaluations[sectionId] === value ? "" : value
      }
    }));
  };
  
  const handleTextChange = (id: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      textEvals: {
        ...prev.textEvals,
        [id]: value
      }
    }));
  };
  
  /**
   * 处理"使用AI建议"按钮点击
   * @param {string} id - 文本区域ID
   * @param {string} aiRecommendation - AI建议内容
   */
  const handleAIRecommendationToggle = (id: string, aiRecommendation: string, e?: React.MouseEvent) => {
    // 阻止默认行为，防止页面跳转
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 检查当前文本是否已经是AI建议
    const isCurrentlyAI = formState.textEvals[id] === aiRecommendation;
    
    if (isCurrentlyAI) {
      // 如果当前已经是AI建议，恢复到原始文本
      handleTextChange(id, originalText[id] || "");
    } else {
      // 保存当前文本作为原始文本
      setOriginalText(prev => ({
        ...prev,
        [id]: formState.textEvals[id]
      }));
      
      // 设置为AI建议
      handleTextChange(id, aiRecommendation);
    }
  };
  
  /**
   * 处理PDF文件选择
   * @param {React.ChangeEvent<HTMLInputElement>} e - 文件输入事件
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
  const handleUploadPdf = async () => {
    if (!pdfFile) {
      setUploadError('请先选择PDF文件');
      return;
    }
    
    try {
      setUploading(true);
      setUploadError(null);
      
      // 重置AI建议状态
      setAiRecommendationsAvailable(false);
      setShowEvaluationAI(false);
      
      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('projectId', data.projectInfo.applicationId);
      
      // 与后端API对接 - 上传文件
      // 实际实现中取消注释此部分代码
      /*
      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('上传失败');
      }
      
      const result = await response.json();
      const { fileId } = result;
      
      // 上传成功后，启动文件分析
      startAnalysisWithBackend(data.projectInfo.applicationId, fileId);
      */
      
      // 模拟上传成功
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('PDF上传成功:', pdfFile.name);
      
      // 开始分析过程 - 模拟
      // 实际实现中应该调用 startAnalysisWithBackend 并传入实际 fileId
      simulateAnalysis();
      
    } catch (error) {
      console.error('上传PDF时出错:', error);
      setUploadError(error instanceof Error ? error.message : '上传失败');
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  /**
   * 处理项目信息字段编辑
   * @param {string} field - 字段名称
   * @param {string} value - 新值
   */
  const handleProjectInfoChange = (field: string, value: string) => {
    setProjectInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  /**
   * 开始编辑字段
   * @param {string} field - 要编辑的字段名称
   */
  const startEditing = (field: string) => {
    // 只有在AI建议可用时才允许编辑（即文件已上传并分析完成）
    if (aiRecommendationsAvailable) {
      setEditingField(field);
    }
  };
  
  /**
   * 结束编辑字段
   */
  const stopEditing = () => {
    setEditingField(null);
  };
  
  return (
    <form className="w-full max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-white">
      <Card className="mb-8 overflow-hidden rounded-2xl bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <CardHeader className="bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 border-b border-primary-100 py-8">
          <div className="flex justify-between items-center">
            <div className="animate-fadeIn">
              <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">
                <span className="inline-block w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-4 align-middle"></span>
                {data.formTitle}
              </CardTitle>
            </div>
            
            {/* PDF上传功能 */}
            <div className="flex items-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                id="pdf-upload"
              />
              
              {!pdfFile ? (
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center border-primary-200 text-primary-600 hover:bg-primary-50 transition-all duration-300 rounded-full shadow-sm hover:shadow px-6"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon className="h-4 w-4 mr-2" />
                  上传PDF文件
                </Button>
              ) : (
                <div className="flex items-center bg-white/80 px-5 py-2.5 rounded-full border border-primary-200 shadow-sm">
                  <FileIcon className="h-4 w-4 text-primary-500 mr-2" />
                  <span className="text-sm text-gray-700 max-w-[150px] truncate">{pdfFile.name}</span>
                  <div className="flex ml-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 rounded-full"
                      onClick={handleRemovePdf}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="ml-2 h-7 text-xs rounded-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={handleUploadPdf}
                      disabled={uploading}
                    >
                      {uploading ? '上传中...' : '确认上传'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 显示上传错误信息 */}
          {uploadError && (
            <div className="mt-4 text-sm text-red-500 bg-red-50/50 backdrop-blur-sm p-3 rounded-xl border border-red-100 animate-fadeIn">
              <span className="font-medium">错误：</span>{uploadError}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-8">
          {/* 个人信息部分 */}
          <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
            <span className="inline-block w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-4"></span>
            个人信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500">
            
            <div className="space-y-5">
              <div 
                className={`group flex flex-col glass-morphism p-4 rounded-xl transition-all duration-500 ${
                  aiRecommendationsAvailable ? "hover:translate-y-[-2px] cursor-pointer" : "opacity-80"
                }`}
                onClick={() => startEditing('projectTitle')}
              >
                <span className="text-sm text-gray-500 mb-2 font-medium">项目名称</span>
                {editingField === 'projectTitle' ? (
                  <input
                    type="text"
                    value={projectInfo.projectTitle}
                    onChange={(e) => handleProjectInfoChange('projectTitle', e.target.value)}
                    onBlur={stopEditing}
                    autoFocus
                    className="font-medium text-gray-900 bg-white/50 backdrop-blur border border-primary-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-gray-800 ${aiRecommendationsAvailable ? "group-hover:text-primary-600" : ""} transition-colors duration-300`}>
                      {projectInfo.projectTitle || (aiRecommendationsAvailable ? "加载中..." : "")}
                    </span>
                    {aiRecommendationsAvailable && (
                      <span className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div 
                className={`group flex flex-col glass-morphism p-4 rounded-xl transition-all duration-500 ${
                  aiRecommendationsAvailable ? "hover:translate-y-[-2px] cursor-pointer" : "opacity-80"
                }`}
                onClick={() => startEditing('projectType')}
              >
                <span className="text-sm text-gray-500 mb-2 font-medium">项目类别</span>
                {editingField === 'projectType' ? (
                  <input
                    type="text"
                    value={projectInfo.projectType}
                    onChange={(e) => handleProjectInfoChange('projectType', e.target.value)}
                    onBlur={stopEditing}
                    autoFocus
                    className="font-medium text-gray-900 bg-white/50 backdrop-blur border border-primary-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-gray-800 ${aiRecommendationsAvailable ? "group-hover:text-primary-600" : ""} transition-colors duration-300`}>
                      {projectInfo.projectType || (aiRecommendationsAvailable ? "加载中..." : "")}
                    </span>
                    {aiRecommendationsAvailable && (
                      <span className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div 
                className={`group flex flex-col glass-morphism p-4 rounded-xl transition-all duration-500 ${
                  aiRecommendationsAvailable ? "hover:translate-y-[-2px] cursor-pointer" : "opacity-80"
                }`}
                onClick={() => startEditing('researchField')}
              >
                <span className="text-sm text-gray-500 mb-2 font-medium">研究领域</span>
                {editingField === 'researchField' ? (
                  <input
                    type="text"
                    value={projectInfo.researchField}
                    onChange={(e) => handleProjectInfoChange('researchField', e.target.value)}
                    onBlur={stopEditing}
                    autoFocus
                    className="font-medium text-gray-900 bg-white/50 backdrop-blur border border-primary-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-gray-800 ${aiRecommendationsAvailable ? "group-hover:text-primary-600" : ""} transition-colors duration-300`}>
                      {projectInfo.researchField || (aiRecommendationsAvailable ? "加载中..." : "")}
                    </span>
                    {aiRecommendationsAvailable && (
                      <span className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-5">
              <div 
                className={`group flex flex-col glass-morphism p-4 rounded-xl transition-all duration-500 ${
                  aiRecommendationsAvailable ? "hover:translate-y-[-2px] cursor-pointer" : "opacity-80"
                }`}
                onClick={() => startEditing('applicantName')}
              >
                <span className="text-sm text-gray-500 mb-2 font-medium">申请人姓名</span>
                {editingField === 'applicantName' ? (
                  <input
                    type="text"
                    value={projectInfo.applicantName}
                    onChange={(e) => handleProjectInfoChange('applicantName', e.target.value)}
                    onBlur={stopEditing}
                    autoFocus
                    className="font-medium text-gray-900 bg-white/50 backdrop-blur border border-primary-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-gray-800 ${aiRecommendationsAvailable ? "group-hover:text-primary-600" : ""} transition-colors duration-300`}>
                      {projectInfo.applicantName || (aiRecommendationsAvailable ? "加载中..." : "")}
                    </span>
                    {aiRecommendationsAvailable && (
                      <span className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div 
                className={`group flex flex-col glass-morphism p-4 rounded-xl transition-all duration-500 ${
                  aiRecommendationsAvailable ? "hover:translate-y-[-2px] cursor-pointer" : "opacity-80"
                }`}
                onClick={() => startEditing('applicationId')}
              >
                <span className="text-sm text-gray-500 mb-2 font-medium">申请代码</span>
                {editingField === 'applicationId' ? (
                  <input
                    type="text"
                    value={projectInfo.applicationId}
                    onChange={(e) => handleProjectInfoChange('applicationId', e.target.value)}
                    onBlur={stopEditing}
                    autoFocus
                    className="font-medium text-gray-900 bg-white/50 backdrop-blur border border-primary-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-gray-800 ${aiRecommendationsAvailable ? "group-hover:text-primary-600" : ""} transition-colors duration-300`}>
                      {projectInfo.applicationId || (aiRecommendationsAvailable ? "加载中..." : "")}
                    </span>
                    {aiRecommendationsAvailable && (
                      <span className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 评估选项部分 */}
          <div className="space-y-8 mb-12 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center pb-3 border-b-2 border-primary-100">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="inline-block w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-4"></span>
                评估选项
              </h3>
              <div className="text-sm text-primary-600 font-medium">
                {isAnalyzing ? "实时分析进行中..." : pdfFile ? "准备开始分析..." : "上传文件后开始分析"}
              </div>
            </div>
            
            {/* 修改评估选项的样式 */}
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 order-2 lg:order-1">
                <div className="space-y-6">
                  {data.evaluationSections.map((section, sectionIndex) => (
                    <div 
                      key={section.id} 
                      className="space-y-4 p-6 rounded-2xl hover:bg-gray-50/50 transition-all duration-500 border border-gray-100 shadow-sm hover:shadow-lg animate-fadeIn backdrop-blur-sm"
                      style={{ animationDelay: `${0.1 * sectionIndex}s` }}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center mb-4">
                          <h4 className="font-medium text-gray-800">{section.title}</h4>
                          {section.required && (
                            <Badge variant="required" className="ml-2 bg-red-50 text-red-600 border border-red-100">
                              必填
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4">
                          {section.options.map((option, index) => (
                            <div 
                              key={index} 
                              onClick={() => handleRadioChange(section.id, option)}
                              className={`flex items-center justify-center px-8 py-2.5 rounded-xl transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                                formState.evaluations[section.id] === option 
                                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg" 
                                  : "bg-white text-gray-700 border border-gray-200 hover:border-primary-200 hover:bg-primary-50/10"
                              }`}
                            >
                              <span className="cursor-pointer font-medium">
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* AI建议部分 */}
                      {aiRecommendationsAvailable && showEvaluationAI && (
                        <div className="flex items-center mt-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100 animate-fadeIn backdrop-blur-sm">
                          <span className="text-gray-600 mr-3 font-medium">AI建议:</span>
                          <Badge className={`${
                            section.id === 'maturity' && section.aiRecommendation === '熟悉' ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200' :
                            section.id === 'rating' && section.aiRecommendation === '优' ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-primary-200' :
                            section.id === 'funding' && section.aiRecommendation === '优先资助' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200' :
                            'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200'
                          } hover:bg-opacity-80 border shadow-sm transform hover:scale-105 transition-all duration-300 px-4 py-1 rounded-full`}>
                            {section.aiRecommendation}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* AI思考过程部分 */}
              <div className="w-full lg:w-2/5 order-1 lg:order-2 lg:border-l lg:pl-8 border-gray-100">
                <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-100 h-[400px] flex flex-col shadow-lg hover:shadow-xl transition-all duration-500 backdrop-blur-sm">
                  <h4 className="text-primary-600 font-medium mb-5 text-center flex items-center justify-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
                    AI分析引擎思考过程
                  </h4>
                  
                  {/* 分析日志区域 */}
                  <div 
                    id="log-container"
                    className="flex-1 bg-gray-50/50 p-5 rounded-xl text-sm shadow-inner backdrop-blur-sm" 
                    style={{ 
                      height: '320px',
                      overflowY: 'auto',
                      overscrollBehavior: 'contain',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e0 #f7fafc',
                      position: 'relative',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                    }}
                  >
                    {analysisLogs.length === 0 ? (
                      <div className="text-center text-gray-600 py-10 flex flex-col items-center justify-center h-full">
                        {pdfFile ? (
                          <>
                            <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                            <p className="font-medium">准备开始分析...</p>
                          </>
                        ) : (
                          <>
                            <div className="relative bg-gray-200 p-6 rounded-lg border border-dashed border-gray-300 w-36 h-36 flex items-center justify-center">
                              <UploadIcon className="h-12 w-12 text-primary-500 animate-bounce-subtle" />
                              <div className="absolute -top-2 -right-2">
                                <span className="inline-block h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200">
                                  <span className="text-primary-500 text-lg">?</span>
                                </span>
                              </div>
                            </div>
                            <p className="mt-4 font-medium text-gray-700">请先上传PDF文件开始分析</p>
                            <p className="mt-1 text-xs text-gray-500">支持10MB以内的PDF文件</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 terminal-text">
                        {analysisLogs.map((log, index) => (
                          <div key={index} className="flex items-start animate-fadeIn" style={{ animationDelay: `${0.05 * index}s` }}>
                            <span className="text-gray-500 mr-2 whitespace-nowrap font-medium">{log.time}</span>
                            <span className={`font-medium ${
                              log.type === 'init' ? 'text-primary-600' : 
                              log.type === 'loading' ? 'text-primary-700' : 
                              log.type === 'parsing' ? 'text-indigo-700' : 
                              log.type === 'parsing-success' ? 'text-indigo-800 font-bold' : 
                              log.type === 'analysis' ? 'text-purple-700' : 
                              log.type === 'analysis-success' ? 'text-purple-800 font-bold' : 
                              log.type === 'evaluation' ? 'text-orange-700' : 
                              log.type === 'evaluation-success' ? 'text-orange-800 font-bold' : 
                              log.type === 'reasoning' ? 'text-pink-700' : 
                              log.type === 'reasoning-success' ? 'text-pink-800 font-bold' : 
                              log.type === 'verification' ? 'text-green-700' : 
                              log.type === 'complete' ? 'text-emerald-700 font-bold text-base' : 
                              log.type === 'error' ? 'text-red-600 font-bold' : 
                              'text-gray-700'
                            }`}>
                              {log.content}
                              {log.type.includes('success') && (
                                <span className="inline-block ml-1 animate-pulse text-green-600">✓</span>
                              )}
                              {log.type === 'complete' && (
                                <span className="inline-block ml-1 animate-bounce text-emerald-500">🎉</span>
                              )}
                              {log.type === 'error' && (
                                <span className="inline-block ml-1 animate-pulse text-red-500">❌</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 文本评价部分 */}
          <div className="space-y-8 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
            <div className="flex justify-between items-center pb-3 border-b-2 border-primary-100">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="inline-block w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-4"></span>
                评价意见
              </h3>
              {isLoadingData && (
                <div className="flex items-center text-primary-600">
                  <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
                  <span className="text-sm">加载评审数据中...</span>
                </div>
              )}
            </div>
            
            {data.textualEvaluations.map((section, sectionIndex) => (
              <div 
                key={section.id} 
                className="space-y-4 p-6 rounded-2xl hover:bg-gray-50/50 transition-all duration-500 border border-gray-100 shadow-sm hover:shadow-lg animate-fadeIn backdrop-blur-sm"
                style={{ animationDelay: `${0.5 + 0.1 * sectionIndex}s` }}
              >
                <div className="flex items-center mb-3">
                  <h4 className="font-medium text-gray-800">{section.title}</h4>
                  {section.required && (
                    <Badge variant="required" className="ml-2 bg-red-50 text-red-600 border border-red-100">
                      必填
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 左侧：用户输入 */}
                  <div className="relative">
                    <span className="text-sm font-medium text-red-500 mb-2 absolute -top-3 left-4 bg-white px-2 shadow-sm border border-red-100 rounded-full">专家输入</span>
                    {isLoadingData ? (
                      <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mb-2"></div>
                          <span className="text-gray-500">加载中...</span>
                        </div>
                      </div>
                    ) : (
                      <Textarea
                        value={formState.textEvals[section.id]}
                        onChange={(e) => handleTextChange(section.id, e.target.value)}
                        placeholder={section.placeholder}
                        className="min-h-[200px] resize-y textarea-light focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all duration-200 rounded-lg shadow-inner pt-4"
                        style={{
                          color: '#000000',
                          backgroundColor: '#ffffff',
                          border: '1px solid #d1d5db'
                        }}
                      />
                    )}
                    {!isLoadingData && (
                      <div className="absolute bottom-3 right-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          (formState.textEvals[section.id]?.length || 0) < section.minLength 
                            ? 'bg-red-50 text-red-500 font-medium' 
                            : 'bg-green-50 text-green-600'
                        }`}>
                          {formState.textEvals[section.id]?.length || 0}/{section.minLength} 字符
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 右侧：AI建议 - 只有在AI建议可用时才显示按钮 */}
                  <div className="relative">
                    <span className="text-sm font-medium text-primary-500 mb-2 absolute -top-3 left-4 bg-white px-2 shadow-sm border border-primary-100 rounded-full flex items-center">
                      <LightbulbIcon className="h-3 w-3 mr-1 text-yellow-500" />
                      AI建议
                    </span>
                    <div 
                      className="min-h-[200px] p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 overflow-y-auto shadow-inner"
                      style={{ height: 'calc(100% - 8px)' }}
                    >
                      {aiRecommendationsAvailable ? (
                        <>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {section.aiRecommendation}
                          </p>
                          <div className="flex justify-end mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleAIRecommendationToggle(section.id, section.aiRecommendation, e)}
                              className="text-xs text-primary-600 border-primary-200 hover:bg-primary-50 rounded-full transform hover:scale-105 transition-all duration-300"
                            >
                              {formState.textEvals[section.id] === section.aiRecommendation ? '恢复我的文本' : '使用AI建议'}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          <div className="bg-gray-100 p-3 rounded-full mb-3">
                            <LightbulbIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium mb-1">AI建议尚未生成</p>
                          <p className="text-gray-400 text-sm">请在页面顶部上传PDF文件并等待分析完成</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <style jsx>{`
        .glass-morphism {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        #log-container::-webkit-scrollbar {
          width: 4px;
        }
        
        #log-container::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.5);
          border-radius: 2px;
        }
        
        #log-container::-webkit-scrollbar-thumb {
          background-color: rgba(203, 213, 225, 0.5);
          border-radius: 2px;
        }
        
        #log-container::-webkit-scrollbar-thumb:hover {
          background-color: rgba(203, 213, 225, 0.8);
        }
      `}</style>
    </form>
  );
} 