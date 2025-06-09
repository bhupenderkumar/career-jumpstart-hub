// Utility functions for clean printing without browser headers/footers

export interface PrintOptions {
  title: string;
  content: string;
  documentType: 'resume' | 'cover-letter' | 'email';
}

export const createCleanPrintWindow = ({ title, content, documentType }: PrintOptions): void => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    throw new Error('Print window blocked. Please allow popups to enable printing.');
  }

  // Create the complete HTML document with advanced print styling
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          /* Reset and base styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          /* Print-specific styles */
          @media print {
            @page {
              margin: 0.5in;
              size: A4;
              /* Remove browser headers and footers */
              margin-top: 0.5in;
              margin-bottom: 0.5in;
              margin-left: 0.5in;
              margin-right: 0.5in;
            }
            
            body {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Hide any potential browser elements */
            .no-print {
              display: none !important;
            }
          }
          
          /* Screen and print styles */
          body {
            font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.4;
            color: #374151;
            margin: 0;
            padding: 20px;
            background: white;
            font-size: 12px;
          }
          
          .document-container {
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
            min-height: 100vh;
          }
          
          /* Name styling */
          .name {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .name-underline {
            width: 100px;
            height: 3px;
            background: linear-gradient(to right, #2563eb, #7c3aed);
            margin: 0 auto 20px auto;
          }
          
          /* Title styling */
          .title {
            text-align: center;
            font-size: 16px;
            font-weight: 600;
            color: #4b5563;
            background: #f9fafb;
            padding: 8px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: block;
            width: 100%;
            box-sizing: border-box;
          }
          
          /* Contact info styling */
          .contact {
            background: #eff6ff;
            color: #1d4ed8;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin: 2px 4px;
            display: inline-block;
            border: 1px solid #bfdbfe;
          }
          
          /* Section headers */
          .section-header {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
            text-transform: uppercase;
            margin: 24px 0 8px 0;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 4px;
          }
          
          /* Subsection headers */
          .subsection-header {
            font-size: 13px;
            font-weight: bold;
            color: #374151;
            background: #f9fafb;
            padding: 8px 12px;
            border-left: 4px solid #3b82f6;
            margin: 12px 0 8px 0;
            border-radius: 0 4px 4px 0;
          }
          
          /* Bullet points */
          .bullet {
            margin: 4px 0 4px 20px;
            position: relative;
            font-size: 12px;
            line-height: 1.5;
          }
          
          .bullet:before {
            content: '•';
            color: #2563eb;
            font-weight: bold;
            position: absolute;
            left: -12px;
          }
          
          /* Regular text */
          .text {
            font-size: 12px;
            line-height: 1.5;
            margin: 4px 0;
          }
          
          /* Keyword highlighting */
          .keyword-tech {
            background: #dbeafe;
            color: #1e40af;
            padding: 2px 4px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 11px;
          }
          
          .keyword-prof {
            background: #dcfce7;
            color: #166534;
            padding: 2px 4px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 11px;
          }
          
          .keyword-metric {
            background: #fed7aa;
            color: #9a3412;
            padding: 2px 4px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 11px;
          }
          
          /* Cover letter specific styles */
          .cover-letter-date {
            text-align: right;
            margin-bottom: 20px;
            font-size: 12px;
          }
          
          .cover-letter-greeting {
            margin: 20px 0 10px 0;
            font-weight: bold;
          }
          
          .cover-letter-closing {
            margin: 20px 0 10px 0;
          }
          
          .cover-letter-paragraph {
            margin: 8px 0;
            line-height: 1.6;
            text-align: justify;
          }
          
          /* Email specific styles */
          .email-subject {
            font-weight: bold;
            margin: 10px 0;
            padding: 8px;
            background: #f0f0f0;
            border-left: 4px solid #2563eb;
          }
          
          .email-greeting {
            margin: 15px 0 10px 0;
            font-weight: bold;
          }
          
          .email-paragraph {
            margin: 6px 0;
            line-height: 1.5;
          }
          
          /* Page break helpers */
          .page-break {
            page-break-before: always;
          }
          
          .no-page-break {
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="document-container">
          ${content}
        </div>
        
        <script>
          // Auto-print when page loads
          window.onload = function() {
            // Small delay to ensure content is fully rendered
            setTimeout(function() {
              window.focus();
              window.print();
              
              // Optional: Close window after printing
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 500);
          };
          
          // Handle print dialog close
          window.onafterprint = function() {
            window.close();
          };
        </script>
      </body>
    </html>
  `;

  // Write content to the new window
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
};

// Format resume content for printing
export const formatResumeForPrint = (resumeText: string): string => {
  const lines = resumeText.split('\n');
  let html = '';
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // Apply keyword highlighting
    const highlightedLine = highlightKeywordsForPrint(trimmedLine);

    // Detect section headers (all caps or specific patterns)
    if (trimmedLine.match(/^[A-Z\s&]+$/) && trimmedLine.length > 3) {
      html += `<div class="section-header">${highlightedLine}</div>`;
    }
    // Detect subsection headers (Title Case with | separators)
    else if (trimmedLine.match(/^[A-Z][a-zA-Z\s]+\s*\|\s*[A-Z][a-zA-Z\s]+/)) {
      html += `<div class="subsection-header">${highlightedLine}</div>`;
    }
    // Detect bullet points
    else if (trimmedLine.match(/^[•·\-\*]\s/)) {
      const bulletContent = trimmedLine.replace(/^[•·\-\*]\s/, '');
      html += `<div class="bullet">${highlightKeywordsForPrint(bulletContent)}</div>`;
    }
    // Detect contact info
    else if (trimmedLine.match(/@|phone:|email:|linkedin:|github:/i)) {
      html += `<span class="contact">${highlightedLine}</span>`;
    }
    // Check if it's a name (first line, likely all caps or title case)
    else if (index === 0 && trimmedLine.match(/^[A-Z\s]+$/)) {
      html += `<div class="name">${trimmedLine}</div><div class="name-underline"></div>`;
    }
    // Check if it's a title/role (second line, often contains job titles)
    else if (index === 1 && trimmedLine.match(/engineer|developer|manager|analyst|specialist|coordinator|director|consultant/i)) {
      html += `<div class="title">${highlightedLine}</div>`;
    }
    // Regular content
    else {
      html += `<div class="text">${highlightedLine}</div>`;
    }
  });

  return html;
};

// Format other documents for printing
export const formatDocumentForPrint = (content: string, type: 'cover-letter' | 'email'): string => {
  const lines = content.split('\n');
  let html = '';
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      html += '<br>';
      return;
    }

    if (type === 'cover-letter') {
      // Format cover letter with proper spacing and structure
      if (index === 0) {
        html += `<div class="cover-letter-date">${trimmedLine}</div>`;
      } else if (trimmedLine.toLowerCase().includes('dear') || trimmedLine.toLowerCase().includes('to whom')) {
        html += `<div class="cover-letter-greeting">${trimmedLine}</div>`;
      } else if (trimmedLine.toLowerCase().includes('sincerely') || trimmedLine.toLowerCase().includes('regards')) {
        html += `<div class="cover-letter-closing">${trimmedLine}</div>`;
      } else {
        html += `<div class="cover-letter-paragraph">${trimmedLine}</div>`;
      }
    } else {
      // Format email template
      if (trimmedLine.toLowerCase().includes('subject:')) {
        html += `<div class="email-subject">${trimmedLine}</div>`;
      } else if (trimmedLine.toLowerCase().includes('dear') || trimmedLine.toLowerCase().includes('to:')) {
        html += `<div class="email-greeting">${trimmedLine}</div>`;
      } else {
        html += `<div class="email-paragraph">${trimmedLine}</div>`;
      }
    }
  });

  return html;
};

// Highlight keywords for print
export const highlightKeywordsForPrint = (text: string): string => {
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

  let formattedText = text;

  // Highlight technical keywords
  keyTechnologies.forEach(tech => {
    const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    formattedText = formattedText.replace(regex, (match) =>
      `<span class="keyword-tech">${match}</span>`
    );
  });

  // Highlight professional keywords
  professionalKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    formattedText = formattedText.replace(regex, (match) =>
      `<span class="keyword-prof">${match}</span>`
    );
  });

  // Highlight numbers and metrics
  formattedText = formattedText.replace(/\b(\d+(?:\.\d+)?(?:%|\+|k|K|M|years?|months?|\$))\b/g,
    '<span class="keyword-metric">$1</span>'
  );

  return formattedText;
};
