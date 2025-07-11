import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DownloadIcon, 
  FileTextIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  RefreshCwIcon,
  StarIcon,
  ShieldCheckIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateATSOptimizedPDF } from "@/utils/atsOptimizedPDFGenerator";

interface DownloadManagerProps {
  documents: {
    resume?: string;
    coverLetter?: string;
    email?: string;
  };
  language: string;
  country: string;
}

interface DownloadStatus {
  isDownloading: boolean;
  progress: number;
  error?: string;
  success?: boolean;
}

const EnhancedDownloadManager: React.FC<DownloadManagerProps> = ({
  documents,
  language,
  country
}) => {
  const [downloadStatus, setDownloadStatus] = useState<{[key: string]: DownloadStatus}>({});
  const { toast } = useToast();

  const languageNames = {
    'en': 'English',
    'ja': 'Japanese', 
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German'
  };

  const downloadDocument = async (type: 'resume' | 'cover-letter' | 'email', content: string) => {
    const statusKey = type;
    
    // Reset status
    setDownloadStatus(prev => ({
      ...prev,
      [statusKey]: { isDownloading: true, progress: 0, error: undefined, success: false }
    }));

    try {
      // Simulate progress for better UX
      setDownloadStatus(prev => ({
        ...prev,
        [statusKey]: { ...prev[statusKey], progress: 20 }
      }));

      // Generate filename with language and date
      const languageCode = language === 'en' ? '' : `_${language}`;
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `${type}${languageCode}_${dateStr}.pdf`;

      setDownloadStatus(prev => ({
        ...prev,
        [statusKey]: { ...prev[statusKey], progress: 50 }
      }));

      // Generate PDF
      const pdfBlob = generateATSOptimizedPDF({
        content,
        type: type as 'resume' | 'cover-letter' | 'email',
        fileName
      });

      setDownloadStatus(prev => ({
        ...prev,
        [statusKey]: { ...prev[statusKey], progress: 80 }
      }));

      // Create download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadStatus(prev => ({
        ...prev,
        [statusKey]: { isDownloading: false, progress: 100, success: true }
      }));

      toast({
        title: "Download Successful",
        description: `ATS-optimized ${type.replace('-', ' ')} downloaded as ${fileName}`,
      });

      // Reset success status after 3 seconds
      setTimeout(() => {
        setDownloadStatus(prev => ({
          ...prev,
          [statusKey]: { isDownloading: false, progress: 0, success: false }
        }));
      }, 3000);

    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      
      setDownloadStatus(prev => ({
        ...prev,
        [statusKey]: { 
          isDownloading: false, 
          progress: 0, 
          error: error instanceof Error ? error.message : 'Download failed',
          success: false 
        }
      }));

      toast({
        title: "Download Failed",
        description: `Failed to download ${type.replace('-', ' ')}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const downloadAll = async () => {
    if (!documents.resume) {
      toast({
        title: "No Documents",
        description: "Please generate documents first.",
        variant: "destructive",
      });
      return;
    }

    // Download resume first
    await downloadDocument('resume', documents.resume);
    
    // Download cover letter if available
    if (documents.coverLetter) {
      setTimeout(() => downloadDocument('cover-letter', documents.coverLetter!), 1000);
    }
  };

  const getDocumentIcon = (type: string) => {
    const status = downloadStatus[type];
    if (status?.success) return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
    if (status?.error) return <AlertCircleIcon className="w-4 h-4 text-red-600" />;
    if (status?.isDownloading) return <RefreshCwIcon className="w-4 h-4 animate-spin text-blue-600" />;
    return <FileTextIcon className="w-4 h-4 text-gray-600" />;
  };

  const getButtonText = (type: string) => {
    const status = downloadStatus[type];
    if (status?.success) return "Downloaded";
    if (status?.isDownloading) return "Downloading...";
    if (status?.error) return "Retry Download";
    return "Download PDF";
  };

  return (
    <Card className="w-full border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DownloadIcon className="w-5 h-5 text-green-600" />
            <CardTitle className="text-green-800">ATS-Optimized Downloads</CardTitle>
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
        <CardDescription className="text-green-700">
          Download your professional documents in ATS-friendly PDF format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ATS Features */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheckIcon className="w-4 h-4 text-green-600" />
            <span className="text-green-800">ATS Compatible</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <StarIcon className="w-4 h-4 text-green-600" />
            <span className="text-green-800">Keyword Optimized</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircleIcon className="w-4 h-4 text-green-600" />
            <span className="text-green-800">Clean Format</span>
          </div>
        </div>

        {/* Download All Button */}
        <Button 
          onClick={downloadAll}
          disabled={!documents.resume || downloadStatus.resume?.isDownloading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Download All Documents
        </Button>

        {/* Individual Downloads */}
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
              {downloadStatus.resume?.isDownloading && (
                <div className="w-24">
                  <Progress value={downloadStatus.resume.progress} className="h-2" />
                </div>
              )}
              <Button
                onClick={() => downloadDocument('resume', documents.resume!)}
                disabled={!documents.resume || downloadStatus.resume?.isDownloading}
                variant={downloadStatus.resume?.success ? "outline" : "default"}
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
                {downloadStatus['cover-letter']?.isDownloading && (
                  <div className="w-24">
                    <Progress value={downloadStatus['cover-letter'].progress} className="h-2" />
                  </div>
                )}
                <Button
                  onClick={() => downloadDocument('cover-letter', documents.coverLetter!)}
                  disabled={downloadStatus['cover-letter']?.isDownloading}
                  variant={downloadStatus['cover-letter']?.success ? "outline" : "default"}
                  size="sm"
                >
                  {getButtonText('cover-letter')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {Object.entries(downloadStatus).map(([type, status]) => 
          status.error && (
            <div key={type} className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">
                  Failed to download {type.replace('-', ' ')}: {status.error}
                </span>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedDownloadManager;
