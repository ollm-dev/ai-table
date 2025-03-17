/**
 * @typedef {Object} ReviewFormData - 评审表单数据结构
 */
export const reviewFormData = {
  formTitle: "评审意见表",  
  projectInfo: {
    projectTitle: "XXXX",
    projectType: "XXXX",
    researchField: "XXXX",
    applicantName: "XXXX",
    applicationId: "XXXX"
  },
  
  evaluationSections: [
    {
      id: "applicantQualification",
      title: "您对申请内容",
      options: ["熟悉", "较熟", "不熟悉"],
      required: true,
      aiRecommendation: "熟悉",
      aiReason: "申请人在该领域有多年研究经验，发表过多篇相关高质量论文。"
    },
    {
      id: "significance",
      title: "综合评价",
      options: ["优", "良", "中", "差"],
      required: true,
      aiRecommendation: "优",
      aiReason: "该项目以健康监测与情绪状态分析为基础，创新性公众监测及引导策略对当前社会具有重要影响。"
    },
    {
      id: "relationshipExplanation",
      title: "综合评价中的\"优\"与\"良\"与其他意见中的\"优先资助\"关系",
      description: "请选择适当的关系描述",
      options: ["优先资助", "可资", "不予资助"],
      required: true,
      aiRecommendation: "优先资助",
      aiReason: "该研究方向符合国家重点发展方向，具有较强的社会和科学价值。"
    }
  ],
  
  textualEvaluations: [
    {
      id: "scientificValue",
      title: "科学评价说明",
      placeholder: "请输入科学评价说明",
      required: true,
      aiRecommendation: "目标导向的基础研究是国内经济社会发展需求伴随着重要的基础研究。",
      minLength: 50
    },
    {
      id: "socialDevelopment",
      title: "一、请详述该申请项目是否符合经济社会发展需求或科学前沿的重要科学问题？",
      placeholder: "请输入评价意见",
      required: true,
      aiRecommendation: "该项目通过精准健康监测研究公众情绪状态与行为偏好规律，符合当前社会对心理健康与行为引导的迫切需求。项目结合了大数据分析与心理学研究，处于学科交叉前沿，对推动社会治理创新具有重要价值。",
      minLength: 100
    },
    {
      id: "innovation",
      title: "二、请评述申请项目所阐述的科学问题的创新性与预期成果的学术价值？",
      placeholder: "请输入评价意见",
      required: true,
      aiRecommendation: "该项目创新性地将精准健康监测技术应用于公众情绪与行为研究，突破了传统研究方法的局限性。预期成果将建立情绪-行为关联模型，对心理学、社会学等领域具有重要学术价值，同时为公共政策制定提供科学依据。",
      minLength: 100
    },
    {
      id: "feasibility",
      title: "三、请详述该申请项目的研究基础与可行性？如有可能，请对完善研究方案提出建议。",
      placeholder: "请输入评价意见",
      required: true,
      aiRecommendation: "申请人在该领域有扎实的研究基础，团队配置合理，研究方案设计科学。建议在数据采集环节增加隐私保护措施，扩大样本覆盖面，并考虑引入跨文化比较研究，以增强研究结论的普适性。",
      minLength: 100
    },
    {
      id: "otherSuggestions",
      title: "四、其他建议",
      placeholder: "请输入其他建议",
      required: false,
      aiRecommendation: "建议研究团队加强与相关政府部门和企业的合作，促进研究成果的实际应用。同时，可以考虑建立长期跟踪研究机制，观察情绪状态与行为偏好的动态变化规律，为相关政策的制定和调整提供持续的数据支持。",
      minLength: 0
    }
  ]
}; 