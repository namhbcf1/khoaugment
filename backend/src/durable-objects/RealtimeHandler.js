/**
 * ============================================================================
 * REALTIME HANDLER - DURABLE OBJECT
 * ============================================================================
 * Handles real-time features like live updates, notifications, and WebSocket connections
 */

export class RealtimeHandler {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    switch (url.pathname) {
      case '/websocket':
        return this.handleWebSocket(request);
      case '/broadcast':
        return this.handleBroadcast(request);
      case '/status':
        return this.handleStatus(request);
      default:
        return new Response('Not found', { status: 404 });
    }
  }

  async handleWebSocket(request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    server.accept();
    
    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, {
      webSocket: server,
      userId: null,
      connectedAt: new Date().toISOString()
    });

    server.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(sessionId, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    server.addEventListener('close', () => {
      this.sessions.delete(sessionId);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async handleMessage(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    switch (data.type) {
      case 'auth':
        session.userId = data.userId;
        session.webSocket.send(JSON.stringify({
          type: 'auth_success',
          sessionId
        }));
        break;
        
      case 'ping':
        session.webSocket.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  async handleBroadcast(request) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const data = await request.json();
      const { type, payload, targetUserId } = data;

      const message = JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString()
      });

      let sentCount = 0;
      for (const [sessionId, session] of this.sessions) {
        if (!targetUserId || session.userId === targetUserId) {
          try {
            session.webSocket.send(message);
            sentCount++;
          } catch (error) {
            console.error('Failed to send message to session:', sessionId, error);
            this.sessions.delete(sessionId);
          }
        }
      }

      return new Response(JSON.stringify({
        success: true,
        sentCount
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Failed to broadcast message'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleStatus(request) {
    return new Response(JSON.stringify({
      activeSessions: this.sessions.size,
      sessions: Array.from(this.sessions.entries()).map(([id, session]) => ({
        id,
        userId: session.userId,
        connectedAt: session.connectedAt
      }))
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
