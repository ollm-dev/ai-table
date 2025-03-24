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

// 示例AI思考过程内容
export const MOCK_REASONING_CONTENT = `
成本合理性说明，比如投资现金流动量足够吸引参与者，确保数据质量。

研究方法中提到用户行为为建模，实验室实验和追踪调查，这些都是合理的选择，但实验室实验的真实操作环境，比如如何控制变量，确保实验的内部控制有效性，可能需要更多的描述。

引入了数据提取和清洗的方法，比如如何处理遗漏的数据，这可能对结果有所影响。

创新之处在于动态兴趣模型和决策成本质量分析，这两个点确实有创新性，但需要更具体的理论模型或算法推导，以展示其与现有方法的区别和优势，例如，如何量化消费者的波动规律，是否有数学模型的支撑。

研究基础方面，申请人团队有相关项目经验，尤其是刘洪伟教授之前主持的国家自然科学基金项目，与当前课题有延续性。国际合作者Robert M Davison的参与增强了项目的国际视野，但部分参与者的研究贡与项目直接相关性需进一步说明，如李素梅女士在项目中的具体角色。

预算部分，设备费5万元主要用于购置电脑和软件，合理。国际合作与交流费13万元较高，需评估必要性，例如与合作单位的具体合作计划是否明确。劳务费16.5万元涉及博士生和硕士生补贴，符合规定，但需明确人员是否可以投入的真实性。

具体性分析中提到收集的数据将采取隐私保护措施，特别是涉及用户行为为数据的收集和处理，是否符合伦理审查的要求。

总体来看，项目设计合理，具有重要的理论和应用价值，但在实验设计、最新文献覆盖、预算合理性等方面还有改进空间，需要进一步明确动态兴趣模型的具体构建方法，以及如何证明实验的有效性和可靠性。
`;

// 模拟评审内容
export const MOCK_CONTENT = `
# 评审总结

该项目申请书整体质量良好，研究目标明确，方法论设计合理，但存在一些需要改进的方面：

## 优势与创新点

1. **研究主题时效性强**：电商动态兴趣研究贴合当前市场需求，具有较高应用价值
2. **方法论组合适当**：结合多种实证方法进行验证，研究设计较为完整
3. **团队基础扎实**：核心成员具有相关领域研究背景，国际合作增强研究深度

## 需改进的问题

1. **理论模型细节不足**：动态兴趣模型的具体算法与公式推导不够详细
2. **实验控制变量说明不足**：应进一步明确实验环境中如何控制关键变量
3. **预算分配需调整**：国际合作与交流费预算偏高，应提供更详细的必要性说明
4. **数据处理方法需完善**：对于遗漏数据和异常值的处理方法需要更具体的方案

## 建议

1. 补充动态兴趣模型的数学推导过程
2. 详细说明实验设计中的控制变量与操作方法
3. 调整预算分配，适当降低国际交流费用
4. 加强数据隐私保护措施的具体实施方案
5. 更明确项目成员的分工与职责

综合评分：**4.2/5.0**（良好）

推荐意见：**建议资助**（需修改后再审）
`;

// 模拟JSON结构
export const MOCK_JSON_STRUCTURE = `{
  "title": "基于用户动态兴趣的电子商务推荐系统研究",
  "authors": ["刘洪伟", "李素梅", "Robert M Davison"],
  "abstract": "本项目旨在研究电子商务环境下用户兴趣的动态变化规律及其对推荐系统的影响。",
  "keywords": ["电子商务", "动态兴趣", "推荐系统", "用户行为"],
  "evaluation": {
    "originality": 4,
    "originality_reason": "动态兴趣模型具有一定创新性，但理论推导需要更加完善",
    "significance": 4.5,
    "significance_reason": "研究主题具有较高学术价值和应用前景",
    "validity": 3.8,
    "validity_reason": "实验设计合理，但控制变量说明不足",
    "organization": 4.3,
    "organization_reason": "申请书结构清晰，逻辑性强",
    "clarity": 4.0,
    "clarity_reason": "表述基本清晰，部分技术细节需完善",
    "overall_score": 4.2,
    "recommendation": "建议资助（需修改后再审）"
  },
  "strengths": [
    "研究主题时效性强",
    "方法论组合适当",
    "团队基础扎实"
  ],
  "weaknesses": [
    "理论模型细节不足",
    "实验控制变量说明不足",
    "预算分配需调整",
    "数据处理方法需完善"
  ],
  "suggestions": [
    "补充动态兴趣模型的数学推导过程",
    "详细说明实验设计中的控制变量与操作方法",
    "调整预算分配，适当降低国际交流费用",
    "加强数据隐私保护措施的具体实施方案",
    "更明确项目成员的分工与职责"
  ]
}`;

/**
 * 模拟启动分析过程
 * @param addAnalysisLog 添加分析日志函数
 * @param setProgress 设置进度函数
 * @param setStatusMessage 设置状态消息函数
 * @param updateLogContent 更新日志内容函数
 * @param setReasoningText 设置推理文本函数
 * @param setFinalContent 设置最终内容函数
 * @param setJsonStructure 设置JSON结构函数
 */
export const simulateAnalysisProcess = async (
  addAnalysisLog: (content: string, type?: string) => void,
  setProgress: (value: React.SetStateAction<number>) => void,
  setStatusMessage: (value: React.SetStateAction<string>) => void,
  updateLogContent: (type: string, content: string, append?: boolean) => void,
  setReasoningText: (value: React.SetStateAction<string>) => void,
  setFinalContent: (value: React.SetStateAction<string>) => void,
  setJsonStructure: (value: React.SetStateAction<string>) => void
) => {
  // 初始化日志
  addAnalysisLog("开始分析文档...", "init");
  
  // 模拟AI思考过程
  let totalProgress = 0;
  
  // 每个步骤的持续时间 (毫秒)
  const stepDuration = 2000;
  const totalSteps = ANALYSIS_STEPS.length;
  
  // 模拟进度更新
  for (let i = 0; i < totalSteps; i++) {
    const step = ANALYSIS_STEPS[i];
    
    // 更新当前步骤状态
    setStatusMessage(`${step.name}：${step.description}`);
    addAnalysisLog(`开始${step.name}阶段：${step.description}`, "progress");
    
    // 在每个阶段内模拟进度条增加
    const baseProgress = (i / totalSteps) * 100;
    const maxStepProgress = ((i + 1) / totalSteps) * 100;
    
    // 在此阶段内分10个小步骤更新进度条
    const subSteps = 10;
    for (let j = 0; j < subSteps; j++) {
      const progressIncrement = (maxStepProgress - baseProgress) / subSteps;
      totalProgress = baseProgress + progressIncrement * (j + 1);
      setProgress(totalProgress);
      
      // 添加不同类型的日志
      if (step.id === 'nlp' && j === 3) {
        updateLogContent('reasoning', '正在分析文档结构...', true);
      } else if (step.id === 'context' && j === 5) {
        updateLogContent('reasoning', '提取关键术语与主张...', true);
      } else if (step.id === 'data' && j === 2) {
        updateLogContent('reasoning', '识别研究方法与实验设计...', true);
      }
      
      // 每个小步骤等待一小段时间
      await new Promise(r => setTimeout(r, stepDuration / subSteps));
    }
    
    // 阶段完成日志
    addAnalysisLog(`完成${step.name}阶段`, "progress");
    
    // 根据步骤类型更新不同内容
    if (step.id === 'nlp') {
      updateLogContent('reasoning', MOCK_REASONING_CONTENT.substring(0, 200), false);
    } else if (step.id === 'context') {
      const currentText = MOCK_REASONING_CONTENT.substring(0, 500);
      updateLogContent('reasoning', currentText, false);
      setReasoningText(currentText);
    } else if (step.id === 'data') {
      const currentText = MOCK_REASONING_CONTENT.substring(0, 800);
      updateLogContent('reasoning', currentText, false);
      setReasoningText(currentText);
    } else if (step.id === 'evaluation') {
      const currentText = MOCK_REASONING_CONTENT;
      updateLogContent('reasoning', currentText, false);
      setReasoningText(currentText);
      
      // 开始添加内容评审
      updateLogContent('content', MOCK_CONTENT.substring(0, 300), false);
      setFinalContent(MOCK_CONTENT.substring(0, 300));
    } else if (step.id === 'visualization') {
      // 更新内容评审
      updateLogContent('content', MOCK_CONTENT.substring(0, 600), false);
      setFinalContent(MOCK_CONTENT.substring(0, 600));
      
      // 开始添加JSON结构
      updateLogContent('json_structure', MOCK_JSON_STRUCTURE.substring(0, 200), false);
      setJsonStructure(MOCK_JSON_STRUCTURE.substring(0, 200));
    } else if (step.id === 'summary') {
      // 完全更新内容评审
      updateLogContent('content', MOCK_CONTENT, false);
      setFinalContent(MOCK_CONTENT);
      
      // 完全更新JSON结构
      updateLogContent('json_structure', MOCK_JSON_STRUCTURE, false);
      setJsonStructure(MOCK_JSON_STRUCTURE);
    }
  }
  
  // 模拟分析完成
  setProgress(100);
  setStatusMessage('分析完成');
  addAnalysisLog('文档分析完成', 'complete');
  
  return true;
}; 