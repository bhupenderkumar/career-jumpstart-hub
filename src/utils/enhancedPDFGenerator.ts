import jsPDF from 'jspdf';

interface EnhancedPDFOptions {
  resume: string;
  language: string;
  country: string;
  type?: 'resume' | 'cover-letter' | 'email';
  customization?: {
    fontSize?: number;
    fontFamily?: string;
    colorScheme?: 'professional' | 'modern' | 'creative';
    includeWatermark?: boolean;
    includeMetadata?: boolean;
  };
}

interface DownloadResult {
  success: boolean;
  fileName: string;
  fileSize?: number;
  downloadTime?: number;
  metadata?: {
    generatedAt: string;
    version: string;
    versionOptimized: string;
  };
}

// Modern formatting helper functions

export const generateEnhancedPDF = ({ resume, language, country, type = 'resume' }: EnhancedPDFOptions) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 15;
  const maxWidth = pageWidth - (margin * 2);
  let y = margin;

  // Modern color scheme
  const colors = {
    primary: [41, 71, 135],      // Navy blue
    secondary: [60, 60, 60],     // Dark gray
    accent: [70, 150, 145],      // Teal
    light: [100, 100, 100],      // Medium gray
    background: [240, 240, 240], // Light gray
    highlight: [245, 250, 255],  // Very light blue
    tech: [59, 130, 246],        // Blue for tech keywords
    professional: [34, 197, 94], // Green for professional keywords
    metrics: [249, 115, 22]      // Orange for numbers/metrics
  };

  // Key technologies to highlight
  const keyTechnologies = [
    'java', 'spring', 'boot', 'microservices', 'rest', 'api', 'mongodb', 'postgresql',
    'mysql', 'aws', 'docker', 'kubernetes', 'react', 'javascript', 'typescript',
    'python', 'node', 'angular', 'vue', 'git', 'jenkins', 'ci/cd', 'agile', 'scrum',
    'html', 'css', 'sass', 'webpack', 'redux', 'graphql', 'firebase', 'azure',
    'spring boot', 'hibernate', 'maven', 'gradle', 'jvm', 'kotlin', 'scala'
  ];

  // Professional keywords to highlight
  const professionalKeywords = [
    'experience', 'years', 'developed', 'implemented', 'managed', 'led', 'built',
    'designed', 'optimized', 'improved', 'achieved', 'delivered', 'collaborated',
    'scalable', 'performance', 'architecture', 'team', 'project', 'solution',
    'responsible', 'maintained', 'created', 'established', 'coordinated',
    'senior', 'lead', 'principal', 'director', 'manager'
  ];

  // Enhanced text cleaning
  const cleanText = (text: string): string => {
    if (typeof text !== 'string') {
      return String(text || '');
    }
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Normalize bullet points and dashes
      .replace(/[•●◦○⚬]/g, '•')
      .replace(/[-–—]/g, '-')
      .trim();
  };

  // Highlight keywords in text for PDF
  const highlightKeywords = (text: string): { text: string; shouldBold: boolean; color: number[] }[] => {
    const words = text.split(/(\s+|[,;|().])/);
    return words.map(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');

      // Check for technology keywords
      const isTech = keyTechnologies.some(tech =>
        tech.toLowerCase().replace(/[^a-z]/g, '') === cleanWord ||
        cleanWord.includes(tech.toLowerCase().replace(/[^a-z]/g, ''))
      );

      // Check for professional keywords
      const isProfessional = professionalKeywords.includes(cleanWord);

      // Check for metrics/numbers
      const isMetric = /\\d+(?:\\.\\d+)?(?:%|\\+|k|K|M|years?|months?|\\$)/.test(word);

      if (isTech) {
        return { text: word, shouldBold: true, color: colors.tech };
      } else if (isProfessional) {
        return { text: word, shouldBold: true, color: colors.professional };
      } else if (isMetric) {
        return { text: word, shouldBold: true, color: colors.metrics };
      }

      return { text: word, shouldBold: false, color: colors.secondary };
    });
  };

  // Enhanced text helper with highlighting and page breaks
  const addText = (text: string, x: number, yPos: number, options: any = {}): number => {
    const {
      fontSize = 9,
      fontStyle = 'normal',
      color = colors.secondary,
      align = 'left',
      maxWidth: textMaxWidth = maxWidth,
      lineHeight = 1.2,
      highlight = false
    } = options;

    const cleanedText = cleanText(text);
    if (!cleanedText) return yPos;

    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    pdf.setTextColor(color[0], color[1], color[2]);

    let finalX = x;
    if (align === 'center') {
      const textWidth = pdf.getTextWidth(cleanedText);
      finalX = (pageWidth - textWidth) / 2;
    } else if (align === 'right') {
      const textWidth = pdf.getTextWidth(cleanedText);
      finalX = pageWidth - margin - textWidth;
    }

    if (highlight) {
      // Add highlighted text with keyword emphasis
      const segments = highlightKeywords(cleanedText);
      let currentX = finalX;
      let currentY = yPos;

      segments.forEach(segment => {
        pdf.setFont('helvetica', segment.shouldBold ? 'bold' : fontStyle);
        pdf.setTextColor(segment.color[0], segment.color[1], segment.color[2]);

        const textWidth = pdf.getTextWidth(segment.text);

        // Check if text fits on current line
        if (currentX + textWidth > pageWidth - margin) {
          currentY += fontSize * lineHeight * 0.35;
          currentX = finalX;
        }

        // Check if we need a new page
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = margin;
          currentX = finalX;
        }

        pdf.text(segment.text, currentX, currentY);
        currentX += textWidth;
      });

      return currentY + fontSize * lineHeight * 0.35;
    } else {
      // Regular text without highlighting
      const lines = pdf.splitTextToSize(cleanedText, textMaxWidth);
      const lineSpacing = fontSize * lineHeight * 0.35;
      let currentY = yPos;

      lines.forEach((line: string) => {
        // Check if we need a new page for this line
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.text(line, finalX, currentY);
        currentY += lineSpacing;
      });

      return currentY;
    }
  };

  // Add line helper
  const addLine = (x1: number, y1: number, x2: number, y2: number, color = colors.primary, width = 0.5): void => {
    pdf.setDrawColor(color[0], color[1], color[2]);
    pdf.setLineWidth(width);
    pdf.line(x1, y1, x2, y2);
  };

  // Add background helper
  const addBackground = (x: number, y: number, width: number, height: number, color = colors.background): void => {
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(x, y, width, height, 'F');
  };

  try {

    // Parse resume content with experience consolidation
    const parseResume = (text: string) => {
      const lines = text.split('\\n').map(line => line.trim()).filter(line => line);
      const sections: { [key: string]: string[] } = {};
      let currentSection = 'header';
      let headerInfo: string[] = [];
      let headerComplete = false;
      let experienceEntries: any[] = [];

      lines.forEach((line, index) => {
        // Detect section headers (all caps, common section names)
        const isSection = line.match(/^[A-Z\\s&]+$/) && line.length > 3 && (
          line.includes('PROFESSIONAL') || line.includes('SUMMARY') ||
          line.includes('SKILLS') || line.includes('EXPERIENCE') ||
          line.includes('EDUCATION') || line.includes('WORK') ||
          line.includes('ADDITIONAL') || line.includes('CERTIFICATIONS') ||
          line.includes('PROJECTS') || line.includes('LANGUAGES')
        );

        if (isSection) {
          headerComplete = true;
          currentSection = line.toLowerCase().replace(/[^a-z]/g, '');
          sections[currentSection] = [];
        } else if (!headerComplete && index < 8) {
          headerInfo.push(line);
        } else {
          if (!sections[currentSection]) {
            sections[currentSection] = [];
          }
          if (line.length > 0) {
            sections[currentSection].push(line);
          }
        }
      });

      // Process experience section to consolidate by company and extract dates
      if (sections['workexperience'] || sections['experience']) {
        const expSection = sections['workexperience'] || sections['experience'];
        const consolidatedExp: string[] = [];
        let currentCompany = '';
        let currentRole = '';
        let startDate = '';
        let endDate = '';
        let responsibilities: string[] = [];

        expSection.forEach(line => {
          // Check if line contains job title and company (format: "Title | Company | Dates")
          if (line.includes('|')) {
            // Save previous entry if exists
            if (currentCompany && currentRole) {
              const dateRange = startDate && endDate ? ` (${startDate} - ${endDate})` : '';
              consolidatedExp.push(`${currentRole} | ${currentCompany}${dateRange}`);
              responsibilities.forEach(resp => consolidatedExp.push(resp));
              consolidatedExp.push(''); // Add spacing
            }

            // Parse new entry
            const parts = line.split('|').map(p => p.trim());
            currentRole = parts[0] || '';
            currentCompany = parts[1] || '';

            // Extract dates if present
            if (parts[2]) {
              const dateMatch = parts[2].match(/(\\w+\\s+\\d{4})\\s*-\\s*(\\w+\\s+\\d{4}|Present|Current)/i);
              if (dateMatch) {
                startDate = dateMatch[1];
                endDate = dateMatch[2];
              }
            }

            responsibilities = [];
          } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
            // Add responsibility to current role
            responsibilities.push(line);
          }
        });

        // Add last entry
        if (currentCompany && currentRole) {
          const dateRange = startDate && endDate ? ` (${startDate} - ${endDate})` : '';
          consolidatedExp.push(`${currentRole} | ${currentCompany}${dateRange}`);
          responsibilities.forEach(resp => consolidatedExp.push(resp));
        }

        // Replace experience section with consolidated version
        if (sections['workexperience']) {
          sections['workexperience'] = consolidatedExp;
        } else if (sections['experience']) {
          sections['experience'] = consolidatedExp;
        }
      }

      return { sections, headerInfo };
    };

    const { sections, headerInfo } = parseResume(resume);

    // Header section with enhanced styling
    if (headerInfo.length > 0) {
      // Header background
      addBackground(0, y - 5, pageWidth, 40, colors.highlight);
      addBackground(0, y + 30, pageWidth, 5, colors.background);

      // Name (large, bold, primary color)
      const name = cleanText(headerInfo[0]);
      y = addText(name, margin, y + 8, {
        fontSize: type === 'cover-letter' ? 18 : type === 'email' ? 16 : 20,
        fontStyle: 'bold',
        color: colors.primary,
        align: type === 'cover-letter' ? 'right' : 'left'
      });
      y += 2;

      // Title/Role (medium, normal, secondary color)
      if (headerInfo[1]) {
        const title = cleanText(headerInfo[1]);
        y = addText(title, margin, y, {
          fontSize: 12,
          color: colors.secondary,
          fontStyle: 'normal',
          highlight: true // Enable keyword highlighting for job titles
        });
        y += 3;
      }

      // Contact information in a clean row
      const contactInfo = headerInfo.slice(2).filter(line =>
        line.includes('@') || line.includes('phone') || line.includes('linkedin') ||
        line.includes('github') || line.includes('\\+') || line.includes('http')
      );

      const contactIcons = {
        gmail: '✉',
        phone: '☎',
        linkedin: '💼',
      };

      if (contactInfo.length > 0) {
        let contactY = y;
        let contactX = margin;
        const contactSpacing = (maxWidth) / Math.min(contactInfo.length, 3);

        contactInfo.slice(0, 3).forEach((contact) => {
          const cleanContact = cleanText(contact);
          let icon = '';
          if (cleanContact.includes('@')) {
            icon = contactIcons.gmail;
          } else if (cleanContact.includes('\\+') || cleanContact.includes('phone')) {
            icon = contactIcons.phone;
          } else if (cleanContact.includes('linkedin')) {
            icon = contactIcons.linkedin;
          }
          addText(`${icon} ${cleanContact}`, contactX, contactY, {
            fontSize: 8,
            color: colors.light,
            fontStyle: 'normal',
            highlight: false
          });
          contactX += contactSpacing;
        });

        // Additional contacts on next line if needed
        if (contactInfo.length > 3) {
          contactY += 4;
          contactX = margin;
          contactInfo.slice(3).forEach((contact) => {
            const cleanContact = cleanText(contact);
            addText(cleanContact, contactX, contactY, {
              fontSize: 8,
              color: colors.light,
              fontStyle: 'normal',
              highlight: false
            });
            contactX += contactSpacing;
          });
        }

        y = contactY + 6;
      }

      // Professional separator line
      addLine(margin, y + 2, pageWidth - margin, y + 2, colors.accent, 1);
      y += 8;
    }

    // Enhanced section rendering with keyword highlighting
    const addSection = (title: string, content: string[], yPos: number): number => {
      // Check if we need a new page for the section header
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = margin;
      }

      // Section spacing
      yPos += 8;

      // Section header with background
      const headerHeight = type === 'cover-letter' ? 14 : type === 'email' ? 10 : 12;
      const headerBg = type === 'email' ? colors.background : colors.highlight;
      addBackground(0, yPos - 4, pageWidth, headerHeight, headerBg);

      // Section title styling
      const titleStyle = type === 'cover-letter' ? {
        fontSize: 13,
        fontStyle: 'bold',
        color: colors.primary
      } : type === 'email' ? {
        fontSize: 11,
        fontStyle: 'bold',
        color: colors.secondary
      } : {
        fontSize: 12,
        fontStyle: 'bold',
        color: colors.primary
      };

      yPos = addText(title.toUpperCase(), margin, yPos + 4, titleStyle);

      // Accent line
      addLine(margin, yPos + 3, pageWidth - margin, yPos + 3, colors.accent, 0.5);
      yPos += 8;

      // Content with enhanced formatting and keyword highlighting
      content.forEach(item => {
        const cleanItem = cleanText(item);
        if (!cleanItem) return;

        // Check if we need a new page before adding content
        if (yPos > pageHeight - 25) {
          pdf.addPage();
          yPos = margin;
        }

        if (cleanItem.startsWith('•') || cleanItem.startsWith('-') || cleanItem.startsWith('*')) {
          // Enhanced bullet points
          const bulletText = cleanItem.replace(/^[•\\-\\*]\\s*/, '');

          // Draw filled circle bullet point
          pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
          pdf.circle(margin + 4, yPos - 1.75, 0.8, 'F');

          // Add bullet text with keyword highlighting
          yPos = addText(bulletText, margin + 8, yPos - 0.5, {
            fontSize: 10,
            fontStyle: 'normal',
            color: colors.secondary,
            maxWidth: maxWidth - 15,
            lineHeight: 1.3,
            highlight: true // Enable keyword highlighting
          });

          yPos += 1.5;

        } else if (cleanItem.includes('|')) {
          // Job title with company - enhanced formatting
          const parts = cleanItem.split('|').map(p => p.trim());

          // Job title with highlight background
          const titleText = parts[0];
          const titleWidth = pdf.getTextWidth(titleText);

          // Add highlight background for job titles
          addBackground(margin - 2, yPos - 6, titleWidth + 4, 8, colors.highlight);

          // Add job title with keyword highlighting
          yPos = addText(titleText, margin, yPos, {
            fontSize: 11.5,
            fontStyle: 'bold',
            color: colors.primary,
            highlight: true
          });

          // Company and dates
          if (parts[1]) {
            const companyY = yPos - 4;
            addText(`| ${parts[1]}`, margin + pdf.getTextWidth(parts[0]) + 5, companyY, {
              fontSize: 10,
              fontStyle: 'bold',
              color: colors.primary
            });
          }
          yPos += 3;

        } else {
          // Regular text
          const textStyle = type === 'cover-letter' ? {
            fontSize: 11,
            fontStyle: 'normal',
            color: colors.secondary,
            lineHeight: 1.6,
            maxWidth: maxWidth - 10,
            highlight: true
          } : type === 'email' ? {
            fontSize: 10.5,
            fontStyle: 'normal',
            color: colors.secondary,
            lineHeight: 1.5,
            maxWidth: maxWidth - 8,
            highlight: true
          } : {
            fontSize: 10,
            fontStyle: 'normal',
            color: colors.secondary,
            lineHeight: 1.4,
            highlight: true
          };

          yPos = addText(cleanItem, margin, yPos, textStyle);
          yPos += type === 'cover-letter' ? 4 : type === 'email' ? 3 : 2;
        }
      });

      return yPos + 5;
    };

    // Define sections based on document type
    const sectionMappings = type === 'cover-letter' ? [
      { keys: ['letterheader', 'header'], title: 'Letter Header' },
      { keys: ['greeting', 'salutation'], title: 'Greeting' },
      { keys: ['opening', 'introduction'], title: 'Letter Body' },
      { keys: ['closing', 'conclusion'], title: 'Closing' },
    ] : type === 'email' ? [
      { keys: ['subject', 'emailsubject'], title: 'Subject Line' },
      { keys: ['greeting', 'salutation'], title: 'Greeting' },
      { keys: ['body', 'content', 'main'], title: 'Email Body' },
      { keys: ['closing', 'signature'], title: 'Signature' },
    ] : [
      { keys: ['professionalsummary', 'summary', 'profile'], title: 'Professional Summary' },
      { keys: ['keyskills', 'skills', 'technicalskills'], title: 'Key Skills' },
      { keys: ['workexperience', 'experience', 'employment', 'career'], title: 'Work Experience' },
      { keys: ['education', 'educationcertifications', 'qualifications'], title: 'Education' },
      { keys: ['certifications', 'certificates'], title: 'Certifications' },
      { keys: ['additionalinformation', 'additional', 'other', 'projects'], title: 'Additional Information' }
    ];

    // Render sections
    sectionMappings.forEach(mapping => {
      const foundKey = mapping.keys.find(key => sections[key] && sections[key].length > 0);

      if (foundKey) {
        console.log(`Rendering section: ${mapping.title} (found as: ${foundKey})`);
        y = addSection(mapping.title, sections[foundKey], y);
      }
    });

    // Add any remaining sections that weren't in the standard list
    Object.entries(sections).forEach(([sectionKey, content]) => {
      const isAlreadyRendered = sectionMappings.some(mapping =>
        mapping.keys.includes(sectionKey)
      );

      if (!isAlreadyRendered && content.length > 0) {
        const title = sectionKey
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/^./, str => str.toUpperCase());
        console.log(`Rendering additional section: ${title}`);
        y = addSection(title, content, y);
      }
    });

    // Smart file naming based on content and type
    const fileName = 'enhanced_resume.pdf';

    console.log('Saving modern PDF as:', fileName);
    pdf.save(fileName);

    return {
      success: true,
      fileName
    };

  } catch (error) {
    console.error('Enhanced PDF generation error:', error);
    throw new Error('Failed to generate enhanced PDF');
  }
};
