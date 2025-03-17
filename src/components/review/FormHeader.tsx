import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, UploadIcon, XIcon } from "lucide-react";

interface FormHeaderProps {
  formTitle: string;
  pdfFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemovePdf: () => void;
  handleUploadPdf: () => void;
  uploading: boolean;
  uploadError: string | null;
}

export function FormHeader({
  formTitle,
  pdfFile,
  fileInputRef,
  handleFileChange,
  handleRemovePdf,
  handleUploadPdf,
  uploading,
  uploadError
}: FormHeaderProps) {
  return (
    <CardHeader className="bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 border-b border-primary-100 py-8">
      <div className="flex justify-between items-center">
        <div className="animate-fadeIn">
          <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">
            <span className="inline-block w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-4 align-middle"></span>
            {formTitle}
          </CardTitle>
        </div>
        
        {/* PDF上传功能 */}
        <div className="flex items-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            id="pdf-upload"
          />
          
          {!pdfFile ? (
            <Button
              type="button"
              variant="outline"
              className="flex items-center border-primary-200 text-primary-600 hover:bg-primary-50 transition-all duration-300 rounded-full shadow-sm hover:shadow px-6"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              上传PDF文件
            </Button>
          ) : (
            <div className="flex items-center bg-white/80 px-5 py-2.5 rounded-full border border-primary-200 shadow-sm">
              <FileIcon className="h-4 w-4 text-primary-500 mr-2" />
              <span className="text-sm text-gray-700 max-w-[150px] truncate">{pdfFile.name}</span>
              <div className="flex ml-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 rounded-full"
                  onClick={handleRemovePdf}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="ml-2 h-7 text-xs rounded-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={handleUploadPdf}
                  disabled={uploading}
                >
                  {uploading ? '上传中...' : '确认上传'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 显示上传错误信息 */}
      {uploadError && (
        <div className="mt-4 text-sm text-red-500 bg-red-50/50 backdrop-blur-sm p-3 rounded-xl border border-red-100 animate-fadeIn">
          <span className="font-medium">错误：</span>{uploadError}
        </div>
      )}
    </CardHeader>
  );
} 