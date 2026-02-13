import {
  fetchGitHubProjects,
  getResumeProjects,
  DEFAULT_GITHUB_USERNAME,
  type CategorisedProjects,
} from '@/services/githubProjects';

// ────────────────── Sample Resume Builder ──────────────────

/**
 * Build a full sample resume string enriched with real GitHub project data.
 * Falls back gracefully if the GitHub API is unreachable.
 */
export async function buildSampleResume(githubUsername = DEFAULT_GITHUB_USERNAME): Promise<string> {
  let projectsSection = '';

  try {
    const projects = await fetchGitHubProjects(githubUsername);
    projectsSection = buildKeyProjectsText(projects, githubUsername);
  } catch (err) {
    console.warn('[SampleResume] GitHub fetch failed, using static project list', err);
    projectsSection = FALLBACK_PROJECTS;
  }

  return SAMPLE_RESUME_HEADER + '\n' + projectsSection + '\n' + SAMPLE_RESUME_FOOTER;
}

// ── Static parts of the sample resume ──

const SAMPLE_RESUME_HEADER = `BHUPENDER KUMAR
Senior Full Stack Developer | Web3 & Blockchain Engineer | 12+ Years Experience

New Delhi, India | +91 9717267473 | rajus9231@gmail.com
linkedin.com/in/bhupik | github.com/bhupenderkumar

PROFESSIONAL SUMMARY
Senior Full Stack Developer with 12+ years of experience in enterprise software development, Web3/Blockchain technologies, and distributed systems. Expertise in Java, Spring Boot, React, TypeScript, Solana, Ethereum, Rust/Anchor, and DeFi protocols. Proven track record of building trading systems, decentralized applications, RWA tokenization platforms, and microservices architecture. Strong background in capital markets technology, smart contract development, AI/LLM integration, and multi-agent systems.

TECHNICAL SKILLS
Blockchain & Web3: Solana, Ethereum, Rust, Anchor Framework, Solidity, Web3.js, Smart Contracts, DeFi, Token Development, RWA Tokenization, Drift Protocol, Token-2022, Wormhole
Backend: Java, Spring Boot, Spring Framework, Python, FastAPI, Node.js, TypeScript, Kotlin, REST APIs, GraphQL, Microservices, JAXB
Frontend: React, Next.js 14, Angular, JavaScript, TypeScript, HTML5, CSS3, TailwindCSS, shadcn/ui, jQuery
Databases: MongoDB, PostgreSQL, Elasticsearch, Redis, SQLite
DevOps & Tools: Docker, Kubernetes, Git, GitHub Actions, Kibana, Logstash, ELK Stack, Jenkins, AWS, Railway, Nginx
AI/ML: LLM Integration (OpenAI, Anthropic, Groq), Model Context Protocol (MCP), DialogFlow, Rasa, AI Agents, Multi-Agent Systems

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Lab49, Noida, India | Jun 2021 - Present
- Lead design and development of decentralized applications (dApps) and smart contracts on Solana and Ethereum blockchain networks
- Build trading systems and DeFi protocols for capital markets technology using Rust/Anchor and Solidity
- Architect scalable microservices using Spring Boot with high-performance backend systems
- Develop responsive frontend applications with React and TypeScript
- Implement Web3 integrations including wallet connections, token transfers, and on-chain data processing
- Built RWA Asset Tokenization platform enabling banks to tokenize real-world assets on Solana with Securitize, Civic Pass KYC/AML, and Anchorage Digital custody integration

Java Software Engineer | Colt Technology Services | Sep 2018 - May 2021
- Led implementation of Kibana ELK Stack monitoring dashboards, reducing incident response times by 40%
- Automated repetitive workflows through Python scripts, reducing manual efforts by 60%
- Built full-stack applications with Angular frontend and Java Spring backend
- Collaborated with stakeholders to define requirements and deliver solutions aligned with business objectives

Software Engineer | Bureau Veritas Group, Noida, India | Oct 2016 - Sep 2018
- Developed workflow optimization utility that reduced processing time from 3 days to 20 minutes (90% improvement)
- Created decision-support program for data-driven decisions, increasing response speed across departments
- Resolved major connection leaks, improving system stability in high-concurrency environments

Software Engineer | DXC Technology, Gurugram, India | Oct 2015 - Jan 2017
- Implemented Lazy Loading in JAXB context creation, significantly reducing initialization times
- Developed .NET Web Service integration tool, automating metadata extraction and reducing response time by 30%
- Redesigned MongoDB client connection pooling for optimized database performance under heavy load

Mobile Application Developer | Canon India, Gurugram, India | Oct 2014 - Oct 2015
- Developed cross-platform mobile applications using PhoneGap framework for iOS and Android
- Implemented XML parsing with jQuery and SOAP web services integration
- Received Best Trainee Award for delivering two hybrid apps with 4.8/5 average rating`;

const SAMPLE_RESUME_FOOTER = `EDUCATION
Bachelor of Technology in Computer Science
Indian Institute of Technology | 2010 - 2014

CERTIFICATIONS
- AWS Certified Solutions Architect
- MongoDB Certified Developer
- Solana Blockchain Developer Certification`;

function buildKeyProjectsText(projects: CategorisedProjects, username: string): string {
  const resumeProjects = getResumeProjects(projects, {
    maxPerCategory: 2,
    categories: ['web3', 'java', 'ai', 'frontend', 'python'],
  });

  const top = resumeProjects.slice(0, 10);
  if (top.length === 0) return FALLBACK_PROJECTS;

  const lines: string[] = [
    `KEY PROJECTS (GitHub: github.com/${username} - ${projects.all.length}+ repositories)`,
    '',
  ];

  for (const p of top) {
    lines.push(`- ${p.name}: ${p.description}`);
    if (p.technologies) lines.push(`  Technologies: ${p.technologies}`);
  }

  return lines.join('\n');
}

const FALLBACK_PROJECTS = `KEY PROJECTS (GitHub: github.com/bhupenderkumar - 100+ repositories)

- Solana Trading Bot: Automated trading system for Solana DeFi markets with natural language rule input, LLM-powered parsing, Drift Protocol integration. Technologies: TypeScript, Python, FastAPI, React, PostgreSQL, Docker
- RWA Asset Tokenization Platform: Enterprise-grade infrastructure for tokenizing real-world bank assets on Solana with Securitize, Civic Pass, Anchorage Digital custody. Technologies: TypeScript, Rust/Anchor, Next.js, Node.js, PostgreSQL
- Solana MCP Server: Model Context Protocol server with 31 tools for Solana blockchain actions. Technologies: Java, Spring Boot 3.5, Spring AI MCP 1.1.2
- Multi-Agent Copilot (agent-master): VS Code extension orchestrating multiple AI agents for collaborative coding. Technologies: TypeScript, VS Code Extension API
- Solana Meme Coin Trading Bot: AI-powered trading bot with real-time CoinGecko prices and Groq LLM analysis. Technologies: Next.js 14, FastAPI, Python, TailwindCSS
- Agent Deployment System: AI-powered deployment system using Agency Swarm for automated GitHub repo deployment. Technologies: Python, TypeScript, Docker`;

// ────────────────── Sample Job Description ──────────────────

export const SAMPLE_JOB_DESCRIPTION = `Senior Full Stack Developer - TechCorp Inc

We are looking for a Senior Full Stack Developer to join our growing team.

Requirements:
- 5+ years of experience with React, Node.js, and TypeScript
- Experience with cloud platforms (AWS, Azure)
- Strong knowledge of databases (PostgreSQL, MongoDB)
- Experience with CI/CD pipelines
- Excellent communication skills
- Blockchain/Web3 experience is a plus

Responsibilities:
- Develop and maintain web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews

Location: San Francisco, CA (Remote friendly)
Salary: $120,000 - $160,000`;

// ────────────────── Application Sample Data ──────────────────

// Sample data for testing the applications functionality
export const sampleApplications = [
  {
    id: "1701234567890",
    jobTitle: "Senior Full Stack Developer",
    company: "TechCorp Inc",
    jobDescription: `Senior Full Stack Developer - TechCorp Inc

We are looking for a Senior Full Stack Developer to join our growing team. 

Requirements:
- 5+ years of experience with React, Node.js, and TypeScript
- Experience with cloud platforms (AWS, Azure)
- Strong knowledge of databases (PostgreSQL, MongoDB)
- Experience with CI/CD pipelines
- Excellent communication skills

Responsibilities:
- Develop and maintain web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews

Location: San Francisco, CA (Remote friendly)
Salary: $120,000 - $160,000`,
    resume: `BHUPENDER SHARMA
Full Stack Developer

CONTACT INFORMATION
📧 rajus9231@gmail.com
📱 +91-9876543210
🔗 linkedin.com/in/bhupender
💻 github.com/bhupenderkumar

PROFESSIONAL SUMMARY
Senior Full Stack Developer with 6+ years of experience building scalable web applications using React, Node.js, and TypeScript. Proven track record of delivering high-quality solutions in cloud environments with expertise in AWS and modern development practices.

TECHNICAL SKILLS
• Frontend: React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express.js, Python, REST APIs, GraphQL
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes
• Tools: Git, Jenkins, CI/CD, Jest, Webpack

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechSolutions Ltd | 2021 - Present
• Developed and maintained 15+ React applications serving 100K+ users
• Implemented microservices architecture reducing system latency by 40%
• Led a team of 4 developers and mentored 2 junior developers
• Established CI/CD pipelines improving deployment frequency by 60%

Full Stack Developer | StartupXYZ | 2019 - 2021
• Built responsive web applications using React and Node.js
• Optimized database queries resulting in 50% performance improvement
• Collaborated with product team to deliver features on tight deadlines
• Implemented automated testing increasing code coverage to 85%

EDUCATION
Bachelor of Technology in Computer Science
Indian Institute of Technology | 2015 - 2019

CERTIFICATIONS
• AWS Certified Solutions Architect
• MongoDB Certified Developer`,
    coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Full Stack Developer position at TechCorp Inc. With over 6 years of experience in full-stack development and a proven track record of building scalable applications, I am excited about the opportunity to contribute to your growing team.

Your job posting particularly caught my attention because of the emphasis on React, Node.js, and TypeScript - technologies I have been working with extensively throughout my career. In my current role at TechSolutions Ltd, I have successfully developed and maintained 15+ React applications serving over 100,000 users, while implementing microservices architecture that reduced system latency by 40%.

What makes me a strong fit for this role:

• Technical Expertise: 6+ years of hands-on experience with React, Node.js, and TypeScript, along with extensive knowledge of cloud platforms including AWS
• Leadership Experience: Currently leading a team of 4 developers and have mentored 2 junior developers, aligning perfectly with your mentorship requirements
• Database Proficiency: Strong experience with both PostgreSQL and MongoDB, having optimized database queries to achieve 50% performance improvements
• CI/CD Experience: Established CI/CD pipelines that improved deployment frequency by 60%

I am particularly drawn to TechCorp Inc's reputation for innovation and your commitment to using cutting-edge technologies. The remote-friendly culture aligns well with my preference for flexible work arrangements while maintaining high productivity and collaboration standards.

I would welcome the opportunity to discuss how my technical skills and leadership experience can contribute to TechCorp Inc's continued success. Thank you for considering my application.

Best regards,
Bhupender Sharma`,
    email: `Subject: Application for Senior Full Stack Developer Position - Bhupender Sharma

Dear TechCorp Inc Hiring Team,

I hope this email finds you well. I am writing to submit my application for the Senior Full Stack Developer position posted on your careers page.

With 6+ years of experience in full-stack development specializing in React, Node.js, and TypeScript, I am confident that my technical expertise and leadership experience make me an ideal candidate for this role.

Key highlights of my background:
• Led development of 15+ React applications serving 100K+ users
• Implemented microservices architecture reducing system latency by 40%
• Extensive experience with AWS, PostgreSQL, and MongoDB
• Proven track record in mentoring developers and establishing CI/CD pipelines

I have attached my resume and cover letter for your review. I am excited about the opportunity to contribute to TechCorp Inc's innovative projects and would welcome the chance to discuss how my skills align with your team's needs.

I am available for an interview at your convenience and can start immediately if selected.

Thank you for your time and consideration.

Best regards,
Bhupender Sharma
📧 rajus9231@gmail.com
📱 +91-9876543210
🔗 linkedin.com/in/bhupender
💻 github.com/bhupenderkumar`,
    language: "en",
    country: "International",
    date: "12/6/2024",
    timestamp: "2024-12-06T10:30:00.000Z",
    version: 1
  },
  {
    id: "1701234567891",
    jobTitle: "React Developer",
    company: "StartupHub",
    jobDescription: `React Developer - StartupHub

Join our dynamic startup as a React Developer!

Requirements:
- 3+ years React experience
- TypeScript knowledge
- Experience with state management (Redux/Zustand)
- Familiarity with testing frameworks
- Agile development experience

What we offer:
- Competitive salary
- Equity options
- Flexible working hours
- Learning budget

Location: Remote
Salary: $80,000 - $100,000`,
    resume: `BHUPENDER SHARMA
React Developer

CONTACT INFORMATION
📧 rajus9231@gmail.com
📱 +91-9876543210
🔗 linkedin.com/in/bhupender
💻 github.com/bhupenderkumar

PROFESSIONAL SUMMARY
Passionate React Developer with 4+ years of experience building modern, responsive web applications. Expertise in TypeScript, state management, and testing frameworks with a strong focus on user experience and performance optimization.

TECHNICAL SKILLS
• Frontend: React, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS
• State Management: Redux, Zustand, Context API
• Testing: Jest, React Testing Library, Cypress
• Tools: Git, Webpack, Vite, ESLint, Prettier
• Methodologies: Agile, Scrum, Test-Driven Development

PROFESSIONAL EXPERIENCE

Frontend Developer | WebSolutions Co | 2020 - Present
• Developed 10+ React applications with TypeScript
• Implemented Redux for complex state management
• Achieved 95% test coverage using Jest and React Testing Library
• Collaborated in Agile sprints with cross-functional teams

Junior React Developer | DigitalCraft | 2019 - 2020
• Built responsive components using React and CSS3
• Participated in code reviews and pair programming
• Learned and applied modern React patterns and hooks

EDUCATION
Bachelor of Technology in Computer Science
Indian Institute of Technology | 2015 - 2019

PROJECTS
• E-commerce Platform: React + TypeScript + Redux
• Task Management App: React + Zustand + Testing Library`,
    coverLetter: `Dear StartupHub Team,

I am excited to apply for the React Developer position at StartupHub. As a passionate React developer with 4+ years of experience, I am drawn to your startup's innovative approach and dynamic environment.

My experience aligns perfectly with your requirements:
• 4+ years of React development with TypeScript
• Extensive experience with Redux and Zustand for state management
• Strong testing background with Jest and React Testing Library
• Proven experience in Agile development environments

I am particularly excited about the opportunity to work in a startup environment where I can contribute to building innovative products while continuing to learn and grow.

Best regards,
Bhupender Sharma`,
    email: `Subject: Application for React Developer Position - Bhupender Sharma

Dear StartupHub Hiring Team,

I am writing to express my interest in the React Developer position at StartupHub.

With 4+ years of React development experience and expertise in TypeScript and state management, I am excited about the opportunity to contribute to your innovative startup.

Please find my resume and cover letter attached. I would love to discuss how my skills can help StartupHub achieve its goals.

Best regards,
Bhupender Sharma
📧 rajus9231@gmail.com`,
    language: "en",
    country: "International",
    date: "11/6/2024",
    timestamp: "2024-12-05T14:20:00.000Z",
    version: 2
  }
];

// Function to populate sample data for testing
export const populateSampleData = () => {
  try {
    const existingData = localStorage.getItem('applications');
    if (!existingData || JSON.parse(existingData).length === 0) {
      localStorage.setItem('applications', JSON.stringify(sampleApplications));
      console.log('Sample applications data populated');
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('applicationsUpdated'));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error populating sample data:', error);
    return false;
  }
};

// Function to clear all application data
export const clearApplicationData = () => {
  try {
    localStorage.removeItem('applications');
    window.dispatchEvent(new CustomEvent('applicationsUpdated'));
    console.log('Application data cleared');
    return true;
  } catch (error) {
    console.error('Error clearing application data:', error);
    return false;
  }
};
