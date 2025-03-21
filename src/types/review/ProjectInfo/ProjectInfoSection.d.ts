import React from 'react';

export interface ProjectInfoSectionProps {
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
