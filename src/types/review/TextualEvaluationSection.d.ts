import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LightbulbIcon } from "@/components/ui/icons";

export interface TextualEvaluation {
  id: string;
  title: string;
  placeholder: string;
  required: boolean;
  minLength: number;
  aiRecommendation?: string;
}

export interface TextualEvaluationSectionProps {
  textualEvaluations: TextualEvaluation[];
  formState: {
    evaluations: Record<string, string>;
    textEvals: Record<string, string>;
  };
  handleTextChange: (id: string, value: string) => void;
  isLoadingData: boolean;
  aiRecommendationsAvailable: boolean;
  handleAIRecommendationToggle: (id: string, aiRecommendation: string, e?: React.MouseEvent) => void;
}



export interface TextualEvaluationItemProps {
  section: TextualEvaluation;
  sectionIndex: number;
  value: string;
  handleTextChange: (id: string, value: string) => void;
  isLoadingData: boolean;
  aiRecommendationsAvailable: boolean;
  handleAIRecommendationToggle: (id: string, aiRecommendation: string, e?: React.MouseEvent) => void;
}

 export interface TextualEvaluationItemProps {
  section: TextualEvaluation;
  sectionIndex: number;
  value: string;
  handleTextChange: (id: string, value: string) => void;
  isLoadingData: boolean;
  aiRecommendationsAvailable: boolean;
  handleAIRecommendationToggle: (id: string, aiRecommendation: string, e?: React.MouseEvent) => void;
}