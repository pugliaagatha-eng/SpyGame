import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { storage } from './storage';
import type { Room, DrawingData, WebSocketMessage, WebSocketMessageType, ChatMessage } from '@shared/schema';

interface ExtendedWebSocket extends WebSocket {
  roomId?: string;
  playerId?: string;
  isAlive?: boolean;
}

interface RoomClients {
  [roomId: string]: Set<ExtendedWebSocket>;
}

const roomClients: RoomClients = {};

export function setupWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      const extWs = ws as ExtendedWebSocket;
      if (extWs.isAlive === false) {
        handleDisconnect(extWs);
        return extWs.terminate();
      }
      extWs.isAlive = false;
      extWs.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeat);
  });

  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage & { action?: string };
        await handleMessage(ws, message);
      } catch (error) {
        console.error('WebSocket message error:', error);
        sendToClient(ws, { type: 'error', payload: { message: 'Invalid message format' } });
      }
    });

    ws.on('close', () => {
      handleDisconnect(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      handleDisconnect(ws);
    });
  });

  return wss;
}

async function handleMessage(ws: ExtendedWebSocket, message: WebSocketMessage & { action?: string }) {
  const { type, payload, roomId, playerId } = message;

  switch (message.action || type) {
    case 'join_room':
      await handleJoinRoom(ws, payload as { roomId: string; playerId: string });
      break;

    case 'leave_room':
      await handleLeaveRoom(ws);
      break;

    case 'start_game':
      await handleStartGame(ws.roomId!);
      break;

    case 'next_phase':
      await handleNextPhase(ws.roomId!);
      break;

    case 'submit_drawing':
      await handleSubmitDrawing(ws.roomId!, payload as DrawingData);
      break;

    case 'submit_vote':
      await handleSubmitVote(ws.roomId!, payload as { voterId: string; targetId: string });
      break;

    case 'use_ability':
      await handleUseAbility(ws.roomId!, payload as { playerId: string; abilityId: string; targetId?: string });
      break;

    case 'next_player':
      await handleNextPlayer(ws.roomId!);
      break;

    case 'player_ready':
      await handlePlayerReady(ws.roomId!, ws.playerId!);
      break;

    case 'start_mission':
      await handleStartMission(ws.roomId!);
      break;

    case 'send_chat_message':
      await handleChatMessage(ws.roomId!, payload as { playerId: string; playerName: string; message: string; emoji?: string });
      break;

    case 'ping':
      sendToClient(ws, { type: 'room_update', payload: { pong: true } });
      break;
  }
}

async function handleJoinRoom(ws: ExtendedWebSocket, payload: { roomId: string; playerId: string }) {
  const { roomId, playerId } = payload;
  
  ws.roomId = roomId;
  ws.playerId = playerId;

  if (!roomClients[roomId]) {
    roomClients[roomId] = new Set();
  }
  roomClients[roomId].add(ws);

  const room = await storage.getRoom(roomId);
  if (room) {
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.isConnected = true;
      await storage.updateRoom(roomId, { players: room.players });
    }
    sendToClient(ws, { type: 'room_update', payload: room });
    broadcastToRoom(roomId, { type: 'player_joined', payload: room }, ws);
  }
}

async function handleLeaveRoom(ws: ExtendedWebSocket) {
  if (ws.roomId && ws.playerId) {
    const room = await storage.leaveRoom(ws.roomId, ws.playerId);
    if (room) {
      broadcastToRoom(ws.roomId, { type: 'player_left', payload: room });
    }
    removeFromRoom(ws);
  }
}

async function handleDisconnect(ws: ExtendedWebSocket) {
  if (ws.roomId && ws.playerId) {
    const room = await storage.getRoom(ws.roomId);
    if (room) {
      const player = room.players.find(p => p.id === ws.playerId);
      if (player) {
        player.isConnected = false;
        await storage.updateRoom(ws.roomId, { players: room.players });
        broadcastToRoom(ws.roomId, { type: 'room_update', payload: room });
      }
    }
    removeFromRoom(ws);
  }
}

async function handleStartGame(roomId: string) {
  const room = await storage.startGame(roomId);
  if (room) {
    broadcastToRoom(roomId, { type: 'game_started', payload: room });
  }
}

async function handleNextPhase(roomId: string) {
  const room = await storage.nextPhase(roomId);
  if (room) {
    broadcastToRoom(roomId, { type: 'phase_changed', payload: room });
  }
}

async function handleNextPlayer(roomId: string) {
  const room = await storage.getRoom(roomId);
  if (room) {
    room.currentPlayerIndex++;
    if (room.currentPlayerIndex >= room.players.length) {
      room.currentPlayerIndex = 0;
      await storage.nextPhase(roomId);
      const updatedRoom = await storage.getRoom(roomId);
      if (updatedRoom) {
        broadcastToRoom(roomId, { type: 'phase_changed', payload: updatedRoom });
      }
    } else {
      await storage.updateRoom(roomId, { currentPlayerIndex: room.currentPlayerIndex });
      broadcastToRoom(roomId, { type: 'room_update', payload: room });
    }
  }
}

async function handleSubmitDrawing(roomId: string, drawing: DrawingData) {
  const room = await storage.submitDrawing(roomId, drawing);
  if (room) {
    broadcastToRoom(roomId, { type: 'drawing_submitted', payload: room });
  }
}

async function handleSubmitVote(roomId: string, payload: { voterId: string; targetId: string }) {
  const room = await storage.submitVote(roomId, payload.voterId, payload.targetId);
  if (room) {
    if (room.status === 'game_over') {
      broadcastToRoom(roomId, { type: 'game_over', payload: room });
    } else if (room.status === 'voting_result') {
      broadcastToRoom(roomId, { type: 'player_eliminated', payload: room });
    } else {
      broadcastToRoom(roomId, { type: 'vote_submitted', payload: room });
    }
  }
}

async function handleUseAbility(roomId: string, payload: { playerId: string; abilityId: string; targetId?: string }) {
  const result = await storage.useAbility(roomId, payload.playerId, payload.abilityId, payload.targetId);
  if (result) {
    const { room, effect } = result;
    
    // Broadcast ability used with effect information
    broadcastToRoom(roomId, { 
      type: 'ability_used', 
      payload: { 
        room, 
        playerId: payload.playerId, 
        abilityId: payload.abilityId, 
        targetId: payload.targetId,
        effect 
      } 
    });

    // Handle specific effects that need additional broadcasts
    if (effect === 'extra_time_added') {
      // Send timer sync to add 30 seconds
      broadcastToRoom(roomId, { 
        type: 'timer_sync', 
        payload: { action: 'add_time', seconds: 30 } 
      });
    } else if (effect === 'revote_forced') {
      // Broadcast phase change to reset voting UI
      broadcastToRoom(roomId, { type: 'phase_changed', payload: room });
    }
  }
}

async function handlePlayerReady(roomId: string, playerId: string) {
  const room = await storage.getRoom(roomId);
  if (room) {
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.isReady = true;
      await storage.updateRoom(roomId, { players: room.players });
      broadcastToRoom(roomId, { type: 'player_ready', payload: room });
    }
  }
}

async function handleStartMission(roomId: string) {
  const room = await storage.getRoom(roomId);
  if (room) {
    const allReady = room.players.every(p => p.isReady);
    if (!allReady) {
      return;
    }
    
    room.players.forEach(p => p.isReady = false);
    await storage.updateRoom(roomId, { players: room.players });
    
    await storage.nextPhase(roomId);
    const updatedRoom = await storage.getRoom(roomId);
    if (updatedRoom) {
      broadcastToRoom(roomId, { type: 'phase_changed', payload: updatedRoom });
    }
  }
}

async function handleChatMessage(roomId: string, payload: { playerId: string; playerName: string; message: string; emoji?: string }) {
  const room = await storage.getRoom(roomId);
  if (room) {
    const chatMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      playerId: payload.playerId,
      playerName: payload.playerName,
      message: payload.message,
      emoji: payload.emoji,
      timestamp: Date.now(),
    };
    
    room.messages.push(chatMessage);
    await storage.updateRoom(roomId, { messages: room.messages });
    
    broadcastToRoom(roomId, { type: 'chat_message', payload: chatMessage });
  }
}

function sendToClient(ws: ExtendedWebSocket, message: WebSocketMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcastToRoom(roomId: string, message: WebSocketMessage, exclude?: ExtendedWebSocket) {
  const clients = roomClients[roomId];
  if (clients) {
    clients.forEach((client) => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

export function notifyRoomUpdate(roomId: string, room: Room) {
  broadcastToRoom(roomId, { type: 'player_joined', payload: room });
}

function removeFromRoom(ws: ExtendedWebSocket) {
  if (ws.roomId && roomClients[ws.roomId]) {
    roomClients[ws.roomId].delete(ws);
    if (roomClients[ws.roomId].size === 0) {
      delete roomClients[ws.roomId];
    }
  }
  ws.roomId = undefined;
  ws.playerId = undefined;
}
