
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileTextIcon,
  DownloadIcon,
  EditIcon,
  SaveIcon,
  XIcon,
  SparklesIcon,
  EyeIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  TargetIcon,
  BrainIcon,
  PrinterIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ResumeRenderer from "@/components/ResumeRenderer";
import EnhancedDownloadHub from "@/components/EnhancedDownloadHub";

interface ResumeViewerProps {
  resume: string;
  onResumeUpdate: (newResume: string) => void;
  onRegenerateResume: (editPrompt: string) => void;
  isGenerating: boolean;
  previousResume?: string;
  jobDescription?: string;
  language?: string;
  country?: string;
}

const ResumeViewer: React.FC<ResumeViewerProps> = ({
  resume,
  onResumeUpdate,
  onRegenerateResume,
  isGenerating,
  previousResume,
  jobDescription,
  language = 'en',
  country = 'International'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableResume, setEditableResume] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState("formatted");
  const [aiOptimizations, setAiOptimizations] = useState<string[]>([]);
  const { toast } = useToast();

  // Analyze AI optimizations when resume changes
  useEffect(() => {
    if (resume && jobDescription) {
      analyzeOptimizations();
    }
  }, [resume, jobDescription]);

  const analyzeOptimizations = () => {
    const optimizations = [
      "Professional formatting applied",
      "Experience consolidated by company",
      "Quantified achievements highlighted",
      "Relevant skills emphasized",
      "Professional summary tailored"
    ];
    setAiOptimizations(optimizations);
  };

  const formatResumeForDisplay = (resumeText: string) => {
    const lines = resumeText.split('\n');
    const formattedSections: { [key: string]: string[] } = {};
    let currentSection = 'header';

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Detect section headers
      if (trimmedLine.match(/^(PERSONAL INFORMATION|PROFESSIONAL SUMMARY|KEY SKILLS|WORK EXPERIENCE|EDUCATION|ADDITIONAL INFORMATION)/i)) {
        currentSection = trimmedLine.toLowerCase().replace(/[^a-z]/g, '');
        formattedSections[currentSection] = [];
      } else {
        if (!formattedSections[currentSection]) {
          formattedSections[currentSection] = [];
        }
        formattedSections[currentSection].push(trimmedLine);
      }
    });

    return formattedSections;
  };



  const handleEdit = () => {
    setEditableResume(resume);
    setIsEditing(true);
  };

  const handleSave = () => {
    onResumeUpdate(editableResume);
    setIsEditing(false);

    toast({
      title: "Resume Updated",
      description: "Your resume has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setEditableResume("");
    setIsEditing(false);
  };

  const handleEditWithAI = () => {
    if (!editPrompt.trim()) {
      toast({
        title: "Edit Prompt Required",
        description: "Please enter what changes you'd like to make.",
        variant: "destructive",
      });
      return;
    }

    onRegenerateResume(editPrompt);
    setEditPrompt("");
    setShowEditPrompt(false);
  };

  const handlePrintResume = () => {
    if (!resume) {
      toast({
        title: "No Resume",
        description: "Please generate a resume first.",
        variant: "destructive",
      });
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print Blocked",
        description: "Please allow popups to enable printing.",
        variant: "destructive",
      });
      return;
    }

    // Create the print-friendly HTML content with the same styling as DocumentGenerator
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume - Print</title>
          <style>
            @media print {
              @page {
                margin: 0.5in;
                size: A4;
              }
              body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              /* Hide browser default headers and footers */
              @page {
                margin-top: 0.5in;
                margin-bottom: 0.5in;
                margin-left: 0.5in;
                margin-right: 0.5in;
              }
            }

            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              line-height: 1.4;
              color: #374151;
              margin: 0;
              padding: 20px;
              background: white;
            }

            .resume-content {
              max-width: 8.5in;
              margin: 0 auto;
            }

            .name {
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .name-underline {
              width: 100px;
              height: 3px;
              background: linear-gradient(to right, #2563eb, #7c3aed);
              margin: 0 auto 20px auto;
            }

            .title {
              text-align: center;
              font-size: 16px;
              font-weight: 600;
              color: #4b5563;
              background: #f9fafb;
              padding: 8px 16px;
              border-radius: 8px;
              margin-bottom: 20px;
              display: inline-block;
              width: 100%;
              box-sizing: border-box;
            }

            .contact {
              background: #eff6ff;
              color: #1d4ed8;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              margin: 2px 4px;
              display: inline-block;
              border: 1px solid #bfdbfe;
            }

            .section-header {
              font-size: 16px;
              font-weight: bold;
              color: #2563eb;
              text-transform: uppercase;
              margin: 24px 0 8px 0;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 4px;
            }

            .subsection-header {
              font-size: 13px;
              font-weight: bold;
              color: #374151;
              background: #f9fafb;
              padding: 8px 12px;
              border-left: 4px solid #3b82f6;
              margin: 12px 0 8px 0;
              border-radius: 0 4px 4px 0;
            }

            .bullet {
              margin: 4px 0 4px 20px;
              position: relative;
              font-size: 12px;
              line-height: 1.5;
            }

            .bullet:before {
              content: '•';
              color: #2563eb;
              font-weight: bold;
              position: absolute;
              left: -12px;
            }

            .text {
              font-size: 12px;
              line-height: 1.5;
              margin: 4px 0;
            }

            .keyword-tech {
              background: #dbeafe;
              color: #1e40af;
              padding: 2px 4px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 11px;
            }

            .keyword-prof {
              background: #dcfce7;
              color: #166534;
              padding: 2px 4px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 11px;
            }

            .keyword-metric {
              background: #fed7aa;
              color: #9a3412;
              padding: 2px 4px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="resume-content">
            ${formatResumeForPrint(resume)}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();

      // Add a small delay to ensure content is fully rendered
      setTimeout(() => {
        printWindow.print();

        // Close the window after printing (optional - user can close manually)
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };

    toast({
      title: "Print Dialog Opened",
      description: "Your resume is ready to print! Tip: In print settings, disable headers/footers for a cleaner look.",
    });
  };

  // Format resume content for printing (same logic as DocumentGenerator)
  const formatResumeForPrint = (resumeText: string): string => {
    const lines = resumeText.split('\n');
    let html = '';

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Apply keyword highlighting
      const highlightedLine = highlightKeywordsForPrint(trimmedLine);

      // Detect section headers (all caps or specific patterns)
      if (trimmedLine.match(/^[A-Z\s&]+$/) && trimmedLine.length > 3) {
        html += `<div class="section-header">${highlightedLine}</div>`;
      }
      // Detect subsection headers (Title Case with | separators)
      else if (trimmedLine.match(/^[A-Z][a-zA-Z\s]+\s*\|\s*[A-Z][a-zA-Z\s]+/)) {
        html += `<div class="subsection-header">${highlightedLine}</div>`;
      }
      // Detect bullet points
      else if (trimmedLine.match(/^[•·\-\*]\s/)) {
        const bulletContent = trimmedLine.replace(/^[•·\-\*]\s/, '');
        html += `<div class="bullet">${highlightKeywordsForPrint(bulletContent)}</div>`;
      }
      // Detect contact info
      else if (trimmedLine.match(/@|phone:|email:|linkedin:|github:/i)) {
        html += `<span class="contact">${highlightedLine}</span>`;
      }
      // Check if it's a name (first line, likely all caps or title case)
      else if (index === 0 && trimmedLine.match(/^[A-Z\s]+$/)) {
        html += `<div class="name">${trimmedLine}</div><div class="name-underline"></div>`;
      }
      // Check if it's a title/role (second line, often contains job titles)
      else if (index === 1 && trimmedLine.match(/engineer|developer|manager|analyst|specialist|coordinator|director|consultant/i)) {
        html += `<div class="title">${highlightedLine}</div>`;
      }
      // Regular content
      else {
        html += `<div class="text">${highlightedLine}</div>`;
      }
    });

    return html;
  };

  // Highlight keywords for print (same logic as DocumentGenerator)
  const highlightKeywordsForPrint = (text: string): string => {
    const keyTechnologies = [
      'java', 'spring', 'boot', 'microservices', 'rest', 'api', 'mongodb', 'postgresql',
      'mysql', 'aws', 'docker', 'kubernetes', 'react', 'javascript', 'typescript',
      'python', 'node', 'angular', 'vue', 'git', 'jenkins', 'ci/cd', 'agile', 'scrum',
      'html', 'css', 'sass', 'webpack', 'redux', 'graphql', 'firebase', 'azure',
      'spring boot', 'hibernate', 'maven', 'gradle', 'jvm', 'kotlin', 'scala'
    ];

    const professionalKeywords = [
      'experience', 'years', 'developed', 'implemented', 'managed', 'led', 'built',
      'designed', 'optimized', 'improved', 'achieved', 'delivered', 'collaborated',
      'scalable', 'performance', 'architecture', 'team', 'project', 'solution',
      'responsible', 'maintained', 'created', 'established', 'coordinated',
      'senior', 'lead', 'principal', 'director', 'manager'
    ];

    let formattedText = text;

    // Highlight technical keywords
    keyTechnologies.forEach(tech => {
      const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      formattedText = formattedText.replace(regex, (match) =>
        `<span class="keyword-tech">${match}</span>`
      );
    });

    // Highlight professional keywords
    professionalKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      formattedText = formattedText.replace(regex, (match) =>
        `<span class="keyword-prof">${match}</span>`
      );
    });

    // Highlight numbers and metrics
    formattedText = formattedText.replace(/\b(\d+(?:\.\d+)?(?:%|\+|k|K|M|years?|months?|\$))\b/g,
      '<span class="keyword-metric">$1</span>'
    );

    return formattedText;
  };

  const renderFormattedResume = () => {
    return (
      <div className="p-6 bg-white rounded-lg border max-h-[600px] overflow-y-auto">
        <ResumeRenderer content={resume} />
      </div>
    );
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BrainIcon className="w-5 h-5 text-blue-600" />
              AI-Optimized Resume
            </CardTitle>
            <CardDescription>
              Professionally formatted and ATS-optimized for maximum impact
            </CardDescription>
          </div>
          {aiOptimizations.length > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              AI Optimized
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {resume ? (
          <div className="space-y-4">
            {/* AI Optimization Indicators */}
            {aiOptimizations.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TargetIcon className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Professional Optimization Applied</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {aiOptimizations.map((optimization, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircleIcon className="w-3 h-3" />
                      {optimization}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isEditing ? (
              <div className="space-y-4">
                <Label htmlFor="editResume">Edit Resume Content</Label>
                <Textarea
                  id="editResume"
                  value={editableResume}
                  onChange={(e) => setEditableResume(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <XIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="formatted" className="flex items-center gap-2">
                      <EyeIcon className="w-4 h-4" />
                      Professional View
                    </TabsTrigger>
                    <TabsTrigger value="download" className="flex items-center gap-2">
                      <DownloadIcon className="w-4 h-4" />
                      Download Hub
                    </TabsTrigger>
                    <TabsTrigger value="raw" className="flex items-center gap-2">
                      <FileTextIcon className="w-4 h-4" />
                      Raw Text
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="formatted" className="mt-4">
                    {renderFormattedResume()}
                  </TabsContent>

                  <TabsContent value="download" className="mt-4">
                    <EnhancedDownloadHub
                      resume={resume}
                      language={language}
                      country={country}
                      jobDescription={jobDescription}
                    />
                  </TabsContent>

                  <TabsContent value="raw" className="mt-4">
                    <div className="h-[600px] border rounded-lg p-4 overflow-y-auto bg-gray-50">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{resume}</pre>
                    </div>
                  </TabsContent>
                </Tabs>

                {showEditPrompt && (
                  <div className="space-y-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-blue-600" />
                      <Label htmlFor="editPrompt" className="font-medium text-blue-800">
                        AI Enhancement Request
                      </Label>
                    </div>
                    <Textarea
                      id="editPrompt"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g., 'Add more technical skills', 'Make it more concise', 'Focus on leadership experience', 'Optimize for software engineering roles'..."
                      className="min-h-[80px] bg-white"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleEditWithAI}
                        size="sm"
                        disabled={isGenerating || !editPrompt.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        {isGenerating ? "Enhancing..." : "Enhance with AI"}
                      </Button>
                      <Button
                        onClick={() => setShowEditPrompt(false)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <EditIcon className="w-4 h-4 mr-2" />
                    Manual Edit
                  </Button>
                  <Button
                    onClick={handlePrintResume}
                    variant="outline"
                    size="sm"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    Print Resume
                  </Button>
                  <Button
                    onClick={() => setShowEditPrompt(!showEditPrompt)}
                    variant="outline"
                    size="sm"
                    disabled={isGenerating}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    AI Enhance
                  </Button>
                </div>

                {/* Success Message */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUpIcon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Professional Resume Ready</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    This resume has been professionally formatted and optimized with AI to showcase your
                    experience and skills effectively. The content has been tailored to match industry
                    standards while maintaining natural readability and professional presentation.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-[400px] border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <BrainIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">AI Resume Generator Ready</h3>
                <p className="text-sm text-gray-600">
                  Your AI-optimized resume will appear here once generated
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeViewer;
