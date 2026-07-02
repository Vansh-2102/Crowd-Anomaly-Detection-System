import SockJS from 'sockjs-client';
import { Client, StompSubscription } from '@stomp/stompjs';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

type MessageCallback = (body: unknown) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private connectionCallbacks: Array<() => void> = [];
  private disconnectionCallbacks: Array<() => void> = [];

  connect(token?: string): void {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('[WebSocket] Connected');
        this.connectionCallbacks.forEach((cb) => cb());
      },

      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        this.disconnectionCallbacks.forEach((cb) => cb());
      },

      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame);
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
  }

  subscribe(destination: string, callback: MessageCallback): void {
    if (!this.client?.active) {
      console.warn('[WebSocket] Not connected — queuing subscription');
      this.connectionCallbacks.push(() => this.subscribe(destination, callback));
      return;
    }

    if (this.subscriptions.has(destination)) return;

    const sub = this.client.subscribe(destination, (message) => {
      try {
        const body = JSON.parse(message.body);
        callback(body);
      } catch {
        callback(message.body);
      }
    });

    this.subscriptions.set(destination, sub);
  }

  unsubscribe(destination: string): void {
    const sub = this.subscriptions.get(destination);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  onConnect(callback: () => void): void {
    this.connectionCallbacks.push(callback);
  }

  onDisconnect(callback: () => void): void {
    this.disconnectionCallbacks.push(callback);
  }

  isConnected(): boolean {
    return this.client?.active ?? false;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
