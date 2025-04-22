/**
 * API Request Processing Module
 */

import { getReviewUrl } from '../../lib/config';
import { ReviewRequestParams } from './types';
import { sanitizeHtml, transformApiJsonToFormData } from './utils';
// Import mock analysis process function
import { simulateAnalysisProcess } from './mockAnalysis';
import { jsonrepair } from 'jsonrepair';
import { extractJsonFromCodeBlock } from './utils';

/**
 * Process API response stream
 * @param reader Response stream reader
 * @param setProgress Progress setting function
 * @param setStatusMessage Status message setting function
 * @param setReasoningText Reasoning text setting function
 * @param setJsonStructure JSON structure setting function
 * @param setFinalContent Final content setting function
 * @param setError Error setting function
 * @param updateLogContent Log content update function
 * @param addAnalysisLog Analysis log adding function
 * @param updateFormData Form data update function
 * @param setJsonCompleteStatus JSON complete status setting function
 * @returns Processing completion Promise
 */
export const processStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  setProgress: (value: React.SetStateAction<number>) => void,
  setStatusMessage: (value: React.SetStateAction<string>) => void,
  setReasoningText: (value: React.SetStateAction<string>) => void,
  setJsonStructure: (value: React.SetStateAction<string>) => void,
  setFinalContent: (value: React.SetStateAction<string>) => void,
  setError: (value: React.SetStateAction<string | null>) => void,
  updateLogContent: (type: string, content: string, append?: boolean) => void,
  addAnalysisLog: (content: string, type?: string) => void,
  updateFormData: (jsonStructure: any, isPartial?: boolean, isComplete?: boolean) => void,
  setJsonCompleteStatus: (value: React.SetStateAction<boolean>) => void
): Promise<void> => {
  try {
    const { done, value } = await reader.read();
    
    if (done) {
      console.log('✅ Stream response ended');
      return;
    }
    
    // Decode binary data
    const decoder = new TextDecoder();
    const chunk = decoder.decode(value, { stream: true });
    console.log('📦 Raw data chunk:', chunk);
    
    let buffer = chunk;
    
    // Process SSE format data (data: ... followed by \n\n)
    const messages = buffer.split('\n\n');
    // Keep the last possibly incomplete message
    buffer = messages.pop() || '';
    
    for (const message of messages) {
      if (message.trim() === '') continue;
      
      if (message.startsWith('data: ')) {
        try {
          // Parse JSON data
          const jsonStr = message.slice(6).trim();
          console.log('🔍 SSE data:', jsonStr);
          
          const data = JSON.parse(jsonStr);
          console.log('📋 Parsed JSON:', data);
          
          // Handle different data types
          switch (data.type) {
            case 'progress':
              // Update progress
              console.log('⏳ Progress update:', data);
              setProgress(data.current / data.total * 100);
              setStatusMessage(data.message || `Processing page ${data.current}/${data.total}`);
              updateLogContent('progress', `Processing page ${data.current}/${data.total}`, false);
              break;
              
            case 'reasoning':
              // Update reasoning text
              if (data.reasoning) {
                console.log('🤔 Reasoning content:', data.reasoning);
                setReasoningText(prev => {
                  // Clean HTML tags
                  const sanitizedReasoning = sanitizeHtml(data.reasoning);
                  const newText = prev + sanitizedReasoning;
                  // Use function update method to ensure getting the latest text content
                  updateLogContent('reasoning', newText, false);
                  return newText;
                });
              }
              break;
              
            case 'content':
              // Update final content
              if (data.content) {
                console.log('📝 Review content:', data.content);
                setFinalContent(prev => {
                  // Clean HTML tags
                  const sanitizedContent = sanitizeHtml(data.content);
                  const newContent = prev + sanitizedContent;
                  // Use function update method to ensure getting the latest content
                  updateLogContent('content', newContent, false);
                  return newContent;
                });
              }
              break;
              
            case 'json_structure':
              // Process json_structure type message
              if (data.json_structure) {
                console.log('🔍 AI structure data:', data.json_structure);
                setJsonStructure(prev => {
                  // Clean HTML tags
                  const sanitizedJson = sanitizeHtml(data.json_structure);
                  const newJsonStructure = prev + sanitizedJson;
                  // Use function update method to ensure getting the latest text content
                  updateLogContent('json_structure', newJsonStructure, false);
                  
                  
                  return newJsonStructure;
                });
              }
              break;
              
            case 'json_complete':
              // Process json_complete type message - this is very important as it contains the complete paper evaluation result JSON
              if (data.json_complete) {
                console.log('✅ Received complete JSON structure:', data.json_complete);
                addAnalysisLog(`Received complete JSON structure`, "json_complete");
                // Set JSON complete status to true, indicating complete JSON has been received
                setJsonCompleteStatus(true);
                
                // Also update form data with complete flag
                if (typeof data.json_complete === 'object') {
                  updateFormData(data.json_complete, false, true);
                } else if (typeof data.json_complete === 'string' && data.json_complete.trim()) {
                  try {
                    let repairedJson = jsonrepair(data.json_complete);
                    const parsedJson = JSON.parse(repairedJson);
                    updateFormData(parsedJson, false, true);
                  } catch (jsonError) {
                    console.error('❌ Unable to parse complete JSON structure:', jsonError);
                    addAnalysisLog(`Unable to parse complete JSON structure: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`, "error");
                  }
                }
              }
              break;
              
             case 'error':
              // Handle error
              console.error('❌ Error message:', data.message);
              setError(data.message || 'Unknown error during processing');
              addAnalysisLog(data.message || 'Unknown error during processing', 'error');
              return;

            default:
              console.warn('⚠️ Unknown message type:', data);
              
              // Check if the original message contains ```json format code block
              const rawMessageJson = extractJsonFromCodeBlock(message.slice(6).trim());
              if (rawMessageJson) {
                console.log('🎯 Extracted JSON code block from original message:', rawMessageJson);
                addAnalysisLog('Extracted JSON code block from original message', 'json_extract');
                updateFormData(rawMessageJson, false, true);
                setJsonCompleteStatus(true);
                break;
              }
              
              // Try to detect if the data itself is a JSON structure (non-standard message)
              if (data.formTitle || data.projectInfo || data.evaluationSections || data.textualEvaluations) {
                console.log('🔍 Detected valid form data structure, attempting to update');
                // Default non-complete JSON
                updateFormData(data, false, false);
              } else if (typeof data === 'object' && Object.keys(data).length > 0) {
                // If it's an object with data, try to apply it even if it doesn't match the expected format
                console.log('🔍 Detected non-standard JSON object, attempting to apply as valid data');
                // Default non-complete JSON
                updateFormData(data, false, false);
                addAnalysisLog(`Applied non-standard format data`, "warning");
              } else {
                addAnalysisLog(`Received unknown type message: ${JSON.stringify(data)}`, "unknown");
              }
          }
        } catch (e) {
          console.error('❌ JSON parsing error:', {
            error: e,
            rawMessage: message
          });
          
          // Try to parse JSON structure from original message
          try {
            // Look for any possible JSON objects
            const jsonMatches = message.match(/{[^}]*}/g);
            if (jsonMatches && jsonMatches.length > 0) {
              // Try to parse each found JSON object
              for (const jsonStr of jsonMatches) {
                try {
                  console.log('🔍 Attempting to extract JSON from error message:', jsonStr);
                  const extractedData = JSON.parse(jsonStr);
                  
                  // Check if the extracted data is valid
                  if (extractedData && typeof extractedData === 'object' && Object.keys(extractedData).length > 0) {
                    console.log('🔄 Extraction successful, attempting to update form data');
                    // Data extracted from error message is by default non-complete JSON
                    updateFormData(extractedData, false, false);
                    addAnalysisLog(`Successfully extracted data from error message`, "success");
                    break; // Exit loop once valid data is found
                  }
                } catch (jsonParseError) {
                  console.warn('⚠️ Unable to parse this JSON fragment:', jsonParseError);
                  // Continue to the next match
                }
              }
            } else {
              // If no JSON objects found, try a more lenient method
              const startIndex = message.indexOf('{');
              const endIndex = message.lastIndexOf('}');
              if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                const jsonStr = message.substring(startIndex, endIndex + 1);
                console.log('🔍 Attempting to extract JSON from error message:', jsonStr);
                
                try {
                  const extractedData = JSON.parse(jsonStr);
                  // Check if the extracted data is valid
                  if (extractedData && typeof extractedData === 'object' && Object.keys(extractedData).length > 0) {
                    console.log('🔄 Extraction successful, attempting to update form data');
                    // Data extracted from error message is by default non-complete JSON
                    updateFormData(extractedData, false, false);
                    addAnalysisLog(`Successfully extracted data from error message`, "success");
                  }
                } catch (jsonParseError) {
                  // Try to fix possible JSON errors
                  try {
                    let fixedJsonStr = jsonStr.replace(/'/g, '"')
                      .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                      .replace(/,\s*([}\]])/g, '$1');
                    
                    const extractedData = JSON.parse(fixedJsonStr);
                    console.log('🔄 Parsing successful after fix, attempting to update form data');
                    // Fixed data is by default non-complete JSON
                    updateFormData(extractedData, false, false);
                    addAnalysisLog(`Successfully fixed and extracted data from error message`, "success");
                  } catch (fixError) {
                    console.error('❌ Unable to extract valid JSON from error message:', fixError);
                  }
                }
              }
            }
          } catch (extractError) {
            console.error('❌ Unable to extract JSON from error message:', extractError);
          }
          
          addAnalysisLog(`JSON parsing error: ${e instanceof Error ? e.message : 'Unknown error'}`, "error");
        }
      } else {
        console.log('⚠️ Non-SSE format data:', message);
        
        // Try to extract JSON structure from non-SSE message
        try {
          // Look for any possible JSON objects
          const jsonMatches = message.match(/{[^}]*}/g);
          if (jsonMatches && jsonMatches.length > 0) {
            // Try to parse each found JSON object, choose the one with the most keys
            let bestMatch = null;
            let maxKeys = 0;
            
            for (const jsonStr of jsonMatches) {
              try {
                const extractedData = JSON.parse(jsonStr);
                if (extractedData && typeof extractedData === 'object') {
                  const keyCount = Object.keys(extractedData).length;
                  if (keyCount > maxKeys) {
                    maxKeys = keyCount;
                    bestMatch = extractedData;
                  }
                }
              } catch (jsonParseError) {
                // Ignore parsing errors, continue to the next one
              }
            }
            
            if (bestMatch) {
              console.log('🔍 Extracted best JSON match from non-SSE message:', bestMatch);
              // Data extracted from non-SSE message is by default non-complete JSON
              updateFormData(bestMatch, false, false);
              addAnalysisLog(`Successfully extracted data from non-SSE message`, "success");
            }
          } else {
            // If no JSON objects found, try a more lenient method
            const startIndex = message.indexOf('{');
            const endIndex = message.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
              const jsonStr = message.substring(startIndex, endIndex + 1);
              console.log('🔍 Attempting to extract JSON from non-SSE message:', jsonStr);
              
              try {
                const extractedData = JSON.parse(jsonStr);
                // Check if the extracted data is valid
                if (extractedData && typeof extractedData === 'object' && Object.keys(extractedData).length > 0) {
                  console.log('🔄 Extraction successful, attempting to update form data');
                  // Data extracted from non-SSE message is by default non-complete JSON
                  updateFormData(extractedData, false, false);
                  addAnalysisLog(`Successfully extracted data from non-SSE message`, "success");
                }
              } catch (jsonParseError) {
                // Try to fix possible JSON errors
                try {
                  let fixedJsonStr = jsonStr.replace(/'/g, '"')
                    .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                    .replace(/,\s*([}\]])/g, '$1');
                  
                  const extractedData = JSON.parse(fixedJsonStr);
                  console.log('🔄 Parsing successful after fix, attempting to update form data');
                  // Fixed data is by default non-complete JSON
                  updateFormData(extractedData, false, false);
                  addAnalysisLog(`Successfully fixed and extracted data from non-SSE message`, "success");
                } catch (fixError) {
                  console.error('❌ Unable to extract valid JSON from non-SSE message:', fixError);
                }
              }
            }
          }
        } catch (extractError) {
          console.error('❌ Error while trying to extract JSON from non-SSE message:', extractError);
          addAnalysisLog(`Failed to extract data from non-SSE message: ${extractError instanceof Error ? extractError.message : 'Unknown error'}`, "error");
        }
      }
    }
    
    // Continue processing the stream
    return processStream(
      reader,
      setProgress,
      setStatusMessage,
      setReasoningText,
      setJsonStructure,
      setFinalContent,
      setError,
      updateLogContent,
      addAnalysisLog,
      updateFormData,
      setJsonCompleteStatus
    );
  } catch (streamError) {
    console.error('❌ Failed to read stream:', streamError);
    setError(`Connection interrupted: ${streamError instanceof Error ? streamError.message : 'Unknown error'}`);
    addAnalysisLog(`Connection interrupted: ${streamError instanceof Error ? streamError.message : 'Unknown error'}`, "error");
  }
};

/**
 * Start backend analysis process
 * @param filePath File path
 * @param setIsAnalyzing Analysis status setting function
 * @param setAnalysisLogs Analysis logs setting function
 * @param setIsWaitingForResponse Waiting for response status setting function
 * @param setProgress Progress setting function
 * @param setStatusMessage Status message setting function
 * @param setReasoningText Reasoning text setting function
 * @param setJsonStructure JSON structure setting function
 * @param setFinalContent Final content setting function
 * @param setError Error setting function
 * @param resetFormData Reset form data function
 * @param addAnalysisLog Analysis log adding function
 * @param updateLogContent Log content update function
 * @param updateFormData Form data update function
 * @param setJsonCompleteStatus JSON complete status setting function
 * @param useMockData Whether to use mock data
 * @returns Processing result boolean
 */
export const startAnalysisWithBackend = async (
  filePath: string,
  setIsAnalyzing: (value: React.SetStateAction<boolean>) => void,
  setAnalysisLogs: (value: React.SetStateAction<Array<{time: string, content: string, type: string}>>) => void,
  setIsWaitingForResponse: (value: React.SetStateAction<boolean>) => void,
  setProgress: (value: React.SetStateAction<number>) => void,
  setStatusMessage: (value: React.SetStateAction<string>) => void,
  setReasoningText: (value: React.SetStateAction<string>) => void,
  setJsonStructure: (value: React.SetStateAction<string>) => void,
  setFinalContent: (value: React.SetStateAction<string>) => void,
  setError: (value: React.SetStateAction<string | null>) => void,
  resetFormData: () => void,
  addAnalysisLog: (content: string, type?: string) => void,
  updateLogContent: (type: string, content: string, append?: boolean) => void,
  updateFormData: (jsonStructure: any, isPartial?: boolean, isComplete?: boolean) => void,
  setJsonCompleteStatus: (value: React.SetStateAction<boolean>) => void,
  useMockData: boolean = false
) => {
  try {
    // Reset all states
    setIsAnalyzing(true);
    setAnalysisLogs([]);
    setIsWaitingForResponse(true);
    setProgress(0);
    setStatusMessage('Preparing to start analysis...');
    setReasoningText('');
    setJsonStructure('');
    setFinalContent('');
    setError(null);
    setJsonCompleteStatus(false); // Reset JSON complete status
    
    // Reset form data
    resetFormData();
    
    // Add initialization log
    addAnalysisLog("Starting document analysis...", "init");
    
    // Check whether to use mock data
    // Only use mock data when explicitly specified
    if (useMockData) {
      console.log('🔧 Using mock data for AI analysis...');
      
      // Wait a short time to simulate initial loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stop waiting for response flag
      setIsWaitingForResponse(false);
      
      // Run mock analysis process
      // await simulateAnalysisProcess(
      //   addAnalysisLog,
      //   setProgress,
      //   setStatusMessage,
      //   updateLogContent,
      //   setReasoningText,
      //   setFinalContent,
      //   setJsonStructure
      // );
      
      // After mock analysis is complete, set JSON complete status to true
      setJsonCompleteStatus(true);
      
      // After mock analysis is complete, update form data, mark as complete JSON
      // Mock complete JSON data can be added here
      const mockCompleteData = {
        // Mock complete JSON data structure
        formTitle: "Paper Review Report",
        projectInfo: { /* Mock project info */ },
        evaluationSections: [ /* Mock evaluation sections */ ],
        textualEvaluations: [ /* Mock textual evaluations */ ]
      };
      updateFormData(mockCompleteData, false, true);
      
      return true;
    }
    
    const reviewData: ReviewRequestParams = {
      file_path: filePath,
      num_reviewers: 1,
      page_limit: 0,
      use_claude: false
    };
    
    // Use API URL from configuration
    const reviewUrl = getReviewUrl();
    console.log('🚀 Starting analysis request:', {
      url: reviewUrl,
      requestData: reviewData
    });
    
    // Send request
    const response = await fetch(reviewUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    });
    
    console.log('📡 Response status:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Analysis failed: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    // After receiving response, stop simulating thinking
    setIsWaitingForResponse(false);
    
    // Clear thinking logs
    setAnalysisLogs(prev => prev.filter(log => log.type !== "thinking"));
    
    // Get reader from response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Unable to get response stream');
    }
    
    console.log('📥 Starting to read stream response...');
    
    // Process streaming data
    await processStream(
      reader,
      setProgress,
      setStatusMessage,
      setReasoningText,
      setJsonStructure,
      setFinalContent,
      setError,
      updateLogContent,
      addAnalysisLog,
      updateFormData,
      setJsonCompleteStatus
    );
    
    return true;
  } catch (error) {
    console.error('❌ Error during analysis process:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    setError(error instanceof Error ? error.message : 'Unknown error');
    addAnalysisLog(`Analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
    return false;
  } finally {
    console.log('🏁 Analysis process ended');
    setIsAnalyzing(false);
    setIsWaitingForResponse(false);
  }
}; 