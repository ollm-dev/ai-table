import React from 'react';
import { ANALYSIS_STEPS } from '@/hooks/analysisLogs/mockAnalysis';

interface AIProcessFlowProps {
  activeStep?: string;
  progress: number;
}

/**
 * AI分析流程组件，显示分析过程的各个步骤
 */
export function AIProcessFlow({ activeStep, progress }: AIProcessFlowProps) {
  // 根据进度确定当前活跃的步骤
  const determineActiveStep = () => {
    if (!activeStep) {
      // 根据进度自动判断当前步骤
      const stepPercentage = 100 / ANALYSIS_STEPS.length;
      const activeIndex = Math.min(
        Math.floor(progress / stepPercentage),
        ANALYSIS_STEPS.length - 1
      );
      return ANALYSIS_STEPS[activeIndex].id;
    }
    return activeStep;
  };

  const currentActiveStep = determineActiveStep();

  return (
    <div className="w-full py-2">
      <h3 className="text-center text-primary-600 font-medium mb-3">
        <span className="gradient-text font-semibold">AI分析流程</span>
      </h3>
      
      <div className="grid gap-3">
        {ANALYSIS_STEPS.map((step, index) => {
          // 计算每个步骤的状态
          const isActive = step.id === currentActiveStep;
          const isCompleted = 
            ANALYSIS_STEPS.findIndex(s => s.id === currentActiveStep) > index || 
            progress === 100;
          
          return (
            <div key={step.id} className="flex items-center">
              {/* 步骤图标 */}
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${isActive ? 'bg-primary-100 text-primary-600 animate-pulse' : 
                  isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
              `}>
                {getStepIcon(step.id, isCompleted)}
              </div>
              
              {/* 步骤文本内容 */}
              <div className="ml-3 flex-grow">
                <div className={`font-medium ${isActive ? 'text-primary-700' : 
                  isCompleted ? 'text-green-700' : 'text-gray-500'}`}>
                  {step.name}
                </div>
                <div className={`text-xs ${isActive ? 'text-primary-600' : 
                  isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {step.description}
                </div>
                
                {/* 步骤进度条 */}
                {isActive && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div 
                      className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${calculateStepProgress(index, progress)}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>
              
              {/* 右侧完成标记 */}
              <div className="flex-shrink-0 w-6 text-right">
                {isCompleted && (
                  <span className="text-green-500 text-lg">✓</span>
                )}
                {isActive && (
                  <span className="text-primary-500 text-sm animate-pulse">●</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 计算特定步骤的内部进度百分比
 */
function calculateStepProgress(stepIndex: number, overallProgress: number): number {
  const totalSteps = ANALYSIS_STEPS.length;
  const stepSize = 100 / totalSteps;
  const stepStart = stepIndex * stepSize;
  const stepEnd = (stepIndex + 1) * stepSize;
  
  if (overallProgress <= stepStart) return 0;
  if (overallProgress >= stepEnd) return 100;
  
  return ((overallProgress - stepStart) / stepSize) * 100;
}

/**
 * 根据步骤类型返回对应的图标
 */
function getStepIcon(stepId: string, isCompleted: boolean): React.ReactNode {
  if (isCompleted) {
    return "✓";
  }
  
  switch (stepId) {
    case 'nlp':
      return <span>📄</span>;
    case 'context':
      return <span>🔍</span>;
    case 'data':
      return <span>📊</span>;
    case 'evaluation':
      return <span>📏</span>;
    case 'visualization':
      return <span>👁️</span>;
    case 'summary':
      return <span>📝</span>;
    default:
      return <span>●</span>;
  }
} 