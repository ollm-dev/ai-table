import React from 'react';
import { ProjectInfoSectionProps } from '@/types/review/ProjectInfo/ProjectInfoSection';

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
          Project Information
        </h3>
      </div>
      
      <div className="relative p-8 rounded-3xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden bg-white">
        {/* Decorative background elements */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-primary-100/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-purple-100/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <ProjectInfoField 
                label="Project Name"
                value={projectInfo.projectTitle}
              />
              <ProjectInfoField 
                label="Project Category"
                value={projectInfo.projectType}
              />
              <ProjectInfoField 
                label="Research Field"
                value={projectInfo.researchField}
              />
            </div>
            <div className="space-y-6">
              <ProjectInfoField 
                label="Applicant Name"
                value={projectInfo.applicantName}
              />
              <ProjectInfoField 
                label="Application ID"
                value={projectInfo.applicationId}
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
  value: string;
}

function ProjectInfoField({
  label,
  value
}: ProjectInfoFieldProps) {
  return (
    <div className="group p-5 rounded-2xl transition-all duration-300 flex flex-col justify-center bg-gray-50/70 hover:bg-gray-50/90 border border-gray-100 shadow-sm hover:shadow">
      <span className="text-sm text-gray-500 mb-2 font-medium">{label}</span>
      <div className="flex items-center justify-between">
        <span className="font-medium text-lg text-gray-800 transition-colors duration-300">
          {value || "No data available"}
        </span>
      </div>
    </div>
  );
}