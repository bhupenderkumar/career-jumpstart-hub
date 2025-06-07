// PWA utility functions

export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroidDevice = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

export const isMobileDevice = (): boolean => {
  return isIOSDevice() || isAndroidDevice();
};

export const canInstallPWA = (): boolean => {
  return !isPWAInstalled() && (
    'serviceWorker' in navigator &&
    (window as any).BeforeInstallPromptEvent !== undefined
  );
};

export const registerSW = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.log('SW registration failed: ', error);
    }
  }
};

export const unregisterSW = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log('All service workers unregistered');
    } catch (error) {
      console.log('SW unregistration failed: ', error);
    }
  }
};

// PWA installation tracking
export const trackPWAInstall = (): void => {
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    // You can track this event in your analytics
    localStorage.setItem('pwa-installed', 'true');
  });
};

// Check if app was launched from home screen
export const isLaunchedFromHomeScreen = (): boolean => {
  return isPWAInstalled() || 
         window.location.search.includes('utm_source=homescreen') ||
         document.referrer === '';
};

// Add to home screen instructions for different platforms
export const getInstallInstructions = (): string => {
  if (isIOSDevice()) {
    return "Tap the share button and select 'Add to Home Screen'";
  } else if (isAndroidDevice()) {
    return "Tap the menu button and select 'Add to Home Screen' or 'Install App'";
  } else {
    return "Click the install button in your browser's address bar";
  }
};

// PWA capabilities detection
export const getPWACapabilities = () => {
  return {
    serviceWorker: 'serviceWorker' in navigator,
    pushNotifications: 'PushManager' in window,
    backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    webShare: 'share' in navigator,
    fullscreen: 'requestFullscreen' in document.documentElement,
    deviceOrientation: 'DeviceOrientationEvent' in window,
    geolocation: 'geolocation' in navigator,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    storage: 'storage' in navigator && 'estimate' in navigator.storage,
  };
};
