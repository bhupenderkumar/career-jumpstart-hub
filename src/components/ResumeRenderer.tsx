import React from 'react';

interface ResumeRendererProps {
  content?: string;
  className?: string;
}

const ResumeRenderer: React.FC<ResumeRendererProps> = ({ content, className = "" }) => {
  // Handle undefined or null content
  if (!content) {
    return (
      <div className={`resume-content ${className}`}>
        <p className="text-gray-500 text-center py-8">No resume content available</p>
      </div>
    );
  }
  const parseResumeContent = (text: string) => {
    if (!text) return [];

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

  // Key technologies and professional keywords for highlighting
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

  const formatText = (text: string) => {
    let formattedText = text
      // Bold text **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/__(.*?)__/g, '<strong class="font-bold text-gray-900">$1</strong>')
      // Italic text *text* or _text_
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      .replace(/_(.*?)_/g, '<em class="italic text-gray-700">$1</em>')
      // Code or special formatting `text`
      .replace(/`(.*?)`/g, '<code class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">$1</code>')
      // Links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>')
      // Email addresses
      .replace(/([\w\.-]+@[\w\.-]+\.\w+)/g, '<a href="mailto:$1" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>')
      // Phone numbers
      .replace(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g, '<a href="tel:$1" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>')
      // URLs
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>');

    // Highlight key technologies (blue background with bold text)
    keyTechnologies.forEach(tech => {
      const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      formattedText = formattedText.replace(regex, (match) =>
        `<span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-bold mr-1 mb-1">${match}</span>`
      );
    });

    // Highlight professional keywords (green background with bold text)
    professionalKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      formattedText = formattedText.replace(regex, (match) =>
        `<span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-bold mr-1 mb-1">${match}</span>`
      );
    });

    // Highlight numbers and metrics (orange background)
    formattedText = formattedText.replace(/\b(\d+(?:\.\d+)?(?:%|\+|k|K|M|years?|months?|\$))\b/g,
      '<span class="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm font-bold mr-1 mb-1">$1</span>'
    );

    return formattedText;
  };

  const renderSection = (section: { type: string; content: string }, index: number) => {
    const formattedContent = formatText(section.content);

    switch (section.type) {
      case 'section-header':
        return (
          <div key={index} className="mt-8 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {section.content}
              </span>
            </h2>
            <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-full"></div>
          </div>
        );

      case 'subsection-header':
        return (
          <div key={index} className="mt-6 mb-3">
            <h3 className="text-lg font-bold text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border-l-4 border-blue-500">
              <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </h3>
          </div>
        );

      case 'bullet':
        return (
          <div key={index} className="flex items-start mb-2 ml-4 group">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 group-hover:bg-blue-600 transition-colors"></div>
            <p
              className="text-gray-700 text-sm leading-relaxed flex-1 group-hover:text-gray-900 transition-colors"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          </div>
        );

      case 'contact':
        return (
          <div key={index} className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm mb-2 mr-2 border border-blue-200">
            <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
          </div>
        );

      case 'text':
        // Check if it's a name (first line, likely all caps or title case)
        if (index === 0 && section.content.match(/^[A-Z\s]+$/)) {
          return (
            <div key={index} className="text-center mb-6">
              <h1 className="text-4xl font-bold mb-3">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  {section.content}
                </span>
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            </div>
          );
        }
        // Check if it's a title/role (second line, often contains job titles)
        else if (index === 1 && section.content.match(/engineer|developer|manager|analyst|specialist|coordinator|director|consultant/i)) {
          return (
            <div key={index} className="text-center mb-6">
              <p className="text-xl font-semibold text-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-lg border border-blue-200 inline-block shadow-sm">
                <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
              </p>
            </div>
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


    </div>
  );
};

export default ResumeRenderer;
