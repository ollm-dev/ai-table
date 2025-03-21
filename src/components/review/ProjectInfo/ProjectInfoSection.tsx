import React from 'react';
import { ProjectInfoSectionProps } from '@/types/review/ProjectInfo/ProjectInfoSection';
import { EditIcon } from 'lucide-react';



export function ProjectInfoSection({
  projectInfo,
  aiRecommendationsAvailable,
  editingField,
  startEditing,
  stopEditing,
  handleProjectInfoChange
}: ProjectInfoSectionProps) {
  return (
    <div className="mb-16 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="inline-block w-2 h-10 bg-gradient-to-b from-primary-500 to-purple-600 rounded-full mr-6"></span>
          项目信息
        </h3>
      </div>
      
      <div className="relative p-8 rounded-3xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden bg-white">
        {/* 装饰性背景元素 */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-primary-100/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-purple-100/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <ProjectInfoField 
                label="项目名称"
                field="projectTitle"
                value={projectInfo.projectTitle}
                isEditing={editingField === 'projectTitle'}
                aiRecommendationsAvailable={aiRecommendationsAvailable}
                startEditing={startEditing}
                stopEditing={stopEditing}
                handleChange={handleProjectInfoChange}
              />
              <ProjectInfoField 
                label="项目类别"
                field="projectType"
                value={projectInfo.projectType}
                isEditing={editingField === 'projectType'}
                aiRecommendationsAvailable={aiRecommendationsAvailable}
                startEditing={startEditing}
                stopEditing={stopEditing}
                handleChange={handleProjectInfoChange}
              />
              <ProjectInfoField 
                label="研究领域"
                field="researchField"
                value={projectInfo.researchField}
                isEditing={editingField === 'researchField'}
                aiRecommendationsAvailable={aiRecommendationsAvailable}
                startEditing={startEditing}
                stopEditing={stopEditing}
                handleChange={handleProjectInfoChange}
              />
            </div>
            <div className="space-y-6">
              <ProjectInfoField 
                label="申请人姓名"
                field="applicantName"
                value={projectInfo.applicantName}
                isEditing={editingField === 'applicantName'}
                aiRecommendationsAvailable={aiRecommendationsAvailable}
                startEditing={startEditing}
                stopEditing={stopEditing}
                handleChange={handleProjectInfoChange}
              />
              <ProjectInfoField 
                label="申请代码"
                field="applicationId"
                value={projectInfo.applicationId}
                isEditing={editingField === 'applicationId'}
                aiRecommendationsAvailable={aiRecommendationsAvailable}
                startEditing={startEditing}
                stopEditing={stopEditing}
                handleChange={handleProjectInfoChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProjectInfoFieldProps {
  label: string;
  field: string;
  value: string;
  isEditing: boolean;
  aiRecommendationsAvailable: boolean;
  startEditing: (field: string) => void;
  stopEditing: () => void;
  handleChange: (field: string, value: string) => void;
}

function ProjectInfoField({
  label,
  field,
  value,
  isEditing,
  aiRecommendationsAvailable,
  startEditing,
  stopEditing,
  handleChange
}: ProjectInfoFieldProps) {
  // 处理输入框失焦事件
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    stopEditing();
  };

  // 处理键盘事件，按下Enter键时保存并退出编辑
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      stopEditing();
    }
  };

  return (
    <div 
      className={`group p-5 rounded-2xl transition-all duration-300 flex flex-col justify-center bg-gray-50/70 hover:bg-gray-50/90 border border-gray-100 shadow-sm hover:shadow ${aiRecommendationsAvailable ? 'cursor-pointer' : ''}`}
      onClick={() => aiRecommendationsAvailable && startEditing(field)}
    >
      <span className="text-sm text-gray-500 mb-2 font-medium">{label}</span>
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="font-medium text-gray-900 bg-white/90 backdrop-blur border border-primary-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors duration-300 text-base"
        />
      ) : (
        <div className="flex items-center justify-between">
          <span className={`font-medium text-lg text-gray-800 ${aiRecommendationsAvailable ? "group-hover:text-primary-600" : ""} transition-colors duration-300`}>
            {value || (aiRecommendationsAvailable ? "加载中..." : "暂无数据")}
          </span>
          {aiRecommendationsAvailable && (
            <span className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <EditIcon className="h-4 w-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}