import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserEnvVarAsync } from './env';

// Initialize the Gemini AI client
const getGeminiClient = async () => {
  const apiKey = await getUserEnvVarAsync('VITE_GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not configured. Please add your Gemini API key to the environment variables.');
  }
  
  return new GoogleGenerativeAI(apiKey);
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


// Available Gemini models in order of preference
const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro",
  "gemini-1.0-pro"
];

// Function to try multiple models with fallback
const generateWithFallback = async (prompt: string, genAI: any, onModelChange?: (model: string) => void): Promise<string> => {
  let lastError: any = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`🤖 Trying model: ${modelName}`);
      if (onModelChange) {
        onModelChange(modelName);
      }

      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text && text.trim()) {
        console.log(`✅ Success with model: ${modelName}`);
        return text;
      }
    } catch (error: any) {
      console.warn(`❌ Model ${modelName} failed:`, error.message);
      lastError = error;

      // If it's a 503 (overloaded) error, try next model
      if (error.message?.includes('503') || error.message?.includes('overloaded') || error.message?.includes('UNAVAILABLE')) {
        console.log(`🔄 Model ${modelName} is overloaded, trying next model...`);
        continue;
      }

      // For other errors, also try next model but log differently
      console.log(`⚠️ Model ${modelName} error, trying next model...`);
    }
  }

  // If all models failed, throw the last error
  throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}`);
};

// Helper function to extract and preserve key employment information
const extractEmploymentInfo = (baseResume: string): { companies: string[], positions: string[], dates: string[] } => {
  if (!baseResume) return { companies: [], positions: [], dates: [] };

  const lines = baseResume.split('\n').map(line => line.trim()).filter(line => line);
  const companies: string[] = [];
  const positions: string[] = [];
  const dates: string[] = [];

  lines.forEach(line => {
    // Extract company names (often appear with | separator or after position titles)
    const companyMatch = line.match(/(?:at\s+|@\s+)([A-Z][a-zA-Z\s&.,'-]+?)(?:\s*\||$|,|\s*\d{4})/i);
    if (companyMatch && companyMatch[1].length > 2) {
      companies.push(companyMatch[1].trim());
    }

    // Extract job titles (often at the beginning of lines or before company names)
    const positionMatch = line.match(/^([A-Z][a-zA-Z\s]+?)(?:\s*\||@|at\s)/i);
    if (positionMatch && positionMatch[1].length > 3) {
      positions.push(positionMatch[1].trim());
    }

    // Extract dates (various formats)
    const dateMatch = line.match(/(\d{4}(?:\s*-\s*\d{4}|\s*-\s*present|\s*-\s*current))/i);
    if (dateMatch) {
      dates.push(dateMatch[1].trim());
    }
  });

  return { companies: [...new Set(companies)], positions: [...new Set(positions)], dates: [...new Set(dates)] };
};

// Helper function to validate that generated resume preserves key employment information
const validateEmploymentPreservation = (originalResume: string, generatedResume: string): { isValid: boolean, warnings: string[] } => {
  if (!originalResume) return { isValid: true, warnings: [] };

  const originalInfo = extractEmploymentInfo(originalResume);
  const generatedInfo = extractEmploymentInfo(generatedResume);
  const warnings: string[] = [];

  // Check if major companies are preserved
  originalInfo.companies.forEach(company => {
    if (!generatedResume.toLowerCase().includes(company.toLowerCase())) {
      warnings.push(`Company "${company}" may have been removed or altered`);
    }
  });

  // Check if major positions are preserved
  originalInfo.positions.forEach(position => {
    if (!generatedResume.toLowerCase().includes(position.toLowerCase())) {
      warnings.push(`Position "${position}" may have been removed or altered`);
    }
  });

  // Check if employment dates are preserved
  originalInfo.dates.forEach(date => {
    if (!generatedResume.includes(date)) {
      warnings.push(`Employment date "${date}" may have been removed or altered`);
    }
  });

  return {
    isValid: warnings.length === 0,
    warnings
  };
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
    console.log('🌍 AI Service - Generating documents with language:', language, 'country:', country);

    // Extract employment information to preserve authenticity
    const employmentInfo = extractEmploymentInfo(baseResume || '');
    console.log('📋 Extracted employment info:', employmentInfo);

    const genAI = await getGeminiClient();

    // Get language-specific formatting and cultural guidelines
    const getLanguageGuidelines = (lang: string, country: string) => {
      const guidelines = {
        en: {
          format: 'Standard international resume format',
          length: 'Keep to 1 page maximum for optimal impact',
          style: 'Professional, concise, achievement-focused',
          cultural: 'Emphasize individual achievements, quantified results, and career progression',
          sections: 'CONTACT INFO, PROFESSIONAL SUMMARY, KEY SKILLS, WORK EXPERIENCE, EDUCATION, CERTIFICATIONS'
        },
        ja: {
          format: 'Japanese Rirekisho (履歴書) format adapted for IT professionals',
          length: 'Concise 1-page format respecting Japanese business culture',
          style: 'Formal, respectful, team-oriented achievements',
          cultural: 'Emphasize company loyalty, team collaboration, continuous learning, and respect for hierarchy',
          sections: '個人情報 (Personal Info), 職歴要約 (Career Summary), 技術スキル (Technical Skills), 職歴 (Work Experience), 学歴 (Education), 資格 (Certifications)'
        },
        es: {
          format: 'Spanish CV format following European standards',
          length: '1 page maximum, well-structured and detailed',
          style: 'Professional, educational background emphasis',
          cultural: 'Highlight education, language skills, international experience, and cultural adaptability',
          sections: 'INFORMACIÓN PERSONAL, RESUMEN PROFESIONAL, COMPETENCIAS TÉCNICAS, EXPERIENCIA LABORAL, FORMACIÓN, IDIOMAS'
        },
        fr: {
          format: 'French CV format following French professional standards',
          length: '1 page maximum, elegant and structured',
          style: 'Sophisticated, education-focused, detailed',
          cultural: 'Emphasize educational achievements, intellectual capabilities, and methodical approach',
          sections: 'INFORMATIONS PERSONNELLES, PROFIL PROFESSIONNEL, COMPÉTENCES TECHNIQUES, EXPÉRIENCE PROFESSIONNELLE, FORMATION, LANGUES'
        },
        de: {
          format: 'German Lebenslauf format for IT professionals',
          length: '1 page maximum, comprehensive and detailed',
          style: 'Thorough, systematic, qualification-focused',
          cultural: 'Emphasize qualifications, systematic approach, precision, and technical expertise',
          sections: 'PERSÖNLICHE DATEN, BERUFSPROFIL, TECHNISCHE FÄHIGKEITEN, BERUFSERFAHRUNG, AUSBILDUNG, ZERTIFIZIERUNGEN'
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
`;

    let prompts: { [key: string]: string } = {};

    if (generateType === 'resume' || generateType === 'all') {
      if (editPrompt && baseResume) {
        prompts.resume = `
You are an expert ATS resume writer. Create a FINAL, COMPLETE resume optimized for THIS JOB using the candidate's REAL work experience.

CURRENT RESUME: ${baseResume}
ENHANCEMENT REQUEST: ${editPrompt}
TARGET JOB: ${jobDescription}
LANGUAGE: ${language.toUpperCase()} (Write the entire resume in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'})
MARKET: ${country}

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
      } else if (baseResume) {
        prompts.resume = `
You are an expert resume writer. Create a FINAL, COMPLETE resume optimized for THIS JOB using the candidate's REAL work experience.

ORIGINAL RESUME: ${baseResume}
TARGET JOB: ${jobDescription}
LANGUAGE: ${language.toUpperCase()} (Write the entire resume in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'})
MARKET: ${country}

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
      } else {
        prompts.resume = `
You are an expert resume writer. Create a PROFESSIONAL RESUME TEMPLATE optimized for THIS JOB.

NOTE: Since no base resume was provided, this will be a template that the user should customize with their real information.

TARGET JOB: ${jobDescription}
LANGUAGE: ${language.toUpperCase()} (Write the entire resume in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'})
MARKET: ${country}

${formatInstructions}

**TEMPLATE CREATION GUIDELINES:**
- Create a professional template with realistic example content
- Include ALL required technologies and skills from the job description
- Show examples of relevant projects and achievements
- Use professional formatting and structure
- Include placeholder sections for education, skills, and experience

**TEMPLATE STRUCTURE:**
- Professional name placeholder (e.g., "Your Name")
- Contact information template
- Professional summary highlighting job-relevant skills
- Skills section matching job requirements
- Experience section with relevant role examples
- Education section template
- Additional sections as needed (certifications, projects)

**CONTENT APPROACH:**
- Focus on skills and technologies mentioned in the job description
- Provide examples of how to describe relevant experience
- Include quantified achievement examples
- Use industry-appropriate terminology
- Structure content for ATS optimization

**FORBIDDEN:**
- NO square brackets, conditional text, or placeholder text in final output
- NO instructions to the user within the resume content
- NO obviously fake company names or unrealistic claims

**OUTPUT:**
- Generate ONLY the complete resume template content
- Professional formatting ready for customization
- Optimized for the target job requirements
- Include realistic examples that users can adapt

IMPORTANT: Create a professional template that users can customize with their real information.
        `;
      }
    }

    // Cover Letter Generation
    if (generateType === 'cover-letter' || generateType === 'all') {
      prompts.coverLetter = `
CRITICAL: Create a complete cover letter with ZERO placeholder text.

You are an expert cover letter writer. Create a FINAL, COMPLETE cover letter to get the candidate shortlisted.

JOB: ${jobDescription}
${baseResume ? `CANDIDATE: ${baseResume}` : ''}
LANGUAGE: ${language.toUpperCase()} (Write the entire cover letter in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'})
MARKET: ${country}

**REQUIREMENTS - NO PLACEHOLDERS:**
- Generate ONLY the final cover letter content.
- NEVER use square brackets, conditional text, or phrases like "Platform where job was advertised."
- Use generic professional language.
- Ready to copy-paste and send.
- Add job-specific keywords.

**STRUCTURE:**
1. Header: Realistic contact information.
2. Date: Current date.
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
${baseResume ? `CANDIDATE: ${baseResume}` : ''}
LANGUAGE: ${language.toUpperCase()} (Write the entire email in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'})
MARKET: ${country}

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

        const content = await generateWithFallback(prompt, genAI, (modelName) => {
          console.log(`🔄 Using model ${modelName} for ${type}`);
          if (onModelChange) {
            onModelChange(modelName, type);
          }
        });

        if (type === 'resume') {
          result.resume = content;

          // Validate employment information preservation if base resume exists
          if (baseResume) {
            const validation = validateEmploymentPreservation(baseResume, content);
            if (!validation.isValid) {
              console.warn('⚠️ Employment preservation warnings:', validation.warnings);
              // Log warnings but don't fail the generation
              validation.warnings.forEach(warning => console.warn(`   - ${warning}`));
            } else {
              console.log('✅ Employment information preserved successfully');
            }
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
  try {
    const genAI = await getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Test with a simple prompt
    const result = await model.generateContent("Hello");
    const response = result.response;
    const text = response.text();
    
    return text && text.length > 0;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
};
