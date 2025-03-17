import { useState } from 'react';

export function useAnalysisLogs() {
  const [analysisLogs, setAnalysisLogs] = useState<Array<{time: string, content: string, type: string}>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 添加分析日志
  const addAnalysisLog = (content: string, type: string = "normal") => {
    setAnalysisLogs(prev => [...prev, { time: '', content, type }]);
    
    // 使用 requestAnimationFrame 确保在DOM更新后再滚动
    requestAnimationFrame(() => {
      const logContainer = document.getElementById('log-container');
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    });
  };
  
  // 逐字添加分析日志（打字机效果）
  const addTypingLog = async (content: string, type: string = "normal") => {
    if (!content.trim()) return;
    
    // 生成时间戳
    const now = new Date();
    const timeStr = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} PM]`;
    
    // 获取目前的日志条目数量作为基础索引
    const baseIndex = analysisLogs.length;
    
    // 先添加一个空的日志条目
    setAnalysisLogs(prev => [...prev, { time: timeStr, content: '', type }]);
    
    // 当前活动的日志索引
    const currentIndex = baseIndex;
    
    // 逐字添加内容
    for (let i = 0; i < content.length; i++) {
      // 根据字符类型设置不同的延迟，营造自然感
      const char = content[i];
      const delay = /[,.!?;:]/.test(char) ? 10 : // 标点符号
                    /[\s]/.test(char) ? 30 :      // 空格
                    Math.random() * 30 + 30;      // 普通字符，随机延迟
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 更新当前日志条目，添加新字符
      setAnalysisLogs(prev => {
        const newLogs = [...prev];
        if (currentIndex < newLogs.length) {
          newLogs[currentIndex] = {
            ...newLogs[currentIndex],
            content: newLogs[currentIndex].content + content[i]
          };
        }
        return newLogs;
      });
      
      // 每添加一个字符就滚动到底部
      requestAnimationFrame(() => {
        const logContainer = document.getElementById('log-container');
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight;
        }
      });
    }
  };
  
  // 开始分析
  const startAnalysisWithBackend = async (projectId: string, filePath: string) => {
    try {
      setIsAnalyzing(true);
      setAnalysisLogs([]);
      addAnalysisLog("✅ 文件上传成功，开始分析...", "init");
      
      // 调整请求参数适配新API
      const requestData = {
        file_path: filePath,
        num_reviewers: 1,
        page_limit: 0
      };
      
      console.log('发送到/review的请求参数:', requestData);
      
      // 创建请求
      const response = await fetch('http://localhost:5555/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('分析请求失败:', response.status, errorText);
        throw new Error(`分析失败: ${response.status} ${response.statusText}\n${errorText}`);
      }

      // 使用 TextDecoder 处理流
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      // 用于存储部分响应数据
      let buffer = '';

      // 处理流式响应
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // 解码二进制数据为文本
        buffer += decoder.decode(value, { stream: true });
        
        // 处理可能的多行数据
        let lineEndIndex;
        while ((lineEndIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, lineEndIndex).trim();
          buffer = buffer.slice(lineEndIndex + 1);
          
          // 检查是否是SSE格式的数据行
          if (line.startsWith('data: ')) {
            try {
              // 提取JSON部分
              const jsonStr = line.slice(6); // 去掉 "data: " 前缀
              const data = JSON.parse(jsonStr);
              
              // 处理不同类型的消息
              switch (data.type) {
                case 'progress':
                  addAnalysisLog(`正在处理第 ${data.current}/${data.total} 页`, "loading");
                  break;
                  
                case 'reasoning':
                  if (data.reasoning) {
                    const reasoningText = data.reasoning.trim();
                    
                    // 查找或创建 reasoning 类型的日志条目
                    setAnalysisLogs(prev => {
                      const lastReasoningIndex = prev.findLastIndex(log => log.type === 'reasoning');
                      
                      if (lastReasoningIndex === -1) {
                        return [...prev, { time: '', content: reasoningText, type: 'reasoning' }];
                      } else {
                        const newLogs = [...prev];
                        newLogs[lastReasoningIndex] = {
                          ...newLogs[lastReasoningIndex],
                          content: newLogs[lastReasoningIndex].content + reasoningText
                        };
                        return newLogs;
                      }
                    });
                  }
                  break;
                  
                case 'content':
                  if (data.content) {
                    const contentText = data.content.trim();
                    
                    // 查找或创建 content 类型的日志条目
                    setAnalysisLogs(prev => {
                      const lastContentIndex = prev.findLastIndex(log => log.type === 'content');
                      
                      if (lastContentIndex === -1) {
                        return [...prev, { time: '', content: contentText, type: 'content' }];
                      } else {
                        const newLogs = [...prev];
                        newLogs[lastContentIndex] = {
                          ...newLogs[lastContentIndex],
                          content: newLogs[lastContentIndex].content + contentText
                        };
                        return newLogs;
                      }
                    });
                  }
                  break;
                  
                case 'complete':
                  addAnalysisLog("✨ 分析完成: 已生成评审建议", "complete");
                  return true; // 分析完成，返回成功
                  
                case 'error':
                  addAnalysisLog(`错误: ${data.message}`, "error");
                  break;
                  
                default:
                  console.log('未知消息类型:', data);
              }
              
              // 滚动到最新内容
              requestAnimationFrame(() => {
                const logContainer = document.getElementById('log-container');
                if (logContainer) {
                  logContainer.scrollTop = logContainer.scrollHeight;
                }
              });
              
            } catch (e) {
              console.error('解析JSON时出错:', e, '原始数据:', line);
            }
          }
        }
      }
      
      return false; // 默认返回失败
    } catch (error) {
      console.error('文档分析出错:', error);
      addAnalysisLog(`分析出错: ${error instanceof Error ? error.message : '未知错误'}`, "error");
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return {
    analysisLogs,
    isAnalyzing,
    addAnalysisLog,
    addTypingLog,
    startAnalysisWithBackend,
    setAnalysisLogs
  };
} 