import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "项目评审系统",
  description: "DeepInsight 智能项目评审平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen`}>
        {/* 背景装饰 - 减弱效果 */}
        <div className="fixed inset-0 -z-10 bg-[#f8fafc] overflow-hidden">
          {/* 顶部渐变光晕 - 减弱效果 */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-b from-primary-100/20 to-transparent rounded-full blur-3xl opacity-40"></div>
          <div className="absolute -top-20 left-1/4 w-[300px] h-[300px] bg-gradient-to-b from-purple-100/10 to-transparent rounded-full blur-3xl opacity-40"></div>
          
          {/* 底部渐变光晕 - 减弱效果 */}
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-t from-primary-100/20 to-transparent rounded-full blur-3xl opacity-40"></div>
          <div className="absolute -bottom-20 right-1/4 w-[300px] h-[300px] bg-gradient-to-t from-blue-100/10 to-transparent rounded-full blur-3xl opacity-40"></div>
          
          {/* 网格背景 - 减弱效果 */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.01]"></div>
        </div>
        
        <div className="min-h-screen flex flex-col relative z-0">
          {children}
          
          {/* 页脚 */}
          <footer className="mt-auto py-6 text-center text-gray-500 text-sm font-medium">
            <p>© {new Date().getFullYear()} DeepInsight 智能项目评审平台</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
