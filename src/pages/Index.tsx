import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BriefcaseIcon, FileTextIcon, MapPinIcon, SparklesIcon, GlobeIcon, UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ResumeUpload from "@/components/ResumeUpload";
import ResumeViewer from "@/components/ResumeViewer";
import AIInsights from "@/components/AIInsights";
import LoadingAnimation from "@/components/LoadingAnimation";
import JobScraper from "@/components/JobScraper";
import JSearchTest from "@/components/JSearchTest";
import EnhancedJobScraper from "@/components/EnhancedJobScraper";
import ContactInfoTest from "@/components/ContactInfoTest";
import LanguageSelector from "@/components/LanguageSelector";
import DocumentGenerator from "@/components/DocumentGenerator";
import ApplicationManager from "@/components/ApplicationManager";
import { generateResumeWithAI } from "@/services/geminiAI";
import { getUserEnvVarAsync, setUserEnvVarAsync } from '../services/env';
import { Settings2Icon } from 'lucide-react';

const REQUIRED_KEYS = [
  { key: 'VITE_GEMINI_API_KEY', label: 'Gemini API Key' },
  { key: 'VITE_RAPIDAPI_KEY', label: 'RapidAPI Key' },
  { key: 'VITE_ADZUNA_APP_ID', label: 'Adzuna App ID' },
  { key: 'VITE_ADZUNA_APP_KEY', label: 'Adzuna App Key' },
];

const Index = () => {
  const [jobDetails, setJobDetails] = useState("");
  const [generatedResume, setGeneratedResume] = useState("");
  const [baseResume, setBaseResume] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const [previousResume, setPreviousResume] = useState("");
  const [generationStage, setGenerationStage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedCountry, setSelectedCountry] = useState("International");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInputs, setKeyInputs] = useState<{[key:string]: string}>({});
  const [checkingKeys, setCheckingKeys] = useState(true);
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedJobDetails = localStorage.getItem("jobDetails");
    const savedResume = localStorage.getItem("generatedResume");
    const savedApplications = localStorage.getItem("applications");

    if (savedJobDetails) {
      setJobDetails(savedJobDetails);
    }
    if (savedResume) {
      setGeneratedResume(savedResume);
    }
    if (savedApplications) {
      setApplications(JSON.parse(savedApplications));
    }

    // Check if API key is configured
    getUserEnvVarAsync('VITE_GEMINI_API_KEY').then(apiKey => {
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        setShowApiKeyWarning(true);
      }
    });
  }, []);

  // Save job details to localStorage whenever it changes
  useEffect(() => {
    if (jobDetails) {
      localStorage.setItem("jobDetails", jobDetails);
    }
  }, [jobDetails]);

  // On mount, check for all required keys
  useEffect(() => {
    (async () => {
      let missing = false;
      const newInputs: {[key:string]: string} = {};
      for (const { key } of REQUIRED_KEYS) {
        const value = await getUserEnvVarAsync(key);
        if (!value) missing = true;
        newInputs[key] = value || '';
      }
      setKeyInputs(newInputs);
      setShowKeyModal(missing);
      setCheckingKeys(false);
    })();
  }, []);

  const handleGenerateResume = async (editPrompt?: string) => {
    if (!jobDetails.trim()) {
      toast({
        title: "Job Details Required",
        description: "Please enter the job details before generating a resume.",
        variant: "destructive",
      });
      return;
    }

    // Check if API key is configured
    const apiKey = await getUserEnvVarAsync('VITE_GEMINI_API_KEY');
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      toast({
        title: "API Key Required",
        description: "Please configure your Google Gemini API key to use AI resume generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    console.log("Generating resume with Gemini AI for:", jobDetails);
    console.log("Base resume:", baseResume);
    console.log("Edit prompt:", editPrompt);

    try {
      // Store previous resume for comparison
      if (generatedResume && !editPrompt) {
        setPreviousResume(generatedResume);
      }

      // Simulate stages for better UX
      const stages = ['analyzing', 'processing', 'optimizing', 'generating', 'finalizing'];

      for (let i = 0; i < stages.length; i++) {
        setGenerationStage(stages[i]);
        await new Promise(resolve => setTimeout(resolve, 800)); // Small delay for each stage
      }

      const newGeneratedResume = await generateResumeWithAI({
        jobDescription: jobDetails,
        baseResume: baseResume || undefined,
        editPrompt: editPrompt || undefined,
        language: selectedLanguage,
        country: selectedCountry
      });

      setGeneratedResume(newGeneratedResume);
      localStorage.setItem("generatedResume", newGeneratedResume);

      const isEdit = !!editPrompt;
      toast({
        title: isEdit ? "Resume Enhanced Successfully" : "Resume Generated Successfully",
        description: `Your ${isEdit ? 'enhanced' : 'AI-optimized'} resume is ready for ATS systems!`,
      });

    } catch (error) {
      console.error("Error generating resume:", error);

      let errorMessage = "Failed to generate resume. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Generation Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationStage("");
    }
  };

  const handleResumeUpdate = (newResume: string) => {
    setGeneratedResume(newResume);
    localStorage.setItem("generatedResume", newResume);
  };

  const handleBaseResumeUpdate = (resumeData: string) => {
    setBaseResume(resumeData);
  };

  const handleClearData = () => {
    setJobDetails("");
    setGeneratedResume("");
    localStorage.removeItem("jobDetails");
    localStorage.removeItem("generatedResume");
    
    toast({
      title: "Data Cleared",
      description: "All job details and generated resume have been cleared.",
    });
  };

  const handleKeyInputChange = (key: string, value: string) => {
    setKeyInputs(inputs => ({ ...inputs, [key]: value }));
  };

  const handleSaveKeys = async () => {
    for (const { key } of REQUIRED_KEYS) {
      if (keyInputs[key]) await setUserEnvVarAsync(key, keyInputs[key]);
    }
    setShowKeyModal(false);
    window.location.reload();
  };

  // Floating icon component
  function FloatingStorageIcon() {
    return (
      <button
        aria-label="API Key Settings"
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        onClick={() => setShowKeyModal(true)}
      >
        <Settings2Icon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <>
      <FloatingStorageIcon />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold mb-6">Career Jumpstart Hub</h1>
              <p className="text-xl mb-4 opacity-90">
                AI-Powered Resume Generator That Beats ATS Systems
              </p>
              <p className="text-lg opacity-80 mb-6">
                Create professionally optimized resumes that pass through Applicant Tracking Systems
                and get you shortlisted by top companies
              </p>
              <div className="flex justify-center gap-8 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>ATS-Optimized</span>
                </div>
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>Keyword Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>Professional Formatting</span>
                </div>
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>Instant PDF Export</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* API Key Warning */}
        {showApiKeyWarning && (
          <div className="container mx-auto px-4 py-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <SparklesIcon className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-800 mb-2">AI Configuration Required</h3>
                    <p className="text-orange-700 text-sm mb-3">
                      To use the AI resume generation feature, you need to configure your Google Gemini API key.
                    </p>
                    <div className="space-y-2 text-sm text-orange-700">
                      <p><strong>Steps to set up:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-4">
                        <li>Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google AI Studio</a></li>
                        <li>Create a <code className="bg-orange-100 px-1 rounded">.env</code> file in your project root</li>
                        <li>Add: <code className="bg-orange-100 px-1 rounded">VITE_GEMINI_API_KEY=your_actual_api_key</code></li>
                        <li>Restart the development server</li>
                      </ol>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                      onClick={() => setShowApiKeyWarning(false)}
                    >
                      I'll set this up later
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <FileTextIcon className="w-4 h-4" />
                Generate Resume
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4" />
                Applications
              </TabsTrigger>
              <TabsTrigger value="super-search" className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4" />
                🚀 Super Search
              </TabsTrigger>
              <TabsTrigger value="contact-test" className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Contact Test
              </TabsTrigger>
              <TabsTrigger value="web3-jobs" className="flex items-center gap-2">
                <GlobeIcon className="w-4 h-4" />
                Web3 Jobs
              </TabsTrigger>
              <TabsTrigger value="jsearch-test" className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4" />
                LinkedIn API Test
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                Locations
              </TabsTrigger>
            </TabsList>

            {/* Generate Resume Tab */}
            <TabsContent value="generate" className="mt-6">
              <div className="space-y-6">
                {/* Resume Upload Section */}
                <ResumeUpload onResumeUpdate={handleBaseResumeUpdate} />
                
                <div className="space-y-6">
                  {/* Language Selector */}
                  <LanguageSelector
                    selectedLanguage={selectedLanguage}
                    selectedCountry={selectedCountry}
                    onLanguageChange={(language, country) => {
                      setSelectedLanguage(language);
                      setSelectedCountry(country);
                    }}
                  />

                  {/* Loading Animation - Show during generation */}
                  <LoadingAnimation
                    isVisible={isGenerating}
                    stage={generationStage}
                  />

                  {/* AI Insights - Show when resume is generated */}
                  <AIInsights
                    jobDescription={jobDetails}
                    resume={generatedResume}
                    isVisible={!!generatedResume && !isGenerating}
                  />

                  <div className="space-y-6">
                    {/* Job Input Form */}
                    <Card className="animate-fade-in">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <SparklesIcon className="w-5 h-5" />
                          Job Description Input
                        </CardTitle>
                        <CardDescription>
                          Paste the complete job details below. Our AI will generate resume, cover letter, and email template.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="jobDetails">Complete Job Details</Label>
                          <Textarea
                            id="jobDetails"
                            placeholder="Paste everything here - job title, company name, location, job description, requirements, etc. The more details you provide, the better your AI-generated documents will be!"
                            className="min-h-[200px]"
                            value={jobDetails}
                            onChange={(e) => setJobDetails(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={handleClearData}
                            disabled={isGenerating}
                          >
                            Clear
                          </Button>
                        </div>

                        {baseResume && (
                          <div className="text-sm text-green-700 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <SparklesIcon className="w-4 h-4" />
                              ✓ Using your uploaded resume as base for AI personalization
                            </div>
                          </div>
                        )}

                        {!baseResume && (
                          <div className="text-sm text-blue-700 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            💡 Upload your existing resume above for better personalization, or generate from scratch using just the job description.
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Document Generator */}
                    <DocumentGenerator
                      jobDescription={jobDetails}
                      baseResume={baseResume}
                      language={selectedLanguage}
                      country={selectedCountry}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications" className="mt-6">
              <ApplicationManager />
            </TabsContent>

            {/* Super Search Tab */}
            <TabsContent value="super-search" className="mt-6">
              <EnhancedJobScraper />
            </TabsContent>

            {/* Contact Test Tab */}
            <TabsContent value="contact-test" className="mt-6">
              <ContactInfoTest />
            </TabsContent>

            {/* Web3 Jobs Tab */}
            <TabsContent value="web3-jobs" className="mt-6">
              <JobScraper />
            </TabsContent>

            {/* JSearch API Test Tab */}
            <TabsContent value="jsearch-test" className="mt-6">
              <JSearchTest />
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Locations</CardTitle>
                  <CardDescription>
                    Filter and view applications by location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPinIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No locations tracked yet. Start applying to jobs to see location data!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* API Key Setup Modal */}
        {showKeyModal && !checkingKeys && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-2">Set Up API Keys</h2>
              <p className="mb-4 text-sm text-gray-600">Enter your API keys below. These will be securely stored in your browser and can be exported/imported for use on other devices.</p>
              <form onSubmit={e => { e.preventDefault(); handleSaveKeys(); }}>
                {REQUIRED_KEYS.map(({ key, label }) => (
                  <div className="mb-3" key={key}>
                    <label className="block text-sm font-medium mb-1" htmlFor={key}>{label}</label>
                    <input
                      id={key}
                      type="text"
                      className="w-full border rounded px-2 py-1"
                      value={keyInputs[key] || ''}
                      onChange={e => handleKeyInputChange(key, e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save & Continue</button>
                  <button type="button" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setShowKeyModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Index;
