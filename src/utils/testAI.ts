// Test utility to verify AI integration
// This file can be used to test the AI service independently

import { generateResumeWithAI, validateApiKey } from '@/services/geminiAI';

export const testAIIntegration = async () => {
  console.log('Testing AI Integration...');
  
  try {
    // Test API key validation
    console.log('1. Testing API key validation...');
    const isValidKey = await validateApiKey();
    console.log('API Key Valid:', isValidKey);
    
    if (!isValidKey) {
      console.error('API key validation failed. Please check your configuration.');
      return false;
    }
    
    // Test basic resume generation
    console.log('2. Testing basic resume generation...');
    const testJobDescription = `
Software Engineer Position
Company: Tech Startup
Requirements:
- 3+ years of JavaScript experience
- React and Node.js knowledge
- Experience with databases
- Strong problem-solving skills
    `;
    
    const result = await generateResumeWithAI({
      jobDescription: testJobDescription
    });
    
    console.log('Generated Resume Preview:', result.substring(0, 200) + '...');
    console.log('AI Integration Test: PASSED');
    return true;
    
  } catch (error) {
    console.error('AI Integration Test: FAILED', error);
    return false;
  }
};

// Example usage:
// import { testAIIntegration } from '@/utils/testAI';
// testAIIntegration();
