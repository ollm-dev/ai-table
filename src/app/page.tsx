/**
 * 项目评审表格页面
 * @module ReviewPage
 */
import { reviewFormData } from "@/data/reviewFormData";
import ReviewForm from "@/components/ReviewForm";

/**
 * 项目评审页面组件
 * @returns {JSX.Element} 渲染的页面
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">项目评审系统</h1>
        <p className="text-center text-gray-500 mb-10">国家自然科学基金项目通讯评审</p>
        <ReviewForm data={reviewFormData} />
      </div>
    </main>
  );
}
