interface HTMLToPDFOptions {
  html: string;
  filename?: string;
  language?: string;
  country?: string;
}

// Extract name and role for filename from HTML
const extractNameAndRoleFromHTML = (html: string): { name: string; role: string } => {
  // Extract text content from HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  const lines = textContent.split('\n').map(line => line.trim()).filter(line => line);
  
  let name = 'resume';
  if (lines.length > 0) {
    name = lines[0]
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
  
  const textLower = textContent.toLowerCase();
  for (const keyword of roleKeywords) {
    if (textLower.includes(keyword)) {
      role = keyword.replace(/\s+/g, '_');
      break;
    }
  }
  
  return { name: name || 'resume', role };
};

export const generatePDFFromHTML = async ({ 
  html, 
  filename, 
  language = 'en', 
  country = 'International' 
}: HTMLToPDFOptions): Promise<void> => {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please allow popups.');
    }

    // Enhanced HTML with print-specific styles
    const printHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resume PDF</title>
    <style>
        @page {
            size: A4;
            margin: 0.5in;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .no-print {
                display: none !important;
            }
        }
        
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
            background: white;
        }
        
        h1 {
            color: #2563eb;
            font-size: 22px;
            margin: 0 0 5px 0;
            font-weight: bold;
        }
        
        h2 {
            color: #1e40af;
            font-size: 13px;
            margin: 12px 0 6px 0;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 2px;
            text-transform: uppercase;
            font-weight: bold;
        }
        
        h3 {
            color: #374151;
            font-size: 11px;
            margin: 8px 0 4px 0;
            font-weight: bold;
        }
        
        .contact {
            font-size: 10px;
            color: #666;
            margin-bottom: 2px;
        }
        
        .job-title {
            font-weight: bold;
            color: #1e40af;
            font-size: 11px;
        }
        
        .company {
            color: #059669;
            font-weight: 500;
        }
        
        .date {
            color: #6b7280;
            font-style: italic;
        }
        
        ul {
            margin: 4px 0;
            padding-left: 16px;
        }
        
        li {
            margin-bottom: 2px;
            font-size: 10px;
            line-height: 1.3;
        }
        
        .tech {
            font-weight: bold;
            color: #2563eb;
        }
        
        .highlight {
            background-color: #fef3c7;
            padding: 1px 2px;
            border-radius: 2px;
        }
        
        .section {
            margin-bottom: 10px;
        }
        
        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 15px;
            font-size: 10px;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .icon {
            color: #059669;
            font-weight: bold;
        }
        
        strong, b {
            color: #1e40af;
            font-weight: bold;
        }
        
        .footer {
            position: fixed;
            bottom: 0.3in;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    ${html}
    <div class="footer">
        AI-Optimized for ${country} | Generated ${new Date().toLocaleDateString()}
    </div>
    
    <script>
        // Auto-print when loaded
        window.onload = function() {
            setTimeout(function() {
                window.print();
                setTimeout(function() {
                    window.close();
                }, 1000);
            }, 500);
        };
    </script>
</body>
</html>`;

    // Write content to print window
    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Focus the print window
    printWindow.focus();

  } catch (error) {
    console.error('HTML to PDF conversion error:', error);
    throw new Error('Failed to generate PDF from HTML');
  }
};

// Alternative method using browser's built-in PDF generation
export const downloadHTMLAsPDF = ({ 
  html, 
  filename, 
  language = 'en', 
  country = 'International' 
}: HTMLToPDFOptions): void => {
  try {
    // Generate filename if not provided
    if (!filename) {
      const { name, role } = extractNameAndRoleFromHTML(html);
      const countryCode = country.toLowerCase().replace(/[^a-z]/g, '').replace('international', '');
      filename = countryCode ? `${name}_${role}_${countryCode}_resume.pdf` : `${name}_${role}_resume.pdf`;
    }

    // Create a blob with the HTML content
    const printHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${filename}</title>
    <style>
        @page { size: A4; margin: 0.5in; }
        body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #333; }
        h1 { color: #2563eb; font-size: 22px; margin: 0 0 5px 0; }
        h2 { color: #1e40af; font-size: 13px; margin: 12px 0 6px 0; border-bottom: 2px solid #3b82f6; padding-bottom: 2px; }
        .contact { font-size: 10px; color: #666; margin-bottom: 2px; }
        .job-title { font-weight: bold; color: #1e40af; }
        .company { color: #059669; }
        ul { margin: 4px 0; padding-left: 16px; }
        li { margin-bottom: 2px; font-size: 10px; }
        .tech { font-weight: bold; color: #2563eb; }
        strong, b { color: #1e40af; font-weight: bold; }
    </style>
</head>
<body>
    ${html}
    <div style="position: fixed; bottom: 0.3in; left: 0; right: 0; text-align: center; font-size: 8px; color: #9ca3af;">
        AI-Optimized for ${country} | Generated ${new Date().toLocaleDateString()}
    </div>
</body>
</html>`;

    const blob = new Blob([printHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace('.pdf', '.html');
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    // Show instructions to user
    alert(`HTML file downloaded as ${link.download}. Please open it in your browser and use Ctrl+P (Cmd+P on Mac) to save as PDF.`);
    
  } catch (error) {
    console.error('HTML download error:', error);
    throw new Error('Failed to download HTML file');
  }
};
