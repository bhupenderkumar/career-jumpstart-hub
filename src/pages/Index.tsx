
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BriefcaseIcon, FileTextIcon, MapPinIcon, SparklesIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ResumeUpload from "@/components/ResumeUpload";
import ResumeViewer from "@/components/ResumeViewer";

const Index = () => {
  const [jobDetails, setJobDetails] = useState("");
  const [generatedResume, setGeneratedResume] = useState("");
  const [baseResume, setBaseResume] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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
  }, []);

  // Save job details to localStorage whenever it changes
  useEffect(() => {
    if (jobDetails) {
      localStorage.setItem("jobDetails", jobDetails);
    }
  }, [jobDetails]);

  const handleGenerateResume = async (editPrompt?: string) => {
    if (!jobDetails.trim()) {
      toast({
        title: "Job Details Required",
        description: "Please enter the job details before generating a resume.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    console.log("Generating resume with Gemini AI for:", jobDetails);
    console.log("Base resume:", baseResume);
    console.log("Edit prompt:", editPrompt);
    
    try {
      // TODO: This will be connected to Google Gemini API
      // For now, we'll simulate the API call with enhanced mock data
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const isEdit = !!editPrompt;
      const baseInfo = baseResume ? "Based on your uploaded resume" : "AI-generated profile";
      const editInfo = editPrompt ? `\n\n[UPDATED BASED ON: ${editPrompt}]` : "";
      
      const mockResume = `
# ${isEdit ? 'Updated Resume' : 'AI-Generated Resume'} - ${new Date().toLocaleDateString()}

## Personal Information
${baseInfo} - Customized for the specific role and company requirements

## Professional Summary
${baseResume ? 
  "An experienced professional with the background detailed in your uploaded resume, now optimized" :
  "A qualified professional with skills aligned"
} to the requirements mentioned in your job description. This resume has been tailored to highlight relevant experience and qualifications.

## Key Skills
- Skills extracted and emphasized based on job requirements
- Technical competencies matching the role requirements
- Soft skills relevant to the position and company culture
- Industry-specific expertise highlighted from your background

## Work Experience
${baseResume ?
  "- Previous roles from your resume highlighted to match job requirements\n- Achievements from your background quantified and made relevant\n- Experience reframed to align with target position keywords" :
  "- Previous roles highlighted to match job requirements\n- Achievements quantified and relevant to the target position\n- Responsibilities aligned with job description keywords"
}

## Education & Certifications
${baseResume ?
  "- Educational background from your resume relevant to the role\n- Certifications from your profile that add value to the application" :
  "- Educational background relevant to the role\n- Certifications that add value to the application"
}

## Additional Information
- Portfolio links and professional profiles optimized for this application
- Languages and other relevant skills highlighted
- Volunteer work and projects that demonstrate relevant capabilities

${editInfo}

---
*This resume was generated using AI to match your specific job requirements${baseResume ? ' and your uploaded resume' : ''}.*
      `;
      
      setGeneratedResume(mockResume);
      localStorage.setItem("generatedResume", mockResume);
      
      toast({
        title: isEdit ? "Resume Updated" : "Resume Generated",
        description: `Your ${isEdit ? 'updated' : 'personalized'} resume has been created successfully!`,
      });
      
    } catch (error) {
      console.error("Error generating resume:", error);
      toast({
        title: "Generation Error",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Career Jumpstart Hub</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View Applications
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <FileTextIcon className="w-4 h-4" />
              Generate Resume
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4" />
              Applications
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Input Form */}
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5" />
                      AI Resume Generator
                    </CardTitle>
                    <CardDescription>
                      Paste the complete job details below. Our AI will analyze everything and create a tailored resume for you.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobDetails">Complete Job Details</Label>
                      <Textarea
                        id="jobDetails"
                        placeholder="Paste everything here - job title, company name, location, job description, requirements, etc. The more details you provide, the better your AI-generated resume will be!"
                        className="min-h-[300px]"
                        value={jobDetails}
                        onChange={(e) => setJobDetails(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleGenerateResume()} 
                        className="flex-1"
                        disabled={!jobDetails.trim() || isGenerating}
                      >
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        {isGenerating ? "Generating..." : "Generate AI Resume"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleClearData}
                        disabled={isGenerating}
                      >
                        Clear
                      </Button>
                    </div>
                    
                    {baseResume && (
                      <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                        ✓ Using your uploaded resume as base for personalization
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Resume Viewer */}
                <ResumeViewer
                  resume={generatedResume}
                  onResumeUpdate={handleResumeUpdate}
                  onRegenerateResume={handleGenerateResume}
                  isGenerating={isGenerating}
                />
              </div>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Applications</CardTitle>
                <CardDescription>
                  Track all your job applications and resume versions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BriefcaseIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No applications yet. Generate your first resume to get started!</p>
                </div>
              </CardContent>
            </Card>
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
    </div>
  );
};

export default Index;
