import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PrinterIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  StarIcon,
  ShieldCheckIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCleanPrintWindow } from "@/utils/printUtils";

interface PrintManagerProps {
  documents: {
    resume?: string;
    coverLetter?: string;
    email?: string;
  };
  language: string;
  country: string;
}

interface PrintStatus {
  isPrinting: boolean;
  progress: number;
  error?: string;
  success?: boolean;
}

const EnhancedPrintManager: React.FC<PrintManagerProps> = ({
  documents,
  language,
  country
}) => {
  const [printStatus, setPrintStatus] = useState<{[key: string]: PrintStatus}>({});
  const { toast } = useToast();

  const languageNames = {
    'en': 'English',
    'ja': 'Japanese', 
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German'
  };

  const printDocument = async (type: 'resume' | 'cover-letter' | 'email', content: string) => {
    const statusKey = type;
    
    // Reset status
    setPrintStatus(prev => ({
      ...prev,
      [statusKey]: { isPrinting: true, progress: 0, error: undefined, success: false }
    }));

    try {
      // Simulate progress for better UX
      setPrintStatus(prev => ({
        ...prev,
        [statusKey]: { ...prev[statusKey], progress: 20 }
      }));

      // Generate document title
      const documentTitle = `${type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${language.toUpperCase()} - ${country}`;

      setPrintStatus(prev => ({
        ...prev,
        [statusKey]: { ...prev[statusKey], progress: 50 }
      }));

      // Create print window
      await createCleanPrintWindow(content, documentTitle);

      setPrintStatus(prev => ({
        ...prev,
        [statusKey]: { ...prev[statusKey], progress: 80 }
      }));

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500));

      setPrintStatus(prev => ({
        ...prev,
        [statusKey]: { isPrinting: false, progress: 100, success: true }
      }));

      toast({
        title: "Print Window Opened",
        description: `${type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} is ready for printing`,
      });

      // Reset success status after 3 seconds
      setTimeout(() => {
        setPrintStatus(prev => ({
          ...prev,
          [statusKey]: { isPrinting: false, progress: 0, success: false }
        }));
      }, 3000);

    } catch (error) {
      console.error(`Error printing ${type}:`, error);
      
      setPrintStatus(prev => ({
        ...prev,
        [statusKey]: { 
          isPrinting: false, 
          progress: 0, 
          error: error instanceof Error ? error.message : 'Print failed',
          success: false 
        }
      }));

      toast({
        title: "Print Failed",
        description: `Failed to open print window for ${type.replace('-', ' ')}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const printAll = async () => {
    if (!documents.resume) {
      toast({
        title: "No Documents",
        description: "Please generate documents first.",
        variant: "destructive",
      });
      return;
    }

    // Print resume first
    await printDocument('resume', documents.resume);
    
    // Print cover letter if available
    if (documents.coverLetter) {
      setTimeout(() => printDocument('cover-letter', documents.coverLetter!), 1000);
    }
  };

  const getDocumentIcon = (type: string) => {
    const status = printStatus[type];
    if (status?.success) return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
    if (status?.error) return <AlertCircleIcon className="w-4 h-4 text-red-600" />;
    if (status?.isPrinting) return <RefreshCwIcon className="w-4 h-4 animate-spin text-blue-600" />;
    return <FileTextIcon className="w-4 h-4 text-gray-600" />;
  };

  const getButtonText = (type: string) => {
    const status = printStatus[type];
    if (status?.success) return "Printed";
    if (status?.isPrinting) return "Printing...";
    if (status?.error) return "Retry Print";
    return "Print Document";
  };

  return (
    <Card className="w-full border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PrinterIcon className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-blue-800">Professional Document Printing</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-white">
              {languageNames[language as keyof typeof languageNames] || language}
            </Badge>
            <Badge variant="outline" className="text-xs bg-white">
              {country}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-blue-700">
          Print your professional documents with clean, ATS-friendly formatting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ATS Features */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800">ATS Compatible</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <StarIcon className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800">Keyword Optimized</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircleIcon className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800">Clean Format</span>
          </div>
        </div>

        {/* Print All Button */}
        <Button 
          onClick={printAll}
          disabled={!documents.resume || printStatus.resume?.isPrinting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <PrinterIcon className="w-4 h-4 mr-2" />
          Print All Documents
        </Button>

        {/* Individual Print Options */}
        <div className="space-y-3">
          {/* Resume */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              {getDocumentIcon('resume')}
              <div>
                <h4 className="font-medium text-gray-900">Resume</h4>
                <p className="text-sm text-gray-600">Professional resume optimized for ATS systems</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {printStatus.resume?.isPrinting && (
                <div className="w-24">
                  <Progress value={printStatus.resume.progress} className="h-2" />
                </div>
              )}
              <Button
                onClick={() => printDocument('resume', documents.resume!)}
                disabled={!documents.resume || printStatus.resume?.isPrinting}
                variant={printStatus.resume?.success ? "outline" : "default"}
                size="sm"
              >
                {getButtonText('resume')}
              </Button>
            </div>
          </div>

          {/* Cover Letter */}
          {documents.coverLetter && (
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                {getDocumentIcon('cover-letter')}
                <div>
                  <h4 className="font-medium text-gray-900">Cover Letter</h4>
                  <p className="text-sm text-gray-600">Personalized cover letter for the position</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {printStatus['cover-letter']?.isPrinting && (
                  <div className="w-24">
                    <Progress value={printStatus['cover-letter'].progress} className="h-2" />
                  </div>
                )}
                <Button
                  onClick={() => printDocument('cover-letter', documents.coverLetter!)}
                  disabled={printStatus['cover-letter']?.isPrinting}
                  variant={printStatus['cover-letter']?.success ? "outline" : "default"}
                  size="sm"
                >
                  {getButtonText('cover-letter')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {Object.entries(printStatus).map(([type, status]) => 
          status.error && (
            <div key={type} className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">
                  Failed to print {type.replace('-', ' ')}: {status.error}
                </span>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedPrintManager;
