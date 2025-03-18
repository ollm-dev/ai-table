import React from 'react';

export function FormStyles() {
  return (
    <style jsx global>{`
      .glass-morphism {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.4s ease-out forwards;
      }
      
      .animate-slideInUp {
        animation: slideInUp 0.6s ease-out forwards;
      }
      
      // /* 渐变文本效果 */
      // .gradient-text {
      //   background: linear-gradient(to right, #3b82f6, #8b5cf6);
      //   -webkit-background-clip: text;
      //   background-clip: text;
      //   color: transparent;
      //   font-weight: bold;
      //   display: inline-block;
      // }
      
      // /* 终端背景效果 */
      // .terminal-bg {
      //   background-color: rgba(249, 250, 251, 0.9);
      //   background-image: 
      //     radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
      //     radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px);
      //   background-size: 20px 20px;
      //   background-position: 0 0, 10px 10px;
      //   border: 1px solid rgba(229, 231, 235, 0.5);
      // }
      
      // /* 打字机效果样式 */
      // .typing-effect {
      //   position: relative;
      // }
      
      // .typing-effect::after {
      //   content: '|';
      //   position: absolute;
      //   right: -4px;
      //   animation: blink 1s infinite;
      //   font-weight: bold;
      // }
      
      // /* 流式内容样式 */
      // .stream-content {
      //   display: inline-block;
      //   line-height: 1.6;
      //   text-align: justify;
      //   white-space: pre-wrap;
      //   word-wrap: break-word;
      // }
      
      // .stream-log {
      //   margin-bottom: 0.75rem;
      //   padding: 0.75rem;
      //   border-radius: 0.5rem;
      //   background-color: rgba(249, 250, 251, 0.8);
      //   border-left: 4px solid transparent;
      //   transition: all 0.2s ease;
      // }
      
      // .stream-log.progress {
      //   border-left-color: #3b82f6;
      // }
      
      // .stream-log.reasoning {
      //   border-left-color: #8b5cf6;
      // }
      
      // .stream-log.content {
      //   border-left-color: #10b981;
      // }
      
      // .stream-log.error {
      //   border-left-color: #ef4444;
      //   background-color: rgba(254, 242, 242, 0.8);
      // }
      
      // .stream-log.complete {
      //   border-left-color: #059669;
      //   background-color: rgba(236, 253, 245, 0.8);
      // }
      
      // .stream-log.init {
      //   border-left-color: #6366f1;
      // }
      
      // .stream-log:hover {
      //   background-color: rgba(243, 244, 246, 0.8);
      //   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      // }
      
      // /* 最后一条日志的打字效果 */
      // .terminal-text > div:last-child .typing-effect::after {
      //   display: inline-block;
      // }
      
      // /* 非最后一条日志的打字效果 */
      // .terminal-text > div:not(:last-child) .typing-effect::after {
      //   display: none;
      // }
      
      // #log-container::-webkit-scrollbar {
      //   width: 4px;
      // }
      
      // #log-container::-webkit-scrollbar-track {
      //   background: rgba(241, 245, 249, 0.5);
      //   border-radius: 2px;
      // }
      
      // #log-container::-webkit-scrollbar-thumb {
      //   background-color: rgba(203, 213, 225, 0.5);
      //   border-radius: 2px;
      // }
      
      // #log-container::-webkit-scrollbar-thumb:hover {
      //   background-color: rgba(203, 213, 225, 0.8);
      }
    `}</style>
  );
} 