import jsPDF from 'jspdf';

/**
 * Simple Single-Page Resume Generator
 * IIT/Stanford style - Clean, minimal, professional
 * - Helvetica font (closest to Calibri in jsPDF)
 * - 12pt base font size
 * - Black text, minimal formatting
 * - Single page optimized layout
 */

interface SimplePDFOptions {
  content: string;
  fileName?: string;
}

interface ParsedSection {
  header: string;
  items: string[];
}

interface ParsedResume {
  name: string;
  contact: string[];
  sections: ParsedSection[];
}

// Clean markdown formatting
const cleanText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
    .replace(/__(.*?)__/g, '$1')      // Underline
    .replace(/\*(.*?)\*/g, '$1')      // Italic
    .replace(/_(.*?)_/g, '$1')        // Italic
    .replace(/`(.*?)`/g, '$1')        // Code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Links
    .replace(/#+\s*/g, '')            // Headers
    .replace(/[•●◦○⚬]/g, '•')         // Normalize bullets
    .trim();
};

// Parse resume content into structured data
const parseResume = (content: string): ParsedResume => {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  const resume: ParsedResume = {
    name: '',
    contact: [],
    sections: []
  };

  // Section headers to detect
  const sectionKeywords = [
    'education', 'experience', 'work experience', 'professional experience',
    'skills', 'technical skills', 'projects', 'certifications', 'awards',
    'publications', 'research', 'summary', 'objective', 'additional',
    'languages', 'interests', 'achievements', 'leadership', 'activities'
  ];

  let currentSection: ParsedSection | null = null;
  let headerFound = false;

  const isSectionHeader = (line: string): boolean => {
    const cleanLine = cleanText(line).toLowerCase();
    return sectionKeywords.some(kw => cleanLine === kw || cleanLine.startsWith(kw + ':'));
  };

  const isContactLine = (line: string): boolean => {
    return !!(
      line.match(/@[\w.-]+\.\w+/) ||
      line.match(/\+?\d[\d\s\-()]{7,}/) ||
      line.match(/linkedin\.com|github\.com/i) ||
      line.match(/^(email|phone|tel|mobile|linkedin|github|website|portfolio|location|address):/i)
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = cleanText(line);

    // First non-empty line is likely the name
    if (!resume.name && !headerFound) {
      resume.name = cleanLine;
      headerFound = true;
      continue;
    }

    // Contact info (before first section)
    if (isContactLine(line) && resume.sections.length === 0) {
      resume.contact.push(cleanLine);
      continue;
    }

    // Section header detection
    if (isSectionHeader(cleanLine) || 
        (cleanLine === cleanLine.toUpperCase() && cleanLine.length > 3 && cleanLine.length < 40)) {
      if (currentSection) {
        resume.sections.push(currentSection);
      }
      currentSection = {
        header: cleanLine.toUpperCase().replace(/[:\-_]/g, '').trim(),
        items: []
      };
      continue;
    }

    // Add content to current section
    if (currentSection) {
      currentSection.items.push(cleanLine);
    } else if (!isContactLine(line) && cleanLine) {
      // Content before first section header - could be title/role
      if (resume.contact.length === 0 || !resume.contact.includes(cleanLine)) {
        resume.contact.push(cleanLine);
      }
    }
  }

  // Push last section
  if (currentSection) {
    resume.sections.push(currentSection);
  }

  return resume;
};

// Generate clean single-page PDF
export const downloadSimpleResume = (content: string, fileName: string = 'resume.pdf'): void => {
  if (!content || content.trim().length === 0) {
    throw new Error('Resume content is empty');
  }

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - (margin * 2);
  
  // Font sizes (Calibri-like, using Helvetica)
  const fontSize = {
    name: 16,
    contact: 10,
    sectionHeader: 11,
    content: 10,
    small: 9
  };

  // Colors - mainly black for Stanford/IIT style
  const colors = {
    black: [0, 0, 0],
    darkGray: [40, 40, 40],
    gray: [80, 80, 80],
    lineColor: [0, 0, 0]
  };

  let y = margin;

  // Helper: Add text
  const addText = (
    text: string, 
    x: number, 
    yPos: number, 
    options: { size?: number; style?: string; color?: number[]; align?: 'left' | 'center' | 'right' } = {}
  ): number => {
    const { size = fontSize.content, style = 'normal', color = colors.black, align = 'left' } = options;
    
    pdf.setFontSize(size);
    pdf.setFont('helvetica', style);
    pdf.setTextColor(color[0], color[1], color[2]);

    let finalX = x;
    if (align === 'center') {
      const textWidth = pdf.getTextWidth(text);
      finalX = (pageWidth - textWidth) / 2;
    } else if (align === 'right') {
      const textWidth = pdf.getTextWidth(text);
      finalX = pageWidth - margin - textWidth;
    }

    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = size * 0.4;

    lines.forEach((line: string, index: number) => {
      if (yPos + (lineHeight * index) > pageHeight - margin) {
        // Avoid overflow - compact instead of new page
        return;
      }
      pdf.text(line, finalX, yPos + (lineHeight * index));
    });

    return yPos + (lines.length * lineHeight);
  };

  // Helper: Add horizontal line
  const addLine = (yPos: number): void => {
    pdf.setDrawColor(colors.lineColor[0], colors.lineColor[1], colors.lineColor[2]);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
  };

  // Parse resume
  const resume = parseResume(content);

  // === HEADER: Name ===
  y = addText(resume.name, margin, y, { size: fontSize.name, style: 'bold', align: 'center' });
  y += 2;

  // === CONTACT INFO ===
  if (resume.contact.length > 0) {
    // Join contact info with separators for single line
    const contactText = resume.contact
      .filter(c => c.length < 60)
      .slice(0, 4)
      .join('  |  ');
    
    if (contactText) {
      y = addText(contactText, margin, y, { size: fontSize.contact, color: colors.darkGray, align: 'center' });
    }
  }
  
  y += 4;
  addLine(y);
  y += 6;

  // === SECTIONS ===
  const availableHeight = pageHeight - margin - y;
  const sectionCount = resume.sections.length;
  const avgSectionHeight = availableHeight / Math.max(sectionCount, 1);

  resume.sections.forEach((section, sectionIndex) => {
    // Check remaining space
    if (y > pageHeight - 20) return;

    // Section header
    y = addText(section.header, margin, y, { size: fontSize.sectionHeader, style: 'bold' });
    addLine(y + 1);
    y += 5;

    // Section items
    let itemsAdded = 0;
    const maxItems = Math.floor(avgSectionHeight / 5); // Estimate items per section

    section.items.forEach((item, itemIndex) => {
      if (y > pageHeight - 15) return; // Leave margin at bottom
      
      // Determine if it's a bullet point or regular text
      const isBullet = item.startsWith('•') || item.startsWith('-') || item.startsWith('*');
      let displayText = item.replace(/^[•\-\*]\s*/, '');

      // For experience/education items - check if it's a title line
      const isTitleLine = item.match(/\|/) || 
                          item.match(/\d{4}/) || 
                          item.match(/(present|current)/i);

      if (isBullet) {
        // Bullet point
        pdf.setFontSize(fontSize.content);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
        
        const bulletX = margin + 3;
        pdf.text('•', bulletX, y);
        
        const lines = pdf.splitTextToSize(displayText, maxWidth - 8);
        const lineHeight = fontSize.content * 0.38;
        
        lines.forEach((line: string, lineIdx: number) => {
          if (y + (lineHeight * lineIdx) > pageHeight - 12) return;
          pdf.text(line, bulletX + 4, y + (lineHeight * lineIdx));
        });
        
        y += lines.length * lineHeight + 1;
      } else if (isTitleLine) {
        // Title/date line (bold)
        y = addText(displayText, margin, y, { size: fontSize.content, style: 'bold', color: colors.black });
        y += 1;
      } else {
        // Regular text
        y = addText(displayText, margin, y, { size: fontSize.content, color: colors.darkGray });
        y += 1;
      }

      itemsAdded++;
    });

    y += 4; // Space between sections
  });

  // Set document properties
  pdf.setProperties({
    title: `${resume.name || 'Resume'} - Professional Resume`,
    subject: 'Professional Resume',
    author: resume.name || 'Candidate',
    creator: 'Simple Resume Generator'
  });

  // Save PDF
  pdf.save(fileName);
  console.log('✅ Simple single-page resume downloaded:', fileName);
};

// Alternative: Generate and return blob
export const generateSimplePDFBlob = (content: string): Blob => {
  if (!content || content.trim().length === 0) {
    throw new Error('Resume content is empty');
  }

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - (margin * 2);
  
  const fontSize = {
    name: 16,
    contact: 10,
    sectionHeader: 11,
    content: 10
  };

  const colors = {
    black: [0, 0, 0],
    darkGray: [40, 40, 40]
  };

  let y = margin;

  const resume = parseResume(content);

  // Name
  pdf.setFontSize(fontSize.name);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  const nameWidth = pdf.getTextWidth(resume.name);
  pdf.text(resume.name, (pageWidth - nameWidth) / 2, y);
  y += 6;

  // Contact
  if (resume.contact.length > 0) {
    const contactText = resume.contact.slice(0, 4).join('  |  ');
    pdf.setFontSize(fontSize.contact);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
    const contactWidth = pdf.getTextWidth(contactText);
    pdf.text(contactText, (pageWidth - contactWidth) / 2, y);
    y += 5;
  }

  // Line
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Sections
  resume.sections.forEach((section) => {
    if (y > pageHeight - 20) return;

    // Header
    pdf.setFontSize(fontSize.sectionHeader);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(section.header, margin, y);
    y += 1;
    pdf.line(margin, y + 1, pageWidth - margin, y + 1);
    y += 5;

    // Items
    section.items.forEach((item) => {
      if (y > pageHeight - 15) return;
      
      const isBullet = item.startsWith('•') || item.startsWith('-');
      const text = item.replace(/^[•\-\*]\s*/, '');

      pdf.setFontSize(fontSize.content);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);

      if (isBullet) {
        pdf.text('•', margin + 3, y);
        const lines = pdf.splitTextToSize(text, maxWidth - 10);
        lines.forEach((line: string, idx: number) => {
          if (y + (idx * 4) < pageHeight - 10) {
            pdf.text(line, margin + 7, y + (idx * 4));
          }
        });
        y += lines.length * 4 + 1;
      } else {
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line: string, idx: number) => {
          if (y + (idx * 4) < pageHeight - 10) {
            pdf.text(line, margin, y + (idx * 4));
          }
        });
        y += lines.length * 4 + 1;
      }
    });

    y += 3;
  });

  return pdf.output('blob');
};

export default downloadSimpleResume;
