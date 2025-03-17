import React from 'react';
import { Badge } from "@/components/ui/badge";
import { UploadIcon } from "lucide-react";

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
}

export function EvaluationOptionsSection({
  evaluationSections,
  formState,
  handleRadioChange,
  isAnalyzing,
  pdfFile,
  aiRecommendationsAvailable,
  showEvaluationAI,
  analysisLogs
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
        <div className="flex-1 order-2 lg:order-1">
          <div className="space-y-6">
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
      className="space-y-4 p-6 rounded-2xl hover:bg-gray-50/50 transition-all duration-500 border border-gray-100 shadow-sm hover:shadow-lg animate-fadeIn backdrop-blur-sm"
      style={{ animationDelay: `${0.1 * sectionIndex}s` }}
    >
      <div className="flex flex-col">
        <div className="flex items-center mb-4">
          <h4 className="font-medium text-gray-800">{section.title}</h4>
          {section.required && (
            <Badge variant="required" className="ml-2 bg-red-50 text-red-600 border border-red-100">
              必填
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-4">
          {section.options.map((option, index) => (
            <div 
              key={index} 
              onClick={() => handleRadioChange(section.id, option)}
              className={`flex items-center justify-center px-8 py-2.5 rounded-xl transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                selectedValue === option 
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg" 
                  : "bg-white text-gray-700 border border-gray-200 hover:border-primary-200 hover:bg-primary-50/10"
              }`}
            >
              <span className="cursor-pointer font-medium">
                {option}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* AI建议部分 */}
      {aiRecommendationsAvailable && showEvaluationAI && section.aiRecommendation && (
        <div className="flex items-center mt-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100 animate-fadeIn backdrop-blur-sm">
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
      )}
    </div>
  );
}

interface AnalysisLogPanelProps {
  analysisLogs: Array<{time: string, content: string, type: string}>;
  isAnalyzing: boolean;
  pdfFile: File | null;
}

function AnalysisLogPanel({ analysisLogs, isAnalyzing, pdfFile }: AnalysisLogPanelProps) {
  return (
    <div className="w-full lg:w-2/5 order-1 lg:order-2 lg:border-l lg:pl-8 border-gray-100">
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-100 h-[400px] flex flex-col shadow-lg hover:shadow-xl transition-all duration-500 backdrop-blur-sm">
        <h4 className="text-primary-600 font-medium mb-5 text-center flex items-center justify-center">
          <span className="inline-block h-2 w-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
          <span className="gradient-text">AI分析引擎思考过程</span>
          {isAnalyzing && (
            <span className="ml-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full animate-pulse">
              实时分析中...
            </span>
          )}
        </h4>                 
        {/* 分析日志区域 */}
        <div 
          id="log-container"
          className="flex-1 bg-gray-50/50 p-5 rounded-xl text-sm shadow-inner backdrop-blur-sm terminal-bg" 
          style={{ 
            height: '320px',
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
                  <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="font-medium">准备开始分析...</p>
                </>
              ) : (
                <>
                  <div className="relative bg-gray-200 p-6 rounded-lg border border-dashed border-gray-300 w-36 h-36 flex items-center justify-center">
                    <UploadIcon className="h-12 w-12 text-primary-500 animate-bounce-subtle" />
                    <div className="absolute -top-2 -right-2">
                      <span className="inline-block h-6 w-6 rounded-full bg-primary-100  items-center justify-center border border-primary-200">
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
            <div className="space-y-2 terminal-text">
              {analysisLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`mb-2 ${['reasoning', 'content'].includes(log.type) ? 'whitespace-pre-wrap text-left' : ''}`}
                >
                  <span className={`${
                    log.type === 'init' ? 'text-primary-600' : 
                    log.type === 'loading' ? 'text-primary-700' : 
                    log.type === 'parsing' ? 'text-indigo-600' :
                    log.type === 'parsing-success' ? 'text-indigo-700 font-medium' :
                    log.type === 'analysis' ? 'text-violet-600' :
                    log.type === 'analysis-success' ? 'text-violet-700 font-medium' :
                    log.type === 'evaluation' ? 'text-amber-600' :
                    log.type === 'evaluation-success' ? 'text-amber-700 font-medium' :
                    log.type === 'reasoning' ? 'text-pink-700' : 
                    log.type === 'content' ? 'text-blue-700' :
                    log.type === 'complete' ? 'text-emerald-700 font-bold' : 
                    log.type === 'error' ? 'text-red-600 font-bold' : 
                    log.type === 'success' ? 'text-green-600 font-medium' :
                    'text-gray-700'
                  }`}>
                    {log.content}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 