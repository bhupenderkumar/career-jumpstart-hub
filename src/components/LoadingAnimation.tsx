import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BrainIcon, 
  SparklesIcon, 
  FileTextIcon, 
  CheckCircleIcon,
  ZapIcon
} from "lucide-react";

interface LoadingAnimationProps {
  isVisible: boolean;
  stage: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ isVisible, stage }) => {
  if (!isVisible) return null;

  const stages = [
    {
      id: 'analyzing',
      title: 'Analyzing Job Description',
      description: 'AI is extracting key requirements and keywords',
      icon: BrainIcon,
      progress: 20
    },
    {
      id: 'processing',
      title: 'Processing Your Resume',
      description: 'Identifying relevant experience and skills',
      icon: FileTextIcon,
      progress: 40
    },
    {
      id: 'optimizing',
      title: 'Optimizing for ATS',
      description: 'Integrating keywords and formatting for tracking systems',
      icon: ZapIcon,
      progress: 60
    },
    {
      id: 'generating',
      title: 'Generating Professional Content',
      description: 'Creating tailored resume with quantified achievements',
      icon: SparklesIcon,
      progress: 80
    },
    {
      id: 'finalizing',
      title: 'Finalizing Resume',
      description: 'Applying final formatting and quality checks',
      icon: CheckCircleIcon,
      progress: 100
    }
  ];

  const currentStageIndex = stages.findIndex(s => s.id === stage);
  const currentStage = stages[currentStageIndex] || stages[0];
  const IconComponent = currentStage.icon;

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          {/* Animated Icon */}
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <IconComponent className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <SparklesIcon className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Stage Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-blue-900">{currentStage.title}</h3>
            <p className="text-sm text-blue-700">{currentStage.description}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={currentStage.progress} className="w-full" />
            <p className="text-xs text-blue-600">{currentStage.progress}% Complete</p>
          </div>

          {/* Stage Indicators */}
          <div className="flex justify-center space-x-2">
            {stages.map((stageItem, index) => {
              const StageIcon = stageItem.icon;
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              
              return (
                <div
                  key={stageItem.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <StageIcon className="w-4 h-4" />
                </div>
              );
            })}
          </div>

          {/* Encouraging Message */}
          <div className="p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              🚀 <strong>AI is working hard to optimize your resume!</strong> This process ensures 
              maximum ATS compatibility and recruiter appeal.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingAnimation;
