import { generateSimplePDF } from './simplePDFGenerator';

export const testPDFGeneration = () => {
  const sampleResume = `BHUPENDER KUMAR
Senior Backend Engineer
shar.makbhupender@gmail.com | +(91)9717267473 | https://github.com/bhupenderkumar
LinkedIn: linkedin.com/in/bhupenderkumar

PROFESSIONAL SUMMARY
Experienced Backend Engineer with 7+ years of expertise in Java, Spring Boot, and microservices architecture. Proven track record of building scalable, high-performance systems for global markets. Strong experience with international teams, remote collaboration, and cross-cultural communication.

KEY SKILLS
• Programming Languages: Java, Groovy, Python, JavaScript
• Backend Technologies: Spring Boot, Microservices, RESTful APIs, SOAP
• Databases: MongoDB, PostgreSQL, MySQL
• Cloud Platforms: AWS, Docker, Kubernetes
• Development Practices: TDD, Agile/Scrum, CI/CD

WORK EXPERIENCE

Senior Software Engineer | Lab49 | June 2021 – Present
• Developed scalable backend systems serving global financial markets
• Led international team collaboration across multiple time zones
• Implemented microservices architecture supporting 20+ services
• Achieved 99.9% uptime for mission-critical applications

Technical Lead | Colt Technology | June 2018 – June 2021
• Managed distributed development teams across 3 countries
• Architected cloud-native solutions for international clients
• Improved system performance by 30% through optimization strategies

Software Engineer | Bureau Veritas | October 2016 – June 2018
• Developed high-performance Java applications using Spring Boot
• Orchestrated containerized applications with Docker and Kubernetes
• Built robust backend APIs serving web and mobile applications

EDUCATION & CERTIFICATIONS
Bachelor of Computer Science and Technology | 8.2 GPA | April 2015
• AWS Certified Solutions Architect (2022)
• Spring Professional Certification (2021)`;

  try {
    generateSimplePDF({
      resume: sampleResume,
      language: 'en',
      country: 'Germany'
    });
    console.log('Test PDF generated successfully!');
    return true;
  } catch (error) {
    console.error('Test PDF generation failed:', error);
    return false;
  }
};

// You can call this function from the browser console to test
// testPDFGeneration();
