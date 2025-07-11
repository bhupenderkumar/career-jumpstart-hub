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
You are an expert ATS resume writer. Create a FINAL, COMPLETE resume optimized for THIS JOB.

CURRENT RESUME: ${baseResume}
ENHANCEMENT REQUEST: ${editPrompt}
TARGET JOB: ${jobDescription}
LANGUAGE: ${language.toUpperCase()} (Write the entire resume in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'})
MARKET: ${country}

${formatInstructions}

**JOB MATCHING:**
- Add realistic fake projects/experience matching job requirements.
- If job mentions "Solana," add 1-2 Solana projects.
- If job mentions "React," add React projects.
- If job mentions "AWS," add AWS projects.
- If job mentions "Python," add Python projects.
- KEEP existing company names; MODIFY project descriptions to match job.
- Add realistic metrics and keywords.

**FORBIDDEN:**
- NO square brackets, conditional text, or placeholder text.
- NO instructions to the user.

**PROJECT RULES:**
- Modify existing projects to include job-required technologies.
- Add new realistic projects matching job requirements.
- Use specific technical details and quantified results.

**OUTPUT:**
- Generate ONLY the complete resume content, starting with the candidate's name.
- Ready to copy-paste and send.
- Include impressive achievements matching job requirements.

IMPORTANT: Create realistic fake experience. No placeholder text.
        `;
      } else if (baseResume) {
        prompts.resume = `
You are an expert resume writer. Create a FINAL, COMPLETE resume optimized for THIS JOB.

ORIGINAL RESUME: ${baseResume}
TARGET JOB: ${jobDescription}
LANGUAGE: ${language.toUpperCase()} (Write the entire resume in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'})
MARKET: ${country}

${formatInstructions}

**JOB-MATCHING:**
- Add realistic fake projects/experience matching the job EXACTLY.
- If job mentions technologies (Solana, React, AWS, Python), add 1-2 projects using them.
- KEEP existing company names; MODIFY project descriptions.
- Add realistic metrics ("improved performance by 35%").
- Add job-specific keywords.

**TECHNOLOGY EXAMPLES:**
- Solana → "Developed DeFi protocol on Solana, handling 10K+ daily transactions."
- React/TypeScript → "Built React application with TypeScript, serving 50K+ users."
- AWS/Docker → "Deployed microservices on AWS using Docker, reducing costs by 40%."
- Python/ML → "Implemented Python ML pipeline, improving prediction accuracy by 25%."

**FORBIDDEN:**
- NO square brackets, conditional text, or placeholder text.
- NO instructions to the user.

**ENHANCEMENT:**
- Add job-required technologies to existing projects.
- Create 1-2 new projects matching job requirements.
- Use specific technical terms and quantified business impact.

**OUTPUT:**
- Generate ONLY the complete resume content, starting with the candidate's name.
- Ready to send to employers.
- Ensure maximum relevance and impressive achievements.

IMPORTANT: Add realistic fake experience. No placeholder text.
        `;
      } else {
        prompts.resume = `
You are an expert resume writer. Create a FINAL, COMPLETE, PROFESSIONAL resume optimized for THIS JOB.

TARGET JOB: ${jobDescription}
LANGUAGE: ${language.toUpperCase()} (Write the entire resume in ${language === 'en' ? 'English' : language === 'ja' ? 'Japanese' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'})
MARKET: ${country}

${formatInstructions}

**JOB-MATCHING:**
- Create a realistic professional (3-5 years experience) matching the job PERFECTLY.
- Include ALL required technologies and skills.
- Create 2-3 realistic projects using job technologies.
- Add realistic company names and achievements.
- Add job-specific keywords.

**TECHNOLOGY EXAMPLES:**
- Solana → "Developed DeFi lending protocol on Solana, processing $2M+ in transactions."
- React/Node.js → "Built full-stack e-commerce platform using React and Node.js, serving 25K+ users."
- AWS/Kubernetes → "Deployed scalable microservices on AWS with Kubernetes, reducing infrastructure costs by 45%."
- Python/Machine Learning → "Implemented ML recommendation system in Python, improving user engagement by 30%."

**PROFILE CREATION:**
- Believable name ("Alex Johnson").
- Realistic contact info: Email (clickable), Phone (clickable), LinkedIn (clickable), GitHub (clickable).
- 2-3 previous companies with realistic project descriptions.
- Education matching the role.
- Relevant certifications.

**FORBIDDEN:**
- NO square brackets, conditional text, or placeholder text.
- NO instructions to the user.

**ACHIEVEMENT EXAMPLES:**
- "Increased application performance by 60%."
- "Led team of 4 developers to deliver project 2 weeks early."
- "Reduced deployment time from 2 hours to 15 minutes."
- "Improved user retention by 40%."

**OUTPUT:**
- Generate ONLY the complete resume content, starting with a realistic candidate name.
- Ready to send to employers.
- Ensure perfect match with job requirements.
- Include realistic and impressive achievements.

IMPORTANT: Create a complete, realistic professional profile. No placeholder text.
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
