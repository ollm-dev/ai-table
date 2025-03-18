"use client";

import "highlight.js/styles/github.min.css";
import "./markdown.css";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import hljs from "highlight.js";

// 注册更多语言支持
import "highlight.js/lib/languages/python";
import "highlight.js/lib/languages/javascript";
import "highlight.js/lib/languages/typescript";
import "highlight.js/lib/languages/json";
import "highlight.js/lib/languages/bash";
import "highlight.js/lib/languages/markdown";
import "highlight.js/lib/languages/css";
import "highlight.js/lib/languages/xml";
import "highlight.js/lib/languages/sql";

// 预处理函数：清理和规范化 Markdown 内容
function preprocessMarkdown(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // 1. 修复可能破坏结构的特殊字符
  let processed = content
    // 处理不配对的代码块标记
    .replace(/```(?!\s*\w+|\s*$)/g, '```text')
    // 确保代码块正确关闭
    .replace(/```\s*\w+\s*\n([\s\S]*?)(?!```)/g, (match, codeContent) => {
      return match.endsWith('```') ? match : `${match}\n\`\`\``;
    })
    // 处理不配对的行内代码
    .replace(/(`[^`]*$)/g, '$1`')
    // 处理HTML标签，将尖括号转义
    .replace(/(<)(?![a-zA-Z\/])/g, '&lt;')
    .replace(/(?<![a-zA-Z\/])>/g, '&gt;')
    // 修复表格格式
    .replace(/\|[\s\-]*\n(?!\|)/g, (match) => {
      return match + '|\n';
    });

  // 2. 规范化标题格式（确保#后有空格）
  processed = processed.replace(/^(#{1,6})([^\s#])/gm, '$1 $2');

  // 3. 修复列表格式问题
  processed = processed.replace(/^(\s*)[*+-]([^\s])/gm, '$1$2 ');

  // 4. 处理可能导致问题的URL
  processed = processed.replace(/\]\(([^)]*)\)/g, (match, url) => {
    // 转义URL中的特殊字符
    const safeUrl = url.replace(/[<>"']/g, (c: string) => {
      return {
        '<': '%3C',
        '>': '%3E',
        '"': '%22',
        "'": '%27'
      }[c] || c;
    });
    return `](${safeUrl})`;
  });

  // 5. 确保图片链接格式正确
  processed = processed.replace(/!\[(.*?)\]\s*\((.*?)\)/g, '![$1]($2)');

  return processed;
}

// 添加行号到代码块
function addLineNumbers(html: string): string {
  const codeBlocks = html.match(/<pre class="hljs"><code>([\s\S]*?)<\/code><\/pre>/g);
  
  if (!codeBlocks) return html;
  
  let result = html;
  
  codeBlocks.forEach(block => {
    const code = block.replace(/<pre class="hljs"><code>([\s\S]*?)<\/code><\/pre>/, '$1');
    const lines = code.split('\n');
    
    let numberedCode = '<pre class="hljs code-with-line-numbers"><code>';
    lines.forEach((line, index) => {
      if (index === lines.length - 1 && line.trim() === '') return;
      numberedCode += `<div class="code-line"><span class="line-number">${index + 1}</span>${line}</div>`;
    });
    numberedCode += '</code></pre>';
    
    result = result.replace(block, numberedCode);
  });
  
  return result;
}

interface MarkdownProps {
  content: string;
}

const Markdown = React.memo(({ content }: MarkdownProps) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-0">{children}</p>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

Markdown.displayName = 'Markdown';

export default Markdown;
