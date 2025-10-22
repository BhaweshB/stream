import { useEffect, useRef, useState } from 'react';

interface WebRTCPlayerProps {
  streamUrl: string;
  onError?: (error: string) => void;
  onStatusChange?: (status: string) => void;
}

export function WebRTCPlayer({ streamUrl, onError, onStatusChange }: WebRTCPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const [status, setStatus] = useState<string>('Connecting...');
  const [bufferQueue, setBufferQueue] = useState<Uint8Array[]>([]);

  useEffect(() => {
    // Extract stream ID from URL (format: http://localhost:3000/webrtc/stream-id)
    const urlParts = streamUrl.split('/');
    const streamId = urlParts[urlParts.length - 1];
    
    if (!streamId) {
      onError?.('Invalid stream URL');
      return;
    }

    // Build WebSocket URL - always connect to /webrtc endpoint
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:3000/webrtc`;
    
    console.log('Connecting to WebRTC stream:', wsUrl);
    console.log('Stream ID:', streamId);
    setStatus('Connecting to stream...');
    onStatusChange?.('connecting');

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected successfully');
      console.log('📡 Subscribing to stream:', streamId);
      ws.send(JSON.stringify({
        type: 'subscribe',
        streamId: streamId
      }));
      setStatus('Subscribing...');
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'subscribed':
            console.log('✅ Subscribed to stream:', data.streamId);
            console.log('📺 Stream info:', data.stream);
            setStatus('Initializing player...');
            initializeMediaSource();
            break;

          case 'stream-active':
            console.log('Stream is active');
            setStatus('Streaming');
            onStatusChange?.('active');
            break;

          case 'video-chunk':
            // Receive video data chunks
            if (data.data) {
              try {
                const binaryString = atob(data.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                appendVideoChunk(bytes);
              } catch (error) {
                console.error('❌ Error processing video chunk:', error);
              }
            }
            break;

          case 'stream-stopped':
            setStatus('Stream stopped');
            onStatusChange?.('stopped');
            onError?.('Stream has been stopped');
            break;

          case 'error':
            console.error('❌ Stream error:', data.message);
            setStatus('Error');
            onError?.(data.message);
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setStatus('Connection error');
      onError?.('WebSocket connection failed');
    };

    ws.onclose = (event) => {
      console.log('🔌 WebSocket closed:', event.code, event.reason);
      setStatus('Disconnected');
      onStatusChange?.('disconnected');
    };

    return () => {
      console.log('🧹 Cleaning up WebRTC player');
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (sourceBufferRef.current) {
        sourceBufferRef.current = null;
      }
      if (mediaSourceRef.current) {
        try {
          if (mediaSourceRef.current.readyState === 'open') {
            mediaSourceRef.current.endOfStream();
          }
        } catch (error) {
          console.log('MediaSource already closed');
        }
      }
      if (videoRef.current) {
        videoRef.current.src = '';
      }
    };
  }, [streamUrl]);

  const initializeMediaSource = () => {
    if (!videoRef.current) return;

    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;
    videoRef.current.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', () => {
      console.log('📺 MediaSource opened');
      try {
        // Use MPEG-TS container with H.264 video and AAC audio
        const mimeType = 'video/mp2t; codecs="avc1.42E01E,mp4a.40.2"';
        
        if (!MediaSource.isTypeSupported(mimeType)) {
          console.error('❌ MIME type not supported:', mimeType);
          onError?.('Video format not supported by browser');
          return;
        }

        const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
        sourceBuffer.mode = 'sequence';
        sourceBufferRef.current = sourceBuffer;

        sourceBuffer.addEventListener('updateend', () => {
          // Process queued chunks
          if (bufferQueue.length > 0 && !sourceBuffer.updating) {
            const nextChunk = bufferQueue.shift();
            if (nextChunk && mediaSourceRef.current?.readyState === 'open') {
              try {
                sourceBuffer.appendBuffer(nextChunk as BufferSource);
              } catch (error) {
                console.error('Error appending queued buffer:', error);
              }
            }
          }
        });

        sourceBuffer.addEventListener('error', (e) => {
          console.error('❌ SourceBuffer error:', e);
        });

        console.log('✅ SourceBuffer initialized');

      } catch (error) {
        console.error('❌ Error creating SourceBuffer:', error);
        onError?.('Failed to initialize video player');
      }
    });

    mediaSource.addEventListener('sourceended', () => {
      console.log('🔚 MediaSource ended');
    });

    mediaSource.addEventListener('error', (e) => {
      console.error('❌ MediaSource error:', e);
      onError?.('Media source error');
    });
  };

  const appendVideoChunk = (chunk: Uint8Array) => {
    if (!sourceBufferRef.current || !mediaSourceRef.current) {
      console.warn('⚠️ SourceBuffer or MediaSource not ready');
      return;
    }

    if (mediaSourceRef.current.readyState !== 'open') {
      console.warn('⚠️ MediaSource not open, state:', mediaSourceRef.current.readyState);
      return;
    }

    if (sourceBufferRef.current.updating) {
      // Queue the chunk if buffer is updating
      setBufferQueue(prev => [...prev, chunk]);
    } else {
      try {
        sourceBufferRef.current.appendBuffer(chunk as BufferSource);
        
        // Auto-play when we have enough data
        if (videoRef.current && videoRef.current.paused && videoRef.current.readyState >= 2) {
          videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
        }
      } catch (error) {
        console.error('❌ Error appending buffer:', error);
        // Queue it for retry if MediaSource is still open
        if (mediaSourceRef.current.readyState === 'open') {
          setBufferQueue(prev => [...prev, chunk]);
        }
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        muted={false}
      />
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
        {status}
      </div>
    </div>
  );
}
