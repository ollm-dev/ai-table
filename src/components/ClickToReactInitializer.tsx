'use client';

import { useEffect, useState } from 'react';

/**
 * 初始化 click-to-react-component 组件
 * 该组件在开发环境中允许通过Alt+点击打开组件源代码
 * @returns {JSX.Element|null} 渲染ClickToComponent组件或null
 */
export function ClickToReactInitializer() {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('click-to-react-component')
        .then(module => {
          setComponent(() => module.ClickToComponent);
        })
        .catch(err => console.error('Failed to load ClickToComponent:', err));
    }
  }, []);
  
  if (!Component) return null;
  
  return <Component editor="cursor" />;
} 