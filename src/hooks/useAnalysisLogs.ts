import { useState, useEffect } from 'react';

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

export function useAnalysisLogs() {
  const [analysisLogs, setAnalysisLogs] = useState<Array<{time: string, content: string, type: string}>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [reasoningText, setReasoningText] = useState('');
  const [finalContent, setFinalContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
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
  
  // 模拟思考过程
  useEffect(() => {
    let thinkingInterval: NodeJS.Timeout | null = null;
    let currentIndex = 0;
    
    if (isWaitingForResponse) {
      // 立即添加第一条思考日志
      addAnalysisLog(thinkingTexts[0], "thinking");
      
      // 每2秒更新一次思考内容
      thinkingInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % thinkingTexts.length;
        updateLogContent("thinking", thinkingTexts[currentIndex], false);
      }, 2000);
    }
    
    return () => {
      if (thinkingInterval) {
        clearInterval(thinkingInterval);
      }
    };
  }, [isWaitingForResponse]);
  
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
                    }
                    break;
                    
                  case 'content':
                    // 更新最终内容
                    if (data.content) {
                      console.log('📝 评审内容:', data.content);
                      setFinalContent(prev => prev + data.content);
                      // 使用累积的内容更新日志
                      updateLogContent('content', finalContent + data.content, false);
                    }
                    break;
                    
                  case 'complete':
                    // 处理完成
                    console.log('✨ 分析完成');
                    setStatusMessage(data.message || '分析完成');
                    addAnalysisLog(data.message || "分析完成: 已生成评审建议", "complete");
                    return;
                    
                  case 'error':
                    // 处理错误
                    console.error('❌ 错误消息:', data.message);
                    setError(data.message);
                    addAnalysisLog(`错误: ${data.message}`, "error");
                    return;
                    
                  default:
                    console.warn('⚠️ 未知消息类型:', data);
                    addAnalysisLog(`收到未知类型消息: ${JSON.stringify(data)}`, "unknown");
                }
              } catch (e) {
                console.error('❌ JSON解析错误:', {
                  error: e,
                  rawMessage: message
                });
                addAnalysisLog(`JSON解析错误: ${e instanceof Error ? e.message : '未知错误'}`, "error");
              }
            } else {
              console.log('⚠️ 非SSE格式数据:', message);
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
  
  return {
    analysisLogs,
    isAnalyzing,
    addAnalysisLog,
    startAnalysisWithBackend,
    setAnalysisLogs,
    progress,
    statusMessage,
    error
  };
} 