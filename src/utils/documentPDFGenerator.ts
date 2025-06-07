import jsPDF from 'jspdf';

interface DocumentPDFOptions {
  content: string;
  type: 'cover-letter' | 'email';
  language: string;
  country: string;
  jobTitle?: string;
  company?: string;
}

// Clean text helper
const cleanText = (text: string): string => {
  return text
    .replace(/\*\*/g, '') // Remove markdown bold
    .replace(/\*/g, '') // Remove markdown italic
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .replace(/\s+/g, ' '); // Normalize spaces
};

// Extract name from content
const extractName = (content: string): string => {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  if (lines.length > 0) {
    const firstLine = cleanText(lines[0]);
    // If first line looks like a name (no @ symbols, not too long)
    if (!firstLine.includes('@') && !firstLine.includes('http') && firstLine.length < 50) {
      return firstLine.split(' ').slice(0, 2).join('_').toLowerCase();
    }
  }
  return 'document';
};

export const generateDocumentPDF = ({ content, type, language, country, jobTitle, company }: DocumentPDFOptions) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let y = margin;

    // Professional colors
    const colors = {
      primary: [41, 98, 255],      // Professional blue
      secondary: [55, 65, 81],     // Dark gray
      accent: [16, 185, 129],      // Green
      light: [156, 163, 175],      // Light gray
      background: [249, 250, 251]  // Very light gray
    };

    // Add text with page break handling
    const addText = (text: string, x: number, yPos: number, fontSize: number = 10, fontStyle: string = 'normal', color: number[] = colors.secondary): number => {
      const cleanedText = cleanText(text);
      if (!cleanedText) return yPos;

      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      pdf.setTextColor(color[0], color[1], color[2]);

      const lines = pdf.splitTextToSize(cleanedText, maxWidth);
      let currentY = yPos;

      lines.forEach((line: string) => {
        // Check if we need a new page
        if (currentY > pageHeight - 25) {
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.text(line, x, currentY);
        currentY += fontSize * 0.4; // Line spacing
      });

      return currentY + 3; // Add some space after text block
    };

    // Header based on document type
    if (type === 'cover-letter') {
      // Cover letter header
      pdf.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      y = addText('COVER LETTER', margin, y + 10, 16, 'bold', colors.primary);
      
      if (jobTitle && company) {
        y = addText(`${jobTitle} at ${company}`, margin, y, 12, 'normal', colors.secondary);
      }
      
      // Add separator line
      pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setLineWidth(1);
      pdf.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 8;
      
    } else if (type === 'email') {
      // Email header
      pdf.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      y = addText('APPLICATION EMAIL', margin, y + 10, 16, 'bold', colors.primary);
      
      if (jobTitle && company) {
        y = addText(`${jobTitle} at ${company}`, margin, y, 12, 'normal', colors.secondary);
      }
      
      // Add separator line
      pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      pdf.setLineWidth(1);
      pdf.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 8;
    }

    // Process content
    const lines = content.split('\n').map(line => line.trim());
    let inHeader = true;
    let isFirstParagraph = true;

    for (const line of lines) {
      if (!line) {
        y += 3; // Small gap for empty lines
        continue;
      }

      // Check if we need a new page
      if (y > pageHeight - 30) {
        pdf.addPage();
        y = margin;
      }

      // Detect different parts of the document
      if (line.toLowerCase().includes('subject:')) {
        // Email subject line
        y = addText(line, margin, y, 11, 'bold', colors.primary);
        y += 2;
      } else if (line.toLowerCase().startsWith('dear ') || line.toLowerCase().includes('hiring manager')) {
        // Salutation
        inHeader = false;
        y = addText(line, margin, y, 10, 'normal', colors.secondary);
        y += 3;
      } else if (line.toLowerCase().includes('sincerely') || line.toLowerCase().includes('best regards') || line.toLowerCase().includes('yours truly')) {
        // Closing
        y += 3; // Extra space before closing
        y = addText(line, margin, y, 10, 'normal', colors.secondary);
      } else if (inHeader && (line.includes('@') || line.includes('phone') || line.includes('+'))) {
        // Contact information in header
        y = addText(line, margin, y, 9, 'normal', colors.light);
      } else if (inHeader && !line.includes('@') && !line.includes('http')) {
        // Name or title in header
        y = addText(line, margin, y, 12, 'bold', colors.primary);
      } else {
        // Regular paragraph text
        if (isFirstParagraph) {
          isFirstParagraph = false;
        } else {
          y += 2; // Paragraph spacing
        }
        y = addText(line, margin, y, 10, 'normal', colors.secondary);
      }
    }

    // Remove footer for cleaner professional look

    // Generate filename
    const name = extractName(content);
    const docType = type === 'cover-letter' ? 'cover_letter' : 'email';
    const companyPart = company ? `_${company.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    const fileName = `${name}_${docType}${companyPart}.pdf`;

    pdf.save(fileName);
    return true;

  } catch (error) {
    console.error('Document PDF generation error:', error);
    throw new Error(`Failed to generate ${type} PDF`);
  }
};
