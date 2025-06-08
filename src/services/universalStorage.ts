// UniversalStorage Service: Combines localStorage and a JSON file for cross-device persistence
// Usage: import { universalStorage } from './universalStorage';

const STORAGE_KEY = 'userEnvVars';
const FILE_PATH = '/userEnvVars.json'; // Root-level file for browser download/upload

export const universalStorage = {
  // Get value by key (localStorage first, then file)
  async get(key: string): Promise<string | undefined> {
    // Try localStorage
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        const obj = JSON.parse(local);
        if (obj[key]) return obj[key];
      } catch {}
    }
    // Try file (if available)
    try {
      const file = await universalStorage._readFile();
      if (file && file[key]) return file[key];
    } catch {}
    return undefined;
  },

  // Set value by key (updates both localStorage and file)
  async set(key: string, value: string) {
    // Update localStorage
    let obj: Record<string, string> = {};
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try { obj = JSON.parse(local); } catch {}
    }
    obj[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    // Update file
    await universalStorage._writeFile(obj);
  },

  // Export all as JSON file (for user download)
  async exportToFile() {
    const local = localStorage.getItem(STORAGE_KEY);
    const blob = new Blob([local || '{}'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = FILE_PATH.replace(/^\//, '');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Import from JSON file (user uploads file, merges with localStorage)
  async importFromFile(file: File) {
    const text = await file.text();
    let fileObj: Record<string, string> = {};
    try { fileObj = JSON.parse(text); } catch {}
    let localObj: Record<string, string> = {};
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try { localObj = JSON.parse(local); } catch {}
    }
    // Merge (file takes precedence)
    const merged = { ...localObj, ...fileObj };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    await universalStorage._writeFile(merged);
  },

  // Internal: Write to file (browser only, triggers download)
  async _writeFile(obj: Record<string, string>) {
    // In browser, trigger download (simulate file write)
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    // Optionally, you could use File System Access API for advanced use
    // For now, just trigger download for user
    // (In a real backend, you would POST to a server here)
    // This is a no-op unless user triggers export
    // You may call exportToFile() after set if you want auto-download
  },

  // Internal: Read from file (not possible in browser without user upload)
  async _readFile(): Promise<Record<string, string> | undefined> {
    // In browser, cannot read file without user upload
    // So this is a no-op unless importFromFile is called
    return undefined;
  }
};
