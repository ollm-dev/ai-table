/**
 * 表单数据处理相关函数
 */

import { reviewFormData } from '../../data/reviewFormData';
import { emptyFormData, FormData } from './types';
import { isEqual, transformApiJsonToFormData } from './utils';

/**
 * 初始化表单结构
 * @param initialData 初始数据
 * @param formDataRef 表单数据引用
 * @param structureInitializedRef 结构初始化状态引用
 * @param setFormData 设置表单数据函数
 * @param dataUpdateCallbackRef 数据更新回调引用
 * @param addAnalysisLog 添加分析日志函数
 */
export const initializeFormStructure = (
  initialData: any,
  formDataRef: React.MutableRefObject<FormData>,
  structureInitializedRef: React.MutableRefObject<boolean>,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  dataUpdateCallbackRef: React.MutableRefObject<((data: any) => void) | null>,
  addAnalysisLog: (content: string, type: string) => void
) => {
  if (structureInitializedRef.current || !initialData) return;
  
  try {
    console.log('🏗️ 初始化表单结构:', initialData);
    
    // 标准化 JSON 结构，确保所有属性名使用双引号
    const normalizedData = typeof initialData === 'string' 
      ? JSON.parse(initialData) 
      : initialData;
    
    // 更新 ref 缓存的数据
    const updatedFormData = {
      ...emptyFormData,
      ...(normalizedData || {}),
    };
    
    // 如果没有提供评估部分或文本评估部分，使用默认值
    if (!updatedFormData.evaluationSections || !Array.isArray(updatedFormData.evaluationSections) || updatedFormData.evaluationSections.length === 0) {
      updatedFormData.evaluationSections = [...reviewFormData.evaluationSections];
    }
    
    if (!updatedFormData.textualEvaluations || !Array.isArray(updatedFormData.textualEvaluations) || updatedFormData.textualEvaluations.length === 0) {
      updatedFormData.textualEvaluations = [...reviewFormData.textualEvaluations];
    }
    
    formDataRef.current = updatedFormData;
    
    // 更新状态中的数据，触发组件重渲染
    setFormData(prevData => {
      // 如果新数据与旧数据相同，不进行更新（防止不必要的重渲染）
      if (isEqual(prevData, updatedFormData)) {
        return prevData;
      }
      return updatedFormData;
    });
    
    // 标记为已初始化
    structureInitializedRef.current = true;
    
    // 调用外部更新回调
    if (dataUpdateCallbackRef.current) {
      dataUpdateCallbackRef.current(updatedFormData);
    }
    
    addAnalysisLog("表单结构已初始化", "structure-init");
  } catch (error) {
    console.error('❌ 初始化表单结构失败:', error);
    addAnalysisLog(`初始化表单结构失败: ${error instanceof Error ? error.message : '未知错误'}`, "error");
  }
};

/**
 * 更新表单数据
 * @param jsonStructure JSON 结构数据
 * @param isPartial 是否为部分更新
 * @param formDataRef 表单数据引用
 * @param lastUpdateTimeRef 最后更新时间引用
 * @param structureInitializedRef 结构初始化状态引用
 * @param setFormData 设置表单数据函数
 * @param dataUpdateCallbackRef 数据更新回调引用
 * @param initializeFormStructure 初始化表单结构函数
 * @param addAnalysisLog 添加分析日志函数
 */
export const updateFormData = (
  jsonStructure: any,
  isPartial: boolean = false,
  formDataRef: React.MutableRefObject<FormData>,
  lastUpdateTimeRef: React.MutableRefObject<number>,
  structureInitializedRef: React.MutableRefObject<boolean>,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  dataUpdateCallbackRef: React.MutableRefObject<((data: any) => void) | null>,
  initializeFormStructureFn: Function,
  addAnalysisLog: (content: string, type: string) => void
) => {
  if (!jsonStructure) return;
  
  try {
    // 节流控制：200ms 内只更新一次（防止高频更新）
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 200) {
      return;
    }
    lastUpdateTimeRef.current = now;
    
    console.log('📊 接收到表单数据结构:', jsonStructure, isPartial ? '(部分更新)' : '(完整更新)');
    
    // 标准化 JSON 结构
    let normalizedData: any;
    
    if (typeof jsonStructure === 'string') {
      try {
        normalizedData = JSON.parse(jsonStructure);
        console.log('✅ 成功解析JSON字符串');
      } catch (parseError) {
        console.error('❌ JSON字符串解析失败，尝试修复格式问题:', parseError);
        
        try {
          // 替换单引号为双引号
          let fixedJsonStr = jsonStructure.replace(/'/g, '"');
          // 处理没有引号的属性名
          fixedJsonStr = fixedJsonStr.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          
          normalizedData = JSON.parse(fixedJsonStr);
          console.log('✅ 修复后解析成功');
        } catch (fixError) {
          console.error('❌ 修复JSON失败，使用原始字符串:', fixError);
          addAnalysisLog(`JSON解析失败: ${fixError instanceof Error ? fixError.message : '未知错误'}`, "error");
          return; // 解析失败，退出函数
        }
      }
    } else {
      // 如果已经是对象，直接使用
      normalizedData = jsonStructure;
    }
    
    // 如果结构未初始化且非部分更新，则初始化结构
    if (!structureInitializedRef.current && !isPartial) {
      initializeFormStructureFn(normalizedData);
      return;
    }
    
    // 深拷贝当前表单数据
    const updatedFormData = JSON.parse(JSON.stringify(formDataRef.current));
    
    // 更新表单标题（如果有）
    if (normalizedData.formTitle) {
      updatedFormData.formTitle = normalizedData.formTitle;
    }
    
    // 更新项目信息
    if (normalizedData.projectInfo) {
      try {
        // 确保projectInfo是对象
        if (typeof normalizedData.projectInfo === 'object' && normalizedData.projectInfo !== null) {
          updatedFormData.projectInfo = {
            ...updatedFormData.projectInfo,
            ...normalizedData.projectInfo
          };
        } else {
          console.warn('⚠️ projectInfo不是有效对象:', normalizedData.projectInfo);
        }
      } catch (projectInfoError) {
        console.error('❌ 更新projectInfo出错:', projectInfoError);
      }
    }
    
    // 更新评估部分
    if (normalizedData.evaluationSections) {
      try {
        // 确保evaluationSections是数组
        if (Array.isArray(normalizedData.evaluationSections)) {
          // 确保 evaluationSections 已初始化
          if (!updatedFormData.evaluationSections) {
            updatedFormData.evaluationSections = [];
          }
          
          normalizedData.evaluationSections.forEach((section: any) => {
            if (!section || typeof section !== 'object') {
              console.warn('⚠️ 跳过无效的评估部分:', section);
              return; // 跳过无效项
            }
            
            if (!section.id) {
              console.warn('⚠️ 跳过没有id的评估部分:', section);
              return; // 跳过没有 id 的部分
            }
            
            const index = updatedFormData.evaluationSections.findIndex((s: any) => s.id === section.id);
            if (index !== -1) {
              // 已存在项，更新其属性
              try {
                updatedFormData.evaluationSections[index] = {
                  ...updatedFormData.evaluationSections[index],
                  ...section,
                  // 确保 aiRecommendation 和 aiReason 正确更新
                  aiRecommendation: section.aiRecommendation !== undefined ? 
                    section.aiRecommendation : 
                    updatedFormData.evaluationSections[index].aiRecommendation,
                  aiReason: section.aiReason !== undefined ? 
                    section.aiReason : 
                    updatedFormData.evaluationSections[index].aiReason
                };
              } catch (updateSectionError) {
                console.error(`❌ 更新评估部分${section.id}时出错:`, updateSectionError);
              }
            } else if (!isPartial) {
              // 只有在非部分更新时才添加新项目
              try {
                updatedFormData.evaluationSections.push(section);
              } catch (addSectionError) {
                console.error('❌ 添加新评估部分时出错:', addSectionError);
              }
            }
          });
        } else {
          console.warn('⚠️ evaluationSections不是数组:', normalizedData.evaluationSections);
        }
      } catch (evaluationSectionsError) {
        console.error('❌ 处理evaluationSections时出错:', evaluationSectionsError);
      }
    }
    
    // 更新文本评估部分
    if (normalizedData.textualEvaluations) {
      try {
        // 确保textualEvaluations是数组
        if (Array.isArray(normalizedData.textualEvaluations)) {
          // 确保 textualEvaluations 已初始化
          if (!updatedFormData.textualEvaluations) {
            updatedFormData.textualEvaluations = [];
          }
          
          normalizedData.textualEvaluations.forEach((evaluation: any) => {
            if (!evaluation || typeof evaluation !== 'object') {
              console.warn('⚠️ 跳过无效的文本评估:', evaluation);
              return; // 跳过无效项
            }
            
            if (!evaluation.id) {
              console.warn('⚠️ 跳过没有id的文本评估:', evaluation);
              return; // 跳过没有 id 的部分
            }
            
            const index = updatedFormData.textualEvaluations.findIndex((e: any) => e.id === evaluation.id);
            if (index !== -1) {
              // 已存在项，更新其属性
              try {
                updatedFormData.textualEvaluations[index] = {
                  ...updatedFormData.textualEvaluations[index],
                  ...evaluation,
                  // 确保 aiRecommendation 正确更新
                  aiRecommendation: evaluation.aiRecommendation !== undefined ? 
                    evaluation.aiRecommendation : 
                    updatedFormData.textualEvaluations[index].aiRecommendation
                };
              } catch (updateEvalError) {
                console.error(`❌ 更新文本评估${evaluation.id}时出错:`, updateEvalError);
              }
            } else if (!isPartial) {
              // 只有在非部分更新时才添加新项目
              try {
                updatedFormData.textualEvaluations.push(evaluation);
              } catch (addEvalError) {
                console.error('❌ 添加新文本评估时出错:', addEvalError);
              }
            }
          });
        } else {
          console.warn('⚠️ textualEvaluations不是数组:', normalizedData.textualEvaluations);
        }
      } catch (textualEvaluationsError) {
        console.error('❌ 处理textualEvaluations时出错:', textualEvaluationsError);
      }
    }
    
    // 如果数据未发生变化，则不触发更新
    if (isEqual(formDataRef.current, updatedFormData)) {
      console.log('⚠️ 数据未变化，跳过更新');
      return;
    }
    
    console.log('🔄 更新后的表单数据:', updatedFormData);
    
    // 更新 ref 缓存的数据
    formDataRef.current = updatedFormData;
    
    // 更新状态中的数据，触发组件重渲染
    setFormData(updatedFormData);
    
    // 调用外部更新回调
    if (dataUpdateCallbackRef.current) {
      dataUpdateCallbackRef.current(updatedFormData);
    }
    
    // 添加日志
    addAnalysisLog(isPartial ? "表单数据已部分更新" : "表单数据已完全更新", "data-update");
  } catch (error) {
    console.error('❌ 更新表单数据失败:', error);
    addAnalysisLog(`更新表单数据失败: ${error instanceof Error ? error.message : '未知错误'}`, "error");
  }
}; 