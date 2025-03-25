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
 * @param isComplete 是否为完整JSON（最终版本）
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
  isComplete: boolean = false,
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
    // 如果是完整的JSON，记录并且标记特殊处理
    if (isComplete) {
      console.log('✅ 接收到完整JSON数据结构');
      addAnalysisLog(`接收到完整JSON数据，开始最终处理`, "json_complete");
      // 完整JSON不受节流限制，始终处理
    } else {
      // 节流控制：200ms 内只更新一次（防止高频更新），但完整JSON始终处理
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 200) {
        return;
      }
      lastUpdateTimeRef.current = now;
    }
    
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
          // 增强的JSON修复逻辑
          let fixedJsonStr = jsonStructure;
          
          // 1. 替换单引号为双引号
          fixedJsonStr = fixedJsonStr.replace(/'/g, '"');
          
          // 2. 处理没有引号的属性名
          fixedJsonStr = fixedJsonStr.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          
          // 3. 处理尾部多余的逗号
          fixedJsonStr = fixedJsonStr.replace(/,\s*([}\]])/g, '$1');
          
          // 4. 处理字符串中的换行符
          fixedJsonStr = fixedJsonStr.replace(/(["])([^"]*?)[\n\r]+([^"]*?)(["])/g, '$1$2 $3$4');
          
          // 5. 尝试修复未闭合的引号和括号
          const quotes = (fixedJsonStr.match(/"/g) || []).length;
          if (quotes % 2 !== 0) {
            console.warn('⚠️ 检测到未闭合的引号，尝试修复');
            // 寻找最后一个引号的位置
            const lastQuoteIndex = fixedJsonStr.lastIndexOf('"');
            if (lastQuoteIndex !== -1) {
              // 在字符串末尾添加引号
              fixedJsonStr += '"';
            }
          }
          
          const openBraces = (fixedJsonStr.match(/{/g) || []).length;
          const closeBraces = (fixedJsonStr.match(/}/g) || []).length;
          if (openBraces > closeBraces) {
            console.warn(`⚠️ 检测到未闭合的大括号，尝试修复 (开:{${openBraces}, 闭:${closeBraces})`);
            // 在字符串末尾添加缺少的大括号
            for (let i = 0; i < openBraces - closeBraces; i++) {
              fixedJsonStr += '}';
            }
          }
          
          const openBrackets = (fixedJsonStr.match(/\[/g) || []).length;
          const closeBrackets = (fixedJsonStr.match(/\]/g) || []).length;
          if (openBrackets > closeBrackets) {
            console.warn(`⚠️ 检测到未闭合的方括号，尝试修复 (开:[${openBrackets}, 闭:${closeBrackets})`);
            // 在字符串末尾添加缺少的方括号
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
              fixedJsonStr += ']';
            }
          }
          
          try {
            normalizedData = JSON.parse(fixedJsonStr);
            console.log('✅ 修复后解析成功');
            addAnalysisLog(`JSON格式问题已自动修复`, "success");
          } catch (innerParseError) {
            // 如果第一次修复失败，尝试更激进的修复方法
            console.error('❌ 第一次修复失败，尝试更激进的修复:', innerParseError);
            
            try {
              // 尝试提取最外层的JSON对象
              const objectMatch = fixedJsonStr.match(/{[^]*?}/);
              if (objectMatch && objectMatch[0]) {
                const extractedObject = objectMatch[0];
                normalizedData = JSON.parse(extractedObject);
                console.log('✅ 从字符串中提取JSON对象成功');
                addAnalysisLog(`从损坏的JSON中提取有效数据成功`, "success");
              } else {
                // 如果无法提取完整对象，则尝试创建一个最小可用的对象
                normalizedData = {}; // 空对象作为后备
                console.warn('⚠️ 无法提取完整JSON对象，使用空对象');
                addAnalysisLog(`无法修复JSON，将使用部分数据`, "warning");
              }
            } catch (lastResortError) {
              console.error('❌ 所有修复尝试失败，使用原始字符串:', lastResortError);
              
              // 最后的尝试：将整个字符串作为单个字段的值
              normalizedData = { rawData: jsonStructure };
              addAnalysisLog(`无法解析JSON，将保留原始数据以备后用`, "warning");
            }
          }
        } catch (fixError) {
          console.error('❌ 修复JSON失败，创建后备对象:', fixError);
          // 创建一个最小的可用对象
          normalizedData = {};
          addAnalysisLog(`JSON解析失败: ${fixError instanceof Error ? fixError.message : '未知错误'}, 使用空对象`, "error");
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
    
    // 如果是完整JSON，特殊处理
    if (isComplete) {
      addAnalysisLog(`处理完整JSON数据`, "json_processing");
      // 对于完整的JSON，我们可能希望完全替换某些部分，而不是仅更新
      // 这里根据实际需求进行处理
    }
    
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
          
          // 如果是完整JSON，可以考虑完全替换评估部分
          if (isComplete && normalizedData.evaluationSections.length > 0) {
            updatedFormData.evaluationSections = [...normalizedData.evaluationSections];
          } else {
            // 否则，更新现有评估部分
            // 创建ID到对象的映射，便于快速查找
            const sectionsMap = new Map();
            updatedFormData.evaluationSections.forEach((section: any) => {
              if (section && section.id) {
                sectionsMap.set(section.id, section);
              }
            });
            
            // 更新或新增评估部分
            normalizedData.evaluationSections.forEach((section: any) => {
              if (section && section.id) {
                if (sectionsMap.has(section.id)) {
                  // 更新现有部分
                  const existingSection = sectionsMap.get(section.id);
                  Object.assign(existingSection, section);
                } else {
                  // 添加新部分
                  updatedFormData.evaluationSections.push(section);
                }
              } else if (section) {
                // 没有ID但有内容，添加
                updatedFormData.evaluationSections.push(section);
              }
            });
          }
        } else {
          console.warn('⚠️ evaluationSections不是有效数组:', normalizedData.evaluationSections);
        }
      } catch (evaluationSectionsError) {
        console.error('❌ 更新evaluationSections出错:', evaluationSectionsError);
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
          
          // 如果是完整JSON，可以考虑完全替换文本评估部分
          if (isComplete && normalizedData.textualEvaluations.length > 0) {
            updatedFormData.textualEvaluations = [...normalizedData.textualEvaluations];
          } else {
            // 否则，更新现有文本评估部分
            // 创建ID到对象的映射，便于快速查找
            const textualsMap = new Map();
            updatedFormData.textualEvaluations.forEach((textual: any) => {
              if (textual && textual.id) {
                textualsMap.set(textual.id, textual);
              }
            });
            
            // 更新或新增文本评估
            normalizedData.textualEvaluations.forEach((textual: any) => {
              if (textual && textual.id) {
                if (textualsMap.has(textual.id)) {
                  // 更新现有文本评估
                  const existingTextual = textualsMap.get(textual.id);
                  Object.assign(existingTextual, textual);
                } else {
                  // 添加新文本评估
                  updatedFormData.textualEvaluations.push(textual);
                }
              } else if (textual) {
                // 没有ID但有内容，添加
                updatedFormData.textualEvaluations.push(textual);
              }
            });
          }
        } else {
          console.warn('⚠️ textualEvaluations不是有效数组:', normalizedData.textualEvaluations);
        }
      } catch (textualEvaluationsError) {
        console.error('❌ 更新textualEvaluations出错:', textualEvaluationsError);
      }
    }
    
    // 如果是完整的JSON，记录完成事件
    if (isComplete) {
      addAnalysisLog(`完整JSON数据处理完成`, "json_complete_processed");
    }
    
    // 更新状态
    formDataRef.current = updatedFormData;
    
    // 更新状态中的数据，触发组件重渲染
    setFormData(prevData => {
      // 如果新数据与旧数据相同，不进行更新（防止不必要的重渲染）
      if (isEqual(prevData, updatedFormData)) {
        return prevData;
      }
      return {...updatedFormData};
    });
    
    // 调用外部更新回调
    if (dataUpdateCallbackRef.current) {
      dataUpdateCallbackRef.current(updatedFormData);
    }
  } catch (error) {
    console.error('❌ 更新表单数据结构失败:', error);
    addAnalysisLog(`更新表单数据结构失败: ${error instanceof Error ? error.message : '未知错误'}`, "error");
  }
}; 