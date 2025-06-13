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
GitHub: github.com/johnsmith

EDUCATION
**Stanford University**
**MS in Computer Science**
**Dec 2019** | **Stanford, CA**
**GPA: 3.9/4.0**

**University of California, Berkeley**
**BS in Computer Science**
**May 2017** | **Berkeley, CA**
**Magna Cum Laude**
**GPA: 3.8/4.0**

SKILLS
Programming Languages: **Java** • **Python** • **JavaScript** • **TypeScript** • **C++** • **Go**

Frameworks & Technologies: **React** • **Node.js** • **Spring Boot** • **Django** • **Express** • **GraphQL**

Databases & Cloud: **PostgreSQL** • **MongoDB** • **Redis** • **AWS** • **Docker** • **Kubernetes**

Tools & Methodologies: **Git** • **Jenkins** • **CI/CD** • **Agile** • **Scrum** • **TDD**

LINKS
GitHub: https://github.com/johnsmith
LinkedIn: https://linkedin.com/in/johnsmith
Portfolio: https://johnsmith.dev
Blog: https://techblog.johnsmith.dev

COURSEWORK
**Graduate:**
Advanced Machine Learning • Distributed Systems • Computer Vision • Natural Language Processing

**Undergraduate:**
Data Structures • Algorithms • Software Engineering • Database Systems • Computer Networks

EXPERIENCE
**Senior Software Engineer** | Google | **Jan 2020 - Present** | **Mountain View, CA**
• Led development of **high-traffic web applications** serving **10M+ users** daily
• Implemented **microservices architecture** reducing system latency by **45%**
• Mentored **8 junior engineers** and conducted technical interviews
• Designed and built **RESTful APIs** and **GraphQL** endpoints
• Achieved **99.9% uptime** through robust monitoring and alerting systems

**Software Engineer** | Facebook | **Jun 2019 - Dec 2019** | **Menlo Park, CA**
• Developed **React** components for News Feed optimization
• Built **machine learning pipelines** processing **1B+ data points** daily
• Collaborated with **cross-functional teams** to deliver features to **2.8B users**
• Optimized database queries reducing response time by **60%**

**Software Engineering Intern** | Microsoft | **Jun 2018 - Aug 2018** | **Seattle, WA**
• Created **Azure** monitoring dashboard using **TypeScript** and **React**
• Implemented **automated testing** framework increasing code coverage to **95%**
• Worked on **cloud infrastructure** optimization saving **$50k** annually

RESEARCH
**Research Assistant** | Stanford AI Lab | **Sep 2018 - May 2019**
Worked with **Prof. Andrew Ng** on **deep learning** applications for computer vision. Published research on **neural network optimization** in top-tier conferences.

**Undergraduate Researcher** | UC Berkeley EECS | **Jan 2016 - May 2017**
Developed **distributed algorithms** for large-scale data processing. Research resulted in **2 publications** and **1 patent application**.

AWARDS
**2020** | **Google Peer Bonus Award** | Top **5%** performer
**2019** | **Facebook Hackathon Winner** | Best Technical Innovation
**2017** | **UC Berkeley Outstanding Graduate** | Top **1%** of class
**2016** | **ACM Programming Contest** | **3rd place** regional finals

PUBLICATIONS
**"Optimizing Neural Networks for Edge Computing"** | **ICML 2020**
**"Distributed Data Processing at Scale"** | **VLDB 2018**`;

  const rawResume = `JOHN SMITH
Senior Software Engineer
Phone: (555) 123-4567
Email: john.smith@email.com
Location: San Francisco, CA
LinkedIn: linkedin.com/in/johnsmith
GitHub: github.com/johnsmith

EDUCATION
Stanford University
MS in Computer Science
Dec 2019 | Stanford, CA
GPA: 3.9/4.0

University of California, Berkeley
BS in Computer Science
May 2017 | Berkeley, CA
Magna Cum Laude
GPA: 3.8/4.0

SKILLS
Programming Languages:
Java • Python • JavaScript • TypeScript • C++ • Go

Frameworks & Technologies:
React • Node.js • Spring Boot • Django • Express • GraphQL

EXPERIENCE
Senior Software Engineer | Google | Jan 2020 - Present | Mountain View, CA
• Led development of high-traffic web applications serving 10M+ users daily
• Implemented microservices architecture reducing system latency by 45%
• Mentored 8 junior engineers and conducted technical interviews`;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Deedy CV Template Demo</CardTitle>
        <CardDescription>
          Experience the new Deedy CV-inspired template with ATS-friendly two-column layout, professional typography, and intelligent keyword highlighting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="formatted" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="formatted">Deedy CV Template</TabsTrigger>
            <TabsTrigger value="raw">Raw Text Input</TabsTrigger>
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
