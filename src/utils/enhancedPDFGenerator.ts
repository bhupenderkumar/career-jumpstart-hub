import jsPDF from 'jspdf';

interface PDFGeneratorOptions {
  resume: string;
  language: string;
  country: string;
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

export const generateEnhancedPDF = ({ resume, language, country }: PDFGeneratorOptions) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 12;
  const maxWidth = pageWidth - (margin * 2);
  let y = margin;

  // Enhanced color scheme
  const colors = {
    primary: [41, 98, 255],      // Professional blue
    secondary: [55, 65, 81],     // Dark gray
    accent: [16, 185, 129],      // Green
    light: [156, 163, 175],      // Light gray
    background: [249, 250, 251]  // Very light gray
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

  // Enhanced text helper with better spacing
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

    lines.forEach((line: string, index: number) => {
      if (yPos + (index * lineSpacing) < pageHeight - 15) {
        pdf.text(line, finalX, yPos + (index * lineSpacing));
      }
    });

    return yPos + (lines.length * lineSpacing);
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

  // Enhanced section with better formatting
  const addSection = (title: string, content: string[], yPos: number): number => {
    if (yPos > pageHeight - 30) return yPos; // Prevent overflow

    console.log(`Adding section: ${title} with ${content.length} items at y=${yPos}`);

    // Section spacing
    yPos += 6;

    // Section header with background
    const headerHeight = 8;
    addBackground(margin - 2, yPos - 2, maxWidth + 4, headerHeight, colors.background);

    // Section title
    yPos = addText(title.toUpperCase(), margin, yPos + 3, {
      fontSize: 11,
      fontStyle: 'bold',
      color: colors.primary
    });

    // Underline
    addLine(margin, yPos + 1, margin + 40, yPos + 1, colors.accent, 1);
    yPos += 4;

    // Content with better formatting
    content.forEach(item => {
      if (yPos > pageHeight - 15) return; // Prevent overflow

      const cleanItem = cleanText(item);
      if (!cleanItem) return;

      if (cleanItem.startsWith('•') || cleanItem.startsWith('-') || cleanItem.startsWith('*')) {
        // Bullet points with better spacing
        const bulletText = cleanItem.replace(/^[•\-\*]\s*/, '');

        // Add bullet
        yPos = addText('•', margin + 3, yPos, {
          fontSize: 8,
          color: colors.accent,
          fontStyle: 'bold'
        });

        // Add bullet text
        const bulletY = yPos - 3; // Align with bullet
        yPos = addText(bulletText, margin + 10, bulletY, {
          fontSize: 9,
          color: colors.secondary,
          maxWidth: maxWidth - 15,
          lineHeight: 1.3
        });
        yPos += 1; // Small spacing between bullets

      } else if (cleanItem.includes('|')) {
        // Job title with company - enhanced formatting
        const parts = cleanItem.split('|').map(p => p.trim());

        // Job title (bold)
        yPos = addText(parts[0], margin, yPos, {
          fontSize: 10,
          fontStyle: 'bold',
          color: colors.secondary
        });

        // Company and dates (normal, blue)
        if (parts[1]) {
          const companyY = yPos - 3; // Same line as title
          addText(`| ${parts[1]}`, margin + pdf.getTextWidth(parts[0]) + 3, companyY, {
            fontSize: 9,
            color: colors.primary
          });
        }
        yPos += 2;

      } else {
        // Regular text with better spacing
        yPos = addText(cleanItem, margin, yPos, {
          fontSize: 9,
          color: colors.secondary,
          lineHeight: 1.3
        });
        yPos += 1;
      }
    });

    return yPos + 3; // Section spacing
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

    // Professional header with enhanced design
    if (headerInfo.length > 0) {
      // Header background
      addBackground(0, 0, pageWidth, 35, colors.background);

      // Name (large, bold, primary color)
      const name = cleanText(headerInfo[0]);
      y = addText(name, margin, y + 8, {
        fontSize: 20,
        fontStyle: 'bold',
        color: colors.primary
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

      // Professional separator line
      addLine(margin, y, pageWidth - margin, y, colors.accent, 1.5);
      y += 6;
    }

    // Add sections in order - try multiple variations
    const sectionMappings = [
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

      if (foundKey && y < pageHeight - 30) {
        console.log(`Rendering section: ${mapping.title} (found as: ${foundKey})`);
        y = addSection(mapping.title, sections[foundKey], y);
      }
    });

    // Add any remaining sections that weren't in the standard list
    Object.entries(sections).forEach(([sectionKey, content]) => {
      const isAlreadyRendered = sectionMappings.some(mapping =>
        mapping.keys.includes(sectionKey)
      );

      if (!isAlreadyRendered && content.length > 0 && y < pageHeight - 30) {
        const title = sectionKey
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/^./, str => str.toUpperCase());
        console.log(`Rendering additional section: ${title}`);
        y = addSection(title, content, y);
      }
    });

    // Professional footer
    const footerY = pageHeight - 8;
    addText(`AI-Optimized for ${country} | Generated ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY, {
      fontSize: 7,
      color: colors.light,
      align: 'center'
    });

    // Smart file naming based on content
    const { name, role } = extractNameAndRole(resume);
    const countryCode = country.toLowerCase().replace(/[^a-z]/g, '').replace('international', '');
    const fileName = countryCode ? `${name}_${role}_${countryCode}_resume.pdf` : `${name}_${role}_resume.pdf`;

    pdf.save(fileName);
    return true;

  } catch (error) {
    console.error('Enhanced PDF generation error:', error);
    throw new Error('Failed to generate enhanced PDF');
  }
};
