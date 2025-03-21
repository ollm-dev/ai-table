# 分析日志模块 (Analysis Logs Module)

这个模块是负责处理论文评审系统中分析日志和评审数据的核心功能模块。原本是一个较大的文件 (`useAnalysisLogs.ts`)，现在已拆分为多个小模块，便于维护和开发。

## 文件结构

- `index.ts` - 主入口文件，导出 `useAnalysisLogs` 钩子
- `types.ts` - 类型定义和常量
- `utils.ts` - 工具函数，如对象比较、HTML清理、数据转换等
- `formData.ts` - 表单数据处理相关函数
- `apiRequest.ts` - API请求和响应处理相关函数
- `logHandlers.ts` - 日志处理相关函数

## 功能概述

这个模块主要提供以下功能：

1. 与后端API交互，发送评审请求和接收流式响应
2. 处理和解析后端返回的各种类型的消息（进度、推理、内容、JSON结构等）
3. 管理表单数据的初始化、更新和重置
4. 记录分析过程中的各种日志
5. 将后端返回的数据转换为前端表单数据格式

## 使用方式

```tsx
import { useAnalysisLogs } from '../hooks/useAnalysisLogs';

function ReviewComponent() {
  const {
    analysisLogs,
    isAnalyzing,
    progress,
    statusMessage,
    error,
    formData,
    startAnalysisWithBackend,
    // 其他属性和方法...
  } = useAnalysisLogs();

  // 使用这些属性和方法...
}
```

## 开发说明

- 所有与后端API交互的逻辑都在 `apiRequest.ts` 中
- 所有表单数据处理的逻辑都在 `formData.ts` 中
- 通用工具函数在 `utils.ts` 中
- 类型定义在 `types.ts` 中
- 日志相关处理在 `logHandlers.ts` 中

当需要修改或扩展功能时，请在对应的模块中进行，以保持代码的清晰和模块化。 