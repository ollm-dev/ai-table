'use client'

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FormHeader } from '../../components/review/FormHeader';
import { ProjectInfoSection } from '../../components/review/ProjectInfoSection';
import { EvaluationOptionsSection } from '../../components/review/EvaluationOptionsSection';
import { TextualEvaluationSection } from '../../components/review/TextualEvaluationSection';
import { FormStyles } from '../../components/review/FormStyles';
import { useReviewForm } from '@/hooks/useReviewForm';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAnalysisLogs } from '@/hooks/useAnalysisLogs';

interface ReviewFormProps {
  data: typeof import('@/data/reviewFormData').reviewFormData;
}

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
    showEvaluationAI,
    setShowEvaluationAI,
    isLoadingData,
    aiRecommendationsAvailable,
    setAiRecommendationsAvailable,
    projectInfo,
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
    statusMessage
  } = useAnalysisLogs();
  
  const {
    pdfFile,
    uploading,
    uploadError,
    fileInputRef,
    handleFileChange,
    handleUploadPdf,
    handleRemovePdf
  } = useFileUpload(
    // 分析开始回调
    async (projectId, filePath) => {
      const success = await startAnalysisWithBackend(projectId, filePath);
      if (success) {
        setAiRecommendationsAvailable(true);
        setShowEvaluationAI(true);
      }
    },
    // 添加日志回调
    addAnalysisLog
  );
  
  // 处理上传按钮点击
  const handleUpload = async () => {
    await handleUploadPdf(data.projectInfo.applicationId || "unknown", () => {
      setAiRecommendationsAvailable(false);
      setShowEvaluationAI(false);
      setAnalysisLogs([]);
    });
  };
  
  return (
    <form className="w-full max-w-7xl mx-auto animate-fadeIn" style={{ animationDelay: '0.4s' }}>
      <Card className="mb-16 overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 shadow-lg border border-gray-100">
        {/* 装饰性边框 - 减弱效果 */}
        <div className="h-1 w-full bg-gradient-to-r from-primary-400 via-purple-500 to-primary-400 opacity-80"></div>
        
        <FormHeader 
          formTitle={data.formTitle} 
          pdfFile={pdfFile}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          handleRemovePdf={handleRemovePdf}
          handleUploadPdf={handleUpload}
          uploading={uploading}
          uploadError={uploadError}
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
            evaluationSections={data.evaluationSections}
            formState={formState}
            handleRadioChange={handleRadioChange}
            isAnalyzing={isAnalyzing}
            pdfFile={pdfFile}
            aiRecommendationsAvailable={aiRecommendationsAvailable}
            showEvaluationAI={showEvaluationAI}
            analysisLogs={analysisLogs}
            progress={progress}
            statusMessage={statusMessage}
          />
          
          <TextualEvaluationSection 
            textualEvaluations={data.textualEvaluations}
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