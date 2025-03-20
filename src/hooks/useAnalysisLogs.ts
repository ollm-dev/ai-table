import { useState, useEffect, useRef, useCallback } from 'react';
import { reviewFormData } from '../data/reviewFormData';
// 导入API URL配置
import { getReviewUrl } from '../lib/config';

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
  
  // 添加HTML标签清理函数
  const sanitizeHtml = (text: string): string => {
    if (!text) return '';
    
    // 替换常见的HTML标签为Markdown等效形式或纯文本
    return text
      // 移除span标签 - 处理opacity:0等行内样式标签
      .replace(/<span[^>]*>(.*?)<\/span>/g, '$1')
      // 处理其他可能的HTML标签
      .replace(/<\/?[^>]+(>|$)/g, '')
      // 处理HTML实体
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  // 添加分析日志
  const addAnalysisLog = (content: string, type: string = "normal") => {
    // 清理内容中的HTML标签
    const sanitizedContent = sanitizeHtml(content);
    setAnalysisLogs(prev => [...prev, { time: new Date().toISOString(), content: sanitizedContent, type }]);
  };
  
  // 更新特定类型的日志内容
  const updateLogContent = (type: string, content: string, append: boolean = false) => {
    // 清理内容中的HTML标签
    const sanitizedContent = sanitizeHtml(content);
    setAnalysisLogs(prev => {
      const index = prev.findIndex(log => log.type === type);
      if (index === -1) {
        // 如果不存在该类型的日志，创建新的
        return [...prev, { time: new Date().toISOString(), content: sanitizedContent, type }];
      } else {
        // 如果存在，更新或追加内容
        const newLogs = [...prev];
        newLogs[index] = {
          ...newLogs[index],
          content: append ? sanitizeHtml(newLogs[index].content + content) : sanitizedContent
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
      let normalizedData: any;
      
      if (typeof jsonStructure === 'string') {
        try {
          normalizedData = JSON.parse(jsonStructure);
          console.log('✅ 成功解析JSON字符串');
        } catch (parseError) {
          console.error('❌ JSON字符串解析失败，尝试修复格式问题:', parseError);
          
          try {
            // 替换单引号为双引号
            let fixedJsonStr = jsonStructure.replace(/'/g, '"');
            // 处理没有引号的属性名
            fixedJsonStr = fixedJsonStr.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
            
            normalizedData = JSON.parse(fixedJsonStr);
            console.log('✅ 修复后解析成功');
          } catch (fixError) {
            console.error('❌ 修复JSON失败，使用原始字符串:', fixError);
            addAnalysisLog(`JSON解析失败: ${fixError instanceof Error ? fixError.message : '未知错误'}`, "error");
            return; // 解析失败，退出函数
          }
        }
      } else {
        // 如果已经是对象，直接使用
        normalizedData = jsonStructure;
      }
      
      // 如果结构未初始化且非部分更新，则初始化结构
      if (!structureInitializedRef.current && !isPartial) {
        initializeFormStructure(normalizedData);
        return;
      }
      
      // 深拷贝当前表单数据
      const updatedFormData = JSON.parse(JSON.stringify(formDataRef.current));
      
      // 更新表单标题（如果有）
      if (normalizedData.formTitle) {
        updatedFormData.formTitle = normalizedData.formTitle;
      }
      
      // 更新项目信息
      if (normalizedData.projectInfo) {
        try {
          // 确保projectInfo是对象
          if (typeof normalizedData.projectInfo === 'object' && normalizedData.projectInfo !== null) {
            updatedFormData.projectInfo = {
              ...updatedFormData.projectInfo,
              ...normalizedData.projectInfo
            };
          } else {
            console.warn('⚠️ projectInfo不是有效对象:', normalizedData.projectInfo);
          }
        } catch (projectInfoError) {
          console.error('❌ 更新projectInfo出错:', projectInfoError);
        }
      }
      
      // 更新评估部分
      if (normalizedData.evaluationSections) {
        try {
          // 确保evaluationSections是数组
          if (Array.isArray(normalizedData.evaluationSections)) {
            // 确保 evaluationSections 已初始化
            if (!updatedFormData.evaluationSections) {
              updatedFormData.evaluationSections = [];
            }
            
            normalizedData.evaluationSections.forEach((section: any) => {
              if (!section || typeof section !== 'object') {
                console.warn('⚠️ 跳过无效的评估部分:', section);
                return; // 跳过无效项
              }
              
              if (!section.id) {
                console.warn('⚠️ 跳过没有id的评估部分:', section);
                return; // 跳过没有 id 的部分
              }
              
              const index = updatedFormData.evaluationSections.findIndex((s: any) => s.id === section.id);
              if (index !== -1) {
                // 已存在项，更新其属性
                try {
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
                } catch (updateSectionError) {
                  console.error(`❌ 更新评估部分${section.id}时出错:`, updateSectionError);
                }
              } else if (!isPartial) {
                // 只有在非部分更新时才添加新项目
                try {
                  updatedFormData.evaluationSections.push(section);
                } catch (addSectionError) {
                  console.error('❌ 添加新评估部分时出错:', addSectionError);
                }
              }
            });
          } else {
            console.warn('⚠️ evaluationSections不是数组:', normalizedData.evaluationSections);
          }
        } catch (evaluationSectionsError) {
          console.error('❌ 处理evaluationSections时出错:', evaluationSectionsError);
        }
      }
      
      // 更新文本评估部分
      if (normalizedData.textualEvaluations) {
        try {
          // 确保textualEvaluations是数组
          if (Array.isArray(normalizedData.textualEvaluations)) {
            // 确保 textualEvaluations 已初始化
            if (!updatedFormData.textualEvaluations) {
              updatedFormData.textualEvaluations = [];
            }
            
            normalizedData.textualEvaluations.forEach((evaluation: any) => {
              if (!evaluation || typeof evaluation !== 'object') {
                console.warn('⚠️ 跳过无效的文本评估:', evaluation);
                return; // 跳过无效项
              }
              
              if (!evaluation.id) {
                console.warn('⚠️ 跳过没有id的文本评估:', evaluation);
                return; // 跳过没有 id 的部分
              }
              
              const index = updatedFormData.textualEvaluations.findIndex((e: any) => e.id === evaluation.id);
              if (index !== -1) {
                // 已存在项，更新其属性
                try {
                  updatedFormData.textualEvaluations[index] = {
                    ...updatedFormData.textualEvaluations[index],
                    ...evaluation,
                    // 确保 aiRecommendation 正确更新
                    aiRecommendation: evaluation.aiRecommendation !== undefined ? 
                      evaluation.aiRecommendation : 
                      updatedFormData.textualEvaluations[index].aiRecommendation
                  };
                } catch (updateEvalError) {
                  console.error(`❌ 更新文本评估${evaluation.id}时出错:`, updateEvalError);
                }
              } else if (!isPartial) {
                // 只有在非部分更新时才添加新项目
                try {
                  updatedFormData.textualEvaluations.push(evaluation);
                } catch (addEvalError) {
                  console.error('❌ 添加新文本评估时出错:', addEvalError);
                }
              }
            });
          } else {
            console.warn('⚠️ textualEvaluations不是数组:', normalizedData.textualEvaluations);
          }
        } catch (textualEvaluationsError) {
          console.error('❌ 处理textualEvaluations时出错:', textualEvaluationsError);
        }
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
      
      // 使用配置中的API URL
      const reviewUrl = getReviewUrl();
      console.log('🚀 开始分析请求:', {
        url: reviewUrl,
        requestData: reviewData
      });
      
      // 发送请求
      const response = await fetch(reviewUrl, {
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
                      setReasoningText(prev => {
                        // 清理HTML标签
                        const sanitizedReasoning = sanitizeHtml(data.reasoning);
                        const newText = prev + sanitizedReasoning;
                        // 使用函数更新方式确保拿到最新的文本内容
                        updateLogContent('reasoning', newText, false);
                        return newText;
                      });
                      
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
                      setFinalContent(prev => {
                        // 清理HTML标签
                        const sanitizedContent = sanitizeHtml(data.content);
                        const newContent = prev + sanitizedContent;
                        // 使用函数更新方式确保拿到最新的内容
                        updateLogContent('content', newContent, false);
                        return newContent;
                      });
                      
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
                    
                    // 自定义完成消息，包含json_structure信息
                    let completeMessage = data.message || "分析完成: 已生成评审建议";
                    
                    // 处理 json_structure 字段
                    if (data.json_structure) {
                      console.log('🔄 接收到最终 JSON 结构:', data.json_structure);
                      
                      // 添加json_structure信息到完成消息，用于在日志中查看
                      try {
                        // 创建一个可用于显示的JSON字符串（简化但可读）
                        let jsonDisplay = '';
                        
                        if (typeof data.json_structure === 'string') {
                          // 如果已经是字符串，保持不变
                          jsonDisplay = data.json_structure;
                        } else {
                          // 如果是对象，转换为格式化的JSON字符串
                          jsonDisplay = JSON.stringify(data.json_structure, null, 2);
                        }
                        
                        // 附加json_structure到完成消息
                        completeMessage += `\n\n${"json_structure"}: ${jsonDisplay}`;
                      } catch (jsonStringifyError) {
                        console.error('❌ 序列化JSON结构时出错:', jsonStringifyError);
                        completeMessage += `\n\n${"json_structure"}: [序列化失败，请查看控制台日志]`;
                      }
                      
                      // 记录带有json_structure的完成日志
                      addAnalysisLog(completeMessage, "complete");
                      
                      // 根据json_structure的类型进行不同处理
                      try {
                        // 如果是字符串，先尝试解析
                        let structureData = data.json_structure;
                        
                        if (typeof structureData === 'string') {
                          console.log('📝 JSON结构为字符串，尝试解析');
                          try {
                            structureData = JSON.parse(structureData);
                          } catch (parseError) {
                            console.error('❌ JSON字符串解析失败:', parseError);
                            
                            // 尝试修复可能的JSON格式问题
                            try {
                              // 替换单引号为双引号
                              let fixedJsonStr = structureData.replace(/'/g, '"');
                              // 处理没有引号的属性名
                              fixedJsonStr = fixedJsonStr.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                              
                              structureData = JSON.parse(fixedJsonStr);
                              console.log('✅ 修复后解析成功:', structureData);
                            } catch (fixError) {
                              console.error('❌ 无法修复和解析JSON字符串:', fixError);
                              // 保持原始字符串格式
                            }
                          }
                        }
                        
                        // 验证数据结构是否符合预期
                        const isValidStructure = typeof structureData === 'object' && 
                          (structureData.formTitle || 
                           structureData.projectInfo || 
                           structureData.evaluationSections || 
                           structureData.textualEvaluations);
                        
                        if (isValidStructure) {
                          console.log('✅ 有效的表单数据结构，更新表单');
                          // 使用非部分更新模式，确保完整更新
                          updateFormData(structureData, false);
                        } else {
                          console.warn('⚠️ 结构格式不符合预期:', structureData);
                          // 尝试以部分数据更新的方式处理
                          updateFormData(structureData, true);
                        }
                      } catch (structureError) {
                        console.error('❌ 处理JSON结构时出错:', structureError);
                        // 记录错误但不中断流程
                        addAnalysisLog(`处理JSON结构时出错: ${structureError instanceof Error ? structureError.message : '未知错误'}`, "error");
                      }
                    } else {
                      console.warn('⚠️ complete消息中没有json_structure字段');
                      // 没有json_structure时也记录完成日志
                      addAnalysisLog(completeMessage, "complete");
                    }
                    
                    return;
                    
                  case 'error':
                    // 处理错误
                    console.error('❌ 错误消息:', data.message);
                    setError(data.message || '处理过程中发生未知错误');
                    addAnalysisLog(data.message || '处理过程中发生未知错误', 'error');
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