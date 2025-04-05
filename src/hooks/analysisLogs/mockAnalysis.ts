/**
 * 模拟分析过程数据和函数
 */

// 定义分析流程步骤，与图片中的进度条对应
export interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  progress: number;
}

// 模拟分析步骤数据
export const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: 'nlp',
    name: '自然语言处理',
    description: '分析文档结构和内容',
    progress: 100
  },
  {
    id: 'context',
    name: '上下文分析',
    description: '提取关键主张和假设',
    progress: 100
  },
  {
    id: 'data',
    name: '元数据提取',
    description: '识别研究方法与途径',
    progress: 100
  },
  {
    id: 'evaluation',
    name: '量化评估',
    description: '根据标准学术标准评估',
    progress: 100
  },
  {
    id: 'visualization',
    name: '可视化',
    description: '生成洞见的视觉呈现',
    progress: 100
  },
  {
    id: 'summary',
    name: '反馈综合',
    description: '编译全面的评审反馈',
    progress: 100
  }
];

/**
 * 模拟分析过程
 * @param filePath 文件路径
 * @param callbacks 分析过程回调函数集合
 * @returns Promise<void>
 */
export const simulateAnalysisProcess = async (
  filePath: string,
  callbacks: {
    setProgress: (value: React.SetStateAction<number>) => void;
    setStatusMessage: (value: React.SetStateAction<string>) => void;
    setReasoningText: (value: React.SetStateAction<string>) => void;
    setJsonStructure: (value: React.SetStateAction<string>) => void;
    setFinalContent: (value: React.SetStateAction<string>) => void;
    updateLogContent: (type: string, content: string, append?: boolean) => void;
    addAnalysisLog: (content: string, type?: string) => void;
    updateFormData: (jsonStructure: any, isPartial?: boolean, isComplete?: boolean) => void;
    setJsonCompleteStatus: (value: React.SetStateAction<boolean>) => void;
  }
): Promise<void> => {
  const {
    setProgress,
    setStatusMessage,
    setReasoningText,
    setJsonStructure,
    setFinalContent,
    updateLogContent,
    addAnalysisLog,
    updateFormData,
    setJsonCompleteStatus
  } = callbacks;

  // 模拟分析流程
  addAnalysisLog("开始模拟分析流程", "info");
  
  // 分析步骤总数，用于计算进度
  const totalSteps = ANALYSIS_STEPS.length;
  
  // 逐步执行每个分析步骤
  for (let i = 0; i < totalSteps; i++) {
    const step = ANALYSIS_STEPS[i];
    const progress = Math.round(((i + 1) / totalSteps) * 100);
    
    setProgress(progress);
    setStatusMessage(`处理中: ${step.name} - ${step.description}`);
    addAnalysisLog(`执行步骤: ${step.name} - ${step.description}`, "progress");
    updateLogContent("progress", `正在执行: ${step.name}`);
    
    // 模拟每个步骤的处理时间
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 为不同步骤生成不同的模拟输出
    switch (step.id) {
      case 'nlp':
        setReasoningText("正在分析文档结构和提取关键内容...\n");
        break;
      case 'context':
        setReasoningText(prev => prev + "识别文档中的主要论点和支持证据...\n");
        break;
      case 'data':
        setReasoningText(prev => prev + "提取研究方法、样本数据和实验设计...\n");
        break;
      case 'evaluation':
        setReasoningText(prev => prev + "评估研究方法的有效性和结果的可靠性...\n");
        break;
      case 'visualization':
        setReasoningText(prev => prev + "生成评审数据的可视化表示...\n");
        break;
      case 'summary':
        setReasoningText(prev => prev + "综合分析结果，形成最终评审意见...\n");
        
        // 在最后一步生成模拟的JSON结构和最终内容
        const mockJsonStructure = {
          formTitle: "论文评审表",
          projectInfo: {
            title: "示例论文标题",
            authors: "示例作者",
            keywords: "示例关键词",
            abstract: "这是一份模拟的论文摘要内容..."
          },
          evaluationSections: [
            {
              id: "significance",
              title: "研究意义",
              options: ["优秀", "良好", "一般", "较差"],
              selectedValue: "良好",
              aiRecommendation: "良好",
              aiReason: "该研究在当前领域有一定价值，但创新性不足"
            },
            {
              id: "methodology",
              title: "研究方法",
              options: ["优秀", "良好", "一般", "较差"],
              selectedValue: "良好",
              aiRecommendation: "良好",
              aiReason: "研究方法合理，但样本量偏小"
            }
          ],
          textualEvaluations: [
            {
              id: "strengths",
              title: "研究优势",
              content: "1. 问题定义清晰\n2. 实验设计合理\n3. 数据分析方法适当"
            },
            {
              id: "weaknesses",
              title: "研究不足",
              content: "1. 样本量偏小\n2. 未充分讨论研究局限性\n3. 部分结论缺乏足够支持"
            }
          ]
        };
        
        // 更新JSON结构
        setJsonStructure(JSON.stringify(mockJsonStructure, null, 2));
        updateFormData(mockJsonStructure, false, true);
        setJsonCompleteStatus(true);
        
        // 设置最终评审内容
        setFinalContent("# 论文评审总结\n\n## 研究概述\n该研究探讨了一个有价值的问题，采用了适当的研究方法，但存在一些局限性。\n\n## 主要发现\n研究结果表明该方法在特定条件下有效，但需要进一步验证。\n\n## 建议\n建议增加样本量，并对研究局限性进行更深入的讨论。");
        break;
    }
  }
  
  addAnalysisLog("模拟分析流程完成", "complete");
  return Promise.resolve();
};
