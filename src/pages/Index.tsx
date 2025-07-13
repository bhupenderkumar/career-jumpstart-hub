import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTextIcon, SparklesIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ResumeUpload from "@/components/ResumeUpload";
import ResumeViewer from "@/components/ResumeViewer";
import ResumeRenderer from "@/components/ResumeRenderer";
import AIInsights from "@/components/AIInsights";
import LoadingAnimation from "@/components/LoadingAnimation";
import LanguageSelector from "@/components/LanguageSelector";
import DocumentGenerator from "@/components/DocumentGenerator";
import { generateResumeWithAI } from "@/services/geminiAI";
import { getUserEnvVarAsync, setUserEnvVarAsync, enableDemoMode, disableDemoMode, isDemoModeEnabled } from '../services/env';
import { Settings2Icon } from 'lucide-react';

const REQUIRED_KEYS = [
  { key: 'VITE_GEMINI_API_KEY', label: 'Gemini API Key' },
];

const Index = () => {
  const [jobDetails, setJobDetails] = useState("");
  const [generatedResume, setGeneratedResume] = useState("");
  const [baseResume, setBaseResume] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const [previousResume, setPreviousResume] = useState("");
  const [generationStage, setGenerationStage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedCountry, setSelectedCountry] = useState("International");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInputs, setKeyInputs] = useState<{[key:string]: string}>({});
  const [checkingKeys, setCheckingKeys] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const { toast } = useToast();

  // Load applications from localStorage
  const loadApplications = () => {
    try {
      const savedApplications = localStorage.getItem("applications");
      if (savedApplications) {
        const parsedApplications = JSON.parse(savedApplications);
        setApplications(Array.isArray(parsedApplications) ? parsedApplications : []);
        console.log(`📋 Loaded ${parsedApplications.length} applications from storage`);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    }
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedJobDetails = localStorage.getItem("jobDetails");
    const savedResume = localStorage.getItem("generatedResume");
    if (savedJobDetails) {
      setJobDetails(savedJobDetails);
    }
    if (savedResume) {
      setGeneratedResume(savedResume);
    }

    // Load applications
    loadApplications();

    // Listen for application updates
    const handleApplicationsUpdated = () => {
      console.log('📋 Applications updated event received, reloading...');
      loadApplications();
    };

    window.addEventListener('applicationsUpdated', handleApplicationsUpdated);

    // Check if API key is configured
    getUserEnvVarAsync('VITE_GEMINI_API_KEY').then(apiKey => {
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        setShowApiKeyWarning(true);
      }
    });

    // Cleanup event listener
    return () => {
      window.removeEventListener('applicationsUpdated', handleApplicationsUpdated);
    };
  }, []);

  // Save job details to localStorage whenever it changes
  useEffect(() => {
    if (jobDetails) {
      localStorage.setItem("jobDetails", jobDetails);
    }
  }, [jobDetails]);

  // On mount, check for all required keys and demo mode
  useEffect(() => {
    (async () => {
      let missing = false;
      const newInputs: {[key:string]: string} = {};
      const demoMode = await isDemoModeEnabled();
      setIsDemoMode(demoMode);

      for (const { key } of REQUIRED_KEYS) {
        const value = await getUserEnvVarAsync(key);
        if (!value && !demoMode) missing = true;
        newInputs[key] = value || '';
      }
      setKeyInputs(newInputs);
      setShowKeyModal(missing && !demoMode);
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
    try {
      console.log('💾 Saving API keys...', keyInputs);

      for (const { key } of REQUIRED_KEYS) {
        if (keyInputs[key]) {
          console.log(`💾 Saving ${key}: ${keyInputs[key].substring(0, 10)}...`);
          await setUserEnvVarAsync(key, keyInputs[key]);
        }
      }

      console.log('🔄 Disabling demo mode...');
      await disableDemoMode(); // Disable demo mode when user saves their own keys

      console.log('✅ Keys saved successfully');
      setShowKeyModal(false);

      toast({
        title: "API Key Saved",
        description: "Your API key has been saved successfully!",
      });

      // Small delay before reload to show the toast
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Error saving keys:', error);
      toast({
        title: "Save Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUseDemoKey = async () => {
    await enableDemoMode();
    setIsDemoMode(true);
    setShowKeyModal(false);
    toast({
      title: "Demo Mode Enabled",
      description: "You're now using the demo API key. Perfect for testing the application!",
    });
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
                  <span>Multi-Language Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>Resume Parser</span>
                </div>
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>Professional PDF Export</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className="container mx-auto px-4 py-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <SparklesIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-800 mb-2">Demo Mode Active</h3>
                    <p className="text-blue-700 text-sm mb-3">
                      You're currently using the demo API key. Perfect for testing the application!
                      You can configure your own API key anytime using the settings button.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => setShowKeyModal(true)}
                    >
                      Configure My Own API Key
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Key Warning */}
        {showApiKeyWarning && !isDemoMode && (
          <div className="container mx-auto px-4 py-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <SparklesIcon className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-800 mb-2">AI Configuration Required</h3>
                    <p className="text-orange-700 text-sm mb-3">
                      To use the AI resume generation feature, you need to configure your Google Gemini API key or use our demo key.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        onClick={() => setShowKeyModal(true)}
                      >
                        Set Up API Key
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        onClick={() => setShowApiKeyWarning(false)}
                      >
                        I'll set this up later
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <FileTextIcon className="w-4 h-4" />
                Generate Resume
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <FileTextIcon className="w-4 h-4" />
                Applications
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
              <Card>
                <CardHeader>
                  <CardTitle>Application Tracker ({applications.length})</CardTitle>
                  <CardDescription>
                    Track your resume applications and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No applications tracked yet. Generate resumes and track your applications here!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{app.jobTitle}</h3>
                              <p className="text-gray-600">{app.company}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm text-gray-500">
                                {new Date(app.timestamp).toLocaleDateString()}
                              </span>
                              <div className="text-sm text-blue-600 mt-1">
                                Language: {app.language.toUpperCase()} | {app.country}
                              </div>
                            </div>
                          </div>

                          <div className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {app.jobDescription.substring(0, 200)}...
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              Resume Generated
                            </span>
                            {app.coverLetter && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                Cover Letter
                              </span>
                            )}
                            {app.email && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                Email Template
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(app);
                                setShowResumeModal(true);
                              }}
                            >
                              View Resume
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedApplications = applications.filter(a => a.id !== app.id);
                                setApplications(updatedApplications);
                                localStorage.setItem("applications", JSON.stringify(updatedApplications));
                                toast({
                                  title: "Application Deleted",
                                  description: "Application has been removed from your tracker.",
                                });
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
              <p className="mb-4 text-sm text-gray-600">Enter your API keys below or use the demo key for testing.</p>

              {/* Demo Mode Option */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Demo Mode Available</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Want to try the application without setting up your own API key? Use our demo key for testing!
                </p>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  onClick={handleUseDemoKey}
                >
                  Use Demo Key for Testing
                </button>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Or Enter Your Own API Key:</h3>
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
                        placeholder="Enter your own API key"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save My Key</button>
                    <button type="button" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300" onClick={() => setShowKeyModal(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Resume Modal */}
        {showResumeModal && selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <div>
                  <h2 className="text-lg font-bold">{selectedApplication.jobTitle}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedApplication.company} | {selectedApplication.language.toUpperCase()} | {selectedApplication.country}
                  </p>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={() => {
                    setShowResumeModal(false);
                    setSelectedApplication(null);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                <ResumeRenderer content={selectedApplication.resume} />
              </div>
              <div className="flex justify-end gap-2 p-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResumeModal(false);
                    setSelectedApplication(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // Copy resume to clipboard
                    navigator.clipboard.writeText(selectedApplication.resume);
                    toast({
                      title: "Resume Copied",
                      description: "Resume content has been copied to clipboard.",
                    });
                  }}
                >
                  Copy to Clipboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Index;
