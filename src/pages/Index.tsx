
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BriefcaseIcon, FileTextIcon, MapPinIcon, DownloadIcon } from "lucide-react";

const Index = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");

  const handleGenerateResume = () => {
    console.log("Generating resume for:", { jobTitle, company, location, jobDescription });
    // This will be connected to Google Gemini API later
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
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                  <CardDescription>
                    Enter the job details to generate a customized resume
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g. Senior Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      placeholder="e.g. Google, Microsoft, etc."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g. San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the complete job description here..."
                      className="min-h-[200px]"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGenerateResume} 
                    className="w-full"
                    disabled={!jobDescription.trim() || !jobTitle.trim()}
                  >
                    Generate Tailored Resume
                  </Button>
                </CardContent>
              </Card>

              {/* Resume Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Resume Preview</CardTitle>
                  <CardDescription>
                    Your AI-generated resume will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground">
                    {jobDescription.trim() ? (
                      <div className="text-center">
                        <FileTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Click "Generate Tailored Resume" to create your customized resume</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FileTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Enter job details to generate your resume</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
