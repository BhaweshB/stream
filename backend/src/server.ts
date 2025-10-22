import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import http from 'http';
import config from './config';
import streamsRouter from './routes/streams';
import StreamManager from './services/WebRTCStreamManager';
import { errorHandler } from './middleware/errorHandler';
import { apiKeyAuth } from './middleware/auth';

const app: Application = express();
const server = http.createServer(app);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow configured frontend URL (with or without trailing slash)
    const allowedOrigins = [
      config.frontendUrl,
      config.frontendUrl.replace(/\/$/, ''), // without trailing slash
      config.frontendUrl + '/', // with trailing slash
      'http://localhost:5173', // local development
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindow * 60 * 1000,
  max: config.security.rateLimitMaxRequests,
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);

// Serve HLS streams
app.use('/streams', express.static(config.streams.outputDir, {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
  },
}));

// Health check
app.get('/health', (req, res) => {
  const streams = StreamManager.getAllStreams();
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    streams: {
      total: streams.length,
      active: streams.filter(s => s.status === 'active').length,
      error: streams.filter(s => s.status === 'error').length,
    },
  });
});

// API routes
app.use('/api/streams', apiKeyAuth, streamsRouter);

// Error handler
app.use(errorHandler);

// Initialize WebRTC WebSocket server
StreamManager.initializeWebSocket(server);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await StreamManager.stopAllStreams();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await StreamManager.stopAllStreams();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎥  RTSP Streaming Server                              ║
║                                                           ║
║   Server:     http://localhost:${config.port}                      ║
║   WebRTC WS:  ws://localhost:${config.port}/webrtc                 ║
║   Health:     http://localhost:${config.port}/health               ║
║   Environment: ${config.nodeEnv}                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
