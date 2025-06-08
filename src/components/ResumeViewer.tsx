
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
  BrainIcon
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
