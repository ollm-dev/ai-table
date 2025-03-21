
import React from 'react';
import { Badge } from "@/components/ui/badge";
import {EvaluationSectionItemProps } from "@/types/review/EvaluationOptionsSection";

export default function EvaluationSectionItem({
    section,
    sectionIndex,
    selectedValue,
    handleRadioChange,
    aiRecommendationsAvailable,
    showEvaluationAI
  }: EvaluationSectionItemProps) {
    return (
      <div 
        className="space-y-4 p-5 rounded-xl bg-white/80 border border-gray-200 shadow-sm backdrop-blur-sm"
        style={{ animationDelay: `${0.1 * sectionIndex}s` }}
      >
        <div className="flex flex-col">
          <div className="flex items-center mb-3">
            <h4 className="font-medium text-gray-800 text-sm">{section.title}</h4>
            {section.required && (
              <Badge variant="required" className="ml-2 bg-red-50 text-red-600 border border-red-100 text-xs">
                必填
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {section.options.map((option, index) => (
              <div 
                key={index} 
                onClick={() => handleRadioChange(section.id, option)}
                className={`flex items-center justify-center px-6 py-2 rounded-xl transition-colors duration-300 cursor-pointer ${
                  selectedValue === option 
                    ? "bg-blue-100 text-blue-700 border border-blue-300" 
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <span className="font-medium text-sm">
                  {option}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* AI建议部分 */}
        <div className="h-[40px] flex items-center">
          {aiRecommendationsAvailable && showEvaluationAI && section.aiRecommendation ? (
            <div className="flex items-center p-3 bg-gray-50/80 rounded-xl border border-gray-100 w-full">
              <span className="text-gray-600 mr-3 font-medium">AI建议:</span>
              <Badge className={`${
                section.id === 'maturity' && section.aiRecommendation === '熟悉' ? 'bg-green-100 text-green-700 border-green-300' :
                section.id === 'rating' && section.aiRecommendation === '优' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                section.id === 'funding' && section.aiRecommendation === '优先资助' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                'bg-gray-100 text-gray-700 border-gray-300'
              } border px-4 py-1 rounded-full transition-colors`}>
                {section.aiRecommendation}
              </Badge>
            </div>
          ) : (
            <div className="h-full w-full"></div>
          )}
        </div>
      </div>
    );
  }