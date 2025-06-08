import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EnhancedDownloadHub from "@/components/EnhancedDownloadHub";
import { 
  FileTextIcon, 
  DownloadIcon, 
  SparklesIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  StarIcon
} from "lucide-react";

const DownloadDemo: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);

  // Sample resume for demo
  const sampleResume = `**JOHN SMITH**
**Senior Software Engineer**

Email: john.smith@email.com | Phone: (555) 123-4567 | LinkedIn: linkedin.com/in/johnsmith
Location: San Francisco, CA | GitHub: github.com/johnsmith

**PROFESSIONAL SUMMARY**

Experienced Senior Software Engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions using modern technologies including React, Node.js, AWS, and Docker. Led cross-functional teams to deliver high-impact projects that improved system performance by 40% and reduced operational costs by $2M annually.

**KEY SKILLS**

• Programming Languages: JavaScript, TypeScript, Python, Java, Go
• Frontend Technologies: React, Vue.js, Angular, HTML5, CSS3, Sass
• Backend Technologies: Node.js, Express, Django, Spring Boot, GraphQL
• Cloud Platforms: AWS (EC2, S3, Lambda, RDS), Azure, Google Cloud Platform
• DevOps & Tools: Docker, Kubernetes, Jenkins, Git, Terraform, Ansible
• Databases: PostgreSQL, MongoDB, Redis, DynamoDB
• Methodologies: Agile, Scrum, TDD, CI/CD, Microservices Architecture

**WORK EXPERIENCE**

**Senior Software Engineer | TechCorp Inc. | January 2020 - Present**
• Led development of microservices architecture serving 10M+ users daily
• Implemented automated CI/CD pipelines reducing deployment time by 75%
• Mentored team of 5 junior developers and conducted technical interviews
• Designed and built real-time analytics dashboard using React and D3.js
• Optimized database queries resulting in 60% performance improvement

**Software Engineer | StartupXYZ | June 2018 - December 2019**
• Developed full-stack web applications using React, Node.js, and PostgreSQL
• Built RESTful APIs handling 1M+ requests per day with 99.9% uptime
• Collaborated with product team to define technical requirements and roadmap
• Implemented automated testing suite achieving 95% code coverage

**Junior Software Developer | DevSolutions | August 2016 - May 2018**
• Contributed to development of e-commerce platform serving 500K+ customers
• Worked with legacy systems migration to modern cloud-based architecture
• Participated in code reviews and maintained high code quality standards
• Developed responsive web interfaces using HTML5, CSS3, and JavaScript

**EDUCATION**

**Bachelor of Science in Computer Science**
University of California, Berkeley | 2012 - 2016
• Relevant Coursework: Data Structures, Algorithms, Software Engineering, Database Systems
• GPA: 3.8/4.0 | Dean's List: Fall 2014, Spring 2015, Fall 2015

**CERTIFICATIONS**

• AWS Certified Solutions Architect - Professional (2023)
• Certified Kubernetes Administrator (CKA) (2022)
• Google Cloud Professional Cloud Architect (2021)

**ADDITIONAL INFORMATION**

• Open Source Contributor: Maintained popular React component library with 10K+ GitHub stars
• Technical Speaker: Presented at 3 major tech conferences on microservices architecture
• Languages: English (Native), Spanish (Conversational)
• Volunteer: Code mentor for underrepresented students in tech`;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <DownloadIcon className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Enhanced Download Hub</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Experience our revolutionary download system with ATS scoring, professional formatting, 
              and intelligent optimization features
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Badge className="bg-green-500 text-white px-4 py-2 text-sm">
                <StarIcon className="w-4 h-4 mr-1" />
                ATS Score Analysis
              </Badge>
              <Badge className="bg-purple-500 text-white px-4 py-2 text-sm">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                Smart Optimization
              </Badge>
              <Badge className="bg-orange-500 text-white px-4 py-2 text-sm">
                <FileTextIcon className="w-4 h-4 mr-1" />
                Professional PDF
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-600 text-white p-3 rounded-full w-fit mb-3">
              <TrendingUpIcon className="w-6 h-6" />
            </div>
            <CardTitle className="text-blue-900">ATS Score Analysis</CardTitle>
            <CardDescription className="text-blue-700">
              Real-time compatibility scoring with detailed breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                Keyword optimization analysis
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                Section structure validation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                Formatting compatibility check
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                Improvement recommendations
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="text-center">
            <div className="mx-auto bg-purple-600 text-white p-3 rounded-full w-fit mb-3">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <CardTitle className="text-purple-900">Smart Preview</CardTitle>
            <CardDescription className="text-purple-700">
              Interactive preview with professional formatting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                Real-time PDF preview
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                Section-by-section breakdown
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                Keyword highlighting
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                Mobile-responsive design
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-600 text-white p-3 rounded-full w-fit mb-3">
              <DownloadIcon className="w-6 h-6" />
            </div>
            <CardTitle className="text-green-900">Multiple Formats</CardTitle>
            <CardDescription className="text-green-700">
              Download in various formats with progress tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                Professional PDF export
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                Plain text format
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                Download progress tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                Smart file naming
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Demo Button */}
      <div className="text-center">
        <Button
          onClick={() => setShowDemo(!showDemo)}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          {showDemo ? 'Hide Demo' : 'Try Enhanced Download Hub'}
        </Button>
      </div>

      {/* Demo Section */}
      {showDemo && (
        <div className="animate-fade-in">
          <Card className="border-2 border-blue-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="text-center text-2xl text-blue-900">
                🚀 Live Demo - Enhanced Download Hub
              </CardTitle>
              <CardDescription className="text-center text-blue-700">
                This is a fully functional demo using a sample resume. Try all the features!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <EnhancedDownloadHub
                resume={sampleResume}
                language="en"
                country="United States"
                jobDescription="Senior Software Engineer position requiring React, Node.js, AWS experience with team leadership skills"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DownloadDemo;
