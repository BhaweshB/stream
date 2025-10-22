export interface StreamConfig {
  id: string;
  name: string;
  rtspUrl: string;
  hlsUrl: string;
  status: 'pending' | 'active' | 'error' | 'stopped';
  createdAt: Date;
  lastUpdate: Date;
  errorMessage?: string;
  viewers?: number;
  bitrate?: number;
  resolution?: string;
}

export interface StreamStats {
  streamId: string;
  viewers: number;
  bitrate: number;
  fps: number;
  uptime: number;
  errors: number;
}

export interface CreateStreamRequest {
  name: string;
  rtspUrl: string;
  quality?: 'low' | 'medium' | 'high' | 'auto';
}

export interface StreamResponse {
  success: boolean;
  stream?: StreamConfig;
  error?: string;
}
