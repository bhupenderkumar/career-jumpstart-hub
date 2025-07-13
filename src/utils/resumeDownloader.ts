import jsPDF from 'jspdf';

/**
 * Professional Resume PDF Generator - FULL SIZE DEEDY CV FORMAT
 *
 * This creates a professional, full-size PDF that matches the Deedy CV design
 * with proper A4 formatting, professional typography, and ATS-friendly layout.
 *
 * FEATURES:
 * 1. ✅ Full A4 size professional layout
 * 2. ✅ Proper Deedy CV two-column design
 * 3. ✅ Professional typography and spacing
 * 4. ✅ ATS-friendly formatting
 * 5. ✅ Exact color scheme matching
 * 6. ✅ Clean, readable output
 */

interface ParsedResume {
  name: string;
  title: string;
  contact: string[];
  leftColumn: {
    education: string[];
    skills: string[];
    links: string[];
    coursework: string[];
    additional: string[];
  };
  rightColumn: {
    experience: string[];
    research: string[];
    awards: string[];
    publications: string[];
  };
}

// Check if content is in a non-English language
const isNonEnglishContent = (content: string): boolean => {
  // Check for Japanese characters
  if (content.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) return true;

  // Check for Spanish characters
  if (content.match(/[ñáéíóúü]/i)) return true;

  // Check for French characters
  if (content.match(/[àâäéèêëïîôöùûüÿç]/i)) return true;

  // Check for German characters
  if (content.match(/[äöüß]/i)) return true;

  // Check if it lacks standard English section headers
  const hasEnglishSections = content.match(/\b(EDUCATION|SKILLS|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE)\b/i);
  if (!hasEnglishSections) return true;

  return false;
};

// Parse resume content into structured format
const parseResumeContent = (content: string): ParsedResume => {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);

  const resume: ParsedResume = {
    name: '',
    title: '',
    contact: [],
    leftColumn: { education: [], skills: [], links: [], coursework: [], additional: [] },
    rightColumn: { experience: [], research: [], awards: [], publications: [] }
  };

  let currentSection = '';
  let isHeaderSection = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract name (first meaningful line)
    if (i < 3 && !resume.name && line.length > 2 && line.length < 50) {
      if (!line.match(/^(EDUCATION|SKILLS|EXPERIENCE|WORK|PROFESSIONAL|SUMMARY|OBJECTIVE|CONTACT|EMAIL|PHONE)/i)) {
        resume.name = line;
        continue;
      }
    }

    // Extract title (but skip section headers like "PROFESSIONAL SUMMARY")
    if (i < 5 && !resume.title && line.length > 5 && line.length < 100) {
      // Skip if it's a section header
      if (line.match(/^(EDUCATION|SKILLS|EXPERIENCE|WORK|PROFESSIONAL SUMMARY|SUMMARY|OBJECTIVE|CONTACT|EMAIL|PHONE|LINKS|SOCIAL|COURSEWORK|RESEARCH|AWARDS|PUBLICATIONS|PROJECTS|ADDITIONAL|CERTIFICATIONS)/i)) {
        // This is a section header, not a title - continue parsing
        continue;
      }
      // Check if it looks like a job title
      if (line.match(/engineer|developer|manager|analyst|specialist|coordinator|director|consultant|designer|architect|scientist|researcher|lead|senior|principal|intern|associate|executive|student|graduate|professional/i)) {
        resume.title = line;
        continue;
      }
    }

    // Extract contact info
    if (isHeaderSection && (
      line.match(/@|phone:|email:|linkedin:|github:|location:|tel:|www\.|http|portfolio:|website:/i) ||
      line.match(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/) ||
      line.match(/\.(com|org|net|edu|io|dev)/)
    )) {
      resume.contact.push(line);
      continue;
    }

    // Detect section headers
    const sectionMatch = line.match(/^(EDUCATION|SKILLS|KEY SKILLS|TECHNICAL SKILLS|PROGRAMMING SKILLS|LINKS|SOCIAL|COURSEWORK|COURSE WORK|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|RESEARCH|AWARDS|ACHIEVEMENTS|PUBLICATIONS|PROJECTS|ADDITIONAL|CERTIFICATIONS|SUMMARY|PROFESSIONAL SUMMARY|OBJECTIVE)/i);
    if (sectionMatch) {
      currentSection = sectionMatch[1].toLowerCase().replace(/[^a-z]/g, '');
      isHeaderSection = false;
      console.log('📂 Found section header:', sectionMatch[1]);
      continue;
    }

    // Add content to appropriate sections
    if (currentSection && line) {
      switch (currentSection) {
        case 'education':
          resume.leftColumn.education.push(line);
          break;
        case 'skills':
        case 'keyskills':
        case 'technicalskills':
        case 'programmingskills':
          resume.leftColumn.skills.push(line);
          break;
        case 'links':
        case 'social':
          resume.leftColumn.links.push(line);
          break;
        case 'coursework':
          resume.leftColumn.coursework.push(line);
          break;
        case 'experience':
        case 'workexperience':
        case 'professionalexperience':
          resume.rightColumn.experience.push(line);
          break;
        case 'research':
          resume.rightColumn.research.push(line);
          break;
        case 'awards':
        case 'achievements':
          resume.rightColumn.awards.push(line);
          break;
        case 'publications':
          resume.rightColumn.publications.push(line);
          break;
        case 'projects':
        case 'additional':
        case 'certifications':
          resume.leftColumn.additional.push(line);
          break;
        case 'summary':
        case 'professionalsummary':
        case 'objective':
          resume.rightColumn.experience.unshift(line);
          break;
        default:
          resume.rightColumn.experience.push(line);
      }
    }
  }

  console.log('📊 Final parsed resume:');
  console.log('  - Name:', resume.name || 'Not found');
  console.log('  - Title:', resume.title || 'Not found');
  console.log('  - Contact items:', resume.contact.length);
  console.log('  - Skills:', resume.leftColumn.skills.length);
  console.log('  - Education:', resume.leftColumn.education.length);
  console.log('  - Experience:', resume.rightColumn.experience.length);

  return resume;
};

// Clean text for PDF output
const cleanText = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove markdown bold
    .replace(/__(.*?)__/g, '$1')      // Remove markdown underline
    .replace(/\*(.*?)\*/g, '$1')      // Remove markdown italic
    .replace(/`(.*?)`/g, '$1')        // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/[•●◦○⚬]/g, '•')         // Normalize bullet points
    .trim();
};

// Simple PDF generation for non-English content
const downloadSimpleResumeAsPDF = async (resumeContent: string): Promise<void> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // A4 dimensions
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = margin;
  const lineHeight = 6;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);
  let currentLine = 0;

  // Set font for better Unicode support
  pdf.setFont('helvetica');

  const lines = resumeContent.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      yPosition += lineHeight * 0.5; // Half line for empty lines
      continue;
    }

    // Check if we need a new page
    if (currentLine >= maxLinesPerPage) {
      pdf.addPage();
      yPosition = margin;
      currentLine = 0;
    }

    // Style different types of content
    if (trimmedLine.match(/^[A-Z\s]{3,}$/) ||
        trimmedLine.match(/^(個人情報|職歴要約|技術スキル|職歴|学歴|資格|INFORMACIÓN PERSONAL|RESUMEN PROFESIONAL|COMPETENCIAS TÉCNICAS|EXPERIENCIA LABORAL|FORMACIÓN|IDIOMAS|INFORMATIONS PERSONNELLES|PROFIL PROFESSIONNEL|COMPÉTENCES TECHNIQUES|EXPÉRIENCE PROFESSIONNELLE|FORMATION|LANGUES|PERSÖNLICHE DATEN|BERUFSPROFIL|TECHNISCHE FÄHIGKEITEN|BERUFSERFAHRUNG|AUSBILDUNG|ZERTIFIZIERUNGEN)$/)) {
      // Section headers
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      yPosition += lineHeight;
    } else if (trimmedLine.match(/@|http|linkedin|github|tel:|phone:|email:|\+\d+/i)) {
      // Contact info
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
    } else if (trimmedLine.match(/\||\d{4}/) && trimmedLine.length > 10) {
      // Job titles or positions
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
    } else {
      // Regular content
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
    }

    // Split long lines to fit page width
    const splitLines = pdf.splitTextToSize(trimmedLine, contentWidth);

    for (const splitLine of splitLines) {
      if (currentLine >= maxLinesPerPage) {
        pdf.addPage();
        yPosition = margin;
        currentLine = 0;
      }

      pdf.text(splitLine, margin, yPosition);
      yPosition += lineHeight;
      currentLine++;
    }
  }

  // Download the PDF
  const fileName = `resume_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);

  console.log('✅ Simple PDF generated successfully');
};

// Main PDF generation function - PROFESSIONAL FULL-SIZE OUTPUT
export const downloadResumeAsPDF = async (resumeContent: string): Promise<void> => {
  try {
    console.log('📄 Generating professional full-size PDF...');

    if (!resumeContent || resumeContent.trim().length === 0) {
      throw new Error('Resume content is empty or undefined');
    }

    // Check if content is non-English and use simple layout
    if (isNonEnglishContent(resumeContent)) {
      console.log('🌍 Detected non-English content, using simple layout...');
      return downloadSimpleResumeAsPDF(resumeContent);
    }

    const resume = parseResumeContent(resumeContent);
    console.log('📊 Parsed resume:', resume);

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // A4 dimensions and professional layout
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    const leftColumnWidth = contentWidth * 0.35; // 35% for left column
    const rightColumnWidth = contentWidth * 0.65; // 65% for right column
    const columnGap = 8;
    const leftColumnX = margin;
    const rightColumnX = margin + leftColumnWidth + columnGap;

    // Professional color scheme (Deedy CV)
    const colors = {
      primary: [30, 64, 175],    // Blue-900 (#1e40af)
      secondary: [107, 114, 128], // Gray-500 (#6b7280)
      text: [17, 24, 39],        // Gray-900 (#111827)
      lightText: [75, 85, 99]    // Gray-600 (#4b5563)
    };

    let y = margin + 10;

    // Helper functions for professional formatting
    const addText = (text: string, x: number, yPos: number, maxWidth: number, fontSize: number = 10): number => {
      pdf.setFontSize(fontSize);
      const cleanedText = cleanText(text);
      const lines = pdf.splitTextToSize(cleanedText, maxWidth);

      for (let i = 0; i < lines.length; i++) {
        if (yPos > pageHeight - margin - 15) {
          pdf.addPage();
          yPos = margin + 10;
        }
        pdf.text(lines[i], x, yPos);
        yPos += fontSize * 0.7;
      }

      return yPos + 2;
    };

    const addSectionHeader = (title: string, x: number, yPos: number, width: number): number => {
      if (yPos > pageHeight - margin - 25) {
        pdf.addPage();
        yPos = margin + 10;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.text(title.toUpperCase(), x, yPos);

      // Add professional underline
      pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.setLineWidth(0.5);
      pdf.line(x, yPos + 2, x + width, yPos + 2);

      return yPos + 12;
    };

    const addBulletPoint = (text: string, x: number, yPos: number, maxWidth: number): number => {
      if (yPos > pageHeight - margin - 15) {
        pdf.addPage();
        yPos = margin + 10;
      }

      // Add professional blue bullet point
      pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.circle(x + 2, yPos - 2, 1, 'F');

      // Add text with proper formatting
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

      return addText(text, x + 6, yPos, maxWidth - 6, 10);
    };

    // HEADER SECTION - Professional centered layout
    if (resume.name) {
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      pdf.text(resume.name, pageWidth / 2, y, { align: 'center' });
      y += 12;
    }

    // Only show title if it's not empty and not a section header
    if (resume.title && resume.title.trim() && !resume.title.match(/^(PROFESSIONAL SUMMARY|SUMMARY|OBJECTIVE)$/i)) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.text(resume.title, pageWidth / 2, y, { align: 'center' });
      y += 10;
    }

    // Contact information - professional formatting
    if (resume.contact.length > 0) {
      pdf.setFontSize(10);
      pdf.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
      const contactText = resume.contact.map(cleanText).join(' | ');
      const contactLines = pdf.splitTextToSize(contactText, contentWidth);

      contactLines.forEach((line: string) => {
        pdf.text(line, pageWidth / 2, y, { align: 'center' });
        y += 6;
      });
    }

    // Add professional separator line
    y += 8;
    pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    pdf.setLineWidth(1);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 12;

    // TWO-COLUMN PROFESSIONAL LAYOUT - Fixed positioning
    const startY = y;
    let leftY = startY;
    let rightY = startY;

    // Helper function to add content without page breaks affecting other column
    const addSectionToColumn = (
      sectionName: string,
      items: string[],
      x: number,
      startY: number,
      columnWidth: number
    ): number => {
      if (items.length === 0) return startY;

      let currentY = startY;

      // Add section header
      if (currentY > pageHeight - margin - 25) {
        // If we're too close to bottom, don't add this section
        return currentY;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.text(sectionName.toUpperCase(), x, currentY);

      // Add underline
      pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.setLineWidth(0.5);
      pdf.line(x, currentY + 2, x + columnWidth, currentY + 2);
      currentY += 12;

      // Add items
      items.forEach(item => {
        if (currentY > pageHeight - margin - 15) {
          return; // Skip if too close to bottom
        }

        // Add bullet point
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.circle(x + 2, currentY - 2, 1, 'F');

        // Add text
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

        const cleanedText = cleanText(item);
        const lines = pdf.splitTextToSize(cleanedText, columnWidth - 6);

        for (let i = 0; i < lines.length; i++) {
          if (currentY > pageHeight - margin - 15) break;
          pdf.text(lines[i], x + 6, currentY);
          currentY += 7;
        }
        currentY += 2;
      });

      return currentY + 8; // Section spacing
    };

    // LEFT COLUMN - Process all sections
    const leftSections = [
      { name: 'Education', items: resume.leftColumn.education },
      { name: 'Skills', items: resume.leftColumn.skills },
      { name: 'Links', items: resume.leftColumn.links },
      { name: 'Coursework', items: resume.leftColumn.coursework },
      { name: 'Additional', items: resume.leftColumn.additional }
    ];

    leftSections.forEach(section => {
      leftY = addSectionToColumn(section.name, section.items, leftColumnX, leftY, leftColumnWidth);
    });

    // RIGHT COLUMN - Process all sections (starting from same Y as left column)
    const rightSections = [
      { name: 'Experience', items: resume.rightColumn.experience },
      { name: 'Research', items: resume.rightColumn.research },
      { name: 'Awards', items: resume.rightColumn.awards },
      { name: 'Publications', items: resume.rightColumn.publications }
    ];

    rightSections.forEach(section => {
      rightY = addSectionToColumn(section.name, section.items, rightColumnX, rightY, rightColumnWidth);
    });

    // Generate professional filename and save
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `resume_professional_${timestamp}.pdf`;
    pdf.save(filename);

    console.log('✅ Professional full-size PDF generated successfully:', filename);

  } catch (error) {
    console.error('Error generating professional PDF:', error);
    throw new Error(`Failed to generate professional PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Cover Letter PDF Generator
export const downloadCoverLetterAsPDF = (coverLetterContent: string): void => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    let y = margin;

    // Title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175); // Blue theme
    pdf.text('COVER LETTER', pageWidth / 2, y, { align: 'center' });
    y += 20;

    // Add separator line
    pdf.setDrawColor(107, 114, 128);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 15;

    // Content
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(17, 24, 39);

    const paragraphs = coverLetterContent.split('\n\n');
    paragraphs.forEach(paragraph => {
      if (paragraph.trim() && y < pageHeight - margin - 20) {
        const lines = pdf.splitTextToSize(paragraph.trim(), maxWidth);
        lines.forEach((line: string) => {
          if (y < pageHeight - margin - 20) {
            pdf.text(line, margin, y);
            y += 6;
          }
        });
        y += 8; // Paragraph spacing
      }
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `cover_letter_${timestamp}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating cover letter PDF:', error);
    throw new Error('Failed to generate PDF cover letter');
  }
};

// Email Template PDF Generator
export const downloadEmailAsPDF = (emailContent: string): void => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    let y = margin;

    // Title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175); // Blue theme
    pdf.text('EMAIL TEMPLATE', pageWidth / 2, y, { align: 'center' });
    y += 20;

    // Add separator line
    pdf.setDrawColor(107, 114, 128);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 15;

    // Content
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(17, 24, 39);

    const lines = emailContent.split('\n');
    lines.forEach(line => {
      if (y < pageHeight - margin - 20) {
        if (line.trim()) {
          const wrappedLines = pdf.splitTextToSize(line.trim(), maxWidth);
          wrappedLines.forEach((wrappedLine: string) => {
            if (y < pageHeight - margin - 20) {
              pdf.text(wrappedLine, margin, y);
              y += 6;
            }
          });
        } else {
          y += 8; // Empty line spacing
        }
      }
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `email_template_${timestamp}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generating email PDF:', error);
    throw new Error('Failed to generate PDF email template');
  }
};

// Test function for debugging
export const testPDFGeneration = (): void => {
  const testContent = `BHUPENDER KUMAR
PROFESSIONAL SUMMARY
sharmakbhupender@gmail.com | +91-9717267473 | https://www.linkedin.com/in/bhupik |
https://github.com/bhupenderkumar | https://bhupenderkumar.github.io/about/

EDUCATION
Bachelor of Computer Science |
Uttar Pradesh University, UP
(INDIA)

SKILLS
PROGRAMMING LANGUAGES:
Java (JDK 11, JDK 17), Python,
JavaScript, SQL, PL/SQL

FRAMEWORKS: Spring Boot 2.x,
Spring MVC, Spring Data JPA,
Hibernate, Angular 13+, Bootstrap,
Spring Security, GraphQL

DATABASES: Oracle, MySQL,
MongoDB, Cassandra 4.0.4

MESSAGING: Apache Kafka, IBM

EXPERIENCE
Software Developer | Tech Company | 2020-2023
• Developed web applications using React and Node.js
• Improved application performance by 40%
• Collaborated with cross-functional teams`;

  console.log('🧪 Running professional PDF generation test with fixed two-column layout...');
  downloadResumeAsPDF(testContent);
};