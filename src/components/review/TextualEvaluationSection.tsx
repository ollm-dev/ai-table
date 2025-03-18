import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LightbulbIcon } from "@/components/ui/icons";

interface TextualEvaluation {
  id: string;
  title: string;
  placeholder: string;
  required: boolean;
  minLength: number;
  aiRecommendation?: string;
}

interface TextualEvaluationSectionProps {
  textualEvaluations: TextualEvaluation[];
  formState: {
    evaluations: Record<string, string>;
    textEvals: Record<string, string>;
  };
  handleTextChange: (id: string, value: string) => void;
  isLoadingData: boolean;
  aiRecommendationsAvailable: boolean;
  handleAIRecommendationToggle: (id: string, aiRecommendation: string, e?: React.MouseEvent) => void;
}

export function TextualEvaluationSection({
  textualEvaluations,
  formState,
  handleTextChange,
  isLoadingData,
  aiRecommendationsAvailable,
  handleAIRecommendationToggle
}: TextualEvaluationSectionProps) {
  return (
    <div className="space-y-12 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
      <div className="flex justify-between items-center pb-4 border-b-2 border-primary-100">
        <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
          <span className="inline-block w-1.5 h-8 bg-gradient-to-b from-primary-500 to-purple-600 rounded-full mr-5"></span>
          评价意见
        </h3>
        {isLoadingData && (
          <div className="flex items-center text-primary-600">
            <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
            <span className="text-sm">加载评审数据中...</span>
          </div>
        )}
      </div>
      
      {textualEvaluations.map((section, sectionIndex) => (
        <TextualEvaluationItem 
          key={section.id}
          section={section}
          sectionIndex={sectionIndex}
          value={formState.textEvals[section.id]}
          handleTextChange={handleTextChange}
          isLoadingData={isLoadingData}
          aiRecommendationsAvailable={aiRecommendationsAvailable}
          handleAIRecommendationToggle={handleAIRecommendationToggle}
        />
      ))}
    </div>
  );
}

interface TextualEvaluationItemProps {
  section: TextualEvaluation;
  sectionIndex: number;
  value: string;
  handleTextChange: (id: string, value: string) => void;
  isLoadingData: boolean;
  aiRecommendationsAvailable: boolean;
  handleAIRecommendationToggle: (id: string, aiRecommendation: string, e?: React.MouseEvent) => void;
}

function TextualEvaluationItem({
  section,
  sectionIndex,
  value,
  handleTextChange,
  isLoadingData,
  aiRecommendationsAvailable,
  handleAIRecommendationToggle
}: TextualEvaluationItemProps) {
  return (
    <div 
      key={section.id} 
      className="space-y-6 p-8 rounded-2xl hover:bg-gray-50/30 transition-all duration-500 border border-gray-200 shadow-md hover:shadow-lg animate-fadeIn backdrop-blur-sm relative overflow-hidden"
      style={{ animationDelay: `${0.5 + 0.1 * sectionIndex}s` }}
    >
      {/* 装饰性背景元素 - 减弱效果 */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary-100/10 rounded-full blur-3xl"></div>
      <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-100/10 rounded-full blur-3xl"></div>
      
      <div className="flex items-center mb-5 relative z-10">
        <h4 className="text-lg font-semibold text-gray-900">{sectionIndex + 1}、{section.title}</h4>
        {section.required && (
          <Badge variant="required" className="ml-3 bg-red-50 text-red-600 border border-red-100 px-3 py-0.5 text-xs font-medium">
            必填
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* 左侧：用户输入 */}
        <div className="relative order-1">
          <span className="text-sm font-semibold text-red-600 mb-2 absolute -top-3 left-4 bg-white px-3 py-0.5 shadow-sm border border-red-100 rounded-full z-10">专家输入</span>
          {isLoadingData ? (
            <div className="min-h-[240px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mb-2"></div>
                <span className="text-gray-500 font-medium">加载中...</span>
              </div>
            </div>
          ) : (
            <Textarea
              value={value}
              onChange={(e) => handleTextChange(section.id, e.target.value)}
              placeholder={section.placeholder}
              className="min-h-[240px] resize-y textarea-light focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all duration-200 rounded-xl shadow-inner pt-6 px-5"
              style={{
                color: '#000000',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                fontSize: '15px',
                lineHeight: '1.6',
                fontWeight: '500'
              }}
            />
          )}
          {!isLoadingData && (
            <div className="absolute bottom-4 right-4">
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                (value?.length || 0) < section.minLength 
                  ? 'bg-red-50 text-red-600 border border-red-100' 
                  : 'bg-green-50 text-green-600 border border-green-100'
              }`}>
                {value?.length || 0}/{section.minLength} 字符
              </span>
            </div>
          )}
        </div>

        {/* 右侧：AI建议 - 只有在AI建议可用时才显示按钮 */}
        <div className="relative order-2">
          <span className="text-sm font-semibold text-primary-600 mb-2 absolute -top-3 left-4 bg-white px-3 py-0.5 shadow-sm border border-primary-100 rounded-full flex items-center z-10">
            <LightbulbIcon className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
            AI建议
          </span>
          <div 
            className="min-h-[240px] p-6 bg-white rounded-xl border border-gray-200 overflow-y-auto shadow-inner relative"
            style={{ height: 'calc(100% - 8px)' }}
          >
            {/* 装饰性背景 - 减弱效果 */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary-50/20 rounded-full blur-xl"></div>
            
            {aiRecommendationsAvailable && section.aiRecommendation ? (
              <>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed relative z-10 font-medium">
                  {section.aiRecommendation}
                </p>
                <div className="flex justify-end mt-4 relative z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => section.aiRecommendation && handleAIRecommendationToggle(section.id, section.aiRecommendation, e)}
                    className="text-sm text-primary-600 border-primary-200 hover:bg-primary-50 rounded-full transition-all duration-300 px-5 py-2 font-medium"
                  >
                    {value === section.aiRecommendation ? '恢复我的文本' : '使用AI建议'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 p-4 rounded-full mb-4 shadow-inner">
                  <LightbulbIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium mb-2">AI建议尚未生成</p>
                <p className="text-gray-600 text-sm max-w-xs mx-auto">请在页面顶部上传PDF文件并等待分析完成</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 