/**
 * @typedef {Object} ReviewFormData - 评审表单数据结构
 */
export const reviewFormData = {
  formTitle: "评审意见表",  
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
      title: "",
      options: ["", "", ""],
      required: true,
      aiRecommendation: "",
      aiReason: ""
    },
    {
      id: "significance",
      title: "综合评价",
      options: ["优", "良", "中", "差"],
      required: true,
      aiRecommendation: "",
      aiReason: ""
    },
    {
      id: "relationshipExplanation",
      title: "综合评价中的\"优\"与\"良\"与其他意见中的\"优先资助\"关系",
      description: "请选择适当的关系描述",
      options: ["优先资助", "可资", "不予资助"],
      required: true,
      aiRecommendation: "",
      aiReason: ""
    }
  ],
  
  textualEvaluations: [
    {
      id: "scientificValue",
      title: "科学评价说明",
      placeholder: "请输入科学评价说明",
      required: true,
      aiRecommendation: "",
      minLength: 800
    },
    {
      id: "socialDevelopment",
      title: "请详述该申请项目是否符合经济社会发展需求或科学前沿的重要科学问题？",
      placeholder: "请输入评价意见",
      required: true,
      aiRecommendation: "",
      minLength: 800
    },
    {
      id: "innovation",
      title: "请评述申请项目所阐述的科学问题的创新性与预期成果的学术价值？",
      placeholder: "请输入评价意见",
      required: true,
      aiRecommendation: "",
      minLength: 800
    },
    {
      id: "feasibility",
      title: "请详述该申请项目的研究基础与可行性？如有可能，请对完善研究方案提出建议。",
      placeholder: "请输入评价意见",
      required: true,
      aiRecommendation: "",
      minLength: 800
    },
    {
      id: "otherSuggestions",
      title: "其他建议",
      placeholder: "请输入其他建议",
      required: false,
      aiRecommendation: "",
      minLength: 800
    }
  ]
}; 