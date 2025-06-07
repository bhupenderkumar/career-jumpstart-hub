import React from 'react';

interface ResumeRendererProps {
  content: string;
  className?: string;
}

const ResumeRenderer: React.FC<ResumeRendererProps> = ({ content, className = "" }) => {
  const parseResumeContent = (text: string) => {
    const lines = text.split('\n');
    const sections: Array<{ type: string; content: string; level?: number }> = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Detect section headers (all caps or specific patterns)
      if (trimmedLine.match(/^[A-Z\s&]+$/) && trimmedLine.length > 3) {
        sections.push({ type: 'section-header', content: trimmedLine });
      }
      // Detect subsection headers (Title Case with | separators)
      else if (trimmedLine.match(/^[A-Z][a-zA-Z\s]+\s*\|\s*[A-Z][a-zA-Z\s]+/)) {
        sections.push({ type: 'subsection-header', content: trimmedLine });
      }
      // Detect bullet points
      else if (trimmedLine.match(/^[•·\-\*]\s/)) {
        sections.push({ type: 'bullet', content: trimmedLine.replace(/^[•·\-\*]\s/, '') });
      }
      // Detect contact info (email, phone, etc.)
      else if (trimmedLine.match(/@|phone:|email:|linkedin:|github:/i)) {
        sections.push({ type: 'contact', content: trimmedLine });
      }
      // Regular content
      else {
        sections.push({ type: 'text', content: trimmedLine });
      }
    });
    
    return sections;
  };

  const formatText = (text: string) => {
    // Convert markdown-style formatting to HTML
    return text
      // Bold text **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic text *text* or _text_
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Code or special formatting `text`
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      // Links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      // Email addresses
      .replace(/([\w\.-]+@[\w\.-]+\.\w+)/g, '<a href="mailto:$1" class="text-blue-600 hover:underline">$1</a>')
      // Phone numbers
      .replace(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g, '<a href="tel:$1" class="text-blue-600 hover:underline">$1</a>')
      // URLs
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
  };

  const renderSection = (section: { type: string; content: string }, index: number) => {
    const formattedContent = formatText(section.content);
    
    switch (section.type) {
      case 'section-header':
        return (
          <h2 
            key={index} 
            className="text-xl font-bold text-gray-900 mt-6 mb-3 pb-2 border-b-2 border-blue-600 uppercase tracking-wide"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        );
      
      case 'subsection-header':
        return (
          <h3 
            key={index} 
            className="text-lg font-semibold text-gray-800 mt-4 mb-2"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        );
      
      case 'bullet':
        return (
          <div key={index} className="flex items-start mb-1 ml-4">
            <span className="text-blue-600 mr-2 mt-1">•</span>
            <p 
              className="text-gray-700 text-sm leading-relaxed flex-1"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          </div>
        );
      
      case 'contact':
        return (
          <p 
            key={index} 
            className="text-gray-600 text-sm mb-1"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        );
      
      case 'text':
        // Check if it's a name (first line, likely all caps or title case)
        if (index === 0 && section.content.match(/^[A-Z\s]+$/)) {
          return (
            <h1 
              key={index} 
              className="text-3xl font-bold text-gray-900 mb-2 text-center"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          );
        }
        // Check if it's a title/role (second line, often contains job titles)
        else if (index === 1 && section.content.match(/engineer|developer|manager|analyst|specialist|coordinator|director|consultant/i)) {
          return (
            <p 
              key={index} 
              className="text-lg text-blue-700 font-medium mb-4 text-center"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          );
        }
        // Regular paragraph
        else {
          return (
            <p 
              key={index} 
              className="text-gray-700 text-sm leading-relaxed mb-2"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          );
        }
      
      default:
        return (
          <p 
            key={index} 
            className="text-gray-700 text-sm leading-relaxed mb-2"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        );
    }
  };

  const sections = parseResumeContent(content);

  return (
    <div className={`resume-content ${className}`}>
      <div className="space-y-1">
        {sections.map((section, index) => renderSection(section, index))}
      </div>
      
      <style jsx>{`
        .resume-content {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
        }
        
        .resume-content h1 {
          letter-spacing: 0.05em;
        }
        
        .resume-content h2 {
          position: relative;
        }
        
        .resume-content h2::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 50px;
          height: 2px;
          background: linear-gradient(90deg, #2563eb, #3b82f6);
        }
        
        .resume-content strong {
          font-weight: 600;
          color: #1f2937;
        }
        
        .resume-content em {
          font-style: italic;
          color: #4b5563;
        }
        
        .resume-content a {
          transition: all 0.2s ease;
        }
        
        .resume-content a:hover {
          color: #1d4ed8;
        }
        
        @media print {
          .resume-content {
            font-size: 12px;
            line-height: 1.4;
          }
          
          .resume-content h1 {
            font-size: 24px;
          }
          
          .resume-content h2 {
            font-size: 16px;
            page-break-after: avoid;
          }
          
          .resume-content h3 {
            font-size: 14px;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeRenderer;
