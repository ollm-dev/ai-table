/**
 * Mock Analysis Process Data and Functions
 */

// Define analysis process steps, corresponding to the progress bar in the image
export interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  progress: number;
}

// Mock analysis steps data
export const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: 'nlp',
    name: 'Natural Language Processing',
    description: 'Analyzing document structure and content',
    progress: 100
  },
  {
    id: 'context',
    name: 'Context Analysis',
    description: 'Extracting key claims and assumptions',
    progress: 100
  },
  {
    id: 'data',
    name: 'Metadata Extraction',
    description: 'Identifying research methods and approaches',
    progress: 100
  },
  {
    id: 'evaluation',
    name: 'Quantitative Assessment',
    description: 'Evaluating against standard academic criteria',
    progress: 100
  },
  {
    id: 'visualization',
    name: 'Visualization',
    description: 'Generating visual representation of insights',
    progress: 100
  },
  {
    id: 'summary',
    name: 'Feedback Synthesis',
    description: 'Compiling comprehensive review feedback',
    progress: 100
  }
];

/**
 * Simulate analysis process
 * @param filePath File path
 * @param callbacks Analysis process callback functions collection
 * @returns Promise<void>
 */
export const simulateAnalysisProcess = async (
  filePath: string,
  callbacks: {
    setProgress: (value: React.SetStateAction<number>) => void;
    setStatusMessage: (value: React.SetStateAction<string>) => void;
    setReasoningText: (value: React.SetStateAction<string>) => void;
    setJsonStructure: (value: React.SetStateAction<string>) => void;
    setFinalContent: (value: React.SetStateAction<string>) => void;
    updateLogContent: (type: string, content: string, append?: boolean) => void;
    addAnalysisLog: (content: string, type?: string) => void;
    updateFormData: (jsonStructure: any, isPartial?: boolean, isComplete?: boolean) => void;
    setJsonCompleteStatus: (value: React.SetStateAction<boolean>) => void;
  }
): Promise<void> => {
  const {
    setProgress,
    setStatusMessage,
    setReasoningText,
    setJsonStructure,
    setFinalContent,
    updateLogContent,
    addAnalysisLog,
    updateFormData,
    setJsonCompleteStatus
  } = callbacks;

  // Simulate analysis process
  addAnalysisLog("Starting mock analysis process", "info");
  
  // Total number of analysis steps, used for calculating progress
  const totalSteps = ANALYSIS_STEPS.length;
  
  // Execute each analysis step sequentially
  for (let i = 0; i < totalSteps; i++) {
    const step = ANALYSIS_STEPS[i];
    const progress = Math.round(((i + 1) / totalSteps) * 100);
    
    setProgress(progress);
    setStatusMessage(`Processing: ${step.name} - ${step.description}`);
    addAnalysisLog(`Executing step: ${step.name} - ${step.description}`, "progress");
    updateLogContent("progress", `Currently executing: ${step.name}`);
    
    // Simulate processing time for each step
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate different mock outputs for different steps
    switch (step.id) {
      case 'nlp':
        setReasoningText("Analyzing document structure and extracting key content...\n");
        break;
      case 'context':
        setReasoningText(prev => prev + "Identifying main arguments and supporting evidence in the document...\n");
        break;
      case 'data':
        setReasoningText(prev => prev + "Extracting research methods, sample data, and experimental design...\n");
        break;
      case 'evaluation':
        setReasoningText(prev => prev + "Evaluating the effectiveness of research methods and reliability of results...\n");
        break;
      case 'visualization':
        setReasoningText(prev => prev + "Generating visual representation of review data...\n");
        break;
      case 'summary':
        setReasoningText(prev => prev + "Synthesizing analysis results to form final review opinions...\n");
        
        // Generate mock JSON structure and final content in the last step
        const mockJsonStructure = {
          formTitle: "Paper Review Form",
          projectInfo: {
            title: "Example Paper Title",
            authors: "Example Authors",
            keywords: "Example Keywords",
            abstract: "This is a mock paper abstract content..."
          },
          evaluationSections: [
            {
              id: "significance",
              title: "Research Significance",
              options: ["Excellent", "Good", "Average", "Poor"],
              selectedValue: "Good",
              aiRecommendation: "Good",
              aiReason: "The research has certain value in the current field, but lacks innovation"
            },
            {
              id: "methodology",
              title: "Research Methodology",
              options: ["Excellent", "Good", "Average", "Poor"],
              selectedValue: "Good",
              aiRecommendation: "Good",
              aiReason: "Research methodology is reasonable, but sample size is small"
            }
          ],
          textualEvaluations: [
            {
              id: "strengths",
              title: "Research Strengths",
              content: "1. Clear problem definition\n2. Reasonable experimental design\n3. Appropriate data analysis methods"
            },
            {
              id: "weaknesses",
              title: "Research Weaknesses",
              content: "1. Small sample size\n2. Insufficient discussion of research limitations\n3. Some conclusions lack sufficient support"
            }
          ]
        };
        
        // Update JSON structure
        setJsonStructure(JSON.stringify(mockJsonStructure, null, 2));
        updateFormData(mockJsonStructure, false, true);
        setJsonCompleteStatus(true);
        
        // Set final review content
        setFinalContent("# Paper Review Summary\n\n## Research Overview\nThis research explores a valuable problem, employs appropriate research methods, but has some limitations.\n\n## Main Findings\nThe research results indicate that the method is effective under specific conditions, but further validation is needed.\n\n## Recommendations\nRecommend increasing the sample size and conducting a more in-depth discussion of research limitations.");
        break;
    }
  }
  
  addAnalysisLog("Mock analysis process completed", "complete");
  return Promise.resolve();
};
