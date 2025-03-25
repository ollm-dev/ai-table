import React from 'react';
import { EvaluationOptionsSectionProps} from "@/types/review/EvaluationOptions/EvaluationOptionsSection";
import AnalysisLogPanel from "./AnalysisLogPanel/AnalysisLogPanel";
import EvaluationSectionItem from "./EvaluationSectionItem/EvaluationSectionItem";

/**
 * 评估选项部分组件
 * 
 * 该组件负责渲染评估选项界面，包括评估部分的列表和分析日志面板用户在此界面可以配置评估选项，
 * 查看分析日志和进度，以及应用AI推荐的评估设置
 * 
 * @param {Object} props - 组件属性对象
 * @param {Array} props.evaluationSections - 评估部分列表
 * @param {Object} props.formState - 表单状态对象，包含评估选项的状态
 * @param {Function} props.handleRadioChange - 处理单选按钮变化的回调函数
 * @param {boolean} props.isAnalyzing - 是否正在执行实时分析
 * @param {File|null} props.pdfFile - 上传的PDF文件对象
 * @param {boolean} props.aiRecommendationsAvailable - AI推荐是否可用
 * @param {boolean} props.showEvaluationAI - 是否显示AI评估选项
 * @param {Array} props.analysisLogs - 分析日志列表
 * @param {number} props.progress - 分析进度百分比
 * @param {string} props.statusMessage - 状态消息
 * @param {Function} props.onApplyJsonStructure - 应用JSON结构的回调函数
 * @param {string} props.jsonStructure - JSON结构数据 
 * @param {boolean} props.jsonCompleteStatus - JSON结构是否完成
 * @param {Function} props.setJsonCompleteStatus - 设置JSON结构完成状态的回调函数
 */
export function EvaluationOptionsSection({
  evaluationSections,
  formState,
  handleRadioChange,
  isAnalyzing,
  pdfFile,
  aiRecommendationsAvailable,
  showEvaluationAI,
  analysisLogs,
  progress,
  statusMessage,
  onApplyJsonStructure,
  jsonStructure,
  jsonCompleteStatus,
  setJsonCompleteStatus
}: EvaluationOptionsSectionProps) {
  
  return (
    <div className="space-y-8 mb-12 animate-gentle-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 order-2 lg:order-1 lg:w-2/5 lg:max-w-[40%]">
          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-500 backdrop-blur-sm relative overflow-hidden h-full">
            {/* 顶部渐变条 */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-purple-500 to-primary-600 opacity-80"></div>
            
            {/* 背景装饰 */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary-100/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-100/10 rounded-full blur-3xl"></div>
            
            <div className="flex flex-col">
              <h4 className="text-primary-600 font-medium mb-3 text-center flex items-center justify-center">
                <span className="inline-block h-2 w-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
                <span className="gradient-text text-lg font-semibold">评估选项</span>
                {isAnalyzing && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full animate-pulse">
                    实时分析中...
                  </span>
                )}
              </h4>
              
              <div className="space-y-6 flex-1">
                {evaluationSections.map((section, sectionIndex) => (
                  <EvaluationSectionItem 
                    key={section.id}
                    section={section}
                    sectionIndex={sectionIndex}
                    selectedValue={formState.evaluations[section.id]}
                    handleRadioChange={handleRadioChange}
                    aiRecommendationsAvailable={aiRecommendationsAvailable}
                    showEvaluationAI={showEvaluationAI}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <AnalysisLogPanel
          analysisLogs={analysisLogs}
          isAnalyzing={isAnalyzing}
          pdfFile={pdfFile}
          progress={progress}
          statusMessage={statusMessage}
          onApplyJsonStructure={onApplyJsonStructure}
          jsonStructure={jsonStructure}
          jsonCompleteStatus={jsonCompleteStatus}
          setJsonCompleteStatus={setJsonCompleteStatus}
        />
      </div>
    </div>
  );
}

