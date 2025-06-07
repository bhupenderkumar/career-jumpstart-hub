import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileTextIcon,
  MailIcon,
  FileIcon,
  DownloadIcon,
  SparklesIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  EditIcon,
  RefreshCwIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAllDocuments, GenerationResult } from "@/services/geminiAI";
import ResumeRenderer from "@/components/ResumeRenderer";
import PDFPreview from "@/components/PDFPreview";
import { generateModernPDF } from "@/utils/modernPDFGenerator";

interface DocumentGeneratorProps {
  jobDescription: string;
  baseResume?: string;
  language: string;
  country: string;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  jobDescription,
  baseResume,
  language,
  country
}) => {
  const [documents, setDocuments] = useState<GenerationResult>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("resume");
  const [enhancementPrompt, setEnhancementPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  const handleGenerateAll = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Missing Job Description",
        description: "Please provide a job description to generate documents.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAllDocuments({
        jobDescription,
        baseResume,
        language,
        country,
        generateType: 'all'
      });

      setDocuments(result);
      toast({
        title: "Documents Generated Successfully",
        description: "Resume, cover letter, and email template are ready!",
      });
    } catch (error) {
      console.error('Document generation error:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceDocuments = async () => {
    if (!enhancementPrompt.trim()) {
      toast({
        title: "Missing Enhancement Request",
        description: "Please provide feedback or enhancement instructions.",
        variant: "destructive",
      });
      return;
    }

    if (!documents.resume) {
      toast({
        title: "No Documents",
        description: "Please generate documents first before enhancing.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const result = await generateAllDocuments({
        jobDescription,
        baseResume: documents.resume, // Use current resume as base
        editPrompt: enhancementPrompt,
        language,
        country,
        generateType: 'all'
      });

      setDocuments(result);
      setEnhancementPrompt(""); // Clear the prompt after successful enhancement
      toast({
        title: "Documents Enhanced Successfully",
        description: "All documents have been updated based on your feedback!",
      });
    } catch (error) {
      console.error('Enhancement error:', error);
      toast({
        title: "Enhancement Error",
        description: "Failed to enhance documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!documents.resume) {
      toast({
        title: "No Resume",
        description: "Please generate documents first.",
        variant: "destructive",
      });
      return;
    }

    try {
      generateModernPDF({
        resume: documents.resume,
        language,
        country
      });

      toast({
        title: "Resume Downloaded",
        description: "Professional PDF resume has been downloaded successfully!",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCoverLetterPDF = () => {
    if (!documents.coverLetter) {
      toast({
        title: "No Cover Letter",
        description: "Please generate documents first.",
        variant: "destructive",
      });
      return;
    }

    try {
      generateModernPDF({
        resume: documents.coverLetter,
        language,
        country
      });

      toast({
        title: "Cover Letter Downloaded",
        description: "Professional PDF cover letter has been downloaded successfully!",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: `${type} has been copied to your clipboard.`,
      });
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5 text-blue-600" />
            <CardTitle>Complete Application Package</CardTitle>
          </div>
          <Button 
            onClick={handleGenerateAll}
            disabled={isGenerating || !jobDescription.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate All Documents"}
          </Button>
        </div>
        <CardDescription>
          Generate resume, cover letter, and email template optimized for {country} market
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Enhancement Section */}
        {Object.keys(documents).length > 0 && (
          <Card className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <EditIcon className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-orange-800">Enhance Documents</CardTitle>
              </div>
              <CardDescription className="text-orange-700">
                Provide feedback or specific requests to improve your documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="enhancement" className="text-sm font-medium text-orange-800">
                    Enhancement Instructions
                  </Label>
                  <Textarea
                    id="enhancement"
                    placeholder="e.g., 'Add more technical details about React projects', 'Make the tone more formal', 'Emphasize leadership experience', 'Add specific metrics and numbers'..."
                    value={enhancementPrompt}
                    onChange={(e) => setEnhancementPrompt(e.target.value)}
                    className="mt-2 border-orange-200 focus:border-orange-400"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleEnhanceDocuments}
                  disabled={isEnhancing || !enhancementPrompt.trim()}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  {isEnhancing ? "Enhancing..." : "Enhance All Documents"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {Object.keys(documents).length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resume" className="flex items-center gap-2">
                <FileTextIcon className="w-4 h-4" />
                Resume
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <DownloadIcon className="w-4 h-4" />
                PDF Preview
              </TabsTrigger>
              <TabsTrigger value="cover-letter" className="flex items-center gap-2">
                <FileIcon className="w-4 h-4" />
                Cover Letter
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <MailIcon className="w-4 h-4" />
                Email Template
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resume" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Professional Resume</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(documents.resume || '', 'Resume')}
                    >
                      Copy Text
                    </Button>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      ATS Optimized
                    </Badge>
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-white max-h-[600px] overflow-y-auto">
                  <ResumeRenderer content={documents.resume || ''} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pdf" className="mt-4">
              <PDFPreview
                resume={documents.resume || ''}
                language={language}
                country={country}
                onDownload={handleDownloadPDF}
              />
            </TabsContent>

            <TabsContent value="cover-letter" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Professional Cover Letter</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(documents.coverLetter || '', 'Cover Letter')}
                    >
                      Copy Text
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadCoverLetterPDF}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <DownloadIcon className="w-3 h-3 mr-1" />
                      PDF
                    </Button>
                    <Badge className="bg-blue-100 text-blue-800">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      {country} Format
                    </Badge>
                  </div>
                </div>
                <div className="border rounded-lg p-6 bg-white max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                    {documents.coverLetter}
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Application Email Template</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(documents.email || '', 'Email Template')}
                    >
                      Copy Email
                    </Button>
                    <Badge className="bg-purple-100 text-purple-800">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Ready to Send
                    </Badge>
                  </div>
                </div>
                <div className="border rounded-lg p-6 bg-white max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                    {documents.email}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BriefcaseIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Complete Application Package
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Generate a professional resume, cover letter, and email template all optimized 
              for your target job and market in one click.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 border rounded-lg">
                <FileTextIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium">ATS-Optimized Resume</h4>
                <p className="text-sm text-gray-600">Professional PDF-ready format</p>
              </div>
              <div className="p-4 border rounded-lg">
                <FileIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium">Tailored Cover Letter</h4>
                <p className="text-sm text-gray-600">Company-specific content</p>
              </div>
              <div className="p-4 border rounded-lg">
                <MailIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium">Professional Email</h4>
                <p className="text-sm text-gray-600">Ready-to-send template</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentGenerator;
