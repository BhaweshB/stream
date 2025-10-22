import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const expandUserPath = (value: string): string => {
  if (!value) {
    return value;
  }

  if (value.startsWith('~')) {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    if (homeDir) {
      return path.join(homeDir, value.slice(1));
    }
  }

  return value;
};

const findBinaryRecursive = (directory: string, executableName: string, depth = 0): string | undefined => {
  if (!directory || depth > 4) {
    return undefined;
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return undefined;
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isFile() && entry.name.toLowerCase() === executableName.toLowerCase()) {
      return fullPath;
    }

    if (entry.isDirectory()) {
      const match = findBinaryRecursive(fullPath, executableName, depth + 1);
      if (match) {
        return match;
      }
    }
  }

  return undefined;
};

const resolveBinaryPath = (explicitPath: string | undefined, binary: 'ffmpeg' | 'ffprobe'): string => {
  const executableName = process.platform === 'win32' ? `${binary}.exe` : binary;

  if (explicitPath) {
    const expandedPath = expandUserPath(explicitPath.trim());
    if (fs.existsSync(expandedPath)) {
      return expandedPath;
    }

    if (process.platform === 'win32' && !expandedPath.toLowerCase().endsWith('.exe')) {
      const withExtension = `${expandedPath}.exe`;
      if (fs.existsSync(withExtension)) {
        return withExtension;
      }
    }
  }

  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      const packagesDir = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
      if (fs.existsSync(packagesDir)) {
        const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
          .filter((entry) => entry.isDirectory() && entry.name.toLowerCase().includes('ffmpeg'));

        for (const pkg of packages) {
          const candidate = findBinaryRecursive(path.join(packagesDir, pkg.name), executableName);
          if (candidate) {
            return candidate;
          }
        }
      }
    }

    const programFiles = process.env.PROGRAMFILES;
    if (programFiles) {
      const candidate = findBinaryRecursive(programFiles, executableName, 1);
      if (candidate) {
        return candidate;
      }
    }

    const programFilesX86 = process.env['PROGRAMFILES(X86)'];
    if (programFilesX86) {
      const candidate = findBinaryRecursive(programFilesX86, executableName, 1);
      if (candidate) {
        return candidate;
      }
    }
  }

  const pathDirs = process.env.PATH ? process.env.PATH.split(path.delimiter) : [];
  for (const dir of pathDirs) {
    const candidate = path.join(dir, executableName);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return binary;
};

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  streams: {
    outputDir: process.env.HLS_OUTPUT_DIR || path.join(__dirname, '../../streams'),
    maxStreams: parseInt(process.env.MAX_STREAMS || '10', 10),
  },
  
  ffmpeg: {
    path: resolveBinaryPath(process.env.FFMPEG_PATH, 'ffmpeg'),
    probePath: resolveBinaryPath(process.env.FFPROBE_PATH, 'ffprobe'),
  },
  
  security: {
    apiKey: process.env.API_KEY || 'dev-api-key',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  websocket: {
    pingInterval: 30000,
  },
};

export default config;
