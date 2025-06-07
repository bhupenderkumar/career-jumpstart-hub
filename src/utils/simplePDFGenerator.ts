import jsPDF from 'jspdf';

interface SimplePDFOptions {
  resume: string;
  language: string;
  country: string;
}

// Extract name and role for filename
const extractNameAndRole = (resume: string): { name: string; role: string } => {
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
  
  return { name: name || 'resume', role };
};

export const generateSimplePDF = ({ resume, language, country }: SimplePDFOptions) => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 15;
    const maxWidth = pageWidth - (margin * 2);
    let y = margin;

    // Enhanced colors
    const colors = {
      primary: [41, 98, 255],      // Professional blue
      secondary: [55, 65, 81],     // Dark gray
      accent: [16, 185, 129],      // Green
      highlight: [255, 193, 7],    // Yellow for highlighting
      light: [156, 163, 175],      // Light gray
      success: [34, 197, 94]       // Success green
    };

    // Key technologies to highlight (commonly requested in job descriptions)
    const keyTechnologies = [
      'java', 'spring', 'boot', 'microservices', 'rest', 'api', 'mongodb', 'postgresql',
      'mysql', 'aws', 'docker', 'kubernetes', 'react', 'javascript', 'typescript',
      'python', 'node', 'angular', 'vue', 'git', 'jenkins', 'ci/cd', 'agile', 'scrum'
    ];

    // ATS keywords to bold
    const atsKeywords = [
      'experience', 'years', 'developed', 'implemented', 'managed', 'led', 'built',
      'designed', 'optimized', 'improved', 'achieved', 'delivered', 'collaborated',
      'scalable', 'performance', 'architecture', 'team', 'project', 'solution'
    ];

    // Enhanced text cleaning and highlighting
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
        .trim();
    };

    // Add icon helper (using Unicode symbols)
    const addIcon = (icon: string, x: number, y: number, color: number[] = colors.accent): void => {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.text(icon, x, y);
    };

    // Get contact icon
    const getContactIcon = (text: string): string => {
      if (text.includes('@')) return '✉';
      if (text.includes('+') || text.includes('phone')) return '☎';
      if (text.includes('linkedin')) return '💼';
      if (text.includes('github')) return '⚡';
      if (text.includes('http')) return '🌐';
      return '📍';
    };

    // Highlight key technologies
    const highlightTechnologies = (text: string): { text: string; shouldBold: boolean }[] => {
      const words = text.split(/(\s+|[,;|])/);
      return words.map(word => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        const shouldBold = keyTechnologies.includes(cleanWord);
        return { text: word, shouldBold };
      });
    };

    // Highlight ATS keywords
    const highlightATS = (text: string): { text: string; shouldBold: boolean }[] => {
      const words = text.split(/(\s+)/);
      return words.map(word => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        const shouldBold = atsKeywords.includes(cleanWord);
        return { text: word, shouldBold };
      });
    };

    // Enhanced text helper with highlighting
    const addText = (text: string, x: number, yPos: number, fontSize: number = 10, fontStyle: string = 'normal', color: number[] = colors.secondary): number => {
      const cleanedText = cleanText(text);
      if (!cleanedText) return yPos;

      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      pdf.setTextColor(color[0], color[1], color[2]);

      const lines = pdf.splitTextToSize(cleanedText, maxWidth - 10);
      lines.forEach((line: string, index: number) => {
        if (yPos + (index * 4.5) < pageHeight - 20) {
          pdf.text(line, x, yPos + (index * 4.5));
        }
      });

      return yPos + (lines.length * 4.5) + 2;
    };

    // Add highlighted text (for technologies and ATS keywords)
    const addHighlightedText = (text: string, x: number, yPos: number, fontSize: number = 9, highlightType: 'tech' | 'ats' | 'none' = 'none'): number => {
      const cleanedText = cleanText(text);
      if (!cleanedText) return yPos;

      let segments: { text: string; shouldBold: boolean }[] = [];

      if (highlightType === 'tech') {
        segments = highlightTechnologies(cleanedText);
      } else if (highlightType === 'ats') {
        segments = highlightATS(cleanedText);
      } else {
        segments = [{ text: cleanedText, shouldBold: false }];
      }

      let currentX = x;
      let currentY = yPos;

      segments.forEach(segment => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', segment.shouldBold ? 'bold' : 'normal');
        pdf.setTextColor(
          segment.shouldBold ? colors.primary[0] : colors.secondary[0],
          segment.shouldBold ? colors.primary[1] : colors.secondary[1],
          segment.shouldBold ? colors.primary[2] : colors.secondary[2]
        );

        const textWidth = pdf.getTextWidth(segment.text);

        // Check if text fits on current line
        if (currentX + textWidth > pageWidth - margin) {
          currentY += 4.5;
          currentX = x;
        }

        if (currentY < pageHeight - 20) {
          pdf.text(segment.text, currentX, currentY);
          currentX += textWidth;
        }
      });

      return currentY + 5;
    };

    // Enhanced resume parsing and rendering
    const lines = resume.split('\n').map(line => line.trim()).filter(line => line);
    console.log('Processing resume with', lines.length, 'lines');

    let isFirstLine = true;
    let isSecondLine = true;
    let inContactSection = true;
    let lineIndex = 0;

    for (const line of lines) {
      if (y > pageHeight - 30) break; // Prevent overflow

      const cleanLine = cleanText(line);
      if (!cleanLine) continue;

      // Detect section headers
      if (cleanLine.match(/^[A-Z\s&]+$/) && cleanLine.length > 3) {
        inContactSection = false;

        // Section headers with better styling
        y += 6;

        // Add section background
        pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
        pdf.rect(margin - 2, y - 4, maxWidth + 4, 8, 'F');

        // Section title
        y = addText(cleanLine, margin, y, 11, 'bold', colors.primary);

        // Underline
        pdf.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        pdf.setLineWidth(1.5);
        pdf.line(margin, y + 1, margin + 60, y + 1);
        y += 4;

      } else if (isFirstLine) {
        // Name - better formatting
        y = addText(cleanLine, margin, y, 16, 'bold', colors.primary);
        y += 3;
        isFirstLine = false;

      } else if (isSecondLine && !cleanLine.includes('@') && !cleanLine.includes('+')) {
        // Title/role - better formatting
        y = addText(cleanLine, margin, y, 11, 'normal', colors.secondary);
        y += 4;
        isSecondLine = false;

      } else if (inContactSection && (cleanLine.includes('@') || cleanLine.includes('+') || cleanLine.includes('linkedin') || cleanLine.includes('github') || cleanLine.includes('http'))) {
        // Contact info with icons
        const icon = getContactIcon(cleanLine);
        addIcon(icon, margin, y, colors.accent);
        y = addText(cleanLine, margin + 12, y - 1, 8, 'normal', colors.light);

      } else if (cleanLine.includes('|')) {
        // Job titles with company - enhanced
        const parts = cleanLine.split('|').map(p => p.trim());
        y = addText(parts[0], margin, y, 10, 'bold', colors.secondary);
        if (parts[1]) {
          const titleWidth = pdf.getTextWidth(parts[0]);
          addText(` | ${parts[1]}`, margin + titleWidth + 3, y - 4, 9, 'normal', colors.primary);
        }
        y += 2;

      } else if (cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
        // Enhanced bullet points with ATS highlighting
        const bulletText = cleanLine.replace(/^[•\-\*]\s*/, '');

        // Add bullet
        addIcon('●', margin + 3, y, colors.accent);

        // Add highlighted text
        y = addHighlightedText(bulletText, margin + 10, y - 1, 8, 'ats');

      } else if (cleanLine.toLowerCase().includes('programming') || cleanLine.toLowerCase().includes('technologies') || cleanLine.toLowerCase().includes('languages') || cleanLine.toLowerCase().includes('frameworks')) {
        // Technology sections with highlighting
        y = addHighlightedText(cleanLine, margin, y, 9, 'tech');

      } else {
        // Regular text with ATS highlighting
        y = addHighlightedText(cleanLine, margin, y, 9, 'ats');
      }

      lineIndex++;
    }

    // Footer
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(150, 150, 150);
    const footerText = `AI-Optimized for ${country} | Generated ${new Date().toLocaleDateString()}`;
    const footerWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10);

    // Generate filename
    const { name, role } = extractNameAndRole(resume);
    const countryCode = country.toLowerCase().replace(/[^a-z]/g, '').replace('international', '');
    const fileName = countryCode ? `${name}_${role}_${countryCode}_resume.pdf` : `${name}_${role}_resume.pdf`;

    console.log('Saving PDF as:', fileName);
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Simple PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
};
