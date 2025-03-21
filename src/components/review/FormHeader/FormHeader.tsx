import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, UploadIcon, XIcon } from "lucide-react";
import { FormHeaderProps } from "@/types/review/FormHeader";



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
    <CardHeader className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 py-12 px-14 relative overflow-hidden">
      {/* 装饰性背景元素 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-100/10 to-purple-100/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary-100/10 to-blue-100/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 relative z-10">
        <div className="animate-fadeIn">
          <CardTitle className="text-4xl font-bold text-gray-900 tracking-tight flex items-center">
            <span className="inline-block w-2 h-10 bg-gradient-to-b from-primary-500 to-purple-600 rounded-full mr-5"></span>
            <span className="gradient-text">{formTitle}</span>
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
              className="flex items-center border-primary-200 text-primary-600 hover:bg-primary-50 transition-all duration-300 rounded-full shadow-sm hover:shadow-md px-8 py-6 h-auto text-base group"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon className="h-5 w-5 mr-3 group-hover:animate-bounce-subtle" />
              上传PDF文件
            </Button>
          ) : (
            <div className="flex items-center bg-white/80 px-6 py-3 rounded-full border border-primary-200 shadow-sm backdrop-blur-sm">
              <div className="bg-primary-50 p-2 rounded-full mr-3">
                <FileIcon className="h-5 w-5 text-primary-500" />
              </div>
              <span className="text-base text-gray-700 max-w-[200px] truncate font-medium">{pdfFile.name}</span>
              <div className="flex ml-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                  onClick={handleRemovePdf}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="ml-3 h-9 px-5 text-sm rounded-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={handleUploadPdf}
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      上传中...
                    </span>
                  ) : '确认上传'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 显示上传错误信息 */}
      {uploadError && (
        <div className="mt-6 text-sm text-red-500 bg-red-50/50 backdrop-blur-sm p-4 rounded-xl border border-red-100 animate-fadeIn">
          <span className="font-medium">错误：</span>{uploadError}
        </div>
      )}
    </CardHeader>
  );
} 