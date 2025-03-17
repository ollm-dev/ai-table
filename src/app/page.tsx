/**
 * 项目评审表格页面
 * @module ReviewPage
 */
import { reviewFormData } from "@/data/reviewFormData";
import ReviewForm from "@/app/ReviewForm";

/**
 * 项目评审页面组件
 * @returns {JSX.Element} 渲染的页面
 */
export default function Home() {
  return (
    <main className="flex-1 py-20 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center relative">
          {/* 装饰元素 */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-primary-100/30 to-purple-100/30 rounded-full blur-3xl -z-10"></div>
          
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 animate-fadeIn">
            项目评审系统
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            DeepInsight 智能项目评审平台 · 基于AI的科研项目智能评估工具
          </p>
          
          {/* 装饰线条 */}
          <div className="w-24 h-1 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full mx-auto mt-8 animate-fadeIn" style={{ animationDelay: '0.3s' }}></div>
        </div>
        
        <ReviewForm data={reviewFormData} />
      </div>
    </main>
  );
}
