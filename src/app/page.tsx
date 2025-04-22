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
    <main className="flex-1 py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24 text-center relative">
          {/* 装饰元素 */}
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-60 h-60">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl opacity-70"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-70 animate-gentle-fade-in" style={{ animationDelay: '0.3s' }}></div>
          </div>
          
          <h1 className="elegant-title text-6xl mb-8 animate-gentle-slide-up">
              Project Review System
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-gentle-fade-in tracking-wide" style={{ animationDelay: '0.2s' }}>
            DeepInsight Intelligent Project Review Platform · An AI-based Intelligent Evaluation Tool for Scientific Research Projects
          </p>
          
          {/* 装饰分割线 */}
          <div className="relative mt-12 animate-gentle-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="elegant-divider max-w-xs mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border border-gray-100 shadow-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        <ReviewForm data={reviewFormData} />
      </div>
    </main>
  );
}
