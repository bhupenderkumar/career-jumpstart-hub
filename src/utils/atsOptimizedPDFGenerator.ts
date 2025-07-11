import jsPDF from 'jspdf';

export interface ATSPDFOptions {
  content: string;
  type: 'resume' | 'cover-letter' | 'email';
  fileName?: string;
}

interface ParsedSection {
  type: 'name' | 'contact' | 'section-header' | 'subsection-header' | 'bullet' | 'text' | 'skills';
  content: string;
  level?: number;
}

export const generateATSOptimizedPDF = ({ content, type, fileName }: ATSPDFOptions): Blob => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15; // Reduced margin for more content space
  const maxWidth = pageWidth - (margin * 2);
  let y = margin;

  // ATS-friendly colors (minimal colors, high contrast)
  const colors = {
    black: [0, 0, 0],
    darkGray: [51, 51, 51],
    mediumGray: [102, 102, 102],
    blue: [0, 51, 102], // Professional blue for headers
    white: [255, 255, 255]
  };

  // Enhanced ATS keywords
  const technicalKeywords = [
    'java', 'spring', 'boot', 'microservices', 'rest', 'api', 'mongodb', 'postgresql',
    'mysql', 'aws', 'docker', 'kubernetes', 'react', 'javascript', 'typescript',
    'python', 'node.js', 'angular', 'vue', 'git', 'jenkins', 'ci/cd', 'agile', 'scrum',
    'html', 'css', 'sass', 'webpack', 'redux', 'graphql', 'firebase', 'azure',
    'spring boot', 'hibernate', 'maven', 'gradle', 'jvm', 'kotlin', 'scala',
    'machine learning', 'ai', 'data science', 'sql', 'nosql', 'redis', 'elasticsearch'
  ];

  const actionVerbs = [
    'developed', 'implemented', 'managed', 'led', 'built', 'designed', 'optimized',
    'improved', 'achieved', 'delivered', 'collaborated', 'created', 'established',
    'coordinated', 'maintained', 'architected', 'deployed', 'automated', 'streamlined'
  ];

  // Clean text for ATS compatibility
  const cleanText = (text: string): string => {
    if (typeof text !== 'string') return String(text || '');
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove markdown bold
      .replace(/__(.*?)__/g, '$1')      // Remove markdown underline
      .replace(/\*(.*?)\*/g, '$1')      // Remove markdown italic
      .replace(/`(.*?)`/g, '$1')        // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/[•●◦○⚬]/g, '•')         // Normalize bullet points
      .replace(/[-–—]/g, '-')           // Normalize dashes
      .replace(/[^\x00-\x7F]/g, '')     // Remove non-ASCII characters for ATS
      .trim();
  };

  // Parse content with ATS optimization
  const parseContent = (text: string): ParsedSection[] => {
    if (!text) return [];
    
    const lines = text.split('\n');
    const sections: ParsedSection[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Name detection (first non-empty line, usually all caps or title case)
      if (index === 0 || (sections.length === 0 && trimmedLine.match(/^[A-Z][a-zA-Z\s]+$/))) {
        sections.push({ type: 'name', content: trimmedLine });
      }
      // Contact info detection
      else if (trimmedLine.match(/@|phone:|email:|linkedin:|github:|tel:|mobile:/i)) {
        sections.push({ type: 'contact', content: trimmedLine });
      }
      // Section headers (all caps, common resume sections)
      else if (trimmedLine.match(/^(CONTACT|SUMMARY|EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|PROJECTS|ACHIEVEMENTS|OBJECTIVE|PROFILE)[A-Z\s]*$/i)) {
        sections.push({ type: 'section-header', content: trimmedLine.toUpperCase() });
      }
      // Subsection headers (job titles with company/dates)
      else if (trimmedLine.match(/^[A-Z][a-zA-Z\s]+\s*[\|\-]\s*[A-Z][a-zA-Z\s]+/)) {
        sections.push({ type: 'subsection-header', content: trimmedLine });
      }
      // Skills section (comma-separated or bullet points)
      else if (trimmedLine.match(/^(Programming|Languages|Technologies|Tools|Frameworks|Databases):/i) || 
               (sections.some(s => s.content.includes('SKILLS')) && trimmedLine.match(/[,;]/))) {
        sections.push({ type: 'skills', content: trimmedLine });
      }
      // Bullet points
      else if (trimmedLine.match(/^[•·\-\*]\s/)) {
        sections.push({ type: 'bullet', content: trimmedLine.replace(/^[•·\-\*]\s/, '') });
      }
      // Regular text
      else {
        sections.push({ type: 'text', content: trimmedLine });
      }
    });
    
    return sections;
  };

  // Add text with ATS optimization
  const addText = (text: string, x: number, yPos: number, options: any = {}): number => {
    const {
      fontSize = 10,
      fontStyle = 'normal',
      color = colors.black,
      align = 'left',
      maxWidth: textMaxWidth = maxWidth,
      lineHeight = 1.3, // Slightly increased for readability
      bold = false
    } = options;

    const cleanedText = cleanText(text);
    if (!cleanedText) return yPos;

    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', bold ? 'bold' : fontStyle);
    pdf.setTextColor(color[0], color[1], color[2]);

    let finalX = x;
    if (align === 'center') {
      const textWidth = pdf.getTextWidth(cleanedText);
      finalX = (pageWidth - textWidth) / 2;
    }

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

  // Render sections with ATS optimization
  const renderSection = (section: ParsedSection): number => {
    if (y > pageHeight - 40) {
      pdf.addPage();
      y = margin;
    }

    switch (section.type) {
      case 'name':
        y = addText(section.content, margin, y, {
          fontSize: 18,
          fontStyle: 'bold',
          color: colors.black,
          align: 'center',
          bold: true
        });
        y += 10;
        break;

      case 'contact':
        y = addText(section.content, margin, y, {
          fontSize: 10,
          color: colors.darkGray,
          align: 'center'
        });
        y += 5;
        break;

      case 'section-header':
        y += 8;
        y = addText(section.content, margin, y, {
          fontSize: 12,
          fontStyle: 'bold',
          color: colors.blue,
          bold: true
        });
        
        // Simple underline for ATS compatibility
        pdf.setDrawColor(colors.blue[0], colors.blue[1], colors.blue[2]);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y + 2, pageWidth - margin, y + 2);
        y += 10;
        break;

      case 'subsection-header':
        y += 5;
        y = addText(section.content, margin, y, {
          fontSize: 11,
          fontStyle: 'bold',
          color: colors.darkGray,
          bold: true
        });
        y += 8;
        break;

      case 'skills':
        y = addText(section.content, margin, y, {
          fontSize: 10,
          color: colors.black
        });
        y += 6;
        break;

      case 'bullet':
        // Simple bullet for ATS compatibility
        y = addText('• ' + section.content, margin + 10, y, {
          fontSize: 10,
          color: colors.black,
          maxWidth: maxWidth - 10
        });
        y += 5;
        break;

      case 'text':
      default:
        y = addText(section.content, margin, y, {
          fontSize: 10,
          color: colors.black
        });
        y += 6;
        break;
    }

    return y;
  };

  try {
    // Add metadata for ATS systems
    pdf.setProperties({
      title: type === 'resume' ? 'Resume' : type === 'cover-letter' ? 'Cover Letter' : 'Email',
      subject: 'Professional Document',
      author: 'Career Jumpstart Hub',
      creator: 'Career Jumpstart Hub'
    });

    const sections = parseContent(content);
    
    // Render all sections
    sections.forEach((section) => {
      y = renderSection(section);
    });

    return pdf.output('blob');

  } catch (error) {
    console.error('Error generating ATS-optimized PDF:', error);
    throw new Error('Failed to generate ATS-optimized PDF');
  }
};
