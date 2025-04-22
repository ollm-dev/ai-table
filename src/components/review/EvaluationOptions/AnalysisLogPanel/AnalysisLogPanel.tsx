import React from "react";
import { UploadIcon } from "lucide-react";
import Markdown from '@/components/markdown';
import { AnalysisLogPanelProps } from "@/types/review/EvaluationOptions/EvaluationOptionsSection";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { AIProcessFlow } from '../AIProcessFlow/AIProcessFlow';
import { toast } from "sonner";


export default function AnalysisLogPanel({ 
    analysisLogs, 
    isAnalyzing, 
    pdfFile,
    progress,
    statusMessage,
    onApplyJsonStructure,
    jsonStructure,
    jsonCompleteStatus,
    setJsonCompleteStatus
  }: AnalysisLogPanelProps) {
    const [activeTab, setActiveTab] = useState<'reasoning' | 'content' | 'json_structure'>('reasoning');
    const logContainerRef = useRef<HTMLDivElement>(null);
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Default to no auto-scroll, giving users full control
    const [autoScroll, setAutoScroll] = useState(false);
    const [showFillSuccess, setShowFillSuccess] = useState(false);
    const [hasAppliedJson, setHasAppliedJson] = useState(false); // Track if JSON has been applied
    // Add a ref to store the last applied JSON structure
    const lastAppliedJsonRef = useRef<string | null>(null);
    // Add JSON length to determine if content has changed
    const lastJsonLengthRef = useRef<number>(0);

    const userScrolledRef = useRef(false);
    const scrollPositionRef = useRef(0);
    const hasHandledScrollRef = useRef(false);
    const isHandlingScrollRef = useRef(false);
    // Default to no initial scroll, component won't auto-scroll to bottom on initial load
    const needsInitialScrollRef = useRef(false);
  
    // Define tab options
    const tabOptions = [
      { 
        value: 'reasoning' as const, 
        label: 'Reasoning Process', 
        icon: '🤔' 
      },
      { 
        value: 'content' as const, 
        label: 'Review Results', 
        icon: '📝' 
      },
      { 
        value: 'json_structure' as const, 
        label: 'AI Filling', 
        icon: '🔍',
        badge: !!jsonStructure
      }
    ];
  
    // Handle scroll events
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
  
    // Add scroll event listener
    useEffect(() => {
      const container = logContainerRef.current;
      if (container) {
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
      }
    }, [handleScroll]);
  
    // Handle initial scroll - modified to not auto-scroll to bottom
    useEffect(() => {
      // Remove auto-scroll to bottom logic, let users control scroll position
      needsInitialScrollRef.current = false;
    }, [activeTab]);
  
    // Auto-scroll to bottom - only when content updates and user has manually scrolled to bottom
    useEffect(() => {
      // Only enable auto-scroll when user has scrolled to bottom (autoScroll is true)
      if (autoScroll && logContainerRef.current && analysisLogs.length > 0) {
        // Use debounce to reduce frequent scrolling
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
    
    // Maintain user's scroll preference when switching tabs, don't force reset
    useEffect(() => {
      // Don't reset auto-scroll state when switching tabs, respect user's choice
      needsInitialScrollRef.current = false; // No automatic initial scrolling
      
      // If user was previously scrolled to bottom, maintain this state after tab switch
      const runAfterRender = setTimeout(() => {
        if (autoScroll && logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      }, 0);
      
      return () => clearTimeout(runAfterRender);
    }, [activeTab, autoScroll]);
  
    // Cache filtered logs
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
  
    // Add CSS styles to document head, ensuring markdown rendering stability
    useEffect(() => {
      // Create style tag
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        /* Fixed line height and block spacing, prevents jumping */
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
        
        /* Prevent inline elements from causing jumping */
        .markdown-content code,
        .markdown-content em,
        .markdown-content strong {
          white-space: pre-wrap !important;
          display: inline-block !important;
          transform: translateZ(0) !important;
        }
        
        /* Ensure tables don't cause layout jumping */
        .markdown-content table {
          table-layout: fixed !important;
          width: 100% !important;
          transform: translateZ(0) !important;
        }
  
        /* Stable streaming rendering container */
        .stable-display-layer {
          position: relative !important;
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
          overflow: hidden !important;
          min-height: 100% !important;
          will-change: contents !important;
          contain: paint layout style !important;
        }
        
        /* Prevent content jumping during scrolling */
        #log-container {
          overscroll-behavior: contain !important;
          scroll-padding: 8px !important;
        }
        
        /* Optimize streaming text rendering performance */
        .stream-log {
          contain: content !important;
          page-break-inside: avoid !important;
        }
        
        /* Animation for smooth transitions */
        @keyframes smoothFadeIn {
          from { opacity: 0.85; }
          to { opacity: 1; }
        }
        
        /* Apply smooth transition effects */
        .markdown-wrapper .render-target {
          animation: smoothFadeIn 0.3s ease-out !important;
        }
        
        /* Progress bar pulse animation - slower */
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Progress bar shimmer animation */
        @keyframes shimmer-fast {
          from { transform: translateX(-150%) skewX(-15deg); }
          to { transform: translateX(350%) skewX(-15deg); }
        }
        
        .animate-shimmer-fast {
          animation: shimmer-fast 2s ease-in-out infinite;
        }
      `;
      
      // Add to head
      document.head.appendChild(styleElement);
      
      // Cleanup function
      return () => {
        document.head.removeChild(styleElement);
        
        // Clear all timers
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
        
        // Remove event listeners
        const logContainer = document.getElementById('log-container');
        if (logContainer) {
          logContainer.removeEventListener('scroll', handleScroll);
        }
      };
    }, []);
  
   
  
    // Manually scroll to bottom
    const scrollToBottom = useCallback(() => {
      const container = logContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
        setAutoScroll(true);
        userScrolledRef.current = false;
      }
      
      // If on AI filling tab, also scroll JSON container
      if (activeTab === 'json_structure') {
        const jsonContainer = document.querySelector('.json-container');
        if (jsonContainer) {
          jsonContainer.scrollTop = jsonContainer.scrollHeight;
        }
      }
    }, [activeTab]);
  
    // Add a fixed character count algorithm to avoid layout jumping caused by long content
    function getStableDisplayContent(content: string): string {
      // Return directly if content is empty
      if (!content) return '';
      // For content longer than a certain value, no special processing
      // Here we assume content longer than 1000 characters is long enough not to cause obvious jumping
      if (content.length > 100) return content;
      
      // For short content, return original content without adding hidden HTML tags
      // We'll handle padding issues when rendering the component
      return content;
    }
  
    // Optimize log rendering
    // Wrap MemoizedMarkdown component with React.memo
    const MemoizedMarkdownWrapper = React.memo(({ content }: { content: string }) => {
      // Preprocess content using stable content algorithm
      const stableContent = useMemo(() => getStableDisplayContent(content), [content]);
      
      // Calculate container min height, ensuring sufficient height for short content
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
      // Simplify comparison function, only compare if content is exactly the same
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
                willChange: 'transform', // Optimize element transformation performance
                contain: 'content', // Contain internal layout changes
                lineHeight: '1.5', // Fixed line height
                minHeight: '24px', // Minimum height for consistency
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
  
      // Add a stable wrapper container to avoid flickering caused by overall height changes
      return (
        <div className="stable-log-container" style={{ 
          minHeight: '100%', 
          position: 'relative',
          transform: 'translateZ(0)', // Force hardware acceleration
          willChange: 'transform',    // Optimize transformation performance
          contain: 'paint layout',    // Limit repainting and reflow scope
          backfaceVisibility: 'hidden',
          isolation: 'isolate'        // Create new stacking context
        }}>
          {memoizedLogs}
        </div>
      );
    };
  
    // JSON tab content renderer
    const JsonTabContent = () => {
      const [copied, setCopied] = useState(false);
      const jsonContainerRef = useRef<HTMLDivElement>(null);
      
      // Use useEffect to ensure JsonTabContent component's scrolling behavior is consistent with other tabs
      useEffect(() => {
        const jsonContainer = jsonContainerRef.current;
        if (!jsonContainer) return;
        
        // Define scroll handler
        const handleJsonScroll = (e: Event) => {
          e.stopPropagation();
          
          if (!jsonContainer) return;
          
          // Check if at bottom
          const isAtBottom = jsonContainer.scrollHeight - jsonContainer.scrollTop - jsonContainer.clientHeight < 30;
          
          // Update scroll state
          userScrolledRef.current = !isAtBottom;
          setAutoScroll(isAtBottom);
        };
        
        // Add event listener
        jsonContainer.addEventListener('scroll', handleJsonScroll);
        
        // Cleanup function
        return () => {
          jsonContainer.removeEventListener('scroll', handleJsonScroll);
        };
      }, []);
      
      // Make JSON container check auto-scroll state when content changes
      useEffect(() => {
        if (autoScroll && jsonContainerRef.current && jsonStructure) {
          jsonContainerRef.current.scrollTop = jsonContainerRef.current.scrollHeight;
        }
      }, [jsonStructure, autoScroll]);
      
      // Format JSON string
      const formattedJson = useMemo(() => {
        if (!jsonStructure) return '';
        try {
          // Try to parse JSON string and format
          const parsedJson = JSON.parse(jsonStructure);
          return JSON.stringify(parsedJson, null, 2);
        } catch (e) {
          // If unable to parse as JSON, return original string
          return jsonStructure;
        }
      }, [jsonStructure]);
      
      // Copy JSON to clipboard
      const copyToClipboard = useCallback(() => {
        if (!formattedJson) return;
        
        navigator.clipboard.writeText(formattedJson)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(err => {
            console.error('Unable to copy to clipboard:', err);
          });
      }, [formattedJson]);
      
      // // Manually apply JSON data
      // const handleManualApply = useCallback(() => {
      //   if (!jsonStructure || !onApplyJsonStructure) return;
        
      //   try {
      //     console.log('Manually applying JSON data, data length:', jsonStructure.length);
      //     onApplyJsonStructure(jsonStructure);
          
      //     // Update applied JSON reference
      //     lastAppliedJsonRef.current = jsonStructure;
          
      //     toast.success('AI data manually applied', {
      //       description: 'Review form has been filled based on AI analysis results',
      //       duration: 3000
      //     });
          
      //     setShowFillSuccess(true);
      //     setTimeout(() => setShowFillSuccess(false), 3000);
          
      //     console.log('Manual JSON application completed');
      //   } catch (error) {
      //     toast.error('Manual application failed', {
      //       description: error instanceof Error ? error.message : 'Unknown error',
      //       duration: 5000
      //     });
      //     console.error('Error applying JSON manually:', error);
      //   }
      // }, [jsonStructure, onApplyJsonStructure]);

      if (!jsonStructure) {
        return (
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
                No AI auto-fill data yet
                {isAnalyzing && ', generating...'}
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
              height: '400px', // Fixed height to prevent jumping
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
                title="Copy JSON"
              >
                {copied ? (
                  <span className="text-green-600 text-xs font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="ml-1">Copied</span>
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
        </div>
      );
    };
  
    // Mark as complete when JSON structure changes
    // useEffect(() => {
    //   if (jsonCompleteStatus) {
    //     setJsonCompleteStatus(true);
    //   }
    // }, [jsonCompleteStatus]);

    // Separate into dedicated useEffect for handling JSON application
    
    
    
    
    useEffect(() => {
      // Only execute when JSON is complete and marked for application
        if (!jsonStructure || !onApplyJsonStructure || !jsonCompleteStatus) {
        return;
      }

      console.log('[Auto Apply] Starting to apply JSON...');
      console.log('[Auto Apply] JSON length:', jsonStructure.length);
      
      try {
        // Show Toast first to let user know application is in progress
        toast.info('Applying AI analysis data...', { duration: 1500 });
        
        // Directly call apply function
        onApplyJsonStructure(jsonStructure);
        
        // Update applied JSON reference
        lastAppliedJsonRef.current = jsonStructure;
        
        // Reset completion status to prevent repeated application
        setJsonCompleteStatus(false);
        
        // Show success notification
        toast.success('AI data successfully applied to form', {
          description: 'Review form has been auto-filled based on AI analysis results',
          duration: 4000
        });
        
        // Show UI success indicator
        setShowFillSuccess(true);
        setTimeout(() => setShowFillSuccess(false), 3000);
        
        console.log('[Auto Apply] Successfully completed');
      } catch (error) {
        toast.error('Auto-fill failed', {
          description: error instanceof Error ? error.message : 'Unknown error',
          duration: 5000
        });
        console.error('[Auto Apply] Error:', error);
        
        // Reset status even on error to avoid infinite retry
        setJsonCompleteStatus(false);
      }
    }, [jsonStructure, onApplyJsonStructure, setJsonCompleteStatus]);
  
    return (
      <div className="w-full lg:w-3/5 order-1 lg:order-2 lg:border-l lg:pl-8 border-gray-100">
        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-500 backdrop-blur-sm relative overflow-hidden h-full min-h-[450px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-purple-500 to-primary-600 opacity-80"></div>
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary-100/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-100/10 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col">
            <h4 className="text-primary-600 font-medium mb-3 text-center flex items-center justify-center">
              <span className="inline-block h-2 w-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
              <span className="gradient-text text-lg font-semibold">AI Analysis Engine Thinking Process</span>
              {isAnalyzing && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full animate-pulse">
                  Analyzing...
                </span>
              )}
            </h4>
            
            {/* Tab switch buttons */}
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
            </div>
            
            {/* AI analysis flow component - display above progress bar */}
            {isAnalyzing && (
              <div className="mb-3">
                <AIProcessFlow progress={progress} />
              </div>
            )}
            
            {/* Progress bar */}
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
                    {/* Progress bar activity indicator */}
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
                    <span>{progress < 100 ? 'Processing' : 'Completed'}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Analysis logs area */}
            <div className="relative">
              <div 
                id="log-container"
                ref={logContainerRef}
                className="flex-1 bg-white p-5 rounded-xl text-sm shadow-inner border border-gray-200 stable-height-container" 
                style={{ 
                  height: activeTab === 'json_structure' ? '500px' : '480px', // Provide enough space for JSON tab
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e0 #f7fafc',
                  position: 'relative',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  // Performance optimization properties
                  containIntrinsicSize: '0 480px',
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  // New: initial scroll position at bottom
                  scrollBehavior: 'smooth'
                }}
              >
                {analysisLogs.length === 0 ? (
                  <div className="text-center text-gray-600 py-10 flex flex-col items-center justify-center h-full">
                    {pdfFile ? (
                      <>
                        <div className="animate-spin h-10 w-10 border-3 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="font-medium">Preparing to start analysis...</p>
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
                        <p className="mt-4 font-medium text-gray-700">Please upload a PDF file to start analysis</p>
                        <p className="mt-1 text-xs text-gray-500">Supports PDF files under 10MB</p>
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
                              {activeTab === 'reasoning' ? 'No reasoning process yet' : 'No review results yet'}
                              {isAnalyzing && ', generating...'}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              
              {/* Scroll control buttons - dedicated to AI filling tab */}
              {activeTab === 'json_structure' && (
                <div className="absolute bottom-5 right-5 z-20 flex space-x-2">
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors shadow-md"
                    aria-label="Scroll to bottom"
                  >
                    <span>▼</span>
                  </button>
                </div>
              )}

              {/* Scroll control buttons - no longer differentiated by tab, unified logic */}
              {!autoScroll && activeTab !== 'json_structure' && (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-2.5 rounded-full shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300 hover:bg-primary-50 z-10"
                  aria-label="Scroll to bottom"
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