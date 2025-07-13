import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileTextIcon, 
  DownloadIcon, 
  EyeIcon,
  CheckCircleIcon 
} from "lucide-react";

interface PDFPreviewProps {
  resume: string;
  language: string;
  country: string;
  onDownload?: () => void;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ resume, language, country, onDownload }) => {
  // Extract name and role for filename preview
  const extractNameAndRole = (resumeText: string): { name: string; role: string } => {
    const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line);
    
    let name = 'Resume';
    if (lines.length > 0) {
      name = lines[0]
        .replace(/\*\*/g, '')
        .replace(/[^a-zA-Z\s]/g, '')
        .trim()
        .split(' ')
        .slice(0, 2)
        .join('_')
        .toLowerCase();
    }
    
    let role = 'professional';
    const roleKeywords = [
      'engineer', 'developer', 'architect', 'manager', 'lead', 'senior', 'junior',
      'analyst', 'consultant', 'specialist', 'coordinator', 'director', 'designer',
      'full stack', 'backend', 'frontend', 'software', 'web', 'mobile', 'devops',
      'data', 'machine learning', 'ai', 'blockchain', 'cloud'
    ];
    
    const resumeTextLower = resumeText.toLowerCase();
    for (const keyword of roleKeywords) {
      if (resumeTextLower.includes(keyword)) {
        role = keyword.replace(/\s+/g, '_');
        break;
      }
    }
    
    return { name: name || 'resume', role };
  };

  const { name, role } = extractNameAndRole(resume);
  const countryCode = country.toLowerCase().replace(/[^a-z]/g, '');
  const fileName = `${name}_${role}_${countryCode}_resume.pdf`;

  // Parse resume for preview
  const parseResumeForPreview = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const sections: { [key: string]: string[] } = {};
    let currentSection = 'header';
    let headerInfo: string[] = [];

    lines.forEach((line, index) => {
      if (line.match(/^[A-Z\s&]+$/) && line.length > 3) {
        currentSection = line.toLowerCase().replace(/[^a-z]/g, '');
        sections[currentSection] = [];
      } else if (index < 5 && !line.match(/^[A-Z\s&]+$/)) {
        headerInfo.push(line);
      } else {
        if (!sections[currentSection]) {
          sections[currentSection] = [];
        }
        sections[currentSection].push(line);
      }
    });

    return { sections, headerInfo };
  };

  const { sections, headerInfo } = parseResumeForPreview(resume);

  const cleanText = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .trim();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FileTextIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Professional PDF Resume</h2>
              <p className="text-blue-100">Optimized for {country} market • ATS-friendly format</p>
            </div>
          </div>
          <Badge className="bg-green-500 text-white px-3 py-1">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Ready to Download
          </Badge>
        </div>
      </div>

      {/* Download Section */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-900">Download Your Resume</CardTitle>
              <CardDescription className="text-blue-700">
                Professional PDF ready for job applications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* File Information */}
            <div className="bg-white rounded-lg border border-blue-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-blue-900">File Details</h3>
                <code className="text-sm bg-blue-100 px-3 py-1 rounded-full text-blue-800 font-medium">
                  {fileName}
                </code>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">PDF</div>
                  <div className="text-sm text-blue-700">Format</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">1</div>
                  <div className="text-sm text-green-700">Page</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">A4</div>
                  <div className="text-sm text-purple-700">Size</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">ATS</div>
                  <div className="text-sm text-orange-700">Optimized</div>
                </div>
              </div>
            </div>

            {/* Download Button - Only show if onDownload is provided */}
            {onDownload && (
              <div className="text-center">
                <Button
                  onClick={onDownload}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  Download Professional PDF
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Click to download your ATS-optimized resume
                </p>
              </div>
            )}

            {/* Resume Preview */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Resume Preview</h3>
                  <Badge variant="outline" className="text-gray-600">
                    <EyeIcon className="w-3 h-3 mr-1" />
                    Preview
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <div className="space-y-4 text-sm">
                    {/* Header Preview */}
                    {headerInfo.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                        <h1 className="text-lg font-bold text-blue-700 mb-1">
                          {cleanText(headerInfo[0])}
                        </h1>
                        {headerInfo[1] && (
                          <p className="text-sm text-gray-700 mb-2">
                            {cleanText(headerInfo[1])}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 space-y-1">
                          {headerInfo.slice(2).map((contact, index) => (
                            <p key={index} className="flex items-center gap-2">
                              <span className="text-blue-500">●</span>
                              {cleanText(contact)}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sections Preview */}
                    {Object.entries(sections).map(([sectionKey, content]) => {
                      if (content.length === 0) return null;

                      const sectionTitle = sectionKey
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        .replace(/^./, str => str.toUpperCase());

                      return (
                        <div key={sectionKey} className="bg-white p-4 rounded-lg">
                          <h3 className="text-sm font-bold text-blue-700 border-b border-blue-200 pb-2 mb-3">
                            {sectionTitle.toUpperCase()}
                          </h3>
                          <div className="space-y-2">
                            {content.slice(0, 3).map((item, index) => (
                              <p key={index} className="text-xs text-gray-600 leading-relaxed pl-2 border-l-2 border-gray-200">
                                {cleanText(item).substring(0, 120)}
                                {cleanText(item).length > 120 ? '...' : ''}
                              </p>
                            ))}
                            {content.length > 3 && (
                              <p className="text-xs text-blue-500 italic font-medium">
                                +{content.length - 3} more items in full PDF...
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">ATS-Optimized</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Professional Design</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <CheckCircleIcon className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">One-Page Format</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <CheckCircleIcon className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">{country} Ready</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFPreview;
