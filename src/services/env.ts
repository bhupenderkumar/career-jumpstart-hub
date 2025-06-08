// --- ENV SERVICE ---
// Centralized environment variable service for runtime and localStorage
export const getUserEnvVar = (key: string): string | undefined => {
  // Try localStorage first
  try {
    const stored = localStorage.getItem("userEnvVars");
    if (stored) {
      const envVars = JSON.parse(stored);
      if (envVars[key]) return envVars[key];
    }
  } catch (e) {}
  // Fallback to import.meta.env
  return import.meta.env[key];
};

export const setUserEnvVar = (key: string, value: string) => {
  let envVars: Record<string, string> = {};
  try {
    const stored = localStorage.getItem("userEnvVars");
    if (stored) envVars = JSON.parse(stored);
  } catch (e) {}
  envVars[key] = value;
  localStorage.setItem("userEnvVars", JSON.stringify(envVars));
};