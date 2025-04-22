import { useState, useRef } from 'react';
// Import API URL configuration
import { getUploadUrl } from '../lib/config';
// Import toast
import { toast } from '@/components/ui/toast';

/**
 * File upload hook, handles PDF file selection, validation, and upload
 * @param {function} onAnalysisStart - Callback function when analysis starts
 * @param {function} addAnalysisLog - Function to add analysis logs
 * @returns {object} Upload status and control methods
 */
export function useFileUpload(onAnalysisStart: (filePath: string) => Promise<void>, addAnalysisLog: (content: string, type?: string) => void) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string>(''); // For displaying status text (transition states)
  const [waitingForAnalysis, setWaitingForAnalysis] = useState(false); // Waiting for analysis state
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  /**
   * Handle PDF file selection
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadError(null);
    setUploadSuccess(false); // Reset upload success state
    setUploadStatusText(''); // Reset status text
    setWaitingForAnalysis(false); // Reset waiting for analysis state
    
    if (!file) {
      return;
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported');
      toast.error('Only PDF files are supported', {
        id: 'file-type-error',
        duration: 3000
      });
      return;
    }
    
    // Validate file size (limited to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size cannot exceed 10MB');
      toast.error('File size cannot exceed 10MB', {
        id: 'file-size-error',
        duration: 3000
      });
      return;
    }
    
    setPdfFile(file);
  };
  
  /**
   * Handle PDF file upload
   */
  const handleUploadPdf = async (onResetAI: () => void) => {
    if (!pdfFile) {
      setUploadError('Please select a PDF file first');
      toast.error('Please select a PDF file first', {
        id: 'no-file-error',
        duration: 2000
      });
      return;
    }
    
    try {
      setUploading(true);
      setUploadError(null);
      setUploadStatusText('Uploading file...'); // Set initial upload status text
     
      // Reset AI suggestion state
      onResetAI();
      
      // Create FormData object
      const formData = new FormData();
      formData.append('file', pdfFile);
      
      // Add detailed logs
      console.log('📤 Uploading PDF to backend API:', {
        fileName: pdfFile.name,
        fileSize: `${(pdfFile.size / 1024).toFixed(2)} KB`,
        fileType: pdfFile.type
      });
      
      // Get and log API URL
      const uploadUrl = getUploadUrl();
      console.log('🔗 Upload API URL:', uploadUrl);
      
      addAnalysisLog(`Starting file upload: ${pdfFile.name}`, "upload-start");
      
      // Use fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Clear timeout
      
      console.log('📡 Response status:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        // Check if it's a validation error (422)
        if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${errorData.detail || 'Invalid file format'}`);
        }
        
        // Try to parse error response
        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        try {
          const errorBody = await response.text();
          console.error('📋 Error response content:', errorBody);
          
          // Try to parse as JSON
          try {
            const errorJson = JSON.parse(errorBody);
            if (errorJson.detail) {
              errorMessage = `Upload failed: ${errorJson.detail}`;
            }
          } catch (jsonError) {
            // If not JSON, use text content directly
            if (errorBody && errorBody.length < 500) { // Avoid too long error messages
              errorMessage = `Upload failed: ${errorBody}`;
            }
          }
        } catch (textError) {
          console.error('Unable to read error response content', textError);
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse response
      const result = await response.json();
      console.log('✅ Upload successful, server returned:', result);
      
      // Show upload success toast notification
      toast.success(`File "${result.file_name || pdfFile.name}" uploaded successfully!`, {
        id: 'upload-success',
        duration: 3000,
        icon: '🎉'
      });
      
      addAnalysisLog(`File upload successful: ${result.file_name || pdfFile.name}`, "upload-success");
      setUploadSuccess(true);
      // Only briefly show upload status text, then clear
      setUploadStatusText('File uploaded successfully, preparing to start analysis...'); 
      // Clear status text after 3 seconds
      setTimeout(() => {
        setUploadStatusText('');
      }, 3000);
      
      // Set waiting state before starting analysis
      setWaitingForAnalysis(true);
      
      // Start analysis
      if (result.file_path) {
        // Call analysis API with returned file path
        await onAnalysisStart(result.file_path);
        // Reset waiting state after analysis starts
        setWaitingForAnalysis(false);
      } else {
        throw new Error('Server did not return file path');
      }
      
    } catch (error) {
      console.error('❌ Error uploading PDF:', error);
      const errorMessage = `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      // Add more specific error information
      if (error instanceof DOMException && error.name === 'AbortError') {
        setUploadError('Upload timeout, please try again later or check server status');
        setUploadStatusText('Upload timeout'); // Update status text
        
        // Show upload timeout toast notification
        toast.error('Upload timeout, please try again later', {
          id: 'upload-timeout',
          duration: 4000
        });
        
        addAnalysisLog('Upload timeout, please try again later or check server status', "error");
      } else {
        setUploadError(errorMessage);
        setUploadStatusText('Upload failed'); // Update status text
        
        // Show upload failed toast notification
        toast.error(errorMessage, {
          id: 'upload-error',
          duration: 4000
        });
        
        addAnalysisLog(errorMessage, "error");
      }
      
      // Reset upload success state and waiting for analysis state
      setUploadSuccess(false);
      setWaitingForAnalysis(false);
      
      // Clear status text after 3 seconds
      setTimeout(() => {
        setUploadStatusText('');
      }, 3000);
    } finally {
      setUploading(false);
      // Note: Do not reset uploadSuccess here, let it persist until analysis is complete
    }
  };
  
  /**
   * Remove selected PDF file
   */
  const handleRemovePdf = () => {
    setPdfFile(null);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadStatusText('');
    setWaitingForAnalysis(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return {
    pdfFile,
    uploading,
    uploadError,
    uploadSuccess,
    uploadStatusText, // Export status text
    waitingForAnalysis, // Export waiting for analysis state
    fileInputRef,
    handleFileChange,
    handleUploadPdf,
    handleRemovePdf
  };
} 