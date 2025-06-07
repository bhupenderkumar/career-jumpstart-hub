import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI client
const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
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
   - Email: Use format "email@domain.com"
   - Phone: Use format "+country-code-number"
   - LinkedIn: Use "linkedin.com/in/username"
   - GitHub: Use "github.com/username"
   - Each contact item on separate line for icon placement

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
You are an expert ATS-optimized resume writer and career consultant. Enhance the existing resume with perfect formatting for PDF generation and HR readability.

CURRENT RESUME:
${baseResume}

ENHANCEMENT REQUEST:
${editPrompt}

JOB DESCRIPTION FOR CONTEXT:
${jobDescription}

${formatInstructions}

**SPECIFIC ENHANCEMENT REQUIREMENTS:**
- Apply the enhancement request while maintaining professional structure
- Ensure all formatting follows PDF optimization guidelines above
- Highlight job-relevant technologies and skills
- Use ATS-friendly language and keywords
- Quantify achievements where possible

Return only the enhanced resume content following the exact formatting requirements above.
        `;
      } else if (baseResume) {
        prompts.resume = `
You are an expert international resume writer specializing in IT professionals. Create a perfectly formatted, ATS-optimized resume for ${country} market.

ORIGINAL RESUME:
${baseResume}

TARGET JOB DESCRIPTION:
${jobDescription}

TARGET MARKET: ${country} (${language.toUpperCase()})

${formatInstructions}

**CRITICAL SUCCESS FACTORS:**
- Perfect cultural fit for ${country} job market
- Every line contributes to getting THIS specific job
- Use exact keywords from job description naturally
- Highlight relevant technologies prominently
- Show quantified achievements and impact
- Format for easy HR scanning and ATS parsing

Return only the perfectly formatted resume content following all formatting requirements above.
        `;
      } else {
        prompts.resume = `
You are an expert resume writer. Create a professional, ATS-optimized resume template based on the job description.

TARGET JOB DESCRIPTION:
${jobDescription}

TARGET MARKET: ${country} (${language.toUpperCase()})

${formatInstructions}

**TEMPLATE REQUIREMENTS:**
- Create realistic but impressive professional content
- Use job description keywords naturally
- Include relevant technical skills and experience
- Show career progression and achievements
- Format perfectly for PDF generation and HR review

Return only the professional resume template following all formatting requirements above.
        `;
      }
    }

    // Cover Letter Generation
    if (generateType === 'cover-letter' || generateType === 'all') {
      prompts.coverLetter = `
You are an expert cover letter writer specializing in IT professionals seeking international opportunities.

JOB DESCRIPTION:
${jobDescription}

${baseResume ? `CANDIDATE RESUME:\n${baseResume}` : ''}

TARGET MARKET: ${country}

Create a compelling, professional cover letter that:

**STRUCTURE:**
1. **Header**: Include name and contact information
2. **Date and Company Address**: Professional business format
3. **Salutation**: "Dear Hiring Manager" or specific name if available
4. **Opening Paragraph**: Hook with specific role interest and key qualification
5. **Body Paragraphs**:
   - Highlight relevant experience matching job requirements
   - Show knowledge of company/role
   - Demonstrate cultural fit for ${country} market
6. **Closing**: Strong call to action and professional sign-off

**CONTENT REQUIREMENTS:**
- Match tone and style for ${country} business culture
- Highlight 2-3 key achievements relevant to the role
- Show enthusiasm for the specific company and position
- Demonstrate international experience and adaptability
- Include specific technologies/skills from job description
- Keep to one page, professional business format

**FORMATTING:**
- Use proper business letter format
- Professional, confident tone
- Specific examples and quantified achievements
- Clear paragraph structure
- Strong opening and closing

Return only the complete cover letter content in professional business format.
      `;
    }

    // Email Template Generation
    if (generateType === 'email' || generateType === 'all') {
      prompts.email = `
You are an expert at writing professional job application emails for IT professionals.

JOB DESCRIPTION:
${jobDescription}

${baseResume ? `CANDIDATE BACKGROUND:\n${baseResume}` : ''}

TARGET MARKET: ${country}

Create a professional, concise job application email that:

**EMAIL STRUCTURE:**
1. **Subject Line**: Clear, specific, professional
2. **Greeting**: Professional salutation
3. **Opening**: Brief introduction with specific role interest
4. **Body**:
   - 2-3 sentences highlighting key qualifications
   - Mention of attached resume and cover letter
   - Show knowledge of company/role
5. **Closing**: Professional sign-off with contact information

**CONTENT REQUIREMENTS:**
- Keep email body to 3-4 short paragraphs maximum
- Professional but personable tone appropriate for ${country}
- Highlight 1-2 key achievements relevant to the role
- Show enthusiasm without being overly casual
- Include clear call to action
- Mention attachments (resume and cover letter)

Return the complete email including subject line, body, and signature in professional email format.
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
