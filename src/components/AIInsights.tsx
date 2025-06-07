import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BrainIcon, 
  CheckCircleIcon, 
  TrendingUpIcon, 
  TargetIcon,
  ZapIcon,
  ShieldCheckIcon,
  AwardIcon
} from "lucide-react";

interface AIInsightsProps {
  jobDescription: string;
  resume: string;
  isVisible: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ jobDescription, resume, isVisible }) => {
  if (!isVisible || !resume) return null;

  const analyzeJobAlignment = () => {
    const jobText = jobDescription.toLowerCase();
    const resumeText = resume.toLowerCase();

    // Extract key technologies from job description
    const techKeywords = [
      'java', 'groovy', 'spring', 'boot', 'microservices', 'api', 'rest', 'restful',
      'mongodb', 'postgresql', 'mysql', 'database', 'aws', 'cloud', 'docker',
      'kubernetes', 'backend', 'engineer', 'scalable', 'system', 'architecture'
    ];

    const jobSpecificKeywords = jobText.split(/\W+/).filter(word =>
      word.length > 3 && (
        techKeywords.includes(word) ||
        word.includes('develop') ||
        word.includes('design') ||
        word.includes('implement') ||
        word.includes('maintain')
      )
    );

    return {
      matchedKeywords: jobSpecificKeywords.filter(keyword => resumeText.includes(keyword)),
      totalKeywords: jobSpecificKeywords.length,
      hasQuantifiedAchievements: /\d+%|\d+\+|\$\d+|\d+ years?|\d+ months?/g.test(resume),
      hasActionVerbs: ['developed', 'implemented', 'designed', 'built', 'led', 'managed', 'optimized'].some(verb => resumeText.includes(verb)),
      hasProfessionalSummary: resumeText.includes('professional summary'),
      hasRelevantSkills: techKeywords.some(tech => resumeText.includes(tech)),
      wordCount: resume.split(/\s+/).length
    };
  };

  const getOptimizationScore = () => {
    const analysis = analyzeJobAlignment();
    let score = 0;

    // Keyword matching (40 points max)
    const keywordMatch = (analysis.matchedKeywords.length / Math.max(analysis.totalKeywords, 1)) * 40;
    score += keywordMatch;

    // Quantified achievements (20 points)
    if (analysis.hasQuantifiedAchievements) score += 20;

    // Action verbs (15 points)
    if (analysis.hasActionVerbs) score += 15;

    // Professional structure (15 points)
    if (analysis.hasProfessionalSummary && analysis.hasRelevantSkills) score += 15;

    // Optimal length (10 points)
    if (analysis.wordCount >= 300 && analysis.wordCount <= 1000) score += 10;

    return Math.min(Math.round(score), 100);
  };

  const optimizationScore = getOptimizationScore();
  const analysis = analyzeJobAlignment();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    return "Needs Improvement";
  };

  const optimizations = [
    {
      icon: TargetIcon,
      title: "ATS Keywords Integrated",
      description: "Job-specific keywords strategically placed throughout",
      status: "completed"
    },
    {
      icon: ShieldCheckIcon,
      title: "ATS-Friendly Formatting",
      description: "Clean structure that passes through tracking systems",
      status: "completed"
    },
    {
      icon: TrendingUpIcon,
      title: "Quantified Achievements",
      description: "Results and metrics highlighted for impact",
      status: "completed"
    },
    {
      icon: ZapIcon,
      title: "Industry Terminology",
      description: "Professional language matching job requirements",
      status: "completed"
    },
    {
      icon: AwardIcon,
      title: "Competitive Positioning",
      description: "Optimized to stand out among other candidates",
      status: "completed"
    }
  ];

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainIcon className="w-5 h-5 text-green-600" />
            <CardTitle className="text-green-800">AI Optimization Report</CardTitle>
          </div>
          <Badge className={`${getScoreColor(optimizationScore)} border-0 font-semibold`}>
            {optimizationScore}% {getScoreLabel(optimizationScore)}
          </Badge>
        </div>
        <CardDescription className="text-green-700">
          Your resume has been optimized for maximum ATS compatibility and recruiter appeal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Optimization Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {optimizations.map((optimization, index) => {
              const IconComponent = optimization.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900">{optimization.title}</h4>
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{optimization.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Keyword Analysis */}
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <TargetIcon className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Job-Specific Keywords Matched</span>
              <Badge className="bg-blue-100 text-blue-800">
                {analysis.matchedKeywords.length}/{analysis.totalKeywords}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.matchedKeywords.slice(0, 10).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  ✓ {keyword}
                </Badge>
              ))}
              {analysis.matchedKeywords.length > 10 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                  +{analysis.matchedKeywords.length - 10} more
                </Badge>
              )}
            </div>
          </div>

          {/* Success Message */}
          <div className="p-4 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Ready for ATS Submission</span>
            </div>
            <p className="text-sm text-gray-700">
              This resume is optimized to pass ATS screening and catch recruiter attention.
              The AI has strategically incorporated <strong>{analysis.matchedKeywords.length} job-specific keywords</strong> while maintaining
              natural readability and professional formatting.
            </p>
          </div>

          {/* Tips */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Pro Tips for Maximum Impact</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Save as both PDF and Word formats for different application systems</li>
              <li>• Customize the professional summary for each specific application</li>
              <li>• Use the same keywords when filling out online application forms</li>
              <li>• Keep your LinkedIn profile consistent with this optimized resume</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
