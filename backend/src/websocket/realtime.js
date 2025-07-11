/**
 * Real-time WebSocket Handler - NO MOCK DATA
 * 100% Real Live Updates with Cloudflare Durable Objects
 * Trường Phát Computer Hòa Bình
 */

export class RealtimeHandler {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/websocket') {
      return this.handleWebSocket(request);
    }
    
    if (url.pathname === '/broadcast') {
      return this.handleBroadcast(request);
    }
    
    return new Response('Not found', { status: 404 });
  }

  async handleWebSocket(request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    server.accept();
    
    // Generate session ID
    const sessionId = crypto.randomUUID();
    
    // Store session
    this.sessions.set(sessionId, {
      webSocket: server,
      userId: null,
      role: null,
      terminal: null,
      lastActivity: Date.now()
    });

    // Handle WebSocket events
    server.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);
        await this.handleMessage(sessionId, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
        server.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    server.addEventListener('close', () => {
      this.sessions.delete(sessionId);
      this.broadcastUserActivity();
    });

    server.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
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
        await this.handleAuth(sessionId, data);
        break;
      case 'subscribe':
        await this.handleSubscribe(sessionId, data);
        break;
      case 'ping':
        session.webSocket.send(JSON.stringify({ type: 'pong' }));
        break;
      case 'activity':
        await this.handleActivity(sessionId, data);
        break;
      default:
        session.webSocket.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type'
        }));
    }

    // Update last activity
    session.lastActivity = Date.now();
  }

  async handleAuth(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    try {
      // Verify JWT token
      const { verifyJWT } = await import('../utils/jwt.js');
      const payload = await verifyJWT(data.token, this.env.JWT_SECRET);
      
      if (payload) {
        session.userId = payload.userId;
        session.role = payload.role;
        session.terminal = data.terminal || 'web';
        
        session.webSocket.send(JSON.stringify({
          type: 'auth_success',
          user: {
            id: payload.userId,
            role: payload.role,
            name: payload.name
          }
        }));

        // Broadcast user activity update
        this.broadcastUserActivity();
      } else {
        session.webSocket.send(JSON.stringify({
          type: 'auth_error',
          message: 'Invalid token'
        }));
      }
    } catch (error) {
      session.webSocket.send(JSON.stringify({
        type: 'auth_error',
        message: 'Authentication failed'
      }));
    }
  }

  async handleSubscribe(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.userId) return;

    // Store subscription preferences
    session.subscriptions = data.channels || [];
    
    session.webSocket.send(JSON.stringify({
      type: 'subscribed',
      channels: session.subscriptions
    }));
  }

  async handleActivity(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.userId) return;

    session.currentActivity = data.activity;
    session.activityData = data.data;
    
    // Broadcast activity to other users
    this.broadcastUserActivity();
  }

  async handleBroadcast(request) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const data = await request.json();
      await this.broadcast(data);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async broadcast(data) {
    const message = JSON.stringify(data);
    
    for (const [sessionId, session] of this.sessions) {
      try {
        // Check if user is subscribed to this channel
        if (session.subscriptions && data.channel && 
            !session.subscriptions.includes(data.channel)) {
          continue;
        }

        // Check role permissions
        if (data.requireRole && !data.requireRole.includes(session.role)) {
          continue;
        }

        session.webSocket.send(message);
      } catch (error) {
        console.error('Broadcast error for session', sessionId, error);
        this.sessions.delete(sessionId);
      }
    }
  }

  broadcastUserActivity() {
    const activeUsers = [];
    
    for (const [sessionId, session] of this.sessions) {
      if (session.userId) {
        activeUsers.push({
          userId: session.userId,
          role: session.role,
          terminal: session.terminal,
          activity: session.currentActivity,
          activityData: session.activityData,
          lastActivity: session.lastActivity
        });
      }
    }

    this.broadcast({
      type: 'user_activity',
      channel: 'system',
      data: { activeUsers }
    });
  }

  // Broadcast inventory updates
  async broadcastInventoryUpdate(productId, oldQuantity, newQuantity, reason) {
    await this.broadcast({
      type: 'inventory_update',
      channel: 'inventory',
      data: {
        productId,
        oldQuantity,
        newQuantity,
        change: newQuantity - oldQuantity,
        reason,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Broadcast new orders
  async broadcastNewOrder(orderData) {
    await this.broadcast({
      type: 'new_order',
      channel: 'orders',
      data: orderData,
      requireRole: ['admin', 'manager', 'cashier']
    });
  }

  // Broadcast low stock alerts
  async broadcastLowStockAlert(productData) {
    await this.broadcast({
      type: 'low_stock_alert',
      channel: 'alerts',
      data: productData,
      requireRole: ['admin', 'manager']
    });
  }

  // Broadcast sales metrics updates
  async broadcastSalesUpdate(metricsData) {
    await this.broadcast({
      type: 'sales_update',
      channel: 'analytics',
      data: metricsData,
      requireRole: ['admin', 'manager']
    });
  }

  // Clean up inactive sessions
  async cleanup() {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastActivity > timeout) {
        try {
          session.webSocket.close();
        } catch (error) {
          // Ignore close errors
        }
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Durable Object class
export default class RealtimeDurableObject {
  constructor(state, env) {
    this.handler = new RealtimeHandler(state, env);
  }

  async fetch(request) {
    return this.handler.fetch(request);
  }

  async alarm() {
    await this.handler.cleanup();
    // Set next cleanup alarm
    await this.state.storage.setAlarm(Date.now() + 60000); // 1 minute
  }
}
