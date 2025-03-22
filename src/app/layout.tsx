import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClickToReactInitializer } from "@/components/ClickToReactInitializer";

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
      <body className={`${inter.className} min-h-screen elegant-background`}>
        <ClickToReactInitializer />
        {/* 背景装饰 */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* 顶部光晕 */}
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-b from-indigo-50/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-gradient-to-b from-purple-50/20 to-transparent rounded-full blur-3xl"></div>
          
          {/* 底部光晕 */}
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-t from-blue-50/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-gradient-to-t from-indigo-50/20 to-transparent rounded-full blur-3xl"></div>
          
          {/* 网格背景 */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at center, rgba(99, 102, 241, 0.01) 0%, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="min-h-screen flex flex-col relative z-0">
          {children}
          
          {/* 页脚 */}
          <footer className="mt-auto py-8 text-center">
            <div className="elegant-divider max-w-2xl mx-auto mb-6"></div>
            <p className="text-gray-500 text-sm font-medium tracking-wide">
              © {new Date().getFullYear()} DeepInsight 智能项目评审平台
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
