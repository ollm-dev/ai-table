/**
 * 分析日志相关的工具函数
 */

import { reviewFormData } from '../../data/reviewFormData';

/**
 * 判断两个对象是否相等（用于防止重复更新）
 * @param obj1 对象1
 * @param obj2 对象2
 * @returns 是否相等
 */
export const isEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

/**
 * 清理HTML标签
 * @param text 待清理的文本
 * @returns 清理后的文本
 */
export const sanitizeHtml = (text: string): string => {
  if (!text) return '';
  
  // 替换常见的HTML标签为Markdown等效形式或纯文本
  return text
    // 移除span标签 - 处理opacity:0等行内样式标签
    .replace(/<span[^>]*>(.*?)<\/span>/g, '$1')
    // 处理其他可能的HTML标签
    .replace(/<\/?[^>]+(>|$)/g, '')
    // 处理HTML实体
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

/**
 * 将API返回的JSON转换为表单数据格式
 * @param apiJson API返回的JSON数据
 * @returns 转换后的表单数据
 */
export const transformApiJsonToFormData = (apiJson: any): any => {
  try {
    console.log('🔄 转换API JSON为表单数据:', apiJson);
    
    // 防空检查
    if (!apiJson) {
      console.warn('⚠️ 接收到空数据');
      return {
        formTitle: "评审意见表",
        projectInfo: { ...reviewFormData.projectInfo },
        evaluationSections: [...reviewFormData.evaluationSections],
        textualEvaluations: [...reviewFormData.textualEvaluations]
      };
    }
    
    // 如果结构已经符合表单格式，直接返回
    if (apiJson.formTitle || apiJson.projectInfo || 
        apiJson.evaluationSections || apiJson.textualEvaluations) {
      return apiJson;
    }
    
    // 初始化结果对象
    const formData = {
      formTitle: "评审意见表",
      projectInfo: { ...reviewFormData.projectInfo },
      evaluationSections: [...reviewFormData.evaluationSections],
      textualEvaluations: [...reviewFormData.textualEvaluations]
    };
    
    // 处理标题
    if (apiJson.title) {
      formData.projectInfo.projectTitle = apiJson.title;
    }
    
    // 处理作者
    if (apiJson.authors) {
      // 处理多种可能的作者格式
      if (Array.isArray(apiJson.authors)) {
        formData.projectInfo.applicantName = apiJson.authors.join(', ');
      } else if (typeof apiJson.authors === 'string') {
        formData.projectInfo.applicantName = apiJson.authors;
      }
    }
    
    // 处理摘要 - 可以添加到某个文本评估字段中
    if (apiJson.abstract) {
      const abstractEvalIndex = formData.textualEvaluations.findIndex(item => item.id === 'abstract' || item.title.includes('摘要'));
      if (abstractEvalIndex !== -1) {
        formData.textualEvaluations[abstractEvalIndex].aiRecommendation = apiJson.abstract;
      } else if (formData.textualEvaluations.length > 0) {
        // 如果找不到专门的摘要字段，使用第一个文本评估字段
        formData.textualEvaluations[0].aiRecommendation = 
          `**摘要**: ${apiJson.abstract}\n\n${formData.textualEvaluations[0].aiRecommendation || ''}`;
      }
    }
    
    // 处理关键词
    if (apiJson.keywords) {
      // 处理多种可能的关键词格式
      if (Array.isArray(apiJson.keywords)) {
        const keywordsStr = apiJson.keywords.join(', ');
        formData.projectInfo.researchField = keywordsStr;
      } else if (typeof apiJson.keywords === 'string') {
        formData.projectInfo.researchField = apiJson.keywords;
      }
    }
    
    // 处理评估分数
    if (apiJson.evaluation) {
      const { evaluation } = apiJson;
      
      // 映射评估字段到评估部分
      const scoreMapping: Record<string, string> = {
        originality: 'originality', // 原创性
        significance: 'significance', // 重要性
        validity: 'validity', // 有效性
        organization: 'organization', // 组织结构
        clarity: 'clarity', // 清晰度
        recommendation: 'recommendation' // 推荐意见
      };
      
      // 更新评估部分 - 更宽松地处理数据
      Object.entries(scoreMapping).forEach(([apiKey, formKey]) => {
        try {
          if (evaluation && evaluation[apiKey] !== undefined) {
            const sectionIndex = formData.evaluationSections.findIndex(section => 
              section.id === formKey || section.title.toLowerCase().includes(formKey.toLowerCase())
            );
            
            if (sectionIndex !== -1) {
              // 数值评分
              if (typeof evaluation[apiKey] === 'number') {
                formData.evaluationSections[sectionIndex].aiRecommendation = evaluation[apiKey].toString();
              } 
              // 文本推荐
              else if (typeof evaluation[apiKey] === 'string') {
                formData.evaluationSections[sectionIndex].aiRecommendation = evaluation[apiKey];
              }
              
              // 处理AI建议原因 - 查找对应的reason字段
              const reasonKey = `${apiKey}_reason`;
              if (evaluation[reasonKey] && typeof evaluation[reasonKey] === 'string') {
                formData.evaluationSections[sectionIndex].aiReason = evaluation[reasonKey];
              }
            }
          }
        } catch (itemError) {
          console.warn(`⚠️ 处理评估项 ${apiKey} 时出错:`, itemError);
          // 继续处理其他项目
        }
      });
      
      // 尝试处理整体评估
      try {
        if (evaluation && evaluation.recommendation) {
          const overallEvalIndex = formData.textualEvaluations.findIndex(item => 
            item.id === 'overall' || item.title.includes('总体') || item.title.includes('整体')
          );
          
          if (overallEvalIndex !== -1) {
            formData.textualEvaluations[overallEvalIndex].aiRecommendation = 
              `**总体评价**: ${evaluation.recommendation}\n\n${formData.textualEvaluations[overallEvalIndex].aiRecommendation || ''}`;
          }
        }
      } catch (overallError) {
        console.warn('⚠️ 处理整体评估时出错:', overallError);
      }
    }
    
    // 如果API返回了详细评论，可以添加到相应的文本评估部分
    if (apiJson.comments && typeof apiJson.comments === 'string' && apiJson.comments.trim()) {
      try {
        const commentsEvalIndex = formData.textualEvaluations.findIndex(item => 
          item.id === 'comments' || item.title.includes('评论') || item.title.includes('意见')
        );
        
        if (commentsEvalIndex !== -1) {
          formData.textualEvaluations[commentsEvalIndex].aiRecommendation = apiJson.comments;
        } else if (formData.textualEvaluations.length > 1) {
          // 如果找不到专门的评论字段，使用第二个文本评估字段
          formData.textualEvaluations[1].aiRecommendation = 
            `**详细评论**: ${apiJson.comments}\n\n${formData.textualEvaluations[1].aiRecommendation || ''}`;
        }
      } catch (commentsError) {
        console.warn('⚠️ 处理评论时出错:', commentsError);
      }
    }
    
    // 处理其他可能的字段名（不同格式的适配）
    const alternativeFieldMappings: Record<string, (value: any) => void> = {
      // 标题的其他可能字段名
      "paper_title": (value) => { 
        if (typeof value === 'string') formData.projectInfo.projectTitle = value; 
      },
      "paperTitle": (value) => { 
        if (typeof value === 'string') formData.projectInfo.projectTitle = value; 
      },
      
      // 作者的其他可能字段名
      "author": (value) => {
        if (typeof value === 'string') formData.projectInfo.applicantName = value;
        else if (Array.isArray(value)) formData.projectInfo.applicantName = value.join(', ');
      },
      "authorName": (value) => {
        if (typeof value === 'string') formData.projectInfo.applicantName = value;
      },
      
      // 研究领域的其他可能字段名
      "field": (value) => {
        if (typeof value === 'string') formData.projectInfo.researchField = value;
      },
      "research_area": (value) => {
        if (typeof value === 'string') formData.projectInfo.researchField = value;
      }
    };
    
    // 应用替代字段映射
    Object.entries(alternativeFieldMappings).forEach(([field, applyFn]) => {
      try {
        if (apiJson[field] !== undefined) {
          applyFn(apiJson[field]);
        }
      } catch (fieldError) {
        console.warn(`⚠️ 处理字段 ${field} 时出错:`, fieldError);
      }
    });
    
    console.log('✅ 转换后的表单数据:', formData);
    return formData;
  } catch (error) {
    console.error('❌ 转换API JSON时出错:', error);
    // 出错时返回备用数据结构
    return {
      formTitle: "评审意见表 (数据恢复模式)",
      projectInfo: { ...reviewFormData.projectInfo },
      evaluationSections: [...reviewFormData.evaluationSections],
      textualEvaluations: [...reviewFormData.textualEvaluations]
    };
  }
}; 