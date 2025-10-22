import { Router, Request, Response } from 'express';
import StreamManager from '../services/WebRTCStreamManager';
import { CreateStreamRequest } from '../types/stream';

const router = Router();

// Get all streams
router.get('/', async (req: Request, res: Response) => {
  try {
    const streams = StreamManager.getAllStreams();
    res.json({
      success: true,
      count: streams.length,
      streams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get single stream
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const stream = StreamManager.getStream(req.params.id);

    if (!stream) {
      return res.status(404).json({
        success: false,
        error: 'Stream not found',
      });
    }

    res.json({
      success: true,
      stream,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create new stream
router.post('/', async (req: Request, res: Response) => {
  try {
    const request: CreateStreamRequest = req.body;

    if (!request.name || !request.rtspUrl) {
      return res.status(400).json({
        success: false,
        error: 'Name and RTSP URL are required',
      });
    }

    if (!request.rtspUrl.startsWith('rtsp://') && !request.rtspUrl.startsWith('http://') && !request.rtspUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format. Must start with rtsp://, http://, or https://',
      });
    }

    const stream = await StreamManager.createStream(request);

    res.status(201).json({
      success: true,
      stream,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Stop stream
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await StreamManager.stopStream(req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Stream not found',
      });
    }

    res.json({
      success: true,
      message: 'Stream stopped successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get stream stats
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const stats = StreamManager.getStats(req.params.id);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Stats not found',
      });
    }

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
