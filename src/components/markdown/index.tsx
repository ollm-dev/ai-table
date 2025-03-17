"use client";

import "highlight.js/styles/atom-one-dark.min.css";
import "./markdown.css";

import MarkdownIt from "markdown-it";
import React, { useMemo } from "react";
import hljs from "highlight.js";

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

export default function Markdown({ content }: { content: string }) {
  // 使用 useMemo 缓存预处理结果，避免不必要的重复计算
  const processedContent = useMemo(() => preprocessMarkdown(content), [content]);
  
  // 使用 useMemo 缓存 markdown-it 实例和渲染结果
  const renderedMarkdown = useMemo(() => {
    try {
      const md: MarkdownIt = new MarkdownIt({
        highlight: function (str: string, lang: string) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return `<pre class="hljs"><code>${
                hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
              }</code></pre>`;
            } catch (_) {}
          }
    
          return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
        },
        html: false, // 禁用HTML以提高安全性
        breaks: true, // 允许换行符转换为 <br>
        linkify: true, // 自动将URL转换为链接
      });
      
      return md.render(processedContent);
    } catch (error) {
      console.error("Markdown 渲染错误:", error);
      // 发生错误时返回简单的转义文本
      return `<pre>${escapeHtml(processedContent)}</pre>`;
    }
  }, [processedContent]);

  // 简单的HTML转义函数
  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return (
    <div
      className="max-w-full overflow-x-auto markdown"
      dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
    />
  );
}
