import React from 'react';
import { Badge } from "@/components/ui/badge";
import { UploadIcon } from "lucide-react";
import Markdown from '../markdown';
interface EvaluationSection {
  id: string;
  title: string;
  required: boolean;
  options: string[];
  aiRecommendation?: string;
}

interface EvaluationOptionsSectionProps {
  evaluationSections: EvaluationSection[];
  formState: {
    evaluations: Record<string, string>;
    textEvals: Record<string, string>;
  };
  handleRadioChange: (sectionId: string, value: string) => void;
  isAnalyzing: boolean;
  pdfFile: File | null;
  aiRecommendationsAvailable: boolean;
  showEvaluationAI: boolean;
  analysisLogs: Array<{time: string, content: string, type: string}>;
  progress: number;
  statusMessage: string;
}

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
  statusMessage
}: EvaluationOptionsSectionProps) {
  return (
    <div className="space-y-8 mb-12 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
      <div className="flex justify-between items-center pb-3 border-b-2 border-primary-100">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="inline-block w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-4"></span>
          评估选项
        </h3>
        <div className="text-sm text-primary-600 font-medium">
          {isAnalyzing ? "实时分析进行中..." : pdfFile ? "准备开始分析..." : "上传文件后开始分析"}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 order-2 lg:order-1 lg:w-2/5 lg:max-w-[40%] flex flex-col">
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
        
        <AnalysisLogPanel 
          analysisLogs={analysisLogs}
          isAnalyzing={isAnalyzing}
          pdfFile={pdfFile}
          progress={progress}
          statusMessage={statusMessage}
        />
      </div>
    </div>
  );
}

interface EvaluationSectionItemProps {
  section: EvaluationSection;
  sectionIndex: number;
  selectedValue: string;
  handleRadioChange: (sectionId: string, value: string) => void;
  aiRecommendationsAvailable: boolean;
  showEvaluationAI: boolean;
}

function EvaluationSectionItem({
  section,
  sectionIndex,
  selectedValue,
  handleRadioChange,
  aiRecommendationsAvailable,
  showEvaluationAI
}: EvaluationSectionItemProps) {
  return (
    <div 
      className="space-y-4 p-5 rounded-2xl hover:bg-gray-50/50 transition-all duration-500 border border-gray-200 shadow-sm hover:shadow-lg animate-fadeIn backdrop-blur-sm"
      style={{ animationDelay: `${0.1 * sectionIndex}s` }}
    >
      <div className="flex flex-col">
        <div className="flex items-center mb-3">
          <h4 className="font-medium text-gray-800 text-sm">{section.title}</h4>
          {section.required && (
            <Badge variant="required" className="ml-2 bg-red-50 text-red-600 border border-red-100 text-xs">
              必填
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          {section.options.map((option, index) => (
            <div 
              key={index} 
              onClick={() => handleRadioChange(section.id, option)}
              className={`flex items-center justify-center px-6 py-2 rounded-xl transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                selectedValue === option 
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg" 
                  : "bg-white text-gray-700 border border-gray-200 hover:border-primary-200 hover:bg-primary-50/10"
              }`}
            >
              <span className="cursor-pointer font-medium text-sm">
                {option}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* AI建议部分 - 始终保持相同高度 */}
      <div className="h-[40px] flex items-center">
        {aiRecommendationsAvailable && showEvaluationAI && section.aiRecommendation ? (
          <div className="flex items-center p-3 bg-gray-50/50 rounded-xl border border-gray-100 animate-fadeIn backdrop-blur-sm w-full">
            <span className="text-gray-600 mr-3 font-medium">AI建议:</span>
            <Badge className={`${
              section.id === 'maturity' && section.aiRecommendation === '熟悉' ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200' :
              section.id === 'rating' && section.aiRecommendation === '优' ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-primary-200' :
              section.id === 'funding' && section.aiRecommendation === '优先资助' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200' :
              'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200'
            } hover:bg-opacity-80 border shadow-sm transform hover:scale-105 transition-all duration-300 px-4 py-1 rounded-full`}>
              {section.aiRecommendation}
            </Badge>
          </div>
        ) : (
          <div className="h-full w-full"></div>
        )}
      </div>
    </div>
  );
}

interface AnalysisLogPanelProps {
  analysisLogs: Array<{time: string, content: string, type: string}>;
  isAnalyzing: boolean;
  pdfFile: File | null;
  progress: number;
  statusMessage: string;
}

function AnalysisLogPanel({ 
  analysisLogs, 
  isAnalyzing, 
  pdfFile,
  progress,
  statusMessage
}: AnalysisLogPanelProps) {
  // 添加 useRef 用于保存日志容器的引用
  const logContainerRef = React.useRef<HTMLDivElement>(null);
  
  // 使用 useEffect 在日志更新时自动滚动到底部
  React.useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [analysisLogs]);

  return (
    <div className="w-full lg:w-3/5 order-1 lg:order-2 lg:border-l lg:pl-8 border-gray-100">
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-500 backdrop-blur-sm relative overflow-hidden h-full min-h-[450px]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-purple-500 to-primary-600 opacity-80"></div>
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary-100/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-100/10 rounded-full blur-3xl"></div>
        
        <h4 className="text-primary-600 font-medium mb-3 text-center flex items-center justify-center">
          <span className="inline-block h-2 w-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
          <span className="gradient-text text-lg font-semibold">AI分析引擎思考过程</span>
          {isAnalyzing && (
            <span className="ml-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full animate-pulse">
              实时分析中...
            </span>
          )}
        </h4>
        
        {/* 添加进度条 */}
        {isAnalyzing && progress > 0 && (
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary-500 to-purple-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">{statusMessage}</p>
          </div>
        )}
        
        {/* 分析日志区域 */}
        <div 
          id="log-container"
          ref={logContainerRef}
          className="flex-1 bg-white p-5 rounded-xl text-sm shadow-inner border border-gray-200" 
          style={{ 
            height: '480px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e0 #f7fafc',
            position: 'relative',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
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
            <div className="space-y-3 terminal-text text-sm">
              {analysisLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`stream-log ${log.type} animate-fadeIn p-2 rounded-lg ${
                    log.type === 'reasoning' ? 'bg-gray-100 text-gray-800 border-l-2 border-primary-400' : 
                    log.type === 'content' ? 'bg-purple-50/50 border-l-2 border-purple-400' :
                    log.type === 'complete' ? 'bg-green-50/50 border-l-2 border-green-400' :
                    log.type === 'error' ? 'bg-red-50/50 border-l-2 border-red-400' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start">
                    <div className="mr-2 flex-shrink-0">
                      {log.type === 'progress' && <span>📄</span>}
                      {log.type === 'reasoning' && <span>🤔</span>}
                      {log.type === 'content' && <span>📝</span>}
                      {log.type === 'complete' && <span>✨</span>}
                      {log.type === 'error' && <span>❌</span>}
                      {log.type === 'init' && <span>🚀</span>}
                      {!['progress', 'reasoning', 'content', 'complete', 'error', 'init'].includes(log.type) && <span>📌</span>}
                    </div>
                    <div className={`stream-content ${index === analysisLogs.length - 1 ? 'typing-effect' : ''}`}>
                      {log.content && <Markdown content={log.content} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 