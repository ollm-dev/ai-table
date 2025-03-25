import React from 'react';
import { StaticImageData } from 'next/image';
import { ProjectInfoSectionProps } from '../ProjectInfoSection';
import { EvaluationSection } from './EvaluationSectionItem/EvaluationSectionItem';


export interface EvaluationSection {
  id: string;
  title: string;
  required: boolean;
  options: string[];
  aiRecommendation?: string;
  aiReason?: string;
}
export interface EvaluationOptionsSectionProps {
  /** 评估部分列表 */
  evaluationSections: EvaluationSection[];
  /** 表单状态 */
  formState: any;
  /** 处理单选按钮变化的回调函数 */
  handleRadioChange: (sectionId: string, optionId: string) => void;
  /** 是否正在执行分析 */
  isAnalyzing: boolean;
  /** 上传的PDF文件 */
  pdfFile: File | null;
  /** AI推荐是否可用 */
  aiRecommendationsAvailable: boolean;
  /** 是否显示AI评估选项 */
  showEvaluationAI: boolean;
  /** 分析日志列表 */
  analysisLogs: Array<{time: string, content: string, type: string}>;
  /** 分析进度百分比 */
  progress: number;
  /** 状态消息 */
  statusMessage: string;
  /** 应用JSON结构的回调函数 */
  onApplyJsonStructure: (jsonStructure: string) => void;
  /** JSON结构数据 */
  jsonStructure?: string;
  /** JSON结构完成状态 */
  jsonCompleteStatus: boolean;
  /** 设置JSON结构完成状态的函数 */
  setJsonCompleteStatus: React.Dispatch<React.SetStateAction<boolean>>;
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
  /** 分析日志列表 */
  analysisLogs: Array<{time: string, content: string, type: string}>;
  /** 是否正在分析中 */
  isAnalyzing: boolean;
  /** 上传的PDF文件 */
  pdfFile: File | null;
  /** 分析进度百分比 */
  progress: number;
  /** 状态消息 */
  statusMessage: string;
  /** 应用JSON结构的回调函数 */
  onApplyJsonStructure: (jsonStructure: string) => void;
  /** JSON结构数据 */
  jsonStructure?: string;
  /** JSON结构完成状态 */
  jsonCompleteStatus: boolean;
  /** 设置JSON结构完成状态的函数 */
  setJsonCompleteStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

