'use client';

/**
 * Toast组件，使用sonner实现toast通知功能
 */
import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner';

// 导出基础Toaster组件用于应用布局
export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #eee',
          borderRadius: '0.5rem',
        },
        className: 'shadow-lg',
      }}
    />
  );
}

// 导出toast函数
export const toast = sonnerToast; 