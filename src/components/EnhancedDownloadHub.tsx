import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileTextIcon, 
  DownloadIcon, 
  EyeIcon,
  CheckCircleIcon,
  StarIcon,
  TrendingUpIcon,
  FileIcon,
  ClockIcon,
  TargetIcon,
  ZapIcon,
  ShieldCheckIcon,
  AwardIcon
} from "lucide-react";
import { generateUnifiedPDF } from "@/utils/unifiedPDFGenerator";
import { useToast } from "@/hooks/use-toast";

interface EnhancedDownloadHubProps {
  resume: string;
  language: string;
  country: string;
  jobDescription?: string;
}

interface ATSScore {
  overall: number;
  keywords: number;
  formatting: number;
  sections: number;
  readability: number;
  details: {
    keywordMatches: string[];
    missingSections: string[];
    recommendations: string[];
  };
}

const EnhancedDownloadHub: React.FC<EnhancedDownloadHubProps> = ({ 
  resume, 
  language, 
  country, 
  jobDescription 
}) => {
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Calculate ATS Score
  const calculateATSScore = (resumeText: string, jobDesc?: string): ATSScore => {
    const lines = resumeText.toLowerCase().split('\n');
    const text = resumeText.toLowerCase();
    
    // Keywords analysis
    const commonKeywords = [
      'experience', 'skills', 'education', 'professional', 'developed', 'managed',
      'implemented', 'designed', 'led', 'created', 'improved', 'achieved',
      'responsible', 'collaborated', 'delivered', 'optimized'
    ];
    
    const techKeywords = [
      'javascript', 'python', 'java', 'react', 'node', 'aws', 'docker',
      'kubernetes', 'sql', 'mongodb', 'git', 'agile', 'scrum', 'api'
    ];
    
    const allKeywords = [...commonKeywords, ...techKeywords];
    const foundKeywords = allKeywords.filter(keyword => text.includes(keyword));
    const keywordScore = Math.min((foundKeywords.length / allKeywords.length) * 100, 100);
    
    // Section analysis
    const requiredSections = [
      'professional summary', 'summary', 'experience', 'work experience',
      'skills', 'education', 'contact'
    ];
    
    const foundSections = requiredSections.filter(section => 
      text.includes(section) || text.includes(section.replace(' ', ''))
    );
    const sectionScore = (foundSections.length / requiredSections.length) * 100;
    
    // Formatting analysis
    const hasBulletPoints = text.includes('•') || text.includes('-') || text.includes('*');
    const hasProperStructure = lines.some(line => line.match(/^[A-Z\s&]+$/));
    const hasContactInfo = text.includes('@') || text.includes('phone') || text.includes('linkedin');
    
    const formatScore = (
      (hasBulletPoints ? 25 : 0) +
      (hasProperStructure ? 35 : 0) +
      (hasContactInfo ? 40 : 0)
    );
    
    // Readability analysis
    const avgWordsPerLine = lines.reduce((acc, line) => acc + line.split(' ').length, 0) / lines.length;
    const readabilityScore = avgWordsPerLine > 5 && avgWordsPerLine < 20 ? 85 : 65;
    
    const overall = Math.round((keywordScore + sectionScore + formatScore + readabilityScore) / 4);
    
    return {
      overall,
      keywords: Math.round(keywordScore),
      formatting: Math.round(formatScore),
      sections: Math.round(sectionScore),
      readability: Math.round(readabilityScore),
      details: {
        keywordMatches: foundKeywords.slice(0, 10),
        missingSections: requiredSections.filter(section => !foundSections.includes(section)),
        recommendations: [
          overall < 70 ? 'Add more relevant keywords from the job description' : '',
          formatScore < 80 ? 'Improve formatting with bullet points and clear sections' : '',
          sectionScore < 80 ? 'Add missing standard resume sections' : ''
        ].filter(Boolean)
      }
    };
  };

  useEffect(() => {
    if (resume) {
      setIsAnalyzing(true);
      // Simulate analysis delay for better UX
      setTimeout(() => {
        const score = calculateATSScore(resume, jobDescription);
        setAtsScore(score);
        setIsAnalyzing(false);
      }, 1500);
    }
  }, [resume, jobDescription]);

  const handleDownload = async (format: 'pdf' | 'txt' = 'pdf') => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      if (format === 'pdf') {
        const result = generateUnifiedPDF({
          resume,
          language,
          country
        });
        
        setDownloadProgress(100);
        
        toast({
          title: "🎉 Resume Downloaded Successfully!",
          description: `Your ATS-optimized resume (Score: ${atsScore?.overall}%) is ready!`,
        });
      } else {
        // Text download
        const element = document.createElement("a");
        const file = new Blob([resume], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `resume_${Date.now()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        setDownloadProgress(100);
        
        toast({
          title: "Text Resume Downloaded!",
          description: "Your resume has been saved as a text file.",
        });
      }

      setTimeout(() => {
        setDownloadProgress(0);
        setIsDownloading(false);
      }, 1000);

    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
      
      toast({
        title: "Download Error",
        description: "Failed to download resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <AwardIcon className="w-5 h-5" />;
    if (score >= 70) return <TrendingUpIcon className="w-5 h-5" />;
    return <TargetIcon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Hero Section with ATS Score */}
      <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <FileTextIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Professional Resume Ready</h1>
                <p className="text-blue-100 text-lg">ATS-optimized • {country} market ready • Professional format</p>
              </div>
            </div>
            
            {atsScore && (
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  {getScoreIcon(atsScore.overall)}
                  <span className="text-sm font-medium">ATS Score</span>
                </div>
                <div className="text-4xl font-bold mb-1">{atsScore.overall}%</div>
                <div className="text-xs text-blue-100">
                  {atsScore.overall >= 85 ? 'Excellent' : atsScore.overall >= 70 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
            )}
          </div>

          {/* Download Progress */}
          {isDownloading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Generating your resume...</span>
                <span className="text-sm">{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2 bg-white/20" />
            </div>
          )}

          {/* Primary Download Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => handleDownload('pdf')}
              disabled={isDownloading}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download PDF Resume
            </Button>
            
            <Button
              onClick={() => handleDownload('txt')}
              disabled={isDownloading}
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-6 py-3"
            >
              <FileIcon className="w-5 h-5 mr-2" />
              Download Text
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ATS Analysis & Download Options */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4" />
            ATS Analysis
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <EyeIcon className="w-4 h-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="options" className="flex items-center gap-2">
            <ZapIcon className="w-4 h-4" />
            Download Options
          </TabsTrigger>
        </TabsList>

        {/* ATS Analysis Tab */}
        <TabsContent value="analysis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                ATS Compatibility Analysis
              </CardTitle>
              <CardDescription>
                Detailed breakdown of how well your resume performs with Applicant Tracking Systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing your resume for ATS compatibility...</p>
                </div>
              ) : atsScore ? (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className={`p-6 rounded-xl border-2 ${getScoreColor(atsScore.overall)}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getScoreIcon(atsScore.overall)}
                        <div>
                          <h3 className="text-xl font-bold">Overall ATS Score</h3>
                          <p className="text-sm opacity-80">Combined compatibility rating</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold">{atsScore.overall}%</div>
                        <div className="text-sm font-medium">
                          {atsScore.overall >= 85 ? 'Excellent' : atsScore.overall >= 70 ? 'Good' : 'Needs Work'}
                        </div>
                      </div>
                    </div>
                    <Progress value={atsScore.overall} className="h-3" />
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TargetIcon className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Keywords</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">{atsScore.keywords}%</div>
                      <Progress value={atsScore.keywords} className="h-2" />
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileTextIcon className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900">Formatting</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-1">{atsScore.formatting}%</div>
                      <Progress value={atsScore.formatting} className="h-2" />
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircleIcon className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-900">Sections</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600 mb-1">{atsScore.sections}%</div>
                      <Progress value={atsScore.sections} className="h-2" />
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <EyeIcon className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-orange-900">Readability</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600 mb-1">{atsScore.readability}%</div>
                      <Progress value={atsScore.readability} className="h-2" />
                    </div>
                  </div>

                  {/* Recommendations */}
                  {atsScore.details.recommendations.length > 0 && (
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-yellow-800 text-lg">💡 Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {atsScore.details.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-yellow-800">
                              <span className="text-yellow-600 mt-1">•</span>
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Found Keywords */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-green-800 text-lg">✅ Detected Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {atsScore.details.keywordMatches.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EyeIcon className="w-5 h-5 text-blue-600" />
                Resume Preview
              </CardTitle>
              <CardDescription>
                See how your resume will look in the final PDF format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto border">
                <div className="bg-white p-6 rounded shadow-sm max-w-2xl mx-auto">
                  <div className="space-y-4 text-sm">
                    {resume.split('\n').slice(0, 20).map((line, index) => {
                      const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1').trim();
                      if (!cleanLine) return <div key={index} className="h-2"></div>;

                      if (line.match(/^[A-Z\s&]+$/) && line.length > 3) {
                        return (
                          <h3 key={index} className="text-blue-700 font-bold text-base border-b border-blue-200 pb-1">
                            {cleanLine}
                          </h3>
                        );
                      }

                      if (index < 3) {
                        return (
                          <div key={index} className={index === 0 ? "text-lg font-bold text-gray-900" : "text-gray-700"}>
                            {cleanLine}
                          </div>
                        );
                      }

                      return (
                        <p key={index} className="text-gray-600 leading-relaxed">
                          {cleanLine}
                        </p>
                      );
                    })}

                    {resume.split('\n').length > 20 && (
                      <div className="text-center py-4 text-blue-600 font-medium">
                        ... and {resume.split('\n').length - 20} more lines in full PDF
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Download Options Tab */}
        <TabsContent value="options" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PDF Download */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <FileTextIcon className="w-5 h-5" />
                  Professional PDF
                </CardTitle>
                <CardDescription className="text-blue-700">
                  ATS-optimized format with professional styling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>ATS Compatible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Professional Design</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Keyword Highlighted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Print Ready</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleDownload('pdf')}
                  disabled={isDownloading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download PDF Resume
                </Button>
              </CardContent>
            </Card>

            {/* Text Download */}
            <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FileIcon className="w-5 h-5" />
                  Plain Text Format
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Raw text for easy copying and pasting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Copy & Paste Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Universal Format</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Small File Size</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Quick Access</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleDownload('txt')}
                  disabled={isDownloading}
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50"
                >
                  <FileIcon className="w-4 h-4 mr-2" />
                  Download Text File
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Download Stats */}
          <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <ClockIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Ready for Download</h3>
                    <p className="text-sm text-green-700">Your resume has been optimized and is ready to download</p>
                  </div>
                </div>

                {atsScore && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{atsScore.overall}%</div>
                    <div className="text-sm text-green-700">ATS Score</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDownloadHub;
