# Career Jumpstart Hub

An AI-powered resume generation platform that helps you create ATS-friendly resumes tailored to specific job descriptions. Built with React, TypeScript, and Google Gemini AI.

## 🚀 Features

- **AI Resume Generator**: Create personalized resumes using Google Gemini AI
- **Resume Upload & Parsing**: Upload existing resumes in PDF or text format
- **Multi-language Support**: Generate resumes in 5+ languages with cultural adaptation
- **ATS Optimization**: Ensures resumes pass Applicant Tracking Systems
- **PDF Export**: Download professional PDF resumes
- **Print Functionality**: Direct printing with optimized layouts
- **PWA Support**: Works offline as a Progressive Web App
- **Privacy-First**: All processing happens client-side

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Radix UI
- **AI Integration**: Google Gemini API with fallback models
- **Storage**: IndexedDB with localStorage fallback
- **PDF Generation**: Custom PDF engine optimized for ATS
- **Build Tool**: Vite with PWA plugin

## 📋 Prerequisites

- Node.js 18+ or Bun
- Google Gemini API key
- Modern web browser

## 🔑 Getting Google Gemini API Key

1. **Visit Google AI Studio**:
   - Go to [https://aistudio.google.com/](https://aistudio.google.com/)
   - Sign in with your Google account

2. **Create API Key**:
   - Click on "Get API key" in the left sidebar
   - Click "Create API key"
   - Choose "Create API key in new project" or select existing project
   - Copy the generated API key

3. **Important Notes**:
   - Keep your API key secure and never commit it to version control
   - The API has usage limits - monitor your usage in Google Cloud Console
   - Free tier includes generous limits for personal use

## 🚀 Installation & Setup

### Option 1: Using npm

```bash
# Clone the repository
git clone https://github.com/bhupenderkumar/career-jumpstart-hub.git
cd career-jumpstart-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 2: Using Bun (Recommended for faster builds)

```bash
# Clone the repository
git clone https://github.com/bhupenderkumar/career-jumpstart-hub.git
cd career-jumpstart-hub

# Install dependencies
bun install

# Start development server
bun run dev
```

## ⚙️ Configuration

### Setting up Gemini API Key

1. **Through the Application UI** (Recommended):
   - Open the application in your browser
   - Look for the settings/configuration icon
   - Enter your Gemini API key in the provided field
   - The key will be stored securely in your browser's local storage

2. **Through Environment Variables** (Development):
   - Create a `.env.local` file in the root directory
   - Add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

### Model Configuration

The application uses multiple Gemini models with automatic fallback:

```typescript
const GEMINI_MODELS = [
  "gemini-1.5-flash",    // Primary - fastest response
  "gemini-1.5-pro",      // Secondary - better quality
  "gemini-pro",          // Tertiary - stable fallback
  "gemini-1.0-pro"       // Final fallback
];
```

## 🎯 Usage

### Basic Resume Generation

1. **Upload Base Resume** (Optional but recommended):
   - Click "Upload Resume" 
   - Select PDF or text file
   - Your resume will be parsed and stored locally

2. **Enter Job Description**:
   - Paste the job description you're applying for
   - The AI will analyze requirements and keywords

3. **Generate Resume**:
   - Click "Generate Resume"
   - AI will create a tailored resume matching the job requirements
   - Review and edit as needed

4. **Export**:
   - Use "Print" for direct printing
   - Download as PDF for applications

### Advanced Features

- **Multi-language Generation**: Select target language and country
- **Cultural Adaptation**: Resumes adapt to local business cultures
- **ATS Optimization**: Built-in optimization for tracking systems
- **Version History**: Track different resume versions

## 🏗️ Project Structure

```
src/
├── components/          # React components
├── services/           # Business logic and API services
│   ├── geminiAI.ts    # AI service with model fallbacks
│   └── universalStorage.ts # Storage abstraction
├── pages/             # Application pages
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── styles/            # CSS and styling
└── utils/             # Helper functions
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
bun run dev         # Using Bun

# Building
npm run build       # Build for production
bun run build      # Using Bun

# Linting
npm run lint        # Run ESLint
bun run lint       # Using Bun

# Preview
npm run preview     # Preview production build
bun run preview    # Using Bun
```

### Environment Variables

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 📱 PWA Features

The application works as a Progressive Web App:

- **Offline Functionality**: Core features work without internet
- **Install Prompt**: Can be installed on desktop and mobile
- **Service Worker**: Caches resources for faster loading
- **Responsive Design**: Works on all device sizes

## 🔒 Privacy & Security

- **Client-Side Processing**: All data stays in your browser
- **No Server Storage**: Personal information never leaves your device
- **Secure API Key Storage**: Keys encrypted in local storage
- **HTTPS Only**: All external communications use HTTPS

## 🚨 Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Verify key is correct and active
   - Check Google Cloud Console for quota limits
   - Ensure billing is enabled if using paid features

2. **Build Errors**:
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Update dependencies: `npm update`
   - Check Node.js version compatibility

3. **PDF Generation Issues**:
   - Ensure modern browser with PDF support
   - Check browser console for errors
   - Try different browser if issues persist

### Getting Help

- Check browser console for error messages
- Verify API key configuration
- Ensure stable internet connection for AI features
- Review network tab for failed requests

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language processing
- Radix UI for accessible component primitives
- Tailwind CSS for utility-first styling
- Vite for fast development experience

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the Google Gemini API documentation

---

**Note**: This tool is designed for professional preparedness in a changing market. It helps you stay ready for opportunities while excelling in your current role.
