import React from 'react';

export interface FormHeaderProps {
  formTitle: string;
  pdfFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemovePdf: () => void;
  handleUploadPdf: () => void;
  uploadError: string | null;
  uploadSuccess: boolean;
  uploadStatusText?: string;
  waitingForAnalysis?: boolean;
}

