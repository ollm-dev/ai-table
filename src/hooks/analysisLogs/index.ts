/**
 * 分析日志钩子及相关工具函数的集合
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// 导入类型和常量
import { emptyFormData, FormData, AnalysisLogEntry } from './types';

// 导入工具函数和数据处理函数
import { isEqual, sanitizeHtml, transformApiJsonToFormData } from './utils';
import { initializeFormStructure as initializeFormStructureImpl, updateFormData as updateFormDataImpl } from './formData';
import { startAnalysisWithBackend as startAnalysisWithBackendImpl, processStream } from './apiRequest';
import { addAnalysisLog as addAnalysisLogImpl, updateLogContent as updateLogContentImpl } from './logHandlers';

/**
 * 分析日志钩子，用于管理论文评审过程中的数据和状态
 * @returns 分析日志状态和方法
 */
export function useAnalysisLogs() {
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLogEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jsonStructure, setJsonStructure] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [reasoningText, setReasoningText] = useState('');
  const [finalContent, setFinalContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // 使用 useRef 缓存最新的表单数据，初始化为空的表单数据结构
  const formDataRef = useRef<FormData>({...emptyFormData});
  
  // 使用 useState 生成响应式的表单数据
  const [formData, setFormData] = useState<FormData>({...emptyFormData});
  
  // 使用 ref 记录是否已初始化结构
  const structureInitializedRef = useRef(false);
  
  // 最近一次更新的时间戳，用于节流
  const lastUpdateTimeRef = useRef(0);
  
  // 使用 useRef 存储更新回调
  const dataUpdateCallbackRef = useRef<((data: any) => void) | null>(null);
  
  // 添加分析日志的函数
  const addAnalysisLog = useCallback((content: string, type: string = "normal") => {
    addAnalysisLogImpl(content, type, setAnalysisLogs);
  }, []);
  
  // 更新特定类型的日志内容的函数
  const updateLogContent = useCallback((type: string, content: string, append: boolean = false) => {
    updateLogContentImpl(type, content, append, setAnalysisLogs);
  }, []);
  
  // 注册外部更新回调的方法
  const registerUpdateCallback = useCallback((callback: (data: any) => void) => {
    dataUpdateCallbackRef.current = callback;
  }, []);
  
  // 初始化表单结构
  const initializeFormStructure = useCallback((initialData: any) => {
    initializeFormStructureImpl(
      initialData,
      formDataRef,
      structureInitializedRef,
      setFormData,
      dataUpdateCallbackRef,
      addAnalysisLog
    );
  }, [addAnalysisLog]);
  
  // 更新表单数据
  const updateFormData = useCallback((jsonStructure: any, isPartial: boolean = false) => {
    updateFormDataImpl(
      jsonStructure,
      isPartial,
      formDataRef,
      lastUpdateTimeRef,
      structureInitializedRef,
      setFormData,
      dataUpdateCallbackRef,
      initializeFormStructure,
      addAnalysisLog
    );
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
  const startAnalysisWithBackend = useCallback(async (filePath: string, useMockData: boolean = false) => {
    return startAnalysisWithBackendImpl(
      filePath,
      setIsAnalyzing,
      setAnalysisLogs,
      setIsWaitingForResponse,
      setProgress,
      setStatusMessage,
      setReasoningText,
      setJsonStructure,
      setFinalContent,
      setError,
      resetFormData,
      addAnalysisLog,
      updateLogContent,
      updateFormData,
      useMockData
    );
  }, [addAnalysisLog, resetFormData, updateFormData, updateLogContent]);
  
  // 更新 useEffect 以监听 reasoningText 和 finalContent 还有jsonStructure的变化
  useEffect(() => {
    if (reasoningText) {
      updateLogContent('reasoning', reasoningText, false);
    }
  }, [reasoningText, updateLogContent]);
  
  useEffect(() => {
    if (finalContent) {
      updateLogContent('content', finalContent, false);
    }
  }, [finalContent, updateLogContent]);

  useEffect(() => {
    if (jsonStructure) {
      updateLogContent('json_structure', jsonStructure, false);
    }
  }, [jsonStructure, updateLogContent]);

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
    isWaitingForResponse,
    addAnalysisLog,
    startAnalysisWithBackend,
    setAnalysisLogs,
    progress,
    statusMessage,
    error,
    formData,
    registerUpdateCallback,
    updateFormData,
    resetFormData,
    jsonStructure,
    setJsonStructure,
    reasoningText,
    finalContent
  };
} 