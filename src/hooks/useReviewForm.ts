import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';

export interface FormState {
  evaluations: Record<string, string>;
  textEvals: Record<string, string>;
}

export interface ProjectInfo {
  projectTitle: string;
  projectType: string;
  researchField: string;
  applicantName: string;
  applicationId: string;
}

export function useReviewForm(data: any) {
  const [formState, setFormState] = useState<FormState>(() => {
    // 初始化表单状态
    const evaluations = data.evaluationSections.reduce((acc, section) => {
      acc[section.id] = "";
      return acc;
    }, {} as Record<string, string>);
    
    const textEvals = data.textualEvaluations.reduce((acc, section) => {
      acc[section.id] = "";
      return acc;
    }, {} as Record<string, string>);
    
    return { evaluations, textEvals };
  });
  
  // 修改默认值为 false，默认不显示 AI 建议
  const [showEvaluationAI, setShowEvaluationAI] = useState(false);
  
  // 添加一个状态来保存原始文本
  const [originalText, setOriginalText] = useState<Record<string, string>>({});
  
  // 添加后端数据加载状态
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // 添加AI建议数据状态
  const [aiRecommendationsAvailable, setAiRecommendationsAvailable] = useState(false);
  
  // 添加项目信息编辑状态
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    projectTitle: "",
    projectType: "",
    researchField: "",
    applicantName: "",
    applicationId: ""
  });
  
  // 添加编辑状态跟踪
  const [editingField, setEditingField] = useState<string | null>(null);
  
  // 在组件加载时调用fetchReviewData
  useEffect(() => {
    // 如果有项目ID，则获取评审数据
    if (data.projectInfo.applicationId) {
      fetchReviewData(data.projectInfo.applicationId);
    }
  }, [data.projectInfo.applicationId]); // 依赖项为项目ID，当ID变化时重新获取数据
  
  // 从后端获取评审数据 - 这个只获取基础表单数据，不包含AI建议
  const fetchReviewData = async (projectId: string) => {
    try {
      setIsLoadingData(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟从后端获取的数据
      const reviewData = {
        textEvaluations: data.textualEvaluations.reduce((acc, section) => {
          acc[section.id] = "";
          return acc;
        }, {} as Record<string, string>)
      };
      
      // 更新表单状态
      setFormState(prev => ({
        ...prev,
        textEvals: reviewData.textEvaluations
      }));
      
      setDataLoaded(true);
      console.log('评审数据加载成功');
    } catch (error) {
      console.error('获取评审数据失败:', error);
    } finally {
      setIsLoadingData(false);
    }
  };
  
  /**
   * 处理单选按钮值变更
   */
  const handleRadioChange = (sectionId: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      evaluations: {
        ...prev.evaluations,
        [sectionId]: prev.evaluations[sectionId] === value ? "" : value
      }
    }));
  };
  
  /**
   * 处理文本评价
   */
  const handleTextChange = (id: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      textEvals: {
        ...prev.textEvals,
        [id]: value
      }
    }));
  };
  
  /**
   * 处理"使用AI建议"按钮点击
   */
  const handleAIRecommendationToggle = (id: string, aiRecommendation: string, e?: React.MouseEvent) => {
    // 阻止默认行为，防止页面跳转
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 检查当前文本是否已经是AI建议
    const isCurrentlyAI = formState.textEvals[id] === aiRecommendation;
    
    if (isCurrentlyAI) {
      // 如果当前已经是AI建议，恢复到原始文本
      handleTextChange(id, originalText[id] || "");
    } else {
      // 保存当前文本作为原始文本
      setOriginalText(prev => ({
        ...prev,
        [id]: formState.textEvals[id]
      }));
      
      // 设置为AI建议
      handleTextChange(id, aiRecommendation);
    }
  };
  
  /**
   * 处理项目信息字段编辑
   */
  const handleProjectInfoChange = (field: string, value: string) => {
    setProjectInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  /**
   * 开始编辑字段
   */
  const startEditing = (field: string) => {
    setEditingField(field);
  };
  
  /**
   * 结束编辑字段
   */
  const stopEditing = () => {
    setEditingField(null);
  };
  
  return {
    formState,
    setFormState,
    showEvaluationAI,
    setShowEvaluationAI,
    isLoadingData,
    aiRecommendationsAvailable,
    setAiRecommendationsAvailable,
    projectInfo,
    setProjectInfo,
    editingField,
    handleRadioChange,
    handleTextChange,
    handleAIRecommendationToggle,
    handleProjectInfoChange,
    startEditing,
    stopEditing
  };
} 