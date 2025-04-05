/**
 * API请求处理模块
 */

import { getReviewUrl } from '../../lib/config';
import { ReviewRequestParams } from './types';
import { sanitizeHtml, transformApiJsonToFormData } from './utils';
// 导入模拟分析过程函数
import { simulateAnalysisProcess } from './mockAnalysis';
import { jsonrepair } from 'jsonrepair';

/**
 * 处理API响应流
 * @param reader 响应流读取器
 * @param setProgress 设置进度函数
 * @param setStatusMessage 设置状态消息函数
 * @param setReasoningText 设置推理文本函数
 * @param setJsonStructure 设置JSON结构函数
 * @param setFinalContent 设置最终内容函数
 * @param setError 设置错误函数
 * @param updateLogContent 更新日志内容函数
 * @param addAnalysisLog 添加分析日志函数
 * @param updateFormData 更新表单数据函数
 * @param setJsonCompleteStatus 设置JSON完成状态函数
 * @returns 处理完成Promise
 */
export const processStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  setProgress: (value: React.SetStateAction<number>) => void,
  setStatusMessage: (value: React.SetStateAction<string>) => void,
  setReasoningText: (value: React.SetStateAction<string>) => void,
  setJsonStructure: (value: React.SetStateAction<string>) => void,
  setFinalContent: (value: React.SetStateAction<string>) => void,
  setError: (value: React.SetStateAction<string | null>) => void,
  updateLogContent: (type: string, content: string, append?: boolean) => void,
  addAnalysisLog: (content: string, type?: string) => void,
  updateFormData: (jsonStructure: any, isPartial?: boolean, isComplete?: boolean) => void,
  setJsonCompleteStatus: (value: React.SetStateAction<boolean>) => void
): Promise<void> => {
  try {
    const { done, value } = await reader.read();
    
    if (done) {
      console.log('✅ 流式响应结束');
      return;
    }
    
    // 解码二进制数据
    const decoder = new TextDecoder();
    const chunk = decoder.decode(value, { stream: true });
    console.log('📦 原始数据块:', chunk);
    
    let buffer = chunk;
    
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
              }
              break;
              
            case 'json_structure':
              // 处理 json_structure 类型消息
              if (data.json_structure) {
                console.log('🔍 AI结构数据:', data.json_structure);
                setJsonStructure(prev => {
                  // 清理HTML标签
                  const sanitizedJson = sanitizeHtml(data.json_structure);
                  const newJsonStructure = prev + sanitizedJson;
                  // 使用函数更新方式确保拿到最新的文本内容
                  updateLogContent('json_structure', newJsonStructure, false);
                  
                  
                  return newJsonStructure;
                });
              }
              break;
              
            case 'json_complete':
              // 处理 json_complete 类型消息 - 这里非常重要，因为它包含完整的论文评估结果JSON
              if (data.json_complete) {
                console.log('✅ 接收到完整JSON结构:', data.json_complete);
                addAnalysisLog(`接收到完整JSON结构`, "json_complete");
                // 设置JSON完成状态为true，表示已收到完整JSON
                setJsonCompleteStatus(true);
                
                // 同时使用完整标志更新表单数据
                if (typeof data.json_complete === 'object') {
                  updateFormData(data.json_complete, false, true);
                } else if (typeof data.json_complete === 'string' && data.json_complete.trim()) {
                  try {
                    let repairedJson = jsonrepair(data.json_complete);
                    const parsedJson = JSON.parse(repairedJson);
                    updateFormData(parsedJson, false, true);
                  } catch (jsonError) {
                    console.error('❌ 无法解析完整JSON结构:', jsonError);
                    addAnalysisLog(`无法解析完整JSON结构: ${jsonError instanceof Error ? jsonError.message : '未知错误'}`, "error");
                  }
                }
              }
              break;
              
             case 'error':
              // 处理错误
              console.error('❌ 错误消息:', data.message);
              setError(data.message || '处理过程中发生未知错误');
              addAnalysisLog(data.message || '处理过程中发生未知错误', 'error');
              return;

            default:
              console.warn('⚠️ 未知消息类型:', data);
              
              // 尝试检测数据本身是否为 JSON 结构（非标准消息）
              if (data.formTitle || data.projectInfo || data.evaluationSections || data.textualEvaluations) {
                console.log('🔍 检测到有效表单数据结构，尝试更新');
                // 默认非完整JSON
                updateFormData(data, false, false);
              } else if (typeof data === 'object' && Object.keys(data).length > 0) {
                // 如果是含有数据的对象，即使不符合预期格式也尝试应用
                console.log('🔍 检测到非标准JSON对象，尝试作为有效数据应用');
                // 默认非完整JSON
                updateFormData(data, false, false);
                addAnalysisLog(`应用了非标准格式的数据`, "warning");
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
            // 寻找任何可能的JSON对象
            const jsonMatches = message.match(/{[^}]*}/g);
            if (jsonMatches && jsonMatches.length > 0) {
              // 尝试解析找到的每个JSON对象
              for (const jsonStr of jsonMatches) {
                try {
                  console.log('🔍 尝试从错误消息中提取 JSON:', jsonStr);
                  const extractedData = JSON.parse(jsonStr);
                  
                  // 检查提取的数据是否有效
                  if (extractedData && typeof extractedData === 'object' && Object.keys(extractedData).length > 0) {
                    console.log('🔄 提取成功，尝试更新表单数据');
                    // 从错误消息中提取的数据默认非完整JSON
                    updateFormData(extractedData, false, false);
                    addAnalysisLog(`从错误消息中成功提取数据`, "success");
                    break; // 一旦找到有效数据就退出循环
                  }
                } catch (jsonParseError) {
                  console.warn('⚠️ 无法解析此JSON片段:', jsonParseError);
                  // 继续尝试下一个匹配项
                }
              }
            } else {
              // 如果没有找到JSON对象，尝试更宽松的方法
              const startIndex = message.indexOf('{');
              const endIndex = message.lastIndexOf('}');
              if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                const jsonStr = message.substring(startIndex, endIndex + 1);
                console.log('🔍 尝试从错误消息中提取 JSON:', jsonStr);
                
                try {
                  const extractedData = JSON.parse(jsonStr);
                  // 检查提取的数据是否有效
                  if (extractedData && typeof extractedData === 'object' && Object.keys(extractedData).length > 0) {
                    console.log('🔄 提取成功，尝试更新表单数据');
                    // 从错误消息中提取的数据默认非完整JSON
                    updateFormData(extractedData, false, false);
                    addAnalysisLog(`从错误消息中成功提取数据`, "success");
                  }
                } catch (jsonParseError) {
                  // 尝试修复可能的JSON错误
                  try {
                    let fixedJsonStr = jsonStr.replace(/'/g, '"')
                      .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                      .replace(/,\s*([}\]])/g, '$1');
                    
                    const extractedData = JSON.parse(fixedJsonStr);
                    console.log('🔄 修复后解析成功，尝试更新表单数据');
                    // 修复后的数据默认非完整JSON
                    updateFormData(extractedData, false, false);
                    addAnalysisLog(`成功修复并提取错误消息中的数据`, "success");
                  } catch (fixError) {
                    console.error('❌ 无法从错误消息中提取有效JSON:', fixError);
                  }
                }
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
          // 寻找任何可能的JSON对象
          const jsonMatches = message.match(/{[^}]*}/g);
          if (jsonMatches && jsonMatches.length > 0) {
            // 尝试解析找到的每个JSON对象，选择包含最多键的对象
            let bestMatch = null;
            let maxKeys = 0;
            
            for (const jsonStr of jsonMatches) {
              try {
                const extractedData = JSON.parse(jsonStr);
                if (extractedData && typeof extractedData === 'object') {
                  const keyCount = Object.keys(extractedData).length;
                  if (keyCount > maxKeys) {
                    maxKeys = keyCount;
                    bestMatch = extractedData;
                  }
                }
              } catch (jsonParseError) {
                // 忽略解析错误，继续尝试下一个
              }
            }
            
            if (bestMatch) {
              console.log('🔍 从非SSE消息中提取最佳JSON匹配:', bestMatch);
              // 非SSE消息提取的数据默认非完整JSON
              updateFormData(bestMatch, false, false);
              addAnalysisLog(`从非SSE消息中提取数据成功`, "success");
            }
          } else {
            // 如果没有找到JSON对象，尝试更宽松的方法
            const startIndex = message.indexOf('{');
            const endIndex = message.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
              const jsonStr = message.substring(startIndex, endIndex + 1);
              console.log('🔍 尝试从非SSE消息中提取 JSON:', jsonStr);
              
              try {
                const extractedData = JSON.parse(jsonStr);
                // 检查提取的数据是否有效
                if (extractedData && typeof extractedData === 'object' && Object.keys(extractedData).length > 0) {
                  console.log('🔄 提取成功，尝试更新表单数据');
                  // 非SSE消息提取的数据默认非完整JSON
                  updateFormData(extractedData, false, false);
                  addAnalysisLog(`从非SSE消息中成功提取数据`, "success");
                }
              } catch (jsonParseError) {
                // 尝试修复可能的JSON错误
                try {
                  let fixedJsonStr = jsonStr.replace(/'/g, '"')
                    .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                    .replace(/,\s*([}\]])/g, '$1');
                  
                  const extractedData = JSON.parse(fixedJsonStr);
                  console.log('🔄 修复后解析成功，尝试更新表单数据');
                  // 修复后的数据默认非完整JSON
                  updateFormData(extractedData, false, false);
                  addAnalysisLog(`成功修复并提取非SSE消息中的数据`, "success");
                } catch (fixError) {
                  console.error('❌ 无法从非SSE消息中提取有效JSON:', fixError);
                }
              }
            }
          }
        } catch (extractError) {
          console.error('❌ 尝试从非SSE消息中提取 JSON 时出错:', extractError);
          addAnalysisLog(`从非SSE消息提取数据失败: ${extractError instanceof Error ? extractError.message : '未知错误'}`, "error");
        }
      }
    }
    
    // 继续处理流
    return processStream(
      reader,
      setProgress,
      setStatusMessage,
      setReasoningText,
      setJsonStructure,
      setFinalContent,
      setError,
      updateLogContent,
      addAnalysisLog,
      updateFormData,
      setJsonCompleteStatus
    );
  } catch (streamError) {
    console.error('❌ 读取流失败:', streamError);
    setError(`连接中断: ${streamError instanceof Error ? streamError.message : '未知错误'}`);
    addAnalysisLog(`连接中断: ${streamError instanceof Error ? streamError.message : '未知错误'}`, "error");
  }
};

/**
 * 启动后端分析过程
 * @param filePath 文件路径
 * @param setIsAnalyzing 设置分析状态函数
 * @param setAnalysisLogs 设置分析日志函数
 * @param setIsWaitingForResponse 设置等待响应状态函数
 * @param setProgress 设置进度函数
 * @param setStatusMessage 设置状态消息函数
 * @param setReasoningText 设置推理文本函数
 * @param setJsonStructure 设置JSON结构函数
 * @param setFinalContent 设置最终内容函数
 * @param setError 设置错误函数
 * @param resetFormData 重置表单数据函数
 * @param addAnalysisLog 添加分析日志函数
 * @param updateLogContent 更新日志内容函数
 * @param updateFormData 更新表单数据函数
 * @param setJsonCompleteStatus 设置JSON完成状态函数
 * @param useMockData 是否使用模拟数据
 * @returns 处理结果布尔值
 */
export const startAnalysisWithBackend = async (
  filePath: string,
  setIsAnalyzing: (value: React.SetStateAction<boolean>) => void,
  setAnalysisLogs: (value: React.SetStateAction<Array<{time: string, content: string, type: string}>>) => void,
  setIsWaitingForResponse: (value: React.SetStateAction<boolean>) => void,
  setProgress: (value: React.SetStateAction<number>) => void,
  setStatusMessage: (value: React.SetStateAction<string>) => void,
  setReasoningText: (value: React.SetStateAction<string>) => void,
  setJsonStructure: (value: React.SetStateAction<string>) => void,
  setFinalContent: (value: React.SetStateAction<string>) => void,
  setError: (value: React.SetStateAction<string | null>) => void,
  resetFormData: () => void,
  addAnalysisLog: (content: string, type?: string) => void,
  updateLogContent: (type: string, content: string, append?: boolean) => void,
  updateFormData: (jsonStructure: any, isPartial?: boolean, isComplete?: boolean) => void,
  setJsonCompleteStatus: (value: React.SetStateAction<boolean>) => void,
  useMockData: boolean = false
) => {
  try {
    // 重置所有状态
    setIsAnalyzing(true);
    setAnalysisLogs([]);
    setIsWaitingForResponse(true);
    setProgress(0);
    setStatusMessage('准备开始分析...');
    setReasoningText('');
    setJsonStructure('');
    setFinalContent('');
    setError(null);
    setJsonCompleteStatus(false); // 重置JSON完成状态
    
    // 重置表单数据
    resetFormData();
    
    // 添加初始化日志
    addAnalysisLog("开始分析文档...", "init");
    
    // 判断是否使用模拟数据
    // 仅在明确指定使用模拟数据时才使用模拟数据
    if (useMockData) {
      console.log('🔧 使用模拟数据进行AI分析...');
      
      // 等待一小段时间，模拟初始加载
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 停止等待响应标志
      setIsWaitingForResponse(false);
      
      // 运行模拟分析过程
      // await simulateAnalysisProcess(
      //   addAnalysisLog,
      //   setProgress
      //   // setStatusMessage,
      //   // updateLogContent,
      //   // setReasoningText,
      //   // setFinalContent,
      //   // setJsonStructure
      // );
      
      // 模拟分析完成后，设置JSON完成状态为true
      setJsonCompleteStatus(true);
      
      // 模拟分析完成后，更新表单数据，标记为完整JSON
      // 这里可以添加模拟的完整JSON数据更新
      const mockCompleteData = {
        // 模拟的完整JSON数据结构
        formTitle: "论文评审报告",
        projectInfo: { /* 模拟的项目信息 */ },
        evaluationSections: [ /* 模拟的评估部分 */ ],
        textualEvaluations: [ /* 模拟的文本评估 */ ]
      };
      updateFormData(mockCompleteData, false, true);
      
      return true;
    }
    
    const reviewData: ReviewRequestParams = {
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
    
    console.log('📥 开始读取流式响应...');
    
    // 处理流式数据
    await processStream(
      reader,
      setProgress,
      setStatusMessage,
      setReasoningText,
      setJsonStructure,
      setFinalContent,
      setError,
      updateLogContent,
      addAnalysisLog,
      updateFormData,
      setJsonCompleteStatus
    );
    
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