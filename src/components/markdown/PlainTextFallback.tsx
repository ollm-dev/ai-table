import React from 'react';

interface PlainTextFallbackProps {
  content: string;
}

const PlainTextFallback: React.FC<PlainTextFallbackProps> = ({ content }) => {
  // 简单的HTML转义函数
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return (
    <div className="plain-text-fallback">
      <div className="fallback-notice p-2 mb-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
        Markdown 内容无法正确渲染，显示原始文本
      </div>
      <pre className="p-4 bg-gray-50 border border-gray-200 rounded overflow-x-auto whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
};

export default PlainTextFallback; 