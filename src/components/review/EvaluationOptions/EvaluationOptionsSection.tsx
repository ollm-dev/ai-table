import React from 'react';
import { EvaluationOptionsSectionProps} from "@/types/review/EvaluationOptions/EvaluationOptionsSection";
import AnalysisLogPanel from "./AnalysisLogPanel/AnalysisLogPanel";
import EvaluationSectionItem from "./EvaluationSectionItem/EvaluationSectionItem";

/**
 * Evaluation Options Section Component
 * 
 * This component is responsible for rendering the evaluation options interface, including 
 * the list of evaluation sections and the analysis log panel. Users can configure evaluation options,
 * view analysis logs and progress, and apply AI-recommended evaluation settings.
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.evaluationSections - List of evaluation sections
 * @param {Object} props.formState - Form state object containing evaluation options state
 * @param {Function} props.handleRadioChange - Callback function for handling radio button changes
 * @param {boolean} props.isAnalyzing - Whether real-time analysis is being performed
 * @param {File|null} props.pdfFile - Uploaded PDF file object
 * @param {boolean} props.aiRecommendationsAvailable - Whether AI recommendations are available
 * @param {boolean} props.showEvaluationAI - Whether to show AI evaluation options
 * @param {Array} props.analysisLogs - List of analysis logs
 * @param {number} props.progress - Analysis progress percentage
 * @param {string} props.statusMessage - Status message
 * @param {Function} props.onApplyJsonStructure - Callback function for applying JSON structure
 * @param {string} props.jsonStructure - JSON structure data
 * @param {boolean} props.jsonCompleteStatus - Whether JSON structure is complete
 * @param {Function} props.setJsonCompleteStatus - Callback function for setting JSON structure completion status
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
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-purple-500 to-primary-600 opacity-80"></div>
            
            {/* Background decoration */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary-100/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-100/10 rounded-full blur-3xl"></div>
            
            <div className="flex flex-col">
              <h4 className="text-primary-600 font-medium mb-3 text-center flex items-center justify-center">
                <span className="inline-block h-2 w-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
                <span className="gradient-text text-lg font-semibold">Evaluation Options</span>
                {isAnalyzing && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full animate-pulse">
                    Analyzing...
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

