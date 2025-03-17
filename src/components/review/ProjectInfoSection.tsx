import React from 'react';

interface ProjectInfoSectionProps {
  projectInfo: {
    projectTitle: string;
    projectType: string;
    researchField: string;
    applicantName: string;
    applicationId: string;
  };
  aiRecommendationsAvailable: boolean;
  editingField: string | null;
  startEditing: (field: string) => void;
  stopEditing: () => void;
  handleProjectInfoChange: (field: string, value: string) => void;
}

export function ProjectInfoSection({
  projectInfo,
  aiRecommendationsAvailable,
  editingField,
  startEditing,
  stopEditing,
  handleProjectInfoChange
}: ProjectInfoSectionProps) {
  return (
    <div className="mb-12">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
        <span className="inline-block w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-4"></span>
        个人信息
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500">
        
        <div className="space-y-5">
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
        <div className="space-y-5">
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
      className="glass-morphism p-4 rounded-xl transition-colors duration-300 h-[72px] flex flex-col justify-center"
      onClick={() => aiRecommendationsAvailable && startEditing(field)}
    >
      <span className="text-sm text-gray-500 mb-1 font-medium">{label}</span>
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="font-medium text-gray-900 bg-white/50 backdrop-blur border border-primary-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-colors duration-300"
        />
      ) : (
        <div className="flex items-center justify-between">
          <span className={`font-medium text-gray-800 ${aiRecommendationsAvailable ? "hover:text-primary-600" : ""} transition-colors duration-300`}>
            {value || (aiRecommendationsAvailable ? "加载中..." : "")}
          </span>
          {aiRecommendationsAvailable && (
            <span className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </span>
          )}
        </div>
      )}
    </div>
  );
} 