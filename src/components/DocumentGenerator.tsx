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
  SparklesIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  EditIcon,
  RefreshCwIcon,
  PrinterIcon,
  DownloadIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAllDocuments, GenerationResult } from "@/services/geminiAI";
import ResumeRenderer from "@/components/ResumeRenderer";
import CoverLetterRenderer from "@/components/CoverLetterRenderer";
import EnhancedPrintManager from "@/components/EnhancedPrintManager";
import PWADownloadPrompt from "@/components/PWADownloadPrompt";
import { createCleanPrintWindow } from "@/utils/printUtils";
import { downloadResumeAsPDF, downloadCoverLetterAsPDF, downloadEmailAsPDF, testPDFGeneration } from "@/utils/resumeDownloader";

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
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);

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
      console.log('🌍 Generating documents with language:', language, 'country:', country);
      console.log('📝 Job description length:', jobDescription.length);
      console.log('📄 Base resume provided:', !!baseResume);

      // Show language selection in toast
      const languageNames = {
        'en': 'English',
        'ja': 'Japanese',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German'
      };

      toast({
        title: "Generating Documents",
        description: `Creating documents in ${languageNames[language as keyof typeof languageNames] || language} for ${country} market...`,
      });

      const result = await generateAllDocuments({
        jobDescription,
        baseResume,
        language,
        country,
        generateType: 'all',
        onModelChange: (modelName, documentType) => {
          toast({
            title: "Trying Different AI Model",
            description: `Using ${modelName} for ${documentType} generation...`,
            duration: 2000,
          });
        }
      });

      console.log('✅ Documents generated successfully for language:', language);
      console.log('📊 Result keys:', Object.keys(result));

      // Debug: Log the actual content being set
      if (result.resume) {
        console.log('📄 Resume content length:', result.resume.length);
        console.log('📄 Resume preview (first 500 chars):', result.resume.substring(0, 500));
      }
      if (result.coverLetter) {
        console.log('📄 Cover letter content length:', result.coverLetter.length);
        console.log('📄 Cover letter preview (first 200 chars):', result.coverLetter.substring(0, 200));
      }

      setDocuments(result);

      // Save application to localStorage for tracking
      saveApplicationToStorage(result);

      toast({
        title: "Documents Generated Successfully",
        description: `Resume, cover letter, and email template are ready in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : language} for ${country} market!`,
      });
    } catch (error) {
      console.error('Document generation error:', error);

      let errorTitle = "Generation Error";
      let errorDescription = "Failed to generate documents. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('UNAVAILABLE')) {
          errorTitle = "AI Service Overloaded";
          errorDescription = "All AI models are currently overloaded. Please try again in a few minutes.";
        } else if (error.message.includes('API key')) {
          errorTitle = "API Key Error";
          errorDescription = "Please check your Gemini API key configuration.";
        } else if (error.message.includes('All Gemini models failed')) {
          errorTitle = "AI Service Unavailable";
          errorDescription = "All AI models are currently unavailable. Please try again later.";
        } else {
          errorDescription = error.message;
        }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
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
        generateType: 'all',
        onModelChange: (modelName, documentType) => {
          toast({
            title: "Trying Different AI Model",
            description: `Using ${modelName} for ${documentType} enhancement...`,
            duration: 2000,
          });
        }
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





  const handlePrintDocument = async (type: 'resume' | 'cover-letter' | 'email') => {
    const content = type === 'resume' ? documents.resume :
                   type === 'cover-letter' ? documents.coverLetter :
                   documents.email;

    if (!content) {
      toast({
        title: `No ${type.replace('-', ' ')}`,
        description: "Please generate documents first.",
        variant: "destructive",
      });
      return;
    }

    const documentTitle = type === 'resume' ? 'Resume' :
                         type === 'cover-letter' ? 'Cover Letter' :
                         'Email Template';

    try {
      // Use the enhanced print utility that renders React components
      await createCleanPrintWindow({
        title: `${documentTitle} - ${new Date().toLocaleDateString()}`,
        content: content,
        documentType: type
      });

      toast({
        title: "Print Dialog Opened",
        description: `Your ${documentTitle.toLowerCase()} is ready to print with enhanced Deedy CV formatting!`,
      });
    } catch (error) {
      toast({
        title: "Print Error",
        description: error instanceof Error ? error.message : "Failed to open print dialog. Please allow popups.",
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

  const handleDownloadResume = async () => {
    if (!documents.resume) {
      toast({
        title: "No Resume Available",
        description: "Please generate a resume first before downloading.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🚀 Starting resume download with exact UI matching...');
      console.log('📄 Resume content type:', typeof documents.resume);
      console.log('📄 Resume content length:', documents.resume?.length || 0);
      console.log('📄 Resume content preview:', documents.resume?.substring(0, 200) || 'No content');

      await downloadResumeAsPDF(documents.resume);

      toast({
        title: "Professional Resume Downloaded!",
        description: "Your resume has been saved as a full-size professional PDF with proper Deedy CV formatting and ATS-friendly layout.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Error",
        description: error instanceof Error ? error.message : "Failed to download resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCoverLetter = async () => {
    if (!documents.coverLetter) {
      toast({
        title: "No Cover Letter Available",
        description: "Please generate a cover letter first before downloading.",
        variant: "destructive",
      });
      return;
    }

    try {
      downloadCoverLetterAsPDF(documents.coverLetter);

      toast({
        title: "Cover Letter Downloaded Successfully!",
        description: "Your professional cover letter has been saved as a PDF with matching formatting.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Error",
        description: error instanceof Error ? error.message : "Failed to download cover letter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadEmail = async () => {
    if (!documents.email) {
      toast({
        title: "No Email Template Available",
        description: "Please generate an email template first before downloading.",
        variant: "destructive",
      });
      return;
    }

    try {
      downloadEmailAsPDF(documents.email);

      toast({
        title: "Email Template Downloaded Successfully!",
        description: "Your professional email template has been saved as a PDF with clean formatting.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Error",
        description: error instanceof Error ? error.message : "Failed to download email template. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Save application to localStorage for tracking
  const saveApplicationToStorage = (documents: any) => {
    try {
      // Extract job title and company from job description
      const jobLines = jobDescription.split('\n').filter(line => line.trim());
      let jobTitle = 'Unknown Position';
      let company = 'Unknown Company';

      // Enhanced job title extraction
      for (let i = 0; i < Math.min(jobLines.length, 10); i++) {
        const line = jobLines[i];

        // Look for common job title patterns
        const titleMatch = line.match(/^(job title|position|role|we are looking for|seeking|hiring|opening for)[:]\s*(.+)/i);
        if (titleMatch) {
          jobTitle = titleMatch[2].trim().substring(0, 50);
          break;
        }

        // Look for job titles in headers or emphasized text
        if (line.match(/^([A-Z][a-zA-Z\s]+(?:Engineer|Developer|Manager|Analyst|Specialist|Coordinator|Director|Consultant|Designer|Architect|Scientist|Lead|Senior|Principal|Associate|Executive))$/i)) {
          jobTitle = line.trim().substring(0, 50);
          break;
        }

        // Look for "The Role" or similar patterns
        if (line.toLowerCase().includes('the role') && jobLines[i + 1]) {
          const nextLine = jobLines[i + 1];
          if (nextLine.match(/^[A-Z][a-zA-Z\s]+/)) {
            jobTitle = nextLine.trim().substring(0, 50);
            break;
          }
        }
      }

      // Enhanced company name extraction
      for (let i = 0; i < Math.min(jobLines.length, 15); i++) {
        const line = jobLines[i];

        // Look for company name at the beginning (common in job postings)
        let companyMatch = i < 3 ? line.match(/^([A-Z][a-zA-Z\s&.,'-]{2,30})(?:\s+is|,|\s*-|\s+seeks|\s+looking)/i) : null;
        if (companyMatch) {
          company = companyMatch[1].trim().substring(0, 30);
          break;
        }

        // Look for "About [Company]" or "Join [Company]" patterns
        companyMatch = line.match(/(?:about|join|at)\s+([A-Z][a-zA-Z\s&.,'-]{2,30})(?:\s|,|\.|\n|$)/i);
        if (companyMatch) {
          company = companyMatch[1].trim().substring(0, 30);
          break;
        }

        // Look for company in context like "Company: Name" or "Organization: Name"
        companyMatch = line.match(/(?:company|organization|employer)[:]\s*([A-Z][a-zA-Z\s&.,'-]{2,30})/i);
        if (companyMatch) {
          company = companyMatch[1].trim().substring(0, 30);
          break;
        }

        // Look for "We are" or "Our company" patterns
        companyMatch = line.match(/(?:we are|our company is|our team at)\s+([A-Z][a-zA-Z\s&.,'-]{2,30})/i);
        if (companyMatch) {
          company = companyMatch[1].trim().substring(0, 30);
          break;
        }
      }

      console.log(`📋 Extracted: Job Title: "${jobTitle}", Company: "${company}"`);
      console.log(`📋 From job description preview: ${jobDescription.substring(0, 200)}...`);

      // Create application object
      const application = {
        id: Date.now().toString(),
        jobTitle,
        company,
        jobDescription,
        resume: documents.resume || '',
        coverLetter: documents.coverLetter || '',
        email: documents.email || '',
        language,
        country,
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString(),
        version: 1
      };

      // Get existing applications
      const existingApplications = JSON.parse(localStorage.getItem('applications') || '[]');

      // Add new application
      existingApplications.push(application);

      // Save back to localStorage
      localStorage.setItem('applications', JSON.stringify(existingApplications));

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('applicationsUpdated'));

      console.log('Application saved to storage:', application);
    } catch (error) {
      console.error('Error saving application:', error);
    }
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
          <Button
            onClick={() => testPDFGeneration()}
            variant="outline"
            size="sm"
            className="ml-2"
          >
            Test PDF
          </Button>
        </div>
        <div className="space-y-2">
          <CardDescription>
            Generate resume, cover letter, and email template optimized for {country} market
          </CardDescription>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : language}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {country}
            </Badge>
          </div>
        </div>
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

        {/* Enhanced Print Manager */}
        {Object.keys(documents).length > 0 && (
          <div className="mb-6">
            <EnhancedPrintManager
              documents={documents}
              language={language}
              country={country}
            />
          </div>
        )}

        {Object.keys(documents).length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="resume" className="flex items-center gap-2">
                <FileTextIcon className="w-4 h-4" />
                Resume
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintDocument('resume')}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center"
                    >
                      <PrinterIcon className="w-3 h-3 mr-1" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadResume()}
                      className="border-green-300 text-green-700 hover:bg-green-50 flex items-center"
                    >
                      <DownloadIcon className="w-3 h-3 mr-1" />
                      Download PDF
                    </Button>

                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-white max-h-[600px] overflow-y-auto">
                  <ResumeRenderer content={documents.resume || ''} />
                </div>
              </div>
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
                      onClick={() => handlePrintDocument('cover-letter')}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center"
                    >
                      <PrinterIcon className="w-3 h-3 mr-1" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCoverLetter()}
                      className="border-green-300 text-green-700 hover:bg-green-50 flex items-center"
                    >
                      <DownloadIcon className="w-3 h-3 mr-1" />
                      Download PDF
                    </Button>

                    <Badge className="bg-blue-100 text-blue-800">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      {country} Format
                    </Badge>
                  </div>
                </div>
                <div className="border rounded-lg p-6 bg-white max-h-[600px] overflow-y-auto">
                  <CoverLetterRenderer content={documents.coverLetter || ''} />
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintDocument('email')}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center"
                    >
                      <PrinterIcon className="w-3 h-3 mr-1" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadEmail()}
                      className="border-green-300 text-green-700 hover:bg-green-50 flex items-center"
                    >
                      <DownloadIcon className="w-3 h-3 mr-1" />
                      Download PDF
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

      {/* PWA Download Prompt */}
      <PWADownloadPrompt
        show={showPWAPrompt}
        onClose={() => setShowPWAPrompt(false)}
        downloadType="resume"
        fileName="resume.pdf"
      />
    </Card>
  );
};

export default DocumentGenerator;
