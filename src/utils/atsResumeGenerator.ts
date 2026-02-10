import jsPDF from 'jspdf';

/**
 * ATS-Optimized Resume Generator
 * 
 * This generator creates highly ATS-compatible PDFs by following best practices:
 * - Single-column layout (ATS systems parse this better)
 * - Simple, clean formatting without complex graphics
 * - Proper heading hierarchy
 * - Standard fonts (Helvetica)
 * - Clean text extraction
 * - Proper section ordering
 */

export interface ATSResumeConfig {
  content: string;
  fileName?: string;
  includeATSScore?: boolean;
}

export interface ATSScore {
  overall: number;
  sections: {
    contactInfo: number;
    skills: number;
    experience: number;
    education: number;
    formatting: number;
  };
  suggestions: string[];
}

interface ParsedResume {
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    location: string;
    other: string[];
  };
  summary: string[];
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    title: string;
    company: string;
    dates: string;
    location?: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    school: string;
    dates: string;
    details: string[];
  }[];
  certifications: string[];
  projects: {
    name: string;
    description: string;
    technologies?: string;
    bullets: string[];
  }[];
  additional: string[];
}

// ATS-friendly keywords for scoring
const ATS_KEYWORDS = {
  actionVerbs: [
    'achieved', 'administered', 'analyzed', 'architected', 'automated', 'built',
    'collaborated', 'configured', 'coordinated', 'created', 'delivered', 'deployed',
    'designed', 'developed', 'documented', 'enhanced', 'established', 'executed',
    'expanded', 'generated', 'implemented', 'improved', 'increased', 'initiated',
    'integrated', 'launched', 'led', 'maintained', 'managed', 'mentored', 'migrated',
    'monitored', 'optimized', 'orchestrated', 'organized', 'oversaw', 'performed',
    'planned', 'presented', 'produced', 'provided', 'reduced', 'refactored', 'resolved',
    'scaled', 'secured', 'simplified', 'spearheaded', 'streamlined', 'supervised',
    'supported', 'tested', 'trained', 'transformed', 'upgraded'
  ],
  techSkills: [
    'java', 'python', 'javascript', 'typescript', 'react', 'angular', 'vue', 'node',
    'spring', 'django', 'flask', 'express', 'mongodb', 'postgresql', 'mysql', 'redis',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'ci/cd', 'jenkins',
    'agile', 'scrum', 'rest', 'graphql', 'microservices', 'api', 'sql', 'nosql',
    'terraform', 'ansible', 'linux', 'bash', 'html', 'css', 'sass', 'webpack',
    'machine learning', 'data science', 'ai', 'blockchain', 'solidity', 'rust'
  ],
  quantifiers: ['%', 'increased', 'reduced', 'improved', 'saved', 'grew', 'generated']
};

// Clean text for ATS parsing
const cleanText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#+\s*/g, '')
    .replace(/[•●◦○⚬►▸]/g, '•')
    .replace(/\s+/g, ' ')
    .trim();
};

// Parse resume content into structured format
const parseResumeContent = (content: string): ParsedResume => {
  const lines = content.split('\n').map(l => cleanText(l)).filter(l => l);
  
  const resume: ParsedResume = {
    name: '',
    title: '',
    contact: { email: '', phone: '', linkedin: '', github: '', location: '', other: [] },
    summary: [],
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    additional: []
  };

  type Section = 'header' | 'summary' | 'skills' | 'experience' | 'education' | 
                 'certifications' | 'projects' | 'additional';
  
  let currentSection: Section = 'header';
  let currentExperience: typeof resume.experience[0] | null = null;
  let currentEducation: typeof resume.education[0] | null = null;
  let currentProject: typeof resume.projects[0] | null = null;
  let currentSkillCategory: typeof resume.skills[0] | null = null;

  const sectionPatterns: { [key: string]: Section } = {
    'summary': 'summary',
    'professional summary': 'summary',
    'profile': 'summary',
    'objective': 'summary',
    'about': 'summary',
    'skills': 'skills',
    'technical skills': 'skills',
    'key skills': 'skills',
    'core competencies': 'skills',
    'technologies': 'skills',
    'experience': 'experience',
    'work experience': 'experience',
    'professional experience': 'experience',
    'employment history': 'experience',
    'education': 'education',
    'academic background': 'education',
    'certifications': 'certifications',
    'certificates': 'certifications',
    'licenses': 'certifications',
    'projects': 'projects',
    'key projects': 'projects',
    'personal projects': 'projects',
    'additional': 'additional',
    'interests': 'additional',
    'languages': 'additional',
    'awards': 'additional',
    'achievements': 'additional',
    'publications': 'additional'
  };

  const isContactInfo = (line: string): boolean => {
    return !!(
      line.match(/@\w+\.\w+/) || // email
      line.match(/\+?\d[\d\s\-()]{8,}/) || // phone
      line.match(/linkedin\.com/i) ||
      line.match(/github\.com/i) ||
      line.match(/\.(com|org|net|io|dev)/i)
    );
  };

  const isJobEntry = (line: string): boolean => {
    // Pattern: Title | Company | Dates or Company | Title | Dates
    return !!(
      line.match(/\|.*\|.*\d{4}/) ||
      line.match(/\|.*\d{4}/) ||
      (line.match(/\d{4}/) && line.match(/[-–—]/)) ||
      line.match(/^[\w\s]+\s+(at|@)\s+[\w\s]+/)
    );
  };

  const extractJobInfo = (line: string): { title: string; company: string; dates: string } => {
    // Try different patterns
    const patterns = [
      // Title | Company | Dates
      /^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/,
      // Title at Company | Dates
      /^(.+?)\s+(?:at|@)\s+(.+?)\s*\|\s*(.+)$/,
      // Company - Title (Dates)
      /^(.+?)\s*[-–]\s*(.+?)\s*\((.+?)\)$/,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        // Check if first part looks more like a company or title
        const first = match[1].trim();
        const second = match[2].trim();
        const dates = match[3].trim();

        // If first contains common company suffixes, swap
        if (first.match(/Inc|LLC|Ltd|Corp|Company|Technologies|Systems|Solutions|Group/i)) {
          return { title: second, company: first, dates };
        }
        return { title: first, company: second, dates };
      }
    }

    return { title: line, company: '', dates: '' };
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Check for section headers
    let isSection = false;
    for (const [pattern, section] of Object.entries(sectionPatterns)) {
      if (lowerLine === pattern || lowerLine.startsWith(pattern + ':') || 
          lowerLine.endsWith(pattern) || line.match(new RegExp(`^${pattern}$`, 'i'))) {
        currentSection = section;
        isSection = true;
        
        // Save current items
        if (currentExperience && currentExperience.company) {
          resume.experience.push(currentExperience);
          currentExperience = null;
        }
        if (currentEducation && currentEducation.school) {
          resume.education.push(currentEducation);
          currentEducation = null;
        }
        if (currentProject && currentProject.name) {
          resume.projects.push(currentProject);
          currentProject = null;
        }
        if (currentSkillCategory && currentSkillCategory.items.length) {
          resume.skills.push(currentSkillCategory);
          currentSkillCategory = null;
        }
        break;
      }
    }
    if (isSection) continue;

    // Process content based on current section
    switch (currentSection) {
      case 'header':
        // First few lines are name, title, contact info
        if (!resume.name && !line.match(/@|linkedin|github|\d{3}/i)) {
          resume.name = line;
        } else if (!resume.title && line.match(/engineer|developer|manager|analyst|designer|architect|scientist|lead|senior|specialist|coordinator|director|consultant/i)) {
          resume.title = line;
        } else if (isContactInfo(line)) {
          const emailMatch = line.match(/[\w\.-]+@[\w\.-]+\.\w+/);
          const phoneMatch = line.match(/\+?\d[\d\s\-()]{8,}/);
          const linkedinMatch = line.match(/linkedin\.com\/in\/[\w-]+/i);
          const githubMatch = line.match(/github\.com\/[\w-]+/i);
          
          if (emailMatch) resume.contact.email = emailMatch[0];
          if (phoneMatch) resume.contact.phone = phoneMatch[0].replace(/\s+/g, ' ').trim();
          if (linkedinMatch) resume.contact.linkedin = linkedinMatch[0];
          if (githubMatch) resume.contact.github = githubMatch[0];
          
          if (!emailMatch && !phoneMatch && !linkedinMatch && !githubMatch) {
            if (line.match(/\.(com|org|net|io|dev)/i)) {
              resume.contact.other.push(line);
            } else if (!resume.contact.location && line.length < 100) {
              resume.contact.location = line;
            }
          }
        }
        break;

      case 'summary':
        resume.summary.push(line);
        break;

      case 'skills':
        // Check if it's a category header
        if (line.includes(':')) {
          if (currentSkillCategory && currentSkillCategory.items.length) {
            resume.skills.push(currentSkillCategory);
          }
          const [category, skillsStr] = line.split(':');
          currentSkillCategory = {
            category: category.trim(),
            items: skillsStr ? skillsStr.split(/[,;]/).map(s => s.trim()).filter(s => s) : []
          };
        } else if (currentSkillCategory) {
          // Add to current category
          const skills = line.replace(/^[•\-]\s*/, '').split(/[,;]/).map(s => s.trim()).filter(s => s);
          currentSkillCategory.items.push(...skills);
        } else {
          // Create a general skills category
          currentSkillCategory = {
            category: 'Technical Skills',
            items: line.replace(/^[•\-]\s*/, '').split(/[,;]/).map(s => s.trim()).filter(s => s)
          };
        }
        break;

      case 'experience':
        if (isJobEntry(line)) {
          // Save previous experience
          if (currentExperience && currentExperience.company) {
            resume.experience.push(currentExperience);
          }
          const { title, company, dates } = extractJobInfo(line);
          currentExperience = { title, company, dates, bullets: [] };
        } else if (currentExperience) {
          // It's a bullet point or description
          const bullet = line.replace(/^[•\-]\s*/, '');
          if (bullet) {
            currentExperience.bullets.push(bullet);
          }
        } else {
          // First item might be without proper formatting
          currentExperience = { title: line, company: '', dates: '', bullets: [] };
        }
        break;

      case 'education':
        if (line.match(/\d{4}/) || line.match(/university|college|school|institute|bachelor|master|phd|b\.?\s?s|m\.?\s?s|b\.?\s?a|m\.?\s?a/i)) {
          // Save previous education
          if (currentEducation && currentEducation.school) {
            resume.education.push(currentEducation);
          }
          
          // Try to parse education line
          const parts = line.split(/\|/).map(p => p.trim());
          if (parts.length >= 2) {
            currentEducation = {
              degree: parts[0],
              school: parts[1],
              dates: parts[2] || '',
              details: []
            };
          } else {
            currentEducation = {
              degree: line,
              school: '',
              dates: '',
              details: []
            };
          }
        } else if (currentEducation) {
          const detail = line.replace(/^[•\-]\s*/, '');
          if (detail) {
            // Check if this is actually the school name
            if (!currentEducation.school && line.match(/university|college|school|institute/i)) {
              currentEducation.school = detail;
            } else {
              currentEducation.details.push(detail);
            }
          }
        }
        break;

      case 'certifications':
        resume.certifications.push(line.replace(/^[•\-]\s*/, ''));
        break;

      case 'projects':
        // Check if it's a new project
        if (line.match(/^[A-Z][\w\s]+:/) || (line.length < 80 && !line.startsWith('•'))) {
          if (currentProject && currentProject.name) {
            resume.projects.push(currentProject);
          }
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            currentProject = {
              name: line.substring(0, colonIndex).trim(),
              description: line.substring(colonIndex + 1).trim(),
              bullets: []
            };
          } else {
            currentProject = { name: line, description: '', bullets: [] };
          }
        } else if (currentProject) {
          const bullet = line.replace(/^[•\-]\s*/, '');
          if (bullet) {
            currentProject.bullets.push(bullet);
          }
        }
        break;

      case 'additional':
        resume.additional.push(line.replace(/^[•\-]\s*/, ''));
        break;
    }
  }

  // Save any remaining items
  if (currentExperience && currentExperience.title) {
    resume.experience.push(currentExperience);
  }
  if (currentEducation && (currentEducation.school || currentEducation.degree)) {
    resume.education.push(currentEducation);
  }
  if (currentProject && currentProject.name) {
    resume.projects.push(currentProject);
  }
  if (currentSkillCategory && currentSkillCategory.items.length) {
    resume.skills.push(currentSkillCategory);
  }

  return resume;
};

// Calculate ATS Score
export const calculateATSScore = (content: string): ATSScore => {
  const text = content.toLowerCase();
  const lines = content.split('\n');
  const suggestions: string[] = [];

  // Contact Info Score (20 points)
  let contactScore = 0;
  if (text.match(/@\w+\.\w+/)) contactScore += 5; // email
  else suggestions.push('Add a professional email address');
  
  if (text.match(/\+?\d[\d\s\-()]{8,}/)) contactScore += 5; // phone
  else suggestions.push('Add a phone number');
  
  if (text.match(/linkedin\.com/i)) contactScore += 5; // linkedin
  else suggestions.push('Add your LinkedIn profile URL');
  
  if (text.match(/github\.com/i)) contactScore += 5; // github (optional but good)

  // Skills Score (25 points)
  let skillsScore = 0;
  const foundSkills = ATS_KEYWORDS.techSkills.filter(skill => 
    text.includes(skill.toLowerCase())
  );
  skillsScore = Math.min(25, foundSkills.length * 2);
  if (skillsScore < 15) {
    suggestions.push('Add more technical skills relevant to your field');
  }

  // Experience Score (30 points)
  let experienceScore = 0;
  
  // Check for quantified achievements
  const hasQuantifiers = ATS_KEYWORDS.quantifiers.some(q => text.includes(q));
  if (hasQuantifiers) experienceScore += 10;
  else suggestions.push('Add quantified achievements (e.g., "increased sales by 25%")');
  
  // Check for action verbs
  const foundVerbs = ATS_KEYWORDS.actionVerbs.filter(verb => 
    text.includes(verb.toLowerCase())
  );
  experienceScore += Math.min(15, foundVerbs.length);
  if (foundVerbs.length < 5) {
    suggestions.push('Start bullet points with strong action verbs');
  }
  
  // Check for job entries with dates
  const hasJobEntries = lines.some(l => l.match(/\|.*\d{4}/));
  if (hasJobEntries) experienceScore += 5;

  // Education Score (15 points)
  let educationScore = 0;
  if (text.match(/bachelor|master|phd|b\.?\s?s|m\.?\s?s|degree/i)) {
    educationScore += 10;
  } else {
    suggestions.push('Add your educational background');
  }
  if (text.match(/university|college|institute/i)) educationScore += 5; 

  // Formatting Score (10 points)
  let formattingScore = 0;
  
  // Has clear sections
  const hasSections = ['experience', 'education', 'skills'].filter(s => 
    text.includes(s)
  ).length;
  formattingScore += Math.min(5, hasSections * 2);
  
  // Reasonable length (not too short, not too long)
  if (lines.length >= 20 && lines.length <= 100) formattingScore += 3;
  else if (lines.length < 20) suggestions.push('Add more content to your resume');
  
  // Has bullet points
  if (content.match(/[•\-]/)) formattingScore += 2;

  const overall = Math.min(100, contactScore + skillsScore + experienceScore + educationScore + formattingScore);

  return {
    overall,
    sections: {
      contactInfo: contactScore,
      skills: skillsScore,
      experience: experienceScore,
      education: educationScore,
      formatting: formattingScore
    },
    suggestions: suggestions.slice(0, 5)
  };
};

// Generate ATS-optimized PDF
export const generateATSOptimizedPDF = ({ content, fileName, includeATSScore }: ATSResumeConfig): { blob: Blob; score: ATSScore } => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Page dimensions
  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Colors (ATS-friendly, minimal)
  const colors = {
    black: [0, 0, 0] as [number, number, number],
    darkGray: [51, 51, 51] as [number, number, number],
    blue: [30, 64, 175] as [number, number, number],
    lightGray: [107, 114, 128] as [number, number, number]
  };

  let y = marginTop;

  // Calculate ATS Score
  const score = calculateATSScore(content);

  // Parse resume
  const resume = parseResumeContent(content);

  // Helper: Add new page if needed
  const checkPageBreak = (neededHeight: number): void => {
    if (y + neededHeight > pageHeight - marginBottom) {
      pdf.addPage();
      y = marginTop;
    }
  };

  // Helper: Add text with word wrap
  const addText = (text: string, options: {
    x?: number;
    fontSize?: number;
    fontStyle?: 'normal' | 'bold' | 'italic';
    color?: [number, number, number];
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
    lineHeight?: number;
  } = {}): number => {
    const {
      x = marginLeft,
      fontSize = 10,
      fontStyle = 'normal',
      color = colors.black,
      align = 'left',
      maxWidth = contentWidth,
      lineHeight = 1.4
    } = options;

    const cleanedText = cleanText(text);
    if (!cleanedText) return y;

    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    pdf.setTextColor(color[0], color[1], color[2]);

    const lines = pdf.splitTextToSize(cleanedText, maxWidth);
    const lineSpacing = fontSize * 0.35 * lineHeight;

    for (const line of lines) {
      checkPageBreak(lineSpacing + 2);
      
      let textX = x;
      if (align === 'center') {
        textX = pageWidth / 2;
      } else if (align === 'right') {
        textX = pageWidth - marginRight;
      }
      
      pdf.text(line, textX, y, { align });
      y += lineSpacing;
    }

    return y;
  };

  // Helper: Add section header
  const addSectionHeader = (title: string): void => {
    checkPageBreak(15);
    y += 4;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(colors.blue[0], colors.blue[1], colors.blue[2]);
    pdf.text(title.toUpperCase(), marginLeft, y);
    
    // Underline
    y += 2;
    pdf.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, y, pageWidth - marginRight, y);
    y += 6;
  };

  // Helper: Add bullet point
  const addBullet = (text: string): void => {
    checkPageBreak(8);
    
    pdf.setFillColor(colors.blue[0], colors.blue[1], colors.blue[2]);
    pdf.circle(marginLeft + 3, y - 1.5, 1, 'F');
    
    addText(text, { x: marginLeft + 8, maxWidth: contentWidth - 8 });
    y += 1;
  };

  // === RENDER RESUME ===
  
  // Name
  if (resume.name) {
    addText(resume.name, { 
      fontSize: 22, 
      fontStyle: 'bold', 
      color: colors.black,
      align: 'center'
    });
    y += 2;
  }

  // Title
  if (resume.title) {
    addText(resume.title, { 
      fontSize: 12, 
      color: colors.lightGray,
      align: 'center'
    });
    y += 2;
  }

  // Contact Info (single line, properly formatted)
  const contactParts: string[] = [];
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin);
  if (resume.contact.github) contactParts.push(resume.contact.github);
  if (resume.contact.location) contactParts.push(resume.contact.location);
  contactParts.push(...resume.contact.other);

  if (contactParts.length > 0) {
    addText(contactParts.join(' | '), {
      fontSize: 9,
      color: colors.darkGray,
      align: 'center'
    });
  }

  // Separator
  y += 4;
  pdf.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  pdf.setLineWidth(0.75);
  pdf.line(marginLeft, y, pageWidth - marginRight, y);
  y += 8;

  // Professional Summary
  if (resume.summary.length > 0) {
    addSectionHeader('Professional Summary');
    const summaryText = resume.summary.join(' ');
    addText(summaryText, { fontSize: 10, color: colors.darkGray });
    y += 4;
  }

  // Technical Skills
  if (resume.skills.length > 0) {
    addSectionHeader('Technical Skills');
    for (const skillGroup of resume.skills) {
      if (skillGroup.items.length > 0) {
        const skillText = skillGroup.category 
          ? `${skillGroup.category}: ${skillGroup.items.join(', ')}`
          : skillGroup.items.join(', ');
        addText(skillText, { fontSize: 10, color: colors.darkGray });
        y += 2;
      }
    }
    y += 2;
  }

  // Professional Experience
  if (resume.experience.length > 0) {
    addSectionHeader('Professional Experience');
    
    for (const job of resume.experience) {
      checkPageBreak(20);
      
      // Job title and company
      if (job.title || job.company) {
        const jobHeader = [job.title, job.company, job.dates].filter(Boolean).join(' | ');
        addText(jobHeader, { 
          fontSize: 11, 
          fontStyle: 'bold',
          color: colors.darkGray 
        });
        y += 2;
      }
      
      // Bullets
      for (const bullet of job.bullets) {
        addBullet(bullet);
      }
      y += 4;
    }
  }

  // Education
  if (resume.education.length > 0) {
    addSectionHeader('Education');
    
    for (const edu of resume.education) {
      checkPageBreak(15);
      
      const eduHeader = [edu.degree, edu.school, edu.dates].filter(Boolean).join(' | ');
      addText(eduHeader, { 
        fontSize: 11, 
        fontStyle: 'bold',
        color: colors.darkGray 
      });
      
      for (const detail of edu.details) {
        addText(detail, { fontSize: 10, color: colors.darkGray, x: marginLeft + 5 });
      }
      y += 3;
    }
  }

  // Certifications
  if (resume.certifications.length > 0) {
    addSectionHeader('Certifications');
    for (const cert of resume.certifications) {
      addBullet(cert);
    }
    y += 2;
  }

  // Projects
  if (resume.projects.length > 0) {
    addSectionHeader('Key Projects');
    
    for (const project of resume.projects) {
      checkPageBreak(15);
      
      addText(project.name, { 
        fontSize: 11, 
        fontStyle: 'bold',
        color: colors.darkGray 
      });
      
      if (project.description) {
        addText(project.description, { fontSize: 10, color: colors.darkGray });
      }
      
      for (const bullet of project.bullets) {
        addBullet(bullet);
      }
      y += 3;
    }
  }

  // Additional Information
  if (resume.additional.length > 0) {
    addSectionHeader('Additional Information');
    for (const item of resume.additional) {
      addBullet(item);
    }
  }

  // Add ATS Score badge if requested (on first page, top right)
  if (includeATSScore) {
    pdf.setPage(1);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    
    const scoreColor = score.overall >= 80 ? [34, 197, 94] : 
                       score.overall >= 60 ? [250, 204, 21] : 
                       [239, 68, 68];
    
    pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    pdf.text(`ATS Score: ${score.overall}%`, pageWidth - marginRight, marginTop, { align: 'right' });
  }

  // Set PDF metadata for ATS
  pdf.setProperties({
    title: 'Professional Resume',
    subject: 'Resume/CV',
    author: resume.name || 'Job Applicant',
    creator: 'Career Jumpstart Hub - ATS Optimized'
  });

  const blob = pdf.output('blob');
  
  // Auto-download
  const timestamp = new Date().toISOString().slice(0, 10);
  const finalFileName = fileName || `resume_ats_optimized_${timestamp}.pdf`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { blob, score };
};

// Simple download function for backward compatibility
export const downloadATSResume = (content: string): ATSScore => {
  const { score } = generateATSOptimizedPDF({ content, includeATSScore: true });
  return score;
};

export default generateATSOptimizedPDF;
