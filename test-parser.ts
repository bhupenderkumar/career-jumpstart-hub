import { parseResumeContent } from "./src/utils/unifiedATSGenerator";

// Test 1: AI-generated format with markdown headers
const test1 = `# **BHUPENDER KUMAR**
Senior Full Stack Developer | Web3 & Blockchain Engineer

rajus9231@gmail.com | +91 9717267473 | linkedin.com/in/bhupik | github.com/bhupenderkumar

## PROFESSIONAL SUMMARY
Senior developer with 12+ years of experience.

## PROFESSIONAL EXPERIENCE

Senior Software Engineer | Lab49, Noida, India | Jun 2021 - Present
• Led development of dApps
• Built trading systems
`;

// Test 2: Plain format (no markdown)
const test2 = `BHUPENDER KUMAR
Senior Full Stack Developer

rajus9231@gmail.com | +91 9717267473

PROFESSIONAL SUMMARY
Senior developer.

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Lab49 | Jun 2021 - Present
• Led development
`;

// Test 3: Bold name with no title
const test3 = `**BHUPENDER KUMAR**
rajus9231@gmail.com | +91 9717267473

PROFESSIONAL EXPERIENCE
Senior Software Engineer | Lab49 | Jun 2021 - Present
• Led development
`;

// Test 4: Name with pipe separators on same line as contact
const test4 = `BHUPENDER KUMAR | rajus9231@gmail.com | +91 9717267473

PROFESSIONAL EXPERIENCE
Senior Software Engineer | Lab49 | Jun 2021 - Present
• Led development
`;

// Test 5: Name + title + contact on pipe-separated lines
const test5 = `BHUPENDER KUMAR | Senior Full Stack Developer | rajus9231@gmail.com | +91 9717267473

PROFESSIONAL EXPERIENCE
Senior Software Engineer | Lab49 | Jun 2021 - Present
• Led development
`;

// Test 6: Name with bullet separator
const test6 = `BHUPENDER KUMAR • rajus9231@gmail.com • +91 9717267473 • linkedin.com/in/bhupik

PROFESSIONAL EXPERIENCE
Senior Software Engineer | Lab49 | Jun 2021 - Present
• Led development
`;

for (const [label, content] of [["Test 1 (MD headers)", test1], ["Test 2 (Plain)", test2], ["Test 3 (Bold name)", test3], ["Test 4 (Name|contact)", test4], ["Test 5 (Name|title|contact)", test5], ["Test 6 (Name•contact)", test6]]) {
  const result = parseResumeContent(content);
  console.log(`\n=== ${label} ===`);
  console.log("Name:", JSON.stringify(result.name));
  console.log("Title:", JSON.stringify(result.title));
  console.log("Contact email:", result.contact.email);
  console.log("Exp count:", result.experience.length);
  if (result.experience[0]) {
    console.log("First job:", result.experience[0].title, "|", result.experience[0].company);
    console.log("Bullets:", result.experience[0].bullets.length);
  }
}
