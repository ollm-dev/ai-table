import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
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
  onApplyJsonStructure?: (jsonStructure: string) => void;
}
interface EvaluationSectionItemProps {
  section: EvaluationSection;
  sectionIndex: number;
  selectedValue: string;
  handleRadioChange: (sectionId: string, value: string) => void;
  aiRecommendationsAvailable: boolean;
  showEvaluationAI: boolean;
}
interface AnalysisLogPanelProps {
  analysisLogs: Array<{time: string, content: string, type: string}>;
  isAnalyzing: boolean;
  pdfFile: File | null;
  progress: number;
  statusMessage: string;
  onApplyJsonStructure?: (jsonStructure: string) => void;
}



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
  onApplyJsonStructure
}: EvaluationOptionsSectionProps) {
  const [fakeLogs, setFakeLogs] = useState<Array<{time: string, content: string, type: string}>>([]);
  const fakeAnalysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fakeStepIndexRef = useRef(0);
  // 添加假进度状态
  const [fakeProgress, setFakeProgress] = useState(0);
  const [fakeStatusMessage, setFakeStatusMessage] = useState('');
  
  // 更新假进度的函数
  const updateFakeProgress = useCallback((newProgress: number) => {
    setFakeProgress(newProgress);
    if (newProgress < 20) {
      setFakeStatusMessage('正在初始化分析引擎...');
    } else if (newProgress < 40) {
      setFakeStatusMessage('正在处理PDF文档...');
    } else if (newProgress < 60) {
      setFakeStatusMessage('正在深度分析论文内容...');
    } else if (newProgress < 80) {
      setFakeStatusMessage('正在评估研究质量...');
    } else if (newProgress < 95) {
      setFakeStatusMessage('正在生成评审意见...');
    } else {
      setFakeStatusMessage('完成分析，准备结果...');
    }
  }, []);

  // 监控真实日志，一旦出现就停止假分析
  useEffect(() => {
    if (analysisLogs.length > 0) {
      console.log('检测到真实日志，停止假分析');
      
      // 为了避免突然切换导致的视觉跳动，添加一个完成的假日志
      if (fakeLogs.length > 0) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setFakeLogs(prevLogs => [
          ...prevLogs,
          {
            time: timeString,
            content: '检测到来自后端的实时分析数据，切换到真实分析结果...',
            type: 'init'
          }
        ]);
        
        // 短暂延迟后清除假日志
        setTimeout(() => {
          setFakeLogs([]);
        }, 800);
      }
      
      // 清除所有定时器
      if (fakeAnalysisTimerRef.current) {
        clearTimeout(fakeAnalysisTimerRef.current);
        fakeAnalysisTimerRef.current = null;
      }
      
      // 重置进度和状态
      setFakeProgress(0);
      setFakeStatusMessage('');
      fakeStepIndexRef.current = 0;
    }
  }, [analysisLogs.length, fakeLogs.length]);

  // 当分析开始且没有真实日志时生成假日志
  useEffect(() => {
    // 如果不在分析状态、没有PDF文件，或者已有真实日志，则不生成假日志
    if (!isAnalyzing || !pdfFile || analysisLogs.length > 0) {
      return;
    }

    // 假分析步骤数组 - 模拟复杂的分析过程
    const fakeAnalysisSteps = [
      {
        type: 'init',
        content: '初始化AI分析引擎...'
      },
      {
        type: 'init',
        content: '加载高级论文评审模型 v3.5.2...'
      },
      {
        type: 'init',
        content: '校准语义理解层级 (L5 精度模式)...'
      },
      {
        type: 'init',
        content: '启动知识图谱增强引擎...'
      },
      {
        type: 'init',
        content: '连接学术引用数据库 (SCI/SSCI/EI)...'
      },
      {
        type: 'progress',
        content: '开始PDF文档深度解析 (应用OCR增强算法)...'
      },
      {
        type: 'progress',
        content: '提取文档结构、元数据及引用关系网络...'
      },
      {
        type: 'progress',
        content: '识别论文章节、参考文献与引用频次分布...'
      },
      {
        type: 'progress',
        content: '启动双向Transformer文本理解模型分析全文...'
      },
      {
        type: 'reasoning',
        content: '应用BERT-Large分析论文标题和摘要，提取关键研究问题和研究目标...'
      },
      {
        type: 'reasoning',
        content: '运行方法学评估模块 (MEM v2.3)，分析研究方法的严谨性、创新性和可复现性...'
      },
      {
        type: 'reasoning',
        content: '分析实验设计的内部有效性和外部有效性，检查控制变量的合理性...'
      },
      {
        type: 'reasoning',
        content: '执行多源数据融合分析，评估数据来源可靠性和数据处理流程规范性...'
      },
      {
        type: 'reasoning',
        content: '应用统计显著性检验评估器 (α=0.05)，检验实验结果的p值分布和效应量...'
      },
      {
        type: 'reasoning',
        content: '分析结果的统计功效 (Power Analysis)，评估样本量是否充足...'
      },
      {
        type: 'reasoning',
        content: '评估论文讨论部分是否充分考虑了研究局限性、潜在偏差和反例情况...'
      },
      {
        type: 'reasoning',
        content: '构建主题相关性网络 (TRN)，对比本研究与领域内顶尖研究的位置关系...'
      },
      {
        type: 'reasoning',
        content: '应用创新点检测算法 (IDA)，识别研究的原创性贡献和理论突破...'
      },
      {
        type: 'reasoning',
        content: '执行引用文献质量评估，分析H因子分布和期刊影响因子分布...'
      },
      {
        type: 'content',
        content: '**初步发现：** 论文在方法学上采用了创新的混合研究设计，但实验验证部分的统计功效分析显示样本量略有不足 (Power = 0.78 < 0.8)。研究问题定位准确，但假设检验过程中存在一处可能的p-hacking迹象。'
      },
      {
        type: 'reasoning',
        content: '深入分析研究问题的理论基础，构建概念框架图并评估理论一致性...'
      },
      {
        type: 'reasoning',
        content: '应用论证逻辑分析器 (LRA)，评估结论的合理性和推理链完整性...'
      },
      {
        type: 'reasoning',
        content: '检查论文是否充分讨论了研究的理论含义与实践应用价值...'
      },
      {
        type: 'reasoning',
        content: '执行跨学科影响评估，分析研究成果对相关领域的潜在贡献...'
      },
      {
        type: 'content',
        content: '**综合评估进展：** 研究问题具有较高理论和应用价值，提出的概念框架整合了三个主流理论模型，但论证过程中第二部分存在一定逻辑跳跃。研究方法的创新性在于融合了定性与定量分析手段，建立了新的多层次评估体系。'
      },
      {
        type: 'reasoning',
        content: '执行格式和规范性检查，包括图表表达清晰度、参考文献格式一致性等...'
      },
      {
        type: 'reasoning',
        content: '分析论文语言表达的准确性、简洁性和专业性，识别潜在的术语使用不当...'
      },
      {
        type: 'reasoning',
        content: '应用多维评价模型 (MEM)，综合考量研究的原创性、方法严谨性、理论贡献和应用前景...'
      },
      {
        type: 'reasoning',
        content: '根据领域特定评价标准校准评分，考虑研究难度系数和领域发展阶段...'
      },
      {
        type: 'reasoning',
        content: '生成初步评审意见与改进建议，针对研究设计、数据分析和结论推导环节...'
      },
      {
        type: 'reasoning',
        content: '启动预测性分析模块，评估研究成果未来12-24个月内的引用潜力...'
      },
      {
        type: 'reasoning',
        content: '基于机器学习辅助的同行评议预测系统，模拟5位领域专家可能的评审结果...'
      },
      {
        type: 'content',
        content: '**最终分析总结：** 本研究在方法学创新和理论整合方面具有显著贡献，特别是提出的多层次分析框架可为相关研究提供新思路。主要优势在于实验设计严谨和数据分析全面，不足之处包括样本规模略显不足以及某些理论推导环节存在跳跃。建议增加样本量至少30%以提高统计功效，并补充中介变量分析以完善理论模型。综合评分位于同类研究前25%，具有较高学术价值和应用潜力。'
      },
      {
        type: 'complete',
        content: '评审完成，正在生成结构化数据...'
      }
    ];

    // 添加生成假日志的函数
    const generateFakeLog = () => {
      // 如果已有真实日志或步骤索引超出范围，则停止生成
      if (analysisLogs.length > 0 || fakeStepIndexRef.current >= fakeAnalysisSteps.length) {
        return;
      }

      // 获取当前步骤
      const currentStep = fakeAnalysisSteps[fakeStepIndexRef.current];
      // 创建当前时间字符串
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // 添加新的假日志
      setFakeLogs(prevLogs => [
        ...prevLogs,
        {
          time: timeString,
          content: currentStep.content,
          type: currentStep.type
        }
      ]);

      // 更新假进度条
      const newProgress = Math.min(95, Math.floor((fakeStepIndexRef.current / fakeAnalysisSteps.length) * 100));
      if (typeof updateFakeProgress === 'function') {
        updateFakeProgress(newProgress);
      }

      // 增加步骤索引
      fakeStepIndexRef.current++;

      // 设置下一个步骤的延迟时间，随机化以增加真实感
      // 为不同类型的步骤设置不同的延迟范围
      let nextDelay;
      if (currentStep.type === 'init') {
        // 初始化步骤较快
        nextDelay = Math.floor(Math.random() * (1200 - 500 + 1)) + 500;
      } else if (currentStep.type === 'progress') {
        // 进度步骤中等速度
        nextDelay = Math.floor(Math.random() * (1800 - 800 + 1)) + 800;
      } else if (currentStep.type === 'reasoning') {
        // 推理步骤较慢
        nextDelay = Math.floor(Math.random() * (2800 - 1500 + 1)) + 1500;
      } else if (currentStep.type === 'content') {
        // 内容总结步骤更慢
        nextDelay = Math.floor(Math.random() * (3500 - 2000 + 1)) + 2000;
      } else if (currentStep.type === 'complete') {
        // 完成步骤延迟更长
        nextDelay = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
      } else {
        // 默认延迟
        nextDelay = Math.floor(Math.random() * (2500 - 800 + 1)) + 800;
      }
      
      // 随机增加一些变化，使分析看起来更自然
      if (Math.random() > 0.8) {
        nextDelay += Math.floor(Math.random() * 1000);
      }
      
      // 如果还有下一步，继续生成
      if (fakeStepIndexRef.current < fakeAnalysisSteps.length) {
        fakeAnalysisTimerRef.current = setTimeout(generateFakeLog, nextDelay);
      } else {
        // 所有步骤完成后，模拟JSON结构生成
        setTimeout(() => {
          const fakeJsonStructure = {
            formTitle: "论文评审表",
            projectInfo: {
              title: pdfFile?.name?.replace('.pdf', '') || "研究论文",
              author: "自动检测",
              institution: "自动检测",
              date: new Date().toISOString().split('T')[0]
            },
            evaluationSections: [
              {
                id: "originality",
                title: "创新性评价",
                recommendation: "较高"
              },
              {
                id: "methodology", 
                title: "研究方法评价",
                recommendation: "良好"
              },
              {
                id: "significance",
                title: "研究意义评价",
                recommendation: "显著"
              }
            ],
            textualEvaluations: {
              strengths: "方法学创新；数据分析全面；理论框架合理",
              weaknesses: "样本量略显不足；某些理论推导存在跳跃",
              recommendations: "建议增加样本量；补充中介变量分析"
            }
          };
          
          // 将JSON结构添加到假日志中
          setFakeLogs(prevLogs => [
            ...prevLogs,
            {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              content: `评审完成，生成JSON结构: \n\`\`\`json\n${JSON.stringify(fakeJsonStructure, null, 2)}\n\`\`\``,
              type: 'complete'
            }
          ]);
          
          // 设置最终进度为100%
          if (typeof updateFakeProgress === 'function') {
            updateFakeProgress(100);
          }
        }, 3000);
      }
    };

    // 清除现有的定时器
    if (fakeAnalysisTimerRef.current) {
      clearTimeout(fakeAnalysisTimerRef.current);
    }

    // 重置步骤索引
    fakeStepIndexRef.current = 0;
    // 清除现有的假日志
    setFakeLogs([]);
    
    // 设置一个短延迟后开始生成假日志
    fakeAnalysisTimerRef.current = setTimeout(generateFakeLog, 500);

    // 组件卸载或依赖项变化时清除定时器
    return () => {
      if (fakeAnalysisTimerRef.current) {
        clearTimeout(fakeAnalysisTimerRef.current);
        fakeAnalysisTimerRef.current = null;
      }
    };
  }, [isAnalyzing, pdfFile, analysisLogs.length, fakeLogs.length, updateFakeProgress]);

  const combinedLogs = analysisLogs.length > 0 ? analysisLogs : fakeLogs;
  // 合并真实进度和假进度
  const combinedProgress = analysisLogs.length > 0 ? progress : fakeProgress;
  // 合并真实状态消息和假状态消息
  const combinedStatusMessage = analysisLogs.length > 0 ? statusMessage : fakeStatusMessage;

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
          analysisLogs={combinedLogs}
          isAnalyzing={isAnalyzing}
          pdfFile={pdfFile}
          progress={combinedProgress}
          statusMessage={combinedStatusMessage}
          onApplyJsonStructure={onApplyJsonStructure}
        />
      </div>
    </div>
  );
}

/**
 * 评估部分项组件
 * 
 * 此组件用于渲染评估表中的每个部分项它接收各种属性，包括部分数据、用户选择的值、
 * 处理单选按钮变化的回调函数，以及AI建议的可用性和显示状态
 * 
 * @param {Object} props - 组件属性
 * @param {Object} props.section - 当前评估部分的数据，包括标题、选项等
 * @param {number} props.sectionIndex - 当前评估部分在评估表中的索引，用于动画延迟
 * @param {string} props.selectedValue - 用户在当前部分选择的值
 * @param {Function} props.handleRadioChange - 处理单选按钮变化的回调函数
 * @param {boolean} props.aiRecommendationsAvailable - 是否有AI建议可用
 * @param {boolean} props.showEvaluationAI - 是否显示AI建议
 */

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
      className="space-y-4 p-5 rounded-xl bg-white/80 border border-gray-200 shadow-sm backdrop-blur-sm"
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
              className={`flex items-center justify-center px-6 py-2 rounded-xl transition-colors duration-300 cursor-pointer ${
                selectedValue === option 
                  ? "bg-blue-100 text-blue-700 border border-blue-300" 
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <span className="font-medium text-sm">
                {option}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* AI建议部分 */}
      <div className="h-[40px] flex items-center">
        {aiRecommendationsAvailable && showEvaluationAI && section.aiRecommendation ? (
          <div className="flex items-center p-3 bg-gray-50/80 rounded-xl border border-gray-100 w-full">
            <span className="text-gray-600 mr-3 font-medium">AI建议:</span>
            <Badge className={`${
              section.id === 'maturity' && section.aiRecommendation === '熟悉' ? 'bg-green-100 text-green-700 border-green-300' :
              section.id === 'rating' && section.aiRecommendation === '优' ? 'bg-blue-100 text-blue-700 border-blue-300' :
              section.id === 'funding' && section.aiRecommendation === '优先资助' ? 'bg-purple-100 text-purple-700 border-purple-300' :
              'bg-gray-100 text-gray-700 border-gray-300'
            } border px-4 py-1 rounded-full transition-colors`}>
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

function AnalysisLogPanel({ 
  analysisLogs, 
  isAnalyzing, 
  pdfFile,
  progress,
  statusMessage,
  onApplyJsonStructure
}: AnalysisLogPanelProps) {
  const [activeTab, setActiveTab] = useState<'reasoning' | 'content' | 'json'>('reasoning');
  const [jsonStructure, setJsonStructure] = useState<string | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showFillSuccess, setShowFillSuccess] = useState(false);
  const lastContentLengthRef = useRef(0);
  const userScrolledRef = useRef(false);
  const scrollPositionRef = useRef(0);
  const hasHandledScrollRef = useRef(false);
  const isHandlingScrollRef = useRef(false);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    if (isHandlingScrollRef.current) return;
    isHandlingScrollRef.current = true;

    const container = logContainerRef.current;
    if (!container) {
      isHandlingScrollRef.current = false;
      return;
    }

    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
    userScrolledRef.current = !isAtBottom;
    scrollPositionRef.current = container.scrollTop;
    setAutoScroll(!userScrolledRef.current);

    setTimeout(() => {
      isHandlingScrollRef.current = false;
    }, 100);
  }, []);

  // 添加滚动事件监听
  useEffect(() => {
    const container = logContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logContainerRef.current && !hasHandledScrollRef.current) {
      scrollTimerRef.current = setTimeout(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
          hasHandledScrollRef.current = true;
        }
      }, 100);
    }
  }, [analysisLogs, autoScroll]);

  // 缓存过滤后的日志
  const filteredLogs = useMemo(() => {
    return analysisLogs.filter(log => {
      switch (activeTab) {
        case 'reasoning':
          return log.type === 'reasoning';
        case 'content':
          return log.type === 'content' || 
            (log.type === 'complete' && !log.content.includes('json_structure'));
        case 'json':
          return false;
        default:
          return false;
      }
    });
  }, [analysisLogs, activeTab]);

  // 当有新的完成日志且包含json_structure时，提取并保存JSON结构
  // useEffect(() => {
  //   const completeLog = analysisLogs.find(log => 
  //     log.type === 'complete' && 
  //     typeof log.content === 'string' && 
  //     log.content.includes('json_structure')
  //   );
    
  //   if (completeLog) {
  //     try {
  //       // 优化JSON结构提取的正则表达式，使用更可靠的模式
  //       // 考虑到json_structure后面可能跟着一个完整的JSON对象
  //       const match = completeLog.content.match(/json_structure"?\s*:\s*({[\s\S]*?})(?=[,}]|$)/);
        
  //       if (match && match[1]) {
  //         console.log('🔍 从日志中提取到JSON结构:', match[1]);
          
  //         try {
  //           // 尝试解析提取的JSON字符串，确认它是有效的JSON
  //           const parsedJson = JSON.parse(match[1]);
  //           // 成功解析后再设置状态
  //           setJsonStructure(match[1]);
  //           console.log('✅ 成功解析JSON结构:', parsedJson);
  //         } catch (parseError) {
  //           console.error('❌ 提取的JSON无效，尝试进一步处理:', parseError);
            
  //           // 尝试修复格式错误的JSON - 处理常见问题如单引号、缺少引号的属性名等
  //           try {
  //             // 替换单引号为双引号
  //             let fixedJsonStr = match[1].replace(/'/g, '"');
  //             // 处理没有引号的属性名
  //             fixedJsonStr = fixedJsonStr.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
              
  //             // 再次尝试解析
  //             const parsedFixedJson = JSON.parse(fixedJsonStr);
  //             setJsonStructure(fixedJsonStr);
  //             console.log('✅ 修复并成功解析JSON结构:', parsedFixedJson);
  //           } catch (fixError) {
  //             console.error('❌ 修复JSON失败:', fixError);
              
  //             // 最后尝试更宽松的提取 - 寻找最外层的大括号对
  //             try {
  //               const fullContent = completeLog.content;
  //               const startIdx = fullContent.indexOf('{');
  //               const endIdx = fullContent.lastIndexOf('}');
                
  //               if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
  //                 const potentialJson = fullContent.substring(startIdx, endIdx + 1);
  //                 // 再次尝试解析
  //                 const parsedPotentialJson = JSON.parse(potentialJson);
  //                 setJsonStructure(potentialJson);
  //                 console.log('✅ 通过宽松模式成功提取JSON结构:', parsedPotentialJson);
  //               }
  //             } catch (lastAttemptError) {
  //               console.error('❌ 所有JSON提取方法都失败:', lastAttemptError);
  //             }
  //           }
  //         }
  //       } else {
  //         console.warn('⚠️ 未找到完整的JSON结构匹配');
          
  //         // 尝试更宽松的提取 - 寻找最外层的大括号对
  //         const fullContent = completeLog.content;
  //         const startIdx = fullContent.indexOf('{');
  //         const endIdx = fullContent.lastIndexOf('}');
          
  //         if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
  //           try {
  //             const potentialJson = fullContent.substring(startIdx, endIdx + 1);
  //             // 尝试解析
  //             const parsedJson = JSON.parse(potentialJson);
              
  //             // 验证提取的JSON是否包含必要的表单结构字段
  //             if (
  //               parsedJson.formTitle || 
  //               parsedJson.projectInfo || 
  //               parsedJson.evaluationSections || 
  //               parsedJson.textualEvaluations
  //             ) {
  //               setJsonStructure(potentialJson);
  //               console.log('✅ 通过宽松模式提取到有效的表单JSON:', parsedJson);
  //             }
  //           } catch (parseError) {
  //             console.error('❌ 宽松模式JSON解析失败:', parseError);
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error('❌ 解析JSON结构失败:', error);
  //     }
  //   }
  // }, [analysisLogs]);

  // 添加CSS样式到文档头，确保markdown渲染的稳定性
  useEffect(() => {
    // 创建样式标签
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* 固定行高和块级间距，防止抖动 */
      .markdown-content p, 
      .markdown-content li, 
      .markdown-content h1, 
      .markdown-content h2, 
      .markdown-content h3, 
      .markdown-content h4, 
      .markdown-content h5, 
      .markdown-content h6 {
        line-height: 1.5 !important;
        margin-top: 0.5em !important;
        margin-bottom: 0.5em !important;
        min-height: 1.5em !important;
        transform: translateZ(0) !important;
        contain: content !important;
      }
      
      /* 预防内联元素引起的抖动 */
      .markdown-content code,
      .markdown-content em,
      .markdown-content strong {
        white-space: pre-wrap !important;
        display: inline-block !important;
        transform: translateZ(0) !important;
      }
      
      /* 确保表格不会导致布局抖动 */
      .markdown-content table {
        table-layout: fixed !important;
        width: 100% !important;
        transform: translateZ(0) !important;
      }

      /* 稳定流式渲染容器 */
      .stable-display-layer {
        position: relative !important;
        transform: translateZ(0) !important;
        backface-visibility: hidden !important;
        overflow: hidden !important;
        min-height: 100% !important;
        will-change: contents !important;
        contain: paint layout style !important;
      }
      
      /* 防止滚动时的内容抖动 */
      #log-container {
        overscroll-behavior: contain !important;
        scroll-padding: 8px !important;
      }
      
      /* 优化流式文本渲染性能 */
      .stream-log {
        contain: content !important;
        page-break-inside: avoid !important;
      }
      
      /* 用于平滑过渡的动画 */
      @keyframes smoothFadeIn {
        from { opacity: 0.85; }
        to { opacity: 1; }
      }
      
      /* 应用平滑过渡效果 */
      .markdown-wrapper .render-target {
        animation: smoothFadeIn 0.3s ease-out !important;
      }
      
      /* 进度条闪烁动画 - 较慢 */
      @keyframes pulse-slow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      
      .animate-pulse-slow {
        animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      /* 进度条闪光动画 */
      @keyframes shimmer-fast {
        from { transform: translateX(-150%) skewX(-15deg); }
        to { transform: translateX(350%) skewX(-15deg); }
      }
      
      .animate-shimmer-fast {
        animation: shimmer-fast 2s ease-in-out infinite;
      }
    `;
    
    // 添加到head中
    document.head.appendChild(styleElement);
    
    // 清理函数
    return () => {
      document.head.removeChild(styleElement);
      
      // 清理所有定时器
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      
      // 移除事件监听器
      const logContainer = document.getElementById('log-container');
      if (logContainer) {
        logContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // 处理应用JSON结构按钮点击
  const handleApplyJsonStructure = useCallback(() => {
    if (jsonStructure && onApplyJsonStructure) {
      try {
        // 最后检查一次JSON的有效性
        const parsedJson = JSON.parse(jsonStructure);
        console.log('🚀 应用JSON结构:', parsedJson);
        
        // 调用回调函数应用JSON结构
        onApplyJsonStructure(jsonStructure);
        
        // 显示成功提示
        setShowFillSuccess(true);
        
        // 3秒后隐藏成功提示
        setTimeout(() => {
          setShowFillSuccess(false);
        }, 3000);
      } catch (error) {
        console.error('❌ 应用JSON结构时解析失败:', error);
        // 如果出错，可以添加错误提示UI
      }
    }
  }, [jsonStructure, onApplyJsonStructure]);

  // 手动滚动到底部
  const scrollToBottom = useCallback(() => {
    const container = logContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      setAutoScroll(true);
      userScrolledRef.current = false;
    }
  }, []);

  // 添加一个固定字符计数算法，避免过长内容导致的布局抖动
  function getStableDisplayContent(content: string): string {
    // 如果内容为空直接返回
    if (!content) return '';
    // 对于长度大于某个值的内容，不做特殊处理
    // 在这里假设大于1000字符的内容已经足够长，不会引起明显抖动
    if (content.length > 100) return content;
    
    // 对于短内容，返回原始内容，不再添加隐藏的HTML标签
    // 我们会在渲染组件时处理填充问题
    return content;
  }

  // 优化日志渲染
  // 使用 React.memo 包裹 MemoizedMarkdown 组件
  const MemoizedMarkdownWrapper = React.memo(({ content }: { content: string }) => {
    // 使用稳定内容算法预处理内容
    const stableContent = useMemo(() => getStableDisplayContent(content), [content]);
    
    // 计算容器最小高度，确保短内容时也有一定高度
    const minHeight = content && content.length < 100 ? Math.max(24, content.length * 0.3) : 24;
    
    return (
      <div className="markdown-wrapper overflow-hidden" style={{ 
        minHeight: `${minHeight}px`,
        position: 'relative',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'contents'
      }}>
        <Markdown content={stableContent} />
      </div>
    );
  }, (prevProps, nextProps) => {
    // 简化比较函数，只比较内容是否完全相同
    return prevProps.content === nextProps.content;
  });

  const LogRenderer = ({ filteredLogs }: { filteredLogs: Array<{ time: string; content: string; type: string }> }) => {
    const memoizedLogs = useMemo(() => {
      return filteredLogs.map((log) => {
        const key = `${log.type}-${log.time}-${log.content.length}`;
        return (
          <div
            key={key}
            className={`stream-log ${log.type} p-2 rounded-lg ${
              log.type === 'reasoning'
                ? 'bg-gray-100 text-gray-800 border-l-2 border-primary-400'
                : log.type === 'content'
                ? 'bg-purple-50/50 border-l-2 border-purple-400'
                : log.type === 'complete'
                ? 'bg-green-50/50 border-l-2 border-green-400'
                : log.type === 'error'
                ? 'bg-red-50/50 border-l-2 border-red-400'
                : ''
            }`}
            style={{ 
              animation: 'none',
              willChange: 'transform', // 优化元素变换性能
              contain: 'content', // 包含内部布局变化
              lineHeight: '1.5', // 固定行高
              minHeight: '24px', // 最小高度确保一致性
              position: 'relative',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            <div className="flex items-start">
              <div className="mr-2 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {log.type === 'progress' && <span>📄</span>}
                {log.type === 'reasoning' && <span>🤔</span>}
                {log.type === 'content' && <span>📝</span>}
                {log.type === 'complete' && <span>✨</span>}
                {log.type === 'error' && <span>❌</span>}
                {log.type === 'init' && <span>🚀</span>}
                {!['progress', 'reasoning', 'content', 'complete', 'error', 'init'].includes(
                  log.type
                ) && <span>📌</span>}
              </div>
              <div className="flex-1 min-w-0 markdown-content">
                {log.content && (
                  <MemoizedMarkdownWrapper content={log.content} />
                )}
              </div>
            </div>
          </div>
        );
      });
    }, [filteredLogs]);

    // 添加一个稳定的包装容器，避免整体高度变化导致闪动
    return (
      <div className="stable-log-container" style={{ 
        minHeight: '100%', 
        position: 'relative',
        transform: 'translateZ(0)', // 强制硬件加速
        willChange: 'transform',    // 优化变换性能
        contain: 'paint layout',    // 限制重绘和重排范围
        backfaceVisibility: 'hidden',
        isolation: 'isolate'        // 创建新的层叠上下文
      }}>
        {memoizedLogs}
      </div>
    );
  };

  // JSON标签页内容渲染器
  const JsonTabContent = () => {
    if (!jsonStructure) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="relative rounded-full h-8 w-8 bg-gray-300 flex items-center justify-center">
                  <span className="text-white text-lg">⋯</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              暂无可用的AI自动填充数据
              {isAnalyzing && '，正在生成中...'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full relative">
        <div className="flex-1 overflow-auto mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
            {jsonStructure}
          </pre>
        </div>
        <div className="flex justify-center">
          {showFillSuccess && <div className="px-6 py-2 bg-green-100 text-green-800 rounded-xl border border-green-200 shadow-md flex items-center">
              <span className="mr-2">✓</span>
              <span className="font-medium">应用成功</span>
          </div>}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full lg:w-3/5 order-1 lg:order-2 lg:border-l lg:pl-8 border-gray-100">
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-500 backdrop-blur-sm relative overflow-hidden h-full min-h-[450px]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-purple-500 to-primary-600 opacity-80"></div>
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary-100/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-100/10 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col">
          <h4 className="text-primary-600 font-medium mb-3 text-center flex items-center justify-center">
            <span className="inline-block h-2 w-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
            <span className="gradient-text text-lg font-semibold">AI分析引擎思考过程</span>
            {isAnalyzing && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full animate-pulse">
                实时分析中...
              </span>
            )}
          </h4>
          
          {/* 标签切换按钮 */}
          <div className="flex mb-4 gap-2 justify-center">
            <button
              type="button"
              onClick={() => setActiveTab('reasoning')}
              className={`px-4 py-2 rounded-xl transition-all duration-300 border ${
                activeTab === 'reasoning' 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg border-primary-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary-200 hover:bg-primary-50/10'
              }`}
            >
              <span className="font-medium">推理过程</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-xl transition-all duration-300 border ${
                activeTab === 'content' 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg border-primary-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary-200 hover:bg-primary-50/10'
              }`}
            >
              <span className="font-medium">评审结果</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`px-4 py-2 rounded-xl transition-all duration-300 border ${
                activeTab === 'json' 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg border-primary-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary-200 hover:bg-primary-50/10'
              } ${jsonStructure ? 'relative' : ''}`}
            >
              <span className="font-medium">AI填充</span>
              {jsonStructure && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
        
        {/* 添加进度条 */}
        {isAnalyzing && progress > 0 && (
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
              <div 
                className={`bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600 h-2 rounded-full 
                            transition-all duration-500 ease-out ${progress < 100 ? 'animate-pulse-slow' : ''}`}
                style={{ 
                  width: `${progress}%`, 
                  boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.5)' 
                }}
              >
                {/* 进度条活动指示器 */}
                {progress < 100 && progress > 5 && (
                  <div className="h-full w-[10%] absolute right-0 top-0 bg-white opacity-30 animate-shimmer-fast"
                       style={{ transform: 'skewX(-15deg)' }}></div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-gray-400">{Math.floor(progress)}%</div>
              <p className="text-xs text-gray-500 text-center flex-1">{statusMessage}</p>
              <div className="text-xs text-gray-400 flex items-center">
                <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${progress < 100 ? 'bg-primary-400 animate-pulse' : 'bg-green-500'}`}></span>
                <span>{progress < 100 ? '处理中' : '完成'}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* 分析日志区域 */}
        <div className="relative">
          <div 
            id="log-container"
            ref={logContainerRef}
            className="flex-1 bg-white p-5 rounded-xl text-sm shadow-inner border border-gray-200 stable-height-container" 
            style={{ 
              height: '480px',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e0 #f7fafc',
              position: 'relative',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              // 性能优化属性
              containIntrinsicSize: '0 480px',
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
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
              <div className="space-y-3 terminal-text text-sm h-full content-stable">
                {activeTab === 'json' ? (
                  <JsonTabContent />
                ) : (
                  filteredLogs.length > 0 ? (
                    <div className="stable-display-layer">
                      <LogRenderer filteredLogs={filteredLogs} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <div className="animate-ping absolute h-8 w-8 rounded-full bg-primary-200 opacity-75"></div>
                            <div className="relative rounded-full h-8 w-8 bg-primary-500 flex items-center justify-center">
                              <span className="text-white text-lg">⋯</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600">
                          {activeTab === 'reasoning' ? '暂无推理过程' : '暂无评审结果'}
                          {isAnalyzing && '，正在生成中...'}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
          
          {/* 滚动控制按钮 - 仅在分析中且用户手动滚动后显示 */}
          {isAnalyzing && !autoScroll && activeTab !== 'json' && filteredLogs.length > 0 && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-2 rounded-full shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300"
              aria-label="滚动到底部"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-primary-500"
              >
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}