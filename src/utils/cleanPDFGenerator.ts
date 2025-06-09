import jsPDF from 'jspdf';

export interface CleanPDFOptions {
  content: string;
  type: 'resume' | 'cover-letter' | 'email';
  fileName?: string;
}

interface ParsedSection {
  type: 'name' | 'title' | 'contact' | 'section-header' | 'subsection-header' | 'bullet' | 'text';
  content: string;
  level?: number;
}

export const generateCleanPDF = ({ content, type, fileName }: CleanPDFOptions): Blob => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let y = margin;

  // Colors matching ResumeRenderer exactly
  const colors = {
    // Primary colors
    black: [0, 0, 0],
    darkGray: [55, 65, 81],        // text-gray-700
    mediumGray: [107, 114, 128],   // text-gray-500
    lightGray: [156, 163, 175],    // text-gray-400

    // Brand colors (matching gradient)
    blueStart: [37, 99, 235],      // blue-600
    blueMid: [147, 51, 234],       // purple-600
    blueEnd: [30, 64, 175],        // blue-800

    // Keyword highlighting colors (matching ResumeRenderer)
    techBg: [219, 234, 254],       // bg-blue-100
    techText: [30, 64, 175],       // text-blue-800

    profBg: [220, 252, 231],       // bg-green-100
    profText: [22, 101, 52],       // text-green-800

    metricBg: [254, 215, 170],     // bg-orange-100
    metricText: [154, 52, 18],     // text-orange-800

    // Section styling
    sectionBg: [249, 250, 251],    // bg-gray-50
    sectionBorder: [59, 130, 246], // border-blue-500

    // Contact styling
    contactBg: [239, 246, 255],    // bg-blue-50
    contactText: [29, 78, 216],    // text-blue-700
    contactBorder: [191, 219, 254] // border-blue-200
  };

  // Keywords matching ResumeRenderer exactly
  const keyTechnologies = [
    'java', 'spring', 'boot', 'microservices', 'rest', 'api', 'mongodb', 'postgresql',
    'mysql', 'aws', 'docker', 'kubernetes', 'react', 'javascript', 'typescript',
    'python', 'node', 'angular', 'vue', 'git', 'jenkins', 'ci/cd', 'agile', 'scrum',
    'html', 'css', 'sass', 'webpack', 'redux', 'graphql', 'firebase', 'azure',
    'spring boot', 'hibernate', 'maven', 'gradle', 'jvm', 'kotlin', 'scala'
  ];

  const professionalKeywords = [
    'experience', 'years', 'developed', 'implemented', 'managed', 'led', 'built',
    'designed', 'optimized', 'improved', 'achieved', 'delivered', 'collaborated',
    'scalable', 'performance', 'architecture', 'team', 'project', 'solution',
    'responsible', 'maintained', 'created', 'established', 'coordinated',
    'senior', 'lead', 'principal', 'director', 'manager'
  ];

  // Parse resume content exactly like ResumeRenderer
  const parseResumeContent = (text: string): ParsedSection[] => {
    if (!text) return [];

    const lines = text.split('\n');
    const sections: ParsedSection[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Detect section headers (all caps or specific patterns) - matching ResumeRenderer
      if (trimmedLine.match(/^[A-Z\s&]+$/) && trimmedLine.length > 3) {
        sections.push({ type: 'section-header', content: trimmedLine });
      }
      // Detect subsection headers (Title Case with | separators) - matching ResumeRenderer
      else if (trimmedLine.match(/^[A-Z][a-zA-Z\s]+\s*\|\s*[A-Z][a-zA-Z\s]+/)) {
        sections.push({ type: 'subsection-header', content: trimmedLine });
      }
      // Detect bullet points - matching ResumeRenderer
      else if (trimmedLine.match(/^[•·\-\*]\s/)) {
        sections.push({ type: 'bullet', content: trimmedLine.replace(/^[•·\-\*]\s/, '') });
      }
      // Detect contact info (email, phone, etc.) - matching ResumeRenderer
      else if (trimmedLine.match(/@|phone:|email:|linkedin:|github:/i)) {
        sections.push({ type: 'contact', content: trimmedLine });
      }
      // Check if it's a name (first line, likely all caps or title case) - matching ResumeRenderer
      else if (index === 0 && trimmedLine.match(/^[A-Z\s]+$/)) {
        sections.push({ type: 'name', content: trimmedLine });
      }
      // Check if it's a title/role (second line, often contains job titles) - matching ResumeRenderer
      else if (index === 1 && trimmedLine.match(/engineer|developer|manager|analyst|specialist|coordinator|director|consultant/i)) {
        sections.push({ type: 'title', content: trimmedLine });
      }
      // Regular content
      else {
        sections.push({ type: 'text', content: trimmedLine });
      }
    });

    return sections;
  };

  // Clean text function matching ResumeRenderer
  const cleanText = (text: string): string => {
    if (typeof text !== 'string') {
      return String(text || '');
    }

    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove markdown bold
      .replace(/__(.*?)__/g, '$1')      // Remove markdown underline
      .replace(/\*(.*?)\*/g, '$1')      // Remove markdown italic
      .replace(/`(.*?)`/g, '$1')        // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/[•●◦○⚬]/g, '•')         // Normalize bullet points
      .replace(/[-–—]/g, '-')           // Normalize dashes
      .trim();
  };

  // Keyword detection matching ResumeRenderer exactly
  const detectKeywords = (text: string): { text: string; isKeyword: boolean; type: string }[] => {
    const words = text.split(/(\s+|[,;|().:\-])/);
    return words.map(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9+#]/g, '');
      const originalWord = word.trim();

      // Check technical keywords
      const isTech = keyTechnologies.some(tech =>
        cleanWord.includes(tech.toLowerCase()) || tech.toLowerCase().includes(cleanWord)
      );

      // Check professional keywords
      const isProfessional = professionalKeywords.some(keyword =>
        cleanWord.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(cleanWord)
      );

      // Check metrics (numbers with units)
      const isMetric = /\b(\d+(?:\.\d+)?(?:%|\+|k|K|M|years?|months?|\$))\b/i.test(originalWord);

      return {
        text: word,
        isKeyword: isTech || isProfessional || isMetric,
        type: isTech ? 'technical' : isProfessional ? 'professional' : isMetric ? 'metric' : 'normal'
      };
    });
  };

  // Enhanced text rendering with keyword highlighting
  const addText = (text: string, x: number, yPos: number, options: any = {}): number => {
    const {
      fontSize = 10,
      fontStyle = 'normal',
      color = colors.black,
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

    // Handle keyword highlighting
    if (highlight) {
      const keywords = detectKeywords(cleanedText);
      let currentX = finalX;

      keywords.forEach(({ text, isKeyword, type }) => {
        const wordWidth = pdf.getTextWidth(text);

        if (isKeyword) {
          // Use colors matching ResumeRenderer
          const keywordColor = type === 'technical' ? colors.techText :
                             type === 'professional' ? colors.profText :
                             type === 'metric' ? colors.metricText :
                             colors.black;

          pdf.setTextColor(keywordColor[0], keywordColor[1], keywordColor[2]);
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setTextColor(color[0], color[1], color[2]);
          pdf.setFont('helvetica', fontStyle);
        }

        pdf.text(text, currentX, yPos);
        currentX += wordWidth;
      });

      return yPos + (fontSize * lineHeight);
    }

    // Regular text rendering
    const lines = pdf.splitTextToSize(cleanedText, textMaxWidth);
    const lineSpacing = fontSize * lineHeight;
    let currentY = yPos;

    lines.forEach((line: string) => {
      if (currentY > pageHeight - 30) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.text(line, finalX, currentY);
      currentY += lineSpacing;
    });

    return currentY;
  };

  // Render section exactly like ResumeRenderer
  const renderSection = (section: ParsedSection, index: number): number => {
    // Check for page break
    if (y > pageHeight - 50) {
      pdf.addPage();
      y = margin;
    }

    switch (section.type) {
      case 'name':
        // Name with gradient effect (simulate with bold blue)
        y = addText(section.content, margin, y, {
          fontSize: 24,
          fontStyle: 'bold',
          color: colors.blueStart,
          align: 'center'
        });

        // Add decorative line under name
        pdf.setDrawColor(colors.blueStart[0], colors.blueStart[1], colors.blueStart[2]);
        pdf.setLineWidth(2);
        const nameLineWidth = 80;
        pdf.line((pageWidth - nameLineWidth) / 2, y + 5, (pageWidth + nameLineWidth) / 2, y + 5);
        y += 20;
        break;

      case 'title':
        // Professional title with background effect (simulate with gray background)
        const titleText = section.content;
        const titleWidth = pdf.getTextWidth(titleText);
        const titleX = (pageWidth - titleWidth) / 2;

        // Background rectangle
        pdf.setFillColor(colors.sectionBg[0], colors.sectionBg[1], colors.sectionBg[2]);
        pdf.rect(titleX - 10, y - 8, titleWidth + 20, 16, 'F');

        y = addText(section.content, margin, y, {
          fontSize: 14,
          fontStyle: 'bold',
          color: colors.darkGray,
          align: 'center'
        });
        y += 15;
        break;

      case 'contact':
        // Contact info with blue background
        const contactText = section.content;
        const contactWidth = pdf.getTextWidth(contactText);

        // Background
        pdf.setFillColor(colors.contactBg[0], colors.contactBg[1], colors.contactBg[2]);
        pdf.rect(margin, y - 6, contactWidth + 10, 12, 'F');

        y = addText(section.content, margin + 5, y, {
          fontSize: 9,
          color: colors.contactText,
          highlight: true
        });
        y += 8;
        break;

      case 'section-header':
        // Section header with gradient effect and underline
        y += 15; // Space before section

        y = addText(section.content.toUpperCase(), margin, y, {
          fontSize: 14,
          fontStyle: 'bold',
          color: colors.blueStart
        });

        // Gradient underline (simulate with blue line)
        pdf.setDrawColor(colors.blueStart[0], colors.blueStart[1], colors.blueStart[2]);
        pdf.setLineWidth(2);
        pdf.line(margin, y + 3, pageWidth - margin, y + 3);
        y += 15;
        break;

      case 'subsection-header':
        // Subsection with background and left border
        const subHeaderText = section.content;

        // Background
        pdf.setFillColor(colors.sectionBg[0], colors.sectionBg[1], colors.sectionBg[2]);
        pdf.rect(margin, y - 6, maxWidth, 16, 'F');

        // Left border
        pdf.setFillColor(colors.sectionBorder[0], colors.sectionBorder[1], colors.sectionBorder[2]);
        pdf.rect(margin, y - 6, 3, 16, 'F');

        y = addText(subHeaderText, margin + 8, y, {
          fontSize: 11,
          fontStyle: 'bold',
          color: colors.darkGray,
          highlight: true
        });
        y += 12;
        break;

      case 'bullet':
        // Bullet point with blue dot
        pdf.setFillColor(colors.blueStart[0], colors.blueStart[1], colors.blueStart[2]);
        pdf.circle(margin + 8, y - 2, 1, 'F');

        y = addText(section.content, margin + 15, y, {
          fontSize: 10,
          color: colors.darkGray,
          highlight: true,
          maxWidth: maxWidth - 15
        });
        y += 8;
        break;

      case 'text':
      default:
        // Regular text with keyword highlighting
        y = addText(section.content, margin, y, {
          fontSize: 10,
          color: colors.darkGray,
          highlight: true
        });
        y += 8;
        break;
    }

    return y;
  };

  try {
    // Parse document using ResumeRenderer logic
    const sections = parseResumeContent(content);

    // Render all sections
    sections.forEach((section, index) => {
      y = renderSection(section, index);
    });

    return pdf.output('blob');

  } catch (error) {
    console.error('Error generating clean PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
