// Hybrid AI Service
// Uses GitHub Enterprise Proxy for local development, Gemini API for production
// The Vite proxy forwards /api/llm/* to http://localhost:9001/v1/*

const LOCAL_BACKEND_URL = '/api/llm/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_API_KEY = 'AIzaSyAD4URN7ASl5yuP8vmpbE_GaNYnU-RmuMM';

// Detect if running locally
const isLocalEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.');
};

// Available models via GitHub Enterprise Proxy (local)
const GITHUB_PROXY_MODELS = [
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-3.5-turbo'
];

// Available Gemini models (production)
const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro'
];

// Hardcoded base resume for best ATS score
export const BASE_RESUME = `BHUPENDER KUMAR
Senior Full Stack Developer | Web3 & Blockchain Engineer | 12+ Years Experience

New Delhi, India | +91 9717267473 | rajus9231@gmail.com
linkedin.com/in/bhupik | github.com/bhupenderkumar

PROFESSIONAL SUMMARY
Senior Full Stack Developer with 12+ years of experience in enterprise software development, Web3/Blockchain technologies, and distributed systems. Expertise in Java, Spring Boot, React, TypeScript, Solana, Ethereum, Rust/Anchor, and DeFi protocols. Proven track record of building trading systems, decentralized applications, RWA tokenization platforms, and microservices architecture. Strong background in capital markets technology, smart contract development, AI/LLM integration, and multi-agent systems.

TECHNICAL SKILLS
Blockchain & Web3: Solana, Ethereum, Rust, Anchor Framework, Solidity, Web3.js, Smart Contracts, DeFi, Token Development, RWA Tokenization, Drift Protocol, Token-2022, Wormhole
Backend: Java, Spring Boot, Spring Framework, Python, FastAPI, Node.js, TypeScript, Kotlin, REST APIs, GraphQL, Microservices, JAXB
Frontend: React, Next.js 14, Angular, JavaScript, TypeScript, HTML5, CSS3, TailwindCSS, shadcn/ui, jQuery
Databases: MongoDB, PostgreSQL, Elasticsearch, Redis, SQLite
DevOps & Tools: Docker, Kubernetes, Git, GitHub Actions, Kibana, Logstash, ELK Stack, Jenkins, AWS, Railway, Nginx
AI/ML: LLM Integration (OpenAI, Anthropic, Groq), Model Context Protocol (MCP), DialogFlow, Rasa, AI Agents, Multi-Agent Systems

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Lab49, Noida, India | Jun 2021 - Present
• Lead design and development of decentralized applications (dApps) and smart contracts on Solana and Ethereum blockchain networks
• Build trading systems and DeFi protocols for capital markets technology using Rust/Anchor and Solidity
• Architect scalable microservices using Spring Boot with high-performance backend systems
• Develop responsive frontend applications with React and TypeScript
• Implement Web3 integrations including wallet connections, token transfers, and on-chain data processing
• Built RWA Asset Tokenization platform enabling banks to tokenize real-world assets on Solana with Securitize, Civic Pass KYC/AML, and Anchorage Digital custody integration
• Technologies: Solana, Ethereum, Rust, Anchor, Solidity, Web3.js, Java, Spring Boot, React, TypeScript, Token-2022

Java Software Engineer | Colt Technology Services | Sep 2018 - May 2021
• Led implementation of Kibana ELK Stack monitoring dashboards, reducing incident response times by 40%
• Automated repetitive workflows through Python scripts, reducing manual efforts by 60%
• Built full-stack applications with Angular frontend and Java Spring backend
• Collaborated with stakeholders to define requirements and deliver solutions aligned with business objectives
• Technologies: Java, Angular, Python, Kibana, Elasticsearch, Logstash, JavaScript

Software Engineer | Bureau Veritas Group, Noida, India | Oct 2016 - Sep 2018
• Developed workflow optimization utility that reduced processing time from 3 days to 20 minutes (90% improvement)
• Created decision-support program for data-driven decisions, increasing response speed across departments
• Resolved major connection leaks, improving system stability in high-concurrency environments
• Technologies: Java, Spring Framework, jQuery, AJAX

Software Engineer | DXC Technology, Gurugram, India | Oct 2015 - Jan 2017
• Implemented Lazy Loading in JAXB context creation, significantly reducing initialization times
• Developed .NET Web Service integration tool, automating metadata extraction and reducing response time by 30%
• Redesigned MongoDB client connection pooling for optimized database performance under heavy load
• Technologies: Java, MongoDB, Spring Framework, JAXB

Mobile Application Developer | Canon India, Gurugram, India | Oct 2014 - Oct 2015
• Developed cross-platform mobile applications using PhoneGap framework for iOS and Android
• Implemented XML parsing with jQuery and SOAP web services integration
• Received Best Trainee Award for delivering two hybrid apps with 4.8/5 average rating
• Technologies: PhoneGap, JavaScript, jQuery, SOAP

KEY PROJECTS (GitHub: github.com/bhupenderkumar - 103+ repositories)

• Solana Trading Bot: Automated trading system for Solana DeFi markets with natural language rule input, LLM-powered parsing (OpenAI/Anthropic), Drift Protocol integration for perpetuals trading, Docker persistence, WebSocket real-time updates. Tech: TypeScript, Python, FastAPI, React, PostgreSQL, Docker

• RWA Asset Tokenization Platform: Enterprise-grade infrastructure for tokenizing real-world bank assets on Solana. Features bank portal, investor marketplace, Securitize API integration, Civic Pass KYC/AML, Anchorage Digital custody, RedStone oracles, Token-2022 compliance hooks. Tech: TypeScript, Rust/Anchor, Next.js, Node.js, PostgreSQL, AWS

• Solana MCP Server: Model Context Protocol server with 31 tools for Solana blockchain actions - wallet creation, balance checks, token transfers, price feeds, devnet airdrops, meme coin creation guides, local validator support. Tech: Java, Spring Boot 3.5, Spring AI MCP 1.1.2, Solana JSON-RPC

• Multi-Agent Copilot (agent-master): VS Code extension orchestrating multiple AI agents for collaborative coding - Planner, Coder, Tester, Reviewer, Docs agents with shared state management and GitHub Copilot integration. Tech: TypeScript, VS Code Extension API

• Solana Meme Coin Trading Bot: AI-powered trading bot with real-time CoinGecko prices, Groq LLM analysis, OHLCV candlestick charts from Binance, paper trading with $10K virtual money, portfolio tracking. Supports BONK, WIF, POPCAT, MEW, BOME. Tech: Next.js 14, FastAPI, Python, TailwindCSS

• Agent Deployment System: AI-powered deployment system using Agency Swarm for automated GitHub repo deployment, rollback, and monitoring via natural language commands. Tech: Python, TypeScript, Docker, GitHub Enterprise

• Polymarket Copy Trading Bot: Automated copy trading bot for prediction markets using Python
• Sentinel: Security testing platform for vulnerability scanning using TypeScript
• Shiksha/Digital School: Educational platforms with React, TypeScript frontend
• Subscription Management: Full-stack subscription system with Java backend and TypeScript UI

EDUCATION
Bachelor of Technology in Computer Science Engineering | 2011 - 2015
University of Technical Education (UPTU), Greater Noida, UP
CGPA: 7.2 | Major: Software Engineering

CERTIFICATIONS
• SCJP - Sun Certified Java Programmer
• ISTQB - Software Testing Certification
• AWS Machine Learning – Specialty (Associate-level) Certification
`;

// Call GitHub Enterprise Proxy for AI generation (OpenAI-compatible)
const callGitHubProxy = async (prompt: string, model: string = 'gpt-4o'): Promise<string> => {
  console.log(`🤖 Calling GitHub Enterprise Proxy (${model})...`);
  console.log(`📝 Prompt length: ${prompt.length} characters`);
  
  try {
    const response = await fetch(LOCAL_BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume writer and career consultant. Generate professional, ATS-optimized content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GitHub Proxy error:', response.status, errorText);
      throw new Error(`GitHub Proxy error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ GitHub Proxy response received');
    
    // OpenAI-compatible response format
    const content = data.choices?.[0]?.message?.content || '';
    
    if (!content) {
      throw new Error('Empty response from GitHub Proxy');
    }
    
    return content;
  } catch (error) {
    console.error('❌ Failed to call GitHub Proxy:', error);
    throw error;
  }
};

// Call Gemini API for AI generation (production)
const callGeminiAPI = async (prompt: string, model: string = 'gemini-1.5-flash'): Promise<string> => {
  console.log(`🤖 Calling Gemini API (${model})...`);
  console.log(`📝 Prompt length: ${prompt.length} characters`);
  
  try {
    const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert resume writer and career consultant. Generate professional, ATS-optimized content.\n\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
      console.error('❌ Gemini API error:', response.status, errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Gemini API response received');
    
    // Gemini response format
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!content) {
      throw new Error('Empty response from Gemini API');
    }
    
    return content;
  } catch (error) {
    console.error('❌ Failed to call Gemini API:', error);
    throw error;
  }
};

export interface ResumeGenerationRequest {
  jobDescription: string;
  baseResume?: string;
  editPrompt?: string;
  language?: string;
  country?: string;
  generateType?: 'resume' | 'cover-letter' | 'email' | 'all';
  onModelChange?: (modelName: string, documentType: string) => void;
}

export interface GenerationResult {
  resume?: string;
  coverLetter?: string;
  email?: string;
}

export const generateResumeWithAI = async ({
  jobDescription,
  baseResume,
  editPrompt,
  language = 'en',
  country = 'International',
  generateType = 'resume'
}: ResumeGenerationRequest): Promise<string> => {
  const result = await generateAllDocuments({
    jobDescription,
    baseResume,
    editPrompt,
    language,
    country,
    generateType
  });

  return result.resume || '';
};


// Function to generate content with model fallback
const generateWithFallback = async (prompt: string, _unused?: any, onModelChange?: (model: string) => void): Promise<string> => {
  let lastError: Error | null = null;
  const isLocal = isLocalEnvironment();
  const models = isLocal ? GITHUB_PROXY_MODELS : GEMINI_MODELS;
  const apiName = isLocal ? 'GitHub Proxy' : 'Gemini API';
  
  console.log(`🌍 Environment: ${isLocal ? 'LOCAL' : 'PRODUCTION'} - Using ${apiName}`);
  
  for (const model of models) {
    try {
      console.log(`🤖 Trying ${apiName} with model: ${model}`);
      if (onModelChange) {
        onModelChange(model);
      }

      const text = isLocal 
        ? await callGitHubProxy(prompt, model)
        : await callGeminiAPI(prompt, model);

      if (text && text.trim()) {
        console.log(`✅ Success with ${model}`);
        console.log(`📝 Generated content length: ${text.length} characters`);
        console.log(`📄 Content preview: ${text.substring(0, 200)}...`);
        return text;
      } else {
        console.warn(`⚠️ ${model} returned empty content, trying next model...`);
        lastError = new Error(`${model} returned empty response`);
      }
    } catch (error: any) {
      console.error(`❌ ${model} failed:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }
  
  throw lastError || new Error(`All ${apiName} models failed to generate content`);
};

// Helper function to extract and preserve key employment information
const extractEmploymentInfo = (baseResume: string): { companies: string[], positions: string[], dates: string[] } => {
  if (!baseResume) return { companies: [], positions: [], dates: [] };

  const lines = baseResume.split('\n').map(line => line.trim()).filter(line => line);
  const companies: string[] = [];
  const positions: string[] = [];
  const dates: string[] = [];

  lines.forEach(line => {
    // Better company extraction - look for patterns like "Company Name | Date" or "Position | Company Name | Date"
    // Match company names that appear between | separators or after position titles
    const pipePattern = line.match(/\|\s*([A-Za-z][A-Za-z\s&.,'-]+?)\s*\|/);
    if (pipePattern && pipePattern[1].length > 2 && !pipePattern[1].match(/\d{4}/)) {
      companies.push(pipePattern[1].trim());
    }

    // Alternative pattern: Position | Company | Date
    const positionCompanyPattern = line.match(/^([A-Za-z][A-Za-z\s]+?)\s*\|\s*([A-Za-z][A-Za-z\s&.,'-]+?)\s*\|\s*(\d{4})/);
    if (positionCompanyPattern) {
      positions.push(positionCompanyPattern[1].trim());
      companies.push(positionCompanyPattern[2].trim());
      dates.push(positionCompanyPattern[3]);
    }

    // Extract standalone company names (common patterns)
    const standaloneCompany = line.match(/^([A-Z][a-zA-Z\s&.,'-]{3,}?)(?:\s*-\s*|\s*\|\s*|\s*,\s*)(?:20\d{2}|19\d{2})/);
    if (standaloneCompany && standaloneCompany[1].length > 3) {
      companies.push(standaloneCompany[1].trim());
    }

    // Extract job titles (at the beginning of lines)
    const positionMatch = line.match(/^([A-Z][a-zA-Z\s]+?)(?:\s*\||@|at\s|-)/i);
    if (positionMatch && positionMatch[1].length > 3 && !positionMatch[1].match(/\d{4}/)) {
      positions.push(positionMatch[1].trim());
    }

    // Extract dates (various formats)
    const dateMatch = line.match(/(\d{4}(?:\s*[-–]\s*\d{4}|\s*[-–]\s*present|\s*[-–]\s*current))/i);
    if (dateMatch) {
      dates.push(dateMatch[1].trim());
    }
  });

  // Clean up extracted data
  const cleanCompanies = [...new Set(companies)]
    .filter(company => company.length > 2 && !company.match(/^\d+$/) && !company.toLowerCase().includes('present'))
    .map(company => company.replace(/\s+/g, ' ').trim());

  const cleanPositions = [...new Set(positions)]
    .filter(position => position.length > 3 && !position.match(/^\d+$/))
    .map(position => position.replace(/\s+/g, ' ').trim());

  const cleanDates = [...new Set(dates)]
    .filter(date => date.match(/\d{4}/));

  console.log('🔍 Extracted employment info:', {
    companies: cleanCompanies,
    positions: cleanPositions,
    dates: cleanDates
  });

  return {
    companies: cleanCompanies,
    positions: cleanPositions,
    dates: cleanDates
  };
};

// Helper function to validate language content
const validateLanguageContent = (content: string, expectedLanguage: string): { isValid: boolean, warnings: string[] } => {
  const warnings: string[] = [];

  // Basic language validation patterns
  const languagePatterns = {
    ja: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,  // Hiragana, Katakana, Kanji
    es: /[ñáéíóúü]/i,  // Spanish specific characters
    fr: /[àâäéèêëïîôöùûüÿç]/i,  // French specific characters
    de: /[äöüß]/i,  // German specific characters
    en: /^[a-zA-Z0-9\s\-.,;:!?()@#$%&*+=<>{}[\]"'\/\\|~`_^]+$/  // English characters
  };

  if (expectedLanguage !== 'en' && languagePatterns[expectedLanguage as keyof typeof languagePatterns]) {
    const pattern = languagePatterns[expectedLanguage as keyof typeof languagePatterns];
    if (!pattern.test(content)) {
      warnings.push(`Content may not be in ${expectedLanguage} - expected language-specific characters not found`);
    }
  }

  // Check for common English words in non-English content
  if (expectedLanguage !== 'en') {
    const commonEnglishWords = ['experience', 'skills', 'education', 'work', 'company', 'position', 'responsibilities'];
    const foundEnglishWords = commonEnglishWords.filter(word =>
      content.toLowerCase().includes(word.toLowerCase())
    );

    if (foundEnglishWords.length > 2) {
      warnings.push(`Content appears to contain English words: ${foundEnglishWords.join(', ')}`);
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

// Helper function to validate that generated resume preserves key employment information
const validateEmploymentPreservation = (originalResume: string, generatedResume: string): { isValid: boolean, warnings: string[] } => {
  if (!originalResume) return { isValid: true, warnings: [] };

  const originalInfo = extractEmploymentInfo(originalResume);
  const generatedInfo = extractEmploymentInfo(generatedResume);
  const warnings: string[] = [];

  // Check if major companies are preserved (more flexible matching)
  originalInfo.companies.forEach(company => {
    const companyWords = company.toLowerCase().split(/\s+/);
    const hasMainWords = companyWords.length > 1 ?
      companyWords.slice(0, 2).every(word => generatedResume.toLowerCase().includes(word)) :
      generatedResume.toLowerCase().includes(company.toLowerCase());

    if (!hasMainWords) {
      warnings.push(`Company "${company}" may have been removed or altered`);
    }
  });

  // Check if major positions are preserved (more flexible matching)
  originalInfo.positions.forEach(position => {
    const positionWords = position.toLowerCase().split(/\s+/);
    const hasMainWords = positionWords.length > 1 ?
      positionWords.slice(0, 2).every(word => generatedResume.toLowerCase().includes(word)) :
      generatedResume.toLowerCase().includes(position.toLowerCase());

    if (!hasMainWords) {
      warnings.push(`Position "${position}" may have been removed or altered`);
    }
  });

  // Check if employment dates are preserved (more flexible matching)
  originalInfo.dates.forEach(date => {
    const yearMatch = date.match(/\d{4}/g);
    if (yearMatch) {
      const hasYears = yearMatch.every(year => generatedResume.includes(year));
      if (!hasYears) {
        warnings.push(`Employment date "${date}" may have been removed or altered`);
      }
    }
  });

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

// Validate that resume content is not corrupted JSON or API response data
const isValidResumeContent = (content: string | undefined): boolean => {
  if (!content || content.trim().length < 50) return false;
  
  // Check if content looks like JSON (API request/response)
  const trimmed = content.trim();
  if (trimmed.startsWith('{') && (trimmed.includes('"model"') || trimmed.includes('"messages"') || trimmed.includes('"choices"'))) {
    console.warn('⚠️ Detected API JSON instead of resume content, will use BASE_RESUME');
    return false;
  }
  
  // Check if it looks like actual resume content (has name, contact info, or experience)
  const hasResumeContent = /[a-zA-Z]{2,}\s+[a-zA-Z]{2,}/.test(content) && // Has at least 2 words
    (content.includes('@') || // Has email
     content.includes('Experience') ||
     content.includes('EXPERIENCE') ||
     content.includes('Skills') ||
     content.includes('SKILLS') ||
     content.includes('Education') ||
     content.includes('EDUCATION'));
  
  return hasResumeContent;
};

export const generateAllDocuments = async ({
  jobDescription,
  baseResume,
  editPrompt,
  language = 'en',
  country = 'International',
  generateType = 'all',
  onModelChange
}: ResumeGenerationRequest): Promise<GenerationResult> => {
  try {
    // Validate baseResume content - use BASE_RESUME if invalid or corrupted
    const isBaseResumeValid = isValidResumeContent(baseResume);
    const effectiveResume = isBaseResumeValid ? baseResume! : BASE_RESUME;
    const isLocal = isLocalEnvironment();
    
    console.log('🌍 AI Service - Generating documents with language:', language, 'country:', country);
    console.log(`🤖 Environment: ${isLocal ? 'LOCAL (GitHub Proxy)' : 'PRODUCTION (Gemini API)'}`);
    console.log('📄 Base resume valid:', isBaseResumeValid);
    console.log('📄 Using', isBaseResumeValid ? 'provided resume' : 'hardcoded BASE_RESUME for ATS optimization');

    // Extract employment information to preserve authenticity
    const employmentInfo = extractEmploymentInfo(effectiveResume);
    console.log('📋 Extracted employment info:', employmentInfo);

    // Get language-specific formatting and cultural guidelines
    const getLanguageGuidelines = (lang: string, country: string) => {
      const guidelines = {
        en: {
          format: 'Standard international resume format - WRITE EVERYTHING IN ENGLISH',
          length: 'Keep to 1 page maximum for optimal impact',
          style: 'Professional, concise, achievement-focused - USE ENGLISH LANGUAGE THROUGHOUT',
          cultural: 'Emphasize individual achievements, quantified results, and career progression',
          sections: 'CONTACT INFO, PROFESSIONAL SUMMARY, KEY SKILLS, WORK EXPERIENCE, EDUCATION, CERTIFICATIONS',
          languageNote: 'CRITICAL: Write the ENTIRE resume in English. Use proper English business terminology and professional language.',
          example: 'Example format: John Smith\njohn@email.com\nPROFESSIONAL SUMMARY\nExperienced software developer with 5 years of expertise.\nKEY SKILLS\nProgramming Languages: Java, Python, JavaScript'
        },
        ja: {
          format: 'Japanese Rirekisho (履歴書) format adapted for IT professionals - WRITE EVERYTHING IN JAPANESE',
          length: 'Concise 1-page format respecting Japanese business culture',
          style: 'Formal, respectful, team-oriented achievements - USE JAPANESE LANGUAGE THROUGHOUT',
          cultural: 'Emphasize company loyalty, team collaboration, continuous learning, and respect for hierarchy',
          sections: '個人情報, 職歴要約, 技術スキル, 職歴, 学歴, 資格',
          languageNote: 'CRITICAL: Write the ENTIRE resume in Japanese (日本語). Use proper Japanese business terminology and honorific language (敬語).',
          example: 'Example format: 田中太郎\ntanaka@email.com\n職歴要約\nソフトウェア開発者として5年の経験があります。\n技術スキル\nプログラミング言語: Java, Python, JavaScript'
        },
        es: {
          format: 'Spanish CV format following European standards - WRITE EVERYTHING IN SPANISH',
          length: '1 page maximum, well-structured and detailed',
          style: 'Professional, educational background emphasis - USE SPANISH LANGUAGE THROUGHOUT',
          cultural: 'Highlight education, language skills, international experience, and cultural adaptability',
          sections: 'INFORMACIÓN PERSONAL, RESUMEN PROFESIONAL, COMPETENCIAS TÉCNICAS, EXPERIENCIA LABORAL, FORMACIÓN, IDIOMAS',
          languageNote: 'CRITICAL: Write the ENTIRE resume in Spanish (Español). Use proper Spanish business terminology and formal language.',
          example: 'Ejemplo de formato: Juan García\njuan@email.com\nRESUMEN PROFESIONAL\nDesarrollador de software con 5 años de experiencia.\nCOMPETENCIAS TÉCNICAS\nLenguajes de Programación: Java, Python, JavaScript'
        },
        fr: {
          format: 'French CV format following French professional standards - WRITE EVERYTHING IN FRENCH',
          length: '1 page maximum, elegant and structured',
          style: 'Sophisticated, education-focused, detailed - USE FRENCH LANGUAGE THROUGHOUT',
          cultural: 'Emphasize educational achievements, intellectual capabilities, and methodical approach',
          sections: 'INFORMATIONS PERSONNELLES, PROFIL PROFESSIONNEL, COMPÉTENCES TECHNIQUES, EXPÉRIENCE PROFESSIONNELLE, FORMATION, LANGUES',
          languageNote: 'CRITICAL: Write the ENTIRE resume in French (Français). Use proper French business terminology and formal language.',
          example: 'Exemple de format: Pierre Dupont\npierre@email.com\nPROFIL PROFESSIONNEL\nDéveloppeur logiciel avec 5 ans d\'expérience.\nCOMPÉTENCES TECHNIQUES\nLangages de Programmation: Java, Python, JavaScript'
        },
        de: {
          format: 'German Lebenslauf format for IT professionals - WRITE EVERYTHING IN GERMAN',
          length: '1 page maximum, comprehensive and detailed',
          style: 'Thorough, systematic, qualification-focused - USE GERMAN LANGUAGE THROUGHOUT',
          cultural: 'Emphasize qualifications, systematic approach, precision, and technical expertise',
          sections: 'PERSÖNLICHE DATEN, BERUFSPROFIL, TECHNISCHE FÄHIGKEITEN, BERUFSERFAHRUNG, AUSBILDUNG, ZERTIFIZIERUNGEN',
          languageNote: 'CRITICAL: Write the ENTIRE resume in German (Deutsch). Use proper German business terminology and formal language.',
          example: 'Beispiel Format: Hans Müller\nhans@email.com\nBERUFSPROFIL\nSoftwareentwickler mit 5 Jahren Erfahrung.\nTECHNISCHE FÄHIGKEITEN\nProgrammiersprachen: Java, Python, JavaScript'
        }
      };
      return guidelines[lang as keyof typeof guidelines] || guidelines.en;
    };

    const langGuidelines = getLanguageGuidelines(language, country);

    // Enhanced formatting instructions for PDF optimization
    const formatInstructions = `
**PDF FORMATTING:**
1. **Contact Info:** Name (FULL NAME), Email (email@domain.com - clickable), Phone (+country-code-number - clickable), LinkedIn (linkedin.com/in/username - clickable), GitHub (github.com/username - clickable), Website (portfolio-website.com - clickable). Each item on a separate line.
2. **Section Headers:** ALL CAPS (${langGuidelines.sections}).
3. **Tech Skills:** Group by category (Programming Languages, Frameworks, etc.). Format: "Category: Technology1, Technology2". Prioritize job-required skills.
4. **ATS Optimization:** Action verbs, quantified achievements ("improved performance by 30%"), bold keywords, bullet points (•).
5. **Professional Formatting:** Job titles ("Position | Company | Dates"), bullet points for achievements, concise descriptions, emphasize results.

**LANGUAGE & CULTURAL GUIDELINES:**
- **Format:** ${langGuidelines.format}
- **Length:** ${langGuidelines.length}
- **Style:** ${langGuidelines.style}
- **Cultural Focus:** ${langGuidelines.cultural}
- **Section Order:** ${langGuidelines.sections}
${langGuidelines.languageNote ? `- **LANGUAGE REQUIREMENT:** ${langGuidelines.languageNote}` : ''}
${langGuidelines.example ? `- **FORMAT EXAMPLE:** ${langGuidelines.example}` : ''}
`;

    let prompts: { [key: string]: string } = {};

    if (generateType === 'resume' || generateType === 'all') {
      if (editPrompt) {
        prompts.resume = `
You are an expert ATS resume writer. Create a FINAL, COMPLETE resume optimized for THIS JOB using the candidate's REAL work experience.

CURRENT RESUME: ${effectiveResume}
ENHANCEMENT REQUEST: ${editPrompt}
TARGET JOB: ${jobDescription}

**CRITICAL LANGUAGE REQUIREMENT:**
LANGUAGE: ${language.toUpperCase()} - Write the ENTIRE resume in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese (日本語)' : language === 'es' ? 'Spanish (Español)' : language === 'fr' ? 'French (Français)' : language === 'de' ? 'German (Deutsch)' : 'English'}
MARKET: ${country}

**MANDATORY:** Every single word, sentence, and section must be written in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'}. Do not mix languages.

**PRESERVE THESE EXACT DETAILS FROM ORIGINAL RESUME:**
${employmentInfo.companies.length > 0 ? `- Company Names: ${employmentInfo.companies.join(', ')}` : ''}
${employmentInfo.positions.length > 0 ? `- Job Titles: ${employmentInfo.positions.join(', ')}` : ''}
${employmentInfo.dates.length > 0 ? `- Employment Dates: ${employmentInfo.dates.join(', ')}` : ''}

${formatInstructions}

**CRITICAL REQUIREMENTS - PRESERVE AUTHENTICITY:**
- NEVER create fake companies, job titles, or employment dates
- NEVER invent fictional work experience or projects
- PRESERVE all existing company names, positions, and dates EXACTLY as provided
- ONLY enhance job descriptions, achievements, and bullet points to highlight relevant skills

**JOB MATCHING STRATEGY:**
- Analyze existing work experience and identify transferable skills that match job requirements
- Rewrite job descriptions to emphasize relevant technologies and achievements
- Highlight existing projects and responsibilities that align with target job
- Add specific metrics and quantified results where appropriate
- Incorporate job-specific keywords naturally into existing experience descriptions

**ENHANCEMENT APPROACH:**
- Focus on reframing existing responsibilities to match job requirements
- Emphasize relevant technical skills already demonstrated in past roles
- Quantify achievements with specific numbers and percentages where possible
- Use action verbs and industry-specific terminology from the job description

**FORBIDDEN:**
- NO creation of fake companies, positions, or employment history
- NO square brackets, conditional text, or placeholder text
- NO instructions to the user
- NO fictional projects or experiences

**OUTPUT:**
- Generate ONLY the complete resume content, starting with the candidate's name
- Maintain chronological accuracy of all employment information
- Ready to copy-paste and send to employers
- Focus on authentic experience enhanced for maximum job relevance

IMPORTANT: Enhance REAL experience only. Never create fictional work history.
        `;
      } else {
        prompts.resume = `
You are an expert resume writer. Create a FINAL, COMPLETE resume optimized for THIS JOB using the candidate's REAL work experience.

ORIGINAL RESUME: ${effectiveResume}
TARGET JOB: ${jobDescription}

**CRITICAL LANGUAGE REQUIREMENT:**
LANGUAGE: ${language.toUpperCase()} - Write the ENTIRE resume in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese (日本語)' : language === 'es' ? 'Spanish (Español)' : language === 'fr' ? 'French (Français)' : language === 'de' ? 'German (Deutsch)' : 'English'}
MARKET: ${country}

**MANDATORY:** Every single word, sentence, and section must be written in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'}. Do not mix languages.

**PRESERVE THESE EXACT DETAILS FROM ORIGINAL RESUME:**
${employmentInfo.companies.length > 0 ? `- Company Names: ${employmentInfo.companies.join(', ')}` : ''}
${employmentInfo.positions.length > 0 ? `- Job Titles: ${employmentInfo.positions.join(', ')}` : ''}
${employmentInfo.dates.length > 0 ? `- Employment Dates: ${employmentInfo.dates.join(', ')}` : ''}

${formatInstructions}

**CRITICAL REQUIREMENTS - PRESERVE AUTHENTICITY:**
- NEVER create fake companies, job titles, or employment dates
- NEVER invent fictional work experience or projects
- PRESERVE all existing company names, positions, and dates EXACTLY as provided
- ONLY enhance job descriptions, achievements, and bullet points to highlight relevant skills

**JOB-MATCHING STRATEGY:**
- Analyze the candidate's existing work experience for relevant skills and achievements
- Rewrite job descriptions to emphasize technologies and skills that match the target job
- Highlight transferable skills and relevant projects from actual work experience
- Add specific metrics and quantified results based on realistic achievements
- Incorporate job-specific keywords naturally into existing experience descriptions

**ENHANCEMENT EXAMPLES (using existing experience):**
- If candidate worked with databases → "Optimized database queries, improving performance by 40%"
- If candidate has web development experience → "Built responsive web applications serving 10K+ users"
- If candidate has project management experience → "Led cross-functional team of 8 developers, delivering projects 20% ahead of schedule"
- If candidate has technical support experience → "Resolved 95% of technical issues within SLA, maintaining 99.5% uptime"

**FORBIDDEN:**
- NO creation of fake companies, positions, or employment history
- NO square brackets, conditional text, or placeholder text
- NO instructions to the user
- NO fictional projects or experiences

**ENHANCEMENT APPROACH:**
- Reframe existing responsibilities to highlight job-relevant skills
- Add quantified achievements based on realistic performance metrics
- Incorporate job-specific terminology naturally into existing experience
- Emphasize transferable skills that match job requirements

**OUTPUT:**
- Generate ONLY the complete resume content, starting with the candidate's name
- Maintain authenticity of all employment information
- Ready to send to employers
- Focus on real experience optimized for maximum job relevance

IMPORTANT: Enhance REAL experience only. Never create fictional work history.
        `;
      }
    }

    // Cover Letter Generation
    if (generateType === 'cover-letter' || generateType === 'all') {
      prompts.coverLetter = `
CRITICAL: Create a complete cover letter with ZERO placeholder text.

You are an expert cover letter writer. Create a FINAL, COMPLETE cover letter to get the candidate shortlisted.

JOB: ${jobDescription}
CANDIDATE: ${effectiveResume}

**CRITICAL LANGUAGE REQUIREMENT:**
LANGUAGE: ${language.toUpperCase()} - Write the ENTIRE cover letter in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese (日本語)' : language === 'es' ? 'Spanish (Español)' : language === 'fr' ? 'French (Français)' : language === 'de' ? 'German (Deutsch)' : 'English'}
MARKET: ${country}

**MANDATORY:** Every single word, sentence, and section must be written in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'}. Do not mix languages.

**DATE REQUIREMENT:**
CRITICAL: Use today's actual date: ${new Date().toLocaleDateString(language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : language === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
DO NOT use any other date. DO NOT use 24.10.2023 or any hardcoded date.
The date should be formatted according to ${country} standards.

**REQUIREMENTS - NO PLACEHOLDERS:**
- Generate ONLY the final cover letter content.
- NEVER use square brackets, conditional text, or phrases like "Platform where job was advertised."
- Use generic professional language.
- Ready to copy-paste and send.
- Add job-specific keywords.

**STRUCTURE:**
1. Header: Realistic contact information.
2. Date: MUST use today's date: ${new Date().toLocaleDateString(language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : language === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} (NOT 24.10.2023).
3. Salutation: "Dear Hiring Manager."
4. Opening: Express interest in "this position."
5. Body: Highlight relevant experience.
6. Closing: Professional call to action.

**LANGUAGE:**
- Instead of "[Company Name]," use "your organization."
- Instead of "[Position Title]," use "this position."
- Start with "I am writing to express my interest..."
- Use actual company names from the resume.

**FORBIDDEN PHRASES:**
- "Platform where job was advertised"
- "REMOVE THIS LINE"
- "omitted as requested"
- "24.10.2023" or any hardcoded dates
- Any text in square brackets or conditional statements.

**OPENING:**
- NEVER mention where you found the job.
- Start with: "I am writing to express my keen interest..."

**EXAMPLE OPENING:**
"Dear Hiring Manager, I am writing to express my keen interest in this opportunity. My background in [relevant field] aligns perfectly with your needs."

**OUTPUT:**
- Generate ONLY the complete cover letter content, starting with the header.
- Ready to send without edits.
- Use a professional, confident tone.
- Include specific achievements.

IMPORTANT: Create a complete cover letter with NO placeholder text. Use generic professional language.
      `;
    }

    // Email Template Generation
    if (generateType === 'email' || generateType === 'all') {
      prompts.email = `
CRITICAL: Create a complete email with ZERO placeholder text. Never mention where the job was found.

You are an expert at writing job application emails. Create a FINAL, COMPLETE email to get the candidate noticed.

JOB: ${jobDescription}
CANDIDATE: ${effectiveResume}

**CRITICAL LANGUAGE REQUIREMENT:**
LANGUAGE: ${language.toUpperCase()} - Write the ENTIRE email in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese (日本語)' : language === 'es' ? 'Spanish (Español)' : language === 'fr' ? 'French (Français)' : language === 'de' ? 'German (Deutsch)' : 'English'}
MARKET: ${country}

**MANDATORY:** Every single word, sentence, and section must be written in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'}. Do not mix languages.

**REQUIREMENTS - NO PLACEHOLDERS:**
- Generate ONLY the final email content.
- NEVER use square brackets, conditional text, or phrases like "Platform where job was advertised."
- Use generic professional language.
- Ready to copy-paste and send.
- Add job-specific keywords.

**EMAIL STRUCTURE:**
1. Subject: "Application for [Role] Position" (use actual role from job description).
2. Greeting: "Dear Hiring Manager."
3. Opening: Express interest in "this position."
4. Body: Highlight relevant experience.
5. Closing: Professional sign-off with contact information.

**LANGUAGE:**
- Instead of "[Company Name]," use "your organization."
- Instead of "[Position Title]," use "this position."
- Start with "I am writing to express my interest..."
- Use actual technologies and skills from the job description.

**FORBIDDEN PHRASES:**
- "Platform where job was advertised"
- "REMOVE THIS LINE"
- "omitted as requested"
- Any text in square brackets or conditional statements.

**EMAIL OPENING:**
- NEVER mention where you found the job.
- Start subject with: "Application for [Role] Position."
- Start body with: "Dear Hiring Manager, I am writing to express my interest..."

**EXAMPLE OPENING:**
"Subject: Application for Software Developer Position

Dear Hiring Manager, I am writing to express my interest in this opportunity. With my background in software development, I believe I would be a valuable addition."

**CONTENT:**
- Keep the email body to 3-4 short paragraphs.
- Highlight 1-2 key achievements.
- Show enthusiasm.
- Mention attachments (resume and cover letter).
- Include a clear call to action.

**OUTPUT:**
- Generate ONLY the complete email content, starting with the subject line.
- Ready to send without edits.
- Use a professional, confident tone.
- Include specific qualifications.

IMPORTANT: Create a complete email with NO placeholder text. Use generic professional language.
      `;
    }

    const result: GenerationResult = {};

    // Generate each requested document with model fallback
    for (const [type, prompt] of Object.entries(prompts)) {
      try {
        console.log(`📝 Generating ${type}...`);

        let content = await generateWithFallback(prompt, null, (modelName) => {
          console.log(`🔄 Using model ${modelName} for ${type}`);
          if (onModelChange) {
            onModelChange(modelName, type);
          }
        });

        // Validate language content
        const languageValidation = validateLanguageContent(content, language);
        if (!languageValidation.isValid && language !== 'en') {
          console.warn(`⚠️ Language validation failed for ${type}:`, languageValidation.warnings);
          console.log(`🔄 Attempting to regenerate ${type} with more explicit language instructions...`);

          // Try once more with a very explicit language prompt
          const explicitPrompt = `CRITICAL: You MUST write EVERYTHING in ${language === 'ja' ? 'Japanese (日本語)' : language === 'es' ? 'Spanish (Español)' : language === 'fr' ? 'French (Français)' : language === 'de' ? 'German (Deutsch)' : 'English'}.

DO NOT use any English words except for technical terms that have no translation.

${prompt}

REMINDER: Write the entire response in ${language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'} language only.`;

          try {
            const retryContent = await generateWithFallback(explicitPrompt, null, (modelName) => {
              console.log(`🔄 Retry using model ${modelName} for ${type} with explicit language prompt`);
              if (onModelChange) {
                onModelChange(modelName, type);
              }
            });

            if (retryContent && retryContent.trim()) {
              console.log(`✅ Successfully regenerated ${type} with explicit language prompt`);
              content = retryContent;
            }
          } catch (retryError) {
            console.warn(`⚠️ Retry failed for ${type}, using original content:`, retryError);
          }
        } else {
          console.log(`✅ Language validation passed for ${type} in ${language}`);
        }

        if (type === 'resume') {
          result.resume = content;

          // Always validate employment information preservation
          const validation = validateEmploymentPreservation(effectiveResume, content);
          if (!validation.isValid) {
            console.warn('⚠️ Employment preservation warnings:', validation.warnings);
            // Log warnings but don't fail the generation
            validation.warnings.forEach(warning => console.warn(`   - ${warning}`));
          } else {
            console.log('✅ Employment information preserved successfully');
          }
        } else if (type === 'coverLetter') {
          result.coverLetter = content;
        } else if (type === 'email') {
          result.email = content;
        }

        console.log(`✅ Successfully generated ${type}`);
      } catch (error) {
        console.error(`❌ Error generating ${type}:`, error);
        throw new Error(`Failed to generate ${type}. ${error instanceof Error ? error.message : 'Please check your API key and try again.'}`);
      }
    }

    return result;
  } catch (error) {
    console.error('Error generating documents with AI:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('AI service configuration error. Please check your API key.');
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error('AI service quota exceeded. Please try again later.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
    }

    throw new Error('Failed to generate documents with AI. Please try again.');
  }
};

// Legacy function for backward compatibility
export const generateResumeOnly = async (params: ResumeGenerationRequest): Promise<string> => {
  const result = await generateAllDocuments({ ...params, generateType: 'resume' });
  return result.resume || '';
};

export const validateApiKey = async (): Promise<boolean> => {
  const isLocal = isLocalEnvironment();
  
  try {
    if (isLocal) {
      // Test GitHub Enterprise Proxy connection with a simple request
      const response = await fetch(LOCAL_BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        }),
      });
      
      if (response.ok) {
        console.log('✅ GitHub Enterprise Proxy validated successfully');
        return true;
      }
      
      console.warn('⚠️ GitHub Enterprise Proxy validation failed:', response.status);
      return false;
    } else {
      // Test Gemini API connection
      const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }],
          generationConfig: { maxOutputTokens: 10 }
        }),
      });
      
      if (response.ok) {
        console.log('✅ Gemini API validated successfully');
        return true;
      }
      
      console.warn('⚠️ Gemini API validation failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API validation error:', error);
    return false;
  }
};
