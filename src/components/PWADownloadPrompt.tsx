import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone, CheckCircle } from 'lucide-react';
import { isPWAInstalled, isIOSDevice, getInstallInstructions } from '@/utils/pwa';

interface PWADownloadPromptProps {
  show: boolean;
  onClose: () => void;
  downloadType: 'resume' | 'cover-letter' | 'email';
  fileName?: string;
}

const PWADownloadPrompt: React.FC<PWADownloadPromptProps> = ({ 
  show, 
  onClose, 
  downloadType, 
  fileName 
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsInstalled(isPWAInstalled());
    setIsIOS(isIOSDevice());

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  const getDownloadMessage = () => {
    switch (downloadType) {
      case 'resume':
        return 'Resume downloaded successfully!';
      case 'cover-letter':
        return 'Cover letter downloaded successfully!';
      case 'email':
        return 'Email template downloaded successfully!';
      default:
        return 'Document downloaded successfully!';
    }
  };

  const getDownloadIcon = () => {
    switch (downloadType) {
      case 'resume':
        return '📄';
      case 'cover-letter':
        return '📝';
      case 'email':
        return '📧';
      default:
        return '📁';
    }
  };

  if (!show || isInstalled) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          {/* Download Success Message */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {getDownloadMessage()}
          </h3>

          {fileName && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {getDownloadIcon()} {fileName}
            </p>
          )}

          {/* PWA Install Prompt */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-3">
              <Smartphone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-md font-medium text-blue-900 dark:text-blue-100 mb-2">
              Install Career Hub App
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Get instant access to your documents and generate resumes offline!
            </p>
            
            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <span>✓</span>
                <span>Work offline</span>
              </div>
              <div className="flex items-center justify-center space-x-1">
                <span>✓</span>
                <span>Faster loading</span>
              </div>
              <div className="flex items-center justify-center space-x-1">
                <span>✓</span>
                <span>Native app experience</span>
              </div>
            </div>
          </div>

          {/* Install Instructions */}
          <div className="space-y-3">
            {!isIOS && deferredPrompt ? (
              <Button
                onClick={handleInstallClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Install App Now
              </Button>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p className="font-medium">How to install:</p>
                <p>{getInstallInstructions()}</p>
                {isIOS && (
                  <div className="flex items-center justify-center space-x-2 text-xs">
                    <span>1. Tap</span>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v5.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 8.586V3a1 1 0 011-1z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>2. "Add to Home Screen"</span>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWADownloadPrompt;
