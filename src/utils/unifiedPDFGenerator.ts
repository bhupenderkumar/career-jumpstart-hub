import jsPDF from 'jspdf';

interface UnifiedPDFOptions {
  document: string;
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
    optimization: string;
  };
}

// Extract name and role from resume for filename
const extractNameAndRole = (document: string): { name: string; role: string } => {
  if (!document) {
    return { name: 'Resume', role: 'professional' };
  }

  const lines = document.split('\n').map(line => line.trim()).filter(line => line);

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

  const resumeText = document.toLowerCase();
  for (const keyword of roleKeywords) {
    if (resumeText.includes(keyword)) {
      role = keyword.replace(/\s+/g, '_');
      break;
    }
  }

  return { name: name || 'resume', role };
};

// Function to append personal projects section if it doesn't exist
const appendPersonalProjects = (resumeText: string): string => {
  // Check if the resume already has a personal projects section
  if (resumeText.includes('PERSONAL PROJECTS') || resumeText.includes('PROJECTS')) {
    return resumeText; // Already has projects section
  }
  
  // Personal projects HTML content provided by the user
  const personalProjectsContent = `
PERSONAL PROJECTS

• Agentia Creator | AI • TypeScript • Java
  Innovative AI-powered content creation platform with Java Spring Boot backend and TypeScript frontend. Features intelligent content generation, user management, and scalable microservices architecture.
  Tech: Java 11, Spring Boot, TypeScript, PostgreSQL, Redis, Docker
  GitHub: https://github.com/bhupenderkumar/agentia-creator

• AI System Design Backend | AI • Backend • TypeScript
  Comprehensive backend system for AI-driven system design tools. Built with modern TypeScript and Java integration, featuring real-time processing, algorithm optimization, and scalable architecture.
  Tech: TypeScript, Java, Spring Boot, Machine Learning APIs, AWS
  GitHub: https://github.com/bhupenderkumar/aisystemdesignbackend

• Building Helper | Construction • Java • Web
  Complete construction management platform helping customers streamline their building projects. Java-based backend with comprehensive project management, cost estimation, and contractor coordination features.
  Tech: Java 8, Spring Boot, MySQL, Angular, REST APIs, Maven
  GitHub: https://github.com/bhupenderkumar/buildinghelper

• CryptoPatch | Crypto • JavaScript • Security
  Advanced cryptocurrency security and patching tool built with JavaScript and Java backend integration. Features vulnerability scanning, security patches, and blockchain transaction monitoring.
  Tech: JavaScript, Java, Spring Security, Blockchain APIs, MongoDB
  GitHub: https://github.com/bhupenderkumar/CryptoPatch

• CryptoPrice Tracker | Fintech • Java • APIs
  Real-time cryptocurrency price tracking application with Java backend. Features live price feeds, portfolio management, alerts system, and comprehensive market analysis tools.
  Tech: Java 11, Spring Boot, External APIs, WebSocket, PostgreSQL
  GitHub: https://github.com/bhupenderkumar/CryptoPrice

• Edu Connect Gateway | Education • TypeScript • Gateway
  Educational platform API gateway built with TypeScript and Java microservices. Provides secure authentication, course management, student tracking, and integrated learning management system.
  Tech: TypeScript, Java, Spring Cloud Gateway, OAuth2, Microservices
  GitHub: https://github.com/bhupenderkumar/edu-connect-gateway
`;

  return resumeText + '\n\n' + personalProjectsContent;
};

// Professional formatting helper functions
export const generateUnifiedPDF = ({ document, language, country, type = 'resume' }: UnifiedPDFOptions): DownloadResult => {
  if (!document || document.trim().length === 0) {
    throw new Error(`${type} content is empty or invalid`);
  }

  // Enhance content based on document type
  let enhancedContent = document;
  if (type === 'resume') {
    enhancedContent = appendPersonalProjects(document);
  }

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 15;
  const maxWidth = pageWidth - (margin * 2);
  let y = margin;

  // Professional color scheme
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
      const isMetric = /\d+(?:\.\d+)?(?:%|\+|k|K|M|years?|months?|\$)/.test(word);

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

  // Add text helper with highlighting and page breaks
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

  try {
    // Parse document content
    const lines = enhancedContent.split('\n').map(line => line.trim()).filter(line => line);

    // Enhanced header section with professional styling
    if (lines.length > 0) {
      // Header background
      pdf.setFillColor(colors.highlight[0], colors.highlight[1], colors.highlight[2]);
      pdf.rect(0, y - 5, pageWidth, 40, 'F');
      pdf.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
      pdf.rect(0, y + 30, pageWidth, 5, 'F');

      // Name (large, bold, primary color)
      const name = cleanText(lines[0]);
      y = addText(name, margin, y + 8, {
        fontSize: type === 'cover-letter' ? 18 : type === 'email' ? 16 : 22,
        fontStyle: 'bold',
        color: colors.primary,
        align: 'left'
      });
      y += 2;

      // Title/Role (if present in second line)
      if (lines[1] && !lines[1].includes('@') && !lines[1].includes('phone') && !lines[1].includes('linkedin')) {
        const title = cleanText(lines[1]);
        y = addText(title, margin, y, {
          fontSize: 12,
          color: colors.secondary,
          fontStyle: 'normal',
          highlight: true // Enable keyword highlighting for job titles
        });
        y += 3;
      }

      // Contact information in a clean layout
      const contactInfo = lines.slice(1).filter(line =>
        line.includes('@') || line.includes('phone') || line.includes('linkedin') ||
        line.includes('github') || line.includes('+') || line.includes('http')
      );

      const contactIcons = {
        gmail: '✉',
        phone: '☎',
        linkedin: '💼',
        github: '🔗'
      };

      if (contactInfo.length > 0) {
        let contactY = y;
        let contactX = margin;
        const contactSpacing = (maxWidth) / Math.min(contactInfo.length, 3);

        contactInfo.slice(0, 3).forEach((contact: string) => {
          const cleanContact = cleanText(contact);
          let icon = '';
          if (cleanContact.includes('@')) {
            icon = contactIcons.gmail;
          } else if (cleanContact.includes('+') || cleanContact.includes('phone')) {
            icon = contactIcons.phone;
          } else if (cleanContact.includes('linkedin')) {
            icon = contactIcons.linkedin;
          } else if (cleanContact.includes('github')) {
            icon = contactIcons.github;
          }
          addText(`${icon} ${cleanContact}`, contactX, contactY, {
            fontSize: 8,
            color: colors.light,
            fontStyle: 'normal'
          });
          contactX += contactSpacing;
        });

        // Additional contacts on next line if needed
        if (contactInfo.length > 3) {
          contactY += 4;
          contactX = margin;
          contactInfo.slice(3).forEach((contact: string) => {
            const cleanContact = cleanText(contact);
            addText(cleanContact, contactX, contactY, {
              fontSize: 8,
              color: colors.light,
              fontStyle: 'normal'
            });
            contactX += contactSpacing;
          });
        }

        y = contactY + 6;
      }

      // Professional separator line
      addLine(margin, y + 2, pageWidth - margin, y + 2, colors.accent, 1.5);
      y += 10;
    }

    // Process remaining content with enhanced formatting
    const contentLines = lines.slice(lines.findIndex(line =>
      line.includes('@') || line.includes('phone') || line.includes('linkedin')
    ) + 1).filter(line => line.trim().length > 0);

    contentLines.forEach(line => {
      // Section headers (all caps)
      if (line.match(/^[A-Z\s&]+$/) && line.length > 3) {
        y += 8;

        // Add section background
        pdf.setFillColor(colors.highlight[0], colors.highlight[1], colors.highlight[2]);
        pdf.rect(0, y - 4, pageWidth, 12, 'F');

        y = addText(line, margin, y + 2, {
          fontSize: 12,
          fontStyle: 'bold',
          color: colors.primary
        });
        y += 3;
        addLine(margin, y, pageWidth - margin, y, colors.accent, 0.8);
        y += 6;
      }
      // Job titles with company (contains |)
      else if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());

        // Job title with highlight background
        const titleText = parts[0];
        const titleWidth = pdf.getTextWidth(titleText);

        // Add highlight background for job titles
        pdf.setFillColor(colors.highlight[0], colors.highlight[1], colors.highlight[2]);
        pdf.rect(margin - 2, y - 6, titleWidth + 4, 8, 'F');

        // Add job title with keyword highlighting
        y = addText(titleText, margin, y, {
          fontSize: 11,
          fontStyle: 'bold',
          color: colors.primary,
          highlight: true
        });

        // Company and dates
        if (parts[1]) {
          const companyY = y - 4;
          addText(`| ${parts[1]}`, margin + pdf.getTextWidth(parts[0]) + 5, companyY, {
            fontSize: 10,
            fontStyle: 'bold',
            color: colors.primary
          });
        }
        y += 4;
      }
      // Bullet points
      else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        // Enhanced bullet points
        const bulletText = line.replace(/^[•\-\*]\s*/, '');

        // Draw filled circle bullet point
        pdf.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        pdf.circle(margin + 4, y - 1.5, 0.8, 'F');

        // Add bullet text with keyword highlighting
        y = addText(bulletText, margin + 8, y - 0.5, {
          fontSize: 10,
          fontStyle: 'normal',
          color: colors.secondary,
          maxWidth: maxWidth - 15,
          lineHeight: 1.3,
          highlight: true // Enable keyword highlighting
        });
        y += 2;
      }
      // Regular content
      else if (line.length > 0) {
        y = addText(line, margin, y, {
          fontSize: 10,
          color: colors.secondary,
          highlight: true // Enable keyword highlighting for all content
        });
        y += 3;
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
  }

  // Extract name and role for filename
  const { name, role } = extractNameAndRole(enhancedContent);

  // Generate filename based on document type
  const timestamp = new Date().toISOString().split('T')[0];
  let fileName: string;

  switch (type) {
    case 'cover-letter':
      fileName = `${name}_cover_letter_${timestamp}.pdf`;
      break;
    case 'email':
      fileName = `${name}_email_template_${timestamp}.pdf`;
      break;
    default:
      fileName = `${name}_${role}_resume_${timestamp}.pdf`;
  }

  pdf.save(fileName);

  return {
    success: true,
    fileName: fileName,
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0',
      optimization: 'Enhanced'
    }
  };
};
