import { useEffect, useRef, useCallback, useState } from 'react';
import type { Room, WebSocketMessage } from '@shared/schema';

type MessageHandler = (message: WebSocketMessage) => void;

interface UseWebSocketReturn {
  isConnected: boolean;
  room: Room | null;
  sendMessage: (message: Partial<WebSocketMessage> & { action?: string }) => void;
  joinRoom: (roomId: string, playerId: string) => void;
  disconnect: () => void;
}

export function useWebSocket(onMessage?: MessageHandler): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageHandlerRef = useRef(onMessage);

  messageHandlerRef.current = onMessage;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        if (message.payload && typeof message.payload === 'object' && 'id' in message.payload) {
          setRoom(message.payload as Room);
        }

        messageHandlerRef.current?.(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setRoom(null);
  }, []);

  const sendMessage = useCallback((message: Partial<WebSocketMessage> & { action?: string }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }, []);

  const joinRoom = useCallback((roomId: string, playerId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connect();
      setTimeout(() => {
        sendMessage({ action: 'join_room', payload: { roomId, playerId } });
      }, 500);
    } else {
      sendMessage({ action: 'join_room', payload: { roomId, playerId } });
    }
  }, [connect, sendMessage]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    room,
    sendMessage,
    joinRoom,
    disconnect,
  };
}
