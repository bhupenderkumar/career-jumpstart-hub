import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RocketIcon, 
  SparklesIcon, 
  ZapIcon, 
  BrainIcon,
  TargetIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  SendIcon
} from "lucide-react";
import EnhancedJobScraper from "@/components/EnhancedJobScraper";
import JSearchTest from "@/components/JSearchTest";
import { getUserEnvVar } from '../services/env';

const SuperJobSearch = () => {
  const [activeTab, setActiveTab] = useState("search");

  const features = [
    {
      icon: SearchIcon,
      title: "Advanced Search & Filters",
      description: "Search across 8+ job sources with smart filters for location, salary, company, and more",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: BrainIcon,
      title: "One-Click AI Resume",
      description: "Generate tailored resumes instantly using AI that analyzes job descriptions",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: ZapIcon,
      title: "Easy Apply Detection",
      description: "Automatically identify jobs with simplified application processes",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: TargetIcon,
      title: "Email Extraction",
      description: "Auto-detect contact emails in job descriptions for direct applications",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      icon: DownloadIcon,
      title: "Instant PDF Download",
      description: "Download AI-generated resumes as professional PDFs with one click",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    {
      icon: TrendingUpIcon,
      title: "Application Tracking",
      description: "Track all applications with status updates and follow-up reminders",
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-900/20"
    }
  ];

  const quickStats = [
    { label: "Job Sources", value: "8+", description: "LinkedIn, Indeed, Glassdoor & more" },
    { label: "AI Speed", value: "<30s", description: "Generate tailored resume" },
    { label: "Success Rate", value: "95%", description: "ATS-optimized resumes" },
    { label: "Time Saved", value: "80%", description: "Faster job applications" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <RocketIcon className="w-16 h-16 animate-bounce" />
            </div>
            <h1 className="text-6xl font-bold mb-6">Super Job Search</h1>
            <p className="text-2xl mb-4 opacity-90">
              🚀 AI-Powered Job Search with One-Click Resume Generation
            </p>
            <p className="text-lg opacity-80 mb-8">
              Search LinkedIn + 8 job sources, generate AI resumes instantly, and apply with one click.
              Speed up your job search by 10x with intelligent automation.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {quickStats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                  <div className="text-xs opacity-80">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">🔍 Job Search</TabsTrigger>
            <TabsTrigger value="features">✨ Features</TabsTrigger>
            <TabsTrigger value="api-test">🧪 API Test</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Quick Start Guide */}
            <Card className="border-2 border-dashed border-blue-300 bg-blue-50 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-blue-600" />
                  🚀 Quick Start Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <div className="font-medium">Search Jobs</div>
                      <div className="text-gray-600">Use filters to find relevant positions</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <div className="font-medium">Click "🚀 AI Resume"</div>
                      <div className="text-gray-600">Generate tailored resume instantly</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <div className="font-medium">Download & Apply</div>
                      <div className="text-gray-600">Get PDF and apply with one click</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Job Scraper */}
            <EnhancedJobScraper />
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Supercharge Your Job Search</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Advanced features designed to speed up your job application process
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                          <IconComponent className={`w-6 h-6 ${feature.color}`} />
                        </div>
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Workflow Demo */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RocketIcon className="w-5 h-5 text-purple-600" />
                  Complete Workflow Demo
                </CardTitle>
                <CardDescription>
                  See how the entire process works from search to application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <SearchIcon className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">1. Smart Job Search</div>
                      <div className="text-sm text-gray-600">Search across LinkedIn, Indeed, Glassdoor with advanced filters</div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <BrainIcon className="w-8 h-8 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">2. AI Resume Generation</div>
                      <div className="text-sm text-gray-600">One-click AI analyzes job description and creates tailored resume</div>
                    </div>
                    <Badge variant="secondary">AI Powered</Badge>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <DownloadIcon className="w-8 h-8 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">3. Instant PDF Download</div>
                      <div className="text-sm text-gray-600">Professional PDF with ATS optimization and job-specific keywords</div>
                    </div>
                    <Badge variant="secondary">PDF Ready</Badge>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <SendIcon className="w-8 h-8 text-orange-600" />
                    <div className="flex-1">
                      <div className="font-medium">4. Quick Apply</div>
                      <div className="text-sm text-gray-600">Apply directly or via LinkedIn Easy Apply with tracking</div>
                    </div>
                    <Badge variant="secondary">One Click</Badge>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <TrendingUpIcon className="w-8 h-8 text-pink-600" />
                    <div className="flex-1">
                      <div className="font-medium">5. Application Tracking</div>
                      <div className="text-sm text-gray-600">Track status, set reminders, and manage your job search pipeline</div>
                    </div>
                    <Badge variant="secondary">Organized</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-test" className="space-y-6">
            <JSearchTest />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SuperJobSearch;
