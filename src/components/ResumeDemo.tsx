import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeRenderer from "@/components/ResumeRenderer";

const ResumeDemo: React.FC = () => {
  const sampleResume = `JOHN SMITH
Senior Software Engineer
Phone: (555) 123-4567
Email: john.smith@email.com
Location: San Francisco, CA
LinkedIn: linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
**Experienced Software Engineer** with **5+ years** of expertise in **React, TypeScript, and Node.js**. Proven track record of developing scalable web applications, leading cross-functional teams, and implementing **modern development practices**. Strong problem-solving skills with experience in **agile methodologies** and **cloud technologies**.

KEY SKILLS
• **Frontend Technologies**: React, TypeScript, JavaScript, HTML5, CSS3
• **Backend Technologies**: Node.js, Express, Python, REST APIs
• **Databases**: PostgreSQL, MongoDB, Redis
• **Cloud Platforms**: AWS, Docker, Kubernetes
• **Development Tools**: Git, Webpack, Jest, CI/CD
• **Methodologies**: Agile/Scrum, Test-Driven Development

WORK EXPERIENCE

**Senior Software Engineer** | **TechCorp Inc.** | **2021 - Present**
• Developed and maintained **15+ web applications** using React and TypeScript
• Led a team of **4 developers** in implementing new features and optimizations
• Improved application performance by **40%** through code optimization and caching
• Implemented **automated testing** strategies achieving **95% code coverage**
• Collaborated with **product managers** and **designers** on user experience improvements

**Software Engineer** | **StartupTech** | **2019 - 2021**
• Built responsive web applications using **React** and **modern JavaScript**
• Integrated **RESTful APIs** and **GraphQL** endpoints with frontend applications
• Reduced bug reports by **30%** through comprehensive testing and code reviews
• Contributed to **design system** development improving development efficiency
• Participated in **agile development** process and daily standups

EDUCATION & CERTIFICATIONS
**Bachelor of Science in Computer Science** | **University of California, Berkeley** | **2019**
• Relevant Coursework: Data Structures, Algorithms, Software Engineering

**Certifications:**
• **AWS Certified Developer** - Amazon Web Services (2022)
• **React Developer Certification** - Meta (2021)

ADDITIONAL INFORMATION
• **Open Source Contributions**: Active contributor to popular React libraries
• **Technical Blog**: Regular writer on software development topics (**10k+ readers**)
• **Languages**: English (Native), Spanish (Conversational)
• **Volunteer Work**: Code mentor for underrepresented groups in tech`;

  const rawResume = `JOHN SMITH
Senior Software Engineer
Phone: (555) 123-4567
Email: john.smith@email.com
Location: San Francisco, CA
LinkedIn: linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
**Experienced Software Engineer** with **5+ years** of expertise in **React, TypeScript, and Node.js**. Proven track record of developing scalable web applications, leading cross-functional teams, and implementing **modern development practices**. Strong problem-solving skills with experience in **agile methodologies** and **cloud technologies**.

KEY SKILLS
• **Frontend Technologies**: React, TypeScript, JavaScript, HTML5, CSS3
• **Backend Technologies**: Node.js, Express, Python, REST APIs
• **Databases**: PostgreSQL, MongoDB, Redis
• **Cloud Platforms**: AWS, Docker, Kubernetes
• **Development Tools**: Git, Webpack, Jest, CI/CD
• **Methodologies**: Agile/Scrum, Test-Driven Development`;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Resume Formatting Demo</CardTitle>
        <CardDescription>
          See how the resume renderer converts markdown-style formatting into professional display
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="formatted" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="formatted">Professional View</TabsTrigger>
            <TabsTrigger value="raw">Raw Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="formatted" className="mt-4">
            <div className="h-[500px] border rounded-lg p-4 overflow-y-auto bg-white">
              <ResumeRenderer content={sampleResume} />
            </div>
          </TabsContent>
          
          <TabsContent value="raw" className="mt-4">
            <div className="h-[500px] border rounded-lg p-4 overflow-y-auto bg-gray-50">
              <pre className="whitespace-pre-wrap text-sm font-mono text-gray-700">
                {rawResume}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResumeDemo;
