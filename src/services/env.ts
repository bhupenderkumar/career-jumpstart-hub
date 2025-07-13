// --- ENV SERVICE ---
// Centralized environment variable service for runtime and localStorage/universalStorage
import { universalStorage } from './universalStorage';

// Demo API key (your fallback key) - hidden from UI
// TODO: Replace this with your actual Gemini API key
const DEMO_GEMINI_API_KEY = 'YOUR_ACTUAL_GEMINI_API_KEY_HERE';

export const getUserEnvVar = (key: string): string | undefined => {
  // Try universalStorage (async, but we provide a sync fallback for legacy usage)
  // This function is now async for universalStorage support
  throw new Error('getUserEnvVar is now async. Use getUserEnvVarAsync instead.');
};

export const getUserEnvVarAsync = async (key: string): Promise<string | undefined> => {
  // Check if demo mode is enabled
  const isDemoMode = await universalStorage.get('DEMO_MODE_ENABLED');
  console.log(`🔑 Getting env var: ${key}, Demo mode: ${isDemoMode}`);

  if (key === 'VITE_GEMINI_API_KEY' && isDemoMode === 'true') {
    console.log(`🎯 Using demo API key for ${key}`);
    if (DEMO_GEMINI_API_KEY === 'YOUR_ACTUAL_GEMINI_API_KEY_HERE') {
      console.error('❌ Demo API key is not configured! Please replace the placeholder in env.ts');
      return undefined;
    }
    return DEMO_GEMINI_API_KEY;
  }

  // Try universalStorage first
  const value = await universalStorage.get(key);
  if (value) {
    console.log(`✅ Found ${key} in universalStorage`);
    return value;
  }

  // Fallback to import.meta.env
  const envValue = import.meta.env[key];
  if (envValue) {
    console.log(`✅ Found ${key} in import.meta.env`);
  } else {
    console.warn(`⚠️ ${key} not found in any storage`);
  }
  return envValue;
};

export const setUserEnvVar = (key: string, value: string) => {
  // Legacy sync set (for compatibility)
  throw new Error('setUserEnvVar is now async. Use setUserEnvVarAsync instead.');
};

export const setUserEnvVarAsync = async (key: string, value: string) => {
  console.log(`💾 Setting ${key} in universalStorage`);
  await universalStorage.set(key, value);
  console.log(`✅ Successfully set ${key}`);
};

export const enableDemoMode = async () => {
  console.log('🎯 Enabling demo mode');
  await universalStorage.set('DEMO_MODE_ENABLED', 'true');
  console.log('✅ Demo mode enabled');
};

export const disableDemoMode = async () => {
  console.log('🔄 Disabling demo mode');
  await universalStorage.remove('DEMO_MODE_ENABLED');
  console.log('✅ Demo mode disabled');
};

export const isDemoModeEnabled = async (): Promise<boolean> => {
  const demoMode = await universalStorage.get('DEMO_MODE_ENABLED');
  console.log(`🔍 Demo mode status: ${demoMode}`);
  return demoMode === 'true';
};