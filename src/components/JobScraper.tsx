import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCwIcon, 
  CopyIcon, 
  ExternalLinkIcon, 
  SearchIcon,
  BriefcaseIcon,
  MapPinIcon,
  DollarSignIcon,
  ClockIcon,
  BuildingIcon,
  LinkedinIcon
} from "lucide-react";
import { Job, JobScrapingResult, scrapeWeb3Jobs, fetchJobDescription } from "@/utils/jobScraper";

const JobScraper = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingDescriptions, setLoadingDescriptions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadJobs();
  }, [currentPage]);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const result: JobScrapingResult = await scrapeWeb3Jobs(currentPage);
      setJobs(result.jobs);
      setTotalCount(result.totalCount);
      setHasNextPage(result.hasNextPage);
      
      toast({
        title: "Jobs Loaded",
        description: `Found ${result.jobs.length} jobs on page ${currentPage}`,
      });
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Error Loading Jobs",
        description: "Failed to load jobs. Using sample data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyJobDescription = async (job: Job) => {
    const jobId = job.id;
    setLoadingDescriptions(prev => new Set(prev).add(jobId));
    
    try {
      let description = job.description;
      
      // If description is empty, fetch it
      if (!description || description.trim() === '') {
        description = await fetchJobDescription(job.applyUrl);
      }
      
      const fullJobText = `
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Salary: ${job.salary}
Posted: ${job.postedTime}
Tags: ${job.tags.join(', ')}

Job Description:
${description}

Apply at: ${job.applyUrl}
      `.trim();
      
      await navigator.clipboard.writeText(fullJobText);
      
      toast({
        title: "Job Description Copied",
        description: `${job.title} at ${job.company} copied to clipboard`,
      });
    } catch (error) {
      console.error('Error copying job description:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy job description to clipboard",
        variant: "destructive",
      });
    } finally {
      setLoadingDescriptions(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const openApplyPage = (url: string, jobTitle: string, company: string) => {
    try {
      // Try to open the direct URL first
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

      // If popup was blocked or failed, provide alternative
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback: show toast with manual instructions
        toast({
          title: "Apply to " + company,
          description: `Please visit ${company}'s career page manually: ${url}`,
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('Error opening apply page:', error);

      // Fallback: provide search instructions
      toast({
        title: "Apply Manually",
        description: `Search for "${jobTitle}" at ${company} on LinkedIn, Indeed, or the company's career page.`,
        duration: 8000,
      });
    }
  };

  const searchOnLinkedIn = (jobTitle: string, company: string) => {
    const searchQuery = encodeURIComponent(`${jobTitle} ${company}`);
    const linkedInUrl = `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5 text-blue-600" />
            <CardTitle>Web3 Java Jobs</CardTitle>
          </div>
          <Button 
            onClick={loadJobs}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCwIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        <CardDescription>
          Browse and apply to {totalCount.toLocaleString()} Java jobs posted in the last 24 hours • Page {currentPage}
        </CardDescription>
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300">
          🕒 <strong>Fresh Java Jobs:</strong> Showing only jobs posted in the last 24 hours from real companies.
          Click "Apply Now" to visit the company's official career page or use "Search on LinkedIn" for more options.
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search jobs by title, company, location, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCwIcon className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
            <p className="text-muted-foreground">Loading Web3 jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BriefcaseIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No jobs found matching your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <BuildingIcon className="w-4 h-4" />
                          {job.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSignIcon className="w-4 h-4" />
                          {job.salary}
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {job.postedTime}
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.tags.slice(0, 6).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {job.tags.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.tags.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <Button
                        onClick={() => copyJobDescription(job)}
                        disabled={loadingDescriptions.has(job.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <CopyIcon className="w-4 h-4 mr-2" />
                        {loadingDescriptions.has(job.id) ? 'Copying...' : 'Copy Description'}
                      </Button>
                      <Button
                        onClick={() => openApplyPage(job.applyUrl, job.title, job.company)}
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <ExternalLinkIcon className="w-4 h-4 mr-2" />
                        Apply Now
                      </Button>
                    </div>
                    <Button
                      onClick={() => searchOnLinkedIn(job.title, job.company)}
                      variant="outline"
                      size="sm"
                      className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <LinkedinIcon className="w-4 h-4 mr-2" />
                      Search on LinkedIn
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredJobs.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {filteredJobs.length} of {totalCount.toLocaleString()} jobs
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!hasNextPage}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobScraper;
