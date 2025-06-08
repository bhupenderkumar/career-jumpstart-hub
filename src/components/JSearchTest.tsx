import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  SearchIcon,
  BriefcaseIcon,
  MapPinIcon,
  DollarSignIcon,
  ClockIcon,
  BuildingIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LinkedinIcon,
  MailIcon,
  ZapIcon
} from "lucide-react";
import { Job, JobScrapingResult, scrapeWeb3Jobs } from "@/utils/jobScraper";
import { getUserEnvVar } from '../services/env';

const JSearchTest = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("javascript");
  const [apiStatus, setApiStatus] = useState<'unknown' | 'working' | 'error'>('unknown');
  const { toast } = useToast();

  const testJSearchAPI = async () => {
    setIsLoading(true);
    setApiStatus('unknown');
    
    try {
      console.log(`Testing JSearch API with search term: ${searchTerm}`);
      const result: JobScrapingResult = await scrapeWeb3Jobs(1, searchTerm);
      
      setJobs(result.jobs);
      
      if (result.jobs.length > 0) {
        setApiStatus('working');
        toast({
          title: "JSearch API Working! 🎉",
          description: `Found ${result.jobs.length} ${searchTerm} jobs from LinkedIn and other sources`,
        });
      } else {
        setApiStatus('error');
        toast({
          title: "No Jobs Found",
          description: "API is working but no jobs found for this search term",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('JSearch API test error:', error);
      setApiStatus('error');
      toast({
        title: "API Test Failed",
        description: "Check console for error details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAPIStatusInfo = () => {
    const rapidApiKey = getUserEnvVar('VITE_RAPIDAPI_KEY');
    
    if (!rapidApiKey) {
      return {
        status: 'error',
        message: 'RapidAPI key not configured',
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        icon: AlertCircleIcon
      };
    }
    
    if (apiStatus === 'working') {
      return {
        status: 'working',
        message: 'JSearch API is working correctly',
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        icon: CheckCircleIcon
      };
    }
    
    if (apiStatus === 'error') {
      return {
        status: 'error',
        message: 'API test failed - check console for details',
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        icon: AlertCircleIcon
      };
    }
    
    return {
      status: 'unknown',
      message: 'Click "Test API" to check JSearch integration',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      icon: BriefcaseIcon
    };
  };

  const statusInfo = getAPIStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5 text-blue-600" />
            JSearch API Test (LinkedIn Alternative)
          </CardTitle>
          <CardDescription>
            Test the JSearch API integration to verify LinkedIn job data access
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* API Status */}
          <div className={`p-4 rounded-lg ${statusInfo.bgColor}`}>
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
              <span className={`font-medium ${statusInfo.color}`}>
                {statusInfo.message}
              </span>
            </div>
            {getUserEnvVar('VITE_RAPIDAPI_KEY') && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                API Key: {getUserEnvVar('VITE_RAPIDAPI_KEY').substring(0, 8)}...
              </div>
            )}
          </div>

          {/* Search Controls */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search for jobs (e.g., javascript, python, react)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && testJSearchAPI()}
              />
            </div>
            <Button 
              onClick={testJSearchAPI} 
              disabled={isLoading || !getUserEnvVar('VITE_RAPIDAPI_KEY')}
            >
              <SearchIcon className="w-4 h-4 mr-2" />
              {isLoading ? 'Testing...' : 'Test API'}
            </Button>
          </div>

          {/* Results */}
          {jobs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Found {jobs.length} jobs from JSearch API:
              </h3>
              
              {jobs.map((job) => (
                <Card key={job.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{job.title}</h4>
                          {job.easyApply && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <ZapIcon className="w-3 h-3 mr-1" />
                              Easy Apply
                            </Badge>
                          )}
                          {job.linkedinUrl && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              <LinkedinIcon className="w-3 h-3 mr-1" />
                              LinkedIn
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
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
                          {job.contactEmail && (
                            <div className="flex items-center gap-1">
                              <MailIcon className="w-4 h-4" />
                              {job.contactEmail}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {job.description.substring(0, 200)}...
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => window.open(job.applyUrl, '_blank')}
                        variant="default"
                        size="sm"
                      >
                        <ExternalLinkIcon className="w-4 h-4 mr-2" />
                        Apply Now
                      </Button>

                      {job.linkedinUrl && (
                        <Button
                          onClick={() => window.open(job.linkedinUrl, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <LinkedinIcon className="w-4 h-4 mr-2" />
                          LinkedIn
                        </Button>
                      )}

                      {job.companyWebsite && (
                        <Button
                          onClick={() => window.open(job.companyWebsite, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <BuildingIcon className="w-4 h-4 mr-2" />
                          Company
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Instructions */}
          {!getUserEnvVar('VITE_RAPIDAPI_KEY') && (
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Setup Required
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Your RapidAPI key has been added to the .env file. Restart the development server to test the API.
              </p>
              <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                Run: <code>npm run dev</code> or refresh the page
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JSearchTest;
