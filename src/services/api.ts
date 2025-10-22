const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export interface Stream {
  id: string;
  name: string;
  rtspUrl: string;
  hlsUrl: string;
  status: 'pending' | 'active' | 'error' | 'stopped';
  createdAt: string;
  lastUpdate: string;
  errorMessage?: string;
}

export interface CreateStreamRequest {
  name: string;
  rtspUrl: string;
  quality?: 'low' | 'medium' | 'high' | 'auto';
}

const headers: HeadersInit = {
  'Content-Type': 'application/json',
};

if (API_KEY) {
  headers['X-API-Key'] = API_KEY;
}

export const api = {
  async createStream(data: CreateStreamRequest): Promise<Stream> {
    const response = await fetch(`${API_URL}/api/streams`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create stream');
    }

    return result.stream;
  },

  async getStreams(): Promise<Stream[]> {
    const response = await fetch(`${API_URL}/api/streams`, { headers });
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch streams');
    }

    return result.streams;
  },

  async getStream(id: string): Promise<Stream> {
    const response = await fetch(`${API_URL}/api/streams/${id}`, { headers });
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch stream');
    }

    return result.stream;
  },

  async deleteStream(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/streams/${id}`, {
      method: 'DELETE',
      headers,
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete stream');
    }
  },

  getStreamUrl(hlsPath: string): string {
    return `${API_URL}${hlsPath}`;
  },

  getWebSocketUrl(): string {
    const wsProtocol = API_URL.startsWith('https') ? 'wss' : 'ws';
    const url = API_URL.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${url}/ws`;
  },
};

export default api;
