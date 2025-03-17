import { useState, useEffect, useRef, useCallback } from 'react';
import { reviewFormData } from '../data/reviewFormData';

// 模拟思考过程的文本数组
const thinkingTexts = [
  "正在加载论文内容...",
  "分析论文结构...",
  "提取研究方法...",
  "评估研究创新点...",
  "检查实验设计...",
  "分析数据处理方法...",
  "评估结论有效性...",
  "检查参考文献质量...",
  "综合评估研究价值...",
  "生成评审意见..."
];

// 初始化一个空的表单数据结构
const emptyFormData = {
  formTitle: "评审意见表",
  projectInfo: {
    projectTitle: "",
    projectType: "",
    researchField: "",
    applicantName: "",
    applicationId: ""
  },
  evaluationSections: [],
  textualEvaluations: []
};

// 判断两个对象是否相等（用于防止重复更新）
const isEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

export function useAnalysisLogs() {
  const [analysisLogs, setAnalysisLogs] = useState<Array<{time: string, content: string, type: string}>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [reasoningText, setReasoningText] = useState('');
  const [finalContent, setFinalContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // 使用 useRef 缓存最新的表单数据，初始化为空的表单数据结构
  const formDataRef = useRef({...emptyFormData});
  
  // 使用 useState 生成响应式的表单数据
  const [formData, setFormData] = useState({...emptyFormData});
  
  // 使用 ref 记录是否已初始化结构
  const structureInitializedRef = useRef(false);
  
  // 最近一次更新的时间戳，用于节流
  const lastUpdateTimeRef = useRef(0);
  
  // 使用 useRef 存储更新回调
  const dataUpdateCallbackRef = useRef<((data: any) => void) | null>(null);
  
  // 注册外部更新回调的方法
  const registerUpdateCallback = useCallback((callback: (data: any) => void) => {
    dataUpdateCallbackRef.current = callback;
  }, []);
  
  // 添加分析日志
  const addAnalysisLog = (content: string, type: string = "normal") => {
    setAnalysisLogs(prev => [...prev, { time: new Date().toISOString(), content, type }]);
  };
  
  // 更新特定类型的日志内容
  const updateLogContent = (type: string, content: string, append: boolean = false) => {
    setAnalysisLogs(prev => {
      const index = prev.findIndex(log => log.type === type);
      if (index === -1) {
        // 如果不存在该类型的日志，创建新的
        return [...prev, { time: new Date().toISOString(), content, type }];
      } else {
        // 如果存在，更新或追加内容
        const newLogs = [...prev];
        newLogs[index] = {
          ...newLogs[index],
          content: append ? newLogs[index].content + content : content
        };
        return newLogs;
      }
    });
  };
  
  // 初始化表单结构（首次使用）
  const initializeFormStructure = useCallback((initialData: any) => {
    if (structureInitializedRef.current || !initialData) return;
    
    try {
      console.log('🏗️ 初始化表单结构:', initialData);
      
      // 标准化 JSON 结构，确保所有属性名使用双引号
      const normalizedData = typeof initialData === 'string' 
        ? JSON.parse(initialData) 
        : initialData;
      
      // 更新 ref 缓存的数据
      const updatedFormData = {
        ...emptyFormData,
        ...(normalizedData || {}),
      };
      
      // 如果没有提供评估部分或文本评估部分，使用默认值
      if (!updatedFormData.evaluationSections || !Array.isArray(updatedFormData.evaluationSections) || updatedFormData.evaluationSections.length === 0) {
        updatedFormData.evaluationSections = [...reviewFormData.evaluationSections];
      }
      
      if (!updatedFormData.textualEvaluations || !Array.isArray(updatedFormData.textualEvaluations) || updatedFormData.textualEvaluations.length === 0) {
        updatedFormData.textualEvaluations = [...reviewFormData.textualEvaluations];
      }
      
      formDataRef.current = updatedFormData;
      
      // 更新状态中的数据，触发组件重渲染
      setFormData(prevData => {
        // 如果新数据与旧数据相同，不进行更新（防止不必要的重渲染）
        if (isEqual(prevData, updatedFormData)) {
          return prevData;
        }
        return updatedFormData;
      });
      
      // 标记为已初始化
      structureInitializedRef.current = true;
      
      // 调用外部更新回调
      if (dataUpdateCallbackRef.current) {
        dataUpdateCallbackRef.current(updatedFormData);
      }
      
      addAnalysisLog("表单结构已初始化", "structure-init");
    } catch (error) {
      console.error('❌ 初始化表单结构失败:', error);
      addAnalysisLog(`初始化表单结构失败: ${error instanceof Error ? error.message : '未知错误'}`, "error");
    }
  }, [addAnalysisLog]);
  
  // 更新表单数据
  const updateFormData = useCallback((jsonStructure: any, isPartial: boolean = false) => {
    if (!jsonStructure) return;
    
    try {
      // 节流控制：200ms 内只更新一次（防止高频更新）
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 200) {
        return;
      }
      lastUpdateTimeRef.current = now;
      
      console.log('📊 接收到表单数据结构:', jsonStructure, isPartial ? '(部分更新)' : '(完整更新)');
      
      // 标准化 JSON 结构
      const normalizedData = typeof jsonStructure === 'string' 
        ? JSON.parse(jsonStructure) 
        : jsonStructure;
      
      // 如果结构未初始化且非部分更新，则初始化结构
      if (!structureInitializedRef.current && !isPartial) {
        initializeFormStructure(normalizedData);
        return;
      }
      
      // 深拷贝当前表单数据
      const updatedFormData = JSON.parse(JSON.stringify(formDataRef.current));
      
      // 更新项目信息
      if (normalizedData.projectInfo) {
        updatedFormData.projectInfo = {
          ...updatedFormData.projectInfo,
          ...normalizedData.projectInfo
        };
      }
      
      // 更新评估部分
      if (normalizedData.evaluationSections && Array.isArray(normalizedData.evaluationSections)) {
        normalizedData.evaluationSections.forEach((section: any) => {
          // 确保 evaluationSections 已初始化
          if (!updatedFormData.evaluationSections) {
            updatedFormData.evaluationSections = [];
          }
          
          if (!section.id) return; // 跳过没有 id 的部分
          
          const index = updatedFormData.evaluationSections.findIndex((s: any) => s.id === section.id);
          if (index !== -1) {
            // 已存在项，更新其属性
            updatedFormData.evaluationSections[index] = {
              ...updatedFormData.evaluationSections[index],
              ...section,
              // 确保 aiRecommendation 和 aiReason 正确更新
              aiRecommendation: section.aiRecommendation !== undefined ? 
                section.aiRecommendation : 
                updatedFormData.evaluationSections[index].aiRecommendation,
              aiReason: section.aiReason !== undefined ? 
                section.aiReason : 
                updatedFormData.evaluationSections[index].aiReason
            };
          } else if (!isPartial) {
            // 只有在非部分更新时才添加新项目
            updatedFormData.evaluationSections.push(section);
          }
        });
      }
      
      // 更新文本评估部分
      if (normalizedData.textualEvaluations && Array.isArray(normalizedData.textualEvaluations)) {
        normalizedData.textualEvaluations.forEach((evaluation: any) => {
          // 确保 textualEvaluations 已初始化
          if (!updatedFormData.textualEvaluations) {
            updatedFormData.textualEvaluations = [];
          }
          
          if (!evaluation.id) return; // 跳过没有 id 的部分
          
          const index = updatedFormData.textualEvaluations.findIndex((e: any) => e.id === evaluation.id);
          if (index !== -1) {
            // 已存在项，更新其属性
            updatedFormData.textualEvaluations[index] = {
              ...updatedFormData.textualEvaluations[index],
              ...evaluation,
              // 确保 aiRecommendation 正确更新
              aiRecommendation: evaluation.aiRecommendation !== undefined ? 
                evaluation.aiRecommendation : 
                updatedFormData.textualEvaluations[index].aiRecommendation
            };
          } else if (!isPartial) {
            // 只有在非部分更新时才添加新项目
            updatedFormData.textualEvaluations.push(evaluation);
          }
        });
      }
      
      // 如果数据未发生变化，则不触发更新
      if (isEqual(formDataRef.current, updatedFormData)) {
        console.log('⚠️ 数据未变化，跳过更新');
        return;
      }
      
      console.log('🔄 更新后的表单数据:', updatedFormData);
      
      // 更新 ref 缓存的数据
      formDataRef.current = updatedFormData;
      
      // 更新状态中的数据，触发组件重渲染
      setFormData(updatedFormData);
      
      // 调用外部更新回调
      if (dataUpdateCallbackRef.current) {
        dataUpdateCallbackRef.current(updatedFormData);
      }
      
      // 添加日志
      addAnalysisLog(isPartial ? "表单数据已部分更新" : "表单数据已完全更新", "data-update");
    } catch (error) {
      console.error('❌ 更新表单数据失败:', error);
      addAnalysisLog(`更新表单数据失败: ${error instanceof Error ? error.message : '未知错误'}`, "error");
    }
  }, [addAnalysisLog, initializeFormStructure]);
  
  // 重置表单数据
  const resetFormData = useCallback(() => {
    formDataRef.current = {...emptyFormData};
    setFormData({...emptyFormData});
    structureInitializedRef.current = false;
    lastUpdateTimeRef.current = 0;
    addAnalysisLog("表单数据已重置", "data-reset");
  }, [addAnalysisLog]);
  
  // 开始分析
  const startAnalysisWithBackend = async (projectId: string, filePath: string) => {
    try {
      // 重置所有状态
      setIsAnalyzing(true);
      setAnalysisLogs([]);
      setIsWaitingForResponse(true);
      setProgress(0);
      setStatusMessage('准备开始分析...');
      setReasoningText('');
      setFinalContent('');
      setError(null);
      
      // 重置表单数据
      resetFormData();
      
      // 添加初始化日志
      addAnalysisLog("开始分析文档...", "init");
      
      const reviewData = {
        file_path: filePath,
        num_reviewers: 1,
        page_limit: 0,
        use_claude: false
      };
      
      console.log('🚀 开始分析请求:', {
        url: 'http://localhost:5555/review',
        requestData: reviewData
      });
      
      // 发送请求
      const response = await fetch('http://localhost:5555/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });
      
      console.log('📡 响应状态:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 响应错误:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`分析失败: ${response.status} ${response.statusText}\n${errorText}`);
      }
      
      // 收到响应后，停止模拟思考
      setIsWaitingForResponse(false);
      
      // 清除思考日志
      setAnalysisLogs(prev => prev.filter(log => log.type !== "thinking"));
      
      // 获取响应的reader
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      console.log('📥 开始读取流式响应...');
      
      // 处理流式数据的函数
      const processStream = async () => {
        try {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('✅ 流式响应结束');
            return;
          }
          
          // 解码二进制数据
          const chunk = decoder.decode(value, { stream: true });
          console.log('📦 原始数据块:', chunk);
          
          buffer += chunk;
          
          // 处理SSE格式的数据 (data: ... 后面跟着 \n\n)
          const messages = buffer.split('\n\n');
          // 保留最后一个可能不完整的消息
          buffer = messages.pop() || '';
          
          for (const message of messages) {
            if (message.trim() === '') continue;
            
            if (message.startsWith('data: ')) {
              try {
                // 解析JSON数据
                const jsonStr = message.slice(6).trim();
                console.log('🔍 SSE数据:', jsonStr);
                
                const data = JSON.parse(jsonStr);
                console.log('📋 解析后的JSON:', data);
                
                // 根据数据类型进行不同处理
                switch (data.type) {
                  case 'progress':
                    // 更新进度
                    console.log('⏳ 进度更新:', data);
                    setProgress(data.current / data.total * 100);
                    setStatusMessage(data.message || `正在处理第 ${data.current}/${data.total} 页`);
                    updateLogContent('progress', `正在处理第 ${data.current}/${data.total} 页`, false);
                    break;
                    
                  case 'reasoning':
                    // 更新推理文本
                    if (data.reasoning) {
                      console.log('🤔 推理内容:', data.reasoning);
                      setReasoningText(prev => prev + data.reasoning);
                      // 使用累积的推理文本更新日志
                      updateLogContent('reasoning', reasoningText + data.reasoning, false);
                      
                      // 如果推理中包含部分表单结构数据，尝试提取并更新
                      if (data.partial_structure) {
                        console.log('🧩 推理中的部分结构:', data.partial_structure);
                        updateFormData(data.partial_structure, true);
                      }
                    }
                    break;
                    
                  case 'content':
                    // 更新最终内容
                    if (data.content) {
                      console.log('📝 评审内容:', data.content);
                      setFinalContent(prev => prev + data.content);
                      // 使用累积的内容更新日志
                      updateLogContent('content', finalContent + data.content, false);
                      
                      // 如果内容中包含部分表单结构数据，尝试提取并更新
                      if (data.partial_structure) {
                        console.log('🧩 内容中的部分结构:', data.partial_structure);
                        updateFormData(data.partial_structure, true);
                      }
                    }
                    break;
                    
                  case 'complete':
                    // 处理完成
                    console.log('✨ 分析完成');
                    setStatusMessage(data.message || '分析完成');
                    addAnalysisLog(data.message || "分析完成: 已生成评审建议", "complete");
                    
                    // 处理 json_structure 字段
                    if (data.json_structure) {
                      console.log('🔄 接收到最终 JSON 结构:', data.json_structure);
                      // 使用非部分更新模式，确保完整更新
                      updateFormData(data.json_structure, false);
                    }
                    return;
                    
                  case 'error':
                    // 处理错误
                    console.error('❌ 错误消息:', data.message);
                    setError(data.message);
                    addAnalysisLog(`错误: ${data.message}`, "error");
                    return;
                    
                  case 'structure_update':
                    // 新增类型: 结构更新
                    if (data.structure) {
                      console.log('🧩 接收到结构更新:', data.structure);
                      updateFormData(data.structure, true);
                    }
                    break;
                    
                  default:
                    console.warn('⚠️ 未知消息类型:', data);
                    
                    // 尝试检测数据本身是否为 JSON 结构（非标准消息）
                    if (data.formTitle || data.projectInfo || data.evaluationSections || data.textualEvaluations) {
                      console.log('🔍 检测到有效表单数据结构，尝试更新');
                      updateFormData(data, false);
                    } else {
                      addAnalysisLog(`收到未知类型消息: ${JSON.stringify(data)}`, "unknown");
                    }
                }
              } catch (e) {
                console.error('❌ JSON解析错误:', {
                  error: e,
                  rawMessage: message
                });
                
                // 尝试解析原始消息中的 JSON 结构
                try {
                  const startIndex = message.indexOf('{');
                  const endIndex = message.lastIndexOf('}');
                  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                    const jsonStr = message.substring(startIndex, endIndex + 1);
                    console.log('🔍 尝试从错误消息中提取 JSON:', jsonStr);
                    const extractedData = JSON.parse(jsonStr);
                    // 检查提取的数据是否有效
                    if (extractedData.formTitle || extractedData.projectInfo || 
                        extractedData.evaluationSections || extractedData.textualEvaluations) {
                      console.log('🔄 提取成功，尝试更新表单数据');
                      updateFormData(extractedData, false);
                    }
                  }
                } catch (extractError) {
                  console.error('❌ 无法从错误消息中提取 JSON:', extractError);
                }
                
                addAnalysisLog(`JSON解析错误: ${e instanceof Error ? e.message : '未知错误'}`, "error");
              }
            } else {
              console.log('⚠️ 非SSE格式数据:', message);
              
              // 尝试从非SSE消息中提取 JSON 结构
              try {
                const startIndex = message.indexOf('{');
                const endIndex = message.lastIndexOf('}');
                if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                  const jsonStr = message.substring(startIndex, endIndex + 1);
                  console.log('🔍 尝试从非SSE消息中提取 JSON:', jsonStr);
                  const extractedData = JSON.parse(jsonStr);
                  // 检查提取的数据是否有效
                  if (extractedData.formTitle || extractedData.projectInfo || 
                      extractedData.evaluationSections || extractedData.textualEvaluations) {
                    console.log('🔄 提取成功，尝试更新表单数据');
                    updateFormData(extractedData, false);
                  }
                }
              } catch (extractError) {
                console.error('❌ 无法从非SSE消息中提取 JSON:', extractError);
              }
              
              addAnalysisLog(`收到非SSE格式数据: ${message}`, "warning");
            }
          }
          
          // 继续处理流
          await processStream();
        } catch (streamError) {
          console.error('❌ 读取流失败:', streamError);
          setError(`连接中断: ${streamError instanceof Error ? streamError.message : '未知错误'}`);
          addAnalysisLog(`连接中断: ${streamError instanceof Error ? streamError.message : '未知错误'}`, "error");
        }
      };
      
      // 开始处理流
      await processStream();
      
      return true;
    } catch (error) {
      console.error('❌ 分析过程出错:', {
        error,
        message: error instanceof Error ? error.message : '未知错误',
        stack: error instanceof Error ? error.stack : undefined
      });
      setError(error instanceof Error ? error.message : '未知错误');
      addAnalysisLog(`分析出错: ${error instanceof Error ? error.message : '未知错误'}`, "error");
      return false;
    } finally {
      console.log('🏁 分析流程结束');
      setIsAnalyzing(false);
      setIsWaitingForResponse(false);
    }
  };
  
  // 更新 useEffect 以监听 reasoningText 和 finalContent 的变化
  useEffect(() => {
    if (reasoningText) {
      updateLogContent('reasoning', reasoningText, false);
    }
  }, [reasoningText]);
  
  useEffect(() => {
    if (finalContent) {
      updateLogContent('content', finalContent, false);
    }
  }, [finalContent]);
  
  // 组件挂载时初始化一次表单结构
  useEffect(() => {
    if (!structureInitializedRef.current) {
      // 使用默认结构初始化（此版本我们使用空结构而不是假数据）
      initializeFormStructure(emptyFormData);
    }
  }, [initializeFormStructure]);
  
  return {
    analysisLogs,
    isAnalyzing,
    addAnalysisLog,
    startAnalysisWithBackend,
    setAnalysisLogs,
    progress,
    statusMessage,
    error,
    formData,
    registerUpdateCallback,
    updateFormData,
    resetFormData
  };
} 