import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW, trackPWAInstall } from './utils/pwa'

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker and PWA functionality
if (import.meta.env.PROD) {
  registerSW();
}

// Track PWA installation
trackPWAInstall();
