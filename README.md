# Career Jumpstart Hub

Welcome to Career Jumpstart Hub - your AI-powered career companion! This platform helps you create tailored resumes, track job applications, and manage your career journey with intelligent automation.

## Features

- **AI Resume Generator**: Create personalized resumes tailored to specific job descriptions using Google Gemini AI
- **Resume Upload & Parsing**: Upload existing resumes in PDF or text format
- **Application Tracking**: Keep track of your job applications and their status
- **Location Management**: Organize job opportunities by location
- **Export Options**: Download your generated resumes as PDF files
- **Smart Editing**: Use AI to make specific improvements to your resume

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Google Gemini API key (free from Google AI Studio)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bhupenderkumar/career-jumpstart-hub
cd career-jumpstart-hub
```

2. Install dependencies:
```bash
npm install
```

3. **Set up AI Configuration**:
   - Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a `.env` file in the project root
   - Add your API key:
   ```bash
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:8080`

## How to Use

### Basic Resume Generation

1. **Upload Your Resume** (Optional): Start by uploading your existing resume in PDF or text format
2. **Enter Job Details**: Paste the complete job description, requirements, and company information
3. **Generate AI Resume**: Click "Generate AI Resume" to create a tailored version
4. **Review & Edit**: Review the generated resume and make any necessary adjustments
5. **Export**: Download your final resume as a PDF file

### Advanced Features

- **AI-Powered Editing**: Use the "Edit with AI" feature to make specific improvements like "add more technical skills" or "make it more concise"
- **Multiple Versions**: Generate different versions for different job applications
- **Smart Tailoring**: The AI automatically emphasizes relevant experience and incorporates job-specific keywords

## AI Configuration

The application uses Google's Gemini AI for intelligent resume generation. Here's how to set it up:

1. **Get API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) and create a free account
2. **Generate Key**: Click "Create API Key" and copy the generated key
3. **Configure Environment**: Add the key to your `.env` file as shown above
4. **Restart Server**: Restart the development server to load the new configuration

### API Key Security

- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Your API key is only used client-side for direct communication with Google's API

## Troubleshooting

### Common Issues

1. **"API Key Required" Error**: Make sure you've set up your `.env` file with a valid Gemini API key
2. **Resume Upload Fails**: Try converting your PDF to text format or use a different PDF file
3. **Generation Takes Too Long**: The AI service may be experiencing high load, try again in a few minutes

### Getting Help

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your API key is correctly configured
3. Ensure you have a stable internet connection
4. Try refreshing the page and attempting the operation again

## Technologies Used

This project is built with modern web technologies:

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS for responsive design
- **AI Integration**: Google Gemini AI for resume generation
- **PDF Processing**: PDF.js for resume parsing
- **PDF Generation**: jsPDF for export functionality

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a35b08ed-5c4b-4619-a57d-f0e77e2d7264) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
