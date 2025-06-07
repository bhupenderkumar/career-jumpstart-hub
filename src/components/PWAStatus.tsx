import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Wifi, 
  Download, 
  CheckCircle, 
  XCircle, 
  Info,
  RefreshCw
} from 'lucide-react';
import { 
  isPWAInstalled, 
  isIOSDevice, 
  isAndroidDevice, 
  getPWACapabilities,
  getInstallInstructions,
  isLaunchedFromHomeScreen
} from '@/utils/pwa';

const PWAStatus: React.FC = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [capabilities, setCapabilities] = useState(getPWACapabilities());
  const [launchedFromHomeScreen, setLaunchedFromHomeScreen] = useState(false);

  useEffect(() => {
    setIsInstalled(isPWAInstalled());
    setLaunchedFromHomeScreen(isLaunchedFromHomeScreen());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const getDeviceType = () => {
    if (isIOSDevice()) return 'iOS';
    if (isAndroidDevice()) return 'Android';
    return 'Desktop';
  };

  const CapabilityItem: React.FC<{ name: string; supported: boolean; description: string }> = ({ 
    name, 
    supported, 
    description 
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        {supported ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="text-xs text-gray-500 max-w-xs text-right">
        {description}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>PWA Status</span>
          </CardTitle>
          <CardDescription>
            Progressive Web App installation and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Installation Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Installation Status</span>
            <Badge variant={isInstalled ? "default" : "secondary"}>
              {isInstalled ? "Installed" : "Not Installed"}
            </Badge>
          </div>

          {/* Device Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Device Type</span>
            <Badge variant="outline">{getDeviceType()}</Badge>
          </div>

          {/* Online Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status</span>
            <div className="flex items-center space-x-2">
              <Wifi className={`h-4 w-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
          </div>

          {/* Launch Source */}
          {launchedFromHomeScreen && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Launch Source</span>
              <Badge variant="default">Home Screen</Badge>
            </div>
          )}

          {/* Install Instructions */}
          {!isInstalled && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Install Instructions
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {getInstallInstructions()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh App
          </Button>
        </CardContent>
      </Card>

      {/* PWA Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">PWA Capabilities</CardTitle>
          <CardDescription>
            Available features on this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <CapabilityItem
              name="Service Worker"
              supported={capabilities.serviceWorker}
              description="Enables offline functionality and caching"
            />
            <CapabilityItem
              name="Push Notifications"
              supported={capabilities.pushNotifications}
              description="Receive notifications when app is closed"
            />
            <CapabilityItem
              name="Background Sync"
              supported={capabilities.backgroundSync}
              description="Sync data when connection is restored"
            />
            <CapabilityItem
              name="Web Share"
              supported={capabilities.webShare}
              description="Share content using native share dialog"
            />
            <CapabilityItem
              name="Fullscreen"
              supported={capabilities.fullscreen}
              description="Enter fullscreen mode"
            />
            <CapabilityItem
              name="Device Orientation"
              supported={capabilities.deviceOrientation}
              description="Detect device orientation changes"
            />
            <CapabilityItem
              name="Geolocation"
              supported={capabilities.geolocation}
              description="Access device location"
            />
            <CapabilityItem
              name="Camera Access"
              supported={capabilities.camera}
              description="Access device camera"
            />
            <CapabilityItem
              name="Storage Estimation"
              supported={capabilities.storage}
              description="Estimate available storage space"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAStatus;
