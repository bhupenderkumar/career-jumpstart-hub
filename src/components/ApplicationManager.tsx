import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BriefcaseIcon,
  SearchIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  MailIcon,
  FileIcon,
  CalendarIcon,
  BuildingIcon,
  SparklesIcon,
  TrashIcon,
  RefreshCwIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAllDocuments } from "@/services/geminiAI";
import { populateSampleData, clearApplicationData } from "@/utils/sampleData";
import CoverLetterRenderer from "@/components/CoverLetterRenderer";
import ResumeRenderer from "@/components/ResumeRenderer";
import * as XLSX from 'xlsx';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  resume: string;
  coverLetter: string;
  email: string;
  language: string;
  country: string;
  date: string;
  timestamp: string;
  version: number;
}

const ApplicationManager: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadApplications();
    
    // Listen for application updates
    const handleApplicationsUpdated = () => {
      loadApplications();
    };
    
    window.addEventListener('applicationsUpdated', handleApplicationsUpdated);
    return () => window.removeEventListener('applicationsUpdated', handleApplicationsUpdated);
  }, []);

  const loadApplications = () => {
    try {
      const savedApplications = localStorage.getItem('applications');
      if (savedApplications) {
        const parsed = JSON.parse(savedApplications);
        setApplications(parsed);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    // Text search filter
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobDescription.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filter
    const appDate = new Date(app.timestamp || app.date);
    const now = new Date();
    let matchesDate = true;

    switch (dateFilter) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        matchesDate = appDate >= today && appDate < tomorrow;
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = appDate >= weekAgo;
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = appDate >= monthAgo;
        break;
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start);
          const endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          matchesDate = appDate >= startDate && appDate <= endDate;
        }
        break;
      default:
        matchesDate = true;
    }

    return matchesSearch && matchesDate;
  });

  const exportToExcel = () => {
    try {
      const exportData = applications.map(app => ({
        'Job Title': app.jobTitle,
        'Company': app.company,
        'Date Applied': app.date,
        'Language': app.language,
        'Country': app.country,
        'Version': app.version,
        'Job Description': app.jobDescription.substring(0, 500) + '...',
        'Resume Length': app.resume.length,
        'Has Cover Letter': app.coverLetter ? 'Yes' : 'No',
        'Has Email': app.email ? 'Yes' : 'No'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Job Applications');
      
      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 20)
      }));
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `job_applications_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: "Applications exported to Excel file successfully!",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Error",
        description: "Failed to export applications. Please try again.",
        variant: "destructive",
      });
    }
  };

  const enhanceApplication = async (application: Application) => {
    setIsEnhancing(true);
    try {
      const result = await generateAllDocuments({
        jobDescription: application.jobDescription,
        baseResume: application.resume,
        editPrompt: "Enhance this application with more detailed information, better formatting, and stronger keywords for ATS optimization. Add more specific technical details and quantifiable achievements.",
        language: application.language,
        country: application.country,
        generateType: 'all'
      });

      // Update the application
      const updatedApplication = {
        ...application,
        resume: result.resume || application.resume,
        coverLetter: result.coverLetter || application.coverLetter,
        email: result.email || application.email,
        version: application.version + 1,
        timestamp: new Date().toISOString()
      };

      // Update in localStorage
      const updatedApplications = applications.map(app =>
        app.id === application.id ? updatedApplication : app
      );
      
      localStorage.setItem('applications', JSON.stringify(updatedApplications));
      setApplications(updatedApplications);
      setSelectedApplication(updatedApplication);

      toast({
        title: "Application Enhanced",
        description: "Your application has been enhanced with AI improvements!",
      });
    } catch (error) {
      console.error('Enhancement error:', error);
      toast({
        title: "Enhancement Error",
        description: "Failed to enhance application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const deleteApplication = (applicationId: string) => {
    const updatedApplications = applications.filter(app => app.id !== applicationId);
    localStorage.setItem('applications', JSON.stringify(updatedApplications));
    setApplications(updatedApplications);
    setSelectedApplication(null);
    
    toast({
      title: "Application Deleted",
      description: "Application has been removed successfully.",
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: `${type} has been copied to your clipboard.`,
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseIcon className="w-5 h-5" />
                Job Applications Manager
              </CardTitle>
              <CardDescription>
                Track, search, and manage all your job applications with AI enhancements
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={exportToExcel}
                variant="outline"
                disabled={applications.length === 0}
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button
                onClick={() => {
                  const populated = populateSampleData();
                  if (populated) {
                    loadApplications();
                    toast({
                      title: "Sample Data Added",
                      description: "Sample applications have been added for testing.",
                    });
                  } else {
                    toast({
                      title: "Data Already Exists",
                      description: "Sample data not added as applications already exist.",
                      variant: "destructive",
                    });
                  }
                }}
                variant="outline"
                size="sm"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                Add Sample Data
              </Button>
              <Button
                onClick={loadApplications}
                variant="outline"
                size="sm"
              >
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by job title, company, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">
                {filteredApplications.length} of {applications.length} applications
              </Badge>
            </div>

            {/* Date Filter Section */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
              </div>
              <Select value={dateFilter} onValueChange={(value: 'all' | 'today' | 'week' | 'month' | 'custom') => setDateFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {dateFilter === 'custom' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-40"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-40"
                  />
                </div>
              )}

              {dateFilter !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateFilter('all');
                    setCustomDateRange({ start: '', end: '' });
                  }}
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BriefcaseIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Applications Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Generate your first resume to start tracking applications
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.jobTitle}</TableCell>
                    <TableCell>{app.company}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{app.date}</span>
                          {app.timestamp && (
                            <span className="text-xs text-gray-500">
                              {new Date(app.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">v{app.version}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{app.language}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApplication(app)}
                            >
                              <EyeIcon className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <BuildingIcon className="w-5 h-5" />
                                {app.jobTitle} at {app.company}
                              </DialogTitle>
                              <DialogDescription>
                                Applied on {app.date} • Version {app.version} • {app.language}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedApplication && (
                              <ApplicationDetails
                                application={selectedApplication}
                                onEnhance={() => enhanceApplication(selectedApplication)}
                                onDelete={() => deleteApplication(selectedApplication.id)}
                                onCopy={copyToClipboard}
                                isEnhancing={isEnhancing}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => enhanceApplication(app)}
                          disabled={isEnhancing}
                        >
                          <SparklesIcon className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteApplication(app.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface ApplicationDetailsProps {
  application: Application;
  onEnhance: () => void;
  onDelete: () => void;
  onCopy: (text: string, type: string) => void;
  isEnhancing: boolean;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
  application,
  onEnhance,
  onDelete,
  onCopy,
  isEnhancing
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button
          onClick={onEnhance}
          disabled={isEnhancing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <SparklesIcon className="w-4 h-4 mr-2" />
          {isEnhancing ? "Enhancing..." : "AI Enhance"}
        </Button>
        <Button
          onClick={onDelete}
          variant="destructive"
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="job-desc">Job Description</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="mt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Resume</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(application.resume, 'Resume')}
              >
                Copy
              </Button>
            </div>
            <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
              <ResumeRenderer content={application.resume} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cover-letter" className="mt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Cover Letter</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(application.coverLetter, 'Cover Letter')}
              >
                Copy
              </Button>
            </div>
            <div className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
              <CoverLetterRenderer content={application.coverLetter} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Email Template</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(application.email, 'Email')}
              >
                Copy
              </Button>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{application.email}</pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="job-desc" className="mt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Job Description</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(application.jobDescription, 'Job Description')}
              >
                Copy
              </Button>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{application.jobDescription}</pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicationManager;
