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
    <div className="space-y-8 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
      <div className="flex justify-between items-center pb-3 border-b-2 border-primary-100">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="inline-block w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-4"></span>
          评价意见
        </h3>
        {isLoadingData && (
          <div className="flex items-center text-primary-600">
            <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
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
      className="space-y-4 p-6 rounded-2xl hover:bg-gray-50/50 transition-all duration-500 border border-gray-100 shadow-sm hover:shadow-lg animate-fadeIn backdrop-blur-sm"
      style={{ animationDelay: `${0.5 + 0.1 * sectionIndex}s` }}
    >
      <div className="flex items-center mb-3">
        <h4 className="font-medium text-gray-800">{section.title}</h4>
        {section.required && (
          <Badge variant="required" className="ml-2 bg-red-50 text-red-600 border border-red-100">
            必填
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧：用户输入 */}
        <div className="relative">
          <span className="text-sm font-medium text-red-500 mb-2 absolute -top-3 left-4 bg-white px-2 shadow-sm border border-red-100 rounded-full">专家输入</span>
          {isLoadingData ? (
            <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mb-2"></div>
                <span className="text-gray-500">加载中...</span>
              </div>
            </div>
          ) : (
            <Textarea
              value={value}
              onChange={(e) => handleTextChange(section.id, e.target.value)}
              placeholder={section.placeholder}
              className="min-h-[200px] resize-y textarea-light focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all duration-200 rounded-lg shadow-inner pt-4"
              style={{
                color: '#000000',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db'
              }}
            />
          )}
          {!isLoadingData && (
            <div className="absolute bottom-3 right-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                (value?.length || 0) < section.minLength 
                  ? 'bg-red-50 text-red-500 font-medium' 
                  : 'bg-green-50 text-green-600'
              }`}>
                {value?.length || 0}/{section.minLength} 字符
              </span>
            </div>
          )}
        </div>

        {/* 右侧：AI建议 - 只有在AI建议可用时才显示按钮 */}
        <div className="relative">
          <span className="text-sm font-medium text-primary-500 mb-2 absolute -top-3 left-4 bg-white px-2 shadow-sm border border-primary-100 rounded-full flex items-center">
            <LightbulbIcon className="h-3 w-3 mr-1 text-yellow-500" />
            AI建议
          </span>
          <div 
            className="min-h-[200px] p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 overflow-y-auto shadow-inner"
            style={{ height: 'calc(100% - 8px)' }}
          >
            {aiRecommendationsAvailable && section.aiRecommendation ? (
              <>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {section.aiRecommendation}
                </p>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => section.aiRecommendation && handleAIRecommendationToggle(section.id, section.aiRecommendation, e)}
                    className="text-xs text-primary-600 border-primary-200 hover:bg-primary-50 rounded-full transform hover:scale-105 transition-all duration-300"
                  >
                    {value === section.aiRecommendation ? '恢复我的文本' : '使用AI建议'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="bg-gray-100 p-3 rounded-full mb-3">
                  <LightbulbIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">AI建议尚未生成</p>
                <p className="text-gray-400 text-sm">请在页面顶部上传PDF文件并等待分析完成</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 