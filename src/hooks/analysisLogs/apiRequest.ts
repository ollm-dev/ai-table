/**
 * API请求处理模块
 */

import { getReviewUrl } from '../../lib/config';
import { ReviewRequestParams } from './types';
import { sanitizeHtml, transformApiJsonToFormData } from './utils';

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
  updateFormData: (jsonStructure: any, isPartial?: boolean) => void
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
                  
                  // 尝试解析和更新表单数据（如果是有效的JSON）
                  try {
                    if (sanitizedJson.trim().startsWith('{') && sanitizedJson.trim().endsWith('}')) {
                      let jsonData = JSON.parse(sanitizedJson);
                      // 使用部分更新模式，因为这是流式传输的一部分
                      updateFormData(jsonData, true);
                    }
                  } catch (jsonError) {
                    console.log('⚠️ 部分JSON结构不是有效的JSON对象:', jsonError);
                    // 这是正常的，因为流式数据可能不是完整的JSON
                  }
                  
                  return newJsonStructure;
                });
              }
              break;
              
            case 'json_complete':
              // 处理 json_complete 类型消息 - 这里非常重要，因为它包含完整的论文评估结果JSON
              if (data.json_complete) {
                console.log('✅ 接收到完整JSON结构:', data.json_complete);
                addAnalysisLog(`接收到完整JSON结构`, "json_complete");
                
                try {
                  // 尝试解析和更新完整数据
                  let completeStructure = data.json_complete;
                  if (typeof completeStructure === 'string') {
                    try {
                      completeStructure = JSON.parse(completeStructure);
                    } catch (parseError) {
                      console.error('❌ JSON完整结构解析失败:', parseError);
                      
                      // 尝试修复可能的JSON格式问题
                      try {
                        // 替换单引号为双引号
                        let fixedJsonStr = completeStructure.replace(/'/g, '"');
                        // 处理没有引号的属性名
                        fixedJsonStr = fixedJsonStr.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                        
                        completeStructure = JSON.parse(fixedJsonStr);
                        console.log('✅ 修复后解析成功:', completeStructure);
                      } catch (fixError) {
                        console.error('❌ 无法修复和解析JSON完整结构:', fixError);
                        // 添加错误日志
                        addAnalysisLog(`无法解析JSON完整结构: ${fixError instanceof Error ? fixError.message : '未知错误'}`, "error");
                        break; // 无法解析，退出处理
                      }
                    }
                  }
                  
                  // 验证数据结构是否有效
                  if (completeStructure && typeof completeStructure === 'object') {
                    console.log('✅ 有效的完整表单数据结构，更新表单');
                    
                    // 转换API返回的评估数据结构为前端表单数据结构
                    const transformedData = transformApiJsonToFormData(completeStructure);
                    
                    // 使用非部分更新模式，确保完整更新
                    updateFormData(transformedData, false);
                    
                    // 添加成功处理的日志
                    addAnalysisLog(`成功更新表单数据结构`, "success");
                  } else {
                    console.warn('⚠️ 完整JSON结构格式不符合预期:', completeStructure);
                    addAnalysisLog(`JSON结构格式不符合预期`, "warning");
                  }
                } catch (completeStructureError) {
                  console.error('❌ 处理完整JSON结构时出错:', completeStructureError);
                  addAnalysisLog(`处理完整JSON结构时出错: ${completeStructureError instanceof Error ? completeStructureError.message : '未知错误'}`, "error");
                }
              }
              break;
              
            // case 'complete':
            //   // 处理完成事件 - 确保数据也同步处理完成
            //   console.log('✨ 分析完成');
            //   setStatusMessage(data.message || '分析完成');
              
            //   // 自定义完成消息，包含json_structure信息
            //   let completeMessage = data.message || "分析完成: 已生成评审建议";
              
            //   // 处理 json_structure 字段 (如果complete消息中包含json_structure)
            //   if (data.json_structure) {
            //     console.log('🔄 complete消息中包含JSON结构:', data.json_structure);
                
            //     // 添加json_structure信息到完成消息，用于在日志中查看
            //     try {
            //       // 创建一个可读的JSON格式
            //       let jsonDisplay = '';
                  
            //       if (typeof data.json_structure === 'string') {
            //         // 尝试解析并格式化
            //         try {
            //           const parsedJson = JSON.parse(data.json_structure);
            //           jsonDisplay = JSON.stringify(parsedJson, null, 2);
            //         } catch (parseError) {
            //           // 如果无法解析，使用原始字符串
            //           jsonDisplay = data.json_structure;
            //         }
            //       } else {
            //         // 如果是对象，格式化为JSON字符串
            //         jsonDisplay = JSON.stringify(data.json_structure, null, 2);
            //       }
                  
            //       // 附加JSON信息到完成消息
            //       completeMessage += `\n\n已接收论文评审数据，可查看评审建议`;
            //     } catch (jsonStringifyError) {
            //       console.error('❌ 处理JSON结构时出错:', jsonStringifyError);
            //       completeMessage += `\n\n数据接收完成，但处理过程中有错误`;
            //     }
                
            //     // 尝试将complete消息中的JSON结构也用于更新表单
            //     try {
            //       let structureData = data.json_structure;
                  
            //       if (typeof structureData === 'string') {
            //         try {
            //           structureData = JSON.parse(structureData);
            //         } catch (parseError) {
            //           console.error('❌ JSON字符串解析失败:', parseError);
                      
            //           // 尝试修复JSON格式问题
            //           try {
            //             let fixedJsonStr = structureData.replace(/'/g, '"');
            //             fixedJsonStr = fixedJsonStr.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                        
            //             structureData = JSON.parse(fixedJsonStr);
            //             console.log('✅ 修复后解析成功:', structureData);
            //           } catch (fixError) {
            //             console.error('❌ 无法修复JSON格式:', fixError);
            //           }
            //         }
            //       }
                  
            //       // 仅当是有效的对象时才更新
            //       if (structureData && typeof structureData === 'object') {
            //         const transformedData = transformApiJsonToFormData(structureData);
            //         updateFormData(transformedData, false);
            //       }
            //     } catch (updateError) {
            //       console.error('❌ 更新表单失败:', updateError);
            //     }
            //   }
              
            //   // 记录完成日志
            //   addAnalysisLog(completeMessage, "complete");
            //   return;
              
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
      updateFormData
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
  updateFormData: (jsonStructure: any, isPartial?: boolean) => void
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
    
    // 重置表单数据
    resetFormData();
    
    // 添加初始化日志
    addAnalysisLog("开始分析文档...", "init");
    
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
      updateFormData
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