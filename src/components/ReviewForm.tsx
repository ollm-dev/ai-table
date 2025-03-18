'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LightbulbIcon } from "@/components/ui/icons";

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
  const [formState, setFormState] = useState(() => {
    // 初始化表单状态
    const evaluations = data.evaluationSections.reduce((acc, section) => {
      acc[section.id] = "";
      return acc;
    }, {} as Record<string, string>);
    
    const textEvals = data.textualEvaluations.reduce((acc, section) => {
      acc[section.id] = "";
      return acc;
    }, {} as Record<string, string>);
    
    return { evaluations, textEvals };
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // 修改默认值为 false，默认不显示 AI 建议
  const [showEvaluationAI, setShowEvaluationAI] = useState(false);
  
  // 添加一个状态来保存原始文本
  const [originalText, setOriginalText] = useState<Record<string, string>>({});
  
  /**
   * 处理单选按钮值变更
   * @param {string} sectionId - 评估部分ID
   * @param {string} value - 选中的值
   */
  const handleRadioChange = (sectionId: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      evaluations: {
        ...prev.evaluations,
        [sectionId]: prev.evaluations[sectionId] === value ? "" : value
      }
    }));
  };
  
  const handleTextChange = (id: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      textEvals: {
        ...prev.textEvals,
        [id]: value
      }
    }));
  };
  
  /**
   * 处理"使用AI建议"按钮点击
   * @param {string} id - 文本区域ID
   * @param {string} aiRecommendation - AI建议内容
   */
  const handleAIRecommendationToggle = (id: string, aiRecommendation: string) => {
    // 检查当前文本是否已经是AI建议
    const isCurrentlyAI = formState.textEvals[id] === aiRecommendation;
    
    if (isCurrentlyAI) {
      // 如果当前已经是AI建议，恢复到原始文本
      handleTextChange(id, originalText[id] || "");
    } else {
      // 保存当前文本作为原始文本
      setOriginalText(prev => ({
        ...prev,
        [id]: formState.textEvals[id]
      }));
      
      // 设置为AI建议
      handleTextChange(id, aiRecommendation);
    }
  };
  
  
  return (
    <form className="w-full max-w-5xl mx-auto"> 
      <Card className="mb-8 shadow-card overflow-hidden card-light hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">{data.formTitle}</CardTitle>
              <CardDescription className="text-gray-600 mt-1">{data.formSubtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* 项目信息部分 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1 font-bold">项目名称</span>
                <span className="font-medium text-gray-900">{data.projectInfo.projectTitle}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1 font-bold">项目类别</span>
                <span className="font-medium text-gray-900">{data.projectInfo.projectType}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1 font-bold">研究领域</span>
                <span className="font-medium text-gray-900">{data.projectInfo.researchField}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1 font-bold">申请人姓名</span>
                <span className="font-medium text-gray-900">{data.projectInfo.applicantName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1 font-bold">申请代码</span>
                <span className="font-medium text-gray-900">{data.projectInfo.applicationId}</span>
              </div>
            </div>
          </div>
          
          {/* 评估选项部分 */}
          <div className="space-y-6 mb-8">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="inline-block w-2 h-6 bg-primary-500 rounded mr-2"></span>
                评估选项
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowEvaluationAI(!showEvaluationAI);
                }}
                className={`btn-outline transition-all duration-200 ${showEvaluationAI ? "bg-secondary-100 text-secondary-700 border-secondary-300" : ""}`}
              >
                <LightbulbIcon className="h-4 w-4 mr-1" />
                {showEvaluationAI ? "隐藏AI建议" : "显示AI建议"}
              </Button>
            </div>
            
            {data.evaluationSections.map((section) => (
              <div key={section.id} className="space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center mb-2 md:mb-0">
                    <h4 className="font-medium text-gray-900">{section.title}</h4>
                    {section.required && (
                      <Badge variant="required" className="ml-2">
                        必填
                      </Badge>
                    )}
                  </div>
                  
                  {showEvaluationAI && (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">AI建议:</span>
                      <Badge className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200 border border-secondary-200">
                        {section.aiRecommendation}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {section.options.map((option, index) => (
                    <div 
                      key={index} 
                      onClick={() => handleRadioChange(section.id, option)}
                      className={`flex items-center justify-center px-6 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                        formState.evaluations[section.id] === option 
                          ? "bg-primary-500 text-white shadow-md" 
                          : "bg-white text-gray-700 border border-gray-200 hover:border-primary-300"
                      }`}
                    >
                      <span className="cursor-pointer">
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* 文本评价部分 */}
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="inline-block w-2 h-6 bg-primary-500 rounded mr-2"></span>
                评价意见
              </h3>
            </div>
            
            {data.textualEvaluations.map((section) => (
              <div key={section.id} className="space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center mb-2">
                  <h4 className="font-medium text-gray-900">{section.title}</h4>
                  {section.required && (
                    <Badge variant="required" className="ml-2">
                      必填
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* 左侧：用户输入 */}
                  <div className="relative">
                    <span className="text-sm font-medium text-red-500 mb-2">专家输入</span>
                    <Textarea
                      value={formState.textEvals[section.id]}
                      onChange={(e) => handleTextChange(section.id, e.target.value)}
                      placeholder={section.placeholder}
                      className="min-h-[200px] resize-y textarea-light focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all duration-200"
                      style={{
                        color: '#000000',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db'
                      }}
                    />
                    <div className="absolute bottom-2 right-2">
                      <span className={`text-xs ${
                        (formState.textEvals[section.id]?.length || 0) < section.minLength 
                          ? 'text-counter-error font-medium' 
                          : 'text-counter'
                      }`}>
                        {formState.textEvals[section.id]?.length || 0}/{section.minLength} 字符
                      </span>
                    </div>
                  </div>

                  {/* 右侧：AI建议 */}
                  <div className="relative">
                    <span className="text-sm font-medium text-primary-500 mb-2">AI建议</span>
                    <div className="min-h-[200px] p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {section.aiRecommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>     
    </form>
  );
} 