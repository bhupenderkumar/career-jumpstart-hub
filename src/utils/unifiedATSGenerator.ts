import jsPDF from 'jspdf';

/**
 * Unified ATS-Optimized Resume PDF Generator
 * 
 * Single source of truth for resume PDF generation.
 * 
 * ATS Best Practices:
 * - Single-column layout (no tables/columns)
 * - Standard fonts: Helvetica (maps to Arial in PDF)
 * - Simple formatting: bold for headers, no fancy graphics
 * - Proper heading hierarchy
 * - Clean text extraction by parsers
 * - Standard section ordering
 * - Proper PDF metadata
 * - No images, no headers/footers, no watermarks
 */

// ────────────────────── Types ──────────────────────

export interface ATSScore {
  overall: number;
  sections: {
    contactInfo: number;
    skills: number;
    experience: number;
    education: number;
    formatting: number;
  };
  suggestions: string[];
}

interface ContactInfo {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  portfolio: string;
  other: string[];
}

interface ExperienceEntry {
  title: string;
  company: string;
  location: string;
  dates: string;
  bullets: string[];
}

interface EducationEntry {
  degree: string;
  school: string;
  dates: string;
  details: string[];
}

interface SkillGroup {
  category: string;
  items: string[];
}

interface ProjectEntry {
  name: string;
  description: string;
  technologies: string;
  bullets: string[];
}

interface ParsedResume {
  name: string;
  title: string;
  contact: ContactInfo;
  summary: string[];
  skills: SkillGroup[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: string[];
  projects: ProjectEntry[];
  additional: string[];
}

// ────────────────────── Text Cleaning ──────────────────────

const cleanMarkdown = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')       // **bold**
    .replace(/__(.*?)__/g, '$1')           // __underline__
    .replace(/\*(.*?)\*/g, '$1')           // *italic*
    .replace(/_(.*?)_/g, '$1')             // _italic_
    .replace(/`(.*?)`/g, '$1')             // `code`
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) → text
    .replace(/#+\s*/g, '')                 // # headers
    .replace(/[•●◦○⚬►▸▹]/g, '•')          // normalise bullets
    .replace(/,?\s*[-–—]{2,}\s*$/g, '')    // trailing --, ---, —— etc.
    .replace(/^\s*[-–—]{2,}\s*/g, '')       // leading --, ---, —— etc.
    .replace(/\s+/g, ' ')
    .trim();
};

// ────────────────────── Section Detection ──────────────────────

type SectionKey = 'header' | 'summary' | 'skills' | 'experience' | 'education' |
  'certifications' | 'projects' | 'additional';

const SECTION_MAP: Record<string, SectionKey> = {
  // English
  'summary': 'summary', 'professional summary': 'summary', 'profile': 'summary',
  'objective': 'summary', 'about': 'summary', 'career summary': 'summary',
  'skills': 'skills', 'technical skills': 'skills', 'key skills': 'skills',
  'core competencies': 'skills', 'technologies': 'skills', 'expertise': 'skills',
  'programming skills': 'skills',
  'experience': 'experience', 'work experience': 'experience',
  'professional experience': 'experience', 'employment history': 'experience',
  'employment': 'experience',
  'education': 'education', 'academic background': 'education',
  'academic': 'education', 'qualifications': 'education',
  'certifications': 'certifications', 'certificates': 'certifications',
  'licenses': 'certifications', 'credentials': 'certifications',
  'projects': 'projects', 'key projects': 'projects', 'personal projects': 'projects',
  'portfolio': 'projects',
  'additional': 'additional', 'interests': 'additional', 'languages': 'additional',
  'awards': 'additional', 'achievements': 'additional', 'publications': 'additional',
  'activities': 'additional', 'leadership': 'additional', 'research': 'additional',
  // Japanese
  '職歴': 'experience', '経歴': 'experience', '職歴要約': 'summary',
  'スキル': 'skills', '技術スキル': 'skills', '学歴': 'education', '資格': 'certifications',
  // Spanish
  'experiencia': 'experience', 'experiencia laboral': 'experience',
  'habilidades': 'skills', 'competencias': 'skills',
  'educación': 'education', 'formación': 'education',
  // French
  'expérience': 'experience', 'expérience professionnelle': 'experience',
  'compétences': 'skills', 'formation': 'education',
  // German
  'berufserfahrung': 'experience', 'fähigkeiten': 'skills',
  'ausbildung': 'education', 'zertifizierungen': 'certifications',
};

const detectSection = (line: string): SectionKey | null => {
  const cleaned = cleanMarkdown(line).toLowerCase().replace(/[:\-_#]/g, '').trim();
  // Direct match
  if (SECTION_MAP[cleaned]) return SECTION_MAP[cleaned];
  // Prefix match
  for (const [key, section] of Object.entries(SECTION_MAP)) {
    if (cleaned === key || cleaned.startsWith(key + ' ')) return section;
  }
  // ALL-CAPS header heuristic
  if (line === line.toUpperCase() && line.length > 3 && line.length < 50) {
    for (const [key, section] of Object.entries(SECTION_MAP)) {
      if (cleaned.includes(key)) return section;
    }
  }
  return null;
};

// ────────────────────── Parsing Helpers ──────────────────────

const isContactLine = (line: string): boolean => !!(
  line.match(/@[\w.-]+\.\w+/) ||
  line.match(/\+?\d[\d\s\-()]{8,}/) ||
  line.match(/linkedin\.com/i) ||
  line.match(/github\.com/i) ||
  line.match(/\.(com|org|net|io|dev|edu)/i) ||
  line.match(/^(email|phone|tel|mobile|linkedin|github|website|portfolio|address|location):/i)
);

const isJobEntry = (line: string): boolean => !!(
  (line.includes('|') && line.match(/\d{4}/)) ||
  line.match(/\d{4}\s*[-–—]\s*(present|\d{4})/i) ||
  line.match(/^[\w\s,]+\s+(at|@)\s+[\w\s,]+/)
);

const extractJobInfo = (line: string): { title: string; company: string; dates: string; location: string } => {
  // Pattern: Title | Company | Dates  OR  Title | Company, Location | Dates
  const pipeMatch = line.match(/^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/);
  if (pipeMatch) {
    const [, first, second, third] = pipeMatch;
    // If there's a 4th pipe segment, use it
    const remaining = third.split('|').map(s => s.trim());
    if (remaining.length >= 2) {
      return {
        title: first.trim(),
        company: second.trim(),
        location: '',
        dates: remaining[remaining.length - 1],
      };
    }
    return { title: first.trim(), company: second.trim(), dates: third.trim(), location: '' };
  }
  // Pattern with dash and year
  const dashMatch = line.match(/^(.+?)\s*[-–—]\s*(.+?)\s*,?\s*(\d{4}.*)$/);
  if (dashMatch) {
    return { title: dashMatch[1].trim(), company: dashMatch[2].trim(), dates: dashMatch[3].trim(), location: '' };
  }
  return { title: line, company: '', dates: '', location: '' };
};

// ────────────────────── Resume Parser ──────────────────────

/** Returns true for lines that are purely decorative separators (---, ===, ***, etc.) */
const isDecorativeLine = (line: string): boolean => {
  const stripped = line.replace(/\s/g, '');
  if (!stripped) return true;
  // Pure separator chars: dashes, equals, underscores, stars, tildes, dots
  if (/^[-–—=_*~#.,:;|]+$/.test(stripped)) return true;
  // Markdown horizontal rules
  if (/^(---|===|\*\*\*|___|~~~)/.test(stripped)) return true;
  // Very short lines of only punctuation + whitespace (e.g. "-- " or "---,")
  if (stripped.length <= 4 && /^[-–—=_*~,.;:]+$/.test(stripped)) return true;
  return false;
};

export const parseResumeContent = (content: string): ParsedResume => {
  const rawLines = content.split('\n').map(l => cleanMarkdown(l)).filter(l => l && !isDecorativeLine(l));

  const resume: ParsedResume = {
    name: '', title: '',
    contact: { email: '', phone: '', linkedin: '', github: '', location: '', portfolio: '', other: [] },
    summary: [], skills: [], experience: [], education: [],
    certifications: [], projects: [], additional: [],
  };

  let currentSection: SectionKey = 'header';
  let curExp: ExperienceEntry | null = null;
  let curEdu: EducationEntry | null = null;
  let curProj: ProjectEntry | null = null;
  let curSkillCat: SkillGroup | null = null;

  const pushPending = () => {
    if (curExp && (curExp.title || curExp.company)) { resume.experience.push(curExp); curExp = null; }
    if (curEdu && (curEdu.degree || curEdu.school)) { resume.education.push(curEdu); curEdu = null; }
    if (curProj && curProj.name) { resume.projects.push(curProj); curProj = null; }
    if (curSkillCat && curSkillCat.items.length) { resume.skills.push(curSkillCat); curSkillCat = null; }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // ── Section header detection ──
    const section = detectSection(line);
    if (section) {
      pushPending();
      currentSection = section;
      continue;
    }

    // ── Route content to correct section ──
    switch (currentSection) {
      case 'header': {
        if (!resume.name && !isContactLine(line) && line.length < 60) {
          resume.name = line;
        } else if (!resume.title && line.length < 100 &&
          line.match(/engineer|developer|manager|analyst|designer|architect|scientist|lead|senior|specialist|coordinator|director|consultant|intern|student|professional|associate/i)) {
          resume.title = line;
        } else if (isContactLine(line)) {
          const email = line.match(/[\w.-]+@[\w.-]+\.\w+/);
          const phone = line.match(/\+?\d[\d\s\-()]{8,}/);
          const linkedin = line.match(/linkedin\.com\/in\/[\w-]+/i);
          const github = line.match(/github\.com\/[\w-]+/i);
          if (email) resume.contact.email = email[0];
          if (phone) resume.contact.phone = phone[0].replace(/\s+/g, ' ').trim();
          if (linkedin) resume.contact.linkedin = linkedin[0];
          if (github) resume.contact.github = github[0];
          if (!email && !phone && !linkedin && !github) {
            if (line.match(/\.(com|org|net|io|dev)/i)) {
              resume.contact.portfolio = line;
            } else if (!resume.contact.location && line.length < 80) {
              resume.contact.location = line;
            }
          }
        } else if (line.includes('|') || line.includes('•')) {
          // Contact line with separators
          const parts = line.split(/[|•]/).map(p => p.trim()).filter(Boolean);
          for (const part of parts) {
            const email = part.match(/[\w.-]+@[\w.-]+\.\w+/);
            const phone = part.match(/\+?\d[\d\s\-()]{8,}/);
            const linkedin = part.match(/linkedin\.com\/in\/[\w-]+/i);
            const github = part.match(/github\.com\/[\w-]+/i);
            if (email && !resume.contact.email) resume.contact.email = email[0];
            else if (phone && !resume.contact.phone) resume.contact.phone = phone[0].replace(/\s+/g, ' ').trim();
            else if (linkedin && !resume.contact.linkedin) resume.contact.linkedin = linkedin[0];
            else if (github && !resume.contact.github) resume.contact.github = github[0];
            else if (part.match(/\.(com|org|net|io|dev)/i) && !resume.contact.portfolio) resume.contact.portfolio = part;
            else if (!resume.contact.location && part.length < 50) resume.contact.location = part;
          }
        }
        break;
      }

      case 'summary': {
        resume.summary.push(line.replace(/^[•\-]\s*/, ''));
        break;
      }

      case 'skills': {
        if (line.includes(':')) {
          pushPending();
          const [cat, rest] = line.split(/:(.+)/);
          curSkillCat = {
            category: cat.trim(),
            items: rest ? rest.split(/[,;]/).map(s => s.trim()).filter(Boolean) : [],
          };
        } else if (curSkillCat) {
          const items = line.replace(/^[•\-]\s*/, '').split(/[,;]/).map(s => s.trim()).filter(Boolean);
          curSkillCat.items.push(...items);
        } else {
          curSkillCat = {
            category: '',
            items: line.replace(/^[•\-]\s*/, '').split(/[,;]/).map(s => s.trim()).filter(Boolean),
          };
        }
        break;
      }

      case 'experience': {
        if (isJobEntry(line)) {
          pushPending();
          const info = extractJobInfo(line);
          curExp = { ...info, bullets: [] };
        } else if (curExp) {
          const bullet = line.replace(/^[•\-*]\s*/, '');
          if (bullet) curExp.bullets.push(bullet);
        } else {
          // First line with no job pattern, treat as a new job entry
          curExp = { title: line, company: '', dates: '', location: '', bullets: [] };
        }
        break;
      }

      case 'education': {
        if (line.match(/\d{4}/) || line.match(/university|college|school|institute|bachelor|master|phd|b\.?\s?tech|m\.?\s?tech|b\.?\s?s\.?|m\.?\s?s\.?|degree/i)) {
          pushPending();
          const parts = line.split('|').map(p => p.trim());
          curEdu = {
            degree: parts[0] || '',
            school: parts[1] || '',
            dates: parts[parts.length - 1] !== parts[0] ? parts[parts.length - 1] || '' : '',
            details: [],
          };
        } else if (curEdu) {
          const detail = line.replace(/^[•\-]\s*/, '');
          if (detail) {
            if (!curEdu.school && line.match(/university|college|school|institute/i)) {
              curEdu.school = detail;
            } else {
              curEdu.details.push(detail);
            }
          }
        }
        break;
      }

      case 'certifications': {
        resume.certifications.push(line.replace(/^[•\-]\s*/, ''));
        break;
      }

      case 'projects': {
        if (line.match(/^[•\-]\s/) && curProj) {
          curProj.bullets.push(line.replace(/^[•\-]\s*/, ''));
        } else if (!line.startsWith('•') && !line.startsWith('-')) {
          pushPending();
          const colonIdx = line.indexOf(':');
          curProj = {
            name: colonIdx > 0 ? line.substring(0, colonIdx).trim() : line,
            description: colonIdx > 0 ? line.substring(colonIdx + 1).trim() : '',
            technologies: '',
            bullets: [],
          };
        }
        break;
      }

      case 'additional': {
        resume.additional.push(line.replace(/^[•\-]\s*/, ''));
        break;
      }
    }
  }

  pushPending();
  return resume;
};

// ────────────────────── ATS Score Calculator ──────────────────────

const ATS_ACTION_VERBS = [
  'achieved', 'administered', 'analyzed', 'architected', 'automated', 'built',
  'collaborated', 'configured', 'coordinated', 'created', 'delivered', 'deployed',
  'designed', 'developed', 'documented', 'enhanced', 'established', 'executed',
  'expanded', 'generated', 'implemented', 'improved', 'increased', 'initiated',
  'integrated', 'launched', 'led', 'maintained', 'managed', 'mentored', 'migrated',
  'monitored', 'optimized', 'orchestrated', 'organized', 'oversaw', 'performed',
  'planned', 'presented', 'produced', 'provided', 'reduced', 'refactored', 'resolved',
  'scaled', 'secured', 'simplified', 'spearheaded', 'streamlined', 'supervised',
  'supported', 'tested', 'trained', 'transformed', 'upgraded',
];

const ATS_TECH_SKILLS = [
  'java', 'python', 'javascript', 'typescript', 'react', 'angular', 'vue', 'node',
  'spring', 'django', 'flask', 'express', 'mongodb', 'postgresql', 'mysql', 'redis',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'ci/cd', 'jenkins',
  'agile', 'scrum', 'rest', 'graphql', 'microservices', 'api', 'sql', 'nosql',
  'terraform', 'ansible', 'linux', 'bash', 'html', 'css', 'sass', 'webpack',
  'machine learning', 'data science', 'ai', 'blockchain', 'solidity', 'rust',
  'spring boot', 'next.js', 'tailwind', 'kafka', 'rabbitmq', 'elasticsearch',
];

export const calculateATSScore = (content: string): ATSScore => {
  const text = content.toLowerCase();
  const lines = content.split('\n');
  const suggestions: string[] = [];

  // 1. Contact (20 pts)
  let contactScore = 0;
  if (text.match(/@\w+\.\w+/)) contactScore += 5; else suggestions.push('Add a professional email address');
  if (text.match(/\+?\d[\d\s\-()]{8,}/)) contactScore += 5; else suggestions.push('Add a phone number');
  if (text.match(/linkedin\.com/i)) contactScore += 5; else suggestions.push('Add your LinkedIn profile URL');
  if (text.match(/github\.com/i)) contactScore += 5;

  // 2. Skills (25 pts)
  const foundSkills = ATS_TECH_SKILLS.filter(s => text.includes(s));
  const skillsScore = Math.min(25, foundSkills.length * 2);
  if (skillsScore < 15) suggestions.push('Add more technical skills relevant to the job');

  // 3. Experience (30 pts)
  let experienceScore = 0;
  const quantifierPatterns = [/%/, /increased/i, /reduced/i, /improved/i, /saved/i, /grew/i, /generated/i, /\$\d/, /\d+\+/];
  if (quantifierPatterns.some(p => p.test(content))) experienceScore += 10;
  else suggestions.push('Add quantified achievements (e.g., "Increased sales by 25%")');

  const foundVerbs = ATS_ACTION_VERBS.filter(v => text.includes(v));
  experienceScore += Math.min(15, foundVerbs.length);
  if (foundVerbs.length < 5) suggestions.push('Use strong action verbs to start bullet points');

  if (lines.some(l => l.match(/\|.*\d{4}/) || l.match(/\d{4}\s*[-–]\s*(present|\d{4})/i)))
    experienceScore += 5;

  // 4. Education (15 pts)
  let educationScore = 0;
  if (text.match(/bachelor|master|phd|b\.?\s?tech|m\.?\s?tech|b\.?\s?s\.?|m\.?\s?s\.?|degree/i)) educationScore += 10;
  else suggestions.push('Include your educational background');
  if (text.match(/university|college|institute/i)) educationScore += 5;

  // 5. Formatting (10 pts)
  let formattingScore = 0;
  const sectionCount = ['experience', 'education', 'skills'].filter(s => text.includes(s)).length;
  formattingScore += Math.min(5, sectionCount * 2);
  if (lines.length >= 20 && lines.length <= 120) formattingScore += 3;
  else if (lines.length < 20) suggestions.push('Add more content — your resume seems too short');
  if (content.match(/[•\-]/)) formattingScore += 2;

  const overall = Math.min(100, contactScore + skillsScore + experienceScore + educationScore + formattingScore);
  return {
    overall,
    sections: { contactInfo: contactScore, skills: skillsScore, experience: experienceScore, education: educationScore, formatting: formattingScore },
    suggestions: suggestions.slice(0, 5),
  };
};

// ────────────────────── PDF Generation ──────────────────────

export const generateATSResumePDF = (content: string, fileName?: string): { blob: Blob; score: ATSScore } => {
  const resume = parseResumeContent(content);
  const score = calculateATSScore(content);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210;   // page width
  const PH = 297;   // page height
  const ML = 18;     // margin-left
  const MR = 18;     // margin-right
  const MT = 16;     // margin-top
  const MB = 16;     // margin-bottom
  const CW = PW - ML - MR; // content width

  let y = MT;

  // Colors
  const C = {
    black:  [0, 0, 0]        as [number, number, number],
    dark:   [33, 37, 41]     as [number, number, number],
    muted:  [75, 85, 99]     as [number, number, number],
    accent: [30, 64, 175]    as [number, number, number],
    line:   [209, 213, 219]  as [number, number, number],
  };

  // ── Helpers ──

  const pageBreakIfNeeded = (h: number) => {
    if (y + h > PH - MB) { pdf.addPage(); y = MT; }
  };

  const setFont = (size: number, style: 'normal' | 'bold' | 'italic' = 'normal', color: [number, number, number] = C.dark) => {
    pdf.setFontSize(size);
    pdf.setFont('helvetica', style);
    pdf.setTextColor(color[0], color[1], color[2]);
  };

  const writeText = (text: string, options: {
    x?: number; size?: number; style?: 'normal' | 'bold' | 'italic';
    color?: [number, number, number]; align?: 'left' | 'center' | 'right';
    maxW?: number; lineH?: number;
  } = {}): void => {
    const {
      x = ML, size = 10, style = 'normal',
      color = C.dark, align = 'left',
      maxW = CW, lineH = 1.35,
    } = options;

    if (!text) return;
    setFont(size, style, color);

    const lines = pdf.splitTextToSize(text, maxW);
    const spacing = size * 0.353 * lineH; // mm per line

    for (const line of lines) {
      pageBreakIfNeeded(spacing + 1);
      let tx = x;
      if (align === 'center') tx = PW / 2;
      else if (align === 'right') tx = PW - MR;
      pdf.text(line, tx, y, { align });
      y += spacing;
    }
  };

  const addSectionHeader = (title: string) => {
    pageBreakIfNeeded(12);
    y += 5;
    setFont(11, 'bold', C.accent);
    pdf.text(title.toUpperCase(), ML, y);
    y += 2.5;
    pdf.setDrawColor(C.line[0], C.line[1], C.line[2]);
    pdf.setLineWidth(0.5);
    pdf.line(ML, y, PW - MR, y);
    y += 5;
  };

  const addBullet = (text: string) => {
    pageBreakIfNeeded(8);
    setFont(9.5, 'normal', C.dark);
    pdf.text('•', ML + 3, y);
    const bulletX = ML + 8;
    const lines = pdf.splitTextToSize(text, CW - 10);
    const spacing = 9.5 * 0.353 * 1.3;
    for (const line of lines) {
      pageBreakIfNeeded(spacing + 1);
      pdf.text(line, bulletX, y);
      y += spacing;
    }
    y += 1;
  };

  // ── PDF Metadata ──
  pdf.setProperties({
    title: `${resume.name || 'Resume'} - Professional Resume`,
    subject: 'Professional Resume / CV',
    author: resume.name || 'Candidate',
    creator: 'Career Jumpstart Hub',
  });

  // ═══════════════ RENDER ═══════════════

  // ── Name ──
  if (resume.name) {
    writeText(resume.name, { size: 20, style: 'bold', color: C.black, align: 'center' });
    y += 1;
  }

  // ── Title ──
  if (resume.title) {
    writeText(resume.title, { size: 11, color: C.muted, align: 'center' });
    y += 1;
  }

  // ── Contact ──
  const contactParts: string[] = [];
  if (resume.contact.email)     contactParts.push(resume.contact.email);
  if (resume.contact.phone)     contactParts.push(resume.contact.phone);
  if (resume.contact.location)  contactParts.push(resume.contact.location);
  if (resume.contact.linkedin)  contactParts.push(resume.contact.linkedin);
  if (resume.contact.github)    contactParts.push(resume.contact.github);
  if (resume.contact.portfolio) contactParts.push(resume.contact.portfolio);
  contactParts.push(...resume.contact.other);

  if (contactParts.length > 0) {
    // Split into multiple lines if too long
    const contactText = contactParts.join('  |  ');
    writeText(contactText, { size: 9, color: C.muted, align: 'center' });
  }

  // ── Separator ──
  y += 3;
  pdf.setDrawColor(C.line[0], C.line[1], C.line[2]);
  pdf.setLineWidth(0.75);
  pdf.line(ML, y, PW - MR, y);
  y += 5;

  // ── Professional Summary ──
  if (resume.summary.length > 0) {
    addSectionHeader('Professional Summary');
    const summaryText = resume.summary.join(' ');
    writeText(summaryText, { size: 10, color: C.dark });
    y += 3;
  }

  // ── Technical Skills ──
  if (resume.skills.length > 0) {
    addSectionHeader('Technical Skills');
    for (const group of resume.skills) {
      if (group.items.length === 0) continue;
      const prefix = group.category ? `${group.category}: ` : '';
      const skillLine = prefix + group.items.join(', ');
      // Write category in bold, items in normal
      if (group.category) {
        setFont(10, 'bold', C.dark);
        const catWidth = pdf.getTextWidth(group.category + ': ');
        pdf.text(group.category + ': ', ML, y);
        setFont(10, 'normal', C.dark);
        const itemLines = pdf.splitTextToSize(group.items.join(', '), CW - catWidth);
        for (let li = 0; li < itemLines.length; li++) {
          if (li === 0) {
            pdf.text(itemLines[0], ML + catWidth, y);
          } else {
            y += 10 * 0.353 * 1.3;
            pageBreakIfNeeded(5);
            pdf.text(itemLines[li], ML, y);
          }
        }
        y += 10 * 0.353 * 1.3;
      } else {
        writeText(skillLine, { size: 10 });
      }
      y += 1.5;
    }
    y += 2;
  }

  // ── Professional Experience ──
  if (resume.experience.length > 0) {
    addSectionHeader('Professional Experience');
    for (const job of resume.experience) {
      pageBreakIfNeeded(18);

      // Title line
      if (job.title) {
        setFont(10.5, 'bold', C.black);
        pdf.text(job.title, ML, y);
      }
      // Dates right-aligned on same line
      if (job.dates) {
        setFont(9, 'normal', C.muted);
        pdf.text(job.dates, PW - MR, y, { align: 'right' });
      }
      y += 10.5 * 0.353 * 1.3;

      // Company
      if (job.company) {
        writeText(job.company + (job.location ? ` — ${job.location}` : ''), {
          size: 9.5, style: 'italic', color: C.muted,
        });
        y += 1;
      }

      // Bullets
      for (const bullet of job.bullets) {
        addBullet(bullet);
      }
      y += 4;
    }
  }

  // ── Education ──
  if (resume.education.length > 0) {
    addSectionHeader('Education');
    for (const edu of resume.education) {
      pageBreakIfNeeded(14);
      if (edu.degree) {
        setFont(10.5, 'bold', C.black);
        pdf.text(edu.degree, ML, y);
      }
      if (edu.dates) {
        setFont(9, 'normal', C.muted);
        pdf.text(edu.dates, PW - MR, y, { align: 'right' });
      }
      y += 10.5 * 0.353 * 1.3;

      if (edu.school) {
        writeText(edu.school, { size: 9.5, style: 'italic', color: C.muted });
        y += 1;
      }
      for (const detail of edu.details) {
        addBullet(detail);
      }
      y += 3;
    }
  }

  // ── Certifications ──
  if (resume.certifications.length > 0) {
    addSectionHeader('Certifications');
    for (const cert of resume.certifications) {
      addBullet(cert);
    }
    y += 2;
  }

  // ── Projects ──
  if (resume.projects.length > 0) {
    addSectionHeader('Key Projects');
    for (const proj of resume.projects) {
      pageBreakIfNeeded(12);
      writeText(proj.name, { size: 10, style: 'bold', color: C.black });
      if (proj.description) {
        writeText(proj.description, { size: 9.5, color: C.dark });
      }
      if (proj.technologies) {
        writeText(`Technologies: ${proj.technologies}`, { size: 9, style: 'italic', color: C.muted });
      }
      for (const bullet of proj.bullets) {
        addBullet(bullet);
      }
      y += 3;
    }
  }

  // ── Additional ──
  if (resume.additional.length > 0) {
    addSectionHeader('Additional Information');
    for (const item of resume.additional) {
      addBullet(item);
    }
  }

  const blob = pdf.output('blob');

  // Auto-download
  const ts = new Date().toISOString().slice(0, 10);
  const finalName = fileName || `resume_ats_${ts}.pdf`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { blob, score };
};

// ── Convenience wrappers ──

export const downloadATSResume = (content: string, fileName?: string): ATSScore => {
  const { score } = generateATSResumePDF(content, fileName);
  return score;
};

export const downloadPremiumResume = (content: string, fileName?: string) => {
  generateATSResumePDF(content, fileName || 'resume-premium.pdf');
};

export const downloadSimpleResume = (content: string, fileName?: string) => {
  generateATSResumePDF(content, fileName || 'resume-simple.pdf');
};

export default generateATSResumePDF;
