/**
 * 日志处理相关函数
 */

import { sanitizeHtml } from './utils';
import { AnalysisLogEntry } from './types';

/**
 * 添加分析日志
 * @param content 日志内容
 * @param type 日志类型
 * @param setAnalysisLogs 设置分析日志函数
 */
export const addAnalysisLog = (
  content: string,
  type: string = "normal",
  setAnalysisLogs: React.Dispatch<React.SetStateAction<AnalysisLogEntry[]>>
) => {
  // 清理内容中的HTML标签
  const sanitizedContent = sanitizeHtml(content);
  setAnalysisLogs(prev => [...prev, { time: new Date().toISOString(), content: sanitizedContent, type }]);
};

/**
 * 更新特定类型的日志内容
 * @param type 日志类型
 * @param content 日志内容
 * @param append 是否追加内容
 * @param setAnalysisLogs 设置分析日志函数
 */
export const updateLogContent = (
  type: string,
  content: string,
  append: boolean = false,
  setAnalysisLogs: React.Dispatch<React.SetStateAction<AnalysisLogEntry[]>>
) => {
  // 清理内容中的HTML标签
  const sanitizedContent = sanitizeHtml(content);
  setAnalysisLogs(prev => {
    const index = prev.findIndex(log => log.type === type);
    if (index === -1) {
      // 如果不存在该类型的日志，创建新的
      return [...prev, { time: new Date().toISOString(), content: sanitizedContent, type }];
    } else {
      // 如果存在，更新或追加内容
      const newLogs = [...prev];
      newLogs[index] = {
        ...newLogs[index],
        content: append ? sanitizeHtml(newLogs[index].content + content) : sanitizedContent
      };
      return newLogs;
    }
  });
}; 