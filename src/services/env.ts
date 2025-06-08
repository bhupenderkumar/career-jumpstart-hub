// --- ENV SERVICE ---
// Centralized environment variable service for runtime and localStorage/universalStorage
import { universalStorage } from './universalStorage';

export const getUserEnvVar = (key: string): string | undefined => {
  // Try universalStorage (async, but we provide a sync fallback for legacy usage)
  // This function is now async for universalStorage support
  throw new Error('getUserEnvVar is now async. Use getUserEnvVarAsync instead.');
};

export const getUserEnvVarAsync = async (key: string): Promise<string | undefined> => {
  // Try universalStorage first
  const value = await universalStorage.get(key);
  if (value) return value;
  // Fallback to import.meta.env
  return import.meta.env[key];
};

export const setUserEnvVar = (key: string, value: string) => {
  // Legacy sync set (for compatibility)
  throw new Error('setUserEnvVar is now async. Use setUserEnvVarAsync instead.');
};

export const setUserEnvVarAsync = async (key: string, value: string) => {
  await universalStorage.set(key, value);
};