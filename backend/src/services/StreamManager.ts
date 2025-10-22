import { spawn, ChildProcess } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { StreamConfig, StreamStats, CreateStreamRequest } from '../types/stream';
import config from '../config';

class StreamManager {
  private streams: Map<string, StreamConfig> = new Map();
  private processes: Map<string, ChildProcess> = new Map();
  private stats: Map<string, StreamStats> = new Map();

  constructor() {
    this.ensureStreamsDirectory();
  }

  private ensureStreamsDirectory(): void {
    if (!fs.existsSync(config.streams.outputDir)) {
      fs.mkdirSync(config.streams.outputDir, { recursive: true });
    }
  }

  async createStream(request: CreateStreamRequest): Promise<StreamConfig> {
    if (this.streams.size >= config.streams.maxStreams) {
      throw new Error(`Maximum number of streams (${config.streams.maxStreams}) reached`);
    }

    const streamId = uuidv4();
    const streamDir = path.join(config.streams.outputDir, streamId);
    
    // Create stream directory
    if (!fs.existsSync(streamDir)) {
      fs.mkdirSync(streamDir, { recursive: true });
    }

    // Check if it's HTTP/HTTPS stream - these also need FFmpeg to convert to HLS
    const isHttpStream = request.rtspUrl.startsWith('http://') || request.rtspUrl.startsWith('https://');
    
    const stream: StreamConfig = {
      id: streamId,
      name: request.name,
      rtspUrl: request.rtspUrl,
      hlsUrl: `/streams/${streamId}/index.m3u8`,
      status: 'pending',
      createdAt: new Date(),
      lastUpdate: new Date(),
    };

    this.streams.set(streamId, stream);
    
    // Start FFmpeg for all streams (RTSP, HTTP, HTTPS)
    // FFmpeg will handle different protocols and convert to HLS
    this.startFFmpeg(stream, request.quality || 'auto');

    return stream;
  }

  private startFFmpeg(stream: StreamConfig, quality: string): void {
    const outputPath = path.join(config.streams.outputDir, stream.id, 'index.m3u8');
    
    // FFmpeg quality settings
    const qualitySettings = {
      low: ['-s', '640x480', '-b:v', '500k'],
      medium: ['-s', '1280x720', '-b:v', '1500k'],
      high: ['-s', '1920x1080', '-b:v', '3000k'],
      auto: ['-s', '1280x720', '-b:v', '2000k'],
    };

    // Determine if this is HTTP/HTTPS stream
    const isHttpStream = stream.rtspUrl.startsWith('http://') || stream.rtspUrl.startsWith('https://');

    const args = [
      // Add protocol-specific options
      ...(isHttpStream ? [] : ['-rtsp_transport', 'tcp']),
      '-fflags', 'nobuffer',
      '-flags', 'low_delay',
      '-i', stream.rtspUrl,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-tune', 'zerolatency',
      '-g', '48',
      '-sc_threshold', '0',
      ...qualitySettings[quality as keyof typeof qualitySettings],
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ac', '2',
      '-f', 'hls',
      '-hls_time', '2',
      '-hls_list_size', '3',
      '-hls_flags', 'delete_segments+append_list+omit_endlist',
      '-hls_allow_cache', '0',
      '-hls_segment_filename', path.join(config.streams.outputDir, stream.id, 'segment%03d.ts'),
      outputPath,
    ];

    console.log(`[${stream.id}] Starting FFmpeg with command:`, config.ffmpeg.path, args.join(' '));
    const ffmpegProcess = spawn(config.ffmpeg.path, args);

    ffmpegProcess.stdout.on('data', (data) => {
      console.log(`[${stream.id}] FFmpeg stdout: ${data}`);
    });

    ffmpegProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.log(`[${stream.id}] FFmpeg: ${output}`);
      
      // Update stream status when FFmpeg starts writing
      if (output.includes('Opening') || output.includes('Stream mapping') || output.includes('Output #0')) {
        this.updateStreamStatus(stream.id, 'active');
      }
      
      // Detect common errors
      if (output.includes('Connection refused') || output.includes('timed out') || output.includes('Invalid data found')) {
        this.updateStreamStatus(stream.id, 'error', 'Cannot connect to stream source');
      }
    });

    ffmpegProcess.on('error', (error) => {
      console.error(`[${stream.id}] FFmpeg error:`, error);
      this.updateStreamStatus(stream.id, 'error', error.message);
    });

    ffmpegProcess.on('close', (code) => {
      console.log(`[${stream.id}] FFmpeg process exited with code ${code}`);
      this.processes.delete(stream.id);
      
      if (code !== 0) {
        this.updateStreamStatus(stream.id, 'error', `Process exited with code ${code}`);
      }
    });

    this.processes.set(stream.id, ffmpegProcess);
  }

  private updateStreamStatus(streamId: string, status: StreamConfig['status'], errorMessage?: string): void {
    const stream = this.streams.get(streamId);
    if (stream) {
      stream.status = status;
      stream.lastUpdate = new Date();
      if (errorMessage) {
        stream.errorMessage = errorMessage;
      }
      this.streams.set(streamId, stream);
    }
  }

  async stopStream(streamId: string): Promise<boolean> {
    const process = this.processes.get(streamId);
    if (process) {
      process.kill('SIGTERM');
      this.processes.delete(streamId);
    }

    const stream = this.streams.get(streamId);
    if (stream) {
      stream.status = 'stopped';
      stream.lastUpdate = new Date();
      this.streams.set(streamId, stream);
    }

    // Clean up stream files
    const streamDir = path.join(config.streams.outputDir, streamId);
    if (fs.existsSync(streamDir)) {
      fs.rmSync(streamDir, { recursive: true, force: true });
    }

    this.streams.delete(streamId);
    this.stats.delete(streamId);

    return true;
  }

  getStream(streamId: string): StreamConfig | undefined {
    return this.streams.get(streamId);
  }

  getAllStreams(): StreamConfig[] {
    return Array.from(this.streams.values());
  }

  getStats(streamId: string): StreamStats | undefined {
    return this.stats.get(streamId);
  }

  getAllStats(): StreamStats[] {
    return Array.from(this.stats.values());
  }

  async stopAllStreams(): Promise<void> {
    const streamIds = Array.from(this.streams.keys());
    await Promise.all(streamIds.map(id => this.stopStream(id)));
  }
}

export default new StreamManager();
