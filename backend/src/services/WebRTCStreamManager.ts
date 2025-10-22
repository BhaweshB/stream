import { spawn, ChildProcess } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { StreamConfig, CreateStreamRequest } from '../types/stream';
import config from '../config';
import WebSocket from 'ws';

interface WebRTCPeer {
  id: string;
  ws: WebSocket;
  streamId: string;
}

class WebRTCStreamManager {
  private streams: Map<string, StreamConfig> = new Map();
  private processes: Map<string, ChildProcess> = new Map();
  private peers: Map<string, WebRTCPeer> = new Map();
  private wsServer: WebSocket.Server | null = null;

  constructor() {
    this.ensureStreamsDirectory();
  }

  private ensureStreamsDirectory(): void {
    if (!fs.existsSync(config.streams.outputDir)) {
      fs.mkdirSync(config.streams.outputDir, { recursive: true });
      console.log(`📁 Created streams directory: ${config.streams.outputDir}`);
    }
  }

  initializeWebSocket(server: any): void {
    try {
      this.wsServer = new WebSocket.Server({ 
        server,
        path: '/webrtc',
        perMessageDeflate: false
      });

      this.wsServer.on('connection', (ws: WebSocket) => {
        console.log('✅ WebRTC client connected');

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          await this.handleWebRTCMessage(ws, data);
        } catch (error) {
          console.error('WebRTC message error:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        console.log('🔌 WebRTC client disconnected');
        const disconnectedPeer = this.removePeer(ws);
        
        // Check if stream has no more viewers and auto-cleanup
        if (disconnectedPeer) {
          const streamId = disconnectedPeer.streamId;
          const remainingViewers = Array.from(this.peers.values()).filter(p => p.streamId === streamId).length;
          
          if (remainingViewers === 0) {
            console.log(`⚠️ No viewers left for stream ${streamId}, stopping...`);
            setTimeout(() => {
              // Double-check after 5 seconds
              const viewers = Array.from(this.peers.values()).filter(p => p.streamId === streamId).length;
              if (viewers === 0) {
                this.stopStream(streamId);
              }
            }, 5000);
          }
        }
      });

      ws.on('error', (error) => {
        console.error('❌ WebRTC client error:', error);
        this.removePeer(ws);
      });
    });

    this.wsServer.on('error', (error) => {
      console.error('❌ WebRTC WebSocket server error:', error);
    });

    console.log('✅ WebRTC WebSocket server initialized on /webrtc');
    } catch (error) {
      console.error('❌ Failed to initialize WebRTC WebSocket server:', error);
      throw error;
    }
  }

  private async handleWebRTCMessage(ws: WebSocket, data: any): Promise<void> {
    switch (data.type) {
      case 'subscribe':
        await this.handleSubscribe(ws, data.streamId);
        break;
      case 'offer':
        await this.handleOffer(ws, data);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(ws, data);
        break;
      default:
        console.log('Unknown WebRTC message type:', data.type);
    }
  }

  private async handleSubscribe(ws: WebSocket, streamId: string): Promise<void> {
    console.log(`📡 Client subscribing to stream: ${streamId}`);
    console.log(`📊 Available streams:`, Array.from(this.streams.keys()));
    
    const stream = this.streams.get(streamId);
    if (!stream) {
      console.error(`❌ Stream not found: ${streamId}`);
      ws.send(JSON.stringify({ type: 'error', message: 'Stream not found' }));
      return;
    }

    const peerId = uuidv4();
    this.peers.set(peerId, { id: peerId, ws, streamId });

    console.log(`✅ Client subscribed to stream: ${streamId} (peer: ${peerId})`);
    
    ws.send(JSON.stringify({
      type: 'subscribed',
      peerId,
      streamId,
      stream
    }));
  }

  private async handleOffer(ws: WebSocket, data: any): Promise<void> {
    // In production, you'd handle WebRTC negotiation here
    // For now, send back stream info
    ws.send(JSON.stringify({
      type: 'answer',
      answer: data.offer
    }));
  }

  private async handleIceCandidate(ws: WebSocket, data: any): Promise<void> {
    console.log('Received ICE candidate');
  }

  private removePeer(ws: WebSocket): WebRTCPeer | undefined {
    for (const [peerId, peer] of this.peers.entries()) {
      if (peer.ws === ws) {
        this.peers.delete(peerId);
        return peer;
      }
    }
    return undefined;
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
    
    const stream: StreamConfig = {
      id: streamId,
      name: request.name,
      rtspUrl: request.rtspUrl,
      hlsUrl: `/streams/${streamId}/index.m3u8`,
      status: 'pending',
      createdAt: new Date(),
      lastUpdate: new Date(),
    };

    console.log(`🎬 Creating stream: ${streamId}`);
    console.log(`📝 Stream name: ${request.name}`);
    console.log(`🔗 Stream URL: ${request.rtspUrl}`);
    
    this.streams.set(streamId, stream);
    console.log(`✅ Stream added to map. Total streams: ${this.streams.size}`);
    
    this.startWebRTCStream(stream, request.quality || 'auto');

    return stream;
  }

  private startWebRTCStream(stream: StreamConfig, quality: string): void {
    const qualitySettings = {
      low: { width: 640, height: 480, bitrate: '500k', fps: 15 },
      medium: { width: 1280, height: 720, bitrate: '1500k', fps: 25 },
      high: { width: 1920, height: 1080, bitrate: '3000k', fps: 30 },
      auto: { width: 1280, height: 720, bitrate: '2000k', fps: 25 },
    };

    const settings = qualitySettings[quality as keyof typeof qualitySettings];

    // Detect protocol type
    const isRTSP = stream.rtspUrl.startsWith('rtsp://');
    const isHTTP = stream.rtspUrl.startsWith('http://') || stream.rtspUrl.startsWith('https://');

    // Build FFmpeg args based on protocol
    const args: string[] = [];

    // Protocol-specific input options
    if (isRTSP) {
      args.push(
        '-rtsp_transport', 'tcp',
        '-rtsp_flags', 'prefer_tcp',
        '-timeout', '5000000',
        '-reconnect', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '2'
      );
    } else if (isHTTP) {
      args.push(
        '-reconnect', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '2',
        '-timeout', '5000000'
      );
    }

    // Common low-latency input flags
    args.push(
      '-fflags', 'nobuffer+fastseek+flush_packets',
      '-flags', 'low_delay',
      '-strict', 'experimental',
      '-i', stream.rtspUrl
    );

    // Video encoding - optimized for real-time with minimal latency
    args.push(
      '-c:v', 'libx264',  // H264 for better compatibility
      '-preset', 'ultrafast',
      '-tune', 'zerolatency',
      '-profile:v', 'baseline',
      '-level', '3.0',
      '-g', '30',  // GOP size
      '-keyint_min', '30',
      '-sc_threshold', '0',
      '-b:v', settings.bitrate,
      '-maxrate', settings.bitrate,
      '-bufsize', settings.bitrate,
      '-pix_fmt', 'yuv420p',
      '-s', `${settings.width}x${settings.height}`,
      '-r', settings.fps.toString(),
      '-threads', '0'
    );

    // Audio encoding
    args.push(
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ac', '2',
      '-ar', '48000'
    );

    // Output format - HLS with ultra-low latency settings
    const streamDir = path.join(config.streams.outputDir, stream.id);
    const outputPath = path.join(streamDir, 'index.m3u8');
    
    args.push(
      '-f', 'hls',
      '-hls_time', '1',           // 1 second segments for low latency
      '-hls_list_size', '3',       // Keep only 3 segments
      '-hls_flags', 'delete_segments+append_list',
      '-hls_allow_cache', '0',
      '-hls_segment_filename', path.join(streamDir, 'segment%03d.ts'),
      '-start_number', '0',
      outputPath
    );

    console.log(`[${stream.id}] Starting LOW-LATENCY HLS stream with FFmpeg`);
    console.log(`[${stream.id}] Protocol: ${isRTSP ? 'RTSP' : isHTTP ? 'HTTP/HTTPS' : 'Unknown'}`);
    console.log(`[${stream.id}] Quality: ${quality} (${settings.width}x${settings.height} @ ${settings.bitrate})`);
    console.log(`[${stream.id}] Latency: ~2-3 seconds (1s segments)`);
    
    const ffmpegProcess = spawn(config.ffmpeg.path, args);

    ffmpegProcess.stderr.on('data', (data) => {
      const output = data.toString();
      
      // Log important info
      if (output.includes('Stream mapping') || output.includes('Output #0')) {
        console.log(`✅ [${stream.id}] FFmpeg started successfully`);
        this.updateStreamStatus(stream.id, 'active');
      }
      
      if (output.includes('Opening') && output.includes('for writing')) {
        console.log(`📝 [${stream.id}] Creating HLS files...`);
      }
      
      if (output.includes('frame=')) {
        // Log every 100 frames
        const frameMatch = output.match(/frame=\s*(\d+)/);
        if (frameMatch && parseInt(frameMatch[1]) % 100 === 0) {
          console.log(`🎬 [${stream.id}] Processing frame ${frameMatch[1]}`);
        }
      }
      
      // Detect errors
      if (output.toLowerCase().includes('error') || output.includes('Connection refused') || output.includes('timed out')) {
        console.error(`❌ [${stream.id}] FFmpeg error: ${output}`);
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

  private broadcastToStreamPeers(streamId: string, message: any): void {
    for (const peer of this.peers.values()) {
      if (peer.streamId === streamId && peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.send(JSON.stringify(message));
      }
    }
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
      console.log(`🛑 Stopping stream: ${streamId}`);
      process.kill('SIGTERM');
      this.processes.delete(streamId);
    }

    // Notify all peers
    this.broadcastToStreamPeers(streamId, {
      type: 'stream-stopped',
      streamId
    });

    // Remove peers
    for (const [peerId, peer] of this.peers.entries()) {
      if (peer.streamId === streamId) {
        this.peers.delete(peerId);
      }
    }

    // Clean up stream files
    const streamDir = path.join(config.streams.outputDir, streamId);
    if (fs.existsSync(streamDir)) {
      try {
        fs.rmSync(streamDir, { recursive: true, force: true });
        console.log(`🗑️ Cleaned up stream directory: ${streamId}`);
      } catch (error) {
        console.error(`Failed to clean up stream directory: ${error}`);
      }
    }

    this.streams.delete(streamId);
    console.log(`✅ Stream stopped and cleaned up: ${streamId}`);
    return true;
  }

  getStream(streamId: string): StreamConfig | undefined {
    return this.streams.get(streamId);
  }

  getAllStreams(): StreamConfig[] {
    return Array.from(this.streams.values());
  }

  async stopAllStreams(): Promise<void> {
    const streamIds = Array.from(this.streams.keys());
    await Promise.all(streamIds.map(id => this.stopStream(id)));
  }

  getStats(streamId: string) {
    const stream = this.streams.get(streamId);
    if (!stream) return undefined;

    const viewers = Array.from(this.peers.values()).filter(p => p.streamId === streamId).length;

    return {
      streamId,
      viewers,
      bitrate: 0,
      fps: 0,
      uptime: Math.floor((Date.now() - stream.createdAt.getTime()) / 1000),
      errors: 0
    };
  }

  getAllStats() {
    return Array.from(this.streams.keys()).map(id => this.getStats(id)).filter(Boolean);
  }
}

export default new WebRTCStreamManager();
