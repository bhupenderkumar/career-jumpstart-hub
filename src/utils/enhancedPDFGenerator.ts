import jsPDF from 'jspdf';

interface PDFGeneratorOptions {
  resume: string;
  language: string;
  country: string;
  type?: 'resume' | 'cover-letter' | 'email';
}

// Extract name and role from resume for filename
const extractNameAndRole = (resume: string): { name: string; role: string } => {
  const lines = resume.split('\n').map(line => line.trim()).filter(line => line);

  // Extract name (usually first line, remove markdown)
  let name = 'Resume';
  if (lines.length > 0) {
    name = lines[0]
      .replace(/\*\*/g, '')
      .replace(/[^a-zA-Z\s]/g, '')
      .trim()
      .split(' ')
      .slice(0, 2) // First and last name
      .join('_')
      .toLowerCase();
  }

  // Extract role (look for common job titles)
  let role = 'professional';
  const roleKeywords = [
    'engineer', 'developer', 'architect', 'manager', 'lead', 'senior', 'junior',
    'analyst', 'consultant', 'specialist', 'coordinator', 'director', 'designer',
    'full stack', 'backend', 'frontend', 'software', 'web', 'mobile', 'devops',
    'data', 'machine learning', 'ai', 'blockchain', 'cloud'
  ];

  const resumeText = resume.toLowerCase();
  for (const keyword of roleKeywords) {
    if (resumeText.includes(keyword)) {
      role = keyword.replace(/\s+/g, '_');
      break;
    }
  }

  return { name: name || 'resume', role };
};

export const generateEnhancedPDF = ({ resume, language, country, type = 'resume' }: PDFGeneratorOptions) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 15; // Increased margin for better readability
  const maxWidth = pageWidth - (margin * 2);
  let y = margin;

  // Simple, professional color scheme
  const colors = {
    primary: [41, 71, 135],      // Navy blue
    secondary: [60, 60, 60],     // Dark gray
    accent: [70, 150, 145],      // Teal
    light: [100, 100, 100],      // Medium gray
    background: [240, 240, 240], // Light gray
    highlight: [245, 250, 255]   // Very light blue
  };

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

  // Contact icon helper
  const getContactIcon = (text: string): string => {
    if (text.includes('@')) return '✉';
    if (text.includes('+') || text.includes('phone')) return '☎';
    if (text.includes('linkedin')) return '💼';
    if (text.includes('github')) return '⚡';
    if (text.includes('http')) return '🌐';
    return '📍';
  };

  // Enhanced text helper with better spacing and page breaks
  const addText = (text: string, x: number, yPos: number, options: any = {}): number => {
    const {
      fontSize = 9,
      fontStyle = 'normal',
      color = colors.secondary,
      align = 'left',
      maxWidth: textMaxWidth = maxWidth,
      lineHeight = 1.2
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

    const lines = pdf.splitTextToSize(cleanedText, textMaxWidth);
    const lineSpacing = fontSize * lineHeight * 0.35;
    let currentY = yPos;

    lines.forEach((line: string, index: number) => {
      // Check if we need a new page for this line
      if (currentY > pageHeight - 20) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.text(line, finalX, currentY);
      currentY += lineSpacing;
    });

    return currentY;
  };

  // Enhanced line helper
  const addLine = (x1: number, y1: number, x2: number, y2: number, color = colors.primary, width = 0.5): void => {
    pdf.setDrawColor(color[0], color[1], color[2]);
    pdf.setLineWidth(width);
    pdf.line(x1, y1, x2, y2);
  };

  // Add background accent
  const addBackground = (x: number, y: number, width: number, height: number, color = colors.background): void => {
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(x, y, width, height, 'F');
  };

  // Enhanced section with better formatting and proper page breaks
  const addSection = (title: string, content: string[], yPos: number): number => {
    // Check if we need a new page for the section header
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = margin;
    }

    console.log(`Adding section: ${title} with ${content.length} items at y=${yPos}`);

    // Section spacing
    yPos += 8;

    // Simple but effective section header
    // Adjust section styling based on document type
    const headerHeight = type === 'cover-letter' ? 14 : type === 'email' ? 10 : 12;
    const headerBg = type === 'email' ? colors.background : colors.highlight;
    addBackground(0, yPos - 4, pageWidth, headerHeight, headerBg);

    // Adjust section title styling
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

    // Subtle accent line
    addLine(margin, yPos + 3, pageWidth - margin, yPos + 3, colors.accent, 0.5);
    yPos += 8; // Increased spacing after section title

    // Content with better formatting and proper page breaks
    content.forEach(item => {
      const cleanItem = cleanText(item);
      if (!cleanItem) return;

      // Check if we need a new page before adding content
      if (yPos > pageHeight - 25) {
        pdf.addPage();
        yPos = margin;
      }

      if (cleanItem.startsWith('•') || cleanItem.startsWith('-') || cleanItem.startsWith('*')) {
        // Enhanced bullet points with filled circles
        const bulletText = cleanItem.replace(/^[•\-\*]\s*/, '');

        // Draw a filled circle bullet point
        pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        pdf.circle(margin + 4, yPos - 1.75, 0.8, 'F');

        // Add bullet text with perfect alignment
        const bulletTextY = yPos - 0.5; // Slight adjustment for perfect alignment
        yPos = addText(bulletText, margin + 8, bulletTextY, {
          fontSize: 10,
          fontStyle: 'normal',
          color: colors.secondary,
          maxWidth: maxWidth - 15,
          lineHeight: 1.3
        });

        // Add minimal space between bullet points
        yPos += 1.5;

      } else if (cleanItem.includes('|')) {
        // Job title with company - enhanced formatting with bolder text
        const parts = cleanItem.split('|').map(p => p.trim());

        // Job title with highlight background
        const titleText = parts[0];
        const titleWidth = pdf.getTextWidth(titleText);
        
        // Add highlight background
        // Highlight important job titles
        addBackground(margin - 2, yPos - 6, titleWidth + 4, 8, colors.highlight);
        
        // Add job title with better contrast
        yPos = addText(titleText, margin, yPos, {
          fontSize: 11.5,
          fontStyle: 'bold',
          color: colors.primary
        });

        // Company and dates (semi-bold, blue)
        if (parts[1]) {
          const companyY = yPos - 4; // Same line as title
          addText(`| ${parts[1]}`, margin + pdf.getTextWidth(parts[0]) + 5, companyY, {
            fontSize: 10,
            fontStyle: 'bold',
            color: colors.primary
          });
        }
        yPos += 3;

      } else {
        // Adjust text style based on document type
        const textStyle = type === 'cover-letter' ? {
          fontSize: 11,
          fontStyle: 'normal',
          color: colors.secondary,
          lineHeight: 1.6,
          maxWidth: maxWidth - 10
        } : type === 'email' ? {
          fontSize: 10.5,
          fontStyle: 'normal',
          color: colors.secondary,
          lineHeight: 1.5,
          maxWidth: maxWidth - 8
        } : {
          fontSize: 10,
          fontStyle: 'normal',
          color: colors.secondary,
          lineHeight: 1.4
        };

        yPos = addText(cleanItem, margin, yPos, textStyle);
        yPos += type === 'cover-letter' ? 4 : type === 'email' ? 3 : 2;
      }
    });

    return yPos + 5; // Increased section spacing
  };

  // Enhanced resume parsing
  const parseResume = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const sections: { [key: string]: string[] } = {};
    let currentSection = 'header';
    let headerInfo: string[] = [];
    let headerComplete = false;

    lines.forEach((line, index) => {
      // Detect section headers (all caps, common section names)
      const isSection = line.match(/^[A-Z\s&]+$/) && line.length > 3 && (
        line.includes('PROFESSIONAL') || line.includes('SUMMARY') ||
        line.includes('SKILLS') || line.includes('EXPERIENCE') ||
        line.includes('EDUCATION') || line.includes('WORK') ||
        line.includes('ADDITIONAL') || line.includes('CERTIFICATIONS') ||
        line.includes('PROJECTS') || line.includes('LANGUAGES')
      );

      if (isSection) {
        // Section header found
        headerComplete = true;
        currentSection = line.toLowerCase().replace(/[^a-z]/g, '');
        sections[currentSection] = [];
      } else if (!headerComplete && index < 8) {
        // Still in header section (first 8 lines or until first section)
        headerInfo.push(line);
      } else {
        // Content for current section
        if (!sections[currentSection]) {
          sections[currentSection] = [];
        }
        if (line.length > 0) { // Only add non-empty lines
          sections[currentSection].push(line);
        }
      }
    });

    // Debug logging
    console.log('Parsed sections:', Object.keys(sections));
    console.log('Header info:', headerInfo);
    Object.entries(sections).forEach(([key, content]) => {
      console.log(`Section ${key}:`, content.length, 'items');
    });

    return { sections, headerInfo };
  };

  try {
    const { sections, headerInfo } = parseResume(resume);

    // Different header styling based on document type
    if (headerInfo.length > 0) {
      if (type === 'cover-letter') {
        // Header background with larger height for cover letter
        addBackground(0, 0, pageWidth, 45, colors.highlight);
        addBackground(0, 40, pageWidth, 5, colors.background);
        
        const date = new Date().toLocaleDateString();
        y = addText(date, pageWidth - margin - 40, y + 8, {
          fontSize: 10,
          color: colors.secondary,
          align: 'right'
        });
        y += 4;
      } else if (type === 'email') {
        // Minimal header for email template
        addBackground(0, 0, pageWidth, 30, colors.highlight);
        y += 4;
      } else {
        // Default resume header
        addBackground(0, 0, pageWidth, 40, colors.highlight);
        addBackground(0, 35, pageWidth, 5, colors.background);
      }

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
          fontStyle: 'normal'
        });
        y += 3;
      }

      // Contact information in a clean row
      const contactInfo = headerInfo.slice(2).filter(line =>
        line.includes('@') || line.includes('phone') || line.includes('linkedin') ||
        line.includes('github') || line.includes('+') || line.includes('http')
      );

      if (contactInfo.length > 0) {
        // Create contact row
        let contactY = y;
        let contactX = margin;
        const contactSpacing = (maxWidth) / Math.min(contactInfo.length, 3);

        contactInfo.slice(0, 3).forEach((contact, index) => {
          const cleanContact = cleanText(contact);
          addText(cleanContact, contactX, contactY, {
            fontSize: 8,
            color: colors.light
          });
          contactX += contactSpacing;
        });

        // Additional contacts on next line if needed
        if (contactInfo.length > 3) {
          contactY += 4;
          contactX = margin;
          contactInfo.slice(3).forEach((contact, index) => {
            const cleanContact = cleanText(contact);
            addText(cleanContact, contactX, contactY, {
              fontSize: 8,
              color: colors.light
            });
            contactX += contactSpacing;
          });
        }

        y = contactY + 6;
      }

      // Professional separator line - positioned better
      addLine(margin, y + 2, pageWidth - margin, y + 2, colors.accent, 1);
      y += 8;
    }

    // Define sections based on document type
    const sectionMappings = type === 'cover-letter' ? [
      { keys: ['letterheader', 'header'], title: 'Letter Header' },
      { keys: ['greeting', 'salutation'], title: 'Greeting' },
      { keys: ['opening', 'introduction'], title: 'Opening' },
      { keys: ['body', 'content', 'main'], title: 'Letter Body' },
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

    sectionMappings.forEach(mapping => {
      // Find the first matching section key
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

    // Remove footer - clean professional look

    // Smart file naming based on content and type
    const { name, role } = extractNameAndRole(resume);
    const countryCode = country.toLowerCase().replace(/[^a-z]/g, '').replace('international', '');
    const typeLabel = type === 'cover-letter' ? 'cover_letter' :
                     type === 'email' ? 'email' : 'resume';
    
    const fileName = countryCode ?
      `${name}_${role}_${countryCode}_${typeLabel}.pdf` :
      `${name}_${role}_${typeLabel}.pdf`;

    pdf.save(fileName);
  } catch (error) {
    console.error('Enhanced PDF generation error:', error);
    throw new Error('Failed to generate enhanced PDF');
    return false;
  }
  return true;
};
