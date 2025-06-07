import jsPDF from 'jspdf';

interface ModernPDFOptions {
  resume: string;
  language: string;
  country: string;
}

// Extract name, role, and company for filename
const extractNameRoleAndCompany = (resume: string): { name: string; role: string; company: string } => {
  const lines = resume.split('\n').map(line => line.trim()).filter(line => line);

  let name = 'resume';
  if (lines.length > 0) {
    name = lines[0]
      .replace(/\*\*/g, '')
      .replace(/[^a-zA-Z\s]/g, '')
      .trim()
      .split(' ')
      .slice(0, 2)
      .join('_')
      .toLowerCase();
  }

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

  // Extract company name from job descriptions or cover letter
  let company = '';
  const companyPatterns = [
    /(?:dear\s+(?:hiring\s+manager\s+at\s+|team\s+at\s+)?|application\s+(?:for|to)\s+|position\s+at\s+|work\s+(?:at|for)\s+|join\s+(?:the\s+team\s+at\s+)?|interested\s+in\s+)([A-Z][a-zA-Z\s&.,'-]+?)(?:\s+(?:team|company|corporation|inc|ltd|llc|as|for|in|to|and|,|\.|!|\?))/gi,
    /([A-Z][a-zA-Z\s&.,'-]+?)\s+(?:company|corporation|inc|ltd|llc|team|hiring|position|role|job|opportunity)/gi,
    /(?:at|with|for)\s+([A-Z][a-zA-Z\s&.,'-]{2,30}?)(?:\s+(?:as|in|for|,|\.|!|\?|$))/gi
  ];

  for (const pattern of companyPatterns) {
    const matches = [...resume.matchAll(pattern)];
    if (matches.length > 0) {
      const potentialCompany = matches[0][1]
        .trim()
        .replace(/[^a-zA-Z\s&]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase()
        .substring(0, 20); // Limit length

      if (potentialCompany.length > 2 && !potentialCompany.includes('hiring') && !potentialCompany.includes('manager')) {
        company = potentialCompany;
        break;
      }
    }
  }

  return { name: name || 'resume', role, company };
};

// Specialized function for cover letter formatting
const generateCoverLetterPDF = (pdf: any, lines: string[], colors: any, margin: number, maxWidth: number, pageHeight: number, addText: any, country: string) => {
  let y = margin;
  let inHeader = true;
  let inDate = false;
  let inBody = false;

  // Function to add new page if needed
  const checkPageBreak = (requiredSpace: number = 15) => {
    if (y > pageHeight - requiredSpace) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) {
      y += 3; // Small gap for empty lines
      continue;
    }

    checkPageBreak();

    // Header section (name and contact)
    if (inHeader && !cleanLine.toLowerCase().includes('dear')) {
      if (cleanLine.includes('@') || cleanLine.includes('+') || cleanLine.includes('http')) {
        // Contact info
        y = addText(cleanLine, margin, y, 9, 'normal', colors.light);
      } else if (cleanLine.match(/^\d{1,2}\/\d{1,2}\/\d{4}/) || cleanLine.match(/^\w+ \d{1,2}, \d{4}/)) {
        // Date
        inHeader = false;
        inDate = true;
        y += 5;
        y = addText(cleanLine, margin, y, 9, 'normal', colors.secondary);
        y += 5;
      } else {
        // Name or title
        const fontSize = cleanLine.length < 30 ? 14 : 11;
        const fontWeight = cleanLine.length < 30 ? 'bold' : 'normal';
        const color = cleanLine.length < 30 ? colors.primary : colors.secondary;
        y = addText(cleanLine, margin, y, fontSize, fontWeight, color);
      }
    }
    // Salutation and body
    else if (cleanLine.toLowerCase().includes('dear') || inBody) {
      inBody = true;
      inHeader = false;
      inDate = false;

      if (cleanLine.toLowerCase().includes('dear')) {
        // Salutation
        y += 3;
        y = addText(cleanLine, margin, y, 10, 'normal', colors.primary);
        y += 5;
      } else if (cleanLine.toLowerCase().includes('sincerely') ||
                 cleanLine.toLowerCase().includes('best regards') ||
                 cleanLine.toLowerCase().includes('yours truly')) {
        // Closing
        y += 5;
        y = addText(cleanLine, margin, y, 10, 'normal', colors.primary);
        y += 10;
      } else {
        // Body paragraphs
        y = addText(cleanLine, margin, y, 9.5, 'normal', colors.secondary);
        y += 4; // Paragraph spacing
      }
    }
  }

  // Generate filename
  const { name, company } = extractNameRoleAndCompany(lines.join(' '));
  const countryCode = country.toLowerCase().replace(/[^a-z]/g, '').replace('international', '');
  const fileName = company
    ? (countryCode ? `${name}_cover_letter_${company}_${countryCode}.pdf` : `${name}_cover_letter_${company}.pdf`)
    : (countryCode ? `${name}_cover_letter_${countryCode}.pdf` : `${name}_cover_letter.pdf`);

  console.log('Saving cover letter PDF as:', fileName);
  pdf.save(fileName);
  return true;
};

export const generateModernPDF = ({ resume, language, country }: ModernPDFOptions) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 15;
    const maxWidth = pageWidth - (margin * 2);
    let y = margin;

    // Detect if this is a cover letter
    const isCoverLetter = resume.toLowerCase().includes('dear hiring manager') ||
                         resume.toLowerCase().includes('sincerely') ||
                         resume.toLowerCase().includes('cover letter') ||
                         resume.includes('Dear ') ||
                         resume.includes('Sincerely,') ||
                         resume.includes('Best regards,');

    // Premium professional color scheme
    const colors = {
      primary: [17, 24, 39],       // Gray-900 (sophisticated dark)
      secondary: [55, 65, 81],     // Gray-700 (professional text)
      accent: [37, 99, 235],       // Blue-600 (corporate blue)
      highlight: [5, 150, 105],    // Emerald-600 (success green)
      light: [107, 114, 128],      // Gray-500 (subtle text)
      background: [249, 250, 251], // Gray-50 (clean background)
      border: [209, 213, 219],     // Gray-300 (subtle borders)
      white: [255, 255, 255]
    };

    // Clean text function
    const cleanText = (text: string): string => {
      if (typeof text !== 'string') return String(text || '');
      return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .trim();
    };

    // Add text with word wrapping and page break handling
    const addText = (text: string, x: number, yPos: number, fontSize: number = 9, fontStyle: string = 'normal', color: number[] = colors.secondary, maxW: number = maxWidth): number => {
      const cleanedText = cleanText(text);
      if (!cleanedText) return yPos;

      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      pdf.setTextColor(color[0], color[1], color[2]);

      const lines = pdf.splitTextToSize(cleanedText, maxW);
      const lineHeight = fontSize * 0.35; // Reduced line height for more content

      let currentY = yPos;

      lines.forEach((line: string, index: number) => {
        // Check if we need a new page
        if (currentY + lineHeight > pageHeight - 20) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.text(line, x, currentY);
        currentY += lineHeight;
      });

      return currentY + 2;
    };

    // Add section header with modern styling and page break handling
    const addSectionHeader = (title: string, yPos: number): number => {
      // Check if we need a new page for the section header
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = margin;
      }

      // Background rectangle
      pdf.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
      pdf.rect(margin - 2, yPos - 5, maxWidth + 4, 10, 'F');

      // Section title
      pdf.setFontSize(11); // Slightly smaller for more content
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.text(title.toUpperCase(), margin, yPos);

      // Underline with professional blue
      pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setLineWidth(1.2);
      pdf.line(margin, yPos + 2, margin + 60, yPos + 2);

      return yPos + 7; // Reduced spacing
    };

    // Parse and render content
    const lines = resume.split('\n').map(line => line.trim()).filter(line => line);

    // Handle cover letters differently
    if (isCoverLetter) {
      return generateCoverLetterPDF(pdf, lines, colors, margin, maxWidth, pageHeight, addText, country);
    }

    let isFirstLine = true;
    let isSecondLine = true;
    let inContactSection = true;

    // Function to add new page if needed
    const checkPageBreak = (requiredSpace: number = 15) => {
      if (y > pageHeight - requiredSpace) {
        pdf.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    for (const line of lines) {
      // Check if we need a new page before adding content
      checkPageBreak();

      const cleanLine = cleanText(line);
      if (!cleanLine) continue;

      // Detect section headers (all caps, longer than 3 chars)
      if (cleanLine.match(/^[A-Z\s&]+$/) && cleanLine.length > 3) {
        inContactSection = false;
        y += 2; // Reduced spacing before section
        y = addSectionHeader(cleanLine, y);
        
      } else if (isFirstLine) {
        // Name - large, bold, primary color
        y = addText(cleanLine, margin, y, 16, 'bold', colors.primary); // Reduced from 18
        y += 1; // Reduced spacing
        isFirstLine = false;

      } else if (isSecondLine && !cleanLine.includes('@') && !cleanLine.includes('+')) {
        // Professional title
        y = addText(cleanLine, margin, y, 11, 'normal', colors.secondary); // Reduced from 12
        y += 2; // Reduced spacing
        isSecondLine = false;
        
      } else if (inContactSection && (cleanLine.includes('@') || cleanLine.includes('+') || cleanLine.includes('linkedin') || cleanLine.includes('github') || cleanLine.includes('http'))) {
        // Enhanced contact info with icons and links
        let icon = '';
        let linkUrl = '';

        if (cleanLine.includes('@')) {
          icon = '✉';
          linkUrl = `mailto:${cleanLine}`;
        } else if (cleanLine.includes('+') || cleanLine.includes('phone') || cleanLine.includes('tel')) {
          icon = '☎';
          // Extract phone number for tel: link
          const phoneMatch = cleanLine.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/);
          if (phoneMatch) {
            linkUrl = `tel:${phoneMatch[0].replace(/[\s\-\(\)]/g, '')}`;
          }
        } else if (cleanLine.toLowerCase().includes('linkedin')) {
          icon = '💼';
          // Extract LinkedIn URL or create one
          if (cleanLine.includes('http')) {
            linkUrl = cleanLine.match(/https?:\/\/[^\s]+/)?.[0] || '';
          } else if (cleanLine.includes('linkedin.com/in/')) {
            linkUrl = `https://${cleanLine}`;
          }
        } else if (cleanLine.toLowerCase().includes('github')) {
          icon = '⚡';
          // Extract GitHub URL or create one
          if (cleanLine.includes('http')) {
            linkUrl = cleanLine.match(/https?:\/\/[^\s]+/)?.[0] || '';
          } else if (cleanLine.includes('github.com/')) {
            linkUrl = `https://${cleanLine}`;
          }
        } else if (cleanLine.includes('http')) {
          icon = '🌐';
          linkUrl = cleanLine.match(/https?:\/\/[^\s]+/)?.[0] || cleanLine;
        }

        // Add icon with highlight color
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.highlight[0], colors.highlight[1], colors.highlight[2]);
        pdf.text(icon, margin, y);

        // Add contact text with link if available
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.light[0], colors.light[1], colors.light[2]);

        if (linkUrl) {
          // Add clickable link
          pdf.textWithLink(cleanLine, margin + 12, y, { url: linkUrl });
        } else {
          pdf.text(cleanLine, margin + 12, y);
        }

        y += 4;
        
      } else if (cleanLine.includes('|')) {
        // Job titles with company
        const parts = cleanLine.split('|').map(p => p.trim());

        // Check for page break before job title
        checkPageBreak(15);

        // Job title - bold
        pdf.setFontSize(10); // Reduced from 11
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        pdf.text(parts[0], margin, y);

        // Company and dates - normal weight, highlight color
        if (parts[1]) {
          const titleWidth = pdf.getTextWidth(parts[0]);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(colors.highlight[0], colors.highlight[1], colors.highlight[2]);
          pdf.text(` | ${parts[1]}`, margin + titleWidth + 2, y);
        }
        y += 4; // Reduced spacing
        
      } else if (cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
        // Bullet points with better icon
        const bulletText = cleanLine.replace(/^[•\-\*]\s*/, '');

        // Check for page break before bullet point
        checkPageBreak(10);

        // Enhanced bullet symbol - using a simple but effective bullet
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        pdf.text('•', margin + 3, y); // Using standard bullet with smaller size and bold

        // Bullet text with smaller font for more content
        y = addText(bulletText, margin + 9, y - 1, 8.5, 'normal', colors.secondary, maxWidth - 9);
        
      } else {
        // Regular text
        checkPageBreak(8);
        y = addText(cleanLine, margin, y, 8.5, 'normal', colors.secondary); // Slightly smaller font
      }
    }

    // No footer - removed as requested

    // Generate filename
    const { name, role, company } = extractNameRoleAndCompany(resume);
    const countryCode = country.toLowerCase().replace(/[^a-z]/g, '').replace('international', '');
    const fileName = company
      ? (countryCode ? `${name}_${role}_${company}_${countryCode}_resume.pdf` : `${name}_${role}_${company}_resume.pdf`)
      : (countryCode ? `${name}_${role}_${countryCode}_resume.pdf` : `${name}_${role}_resume.pdf`);

    console.log('Saving modern PDF as:', fileName);
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Modern PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
};
