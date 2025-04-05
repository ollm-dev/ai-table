# 根据ai_reviewer 动态渲染

### 1. 项目概述

这是一个基于 Next.js 的论文评审系统前端项目，主要功能是上传论文并获取 AI 评审意见。

### 2. 主要组件和功能

#### 核心 Hook: useAnalysisLogs

```typescript
// 主要状态管理：
- analysisLogs: 分析日志记录
- isAnalyzing: 是否正在分析中
- progress: 进度
- statusMessage: 状态消息
- formData: 表单数据
```

#### ReviewForm 组件

```typescript
// 主要功能：
- 处理表单状态管理
- 集成 AI 评审功能
- 处理用户输入
```

### 3. 样式设计

在 `globals.css` 中定义了丰富的自定义样式：

- 动画效果（slideInUp, fadeIn, bounce-subtle）
- 终端风格样式
- 玻璃态效果
- 自定义滚动条
- 响应式设计

### 4. 后端 API 集成

系统集成了两个主要的后端 API：

```typescript
1. 文件上传 API (/upload)
2. 论文评审 API (/review) - 支持流式响应
```

### 5. 数据流处理

系统实现了完整的 SSE（Server-Sent Events）处理流程：

```typescript
- 支持实时数据流解析
- 处理多种消息类型：progress, reasoning, content, complete
- 错误处理机制
```

### 6. 项目特点

1. 使用 TypeScript 确保类型安全
2. 采用 Tailwind CSS 进行样式管理
3. 实现了流式响应处理
4. 包含完整的错误处理机制
5. 支持实时进度显示和状态更新

这个项目的架构设计清晰，代码组织良好，特别是在处理实时数据流和用户交互方面做得很完善。

### 7. 环境配置

项目支持本地开发和生产环境两种模式的 API 配置：

```typescript
// API 环境配置
1. 默认情况下：
   - 开发环境使用 http://localhost:5555 作为 API 基础地址
   - 生产环境使用 https://api-reviewer.arxivs.com 作为 API 基础地址

2. 自定义 API 地址：
   - 创建 .env.local 文件（基于 .env.example）
   - 设置 NEXT_PUBLIC_API_BASE_URL 环境变量
```

配置步骤：

1. 复制 `.env.example` 为 `.env.local`
2. 根据需要修改 `.env.local` 中的配置
3. 重启开发服务器应用配置

## Deploy

```shell
ssh root@180.76.103.165 -p 6600

tmux attach -t reviewer-web

cd /root/project/ai-table

git pull

# 如果有依赖更新
pnpm install

pnpm build
pnpm start
```
