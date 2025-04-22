/**
 * 分析日志相关的类型定义
 */

import { reviewFormData } from '../../data/reviewFormData';

/**
 * 分析日志条目类型
 */
export interface AnalysisLogEntry {
  /** 日志时间戳 */
  time: string;
  /** 日志内容 */
  content: string;
  /** 日志类型 */
  type: string;
}

/**
 * 空的表单数据结构
 */
export const emptyFormData = {
  formTitle: "Review Opinion Form",
  projectInfo: {
    projectTitle: "",
    projectType: "",
    researchField: "",
    applicantName: "",
    applicationId: ""
  },
  evaluationSections: [],
  textualEvaluations: []
};

/**
 * 表单数据类型
 */
export interface FormData {
  formTitle: string;
  projectInfo: {
    projectTitle: string;
    projectType: string;
    researchField: string;
    applicantName: string;
    applicationId: string;
  };
  evaluationSections: any[];
  textualEvaluations: any[];
}

/**
 * 评审请求参数
 */
export interface ReviewRequestParams {
  file_path: string;
  num_reviewers: number;
  page_limit: number;
  use_claude: boolean;
}

/**
 * useAnalysisLogs 钩子返回的状态和方法
 */
export interface AnalysisLogsState {
  analysisLogs: AnalysisLogEntry[];
  isAnalyzing: boolean;
  addAnalysisLog: (content: string, type?: string) => void;
  startAnalysisWithBackend: (filePath: string) => Promise<boolean>;
  setAnalysisLogs: React.Dispatch<React.SetStateAction<AnalysisLogEntry[]>>;
  progress: number;
  statusMessage: string;
  error: string | null;
  formData: FormData;
  registerUpdateCallback: (callback: (data: any) => void) => void;
  updateFormData: (jsonStructure: any, isPartial?: boolean, isComplete?: boolean) => void;
  resetFormData: () => void;
  /** JSON完成状态，表示是否已收到完整的JSON结构 */
  jsonCompleteStatus: boolean;
  /** 设置JSON完成状态的函数 */
  setJsonCompleteStatus: React.Dispatch<React.SetStateAction<boolean>>;
} 