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
  onDownload: () => void;
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
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-green-600" />
            <CardTitle className="text-green-800">PDF Preview</CardTitle>
          </div>
          <Badge className="bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Ready to Download
          </Badge>
        </div>
        <CardDescription className="text-green-700">
          Preview of your professional PDF resume optimized for {country}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* File Info */}
          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-800">File Name:</span>
              <code className="text-sm bg-green-100 px-2 py-1 rounded text-green-700">
                {fileName}
              </code>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Format:</span>
                <p className="font-medium">Professional PDF</p>
              </div>
              <div>
                <span className="text-gray-600">Pages:</span>
                <p className="font-medium">1 Page</p>
              </div>
              <div>
                <span className="text-gray-600">Optimized for:</span>
                <p className="font-medium">{country} Market</p>
              </div>
            </div>
          </div>

          {/* PDF Preview */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4 max-h-96 overflow-y-auto">
            <div className="space-y-3 text-xs">
              {/* Header Preview */}
              {headerInfo.length > 0 && (
                <div className="bg-gray-50 p-3 rounded">
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
                      <p key={index}>{cleanText(contact)}</p>
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
                  <div key={sectionKey} className="space-y-1">
                    <h3 className="text-sm font-bold text-blue-700 border-b border-green-300 pb-1">
                      {sectionTitle.toUpperCase()}
                    </h3>
                    <div className="space-y-1 ml-2">
                      {content.slice(0, 3).map((item, index) => (
                        <p key={index} className="text-xs text-gray-600 leading-relaxed">
                          {cleanText(item).substring(0, 100)}
                          {cleanText(item).length > 100 ? '...' : ''}
                        </p>
                      ))}
                      {content.length > 3 && (
                        <p className="text-xs text-gray-400 italic">
                          +{content.length - 3} more items...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Download Button */}
          <div className="flex gap-3">
            <Button 
              onClick={onDownload} 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download Professional PDF
            </Button>
            <Button variant="outline" size="sm" className="border-green-300 text-green-700">
              <EyeIcon className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-green-700">
              <CheckCircleIcon className="w-3 h-3" />
              <span>ATS-Optimized</span>
            </div>
            <div className="flex items-center gap-1 text-green-700">
              <CheckCircleIcon className="w-3 h-3" />
              <span>Professional Design</span>
            </div>
            <div className="flex items-center gap-1 text-green-700">
              <CheckCircleIcon className="w-3 h-3" />
              <span>One-Page Format</span>
            </div>
            <div className="flex items-center gap-1 text-green-700">
              <CheckCircleIcon className="w-3 h-3" />
              <span>{country} Market Ready</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFPreview;
