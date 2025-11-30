import type { Room } from '@shared/schema';

const API_BASE = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    console.error('API error:', error);
    return { error: 'Network error' };
  }
}

export async function createRoom(hostName: string): Promise<ApiResponse<{ room: Room; playerId: string }>> {
  return fetchApi('/rooms', {
    method: 'POST',
    body: JSON.stringify({ hostName }),
  });
}

export async function joinRoom(code: string, playerName: string): Promise<ApiResponse<{ room: Room; playerId: string }>> {
  return fetchApi('/rooms/join', {
    method: 'POST',
    body: JSON.stringify({ code, playerName }),
  });
}

export async function getRoomByCode(code: string): Promise<ApiResponse<Room>> {
  return fetchApi(`/rooms/${code}`);
}

export async function startGame(roomId: string): Promise<ApiResponse<Room>> {
  return fetchApi(`/rooms/${roomId}/start`, {
    method: 'POST',
  });
}

export async function leaveRoom(roomId: string, playerId: string): Promise<ApiResponse<{ room: Room | null }>> {
  return fetchApi(`/rooms/${roomId}/leave`, {
    method: 'POST',
    body: JSON.stringify({ playerId }),
  });
}

export async function reconnectToRoom(roomId: string, playerId: string): Promise<ApiResponse<{ room: Room; playerId: string }>> {
  return fetchApi('/reconnect', {
    method: 'POST',
    body: JSON.stringify({ roomId, playerId }),
  });
}

export async function kickPlayer(roomId: string, hostId: string, playerIdToKick: string): Promise<ApiResponse<{ room: Room }>> {
  return fetchApi(`/rooms/${roomId}/kick`, {
    method: 'POST',
    body: JSON.stringify({ hostId, playerIdToKick }),
  });
}
