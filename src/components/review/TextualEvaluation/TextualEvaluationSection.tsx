import React, { useRef, useEffect, useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LightbulbIcon } from "@/components/ui/icons";
import { TextualEvaluation, TextualEvaluationSectionProps, TextualEvaluationItemProps } from '@/types/review/TextualEvalution/TextualEvaluationSection';



export function TextualEvaluationSection({
  textualEvaluations,
  formState,
  handleTextChange,
  isLoadingData,
  aiRecommendationsAvailable,
  handleAIRecommendationToggle
}: TextualEvaluationSectionProps) {
  return (
    <div className="space-y-14 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
      <div className="flex justify-between items-center pb-5 border-b-2 border-primary-100">
        <h3 className="text-3xl font-bold text-gray-900 flex items-center">
          <span className="inline-block w-2 h-10 bg-gradient-to-b from-primary-500 to-purple-600 rounded-full mr-6"></span>
          评价意见
        </h3>
        {isLoadingData && (
          <div className="flex items-center text-primary-600">
            <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
            <span className="text-sm font-medium">加载评审数据中...</span>
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



function TextualEvaluationItem({
  section,
  sectionIndex,
  value,
  handleTextChange,
  isLoadingData,
  aiRecommendationsAvailable,
  handleAIRecommendationToggle
}: TextualEvaluationItemProps) {
  // 添加状态来跟踪高度
  const [contentHeight, setContentHeight] = useState(320); // 增加默认高度
  const leftBoxRef = useRef<HTMLDivElement>(null);
  const rightBoxRef = useRef<HTMLDivElement>(null);

  // 在组件挂载和内容变化时同步高度
  useEffect(() => {
    const syncHeight = () => {
      if (!leftBoxRef.current || !rightBoxRef.current) return;
      
      // 重置高度以获取真实内容高度
      leftBoxRef.current.style.height = 'auto';
      rightBoxRef.current.style.height = 'auto';
      
      // 获取两个框的内容高度
      const leftHeight = leftBoxRef.current.scrollHeight;
      const rightHeight = rightBoxRef.current.scrollHeight;
      
      // 取最大值确保两边高度一致，设置最小高度为320px
      const maxHeight = Math.max(leftHeight, rightHeight, 320);
      setContentHeight(maxHeight);
    };

    // 初始同步和内容变化时同步
    syncHeight();
    
    // 添加窗口大小变化监听器
    window.addEventListener('resize', syncHeight);
    return () => window.removeEventListener('resize', syncHeight);
  }, [value, section.aiRecommendation, aiRecommendationsAvailable]);

  return (
    <div 
      key={section.id} 
      className="space-y-8 p-10 rounded-3xl hover:bg-gray-50/40 transition-all duration-500 border border-gray-200 shadow-lg hover:shadow-xl animate-fadeIn backdrop-blur-sm relative overflow-hidden"
      style={{ 
        animationDelay: `${0.5 + 0.1 * sectionIndex}s`,
        background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.9))'
      }}
    >
      {/* 装饰性背景元素 - 增强效果 */}
      <div className="absolute -right-20 -top-20 w-60 h-60 bg-primary-100/20 rounded-full blur-3xl"></div>
      <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-purple-100/20 rounded-full blur-3xl"></div>
      <div className="absolute right-1/4 bottom-0 w-40 h-40 bg-blue-50/10 rounded-full blur-2xl"></div>
      
      <div className="flex items-center mb-6 relative z-10">
        <h4 className="text-xl font-bold text-gray-900">{sectionIndex + 1}、{section.title}</h4>
        {section.required && (
          <Badge variant="required" className="ml-4 bg-red-50 text-red-600 border border-red-100 px-4 py-0.5 text-xs font-medium shadow-sm">
            必填
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
        {/* 左侧：用户输入 */}
        <div className="relative order-1" ref={leftBoxRef}>
          <span className="text-sm font-semibold text-red-600 mb-2 absolute -top-4 left-6 bg-white px-4 py-1 shadow-sm border border-red-100 rounded-full z-10">专家输入</span>
          {isLoadingData ? (
            <div className="min-h-[320px] flex items-center justify-center bg-gray-50/70 rounded-2xl border border-gray-200 shadow-md">
              <div className="flex flex-col items-center">
                <div className="animate-spin h-10 w-10 border-3 border-primary-500 border-t-transparent rounded-full mb-3"></div>
                <span className="text-gray-500 font-medium">加载中...</span>
              </div>
            </div>
          ) : (
            <Textarea
              value={value}
              onChange={(e) => handleTextChange(section.id, e.target.value)}
              placeholder={section.placeholder}
              className="resize-y textarea-light focus:border-primary-400 focus:ring-2 focus:ring-primary-300 transition-all duration-300 rounded-2xl shadow-md hover:shadow-lg pt-8 px-6"
              style={{
                color: '#000000',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                lineHeight: '1.8',
                fontWeight: '500',
                minHeight: `${contentHeight}px`,
                height: `${contentHeight}px`
              }}
            />
          )}
          {!isLoadingData && (
            <div className="absolute bottom-5 right-6">
              <span className={`text-sm px-4 py-2 rounded-full font-medium shadow-sm ${
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
        <div className="relative order-2" ref={rightBoxRef}>
          <span className="text-sm font-semibold text-primary-600 mb-2 absolute -top-4 left-6 bg-white px-4 py-1 shadow-sm border border-primary-100 rounded-full flex items-center z-10">
            <LightbulbIcon className="h-4 w-4 mr-2 text-yellow-500" />
            AI建议
          </span>
          <div 
            className="p-8 bg-white rounded-2xl border border-gray-200 overflow-y-auto shadow-md hover:shadow-lg transition-all duration-300 relative"
            style={{ 
              minHeight: `${contentHeight}px`,
              height: `${contentHeight}px`,
              background: 'linear-gradient(to bottom right, #ffffff, #fafbff)'
            }}
          >
            {/* 装饰性背景 - 增强效果 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/30 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-20 w-24 h-24 bg-purple-50/20 rounded-full blur-lg"></div>
            
            {aiRecommendationsAvailable && section.aiRecommendation ? (
              <>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed relative z-10 font-medium text-base">
                  {section.aiRecommendation}
                </p>
                <div className="flex justify-end mt-6 relative z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => section.aiRecommendation && handleAIRecommendationToggle(section.id, section.aiRecommendation, e)}
                    className="text-sm text-primary-600 border-primary-200 hover:bg-primary-50 rounded-full transition-all duration-300 px-6 py-2.5 font-medium shadow-sm hover:shadow"
                  >
                    {value === section.aiRecommendation ? '恢复我的文本' : '使用AI建议'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 p-5 rounded-full mb-5 shadow-inner">
                  <LightbulbIcon className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium mb-3 text-lg">AI建议尚未生成</p>
                <p className="text-gray-600 text-sm max-w-xs mx-auto">请在页面顶部上传PDF文件并等待分析完成</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 