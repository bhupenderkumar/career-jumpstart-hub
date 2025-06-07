import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GlobeIcon, 
  MapPinIcon, 
  BriefcaseIcon,
  CheckCircleIcon 
} from "lucide-react";

interface LanguageSelectorProps {
  selectedLanguage: string;
  selectedCountry: string;
  onLanguageChange: (language: string, country: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  selectedCountry, 
  onLanguageChange 
}) => {
  const languages = [
    {
      code: 'en',
      name: 'English',
      country: 'International',
      flag: '🇺🇸',
      markets: ['USA', 'UK', 'Canada', 'Australia', 'Singapore'],
      tips: 'Standard international format, ATS-optimized'
    },
    {
      code: 'ja',
      name: 'Japanese',
      country: 'Japan',
      flag: '🇯🇵',
      markets: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'],
      tips: 'Rirekisho format, formal structure, company loyalty emphasis'
    },
    {
      code: 'es',
      name: 'Spanish',
      country: 'Spain',
      flag: '🇪🇸',
      markets: ['Madrid', 'Barcelona', 'Valencia', 'Seville'],
      tips: 'CV Europeo format, education emphasis, language skills'
    },
    {
      code: 'fr',
      name: 'French',
      country: 'France',
      flag: '🇫🇷',
      markets: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
      tips: 'CV format, photo optional, detailed education section'
    },
    {
      code: 'de',
      name: 'German',
      country: 'Germany',
      flag: '🇩🇪',
      markets: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
      tips: 'Lebenslauf format, detailed, chronological, photo expected'
    }
  ];

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GlobeIcon className="w-5 h-5 text-blue-600" />
          International Resume Generator
        </CardTitle>
        <CardDescription>
          Select target country and language for optimized international job applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedLanguage === lang.code
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
              onClick={() => onLanguageChange(lang.code, lang.country)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{lang.name}</h3>
                      <p className="text-sm text-gray-600">{lang.country}</p>
                    </div>
                  </div>
                  {selectedLanguage === lang.code && (
                    <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  )}
                </div>

                {/* Markets */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Key Markets:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lang.markets.slice(0, 3).map((market, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {market}
                      </Badge>
                    ))}
                    {lang.markets.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{lang.markets.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Tips */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <BriefcaseIcon className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Format:</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{lang.tips}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Language Info */}
        {selectedLanguage && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">
                Selected: {languages.find(l => l.code === selectedLanguage)?.name} Resume
              </span>
            </div>
            <p className="text-sm text-gray-700">
              Your resume will be generated in {languages.find(l => l.code === selectedLanguage)?.name} 
              following {languages.find(l => l.code === selectedLanguage)?.country} professional standards 
              and cultural expectations for maximum impact in international job applications.
            </p>
          </div>
        )}

        {/* IT Domain Focus */}
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <BriefcaseIcon className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">IT Domain Optimization</span>
          </div>
          <p className="text-xs text-gray-700">
            All resumes are optimized for IT professionals seeking international opportunities 
            with emphasis on technical skills, global experience, and cross-cultural collaboration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
