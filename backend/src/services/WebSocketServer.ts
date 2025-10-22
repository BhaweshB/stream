import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { Server } from 'http';
import StreamManager from './StreamManager';
import config from '../config';

class WebSocketServer {
  private wss: WSServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private pingInterval: NodeJS.Timeout | null = null;

  initialize(server: Server): void {
    this.wss = new WSServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('WebSocket client connected');
      this.clients.add(ws);

      // Send initial stream list
      this.sendToClient(ws, {
        type: 'streams',
        data: StreamManager.getAllStreams(),
      });

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    // Start ping interval to keep connections alive
    this.startPingInterval();

    console.log('WebSocket server initialized');
  }

  private handleMessage(ws: WebSocket, message: any): void {
    switch (message.type) {
      case 'subscribe':
        // Client subscribes to stream updates
        this.sendToClient(ws, {
          type: 'subscribed',
          streamId: message.streamId,
        });
        break;
      
      case 'ping':
        this.sendToClient(ws, { type: 'pong' });
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.ping();
        }
      });
    }, config.websocket.pingInterval);
  }

  private sendToClient(client: WebSocket, data: any): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  broadcast(data: any): void {
    const message = JSON.stringify(data);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  broadcastStreamUpdate(streamId: string): void {
    const stream = StreamManager.getStream(streamId);
    if (stream) {
      this.broadcast({
        type: 'streamUpdate',
        data: stream,
      });
    }
  }

  broadcastStreamsList(): void {
    this.broadcast({
      type: 'streams',
      data: StreamManager.getAllStreams(),
    });
  }

  stop(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.clients.forEach((client) => {
      client.close();
    });

    if (this.wss) {
      this.wss.close();
    }

    console.log('WebSocket server stopped');
  }
}

export default new WebSocketServer();
