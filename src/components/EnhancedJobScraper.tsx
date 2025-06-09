import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LinkedinIcon,
  MailIcon,
  ZapIcon,
  FileTextIcon,
  SendIcon,
  FilterIcon,
  DownloadIcon,
  SparklesIcon,
  XIcon,
  EditIcon,
  CheckIcon,
  ChevronUpIcon
} from "lucide-react";

// Animation keyframes


// Animation keyframes
const fadeInAnimation = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
import {
  Job,
  JobScrapingResult,
  scrapeWeb3Jobs,
  generateTailoredResume,
  quickApply,
  trackApplication,
  getStoredApplications,
  JobApplication
} from "@/utils/jobScraper";
import { generateResumeWithAI, generateAllDocuments } from "@/services/geminiAI";
import { generateUnifiedPDF } from "@/utils/unifiedPDFGenerator";
import { generateDocumentPDF } from "@/utils/documentPDFGenerator";
import PDFPreview from "@/components/PDFPreview";
import ResumeRenderer from "@/components/ResumeRenderer";
import { getUserEnvVarAsync, setUserEnvVarAsync } from '../services/env';

const EnhancedJobScraper = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]); // Store all loaded jobs
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("javascript");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [generatingResume, setGeneratingResume] = useState<{ [key: string]: boolean }>({});
  const [applying, setApplying] = useState<{ [key: string]: boolean }>({});

  // Filter states
  const [locationFilter, setLocationFilter] = useState("all");
  const [salaryFilter, setSalaryFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [datePostedFilter, setDatePostedFilter] = useState("all");
  const [easyApplyOnly, setEasyApplyOnly] = useState(false);
  const [linkedinOnly, setLinkedinOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 500000]);

  // AI Resume Generation states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [generatedResume, setGeneratedResume] = useState("");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showCoverLetterDialog, setShowCoverLetterDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showCompletePackageDialog, setShowCompletePackageDialog] = useState(false);
  const [baseResume, setBaseResume] = useState("");
  const [previousResume, setPreviousResume] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableResume, setEditableResume] = useState("");

  // Add state for language and country selection
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedCountry, setSelectedCountry] = useState("International");

  // Add state for env variable popup
  const [showEnvDialog, setShowEnvDialog] = useState(false);
  const [envKeyInput, setEnvKeyInput] = useState("");
  const [envValueInput, setEnvValueInput] = useState("");
  const [envVars, setEnvVars] = useState<{ [key: string]: string }>({});

  const { toast } = useToast();

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
        if (hasNextPage && !isLoadingMore) {
          loadMoreJobs();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isLoadingMore]);

  useEffect(() => {
    loadJobs();
    loadApplications();
    loadBaseResume();
  }, [searchTerm]);

  // Apply filters whenever jobs or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [allJobs, locationFilter, salaryFilter, companyFilter, easyApplyOnly, linkedinOnly]);

  // On mount, load env vars from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("userEnvVars");
    if (stored) {
      setEnvVars(JSON.parse(stored));
    }
  }, []);

  const loadJobs = async (resetPage = true) => {
    try {
      if (resetPage) {
        setIsLoading(true);
        setCurrentPage(1);
        setAllJobs([]);
      } else {
        setIsLoadingMore(true);
      }

      // Load multiple pages in parallel for initial load
      const pagesToLoad = resetPage ? 3 : 1;
      const startPage = resetPage ? 1 : currentPage;
      const promises = [];

      for (let i = 0; i < pagesToLoad; i++) {
        promises.push(scrapeWeb3Jobs(startPage + i, searchTerm));
      }

      const results = await Promise.all(promises);
      let combinedJobs: Job[] = [];
      let maxTotalCount = 0;
      let lastHasNextPage = false;

      results.forEach((result) => {
        combinedJobs = [...combinedJobs, ...result.jobs];
        maxTotalCount = Math.max(maxTotalCount, result.totalCount);
        lastHasNextPage = result.hasNextPage;
      });

      if (resetPage) {
        setJobs(combinedJobs);
        setAllJobs(combinedJobs);
      } else {
        // Append new jobs to existing ones, removing duplicates by ID
        const allJobIds = new Set(allJobs.map(job => job.id));
        const uniqueNewJobs = combinedJobs.filter(job => !allJobIds.has(job.id));
        const newJobs = [...allJobs, ...uniqueNewJobs];
        setJobs(newJobs);
        setAllJobs(newJobs);
      }

      setTotalCount(maxTotalCount);
      setHasNextPage(lastHasNextPage);

      if (combinedJobs.length > 0) {
        toast({
          title: "Jobs Loaded",
          description: `Found ${combinedJobs.length} ${searchTerm} jobs${resetPage ? '' : ` on page ${currentPage}`}`,
        });
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Error Loading Jobs",
        description: "Failed to load jobs. Using sample data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreJobs = async () => {
    if (!hasNextPage || isLoadingMore) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    try {
      const result = await scrapeWeb3Jobs(nextPage, searchTerm);

      // Remove duplicates when adding new jobs
      const allJobIds = new Set(allJobs.map(job => job.id));
      const uniqueNewJobs = result.jobs.filter(job => !allJobIds.has(job.id));

      if (uniqueNewJobs.length > 0) {
        const newJobs = [...allJobs, ...uniqueNewJobs];
        setJobs(newJobs);
        setAllJobs(newJobs);
        setHasNextPage(result.hasNextPage);
        setTotalCount(Math.max(totalCount, result.totalCount));
      } else if (hasNextPage) {
        // If no new unique jobs but hasNextPage is true, try next page
        setCurrentPage(nextPage + 1);
        loadMoreJobs();
      }
    } catch (error) {
      console.error('Error loading more jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load more jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadApplications = () => {
    const storedApplications = getStoredApplications();
    setApplications(storedApplications);
  };

  const loadBaseResume = () => {
    const savedBaseResume = localStorage.getItem("userBaseResume");
    const savedGeneratedResume = localStorage.getItem("generatedResume");

    if (savedBaseResume) {
      setBaseResume(savedBaseResume);
    }
    if (savedGeneratedResume) {
      setPreviousResume(savedGeneratedResume);
    }
  };

  // Apply filters to jobs
  const applyFilters = () => {
    let filtered = [...allJobs];

    try {
      // Multiple location filter
      if (selectedLocations.length > 0) {
        filtered = filtered.filter(job =>
          selectedLocations.some(location =>
            job.location.toLowerCase().includes(location.toLowerCase())
          )
        );
      }

      // Salary range filter - make it more lenient
      filtered = filtered.filter(job => {
        const salary = job.salary.toLowerCase();
        const salaryValue = parseInt(salary.replace(/[^0-9]/g, ''));
        // Only filter if we can parse a valid salary value
        return isNaN(salaryValue) ||
               (salaryValue >= salaryRange[0] && salaryValue <= salaryRange[1]);
      });

      // Job type filter - make it more lenient
      if (jobTypeFilter !== "all") {
        filtered = filtered.filter(job => {
          const description = job.description.toLowerCase();
          const title = job.title.toLowerCase();
          switch (jobTypeFilter) {
            case "full-time":
              return description.includes("full-time") ||
                     description.includes("full time") ||
                     title.includes("full-time") ||
                     title.includes("full time");
            case "part-time":
              return description.includes("part-time") ||
                     description.includes("part time") ||
                     title.includes("part-time") ||
                     title.includes("part time");
            case "contract":
              return description.includes("contract") ||
                     description.includes("contractor") ||
                     title.includes("contract") ||
                     title.includes("contractor");
            case "internship":
              return description.includes("intern") ||
                     description.includes("internship") ||
                     title.includes("intern") ||
                     title.includes("internship");
            default:
              return true;
          }
        });
      }

      // Date posted filter - make it more lenient
      if (datePostedFilter !== "all") {
        const now = new Date();
        filtered = filtered.filter(job => {
          try {
            const postedTime = job.postedTime.toLowerCase();
            // Handle relative time formats
            if (postedTime.includes('h')) return true; // Posted within hours
            if (postedTime.includes('d')) {
              const days = parseInt(postedTime);
              switch (datePostedFilter) {
                case "24h": return days <= 1;
                case "week": return days <= 7;
                case "month": return days <= 30;
                default: return true;
              }
            }
            return true;
          } catch (e) {
            // If we can't parse the date, include the job
            return true;
          }
        });
      }

      // Company filter
      if (companyFilter) {
        filtered = filtered.filter(job =>
          job.company.toLowerCase().includes(companyFilter.toLowerCase())
        );
      }

      // Easy apply filter
      if (easyApplyOnly) {
        filtered = filtered.filter(job => job.easyApply);
      }

      // LinkedIn filter
      if (linkedinOnly) {
        filtered = filtered.filter(job => job.linkedinUrl);
      }

    } catch (error) {
      console.error('Error applying filters:', error);
      // If filtering fails, return all jobs
      filtered = allJobs;
    }

    setFilteredJobs(filtered);

    // Log filter results
    console.log(`Filtered jobs: ${filtered.length} of ${allJobs.length}`);
  };

  const handleSearch = () => {
    loadJobs(true); // Reset and load first page
  };

  const clearFilters = () => {
    setLocationFilter("all");
    setSalaryFilter("all");
    setCompanyFilter("");
    setEasyApplyOnly(false);
    setLinkedinOnly(false);
  };

  // One-click AI resume generation
  const handleOneClickResume = async (job: Job, editPrompt?: string) => {
    // Check if base resume exists
    if (!baseResume && !editPrompt) {
      toast({
        title: "Base Resume Required",
        description: "Please upload your base resume first in the 'Generate Resume' tab, then come back to use AI resume generation.",
        variant: "destructive",
      });
      return;
    }

    setSelectedJob(job);
    setIsGeneratingAI(true);
    setShowResumeDialog(true);

    try {
      // Store previous resume for comparison
      if (generatedResume && !editPrompt) {
        setPreviousResume(generatedResume);
      }

      const isEdit = !!editPrompt;
      toast({
        title: isEdit ? "Enhancing Resume with AI" : "Generating AI Resume",
        description: `${isEdit ? 'Applying your feedback to' : 'Creating tailored'} resume for ${job.title} at ${job.company}...`,
      });

      // Extract contact information from base resume
      const contactInfo = extractContactInfo(baseResume);

      const jobDescriptionForAI = `Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Salary: ${job.salary}
${job.contactEmail ? `Contact: ${job.contactEmail}` : ''}

Job Description:
${job.description}

Additional Job Details:
- Easy Apply: ${job.easyApply ? 'Yes' : 'No'}
- LinkedIn Job: ${job.linkedinUrl ? 'Yes' : 'No'}
- Tags: ${job.tags.join(', ')}

CRITICAL INSTRUCTIONS:
1. MUST preserve ALL contact information exactly as it appears in the base resume:
${contactInfo.name ? `   - Name: ${contactInfo.name}` : ''}
${contactInfo.email ? `   - Email: ${contactInfo.email}` : ''}
${contactInfo.phone ? `   - Phone: ${contactInfo.phone}` : ''}
${contactInfo.linkedin ? `   - LinkedIn: ${contactInfo.linkedin}` : ''}
${contactInfo.github ? `   - GitHub: ${contactInfo.github}` : ''}
${contactInfo.location ? `   - Location: ${contactInfo.location}` : ''}

2. Start the resume with the person's name as the first line
3. Include all contact information in a clear CONTACT INFORMATION section
4. Tailor the content to match the job requirements while keeping the person's actual experience
5. Use professional formatting with clear section headers
6. Include relevant keywords from the job description naturally in the content`;

      const aiResume = await generateResumeWithAI({
        jobDescription: jobDescriptionForAI,
        baseResume: baseResume || undefined,
        editPrompt: editPrompt || undefined,
        language: selectedLanguage,
        country: selectedCountry
      });

      setGeneratedResume(aiResume);

      // Save to localStorage for future reference
      localStorage.setItem("generatedResume", aiResume);

      toast({
        title: isEdit ? "Resume Enhanced! ✨" : "Resume Generated! 🎉",
        description: `AI-optimized resume ready for ${job.company}`,
      });

    } catch (error) {
      console.error('Error generating AI resume:', error);

      let errorMessage = "Failed to generate resume. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setShowResumeDialog(false);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Download resume as PDF using the existing professional PDF system
  const downloadResumePDF = () => {
    if (!generatedResume || !selectedJob) return;

    try {
      console.log('Starting unified PDF generation for job application...');

      const result = generateUnifiedPDF({
        resume: generatedResume,
        language: selectedLanguage,
        country: selectedCountry
      });

      toast({
        title: "Professional Resume Downloaded! 📄",
        description: `Your tailored resume for ${selectedJob.company} has been downloaded as PDF.`,
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Export Error",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Download resume as text
  const downloadResumeText = () => {
    if (!generatedResume || !selectedJob) return;

    const element = document.createElement("a");
    const file = new Blob([generatedResume], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);

    // Extract name from resume for filename
    const lines = generatedResume.split('\n');
    const name = lines.length > 0 ? lines[0].replace(/\*\*/g, '').replace(/[^a-zA-Z\s]/g, '').trim().split(' ').slice(0, 2).join('_').toLowerCase() : 'resume';

    element.download = `${name}_${selectedJob.company.replace(/\s+/g, '_')}_${selectedJob.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Text Downloaded! 📝",
      description: `Resume text file for ${selectedJob.company} saved successfully`,
    });
  };

  // Handle resume editing
  const handleEdit = () => {
    setEditableResume(generatedResume);
    setIsEditing(true);
  };

  const handleSave = () => {
    setGeneratedResume(editableResume);
    localStorage.setItem("generatedResume", editableResume);
    setIsEditing(false);

    toast({
      title: "Resume Updated",
      description: "Your resume has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setEditableResume("");
    setIsEditing(false);
  };

  const handleEditWithAI = () => {
    if (!editPrompt.trim()) {
      toast({
        title: "Edit Prompt Required",
        description: "Please enter what changes you'd like to make.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedJob) return;

    handleOneClickResume(selectedJob, editPrompt);
    setEditPrompt("");
    setShowEditPrompt(false);
  };

  const handleGenerateResume = async (job: Job) => {
    const jobId = job.id;
    setGeneratingResume(prev => ({ ...prev, [jobId]: true }));

    try {
      const tailoredResume = await generateTailoredResume(job, {});

      toast({
        title: "Resume Generated",
        description: `Tailored resume created for ${job.title} at ${job.company}`,
      });

      // Here you would typically save or display the resume
      console.log('Generated resume:', tailoredResume);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate tailored resume",
        variant: "destructive",
      });
    } finally {
      setGeneratingResume(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleQuickApply = async (job: Job) => {
    const jobId = job.id;
    setApplying(prev => ({ ...prev, [jobId]: true }));

    try {
      const success = await quickApply(job, "sample-resume", "sample-cover-letter");

      if (success) {
        // Track the application
        const application = trackApplication(job, "latest");
        setApplications(prev => [...prev, application]);

        toast({
          title: "Application Submitted",
          description: `Successfully applied to ${job.title} at ${job.company}`,
        });
      } else {
        throw new Error("Application failed");
      }

    } catch (error) {
      toast({
        title: "Application Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setApplying(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const copyJobDescription = async (job: Job) => {
    const fullJobText = `
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Salary: ${job.salary}
Posted: ${job.postedTime}
Tags: ${job.tags.join(', ')}
${job.contactEmail ? `Contact Email: ${job.contactEmail}` : ''}

Job Description:
${job.description}

Apply URL: ${job.applyUrl}
    `.trim();

    try {
      await navigator.clipboard.writeText(fullJobText);
      toast({
        title: "Copied to Clipboard",
        description: "Job details copied successfully",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const isJobApplied = (jobId: string) => {
    return applications.some(app => app.jobId === jobId);
  };

  // Extract contact information from resume
  const extractContactInfo = (resume: string) => {
    if (!resume) return {};

    const lines = resume.split('\n');
    const contactInfo: any = {};

    // Extract name (usually first line)
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/\*\*/g, '').trim();
      if (firstLine && !firstLine.includes('@') && !firstLine.includes('+') && !firstLine.includes('http')) {
        contactInfo.name = firstLine;
      }
    }

    // Extract contact details
    lines.forEach(line => {
      const cleanLine = line.trim().toLowerCase();

      // Email
      const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        contactInfo.email = emailMatch[1];
      }

      // Phone
      const phoneMatch = line.match(/(\+?[\d\s\-\(\)]{10,})/);
      if (phoneMatch && (cleanLine.includes('phone') || cleanLine.includes('mobile') || cleanLine.includes('📱') || cleanLine.includes('☎'))) {
        contactInfo.phone = phoneMatch[1].trim();
      }

      // LinkedIn
      if (cleanLine.includes('linkedin')) {
        const linkedinMatch = line.match(/(linkedin\.com\/in\/[a-zA-Z0-9\-]+|linkedin\.com\/in\/[a-zA-Z0-9\-]+)/i);
        if (linkedinMatch) {
          contactInfo.linkedin = linkedinMatch[1];
        } else {
          // Extract just the username part
          const usernameMatch = line.match(/linkedin\.com\/in\/([a-zA-Z0-9\-]+)/i);
          if (usernameMatch) {
            contactInfo.linkedin = `linkedin.com/in/${usernameMatch[1]}`;
          }
        }
      }

      // GitHub
      if (cleanLine.includes('github')) {
        const githubMatch = line.match(/(github\.com\/[a-zA-Z0-9\-]+)/i);
        if (githubMatch) {
          contactInfo.github = githubMatch[1];
        }
      }

      // Location (look for city, state patterns)
      if (cleanLine.includes('location') || cleanLine.includes('📍') || cleanLine.includes('🌍')) {
        const locationMatch = line.match(/(?:location:?\s*|📍\s*|🌍\s*)([a-zA-Z\s,]+)/i);
        if (locationMatch) {
          contactInfo.location = locationMatch[1].trim();
        }
      }
    });

    return contactInfo;
  };

  const handleGenerateCoverLetter = async (job: Job) => {
    setSelectedJob(job);
    setIsGeneratingAI(true);

    try {
      const jobDescription = `${job.title} at ${job.company}\n\nLocation: ${job.location}\nSalary: ${job.salary}\n\nJob Description:\n${job.description}`;

      const { coverLetter } = await generateAllDocuments({
        jobDescription,
        baseResume: baseResume || undefined,
        language: "en",
        country: "International",
        generateType: 'cover-letter'
      });

      setGeneratedCoverLetter(coverLetter || '');
      setShowCoverLetterDialog(true);

      toast({
        title: "Cover Letter Generated",
        description: "Your professional cover letter is ready!",
      });
    } catch (error) {
      console.error('Cover letter generation error:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate cover letter. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateEmail = async (job: Job) => {
    setSelectedJob(job);
    setIsGeneratingAI(true);

    try {
      const jobDescription = `${job.title} at ${job.company}\n\nLocation: ${job.location}\nSalary: ${job.salary}\n\nJob Description:\n${job.description}`;

      const { email } = await generateAllDocuments({
        jobDescription,
        baseResume: baseResume || undefined,
        language: "en",
        country: "International",
        generateType: 'email'
      });

      setGeneratedEmail(email || '');
      setShowEmailDialog(true);

      toast({
        title: "Application Email Generated",
        description: "Your professional email template is ready!",
      });
    } catch (error) {
      console.error('Email generation error:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate email. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateCompletePackage = async (job: Job) => {
    setSelectedJob(job);
    setIsGeneratingAI(true);

    try {
      const jobDescription = `${job.title} at ${job.company}\n\nLocation: ${job.location}\nSalary: ${job.salary}\n\nJob Description:\n${job.description}`;

      const result = await generateAllDocuments({
        jobDescription,
        baseResume: baseResume || undefined,
        language: selectedLanguage,
        country: selectedCountry,
        generateType: 'all'
      });

      setGeneratedResume(result.resume || '');
      setGeneratedCoverLetter(result.coverLetter || '');
      setGeneratedEmail(result.email || '');
      setShowCompletePackageDialog(true);

      // Save to localStorage
      localStorage.setItem("generatedResume", result.resume || '');

      toast({
        title: "Complete Application Package Generated",
        description: "Resume, cover letter, and email are all ready!",
      });
    } catch (error) {
      console.error('Package generation error:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate application package. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDirectEmail = (job: Job) => {
    if (!job.contactEmail) {
      toast({
        title: "No Contact Email",
        description: "No email address found for this job posting.",
        variant: "destructive",
      });
      return;
    }

    const subject = `Application for ${job.title} Position`;
    const body = generatedEmail || `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}.

I believe my skills and experience make me a strong candidate for this role. I have attached my resume for your review.

Thank you for your consideration. I look forward to hearing from you.

Best regards,
[Your Name]`;

    const mailtoLink = `mailto:${job.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);

    toast({
      title: "Email Client Opened",
      description: `Email draft created for ${job.contactEmail}`,
    });
  };

  const downloadCoverLetterPDF = () => {
    if (!generatedCoverLetter || !selectedJob) return;

    try {
      const result = generateEnhancedPDF({
        document: generatedCoverLetter,
        type: 'cover-letter',
        language: "en",
        country: "International"
      });

      toast({
        title: "Cover Letter Downloaded! 📄",
        description: `Your cover letter for ${selectedJob.company} has been downloaded as PDF (${result.fileName}).`,
      });

    } catch (error) {
      console.error('Cover letter PDF generation failed:', error);
      toast({
        title: "PDF Export Error",
        description: "Failed to export cover letter PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadEmailPDF = () => {
    if (!generatedEmail || !selectedJob) return;

    try {
      const result = generateEnhancedPDF({
        document: generatedEmail,
        type: 'email',
        language: "en",
        country: "International"
      });

      toast({
        title: "Email Downloaded! 📄",
        description: `Your application email for ${selectedJob.company} has been downloaded as PDF (${result.fileName}).`,
      });
    } catch (error) {
      console.error('Email PDF generation failed:', error);
      toast({
        title: "PDF Export Error",
        description: "Failed to export email PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Env Variable Dialog */}
      <Dialog open={showEnvDialog} onOpenChange={setShowEnvDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set API Keys / Environment Variables</DialogTitle>
            <DialogDescription>
              Enter the environment variable key and value (e.g. VITE_GEMINI_API_KEY). This will be saved in your browser localStorage and used for AI features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <input
              className="w-full border rounded px-2 py-1"
              placeholder="Variable Key (e.g. VITE_GEMINI_API_KEY)"
              value={envKeyInput}
              onChange={e => setEnvKeyInput(e.target.value)}
            />
            <input
              className="w-full border rounded px-2 py-1"
              placeholder="Value"
              value={envValueInput}
              onChange={e => setEnvValueInput(e.target.value)}
            />
            <button
              className="w-full bg-blue-600 text-white rounded py-2 mt-2"
              onClick={() => {
                if (envKeyInput && envValueInput) {
                  setUserEnvVarAsync(envKeyInput, envValueInput);
                  setEnvKeyInput("");
                  setEnvValueInput("");
                  setShowEnvDialog(false);
                }
              }}
            >
              Save
            </button>
            <div className="mt-2 text-xs text-gray-500">
              <strong>Current Variables:</strong>
              <ul>
                {Object.entries(envVars).map(([k, v]) => (
                  <li key={k}><span className="font-mono">{k}</span>: <span className="font-mono">{v.slice(0, 6)}...{v.slice(-4)}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5 text-blue-600" />
              <CardTitle>Enhanced Job Search & Apply</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => loadJobs(true)}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCwIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button
                onClick={() => setShowEnvDialog(true)}
                variant="outline"
                size="sm"
              >
                Set API Keys
              </Button>
            </div>
          </div>
          <CardDescription>
            Search jobs with AI-powered resume generation and one-click apply • {filteredJobs.length} of {totalCount.toLocaleString()} jobs • Page {currentPage}
          </CardDescription>

          {/* Advanced Search Controls */}
          <div className="space-y-4 mt-4">
            {/* Quick Search Tiles */}
            <div className="space-y-3 mb-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">🔥 Popular Searches</div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <Button
                  onClick={() => {
                    setSearchTerm("javascript");
                    setTimeout(() => handleSearch(), 100);
                  }}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                >
                  <div className="text-lg">🌐</div>
                  <span className="text-xs font-medium">JavaScript</span>
                  <span className="text-xs text-gray-500">Frontend</span>
                </Button>

                <Button
                  onClick={() => {
                    setSearchTerm("java backend");
                    setTimeout(() => handleSearch(), 100);
                  }}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1 border-orange-200 hover:border-orange-400 hover:bg-orange-50"
                >
                  <div className="text-lg">☕</div>
                  <span className="text-xs font-medium">Java Backend</span>
                  <span className="text-xs text-gray-500">Server Side</span>
                </Button>

                <Button
                  onClick={() => {
                    setSearchTerm("web3 solana");
                    setTimeout(() => handleSearch(), 100);
                  }}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
                >
                  <div className="text-lg">🚀</div>
                  <span className="text-xs font-medium">Web3 Solana</span>
                  <span className="text-xs text-gray-500">Blockchain</span>
                </Button>

                <Button
                  onClick={() => {
                    setSearchTerm("rust");
                    setTimeout(() => handleSearch(), 100);
                  }}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1 border-red-200 hover:border-red-400 hover:bg-red-50"
                >
                  <div className="text-lg">🦀</div>
                  <span className="text-xs font-medium">Rust</span>
                  <span className="text-xs text-gray-500">Systems</span>
                </Button>

                <Button
                  onClick={() => {
                    setSearchTerm("python");
                    setTimeout(() => handleSearch(), 100);
                  }}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1 border-green-200 hover:border-green-400 hover:bg-green-50"
                >
                  <div className="text-lg">🐍</div>
                  <span className="text-xs font-medium">Python</span>
                  <span className="text-xs text-gray-500">AI/ML</span>
                </Button>

                <Button
                  onClick={() => {
                    setSearchTerm("react");
                    setTimeout(() => handleSearch(), 100);
                  }}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50"
                >
                  <div className="text-lg">⚛️</div>
                  <span className="text-xs font-medium">React</span>
                  <span className="text-xs text-gray-500">Frontend</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <Button
                  onClick={() => {
                    setSearchTerm("node.js");
                    setTimeout(() => handleSearch(), 100);
                  }}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <div className="text-lg">🟢</div>
                  <span className="text-xs font-medium">Node.js</span>
                  <span className="text-xs text-gray-500">Backend</span>
                </Button>

                <Button
                  onClick={() => {
                    setSearchTerm("blockchain ethereum");
                    setTimeout(() => handleSearch(), 100);
                  }}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <div className="text-lg">⛓️</div>
                  <span className="text-xs font-medium">Ethereum</span>
                  <span className="text-xs text-gray-500">Web3</span>
                </Button>

                <Button
                  onClick={() => {
                    setSearchTerm("golang");
                    setTimeout(() => handleSearch(), 100);
                  }}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1 border-sky-200 hover:border-sky-400 hover:bg-sky-50"
                >
                  <div className="text-lg">🐹</div>
                  <span className="text-xs font-medium">Go</span>
                  <span className="text-xs text-gray-500">Backend</span>
                </Button>

                <Button
                  onClick={() => {
                    setSearchTerm("devops kubernetes");
                    setTimeout(() => handleSearch(), 100);
                  }}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1 border-violet-200 hover:border-violet-400 hover:bg-violet-50"
                >
                  <div className="text-lg">🚢</div>
                  <span className="text-xs font-medium">DevOps</span>
                  <span className="text-xs text-gray-500">K8s</span>
                </Button>

                <Button
                  onClick={() => {
                    setSearchTerm("full stack");
                    setTimeout(() => handleSearch(), 100);
                  }}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1 border-pink-200 hover:border-pink-400 hover:bg-pink-50"
                >
                  <div className="text-lg">🎯</div>
                  <span className="text-xs font-medium">Full Stack</span>
                  <span className="text-xs text-gray-500">Complete</span>
                </Button>

                <Button
                  onClick={() => {
                    setSearchTerm("remote");
                    setTimeout(() => handleSearch(), 100);
                  }}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1 border-teal-200 hover:border-teal-400 hover:bg-teal-50"
                >
                  <div className="text-lg">🏠</div>
                  <span className="text-xs font-medium">Remote</span>
                  <span className="text-xs text-gray-500">Work from Home</span>
                </Button>
              </div>
            </div>

            {/* Main Search */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search for jobs (e.g., javascript, python, react, blockchain)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                <SearchIcon className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {/* Search with Suggestions */}
              <div className="relative">
                <Input
                  placeholder="Search for jobs (e.g., javascript, python, react, blockchain)"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                    // Update suggestions based on search history and common terms
                    const suggestions = [...new Set([
                      ...searchHistory,
                      ...savedSearches,
                      "javascript", "python", "react", "node.js", "java"
                    ])].filter(term =>
                      term.toLowerCase().includes(e.target.value.toLowerCase())
                    ).slice(0, 5);
                    setSearchSuggestions(suggestions);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full"
                />
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border rounded-md mt-1 shadow-lg">
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setSearchTerm(suggestion);
                          setShowSuggestions(false);
                          handleSearch();
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="w-full"
              >
                <FilterIcon className="w-4 h-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="space-y-4 p-4 border rounded-lg">
                  {/* Location Multi-select */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Locations</label>
                    <div className="flex flex-wrap gap-2">
                      {["Remote", "New York", "San Francisco", "Seattle", "Austin", "Boston"].map(location => (
                        <Badge
                          key={location}
                          variant={selectedLocations.includes(location) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (selectedLocations.includes(location)) {
                              setSelectedLocations(selectedLocations.filter(l => l !== location));
                            } else {
                              setSelectedLocations([...selectedLocations, location]);
                            }
                          }}
                        >
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Job Type Filter */}
                  <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Date Posted Filter */}
                  <Select value={datePostedFilter} onValueChange={setDatePostedFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Date Posted" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Company Filter */}
                  <Input
                    placeholder="Company"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="text-sm"
                  />

                  {/* Quick Filter Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={easyApplyOnly ? "default" : "outline"}
                      onClick={() => setEasyApplyOnly(!easyApplyOnly)}
                      size="sm"
                    >
                      <ZapIcon className="w-3 h-3 mr-1" />
                      Easy Apply
                    </Button>

                    <Button
                      variant={linkedinOnly ? "default" : "outline"}
                      onClick={() => setLinkedinOnly(!linkedinOnly)}
                      size="sm"
                    >
                      <LinkedinIcon className="w-3 h-3 mr-1" />
                      LinkedIn
                    </Button>

                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      size="sm"
                    >
                      <FilterIcon className="w-3 h-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Application Stats & Base Resume Status */}
          <div className="mt-3 space-y-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-center gap-4">
                <span>📊 Applications: {applications.length}</span>
                <span>✅ Applied Today: {applications.filter(app =>
                  new Date(app.appliedDate).toDateString() === new Date().toDateString()
                ).length}</span>
              </div>
            </div>

            {/* Base Resume Status */}
            {!baseResume ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>⚠️</span>
                    <span>
                      <strong>Base Resume Required:</strong> Upload your resume first to use AI resume generation.
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to Generate Resume tab
                      const generateTab = document.querySelector('[value="generate"]') as HTMLElement;
                      if (generateTab) generateTab.click();
                    }}
                  >
                    Go to Upload
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300">
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <span>
                    <strong>Base Resume Loaded:</strong> Ready for AI-powered job-specific resume generation! ({Math.round(baseResume.length / 1000)}k characters)
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        {job.easyApply && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <ZapIcon className="w-3 h-3 mr-1" />
                            Easy Apply
                          </Badge>
                        )}
                        {isJobApplied(job.id) && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Applied
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
                    {/* Resume Generation */}
                    <Button
                      onClick={() => handleOneClickResume(job)}
                      disabled={isGeneratingAI || !baseResume || generatingResume[job.id]}
                      variant={baseResume ? "default" : "outline"}
                      size="sm"
                      className={baseResume
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        : "border-dashed"
                      }
                      title={!baseResume ? "Upload base resume first in 'Generate Resume' tab" : "Generate AI-tailored resume for this job"}
                    >
                      <SparklesIcon className={`w-4 h-4 mr-2 ${generatingResume[job.id] ? 'animate-spin' : ''}`} />
                      {generatingResume[job.id] ? 'AI Generating...' : baseResume ? '🚀 AI Resume' : '⚠️ Need Base Resume'}
                    </Button>

                    <Button
                      onClick={() => handleQuickApply(job)}
                      disabled={applying[job.id] || isJobApplied(job.id)}
                      variant={job.easyApply ? "default" : "outline"}
                      size="sm"
                    >
                      <SendIcon className={`w-4 h-4 mr-2 ${Boolean(applying[job.id]) ? 'animate-spin' : ''}`} />
                      {Boolean(applying[job.id]) ? 'Applying...' : isJobApplied(job.id) ? 'Applied' : 'Quick Apply'}
                    </Button>

                    <Button
                      onClick={() => copyJobDescription(job)}
                      variant="outline"
                      size="sm"
                    >
                      <CopyIcon className="w-4 h-4 mr-2" />
                      Copy Details
                    </Button>

                    <Button
                      onClick={() => window.open(job.applyUrl, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLinkIcon className="w-4 h-4 mr-2" />
                      View Job
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

                    {/* New Document Generation Buttons */}
                    <Button
                      onClick={() => handleGenerateCoverLetter(job)}
                      disabled={isGeneratingAI || !baseResume}
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                      title={!baseResume ? "Upload base resume first" : "Generate cover letter for this job"}
                    >
                      <FileTextIcon className="w-4 h-4 mr-2" />
                      Cover Letter
                    </Button>

                    <Button
                      onClick={() => handleGenerateEmail(job)}
                      disabled={isGeneratingAI || !baseResume}
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                      title={!baseResume ? "Upload base resume first" : "Generate application email for this job"}
                    >
                      <MailIcon className="w-4 h-4 mr-2" />
                      Email
                    </Button>

                    <Button
                      onClick={() => handleGenerateCompletePackage(job)}
                      disabled={isGeneratingAI || !baseResume}
                      variant="outline"
                      size="sm"
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      title={!baseResume ? "Upload base resume first" : "Generate complete application package"}
                    >
                      <BriefcaseIcon className="w-4 h-4 mr-2" />
                      Complete Package
                    </Button>

                    {/* Cover Letter Download Button */}
                    <Button
                      onClick={downloadCoverLetterPDF}
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                      title="Download cover letter as PDF"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download Cover Letter
                    </Button>

                    {job.contactEmail && (
                      <Button
                        onClick={() => handleDirectEmail(job)}
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        title={`Send email directly to ${job.contactEmail}`}
                      >
                        <SendIcon className="w-4 h-4 mr-2" />
                        Direct Email
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Load More Section */}
          <div className="flex flex-col items-center mt-6 space-y-6">
            {/* Status Bar */}
            <div className="w-full max-w-2xl bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  {isLoading ? (
                    <span className="text-blue-600 flex items-center gap-2">
                      <RefreshCwIcon className="w-3 h-3 animate-spin" />
                      Searching...
                    </span>
                  ) : (
                    <span>
                      Showing {filteredJobs.length} of {totalCount.toLocaleString()} jobs
                    </span>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  Page {currentPage} of {Math.max(Math.ceil(totalCount / 10), 1)}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((allJobs.length / totalCount) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Load More Button */}
            {hasNextPage && !isLoading && (
              <Button
                onClick={loadMoreJobs}
                disabled={isLoadingMore}
                className="w-full max-w-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2">
                    <RefreshCwIcon className="w-4 h-4 animate-spin" />
                    <span>Loading Page {currentPage + 1}...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <DownloadIcon className="w-4 h-4" />
                    <span>Load More Jobs (Page {currentPage + 1})</span>
                  </div>
                )}
              </Button>
            )}

            {/* End of Results Message */}
            {!isLoading && !hasNextPage && allJobs.length > 0 && (
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Badge variant="secondary" className="bg-green-100 text-green-800 mb-2">
                  🎉 All Jobs Loaded
                </Badge>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  You've seen all {allJobs.length} available jobs for "{searchTerm}"
                </p>
              </div>
            )}

            {/* No Results Message */}
            {!isLoading && allJobs.length === 0 && (
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mb-2">
                  No jobs found
                </Badge>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Resume Generation Dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-purple-600" />
              AI-Generated Resume
              {selectedJob && (
                <span className="text-sm font-normal text-gray-600">
                  for {selectedJob.title} at {selectedJob.company}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Your AI-optimized resume is ready! Review and download below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isGeneratingAI ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <SparklesIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                  <p className="text-lg font-medium">Generating AI Resume...</p>
                  <p className="text-sm text-gray-600">Analyzing job requirements and optimizing content</p>
                </div>
              </div>
            ) : generatedResume ? (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✅ Professional Format
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      🎯 Job Tailored
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      🤖 AI Generated
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={downloadResumePDF} variant="default" size="sm">
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button onClick={downloadResumeText} variant="outline" size="sm">
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Text
                    </Button>
                    <Button
                      onClick={() => setShowResumeDialog(false)}
                      variant="outline"
                      size="sm"
                    >
                      <XIcon className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editableResume}
                      onChange={(e) => setEditableResume(e.target.value)}
                      className="min-h-96 font-mono text-sm"
                      placeholder="Edit your resume here..."
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm">
                        Save Changes
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Tabs defaultValue="formatted" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="formatted" className="flex items-center gap-2">
                        <FileTextIcon className="w-4 h-4" />
                        Formatted View
                      </TabsTrigger>
                      <TabsTrigger value="pdf" className="flex items-center gap-2">
                        <FileTextIcon className="w-4 h-4" />
                        PDF Preview
                      </TabsTrigger>
                      <TabsTrigger value="raw" className="flex items-center gap-2">
                        <FileTextIcon className="w-4 h-4" />
                        Raw Text
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="formatted" className="mt-4">
                      <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
                        <ResumeRenderer content={generatedResume} />
                      </div>
                    </TabsContent>

                    <TabsContent value="pdf" className="mt-4">
                      <PDFPreview
                        resume={generatedResume}
                        language="en"
                        country="International"
                        onDownload={downloadResumePDF}
                      />
                    </TabsContent>

                    <TabsContent value="raw" className="mt-4">
                      <div className="max-h-96 border rounded-lg p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                        <pre className="whitespace-pre-wrap text-sm font-mono">{generatedResume}</pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {/* AI Feedback Section */}
                {!isEditing && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">✨ Improve with AI Feedback</h4>
                      {showEditPrompt ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            placeholder="Tell AI what to improve (e.g., 'Add more technical skills', 'Make it more senior level', 'Focus on leadership experience')"
                            className="min-h-20"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handleEditWithAI}
                              disabled={isGeneratingAI || !editPrompt.trim()}
                              size="sm"
                            >
                              <SparklesIcon className="w-4 h-4 mr-2" />
                              {isGeneratingAI ? 'Enhancing...' : 'Enhance with AI'}
                            </Button>
                            <Button
                              onClick={() => setShowEditPrompt(false)}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowEditPrompt(true)}
                            variant="outline"
                            size="sm"
                          >
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            AI Feedback
                          </Button>
                          <Button
                            onClick={handleEdit}
                            variant="outline"
                            size="sm"
                          >
                            <EditIcon className="w-4 h-4 mr-2" />
                            Manual Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-2">
                  <Button
                    onClick={downloadResumePDF}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={downloadResumeText}
                    variant="outline"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download Text
                  </Button>
                  {selectedJob && (
                    <Button
                      onClick={() => handleQuickApply(selectedJob)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <SendIcon className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Resume generation failed. Please try again.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cover Letter Dialog */}
      <Dialog open={showCoverLetterDialog} onOpenChange={setShowCoverLetterDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-green-600" />
              AI-Generated Cover Letter
              {selectedJob && (
                <span className="text-sm font-normal text-gray-600">
                  for {selectedJob.title} at {selectedJob.company}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Your professional cover letter is ready! Review and copy below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isGeneratingAI ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <SparklesIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
                  <p className="text-lg font-medium">Generating Cover Letter...</p>
                  <p className="text-sm text-gray-600">Creating personalized content for this position</p>
                </div>
              </div>
            ) : generatedCoverLetter ? (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✅ Professional Format
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      🎯 Job Tailored
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigator.clipboard.writeText(generatedCoverLetter)}
                      variant="default"
                      size="sm"
                    >
                      <CopyIcon className="w-4 h-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button
                      onClick={() => setShowCoverLetterDialog(false)}
                      variant="outline"
                      size="sm"
                    >
                      <XIcon className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-6 bg-white max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                    {generatedCoverLetter}
                  </pre>
                </div>

                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => navigator.clipboard.writeText(generatedCoverLetter)}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <CopyIcon className="w-4 h-4 mr-2" />
                    Copy Cover Letter
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Cover letter generation failed. Please try again.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MailIcon className="w-5 h-5 text-purple-600" />
              AI-Generated Application Email
              {selectedJob && (
                <span className="text-sm font-normal text-gray-600">
                  for {selectedJob.title} at {selectedJob.company}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Your professional application email is ready! Copy and send.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isGeneratingAI ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <SparklesIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                  <p className="text-lg font-medium">Generating Application Email...</p>
                  <p className="text-sm text-gray-600">Creating professional email template</p>
                </div>
              </div>
            ) : generatedEmail ? (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      ✅ Ready to Send
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      🎯 Job Specific
                    </Badge>
                    {selectedJob?.contactEmail && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        📧 Contact Found
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigator.clipboard.writeText(generatedEmail)}
                      variant="default"
                      size="sm"
                    >
                      <CopyIcon className="w-4 h-4 mr-2" />
                      Copy Email
                    </Button>
                    {selectedJob?.contactEmail && (
                      <Button
                        onClick={() => handleDirectEmail(selectedJob)}
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <SendIcon className="w-4 h-4 mr-2" />
                        Send Now
                      </Button>
                    )}
                    <Button
                      onClick={() => setShowEmailDialog(false)}
                      variant="outline"
                      size="sm"
                    >
                      <XIcon className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-6 bg-white max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                    {generatedEmail}
                  </pre>
                </div>

                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => navigator.clipboard.writeText(generatedEmail)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <CopyIcon className="w-4 h-4 mr-2" />
                    Copy Email
                  </Button>
                  {selectedJob?.contactEmail && (
                    <Button
                      onClick={() => handleDirectEmail(selectedJob)}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <SendIcon className="w-4 h-4 mr-2" />
                      Send to {selectedJob.contactEmail}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Email generation failed. Please try again.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Package Dialog */}
      <Dialog open={showCompletePackageDialog} onOpenChange={setShowCompletePackageDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5 text-orange-600" />
              Complete Application Package
              {selectedJob && (
                <span className="text-sm font-normal text-gray-600">
                  for {selectedJob.title} at {selectedJob.company}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Your complete application package is ready! Resume, cover letter, and email all optimized for this position.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {isGeneratingAI ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <SparklesIcon className="w-12 h-12 animate-spin mx-auto mb-6 text-orange-600" />
                  <p className="text-xl font-medium">Generating Complete Application Package...</p>
                  <p className="text-sm text-gray-600">Creating resume, cover letter, and email template</p>
                </div>
              </div>
            ) : (generatedResume && generatedCoverLetter && generatedEmail) ? (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                           ✅ Complete Package
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      🎯 Job Tailored
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      🤖 AI Generated
                    </Badge>
                  </div>
                  <Button
                    onClick={() => setShowCompletePackageDialog(false)}
                    variant="outline"
                    size="sm"
                  >
                    <XIcon className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>

                <Tabs defaultValue="resume" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="resume" className="flex items-center gap-2">
                      <FileTextIcon className="w-4 h-4" />
                      Resume
                    </TabsTrigger>
                    <TabsTrigger value="cover-letter" className="flex items-center gap-2">
                      <FileTextIcon className="w-4 h-4" />
                      Cover Letter
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2">
                      <MailIcon className="w-4 h-4" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="pdf" className="flex items-center gap-2">
                      <FileTextIcon className="w-4 h-4" />
                      PDF Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="resume" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">AI-Optimized Resume</h3>
                        <div className="flex gap-2">
                          <Button onClick={downloadResumePDF} variant="default" size="sm">
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button
                            onClick={() => navigator.clipboard.writeText(generatedResume)}
                            variant="outline"
                            size="sm"
                          >
                            <CopyIcon className="w-4 h-4 mr-2" />
                            Copy Text
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
                        <ResumeRenderer content={generatedResume} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cover-letter" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Professional Cover Letter</h3>
                        <div className="flex gap-2">
                          <Button onClick={downloadCoverLetterPDF} variant="default" size="sm">
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button
                            onClick={() => navigator.clipboard.writeText(generatedCoverLetter)}
                            variant="outline"
                            size="sm"
                          >
                            <CopyIcon className="w-4 h-4 mr-2" />
                            Copy Text
                          </Button>
                        </div>
                      </div>
                      <div className="border rounded-lg p-6 bg-white max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                          {generatedCoverLetter}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="email" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Application Email Template</h3>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => navigator.clipboard.writeText(generatedEmail)}
                            variant="outline"
                            size="sm"
                          >
                            <CopyIcon className="w-4 h-4 mr-2" />
                            Copy Email
                          </Button>
                          {selectedJob?.contactEmail && (
                            <Button
                              onClick={() => handleDirectEmail(selectedJob)}
                              variant="default"
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <SendIcon className="w-4 h-4 mr-2" />
                              Send Now
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="border rounded-lg p-6 bg-white max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                          {generatedEmail}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-center gap-4 pt-4 border-t">
                  <Button
                    onClick={downloadResumePDF}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download Resume PDF
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCoverLetter);
                      toast({ title: "Cover Letter Copied", description: "Cover letter copied to clipboard!" });
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <CopyIcon className="w-4 h-4 mr-2" />
                    Copy Cover Letter
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedEmail);
                      toast({ title: "Email Copied", description: "Email template copied to clipboard!" });
                    }}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    <MailIcon className="w-4 h-4 mr-2" />
                    Copy Email
                  </Button>
                  {selectedJob?.contactEmail && (
                    <Button
                      onClick={() => handleDirectEmail(selectedJob)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <SendIcon className="w-4 h-4 mr-2" />
                      Send to {selectedJob.contactEmail}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Package generation failed. Please try again.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedJobScraper;
