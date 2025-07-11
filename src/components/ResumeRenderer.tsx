import React from 'react';

interface ResumeRendererProps {
  content?: string;
  className?: string;
}



interface ResumeData {
  header: {
    name: string;
    title: string;
    contact: string[];
  };
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

const ResumeRenderer: React.FC<ResumeRendererProps> = ({ content, className = "" }) => {
  // Handle undefined or null content
  if (!content) {
    return (
      <div className={`resume-content ${className}`}>
        <p className="text-gray-500 text-center py-8">No resume content available</p>
      </div>
    );
  }

  const parseResumeToStructure = (text: string): ResumeData => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    const resumeData: ResumeData = {
      header: { name: '', title: '', contact: [] },
      leftColumn: { education: [], skills: [], links: [], coursework: [], additional: [] },
      rightColumn: { experience: [], research: [], awards: [], publications: [] }
    };

    let currentSection = '';
    let isHeaderSection = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect name (usually first line, all caps or title case)
      if (i === 0 && (line.match(/^[A-Z\s]+$/) || line.match(/^[A-Z][a-z\s]+$/))) {
        resumeData.header.name = line;
        continue;
      }

      // Detect title/role (second line, contains job-related keywords)
      if (i === 1 && line.match(/engineer|developer|manager|analyst|specialist|coordinator|director|consultant|designer|architect|scientist|researcher|lead|senior|principal|intern|associate|executive/i)) {
        resumeData.header.title = line;
        continue;
      }

      // Detect contact info (more comprehensive patterns)
      if (isHeaderSection && (
        line.match(/@|phone:|email:|linkedin:|github:|location:|tel:|www\.|http|portfolio:|website:/i) ||
        line.match(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/) ||
        line.match(/^(phone|email|linkedin|github|location|address|website|portfolio):/i) ||
        line.match(/\.(com|org|net|edu|io|dev)/)
      )) {
        resumeData.header.contact.push(line);
        continue;
      }

      // Detect section headers (more comprehensive)
      if (line.match(/^(EDUCATION|SKILLS|KEY SKILLS|TECHNICAL SKILLS|PROGRAMMING SKILLS|LINKS|SOCIAL|COURSEWORK|COURSE WORK|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|RESEARCH|AWARDS|ACHIEVEMENTS|PUBLICATIONS|PROJECTS|ADDITIONAL|CERTIFICATIONS|SUMMARY|PROFESSIONAL SUMMARY|OBJECTIVE)/i)) {
        currentSection = line.toLowerCase().replace(/[^a-z]/g, '');
        isHeaderSection = false;
        continue;
      }

      // Also detect section headers with different formatting (e.g., "## EXPERIENCE")
      const sectionMatch = line.match(/^#+\s*(EDUCATION|SKILLS|KEY SKILLS|TECHNICAL SKILLS|PROGRAMMING SKILLS|LINKS|SOCIAL|COURSEWORK|COURSE WORK|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|RESEARCH|AWARDS|ACHIEVEMENTS|PUBLICATIONS|PROJECTS|ADDITIONAL|CERTIFICATIONS|SUMMARY|PROFESSIONAL SUMMARY|OBJECTIVE)/i);
      if (sectionMatch) {
        currentSection = sectionMatch[1].toLowerCase().replace(/[^a-z]/g, '');
        isHeaderSection = false;
        continue;
      }

      // Add content to appropriate sections
      if (currentSection && line) {
        switch (currentSection) {
          case 'education':
            resumeData.leftColumn.education.push(line);
            break;
          case 'skills':
          case 'keyskills':
          case 'technicalskills':
          case 'programmingskills':
            resumeData.leftColumn.skills.push(line);
            break;
          case 'links':
          case 'social':
            resumeData.leftColumn.links.push(line);
            break;
          case 'coursework':
            resumeData.leftColumn.coursework.push(line);
            break;
          case 'experience':
          case 'workexperience':
          case 'professionalexperience':
            resumeData.rightColumn.experience.push(line);
            break;
          case 'research':
            resumeData.rightColumn.research.push(line);
            break;
          case 'awards':
          case 'achievements':
            resumeData.rightColumn.awards.push(line);
            break;
          case 'publications':
            resumeData.rightColumn.publications.push(line);
            break;
          case 'projects':
          case 'additional':
          case 'certifications':
            resumeData.leftColumn.additional.push(line);
            break;
          case 'summary':
          case 'professionalsummary':
          case 'objective':
            // Add summary to the top of experience section
            resumeData.rightColumn.experience.unshift(line);
            break;
          default:
            // If we don't know where to put it, add to experience (main content)
            resumeData.rightColumn.experience.push(line);
        }
      }
    }

    return resumeData;
  };

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
      // LinkedIn profiles
      // .replace(/(https?:\/\/www\.linkedin\.com\/in\/[^\s]+)/g, '<a href=\"$1\" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium">LinkedIn</a>')
      // URLs
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>');

    return formattedText;
  };



  // Enhanced function to detect and format job experiences with better company highlighting
  const formatExperienceEntry = (text: string): string => {
    let formattedText = formatText(text);

    // Enhanced company name detection patterns
    const companyPatterns = [
      // Pattern: Position | Company Name | Date
      /^(.+?)\s*\|\s*([A-Z][A-Za-z\s&.,'-]+(?:Inc|LLC|Corp|Corporation|Ltd|Limited|Co|Company|Technologies|Tech|Systems|Solutions|Group|Enterprises|Partners|University|College|Institute)?)\s*\|\s*(.+)$/,
      // Pattern: Company Name | Position | Date
      /^([A-Z][A-Za-z\s&.,'-]+(?:Inc|LLC|Corp|Corporation|Ltd|Limited|Co|Company|Technologies|Tech|Systems|Solutions|Group|Enterprises|Partners|University|College|Institute)?)\s*\|\s*(.+?)\s*\|\s*(.+)$/,
      // Pattern: Position at Company Name (Date)
      /^(.+?)\s+at\s+([A-Z][A-Za-z\s&.,'-]+(?:Inc|LLC|Corp|Corporation|Ltd|Limited|Co|Company|Technologies|Tech|Systems|Solutions|Group|Enterprises|Partners|University|College|Institute)?)\s*\((.+?)\)$/,
      // Pattern: Company Name - Position (Date)
      /^([A-Z][A-Za-z\s&.,'-]+(?:Inc|LLC|Corp|Corporation|Ltd|Limited|Co|Company|Technologies|Tech|Systems|Solutions|Group|Enterprises|Partners|University|College|Institute)?)\s*[-–]\s*(.+?)\s*\((.+?)\)$/
    ];

    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) {
        let position: string, company: string, dates: string;

        if (pattern.source.includes('at\\s+')) {
          // Position at Company (Date) format
          [, position, company, dates] = match;
        } else if (pattern.source.startsWith('\\^\\(\\[A\\-Z\\]')) {
          // Company | Position | Date format
          [, company, position, dates] = match;
        } else if (pattern.source.includes('\\-\\–')) {
          // Company - Position (Date) format
          [, company, position, dates] = match;
        } else {
          // Position | Company | Date format (default)
          [, position, company, dates] = match;
        }

        // Create structured experience entry
        return `
          <div class="deedy-experience-entry">
            <div class="deedy-experience-header">
              <div class="deedy-position-company">
                <span class="deedy-position">${formatText(position.trim())}</span>
                <span class="deedy-company-separator">@</span>
                <span class="deedy-company-name">${company.trim()}</span>
              </div>
              <span class="deedy-dates">${formatText(dates.trim())}</span>
            </div>
          </div>
        `;
      }
    }

    // If no pattern matches, apply general company highlighting
    const generalCompanyPattern = /\b([A-Z][A-Za-z\s&.,'-]+(?:Inc|LLC|Corp|Corporation|Ltd|Limited|Co|Company|Technologies|Tech|Systems|Solutions|Group|Enterprises|Partners|University|College|Institute))\b/g;
    formattedText = formattedText.replace(generalCompanyPattern, '<strong class="deedy-company-name">$1</strong>');

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

  // Enhanced skills rendering
  const renderSkillsList = (items: string[]) => {
    return items.map((item, index) => {
      // Check if it's a skill category (contains colon)
      if (item.includes(':')) {
        const [category, skills] = item.split(':');
        return (
          <div key={index} className="deedy-skill-category">
            <h4 className="deedy-skill-category-title">{category.trim()}</h4>
            <div className="deedy-skill-tags">
              {skills.split(/[•,]/).map((skill, skillIndex) => {
                const trimmedSkill = skill.trim();
                if (!trimmedSkill) return null;
                return (
                  <span
                    key={skillIndex}
                    className="deedy-skill-tag"
                    dangerouslySetInnerHTML={{ __html: formatText(trimmedSkill) }}
                  />
                );
              })}
            </div>
          </div>
        );
      }

      // Regular skill item
      return (
        <div
          key={index}
          className="deedy-text-content"
          dangerouslySetInnerHTML={{ __html: formatText(item) }}
        />
      );
    });
  };

  // Render helper functions for different content types
  const renderContentList = (items: string[], type: 'bullet' | 'text' | 'skills' = 'text', isExperience: boolean = false) => {
    if (type === 'skills') {
      return renderSkillsList(items);
    }

    return items.map((item, index) => {
      // Use enhanced formatting for experience entries
      const formattedContent = isExperience ? formatExperienceEntry(item) : formatText(item);

      if (type === 'bullet') {
        return (
          <div key={index} className="deedy-bullet-item group">
            <div className="deedy-bullet-point"></div>
            <div
              className="deedy-bullet-content"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          </div>
        );
      }

      return (
        <div
          key={index}
          className="deedy-text-content"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      );
    });
  };

  const renderSectionHeader = (title: string) => (
    <h3 className="deedy-section-header">
      {title}
    </h3>
  );



  const resumeData = parseResumeToStructure(content);

  return (
    <div className={`deedy-resume ${className}`}>
      {/* Header Section */}
      <div className="deedy-header">
        <div className="text-center">
          <h1 className="deedy-name">
            {resumeData.header.name || 'Your Name'}
          </h1>
          {resumeData.header.title && (
            <h2 className="deedy-title">
              {resumeData.header.title}
            </h2>
          )}
          <div className="deedy-contact">
            {resumeData.header.contact.map((contact, index) => (
              <span
                key={index}
                className="deedy-contact-item"
                dangerouslySetInnerHTML={{ __html: formatText(contact) }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="deedy-columns">
        {/* Left Column */}
        <div className="deedy-left-column">
          {/* Education */}
          {resumeData.leftColumn.education.length > 0 && (
            <div className="deedy-section">
              {renderSectionHeader('Education')}
              <div className="deedy-section-content">
                {renderContentList(resumeData.leftColumn.education)}
              </div>
            </div>
          )}

          {/* Skills */}
          {resumeData.leftColumn.skills.length > 0 && (
            <div className="deedy-section">
              {renderSectionHeader('Skills')}
              <div className="deedy-section-content">
                {renderContentList(resumeData.leftColumn.skills, 'skills')}
              </div>
            </div>
          )}

          {/* Links */}
          {resumeData.leftColumn.links.length > 0 && (
            <div className="deedy-section">
              {renderSectionHeader('Links')}
              <div className="deedy-section-content">
                {renderContentList(resumeData.leftColumn.links)}
              </div>
            </div>
          )}

          {/* Coursework */}
          {resumeData.leftColumn.coursework.length > 0 && (
            <div className="deedy-section">
              {renderSectionHeader('Coursework')}
              <div className="deedy-section-content">
                {renderContentList(resumeData.leftColumn.coursework)}
              </div>
            </div>
          )}

          {/* Additional */}
          {resumeData.leftColumn.additional.length > 0 && (
            <div className="deedy-section">
              {renderSectionHeader('Additional')}
              <div className="deedy-section-content">
                {renderContentList(resumeData.leftColumn.additional)}
              </div>
            </div>
          )}

          {/* Fallback: If left column is empty, show a placeholder */}
          {resumeData.leftColumn.education.length === 0 &&
           resumeData.leftColumn.skills.length === 0 &&
           resumeData.leftColumn.links.length === 0 &&
           resumeData.leftColumn.coursework.length === 0 &&
           resumeData.leftColumn.additional.length === 0 && (
            <div className="deedy-section">
              {renderSectionHeader('Skills')}
              <div className="deedy-section-content">
                <p className="text-gray-500 text-sm italic">Add your skills and qualifications here</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="deedy-right-column">
          {/* Experience */}
          {resumeData.rightColumn.experience.length > 0 && (
            <div className="deedy-section">
              {renderSectionHeader('Experience')}
              <div className="deedy-section-content">
                {renderContentList(resumeData.rightColumn.experience, 'bullet', true)}
              </div>
            </div>
          )}

          {/* Research */}
          {resumeData.rightColumn.research.length > 0 && (
            <div className="deedy-section">
              {renderSectionHeader('Research')}
              <div className="deedy-section-content">
                {renderContentList(resumeData.rightColumn.research, 'bullet')}
              </div>
            </div>
          )}

          {/* Awards */}
          {resumeData.rightColumn.awards.length > 0 && (
            <div className="deedy-section">
              {renderSectionHeader('Awards')}
              <div className="deedy-section-content">
                {renderContentList(resumeData.rightColumn.awards)}
              </div>
            </div>
          )}

          {/* Publications */}
          {resumeData.rightColumn.publications.length > 0 && (
            <div className="deedy-section">
              {renderSectionHeader('Publications')}
              <div className="deedy-section-content">
                {renderContentList(resumeData.rightColumn.publications)}
              </div>
            </div>
          )}

          {/* Fallback: If right column is empty, show a placeholder */}
          {resumeData.rightColumn.experience.length === 0 &&
           resumeData.rightColumn.research.length === 0 &&
           resumeData.rightColumn.awards.length === 0 &&
           resumeData.rightColumn.publications.length === 0 && (
            <div className="deedy-section">
              {renderSectionHeader('Experience')}
              <div className="deedy-section-content">
                <p className="text-gray-500 text-sm italic">Add your work experience and achievements here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeRenderer;
