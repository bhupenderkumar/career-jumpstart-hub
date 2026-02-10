import jsPDF from 'jspdf';

/**
 * Premium Single-Page Resume PDF Generator
 * 
 * Design Philosophy:
 * - Maximum impact on a single page
 * - Professional typography with optimal spacing
 * - Clean, modern design while maintaining ATS compatibility
 * - Smart content prioritization and truncation
 * - Visual hierarchy through subtle design elements
 */

interface ResumeData {
  name: string;
  title: string;
  contact: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    location?: string;
    portfolio?: string;
  };
  summary: string;
  skills: { category: string; items: string[] }[];
  experience: {
    title: string;
    company: string;
    location?: string;
    dates: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    school: string;
    dates: string;
    gpa?: string;
    details?: string[];
  }[];
  certifications?: string[];
  projects?: {
    name: string;
    description: string;
    technologies?: string;
  }[];
}

// Premium color palette - professional and modern
const COLORS = {
  primary: [31, 41, 55] as [number, number, number],      // Dark slate gray
  secondary: [59, 130, 246] as [number, number, number],  // Blue accent
  text: [17, 24, 39] as [number, number, number],         // Almost black
  muted: [75, 85, 99] as [number, number, number],        // Gray text
  light: [156, 163, 175] as [number, number, number],     // Light gray
  divider: [229, 231, 235] as [number, number, number],   // Very light gray
};

// Typography scale - optimized for single page
const TYPOGRAPHY = {
  name: { size: 18, weight: 'bold' as const },
  title: { size: 10, weight: 'normal' as const },
  sectionHeader: { size: 10, weight: 'bold' as const },
  jobTitle: { size: 9.5, weight: 'bold' as const },
  company: { size: 9, weight: 'normal' as const },
  body: { size: 8.5, weight: 'normal' as const },
  small: { size: 8, weight: 'normal' as const },
  contact: { size: 8, weight: 'normal' as const },
};

// Spacing constants - tight but readable
const SPACING = {
  marginTop: 12,
  marginBottom: 10,
  marginLeft: 14,
  marginRight: 14,
  sectionGap: 6,
  lineHeight: 1.25,
  bulletIndent: 6,
  itemGap: 2,
};

/**
 * Parse resume content from text
 */
export const parseResumeContent = (content: string): ResumeData => {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  const resume: ResumeData = {
    name: '',
    title: '',
    contact: {},
    summary: '',
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
  };

  let currentSection = 'header';
  let currentExperience: ResumeData['experience'][0] | null = null;
  let currentEducation: ResumeData['education'][0] | null = null;
  let currentProject: ResumeData['projects'][0] | null = null;
  let summaryLines: string[] = [];

  const sectionPatterns = {
    summary: /^(professional\s*summary|summary|profile|objective|about)/i,
    skills: /^(technical\s*skills|skills|core\s*competencies|expertise|technologies)/i,
    experience: /^(professional\s*experience|work\s*experience|experience|employment)/i,
    education: /^(education|academic|qualifications)/i,
    certifications: /^(certifications?|licenses?|credentials)/i,
    projects: /^(projects|key\s*projects|portfolio)/i,
  };

  const detectSection = (line: string): string | null => {
    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) return section;
    }
    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for section headers
    const newSection = detectSection(line);
    if (newSection) {
      // Save pending items
      if (currentExperience?.company) resume.experience.push(currentExperience);
      if (currentEducation?.school) resume.education.push(currentEducation);
      if (currentProject?.name) resume.projects!.push(currentProject);
      currentExperience = null;
      currentEducation = null;
      currentProject = null;
      
      if (newSection === 'summary') {
        summaryLines = [];
      }
      
      currentSection = newSection;
      continue;
    }

    switch (currentSection) {
      case 'header':
        // First non-empty line is name
        if (!resume.name) {
          resume.name = line;
        } else if (!resume.title && line.length < 100 && !line.includes('@') && !line.includes('|')) {
          resume.title = line;
        } else {
          // Contact info
          const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
          const phoneMatch = line.match(/\+?[\d\s()-]{10,}/);
          const linkedinMatch = line.match(/linkedin\.com\/in\/[\w-]+/i);
          const githubMatch = line.match(/github\.com\/[\w-]+/i);
          
          if (emailMatch) resume.contact.email = emailMatch[0];
          if (phoneMatch) resume.contact.phone = phoneMatch[0].trim();
          if (linkedinMatch) resume.contact.linkedin = linkedinMatch[0];
          if (githubMatch) resume.contact.github = githubMatch[0];
          
          // Location detection
          if (line.match(/,\s*(India|USA|UK|Canada|Germany|Australia)/i) || 
              line.match(/(New Delhi|Mumbai|Bangalore|London|New York|San Francisco)/i)) {
            resume.contact.location = line.split('|')[0]?.trim() || line;
          }
        }
        break;

      case 'summary':
        if (line && !line.match(/^[•\-]/)) {
          summaryLines.push(line);
        }
        resume.summary = summaryLines.join(' ');
        break;

      case 'skills':
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0 && colonIndex < 40) {
          const category = line.substring(0, colonIndex).trim();
          const items = line.substring(colonIndex + 1).split(/[,;]/).map(s => s.trim()).filter(s => s);
          if (items.length > 0) {
            resume.skills.push({ category, items });
          }
        } else {
          // No category, just skills list
          const items = line.replace(/^[•\-]\s*/, '').split(/[,;]/).map(s => s.trim()).filter(s => s);
          if (items.length > 0) {
            const lastSkill = resume.skills[resume.skills.length - 1];
            if (lastSkill) {
              lastSkill.items.push(...items);
            } else {
              resume.skills.push({ category: '', items });
            }
          }
        }
        break;

      case 'experience':
        // Detect job entry: "Title | Company | Dates" or "Title | Company, Location | Dates"
        if (line.includes('|') && line.match(/\d{4}/)) {
          if (currentExperience?.company) {
            resume.experience.push(currentExperience);
          }
          const parts = line.split('|').map(p => p.trim());
          currentExperience = {
            title: parts[0] || '',
            company: parts[1] || '',
            dates: parts[parts.length - 1] || '',
            bullets: [],
          };
        } else if (currentExperience && line.match(/^[•\-]/)) {
          currentExperience.bullets.push(line.replace(/^[•\-]\s*/, ''));
        } else if (currentExperience && line.length > 20) {
          // Might be a bullet without marker
          currentExperience.bullets.push(line);
        }
        break;

      case 'education':
        if (line.match(/bachelor|master|phd|b\.?\s?tech|m\.?\s?tech|b\.?\s?s|m\.?\s?s|degree/i) ||
            line.match(/university|college|institute/i) ||
            (line.includes('|') && line.match(/\d{4}/))) {
          if (currentEducation?.school) {
            resume.education.push(currentEducation);
          }
          const parts = line.split('|').map(p => p.trim());
          currentEducation = {
            degree: parts[0] || '',
            school: parts[1] || '',
            dates: parts[parts.length - 1] || '',
            details: [],
          };
        } else if (currentEducation && line.match(/^[•\-]|cgpa|gpa|major/i)) {
          const detail = line.replace(/^[•\-]\s*/, '');
          currentEducation.details = currentEducation.details || [];
          currentEducation.details.push(detail);
        }
        break;

      case 'certifications':
        const cert = line.replace(/^[•\-]\s*/, '');
        if (cert) resume.certifications!.push(cert);
        break;

      case 'projects':
        if (line.match(/^[•\-]/) && currentProject) {
          // It's a description line
          currentProject.description += ' ' + line.replace(/^[•\-]\s*/, '');
        } else if (line.includes(':') || line.includes('Tech:')) {
          if (currentProject?.name) {
            resume.projects!.push(currentProject);
          }
          const techMatch = line.match(/Tech:\s*(.+)$/i);
          const colonIndex = line.indexOf(':');
          currentProject = {
            name: techMatch ? line.substring(0, line.indexOf('Tech:')).trim() : 
                  colonIndex > 0 ? line.substring(0, colonIndex).trim() : line,
            description: techMatch ? '' : colonIndex > 0 ? line.substring(colonIndex + 1).trim() : '',
            technologies: techMatch ? techMatch[1].trim() : undefined,
          };
        }
        break;
    }
  }

  // Save any remaining items
  if (currentExperience?.company) resume.experience.push(currentExperience);
  if (currentEducation?.school) resume.education.push(currentEducation);
  if (currentProject?.name) resume.projects!.push(currentProject);

  return resume;
};

/**
 * Generate Premium Single-Page Resume PDF
 */
export const generatePremiumResumePDF = (content: string, fileName: string = 'resume.pdf'): void => {
  const resume = parseResumeContent(content);
  
  // Initialize PDF - Letter size
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter', // 215.9mm x 279.4mm
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - SPACING.marginLeft - SPACING.marginRight;
  
  let y = SPACING.marginTop;

  // Helper functions
  const setFont = (style: keyof typeof TYPOGRAPHY, color: [number, number, number] = COLORS.text) => {
    const { size, weight } = TYPOGRAPHY[style];
    pdf.setFontSize(size);
    pdf.setFont('helvetica', weight);
    pdf.setTextColor(color[0], color[1], color[2]);
  };

  const addText = (
    text: string, 
    x: number, 
    maxWidth: number, 
    options: { align?: 'left' | 'center' | 'right' } = {}
  ): number => {
    if (!text) return 0;
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = pdf.getFontSize() * 0.35 * SPACING.lineHeight;
    
    for (const line of lines) {
      let textX = x;
      if (options.align === 'center') textX = pageWidth / 2;
      else if (options.align === 'right') textX = pageWidth - SPACING.marginRight;
      
      pdf.text(line, textX, y, { align: options.align || 'left' });
      y += lineHeight;
    }
    return lines.length * lineHeight;
  };

  const addSectionDivider = () => {
    y += 2;
    pdf.setDrawColor(COLORS.divider[0], COLORS.divider[1], COLORS.divider[2]);
    pdf.setLineWidth(0.3);
    pdf.line(SPACING.marginLeft, y, pageWidth - SPACING.marginRight, y);
    y += 4;
  };

  const addSectionHeader = (title: string) => {
    y += SPACING.sectionGap;
    setFont('sectionHeader', COLORS.secondary);
    pdf.text(title.toUpperCase(), SPACING.marginLeft, y);
    y += 1.5;
    
    // Accent line under header
    pdf.setDrawColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    pdf.setLineWidth(0.5);
    pdf.line(SPACING.marginLeft, y, SPACING.marginLeft + 25, y);
    y += 4;
  };

  // Calculate available space and adjust content
  const calculateSpaceNeeded = (): number => {
    let space = SPACING.marginTop + 25; // Header
    space += resume.summary ? 20 : 0;
    space += resume.skills.length > 0 ? 15 + resume.skills.length * 4 : 0;
    space += resume.experience.length * 25;
    space += resume.education.length * 12;
    space += (resume.certifications?.length || 0) > 0 ? 12 : 0;
    return space;
  };

  const isCompact = calculateSpaceNeeded() > pageHeight - 20;

  // ===== HEADER SECTION =====
  // Name - Bold and prominent
  setFont('name', COLORS.primary);
  pdf.text(resume.name || 'Your Name', pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Title/Tagline
  if (resume.title) {
    setFont('title', COLORS.muted);
    pdf.text(resume.title, pageWidth / 2, y, { align: 'center' });
    y += 4;
  }

  // Contact Info - Single line, icons represented by text
  const contactItems: string[] = [];
  if (resume.contact.email) contactItems.push(resume.contact.email);
  if (resume.contact.phone) contactItems.push(resume.contact.phone);
  if (resume.contact.location) contactItems.push(resume.contact.location);
  if (resume.contact.linkedin) contactItems.push(resume.contact.linkedin);
  if (resume.contact.github) contactItems.push(resume.contact.github);

  if (contactItems.length > 0) {
    setFont('contact', COLORS.muted);
    const contactText = contactItems.join('  •  ');
    pdf.text(contactText, pageWidth / 2, y, { align: 'center' });
    y += 3;
  }

  addSectionDivider();

  // ===== PROFESSIONAL SUMMARY =====
  if (resume.summary && resume.summary.length > 10) {
    addSectionHeader('Professional Summary');
    setFont('body', COLORS.text);
    
    // Truncate summary if too long
    let summaryText = resume.summary;
    if (isCompact && summaryText.length > 400) {
      summaryText = summaryText.substring(0, 400) + '...';
    }
    addText(summaryText, SPACING.marginLeft, contentWidth);
  }

  // ===== TECHNICAL SKILLS =====
  if (resume.skills.length > 0) {
    addSectionHeader('Technical Skills');
    
    for (const skillGroup of resume.skills) {
      if (skillGroup.items.length === 0) continue;
      
      setFont('body', COLORS.text);
      const prefix = skillGroup.category ? `${skillGroup.category}: ` : '';
      
      // Limit skills per category if compact
      let items = skillGroup.items;
      if (isCompact && items.length > 15) {
        items = items.slice(0, 15);
      }
      
      const skillText = prefix + items.join(', ');
      addText(skillText, SPACING.marginLeft, contentWidth);
      y += SPACING.itemGap;
    }
  }

  // ===== PROFESSIONAL EXPERIENCE =====
  if (resume.experience.length > 0) {
    addSectionHeader('Professional Experience');
    
    // Limit experiences if compact
    const experiences = isCompact ? resume.experience.slice(0, 3) : resume.experience;
    
    for (const job of experiences) {
      // Job Title - Bold
      setFont('jobTitle', COLORS.primary);
      pdf.text(job.title, SPACING.marginLeft, y);
      
      // Dates - Right aligned
      setFont('small', COLORS.light);
      pdf.text(job.dates, pageWidth - SPACING.marginRight, y, { align: 'right' });
      y += 3.5;
      
      // Company
      setFont('company', COLORS.muted);
      pdf.text(job.company, SPACING.marginLeft, y);
      y += 4;
      
      // Bullets - limit if compact
      const bullets = isCompact ? job.bullets.slice(0, 3) : job.bullets.slice(0, 5);
      setFont('body', COLORS.text);
      
      for (const bullet of bullets) {
        // Bullet point
        pdf.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
        pdf.circle(SPACING.marginLeft + 1.5, y - 1, 0.6, 'F');
        
        // Truncate long bullets
        let bulletText = bullet;
        if (isCompact && bulletText.length > 150) {
          bulletText = bulletText.substring(0, 147) + '...';
        }
        
        y += 0.5;
        const bulletX = SPACING.marginLeft + SPACING.bulletIndent;
        addText(bulletText, bulletX, contentWidth - SPACING.bulletIndent);
        y += SPACING.itemGap;
      }
      
      y += 3;
    }
  }

  // ===== EDUCATION =====
  if (resume.education.length > 0) {
    addSectionHeader('Education');
    
    for (const edu of resume.education) {
      // Degree - Bold
      setFont('jobTitle', COLORS.primary);
      pdf.text(edu.degree, SPACING.marginLeft, y);
      
      // Dates - Right aligned
      setFont('small', COLORS.light);
      pdf.text(edu.dates, pageWidth - SPACING.marginRight, y, { align: 'right' });
      y += 3.5;
      
      // School
      setFont('company', COLORS.muted);
      pdf.text(edu.school, SPACING.marginLeft, y);
      y += 3;
      
      // Details (GPA, etc.)
      if (edu.details && edu.details.length > 0 && !isCompact) {
        setFont('small', COLORS.text);
        for (const detail of edu.details.slice(0, 2)) {
          addText(detail, SPACING.marginLeft + 2, contentWidth - 2);
        }
      }
      
      y += 2;
    }
  }

  // ===== CERTIFICATIONS =====
  if (resume.certifications && resume.certifications.length > 0 && y < pageHeight - 30) {
    addSectionHeader('Certifications');
    
    setFont('body', COLORS.text);
    const certs = isCompact ? resume.certifications.slice(0, 3) : resume.certifications;
    const certText = certs.join('  •  ');
    addText(certText, SPACING.marginLeft, contentWidth);
  }

  // ===== KEY PROJECTS (if space available) =====
  if (resume.projects && resume.projects.length > 0 && y < pageHeight - 40 && !isCompact) {
    addSectionHeader('Key Projects');
    
    for (const project of resume.projects.slice(0, 2)) {
      setFont('jobTitle', COLORS.primary);
      pdf.text(project.name, SPACING.marginLeft, y);
      y += 3;
      
      if (project.description) {
        setFont('body', COLORS.text);
        let desc = project.description;
        if (desc.length > 100) desc = desc.substring(0, 97) + '...';
        addText(desc, SPACING.marginLeft, contentWidth);
      }
      
      if (project.technologies) {
        setFont('small', COLORS.muted);
        addText(`Technologies: ${project.technologies}`, SPACING.marginLeft, contentWidth);
      }
      y += 2;
    }
  }

  // Save and download
  pdf.save(fileName);
};

/**
 * Generate PDF and return as blob for preview
 */
export const generatePremiumResumePDFBlob = (content: string): Blob => {
  const resume = parseResumeContent(content);
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  // ... (same rendering logic as above, but return blob)
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - SPACING.marginLeft - SPACING.marginRight;
  
  let y = SPACING.marginTop;

  const setFont = (style: keyof typeof TYPOGRAPHY, color: [number, number, number] = COLORS.text) => {
    const { size, weight } = TYPOGRAPHY[style];
    pdf.setFontSize(size);
    pdf.setFont('helvetica', weight);
    pdf.setTextColor(color[0], color[1], color[2]);
  };

  const addText = (
    text: string, 
    x: number, 
    maxWidth: number, 
    options: { align?: 'left' | 'center' | 'right' } = {}
  ): number => {
    if (!text) return 0;
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = pdf.getFontSize() * 0.35 * SPACING.lineHeight;
    
    for (const line of lines) {
      let textX = x;
      if (options.align === 'center') textX = pageWidth / 2;
      else if (options.align === 'right') textX = pageWidth - SPACING.marginRight;
      
      pdf.text(line, textX, y, { align: options.align || 'left' });
      y += lineHeight;
    }
    return lines.length * lineHeight;
  };

  const addSectionDivider = () => {
    y += 2;
    pdf.setDrawColor(COLORS.divider[0], COLORS.divider[1], COLORS.divider[2]);
    pdf.setLineWidth(0.3);
    pdf.line(SPACING.marginLeft, y, pageWidth - SPACING.marginRight, y);
    y += 4;
  };

  const addSectionHeader = (title: string) => {
    y += SPACING.sectionGap;
    setFont('sectionHeader', COLORS.secondary);
    pdf.text(title.toUpperCase(), SPACING.marginLeft, y);
    y += 1.5;
    
    pdf.setDrawColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    pdf.setLineWidth(0.5);
    pdf.line(SPACING.marginLeft, y, SPACING.marginLeft + 25, y);
    y += 4;
  };

  const calculateSpaceNeeded = (): number => {
    let space = SPACING.marginTop + 25;
    space += resume.summary ? 20 : 0;
    space += resume.skills.length > 0 ? 15 + resume.skills.length * 4 : 0;
    space += resume.experience.length * 25;
    space += resume.education.length * 12;
    space += (resume.certifications?.length || 0) > 0 ? 12 : 0;
    return space;
  };

  const isCompact = calculateSpaceNeeded() > pageHeight - 20;

  // Header
  setFont('name', COLORS.primary);
  pdf.text(resume.name || 'Your Name', pageWidth / 2, y, { align: 'center' });
  y += 5;

  if (resume.title) {
    setFont('title', COLORS.muted);
    pdf.text(resume.title, pageWidth / 2, y, { align: 'center' });
    y += 4;
  }

  const contactItems: string[] = [];
  if (resume.contact.email) contactItems.push(resume.contact.email);
  if (resume.contact.phone) contactItems.push(resume.contact.phone);
  if (resume.contact.location) contactItems.push(resume.contact.location);
  if (resume.contact.linkedin) contactItems.push(resume.contact.linkedin);
  if (resume.contact.github) contactItems.push(resume.contact.github);

  if (contactItems.length > 0) {
    setFont('contact', COLORS.muted);
    const contactText = contactItems.join('  •  ');
    pdf.text(contactText, pageWidth / 2, y, { align: 'center' });
    y += 3;
  }

  addSectionDivider();

  // Summary
  if (resume.summary && resume.summary.length > 10) {
    addSectionHeader('Professional Summary');
    setFont('body', COLORS.text);
    let summaryText = resume.summary;
    if (isCompact && summaryText.length > 400) {
      summaryText = summaryText.substring(0, 400) + '...';
    }
    addText(summaryText, SPACING.marginLeft, contentWidth);
  }

  // Skills
  if (resume.skills.length > 0) {
    addSectionHeader('Technical Skills');
    for (const skillGroup of resume.skills) {
      if (skillGroup.items.length === 0) continue;
      setFont('body', COLORS.text);
      const prefix = skillGroup.category ? `${skillGroup.category}: ` : '';
      let items = skillGroup.items;
      if (isCompact && items.length > 15) items = items.slice(0, 15);
      const skillText = prefix + items.join(', ');
      addText(skillText, SPACING.marginLeft, contentWidth);
      y += SPACING.itemGap;
    }
  }

  // Experience
  if (resume.experience.length > 0) {
    addSectionHeader('Professional Experience');
    const experiences = isCompact ? resume.experience.slice(0, 3) : resume.experience;
    
    for (const job of experiences) {
      setFont('jobTitle', COLORS.primary);
      pdf.text(job.title, SPACING.marginLeft, y);
      setFont('small', COLORS.light);
      pdf.text(job.dates, pageWidth - SPACING.marginRight, y, { align: 'right' });
      y += 3.5;
      
      setFont('company', COLORS.muted);
      pdf.text(job.company, SPACING.marginLeft, y);
      y += 4;
      
      const bullets = isCompact ? job.bullets.slice(0, 3) : job.bullets.slice(0, 5);
      setFont('body', COLORS.text);
      
      for (const bullet of bullets) {
        pdf.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
        pdf.circle(SPACING.marginLeft + 1.5, y - 1, 0.6, 'F');
        
        let bulletText = bullet;
        if (isCompact && bulletText.length > 150) {
          bulletText = bulletText.substring(0, 147) + '...';
        }
        
        y += 0.5;
        addText(bulletText, SPACING.marginLeft + SPACING.bulletIndent, contentWidth - SPACING.bulletIndent);
        y += SPACING.itemGap;
      }
      y += 3;
    }
  }

  // Education
  if (resume.education.length > 0) {
    addSectionHeader('Education');
    for (const edu of resume.education) {
      setFont('jobTitle', COLORS.primary);
      pdf.text(edu.degree, SPACING.marginLeft, y);
      setFont('small', COLORS.light);
      pdf.text(edu.dates, pageWidth - SPACING.marginRight, y, { align: 'right' });
      y += 3.5;
      setFont('company', COLORS.muted);
      pdf.text(edu.school, SPACING.marginLeft, y);
      y += 3;
      
      if (edu.details && edu.details.length > 0 && !isCompact) {
        setFont('small', COLORS.text);
        for (const detail of edu.details.slice(0, 2)) {
          addText(detail, SPACING.marginLeft + 2, contentWidth - 2);
        }
      }
      y += 2;
    }
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0 && y < pageHeight - 30) {
    addSectionHeader('Certifications');
    setFont('body', COLORS.text);
    const certs = isCompact ? resume.certifications.slice(0, 3) : resume.certifications;
    const certText = certs.join('  •  ');
    addText(certText, SPACING.marginLeft, contentWidth);
  }

  return pdf.output('blob');
};

/**
 * Download premium single-page resume
 */
export const downloadPremiumResume = (content: string, fileName: string = 'resume.pdf') => {
  generatePremiumResumePDF(content, fileName);
};

export default {
  parseResumeContent,
  generatePremiumResumePDF,
  generatePremiumResumePDFBlob,
  downloadPremiumResume,
};
