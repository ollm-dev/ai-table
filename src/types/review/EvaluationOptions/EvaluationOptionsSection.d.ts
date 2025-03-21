import React from 'react';


export interface EvaluationSection {
  id: string;
  title: string;
  required: boolean;
  options: string[];
  aiRecommendation?: string;
}
export interface EvaluationOptionsSectionProps {
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
  onApplyJsonStructure?: (jsonStructure: string) => void;
}
export interface EvaluationSectionItemProps {
  section: EvaluationSection;
  sectionIndex: number;
  selectedValue: string;
  handleRadioChange: (sectionId: string, value: string) => void;
  aiRecommendationsAvailable: boolean;
  showEvaluationAI: boolean;
}
export interface AnalysisLogPanelProps {
  analysisLogs: Array<{time: string, content: string, type: string}>;
  isAnalyzing: boolean;
  pdfFile: File | null;
  progress: number;
  statusMessage: string;
  onApplyJsonStructure?: (jsonStructure: string) => void;
}

