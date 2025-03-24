import React from "react";
import { UploadIcon } from "lucide-react";
import Markdown from '@/components/markdown';
import { AnalysisLogPanelProps } from "@/types/review/EvaluationOptions/EvaluationOptionsSection";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { AIProcessFlow } from '../AIProcessFlow/AIProcessFlow';

export default function AnalysisLogPanel({ 
    analysisLogs, 
    isAnalyzing, 
    pdfFile,
    progress,
    statusMessage,
    onApplyJsonStructure,
    jsonStructure
  }: AnalysisLogPanelProps) {
    const [activeTab, setActiveTab] = useState<'reasoning' | 'content' | 'json_structure'>('reasoning');
    const logContainerRef = useRef<HTMLDivElement>(null);
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // 默认不自动滚动，让用户有完全的控制权
    const [autoScroll, setAutoScroll] = useState(false);
    const [showFillSuccess, setShowFillSuccess] = useState(false);
    const userScrolledRef = useRef(false);
    const scrollPositionRef = useRef(0);
    const hasHandledScrollRef = useRef(false);
    const isHandlingScrollRef = useRef(false);
    // 默认不进行初始滚动，组件初始加载时不会自动滚动到底部
    const needsInitialScrollRef = useRef(false);
  
    // 定义标签选项
    const tabOptions = [
      { 
        value: 'reasoning' as const, 
        label: '推理过程', 
        icon: '🤔' 
      },
      { 
        value: 'content' as const, 
        label: '评审结果', 
        icon: '📝' 
      },
      { 
        value: 'json_structure' as const, 
        label: 'AI填充', 
        icon: '🔍',
        badge: !!jsonStructure
      }
    ];
  
    // 处理滚动事件
    const handleScroll = useCallback(() => {
      if (isHandlingScrollRef.current) return;
      isHandlingScrollRef.current = true;
  
      const container = logContainerRef.current;
      if (!container) {
        isHandlingScrollRef.current = false;
        return;
      }
  
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 30;
      userScrolledRef.current = !isAtBottom;
      scrollPositionRef.current = container.scrollTop;
      setAutoScroll(isAtBottom);
  
      setTimeout(() => {
        isHandlingScrollRef.current = false;
      }, 100);
    }, []);
  
    // 添加滚动事件监听
    useEffect(() => {
      const container = logContainerRef.current;
      if (container) {
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
      }
    }, [handleScroll]);
  
    // 处理初始滚动 - 修改为不自动滚动到底部
    useEffect(() => {
      // 移除自动滚动到底部的逻辑，让用户自己控制滚动位置
      needsInitialScrollRef.current = false;
    }, [activeTab]);
  
    // 自动滚动到底部 - 仅当内容更新且用户手动滚动到底部时才滚动
    useEffect(() => {
      // 只有当用户已滚动到底部（autoScroll为true）时才启用自动滚动
      if (autoScroll && logContainerRef.current && analysisLogs.length > 0) {
        // 使用防抖，减少频繁滚动
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
        
        scrollTimerRef.current = setTimeout(() => {
          if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    }, [analysisLogs, autoScroll, isAnalyzing, activeTab, jsonStructure]);
    
    // 当标签切换时保持用户的滚动偏好，不强制重置
    useEffect(() => {
      // 切换标签时不重置自动滚动状态，尊重用户的选择
      needsInitialScrollRef.current = false; // 不进行自动初始滚动
      
      // 如果用户之前已滚动到底部，切换标签后保持此状态
      const runAfterRender = setTimeout(() => {
        if (autoScroll && logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      }, 0);
      
      return () => clearTimeout(runAfterRender);
    }, [activeTab, autoScroll]);
  
    // 缓存过滤后的日志
    const filteredLogs = useMemo(() => {
      return analysisLogs.filter(log => {
        switch (activeTab) {
          case 'reasoning':
            return log.type === 'reasoning';
          case 'content':
            return log.type === 'content' ;
          case 'json_structure':
            return log.type === 'json_structure'
          default:
            return false;
        }
      });
    }, [analysisLogs, activeTab]);
  
    // 添加CSS样式到文档头，确保markdown渲染的稳定性
    useEffect(() => {
      // 创建样式标签
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        /* 固定行高和块级间距，防止抖动 */
        .markdown-content p, 
        .markdown-content li, 
        .markdown-content h1, 
        .markdown-content h2, 
        .markdown-content h3, 
        .markdown-content h4, 
        .markdown-content h5, 
        .markdown-content h6 {
          line-height: 1.5 !important;
          margin-top: 0.5em !important;
          margin-bottom: 0.5em !important;
          min-height: 1.5em !important;
          transform: translateZ(0) !important;
          contain: content !important;
        }
        
        /* 预防内联元素引起的抖动 */
        .markdown-content code,
        .markdown-content em,
        .markdown-content strong {
          white-space: pre-wrap !important;
          display: inline-block !important;
          transform: translateZ(0) !important;
        }
        
        /* 确保表格不会导致布局抖动 */
        .markdown-content table {
          table-layout: fixed !important;
          width: 100% !important;
          transform: translateZ(0) !important;
        }
  
        /* 稳定流式渲染容器 */
        .stable-display-layer {
          position: relative !important;
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
          overflow: hidden !important;
          min-height: 100% !important;
          will-change: contents !important;
          contain: paint layout style !important;
        }
        
        /* 防止滚动时的内容抖动 */
        #log-container {
          overscroll-behavior: contain !important;
          scroll-padding: 8px !important;
        }
        
        /* 优化流式文本渲染性能 */
        .stream-log {
          contain: content !important;
          page-break-inside: avoid !important;
        }
        
        /* 用于平滑过渡的动画 */
        @keyframes smoothFadeIn {
          from { opacity: 0.85; }
          to { opacity: 1; }
        }
        
        /* 应用平滑过渡效果 */
        .markdown-wrapper .render-target {
          animation: smoothFadeIn 0.3s ease-out !important;
        }
        
        /* 进度条闪烁动画 - 较慢 */
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* 进度条闪光动画 */
        @keyframes shimmer-fast {
          from { transform: translateX(-150%) skewX(-15deg); }
          to { transform: translateX(350%) skewX(-15deg); }
        }
        
        .animate-shimmer-fast {
          animation: shimmer-fast 2s ease-in-out infinite;
        }
      `;
      
      // 添加到head中
      document.head.appendChild(styleElement);
      
      // 清理函数
      return () => {
        document.head.removeChild(styleElement);
        
        // 清理所有定时器
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
        
        // 移除事件监听器
        const logContainer = document.getElementById('log-container');
        if (logContainer) {
          logContainer.removeEventListener('scroll', handleScroll);
        }
      };
    }, []);
  
   
  
    // 手动滚动到底部
    const scrollToBottom = useCallback(() => {
      const container = logContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
        setAutoScroll(true);
        userScrolledRef.current = false;
      }
      
      // 如果是AI填充标签页，也滚动JSON容器
      if (activeTab === 'json_structure') {
        const jsonContainer = document.querySelector('.json-container');
        if (jsonContainer) {
          jsonContainer.scrollTop = jsonContainer.scrollHeight;
        }
      }
    }, [activeTab]);
  
    // 添加一个固定字符计数算法，避免过长内容导致的布局抖动
    function getStableDisplayContent(content: string): string {
      // 如果内容为空直接返回
      if (!content) return '';
      // 对于长度大于某个值的内容，不做特殊处理
      // 在这里假设大于1000字符的内容已经足够长，不会引起明显抖动
      if (content.length > 100) return content;
      
      // 对于短内容，返回原始内容，不再添加隐藏的HTML标签
      // 我们会在渲染组件时处理填充问题
      return content;
    }
  
    // 优化日志渲染
    // 使用 React.memo 包裹 MemoizedMarkdown 组件
    const MemoizedMarkdownWrapper = React.memo(({ content }: { content: string }) => {
      // 使用稳定内容算法预处理内容
      const stableContent = useMemo(() => getStableDisplayContent(content), [content]);
      
      // 计算容器最小高度，确保短内容时也有一定高度
      const minHeight = content && content.length < 100 ? Math.max(24, content.length * 0.3) : 24;
      
      return (
        <div className="markdown-wrapper overflow-hidden" style={{ 
          minHeight: `${minHeight}px`,
          position: 'relative',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'contents'
        }}>
          <Markdown content={stableContent} />
        </div>
      );
    }, (prevProps, nextProps) => {
      // 简化比较函数，只比较内容是否完全相同
      return prevProps.content === nextProps.content;
    });
  
    const LogRenderer = ({ filteredLogs }: { filteredLogs: Array<{ time: string; content: string; type: string }> }) => {
      const memoizedLogs = useMemo(() => {
        return filteredLogs.map((log) => {
          const key = `${log.type}-${log.time}-${log.content.length}`;
          return (
            <div
              key={key}
              className={`stream-log ${log.type} p-2 rounded-lg ${
                log.type === 'reasoning'
                  ? 'bg-gray-100 text-gray-800 border-l-2 border-primary-400'
                  : log.type === 'content'
                  ? 'bg-purple-50/50 border-l-2 border-purple-400'
                  : log.type === 'json_structure'
                  ? 'bg-blue-50/50 border-l-2 border-blue-400'
                  : log.type === 'complete'
                  ? 'bg-green-50/50 border-l-2 border-green-400'
                  : log.type === 'error'
                  ? 'bg-red-50/50 border-l-2 border-red-400'
                  : ''
              }`}
              style={{ 
                animation: 'none',
                willChange: 'transform', // 优化元素变换性能
                contain: 'content', // 包含内部布局变化
                lineHeight: '1.5', // 固定行高
                minHeight: '24px', // 最小高度确保一致性
                position: 'relative',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              <div className="flex items-start">
                <div className="mr-2 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {log.type === 'progress' && <span>📄</span>}
                  {log.type === 'reasoning' && <span>🤔</span>}
                  {log.type === 'content' && <span>📝</span>}
                  {log.type === 'complete' && <span>✨</span>}
                  {log.type === 'json_structure' && <span>🔍</span>}
                  {log.type === 'error' && <span>❌</span>}
                  {!['progress', 'reasoning', 'content', 'complete', 'error', 'json_structure '].includes(
                    log.type
                  ) && <span>📌</span>}
                </div>
                <div className="flex-1 min-w-0 markdown-content">
                  {log.content && (
                    <MemoizedMarkdownWrapper content={log.content} />
                  )}
                </div>
              </div>
            </div>
          );
        });
      }, [filteredLogs]);
  
      // 添加一个稳定的包装容器，避免整体高度变化导致闪动
      return (
        <div className="stable-log-container" style={{ 
          minHeight: '100%', 
          position: 'relative',
          transform: 'translateZ(0)', // 强制硬件加速
          willChange: 'transform',    // 优化变换性能
          contain: 'paint layout',    // 限制重绘和重排范围
          backfaceVisibility: 'hidden',
          isolation: 'isolate'        // 创建新的层叠上下文
        }}>
          {memoizedLogs}
        </div>
      );
    };
  
    // JSON标签页内容渲染器
    const JsonTabContent = () => {
      const [copied, setCopied] = useState(false);
      const jsonContainerRef = useRef<HTMLDivElement>(null);
      
      // 使用 useEffect 确保 JsonTabContent 组件的滚动行为与其他标签页一致
      useEffect(() => {
        const jsonContainer = jsonContainerRef.current;
        if (!jsonContainer) return;
        
        // 定义滚动处理函数
        const handleJsonScroll = (e: Event) => {
          e.stopPropagation();
          
          if (!jsonContainer) return;
          
          // 检查是否在底部
          const isAtBottom = jsonContainer.scrollHeight - jsonContainer.scrollTop - jsonContainer.clientHeight < 30;
          
          // 更新滚动状态
          userScrolledRef.current = !isAtBottom;
          setAutoScroll(isAtBottom);
        };
        
        // 添加事件监听器
        jsonContainer.addEventListener('scroll', handleJsonScroll);
        
        // 清理函数
        return () => {
          jsonContainer.removeEventListener('scroll', handleJsonScroll);
        };
      }, []);
      
      // 使JSON容器在内容变化时检查自动滚动状态
      useEffect(() => {
        if (autoScroll && jsonContainerRef.current && jsonStructure) {
          jsonContainerRef.current.scrollTop = jsonContainerRef.current.scrollHeight;
        }
      }, [jsonStructure, autoScroll]);
      
      // 格式化JSON字符串
      const formattedJson = useMemo(() => {
        if (!jsonStructure) return '';
        try {
          // 尝试解析JSON字符串并格式化
          const parsedJson = JSON.parse(jsonStructure);
          return JSON.stringify(parsedJson, null, 2);
        } catch (e) {
          // 如果无法解析为JSON，返回原始字符串
          return jsonStructure;
        }
      }, [jsonStructure]);
      
      // 复制JSON到剪贴板
      const copyToClipboard = useCallback(() => {
        if (!formattedJson) return;
        
        navigator.clipboard.writeText(formattedJson)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(err => {
            console.error('无法复制到剪贴板:', err);
          });
      }, [formattedJson]);
      
      // 应用JSON结构
      const handleApplyJson = useCallback(() => {
        if (!jsonStructure || !onApplyJsonStructure) return;
        
        try {
          onApplyJsonStructure(jsonStructure);
          setShowFillSuccess(true);
          setTimeout(() => setShowFillSuccess(false), 3000);
        } catch (error) {
          console.error('应用JSON结构时出错:', error);
        }
      }, [jsonStructure, onApplyJsonStructure]);

      if (!jsonStructure) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="relative rounded-full h-8 w-8 bg-gray-300 flex items-center justify-center">
                    <span className="text-white text-lg">⋯</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                暂无可用的AI自动填充数据
                {isAnalyzing && '，正在生成中...'}
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col h-full relative">
          <div 
            ref={jsonContainerRef}
            className="flex-1 overflow-auto mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 relative stable-height-container json-container" 
            style={{
              height: '400px', // 固定高度，防止抖动
              position: 'relative',
              transform: 'translateZ(0)',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              contain: 'paint layout',
              scrollBehavior: 'smooth',
              overscrollBehavior: 'contain',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e0 #f7fafc',
            }}
          >
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
              {formattedJson}
            </pre>
            
          
            <div className="absolute top-2 right-2 flex gap-2">
              <button 
                type="button"
                onClick={copyToClipboard}
                className="p-1.5 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                title="复制JSON"
              >
                {copied ? (
                  <span className="text-green-600 text-xs font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="ml-1">已复制</span>
                  </span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
         
          {/* <div className="flex justify-between items-center">
            {showFillSuccess ? (
              <div className="px-6 py-2 bg-green-100 text-green-800 rounded-xl border border-green-200 shadow-md flex items-center mr-auto ml-auto">
                <span className="mr-2">✓</span>
                <span className="font-medium">应用成功</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleApplyJson}
                disabled={!jsonStructure || isAnalyzing}
                className={`flex items-center justify-center px-4 py-2 rounded-xl transition-all duration-300 border ${
                  !jsonStructure || isAnalyzing
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md border-primary-600 hover:shadow-lg'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span className="font-medium">应用AI填充</span>
              </button>
            )}
          </div> */}
        </div>
      );
    };
  
    return (
      <div className="w-full lg:w-3/5 order-1 lg:order-2 lg:border-l lg:pl-8 border-gray-100">
        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-500 backdrop-blur-sm relative overflow-hidden h-full min-h-[450px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-purple-500 to-primary-600 opacity-80"></div>
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary-100/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-100/10 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col">
            <h4 className="text-primary-600 font-medium mb-3 text-center flex items-center justify-center">
              <span className="inline-block h-2 w-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
              <span className="gradient-text text-lg font-semibold">AI分析引擎思考过程</span>
              {isAnalyzing && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full animate-pulse">
                  实时分析中...
                </span>
              )}
            </h4>
            
            {/* 标签切换按钮 */}
            <div className="flex justify-between mb-3">
              <div className="flex space-x-1">
                {tabOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setActiveTab(option.value)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-300 ${
                      activeTab === option.value
                        ? 'bg-primary-100 text-primary-700 font-medium shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
              
              {jsonStructure && activeTab === 'json_structure' && (
                <button
                  type="button"
                  onClick={() => onApplyJsonStructure(jsonStructure)}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center"
                >
                  <span className="mr-1">✓</span> 应用JSON结构
                </button>
              )}
            </div>
            
            {/* AI分析流程组件 - 在进度条上方显示 */}
            {isAnalyzing && (
              <div className="mb-3">
                <AIProcessFlow progress={progress} />
              </div>
            )}
            
            {/* 进度条 */}
            {isAnalyzing && progress > 0 && (
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                  <div 
                    className={`bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600 h-2 rounded-full 
                                transition-all duration-500 ease-out ${progress < 100 ? 'animate-pulse-slow' : ''}`}
                    style={{ 
                      width: `${progress}%`, 
                      boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.5)' 
                    }}
                  >
                    {/* 进度条活动指示器 */}
                    {progress < 100 && progress > 5 && (
                      <div className="h-full w-[10%] absolute right-0 top-0 bg-white opacity-30 animate-shimmer-fast"
                           style={{ transform: 'skewX(-15deg)' }}></div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-gray-400">{Math.floor(progress)}%</div>
                  <p className="text-xs text-gray-500 text-center flex-1">{statusMessage}</p>
                  <div className="text-xs text-gray-400 flex items-center">
                    <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${progress < 100 ? 'bg-primary-400 animate-pulse' : 'bg-green-500'}`}></span>
                    <span>{progress < 100 ? '处理中' : '完成'}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 分析日志区域 */}
            <div className="relative">
              <div 
                id="log-container"
                ref={logContainerRef}
                className="flex-1 bg-white p-5 rounded-xl text-sm shadow-inner border border-gray-200 stable-height-container" 
                style={{ 
                  height: activeTab === 'json_structure' ? '500px' : '480px', // 为 JSON 标签页提供足够空间
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e0 #f7fafc',
                  position: 'relative',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  // 性能优化属性
                  containIntrinsicSize: '0 480px',
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  // 新增：初始滚动位置在底部
                  scrollBehavior: 'smooth'
                }}
              >
                {analysisLogs.length === 0 ? (
                  <div className="text-center text-gray-600 py-10 flex flex-col items-center justify-center h-full">
                    {pdfFile ? (
                      <>
                        <div className="animate-spin h-10 w-10 border-3 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="font-medium">准备开始分析...</p>
                      </>
                    ) : (
                      <>
                        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-lg border border-dashed border-gray-300 w-40 h-40 flex items-center justify-center shadow-inner">
                          <UploadIcon className="h-14 w-14 text-primary-500 animate-bounce-subtle" />
                          <div className="absolute -top-2 -right-2">
                            <span className="inline-flex h-8 w-8 rounded-full bg-primary-100 items-center justify-center border border-primary-200">
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
                  <div className="space-y-3 terminal-text text-sm h-full content-stable">
                    {activeTab === 'json_structure' ? (
                      <div className="stable-display-layer">
                        <JsonTabContent />
                      </div>
                    ) : (
                      filteredLogs.length > 0 ? (
                        <div className="stable-display-layer">
                          <LogRenderer filteredLogs={filteredLogs} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="flex justify-center mb-4">
                              <div className="relative">
                                <div className="animate-ping absolute h-8 w-8 rounded-full bg-primary-200 opacity-75"></div>
                                <div className="relative rounded-full h-8 w-8 bg-primary-500 flex items-center justify-center">
                                  <span className="text-white text-lg">⋯</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600">
                              {activeTab === 'reasoning' ? '暂无推理过程' : '暂无评审结果'}
                              {isAnalyzing && '，正在生成中...'}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              
              {/* 滚动控制按钮 - 专用于AI填充标签页 */}
              {activeTab === 'json_structure' && (
                <div className="absolute bottom-5 right-5 z-20 flex space-x-2">
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors shadow-md"
                    aria-label="滚动到底部"
                  >
                    <span>▼</span>
                  </button>
                </div>
              )}

              {/* 滚动控制按钮 - 不再区分标签页，统一逻辑 */}
              {!autoScroll && activeTab !== 'json_structure' && (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-2.5 rounded-full shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300 hover:bg-primary-50 z-10"
                  aria-label="滚动到底部"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary-500"
                  >
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }