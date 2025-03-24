'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FormHeader } from '@/components/review/FormHeader/FormHeader';
import { ProjectInfoSection } from '@/components/review/ProjectInfo/ProjectInfoSection';
import { EvaluationOptionsSection } from '@/components/review/EvaluationOptions/EvaluationOptionsSection';
import { TextualEvaluationSection } from '@/components/review/TextualEvaluation/TextualEvaluationSection';
import { FormStyles } from '@/app/ReviewForm/css';
import { useReviewForm, FormState } from '@/hooks/useReviewForm';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAnalysisLogs } from '@/hooks/useAnalysisLogs';


interface ReviewFormProps {
  data: typeof import('@/data/reviewFormData').reviewFormData;
}

// 用于深拷贝数组
const deepCloneArray = <T,>(arr: T[]): T[] => {
  return JSON.parse(JSON.stringify(arr));
};

// 判断对象是否为空
const isEmptyObject = (obj: any): boolean => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

/**
 * 项目评审表单组件
 * @param {ReviewFormProps} props - 组件属性
 * @param {Object} props.data - 评审表单数据
 * @returns {JSX.Element} 渲染的表单组件
 */
export default function ReviewForm({ data }: ReviewFormProps) {
  // 使用自定义钩子
  const {
    formState,
    setFormState,
    showEvaluationAI,
    setShowEvaluationAI,
    isLoadingData,
    aiRecommendationsAvailable,
    setAiRecommendationsAvailable,
    projectInfo,
    setProjectInfo,
    editingField,
    handleRadioChange,
    handleTextChange,
    handleAIRecommendationToggle,
    handleProjectInfoChange,
    startEditing,
    stopEditing
  } = useReviewForm(data);
  
  const {
    analysisLogs,
    isAnalyzing,
    addAnalysisLog,
    startAnalysisWithBackend,
    setAnalysisLogs,
    progress,
    statusMessage,
    formData,
    registerUpdateCallback,
    updateFormData,
    resetFormData,
    jsonStructure,
    setJsonStructure,
    reasoningText,
    finalContent
  } = useAnalysisLogs();
  
  // 保存当前使用的表单数据 (AI 分析后的数据或默认数据)
  const [currentFormData, setCurrentFormData] = useState<any>(null);
  
  // 记录上次更新时间，用于节流
  const lastUpdateTimeRef = useRef(0);
  
  // 判断两个对象是否相等
  const isEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };
  
  // 处理表单数据更新的函数
  const handleFormDataUpdate = useCallback((updatedData: any) => {
    if (!updatedData) return;
    
    // 节流控制: 200ms内只更新一次
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 200) {
      return;
    }
    lastUpdateTimeRef.current = now;
    
    console.log('📊 ReviewForm 接收到表单数据更新:', updatedData);
    
    // 确保更新前有合理的当前数据
    const current = currentFormData || data;
    
    // 合并数据以确保结构完整性
    const mergedData: any = {
      formTitle: updatedData.formTitle || current.formTitle || "评审意见表",
      projectInfo: {
        ...(current.projectInfo || {}),
        ...(updatedData.projectInfo || {})
      },
      evaluationSections: [],
      textualEvaluations: []
    };
    
    // 处理评估部分数据
    if (Array.isArray(updatedData.evaluationSections) && updatedData.evaluationSections.length > 0) {
      mergedData.evaluationSections = deepCloneArray(updatedData.evaluationSections);
    } else if (Array.isArray(current.evaluationSections) && current.evaluationSections.length > 0) {
      mergedData.evaluationSections = deepCloneArray(current.evaluationSections);
    } else {
      // 如果两者都为空，使用默认结构
      mergedData.evaluationSections = deepCloneArray(data.evaluationSections || []);
    }
    
    // 处理文本评估部分数据
    if (Array.isArray(updatedData.textualEvaluations) && updatedData.textualEvaluations.length > 0) {
      mergedData.textualEvaluations = deepCloneArray(updatedData.textualEvaluations);
    } else if (Array.isArray(current.textualEvaluations) && current.textualEvaluations.length > 0) {
      mergedData.textualEvaluations = deepCloneArray(current.textualEvaluations);
    } else {
      // 如果两者都为空，使用默认结构
      mergedData.textualEvaluations = deepCloneArray(data.textualEvaluations || []);
    }
    
    // 检查数据是否真的有变化
    if (isEqual(currentFormData, mergedData)) {
      console.log('⚠️ 数据未变化，跳过更新');
      return;
    }
    
    console.log('🔄 合并后的表单数据:', mergedData);
    setCurrentFormData(mergedData);
    
    // 更新项目信息
    if (updatedData.projectInfo && !isEmptyObject(updatedData.projectInfo)) {
      setProjectInfo(prev => ({
        ...prev,
        ...updatedData.projectInfo
      }));
    }
    
    // 在评估选项中使用 AI 建议
    if (showEvaluationAI && Array.isArray(mergedData.evaluationSections)) {
      const newEvaluations: Record<string, string> = { ...formState.evaluations };
      
      mergedData.evaluationSections.forEach((section: any) => {
        if (section.id && section.aiRecommendation) {
          newEvaluations[section.id] = section.aiRecommendation;
        }
      });
      
      if (!isEqual(formState.evaluations, newEvaluations)) {
        setFormState((prev: FormState) => ({
          ...prev,
          evaluations: newEvaluations
        }));
      }
    }
    
    // 在文本评估中使用 AI 建议
    if (showEvaluationAI && Array.isArray(mergedData.textualEvaluations)) {
      const newTextEvals: Record<string, string> = { ...formState.textEvals };
      
      mergedData.textualEvaluations.forEach((evaluation: any) => {
        if (evaluation.id && evaluation.aiRecommendation) {
          newTextEvals[evaluation.id] = evaluation.aiRecommendation;
        }
      });
      
      if (!isEqual(formState.textEvals, newTextEvals)) {
        setFormState((prev: FormState) => ({
          ...prev,
          textEvals: newTextEvals
        }));
      }
    }
  }, [currentFormData, data, setProjectInfo, showEvaluationAI, setFormState, formState]);
  
  // 首次加载时初始化 currentFormData
  useEffect(() => {
    if (!currentFormData) {
      setCurrentFormData(data);
    }
  }, [data, currentFormData]);
  
  // 监听 formData 变化，更新表单
  useEffect(() => {
    if (formData) {
      console.log('🔄 formData 更新触发表单更新:', formData);
      handleFormDataUpdate(formData);
    }
  }, [formData, handleFormDataUpdate]);
  
  const {
    pdfFile,
    uploadError,
    fileInputRef,
    handleFileChange,
    handleUploadPdf,
    handleRemovePdf,
    uploadSuccess
  } = useFileUpload(
    // 分析开始回调
    async (filePath) => {
      const success = await startAnalysisWithBackend(filePath);
      if (success) {
        setAiRecommendationsAvailable(true);
        setShowEvaluationAI(true);
      }
    },
    // 添加日志回调
    addAnalysisLog
  );
  
  // 注册数据更新回调
  useEffect(() => {
    registerUpdateCallback(handleFormDataUpdate);
    
    // 清理函数
    return () => {
      // 注册一个空回调以清理前一个回调
      registerUpdateCallback(() => {});
    };
  }, [registerUpdateCallback, handleFormDataUpdate]);
  
  // 处理上传按钮点击
  const handleUpload = async () => {
    await handleUploadPdf(() => {
      setAiRecommendationsAvailable(false);
      setShowEvaluationAI(false);
      setAnalysisLogs([]);
      
      // 重置表单数据
      resetFormData();
      // 重置至初始状态
      setCurrentFormData({...data});
      // 重置项目信息
      setProjectInfo({
        projectTitle: "",
        projectType: "",
        researchField: "",
        applicantName: "",
        applicationId: ""
      });
      // 重置表单状态
      setFormState({
        evaluations: {},
        textEvals: {}
      });
    });
  };
  
  // 处理应用JSON结构的回调函数
  const handleApplyJsonStructure = useCallback((jsonStr: string) => {
    try {
      console.log('🔄 应用JSON结构:', jsonStr);
      
      // 尝试解析JSON字符串
      let jsonData;
      if (typeof jsonStr === 'string') {
        try {
          jsonData = JSON.parse(jsonStr);
        } catch (parseError) {
          console.error('❌ JSON解析失败，尝试修复:', parseError);
          
          // 尝试修复JSON格式问题
          try {
            // 1. 替换单引号为双引号
            let fixedJsonStr = jsonStr.replace(/'/g, '"');
            
            // 2. 处理没有引号的属性名
            fixedJsonStr = fixedJsonStr.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
            
            // 3. 处理尾部多余的逗号
            fixedJsonStr = fixedJsonStr.replace(/,\s*([}\]])/g, '$1');
            
            jsonData = JSON.parse(fixedJsonStr);
            console.log('✅ 修复后成功解析JSON');
            addAnalysisLog('JSON格式已自动修复', 'success');
          } catch (fixError) {
            console.error('❌ 修复JSON失败:', fixError);
            
            // 尝试从字符串中提取有效的JSON对象
            const objectMatch = jsonStr.match(/{[^]*?}/);
            if (objectMatch && objectMatch[0]) {
              try {
                const extractedObject = objectMatch[0];
                jsonData = JSON.parse(extractedObject);
                console.log('✅ 提取JSON对象成功');
                addAnalysisLog('从不完整数据中提取JSON成功', 'success');
              } catch (extractError) {
                console.error('❌ 提取JSON对象失败:', extractError);
                throw new Error("无法解析JSON数据");
              }
            } else {
              throw new Error("无法识别有效的JSON数据");
            }
          }
        }
      } else {
        jsonData = jsonStr;
      }
      
      // 确保数据为对象
      if (!jsonData || typeof jsonData !== 'object') {
        throw new Error("无效的JSON数据结构");
      }
      
      // 使用updateFormData函数更新表单数据
      updateFormData(jsonData, false);
      
      // 添加成功日志
      addAnalysisLog('已成功应用AI填充数据', 'success');
      
      return true;
    } catch (error) {
      console.error('❌ 应用JSON结构失败:', error);
      addAnalysisLog(`应用JSON结构失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error');
      return false;
    }
  }, [updateFormData, addAnalysisLog]);
  
  // 确保显示的评估部分和文本评估部分非空
  const displayEvaluationSections: any = 
    currentFormData?.evaluationSections && currentFormData.evaluationSections.length > 0 
      ? currentFormData.evaluationSections 
      : data.evaluationSections;
    
  const displayTextualEvaluations: any = 
    currentFormData?.textualEvaluations && currentFormData.textualEvaluations.length > 0
      ? currentFormData.textualEvaluations
      : data.textualEvaluations;
  
  return (
    <form className="w-full max-w-7xl mx-auto animate-fadeIn" style={{ animationDelay: '0.4s' }}>
      <Card className="mb-16 overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 shadow-lg border border-gray-100">
        {/* 装饰性边框 - 减弱效果 */}
        <div className="h-1 w-full bg-gradient-to-r from-primary-400 via-purple-500 to-primary-400 opacity-80"></div>
        
        <FormHeader 
          formTitle={currentFormData?.formTitle || "评审意见表"} 
          pdfFile={pdfFile}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          handleRemovePdf={handleRemovePdf}
          handleUploadPdf={handleUpload}
          uploadError={uploadError}
          uploadSuccess={uploadSuccess}
        />
        <CardContent className="p-8 lg:p-14">
          <ProjectInfoSection 
            projectInfo={projectInfo}
            aiRecommendationsAvailable={aiRecommendationsAvailable}
            editingField={editingField}
            startEditing={startEditing}
            stopEditing={stopEditing}
            handleProjectInfoChange={handleProjectInfoChange}
          />
          
          <EvaluationOptionsSection 
            evaluationSections={displayEvaluationSections}
            formState={formState}
            handleRadioChange={handleRadioChange}
            isAnalyzing={isAnalyzing}
            pdfFile={pdfFile}
            aiRecommendationsAvailable={aiRecommendationsAvailable}
            showEvaluationAI={showEvaluationAI}
            analysisLogs={analysisLogs}
            progress={progress}
            statusMessage={statusMessage}
            onApplyJsonStructure={handleApplyJsonStructure}
            jsonStructure={jsonStructure}
          />
          
          <TextualEvaluationSection 
            textualEvaluations={displayTextualEvaluations}
            formState={formState}
            handleTextChange={handleTextChange}
            isLoadingData={isLoadingData}
            aiRecommendationsAvailable={aiRecommendationsAvailable}
            handleAIRecommendationToggle={handleAIRecommendationToggle}
          />
        </CardContent>
      </Card>
      <FormStyles />
    </form>
  );
} 