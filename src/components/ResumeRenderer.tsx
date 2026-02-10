import React, { useMemo } from 'react';
import { calculateATSScore, type ATSScore } from '@/utils/atsResumeGenerator';

interface ResumeRendererProps {
  content?: string;
  className?: string;
  showATSScore?: boolean;
}

interface ParsedSection {
  type: 'summary' | 'skills' | 'experience' | 'education' | 'certifications' | 'projects' | 'additional';
  title: string;
  content: string[];
}

interface ParsedResume {
  name: string;
  title: string;
  contact: string[];
  sections: ParsedSection[];
}

// Clean markdown and special characters
const cleanText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#+\s*/g, '')
    .trim();
};

// Check if content is non-English
const isNonEnglish = (text: string): boolean => {
  // Japanese
  if (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) return true;
  // Other non-ASCII heavy content
  const nonAsciiRatio = (text.match(/[^\x00-\x7F]/g) || []).length / text.length;
  return nonAsciiRatio > 0.3;
};

// Parse resume content into structured data
const parseResume = (content: string): ParsedResume => {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  const resume: ParsedResume = {
    name: '',
    title: '',
    contact: [],
    sections: []
  };

  type SectionType = ParsedSection['type'];
  
  const sectionKeywords: { [key: string]: SectionType } = {
    'summary': 'summary',
    'professional summary': 'summary',
    'profile': 'summary',
    'objective': 'summary',
    'about': 'summary',
    'skills': 'skills',
    'technical skills': 'skills',
    'key skills': 'skills',
    'core competencies': 'skills',
    'technologies': 'skills',
    'experience': 'experience',
    'work experience': 'experience',
    'professional experience': 'experience',
    'employment': 'experience',
    'employment history': 'experience',
    'education': 'education',
    'academic': 'education',
    'academic background': 'education',
    'certifications': 'certifications',
    'certificates': 'certifications',
    'licenses': 'certifications',
    'projects': 'projects',
    'key projects': 'projects',
    'personal projects': 'projects',
    'additional': 'additional',
    'interests': 'additional',
    'languages': 'additional',
    'awards': 'additional',
    'achievements': 'additional',
    'publications': 'additional',
    'research': 'additional'
  };

  // Non-English section headers
  const nonEnglishSections: { [key: string]: SectionType } = {
    // Japanese
    '職歴': 'experience', '経歴': 'experience', '職歴要約': 'summary',
    'スキル': 'skills', '技術スキル': 'skills',
    '学歴': 'education', '資格': 'certifications',
    // Spanish
    'experiencia': 'experience', 'experiencia laboral': 'experience',
    'habilidades': 'skills', 'competencias': 'skills',
    'educación': 'education', 'formación': 'education',
    // French
    'expérience': 'experience', 'expérience professionnelle': 'experience',
    'compétences': 'skills', 'formation': 'education',
    // German
    'berufserfahrung': 'experience', 'fähigkeiten': 'skills',
    'ausbildung': 'education', 'zertifizierungen': 'certifications'
  };

  let currentSection: ParsedSection | null = null;
  let inHeader = true;

  const isContactLine = (line: string): boolean => {
    return !!(
      line.match(/@[\w.-]+\.\w+/) ||
      line.match(/\+?\d[\d\s\-()]{7,}/) ||
      line.match(/linkedin\.com/i) ||
      line.match(/github\.com/i) ||
      line.match(/\.(com|org|net|io|dev)/i) ||
      line.match(/^(email|phone|tel|mobile|linkedin|github|website|portfolio|address|location):/i)
    );
  };

  const getSectionType = (line: string): SectionType | null => {
    const cleanLine = cleanText(line).toLowerCase().replace(/[:\-_]/g, '').trim();
    
    // Check English keywords
    for (const [keyword, type] of Object.entries(sectionKeywords)) {
      if (cleanLine === keyword || cleanLine.startsWith(keyword + ' ')) {
        return type;
      }
    }
    
    // Check non-English keywords
    for (const [keyword, type] of Object.entries(nonEnglishSections)) {
      if (cleanLine === keyword || cleanLine.includes(keyword)) {
        return type;
      }
    }
    
    // Check for ALL CAPS section headers
    if (line === line.toUpperCase() && line.length > 3 && line.length < 50) {
      const upperLine = cleanLine;
      for (const [keyword, type] of Object.entries(sectionKeywords)) {
        if (upperLine.includes(keyword)) {
          return type;
        }
      }
    }
    
    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = cleanText(line);

    // Check for section header
    const sectionType = getSectionType(line);
    if (sectionType) {
      if (currentSection && currentSection.content.length > 0) {
        resume.sections.push(currentSection);
      }
      currentSection = {
        type: sectionType,
        title: cleanLine.toUpperCase(),
        content: []
      };
      inHeader = false;
      continue;
    }

    // Header section (name, title, contact)
    if (inHeader) {
      // First meaningful line is likely the name
      if (!resume.name && cleanLine.length > 2 && cleanLine.length < 60 && !isContactLine(line)) {
        resume.name = cleanLine;
        continue;
      }
      
      // Check for job title
      if (!resume.title && cleanLine.match(/engineer|developer|manager|analyst|designer|architect|scientist|lead|senior|specialist|coordinator|director|consultant|intern|student|professional|associate/i)) {
        resume.title = cleanLine;
        continue;
      }
      
      // Contact info
      if (isContactLine(line)) {
        resume.contact.push(cleanLine);
        continue;
      }
      
      // If we've collected enough header info, start sections
      if (resume.name && (resume.contact.length > 0 || i > 6)) {
        inHeader = false;
      }
    }

    // Add content to current section
    if (currentSection && cleanLine) {
      currentSection.content.push(cleanLine);
    } else if (!inHeader && cleanLine && !currentSection) {
      // Content without a section header - create a general section
      currentSection = {
        type: 'summary',
        title: 'PROFESSIONAL SUMMARY',
        content: [cleanLine]
      };
    }
  }

  // Add last section
  if (currentSection && currentSection.content.length > 0) {
    resume.sections.push(currentSection);
  }

  return resume;
};

// Format content with highlighting
const formatContent = (text: string): string => {
  let formatted = text
    // Bold markdown
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    // Email
    .replace(/([\w.-]+@[\w.-]+\.\w+)/g, '<a href="mailto:$1" class="text-blue-600 hover:underline">$1</a>')
    // URLs
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-600 hover:underline">$1</a>');
  
  return formatted;
};

// Get section icon based on type
const getSectionIcon = (type: ParsedSection['type']): string => {
  const icons: { [key: string]: string } = {
    summary: '📋',
    skills: '🛠️',
    experience: '💼',
    education: '🎓',
    certifications: '🏆',
    projects: '🚀',
    additional: '📌'
  };
  return icons[type] || '📄';
};

// Get ATS score color
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

const ResumeRenderer: React.FC<ResumeRendererProps> = ({ content, className = "", showATSScore = false }) => {
  // Memoize parsing for performance
  const { resume, atsScore } = useMemo(() => {
    if (!content) return { resume: null, atsScore: null };
    return {
      resume: parseResume(content),
      atsScore: showATSScore ? calculateATSScore(content) : null
    };
  }, [content, showATSScore]);

  // Handle empty content
  if (!content || !resume) {
    return (
      <div className={`resume-content ${className}`}>
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-medium">No resume content available</p>
          <p className="text-sm mt-2">Generate a resume to see the preview</p>
        </div>
      </div>
    );
  }

  // Check if content is primarily non-English - use simple renderer
  if (isNonEnglish(content)) {
    return (
      <div className={`resume-content ${className} max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8`}>
        {/* ATS Score Badge */}
        {atsScore && (
          <div className={`mb-6 p-4 rounded-lg border ${getScoreColor(atsScore.overall)}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">ATS Score</span>
              <span className="text-2xl font-bold">{atsScore.overall}%</span>
            </div>
          </div>
        )}
        
        <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {content.split('\n').map((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return <br key={index} />;

            // Section headers
            if (trimmedLine.match(/^[A-Z\s]{4,}$/) || trimmedLine.match(/^(個人情報|職歴要約|技術スキル|職歴|学歴|資格|INFORMACIÓN PERSONAL|RESUMEN PROFESIONAL|COMPETENCIAS TÉCNICAS|EXPERIENCIA LABORAL|FORMACIÓN|IDIOMAS|INFORMATIONS PERSONNELLES|PROFIL PROFESSIONNEL|COMPÉTENCES TECHNIQUES|EXPÉRIENCE PROFESSIONNELLE|FORMATION|LANGUES|PERSÖNLICHE DATEN|BERUFSPROFIL|TECHNISCHE FÄHIGKEITEN|BERUFSERFAHRUNG|AUSBILDUNG|ZERTIFIZIERUNGEN)$/)) {
              return (
                <div key={index} className="font-bold text-lg mt-6 mb-3 text-blue-900 border-b-2 border-blue-200 pb-2">
                  {trimmedLine}
                </div>
              );
            }

            // Name (first line)
            if (index === 0) {
              return (
                <div key={index} className="font-bold text-2xl mb-2 text-center text-gray-900">
                  {trimmedLine}
                </div>
              );
            }

            // Contact info
            if (trimmedLine.match(/@|http|linkedin|github|tel:|phone:|email:|\+\d+/i)) {
              return (
                <div key={index} className="text-blue-600 text-center mb-1 text-sm">
                  {trimmedLine}
                </div>
              );
            }

            // Bullet points
            if (trimmedLine.match(/^[•·\-]\s/)) {
              return (
                <div key={index} className="ml-6 mb-2 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{trimmedLine.replace(/^[•·\-]\s*/, '')}</span>
                </div>
              );
            }

            // Job entries with dates
            if (trimmedLine.match(/\|.*\d{4}/) || trimmedLine.match(/\d{4}\s*[-–]\s*(present|\d{4})/i)) {
              return (
                <div key={index} className="font-semibold mt-4 mb-2 text-gray-800">
                  {trimmedLine}
                </div>
              );
            }

            return <div key={index} className="mb-1">{trimmedLine}</div>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`resume-renderer ${className}`}>
      {/* ATS Score Section */}
      {atsScore && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${getScoreColor(atsScore.overall)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <span className="font-semibold text-lg">ATS Compatibility Score</span>
            </div>
            <div className="text-3xl font-bold">{atsScore.overall}%</div>
          </div>
          
          {/* Score Breakdown */}
          <div className="grid grid-cols-5 gap-2 mb-3 text-xs">
            <div className="text-center p-2 bg-white/50 rounded">
              <div className="font-medium">Contact</div>
              <div className="font-bold">{atsScore.sections.contactInfo}/20</div>
            </div>
            <div className="text-center p-2 bg-white/50 rounded">
              <div className="font-medium">Skills</div>
              <div className="font-bold">{atsScore.sections.skills}/25</div>
            </div>
            <div className="text-center p-2 bg-white/50 rounded">
              <div className="font-medium">Experience</div>
              <div className="font-bold">{atsScore.sections.experience}/30</div>
            </div>
            <div className="text-center p-2 bg-white/50 rounded">
              <div className="font-medium">Education</div>
              <div className="font-bold">{atsScore.sections.education}/15</div>
            </div>
            <div className="text-center p-2 bg-white/50 rounded">
              <div className="font-medium">Format</div>
              <div className="font-bold">{atsScore.sections.formatting}/10</div>
            </div>
          </div>
          
          {/* Suggestions */}
          {atsScore.suggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-current/20">
              <div className="font-medium text-sm mb-2">💡 Suggestions to improve:</div>
              <ul className="text-xs space-y-1">
                {atsScore.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Resume Content */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
            {resume.name || 'Your Name'}
          </h1>
          {resume.title && (
            <p className="text-blue-100 text-center text-lg mb-3">
              {resume.title}
            </p>
          )}
          {resume.contact.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-blue-100">
              {resume.contact.map((item, index) => (
                <span 
                  key={index}
                  dangerouslySetInnerHTML={{ __html: formatContent(item) }}
                  className="[&_a]:text-blue-200 [&_a]:hover:text-white"
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Sections */}
        <div className="p-6 space-y-6">
          {resume.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="resume-section">
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-blue-200">
                <span className="text-lg">{getSectionIcon(section.type)}</span>
                <h2 className="text-lg font-bold text-blue-900 uppercase tracking-wide">
                  {section.title}
                </h2>
              </div>

              {/* Section Content */}
              <div className="space-y-2">
                {section.content.map((item, itemIndex) => {
                  const isBullet = item.startsWith('•') || item.startsWith('-') || item.startsWith('·');
                  const isJobEntry = item.match(/\|.*\d{4}/) || item.match(/\d{4}\s*[-–]\s*(present|\d{4})/i);
                  const isSkillCategory = item.includes(':') && section.type === 'skills';

                  // Job entry with company/dates
                  if (isJobEntry) {
                    return (
                      <div key={itemIndex} className="font-semibold text-gray-800 mt-4 first:mt-0">
                        {item}
                      </div>
                    );
                  }

                  // Skill category
                  if (isSkillCategory) {
                    const [category, skills] = item.split(':');
                    return (
                      <div key={itemIndex} className="mb-2">
                        <span className="font-semibold text-gray-700">{category}:</span>
                        <span className="text-gray-600"> {skills}</span>
                      </div>
                    );
                  }

                  // Bullet point
                  if (isBullet) {
                    return (
                      <div key={itemIndex} className="flex items-start gap-2 ml-2">
                        <span className="text-blue-500 mt-1.5 text-xs">●</span>
                        <span 
                          className="text-gray-700 flex-1"
                          dangerouslySetInnerHTML={{ __html: formatContent(item.replace(/^[•\-·]\s*/, '')) }}
                        />
                      </div>
                    );
                  }

                  // Regular text
                  return (
                    <div 
                      key={itemIndex} 
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{ __html: formatContent(item) }}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {resume.sections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No sections found in the resume content.</p>
              <p className="text-sm mt-2">The resume may need proper section headers like EXPERIENCE, SKILLS, EDUCATION.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeRenderer;
