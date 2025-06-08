import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserEnvVar } from './env';

// Initialize the Gemini AI client
const getGeminiClient = () => {
  const apiKey = getUserEnvVar('VITE_GEMINI_API_KEY');
  
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


export const generateAllDocuments = async ({
  jobDescription,
  baseResume,
  editPrompt,
  language = 'en',
  country = 'International',
  generateType = 'all'
}: ResumeGenerationRequest): Promise<GenerationResult> => {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
**CRITICAL PDF FORMATTING REQUIREMENTS:**

1. **CONTACT INFORMATION FORMAT:**
   - Name: Use FULL NAME in normal case (not all caps)
   - Email: Use format "email@domain.com" (will be clickable mailto link)
   - Phone: Use format "+country-code-number" (will be clickable tel link)
   - LinkedIn: Use format "https://linkedin.com/in/username" (will be clickable link)
   - GitHub: Use format "https://github.com/username" (will be clickable link)
   - Website: Use format "https://portfolio-website.com" (will be clickable link)
   - Each contact item on separate line for icon placement and clickability

2. **SECTION HEADERS:**
   - Use ALL CAPS for section headers: PROFESSIONAL SUMMARY, KEY SKILLS, WORK EXPERIENCE, EDUCATION
   - Keep section headers short and standard

3. **TECHNOLOGY HIGHLIGHTING:**
   - Create separate "TECHNICAL SKILLS" section
   - Group by categories: Programming Languages, Frameworks, Databases, Cloud Platforms
   - Use format: "Category: Technology1, Technology2, Technology3"
   - Prioritize job-required technologies first

4. **ATS OPTIMIZATION:**
   - Use action verbs: developed, implemented, managed, led, built, designed, optimized
   - Include quantified achievements: "improved performance by 30%", "managed team of 5"
   - Bold important keywords naturally in context
   - Use bullet points (•) for achievements

5. **PROFESSIONAL FORMATTING:**
   - Job titles format: "Position Title | Company Name | Dates"
   - Use bullet points for achievements
   - Keep descriptions concise but impactful
   - Emphasize results and metrics
`;

    let prompts: { [key: string]: string } = {};

    if (generateType === 'resume' || generateType === 'all') {
      if (editPrompt && baseResume) {
        prompts.resume = `
You are an expert ATS-optimized resume writer. Create a FINAL, COMPLETE, READY-TO-SEND resume that will get the candidate shortlisted for THIS SPECIFIC JOB.

CURRENT RESUME:
${baseResume}

ENHANCEMENT REQUEST:
${editPrompt}

TARGET JOB DESCRIPTION:
${jobDescription}

${formatInstructions}

**CRITICAL REQUIREMENTS FOR JOB MATCHING:**
- Analyze the job description and ADD realistic fake projects/experience that match the requirements
- If job mentions "Solana" - add 1-2 Solana blockchain projects with realistic details
- If job mentions "React" - add React projects with specific features
- If job mentions "AWS" - add AWS cloud projects with specific services used
- If job mentions "Python" - add Python automation/data projects
- KEEP existing company names but MODIFY project descriptions to match job requirements
- Add realistic metrics and achievements for new projects (e.g., "improved performance by 40%", "reduced costs by $50K")

**ABSOLUTELY FORBIDDEN:**
- NO square brackets like [Company Name] or [Add details]
- NO conditional text like "if known, otherwise omit"
- NO placeholder text of any kind
- NO instructions or suggestions to the user
- NO text like "Platform where job was advertised"

**PROJECT ENHANCEMENT RULES:**
- Take existing projects and modify them to include job-required technologies
- Add new realistic projects that directly match job requirements
- Use specific technical details from the job description
- Include quantified results and business impact
- Make every project sound relevant to the target role

**FINAL OUTPUT REQUIREMENTS:**
- Generate ONLY the complete resume content
- Start directly with the candidate's name
- Make it immediately ready to copy-paste and send
- Ensure every line helps get THIS specific job
- Include realistic but impressive achievements that match job requirements

IMPORTANT: Create realistic fake experience that matches the job requirements. Do not use any placeholder text or conditional statements.
        `;
      } else if (baseResume) {
        prompts.resume = `
You are an expert international resume writer. Create a FINAL, COMPLETE, READY-TO-SEND resume that will get the candidate shortlisted for THIS SPECIFIC JOB.

ORIGINAL RESUME:
${baseResume}

TARGET JOB DESCRIPTION:
${jobDescription}

TARGET MARKET: ${country} (${language.toUpperCase()})

${formatInstructions}

**CRITICAL JOB-MATCHING REQUIREMENTS:**
- Analyze the job description and ADD realistic fake projects/experience that match EXACTLY what they're looking for
- If job mentions specific technologies (Solana, React, AWS, Python, etc.) - add 1-2 realistic projects using those technologies
- KEEP existing company names but MODIFY project descriptions to include job-required technologies
- Add realistic metrics: "improved performance by 35%", "reduced deployment time by 60%", "managed $200K budget"
- Make existing experience sound more relevant by adding job-required technologies to project descriptions

**TECHNOLOGY ENHANCEMENT EXAMPLES:**
- Job wants "Solana blockchain" → Add: "Developed DeFi protocol on Solana blockchain, handling 10K+ daily transactions"
- Job wants "React/TypeScript" → Add: "Built responsive React application with TypeScript, serving 50K+ users"
- Job wants "AWS/Docker" → Add: "Deployed microservices on AWS using Docker containers, reducing costs by 40%"
- Job wants "Python/ML" → Add: "Implemented Python-based ML pipeline, improving prediction accuracy by 25%"

**ABSOLUTELY FORBIDDEN:**
- NO square brackets like [Company Name] or [Platform where job was advertised]
- NO conditional text like "if known, otherwise omit"
- NO placeholder text of any kind
- NO instructions or suggestions to the user

**ENHANCEMENT STRATEGY:**
- Take existing projects and add job-required technologies to them
- Create 1-2 new realistic projects that directly match job requirements
- Use specific technical terms from the job description
- Add quantified business impact for all projects
- Make every bullet point relevant to the target role

**FINAL OUTPUT:**
- Generate ONLY the complete resume content
- Start directly with the candidate's name
- Make it immediately ready to send to employers
- Ensure maximum relevance to THIS specific job
- Include realistic but impressive achievements

IMPORTANT: Add realistic fake experience that matches job requirements. Never use placeholder text or conditional statements.
        `;
      } else {
        prompts.resume = `
You are an expert resume writer. Create a FINAL, COMPLETE, PROFESSIONAL resume that will get the candidate shortlisted for THIS SPECIFIC JOB.

TARGET JOB DESCRIPTION:
${jobDescription}

TARGET MARKET: ${country} (${language.toUpperCase()})

${formatInstructions}

**CRITICAL JOB-MATCHING REQUIREMENTS:**
- Create a realistic professional with 3-5 years experience that PERFECTLY matches the job requirements
- Analyze job description and include ALL required technologies and skills
- Create 2-3 realistic projects that directly use the technologies mentioned in the job
- Add realistic company names and quantified achievements

**TECHNOLOGY MATCHING EXAMPLES:**
- Job wants "Solana blockchain" → Create: "Developed DeFi lending protocol on Solana, processing $2M+ in transactions"
- Job wants "React/Node.js" → Create: "Built full-stack e-commerce platform using React and Node.js, serving 25K+ users"
- Job wants "AWS/Kubernetes" → Create: "Deployed scalable microservices on AWS with Kubernetes, reducing infrastructure costs by 45%"
- Job wants "Python/Machine Learning" → Create: "Implemented ML recommendation system in Python, improving user engagement by 30%"

**REALISTIC PROFILE CREATION:**
- Create believable name: "Alex Johnson" or "Sarah Chen"
- Add realistic contact info with proper formatting:
  * Email: "alex.johnson@email.com" (clickable mailto)
  * Phone: "+1-555-123-4567" (clickable tel)
  * LinkedIn: "https://linkedin.com/in/alexjohnson" (clickable link)
  * GitHub: "https://github.com/alexjohnson" (clickable link)
- Create 2-3 previous companies with realistic project descriptions
- Include education that matches the role requirements
- Add certifications relevant to the job

**ABSOLUTELY FORBIDDEN:**
- NO square brackets like [Your Name] or [Company Name]
- NO conditional text like "if applicable, otherwise omit"
- NO placeholder text of any kind
- NO instructions or suggestions to the user

**ACHIEVEMENT EXAMPLES:**
- "Increased application performance by 60% through code optimization"
- "Led team of 4 developers to deliver project 2 weeks ahead of schedule"
- "Reduced deployment time from 2 hours to 15 minutes using CI/CD pipelines"
- "Improved user retention by 40% through UX enhancements"

**FINAL OUTPUT:**
- Generate ONLY the complete resume content
- Start directly with a realistic candidate name
- Make it immediately ready to send to employers
- Ensure perfect match with job requirements
- Include realistic but impressive achievements

IMPORTANT: Create a complete, realistic professional profile that matches the job perfectly. Never use placeholder text.
        `;
      }
    }

    // Cover Letter Generation
    if (generateType === 'cover-letter' || generateType === 'all') {
      prompts.coverLetter = `
CRITICAL INSTRUCTION: You must create a complete cover letter with ZERO placeholder text. Do NOT include any phrases like "Platform where job was advertised", "REMOVE THIS LINE", "omitted as requested", or any text in square brackets.

You are an expert cover letter writer. Create a FINAL, COMPLETE, READY-TO-SEND cover letter that will help get the candidate shortlisted.

JOB DESCRIPTION:
${jobDescription}

${baseResume ? `CANDIDATE BACKGROUND:\n${baseResume}` : ''}

TARGET MARKET: ${country}

**CRITICAL REQUIREMENTS - NO PLACEHOLDER TEXT:**
- Generate ONLY the final, complete cover letter content
- NEVER use square brackets like [Company Name] or [Platform where job was advertised]
- NEVER use conditional text like "if known, otherwise omit this line"
- NEVER mention "Platform where job was advertised" or similar phrases
- Use generic professional language that works for any company
- Make it immediately ready to copy-paste and send to employers

**CONTENT STRUCTURE:**
1. **Header**: Use realistic contact information from resume or create professional details
2. **Date**: Use current date format
3. **Salutation**: Always use "Dear Hiring Manager"
4. **Opening**: Express interest in "the position" or "this role" (never use placeholders)
5. **Body**: Highlight relevant experience that matches job requirements
6. **Closing**: Professional call to action and sign-off

**LANGUAGE RULES:**
- Instead of "[Company Name]" → use "your organization" or "your company"
- Instead of "[Position Title]" → use "this position" or "the role"
- Instead of mentioning where job was found → simply start with "I am writing to express my interest in this opportunity"
- Instead of "[Previous Company]" → use actual company names from resume or create realistic ones

**ABSOLUTELY FORBIDDEN PHRASES - NEVER USE THESE:**
- "Platform where job was advertised"
- "Platform where job was seen"
- "REMOVE THIS LINE"
- "omitted as requested"
- "if known, otherwise omit"
- Any text in square brackets []
- Any conditional statements
- Any reference to where the job was found or advertised

**OPENING SENTENCE RULES:**
- NEVER mention where you found the job
- Start directly with: "I am writing to express my keen interest in this opportunity"
- Or: "I am excited to apply for this position"
- Or: "I would like to express my interest in joining your team"

**EXAMPLE GOOD OPENING:**
"Dear Hiring Manager,

I am writing to express my keen interest in this opportunity to join your team. Having reviewed the role requirements, I am confident that my background in [relevant field] aligns perfectly with your needs."

**NEVER WRITE ANYTHING LIKE:**
- "Platform where job was advertised"
- "REMOVE THIS LINE"
- "omitted as requested"
- Any reference to job boards, websites, or where you found the job

**FINAL OUTPUT:**
- Generate ONLY the complete cover letter content
- Start directly with the header/contact information
- Make it immediately sendable without any edits
- Use professional, confident tone
- Include specific achievements that match job requirements

IMPORTANT: Create a complete cover letter with NO placeholder text. Use generic professional language that works universally.

FINAL WARNING: If you include ANY of these phrases, the output will be rejected:
- "Platform where job was advertised"
- "REMOVE THIS LINE"
- "omitted as requested"
- Any text in square brackets []
- Any conditional statements

Simply start with "Dear Hiring Manager, I am writing to express my interest in this opportunity..."
      `;
    }

    // Email Template Generation
    if (generateType === 'email' || generateType === 'all') {
      prompts.email = `
CRITICAL INSTRUCTION: You must create a complete email with ZERO placeholder text. Do NOT include any phrases like "Platform where job was advertised", "REMOVE THIS LINE", "omitted as requested", or any text in square brackets. Never mention where the job was found.

You are an expert at writing professional job application emails. Create a FINAL, COMPLETE, READY-TO-SEND email that will help get the candidate noticed.

JOB DESCRIPTION:
${jobDescription}

${baseResume ? `CANDIDATE BACKGROUND:\n${baseResume}` : ''}

TARGET MARKET: ${country}

**CRITICAL REQUIREMENTS - NO PLACEHOLDER TEXT:**
- Generate ONLY the final, complete email content
- NEVER use square brackets like [Company Name] or [Position Title]
- NEVER use conditional text like "if known, otherwise omit"
- NEVER mention "Platform where job was advertised" or similar phrases
- Use generic professional language that works for any company
- Make it immediately ready to copy-paste and send

**EMAIL STRUCTURE:**
1. **Subject Line**: Use format like "Application for [Role Type] Position" using actual role from job description
2. **Greeting**: Always use "Dear Hiring Manager"
3. **Opening**: Express interest in "this position" or "the role" (never use placeholders)
4. **Body**: Highlight relevant experience that matches job requirements
5. **Closing**: Professional sign-off with contact information

**LANGUAGE RULES:**
- Instead of "[Company Name]" → use "your organization" or "your team"
- Instead of "[Position Title]" → use "this position" or "the role"
- Instead of mentioning where job was found → simply start with "I am writing to express my interest in this opportunity"
- Use actual technologies and skills from job description

**ABSOLUTELY FORBIDDEN PHRASES - NEVER USE THESE:**
- "Platform where job was advertised"
- "Platform where job was seen"
- "REMOVE THIS LINE"
- "omitted as requested"
- "if known, otherwise omit"
- Any text in square brackets []
- Any conditional statements
- Any reference to where the job was found or advertised

**EMAIL OPENING RULES:**
- NEVER mention where you found the job
- Start subject with: "Application for [Role] Position" using actual role from job description
- Start email body with: "Dear Hiring Manager, I am writing to express my interest in this opportunity"
- Or: "Dear Hiring Manager, I am excited to apply for this position"

**EXAMPLE GOOD EMAIL OPENING:**
"Subject: Application for Software Developer Position

Dear Hiring Manager,

I am writing to express my interest in this opportunity to join your development team. With my background in software development and passion for innovative solutions, I believe I would be a valuable addition to your organization."

**NEVER WRITE ANYTHING LIKE:**
- "Platform where job was advertised"
- "REMOVE THIS LINE"
- "omitted as requested"
- Any reference to job boards, websites, or where you found the job

**CONTENT REQUIREMENTS:**
- Keep email body to 3-4 short paragraphs maximum
- Highlight 1-2 key achievements that match job requirements
- Show enthusiasm without being overly casual
- Mention attachments (resume and cover letter)
- Include clear call to action

**FINAL OUTPUT:**
- Generate ONLY the complete email content
- Start directly with the subject line
- Make it immediately sendable without any edits
- Use professional, confident tone
- Include specific qualifications that match job requirements

IMPORTANT: Create a complete email with NO placeholder text. Use generic professional language that works universally.

FINAL WARNING: If you include ANY of these phrases, the output will be rejected:
- "Platform where job was advertised"
- "REMOVE THIS LINE"
- "omitted as requested"
- Any text in square brackets []
- Any conditional statements

Simply start with "Subject: Application for [Role] Position" and "Dear Hiring Manager, I am writing to express my interest in this opportunity..."
      `;
    }

    const result: GenerationResult = {};

    // Generate each requested document
    for (const [type, prompt] of Object.entries(prompts)) {
      try {
        const response = await model.generateContent(prompt);
        const content = response.response.text();

        if (type === 'resume') {
          result.resume = content;
        } else if (type === 'coverLetter') {
          result.coverLetter = content;
        } else if (type === 'email') {
          result.email = content;
        }
      } catch (error) {
        console.error(`Error generating ${type}:`, error);
        throw new Error(`Failed to generate ${type}. Please check your API key and try again.`);
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
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Test with a simple prompt
    const result = await model.generateContent("Hello");
    const response = await result.response;
    const text = response.text();
    
    return text && text.length > 0;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
};
