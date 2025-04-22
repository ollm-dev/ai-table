/**
 * @typedef {Object} ReviewFormData - Review form data structure
 */
export const reviewFormData = {
  formTitle: "Review Opinion Form",  
  projectInfo: {
    projectTitle: "",
    projectType: "",
    researchField: "",
    applicantName: "",
    applicationId: ""
  },
  
  evaluationSections: [
    {
      id: "applicantQualification",
      title: "Agent Familiarity",
      options: ["Familiar", "Somewhat Familiar", "Not Familiar"],
      required: true,
      aiRecommendation: "",
      aiReason: ""
    },
    {
      id: "significance",
      title: "Overall Evaluation",
      options: ["Excellent", "Good", "Average", "Poor"],
      required: true,
      aiRecommendation: "",
      aiReason: ""
    },
    {
      id: "relationshipExplanation",
      title: "Funding Opinion",
      description: "Please select the appropriate relationship description",
      options: ["Priority Funding", "Fundable", "Not Recommended for Funding"],
      required: true,
      aiRecommendation: "",
      aiReason: ""
    }
  ],
  
  textualEvaluations: [
    {
      id: "scientificValue",
      title: "Scientific Evaluation Description",
      placeholder: "Please enter scientific evaluation description",
      required: true,
      aiRecommendation: "",
      minLength: 800
    },
    {
      id: "socialDevelopment",
      title: "Does the project meet economic and social development needs or address important scientific issues at the frontier of science?",
      placeholder: "Please enter your evaluation opinion",
      required: true,
      aiRecommendation: "",
      minLength: 800
    },
    {
      id: "innovation",
      title: "Please evaluate the innovation of the scientific issues described in the application and the academic value of the expected results",
      placeholder: "Please enter your evaluation opinion",
      required: true,
      aiRecommendation: "",
      minLength: 800
    },
    {
      id: "feasibility",
      title: "Please detail the research foundation and feasibility of the project. If possible, please suggest improvements to the research plan.",
      placeholder: "Please enter your evaluation opinion",
      required: true,
      aiRecommendation: "",
      minLength: 800
    },
    {
      id: "otherSuggestions",
      title: "Other Suggestions",
      placeholder: "Please enter other suggestions",
      required: false,
      aiRecommendation: "",
      minLength: 800
    }
  ]
}; 