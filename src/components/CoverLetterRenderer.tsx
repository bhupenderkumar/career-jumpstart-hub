import React from 'react';

interface CoverLetterRendererProps {
  content?: string;
  className?: string;
}

interface CoverLetterData {
  header: {
    name: string;
    address: string[];
    contact: string[];
    date: string;
  };
  recipient: {
    name: string;
    title: string;
    company: string;
    address: string[];
  };
  body: {
    salutation: string;
    paragraphs: string[];
    closing: string;
    signature: string;
  };
}

const CoverLetterRenderer: React.FC<CoverLetterRendererProps> = ({ content, className = "" }) => {
  // Handle undefined or null content
  if (!content) {
    return (
      <div className={`cover-letter-content ${className}`}>
        <p className="text-gray-500 text-center py-8">No cover letter content available</p>
      </div>
    );
  }

  // Check if content is in a non-English language or doesn't match expected patterns
  const isNonEnglishOrUnstructured = (text: string): boolean => {
    // Check for Japanese characters
    if (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) return true;

    // Check for Spanish characters
    if (text.match(/[ñáéíóúü]/i)) return true;

    // Check for French characters
    if (text.match(/[àâäéèêëïîôöùûüÿç]/i)) return true;

    // Check for German characters
    if (text.match(/[äöüß]/i)) return true;

    // Check if it lacks standard English cover letter patterns
    const hasEnglishPatterns = text.match(/\b(dear|sincerely|regards|yours|hiring manager|position|application)\b/i);
    if (!hasEnglishPatterns) return true;

    return false;
  };

  // If content is non-English or unstructured, display it as-is with basic formatting
  if (isNonEnglishOrUnstructured(content)) {
    return (
      <div className={`cover-letter-content ${className} max-w-4xl mx-auto bg-white p-8 shadow-lg`}>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {content.split('\n').map((line, index) => {
            const trimmedLine = line.trim();

            // Style different types of lines
            if (!trimmedLine) {
              return <br key={index} />;
            }

            // Date (usually at the top)
            if (trimmedLine.match(/^\d{4}年\d{1,2}月\d{1,2}日$|^\d{1,2}\/\d{1,2}\/\d{4}$|^\d{4}-\d{2}-\d{2}$/)) {
              return (
                <div key={index} className="text-right mb-4 text-gray-600">
                  {trimmedLine}
                </div>
              );
            }

            // Salutation (Dear, 拝啓, etc.)
            if (trimmedLine.match(/^(dear|拝啓|estimado|cher|lieber)/i)) {
              return (
                <div key={index} className="mb-4 font-medium">
                  {trimmedLine}
                </div>
              );
            }

            // Closing (Sincerely, 敬具, etc.)
            if (trimmedLine.match(/^(sincerely|regards|敬具|atentamente|cordialement|mit freundlichen grüßen)/i)) {
              return (
                <div key={index} className="mt-6 mb-2 font-medium">
                  {trimmedLine}
                </div>
              );
            }

            // Contact info (emails, phones, URLs)
            if (trimmedLine.match(/@|http|linkedin|github|tel:|phone:|email:|\+\d+/i)) {
              return (
                <div key={index} className="text-blue-600 mb-1">
                  {trimmedLine}
                </div>
              );
            }

            // Regular paragraphs
            return (
              <div key={index} className="mb-3 text-justify">
                {trimmedLine}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Key technologies and professional keywords for highlighting
  const keyTechnologies = [
    'java', 'spring', 'boot', 'microservices', 'rest', 'api', 'mongodb', 'postgresql',
    'mysql', 'aws', 'docker', 'kubernetes', 'react', 'javascript', 'typescript',
    'python', 'node', 'angular', 'vue', 'git', 'jenkins', 'ci/cd', 'agile', 'scrum',
    'html', 'css', 'sass', 'webpack', 'redux', 'graphql', 'firebase', 'azure',
    'spring boot', 'hibernate', 'maven', 'gradle', 'jvm', 'kotlin', 'scala',
    'c++', 'c#', '.net', 'php', 'ruby', 'go', 'rust', 'swift', 'flutter', 'dart',
    'tensorflow', 'pytorch', 'machine learning', 'ai', 'data science', 'sql'
  ];

  const professionalKeywords = [
    'experience', 'years', 'developed', 'implemented', 'managed', 'led', 'built',
    'designed', 'optimized', 'improved', 'achieved', 'delivered', 'collaborated',
    'scalable', 'performance', 'architecture', 'team', 'project', 'solution',
    'responsible', 'maintained', 'created', 'established', 'coordinated',
    'senior', 'lead', 'principal', 'director', 'manager', 'increased', 'reduced',
    'streamlined', 'enhanced', 'automated', 'integrated', 'deployed'
  ];

  const parseCoverLetterToStructure = (text: string): CoverLetterData => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    const coverLetterData: CoverLetterData = {
      header: { name: '', address: [], contact: [], date: '' },
      recipient: { name: '', title: '', company: '', address: [] },
      body: { salutation: '', paragraphs: [], closing: '', signature: '' }
    };

    let currentSection = 'header';
    let isInBody = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect name (usually first line)
      if (i === 0 && !line.match(/^\d/) && !line.match(/@|phone:|email:/i)) {
        coverLetterData.header.name = line;
        continue;
      }
      
      // Detect date
      if (line.match(/^\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|January|February|March|April|May|June|July|August|September|October|November|December/i)) {
        coverLetterData.header.date = line;
        continue;
      }
      
      // Detect contact info
      if (line.match(/@|phone:|email:|linkedin:|github:|location:|tel:|www\.|http|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/i)) {
        coverLetterData.header.contact.push(line);
        continue;
      }
      
      // Detect address (lines with street numbers, city, state, zip)
      if (line.match(/^\d+\s|street|avenue|road|drive|lane|blvd|ave|st\.|city|state|\d{5}/i) && !isInBody) {
        if (currentSection === 'header') {
          coverLetterData.header.address.push(line);
        } else if (currentSection === 'recipient') {
          coverLetterData.recipient.address.push(line);
        }
        continue;
      }
      
      // Detect recipient section (Dear, To, Hiring Manager, etc.)
      if (line.match(/^(dear|to|hiring manager|recruiter|hr|human resources)/i)) {
        currentSection = 'recipient';
        isInBody = true;
        coverLetterData.body.salutation = line;
        continue;
      }
      
      // Detect company/recipient info
      if (!isInBody && line.match(/^[A-Z][a-zA-Z\s&.,'-]+(?:Inc|LLC|Corp|Corporation|Ltd|Limited|Co|Company|Technologies|Tech|Systems|Solutions|Group|Enterprises|Partners|University|College|Institute)$/)) {
        coverLetterData.recipient.company = line;
        currentSection = 'recipient';
        continue;
      }
      
      // Detect closing (Sincerely, Best regards, etc.)
      if (line.match(/^(sincerely|best regards|regards|thank you|yours truly|respectfully)/i)) {
        coverLetterData.body.closing = line;
        continue;
      }
      
      // Detect signature (usually last line with a name)
      if (i === lines.length - 1 && line.match(/^[A-Z][a-zA-Z\s]+$/)) {
        coverLetterData.body.signature = line;
        continue;
      }
      
      // Body paragraphs
      if (isInBody && line && !line.match(/^(sincerely|best regards|regards|thank you|yours truly|respectfully)/i)) {
        coverLetterData.body.paragraphs.push(line);
      }
    }
    
    return coverLetterData;
  };

  const formatText = (text: string) => {
    let formattedText = text
      // Bold text **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/__(.*?)__/g, '<strong class="font-bold text-gray-900">$1</strong>')
      // Italic text *text* or _text_
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      .replace(/_(.*?)_/g, '<em class="italic text-gray-700">$1</em>')
      // Email addresses
      .replace(/([\w\.-]+@[\w\.-]+\.\w+)/g, '<a href="mailto:$1" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>')
      // Phone numbers
      .replace(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g, '<a href="tel:$1" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>')
      // URLs
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>');

    // Bold company names (common patterns)
    const companyPatterns = [
      /\b([A-Z][A-Za-z\s&.,]+(?:Inc|LLC|Corp|Corporation|Ltd|Limited|Co|Company|Technologies|Tech|Systems|Solutions|Group|Enterprises|Partners|University|College|Institute))\b/g
    ];

    companyPatterns.forEach(pattern => {
      formattedText = formattedText.replace(pattern, '<strong class="deedy-company-name">$1</strong>');
    });

    // Highlight key technologies
    keyTechnologies.forEach(tech => {
      const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      formattedText = formattedText.replace(regex, (match) =>
        `<span class="deedy-tech-highlight">${match}</span>`
      );
    });

    // Highlight professional keywords
    professionalKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      formattedText = formattedText.replace(regex, (match) =>
        `<span class="deedy-keyword-highlight">${match}</span>`
      );
    });

    // Highlight numbers and metrics
    formattedText = formattedText.replace(/\b(\d+(?:\.\d+)?(?:%|\+|k|K|M|years?|months?|\$))\b/g,
      '<span class="deedy-metric-highlight">$1</span>'
    );

    return formattedText;
  };

  const coverLetterData = parseCoverLetterToStructure(content);

  return (
    <div className={`deedy-cover-letter ${className}`}>
      {/* Header Section */}
      <div className="deedy-cl-header">
        <div className="deedy-cl-sender">
          <h1 className="deedy-cl-name">
            {coverLetterData.header.name || 'Your Name'}
          </h1>
          {coverLetterData.header.address.map((addr, index) => (
            <p key={index} className="deedy-cl-address">{addr}</p>
          ))}
          <div className="deedy-cl-contact">
            {coverLetterData.header.contact.map((contact, index) => (
              <span
                key={index}
                className="deedy-cl-contact-item"
                dangerouslySetInnerHTML={{ __html: formatText(contact) }}
              />
            ))}
          </div>
        </div>
        
        {coverLetterData.header.date && (
          <div className="deedy-cl-date">
            {coverLetterData.header.date}
          </div>
        )}
      </div>

      {/* Recipient Section */}
      {(coverLetterData.recipient.company || coverLetterData.recipient.name) && (
        <div className="deedy-cl-recipient">
          {coverLetterData.recipient.name && (
            <p className="deedy-cl-recipient-name">{coverLetterData.recipient.name}</p>
          )}
          {coverLetterData.recipient.title && (
            <p className="deedy-cl-recipient-title">{coverLetterData.recipient.title}</p>
          )}
          {coverLetterData.recipient.company && (
            <p className="deedy-cl-recipient-company">
              <span dangerouslySetInnerHTML={{ __html: formatText(coverLetterData.recipient.company) }} />
            </p>
          )}
          {coverLetterData.recipient.address.map((addr, index) => (
            <p key={index} className="deedy-cl-recipient-address">{addr}</p>
          ))}
        </div>
      )}

      {/* Body Section */}
      <div className="deedy-cl-body">
        {/* Salutation */}
        {coverLetterData.body.salutation && (
          <p className="deedy-cl-salutation">
            <span dangerouslySetInnerHTML={{ __html: formatText(coverLetterData.body.salutation) }} />
          </p>
        )}

        {/* Body Paragraphs */}
        <div className="deedy-cl-content">
          {coverLetterData.body.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="deedy-cl-paragraph"
              dangerouslySetInnerHTML={{ __html: formatText(paragraph) }}
            />
          ))}
        </div>

        {/* Closing */}
        {coverLetterData.body.closing && (
          <p className="deedy-cl-closing">
            <span dangerouslySetInnerHTML={{ __html: formatText(coverLetterData.body.closing) }} />
          </p>
        )}

        {/* Signature */}
        {coverLetterData.body.signature && (
          <p className="deedy-cl-signature">
            {coverLetterData.body.signature}
          </p>
        )}
      </div>
    </div>
  );
};

export default CoverLetterRenderer;
