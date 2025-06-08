import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BriefcaseIcon, 
  SearchIcon, 
  ZapIcon, 
  MailIcon,
  FileTextIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon
} from "lucide-react";
import EnhancedJobScraper from "@/components/EnhancedJobScraper";
import { JOB_API_CONFIG, EMAIL_TEMPLATES } from "@/config/jobApis";
import { getUserEnvVar } from '../services/env';

const JobSearchDemo = () => {
  const [activeTab, setActiveTab] = useState("search");

  const enabledAPIs = Object.entries(JOB_API_CONFIG).filter(([_, config]) => config.enabled);
  const disabledAPIs = Object.entries(JOB_API_CONFIG).filter(([_, config]) => !config.enabled);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Enhanced Job Search & Apply System
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          LinkedIn alternatives with AI-powered resume generation, email extraction, and one-click apply functionality
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Job Search</TabsTrigger>
          <TabsTrigger value="apis">API Status</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <EnhancedJobScraper />
        </TabsContent>

        <TabsContent value="apis" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  Active APIs ({enabledAPIs.length})
                </CardTitle>
                <CardDescription>
                  Currently configured and working job APIs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {enabledAPIs.map(([name, config]) => (
                  <div key={name} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold capitalize">{name}</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {config.description}
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      {config.requiresAuth ? '🔐 Requires API Key' : '🆓 Free Access'}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircleIcon className="w-5 h-5 text-orange-600" />
                  Inactive APIs ({disabledAPIs.length})
                </CardTitle>
                <CardDescription>
                  APIs that need configuration to be enabled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {disabledAPIs.map(([name, config]) => (
                  <div key={name} className="p-3 border rounded-lg opacity-60">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold capitalize">{name}</h4>
                      <Badge variant="outline">
                        Needs Setup
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {config.description}
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      {config.requiresAuth ? '🔐 Add API Key to enable' : '⚙️ Configuration needed'}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SearchIcon className="w-5 h-5 text-blue-600" />
                  Multi-Source Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Search across multiple job boards simultaneously including LinkedIn alternatives.
                </p>
                <ul className="text-xs space-y-1">
                  <li>• RemoteOK (Free)</li>
                  <li>• The Muse (Free)</li>
                  <li>• Arbeitnow (Free)</li>
                  <li>• JSearch via RapidAPI</li>
                  <li>• LinkedIn Jobs via RapidAPI</li>
                  <li>• Indeed via RapidAPI</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MailIcon className="w-5 h-5 text-green-600" />
                  Email Extraction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Automatically extract contact emails from job descriptions for direct applications.
                </p>
                <div className="text-xs space-y-1">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <code>careers@company.com</code>
                  </div>
                  <p className="text-gray-500">Auto-detected from job text</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ZapIcon className="w-5 h-5 text-yellow-600" />
                  Easy Apply Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Identify jobs with simplified application processes for faster applications.
                </p>
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <ZapIcon className="w-3 h-3 mr-1" />
                    Easy Apply
                  </Badge>
                  <p className="text-xs text-gray-500">
                    One-click application available
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5 text-purple-600" />
                  AI Resume Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Generate tailored resumes for each job application using AI.
                </p>
                <ul className="text-xs space-y-1">
                  <li>• Job-specific keywords</li>
                  <li>• ATS optimization</li>
                  <li>• Skills matching</li>
                  <li>• Format customization</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5 text-indigo-600" />
                  Application Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Track all your applications with status updates and follow-up reminders.
                </p>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs">Applied</Badge>
                  <Badge variant="outline" className="text-xs">Interview</Badge>
                  <Badge variant="outline" className="text-xs">Offer</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <InfoIcon className="w-5 h-5 text-cyan-600" />
                  Legal Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  All data collection follows legal guidelines and API terms of service.
                </p>
                <ul className="text-xs space-y-1">
                  <li>• Official APIs only</li>
                  <li>• No ToS violations</li>
                  <li>• Rate limit compliance</li>
                  <li>• User data privacy</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Setup Guide</CardTitle>
              <CardDescription>
                Configure API keys to unlock additional job sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">1. RapidAPI Setup (Recommended)</h3>
                <div className="p-4 border rounded-lg space-y-3">
                  <p className="text-sm">
                    RapidAPI provides access to LinkedIn, Indeed, and Glassdoor job data.
                  </p>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Sign up at <a href="https://rapidapi.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">RapidAPI</a></li>
                    <li>Subscribe to JSearch API (free tier available)</li>
                    <li>Get your API key from the dashboard</li>
                    <li>Add to environment: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">VITE_RAPIDAPI_KEY=your_key</code></li>
                  </ol>
                </div>

                <h3 className="text-lg font-semibold">2. Adzuna API Setup (Optional)</h3>
                <div className="p-4 border rounded-lg space-y-3">
                  <p className="text-sm">
                    Adzuna aggregates jobs from multiple sources with a generous free tier.
                  </p>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Register at <a href="https://developer.adzuna.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Adzuna Developer</a></li>
                    <li>Create an application to get App ID and Key</li>
                    <li>Add to environment:</li>
                  </ol>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                    VITE_ADZUNA_APP_ID=your_app_id<br/>
                    VITE_ADZUNA_APP_KEY=your_app_key
                  </div>
                </div>

                <h3 className="text-lg font-semibold">3. Environment File</h3>
                <div className="p-4 border rounded-lg space-y-3">
                  <p className="text-sm">Create a <code>.env</code> file in your project root:</p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                    # RapidAPI (for LinkedIn, Indeed, Glassdoor)<br/>
                    VITE_RAPIDAPI_KEY=your_rapidapi_key<br/><br/>
                    # Adzuna (optional)<br/>
                    VITE_ADZUNA_APP_ID=your_adzuna_app_id<br/>
                    VITE_ADZUNA_APP_KEY=your_adzuna_app_key
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Pro Tip</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Start with the free APIs (RemoteOK, The Muse, Arbeitnow) to test the system, 
                    then add paid APIs for more comprehensive job coverage including LinkedIn data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobSearchDemo;
