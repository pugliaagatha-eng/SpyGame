import { randomUUID } from "crypto";
import type { Room, Player, Mission, DrawingData, PlayerRole, Ability, GamePhase, SecretFact } from "@shared/schema";
import { MISSIONS, getRandomAbility, getMissionAlternatives } from "@shared/schema";

// --- NOVA FUNÇÃO: Algoritmo Fisher-Yates para embaralhamento real ---
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const getRandomMission = (): Mission => {
  return MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
};

export interface IStorage {
  createRoom(hostName: string): Promise<{ room: Room; playerId: string }>;
  getRoom(roomId: string): Promise<Room | undefined>;
  getRoomByCode(code: string): Promise<Room | undefined>;
  joinRoom(code: string, playerName: string): Promise<{ room: Room; playerId: string } | null>;
  leaveRoom(roomId: string, playerId: string): Promise<Room | null>;
  updateRoom(roomId: string, updates: Partial<Room>): Promise<Room | null>;
  startGame(roomId: string): Promise<Room | null>;
  submitDrawing(roomId: string, drawing: DrawingData): Promise<Room | null>;
  submitVote(roomId: string, voterId: string, targetId: string): Promise<Room | null>;
  useAbility(roomId: string, playerId: string, abilityId: string, targetId?: string): Promise<{ room: Room; effect?: string } | null>;
  nextPhase(roomId: string): Promise<Room | null>;
  deleteRoom(roomId: string): Promise<void>;
  cleanupOldRooms(): Promise<void>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
    setInterval(() => this.cleanupOldRooms(), 60000);
  }

  async createRoom(hostName: string): Promise<{ room: Room; playerId: string }> {
    const roomId = randomUUID();
    const playerId = randomUUID();
    
    let code = generateRoomCode();
    while (await this.getRoomByCode(code)) {
      code = generateRoomCode();
    }

    const host: Player = {
      id: playerId,
      name: hostName,
      isEliminated: false,
      abilities: [getRandomAbility()],
      hasVoted: false,
      isHost: true,
      isConnected: true,
    };

    const room: Room = {
      id: roomId,
      code,
      hostId: playerId,
      players: [host],
      status: 'waiting',
      maxPlayers: 10,
      currentRound: 1,
      maxRounds: 3,
      mission: null,
      missionAlternatives: [],
      drawings: [],
      votes: {},
      currentPlayerIndex: 0,
      currentVoterIndex: 0,
      currentDrawingPlayerIndex: 0,
      winner: null,
      messages: [],
      spyMessages: [],
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    return { room, playerId };
  }

  async getRoom(roomId: string): Promise<Room | undefined> {
    return this.rooms.get(roomId);
  }

  async getRoomByCode(code: string): Promise<Room | undefined> {
    const rooms = Array.from(this.rooms.values());
    for (const room of rooms) {
      if (room.code === code.toUpperCase()) {
        return room;
      }
    }
    return undefined;
  }

  async joinRoom(code: string, playerName: string): Promise<{ room: Room; playerId: string } | null> {
    const room = await this.getRoomByCode(code);
    if (!room) return null;
    if (room.status !== 'waiting') return null;
    if (room.players.length >= room.maxPlayers) return null;

    const playerId = randomUUID();
    const player: Player = {
      id: playerId,
      name: playerName,
      isEliminated: false,
      abilities: [getRandomAbility()],
      hasVoted: false,
      isHost: false,
      isConnected: true,
    };

    room.players.push(player);
    this.rooms.set(room.id, room);
    return { room, playerId };
  }

  async leaveRoom(roomId: string, playerId: string): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    if (room.hostId === playerId && room.players.length > 0) {
      room.hostId = room.players[0].id;
      room.players[0].isHost = true;
    }

    this.rooms.set(roomId, room);
    return room;
  }

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const updatedRoom = { ...room, ...updates };
    this.rooms.set(roomId, updatedRoom);
    return updatedRoom;
  }

  async startGame(roomId: string): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.players.length < 3) return null;

    // 1. Embaralha a lista inicial de jogadores para decidir quem pega qual papel
    const shuffled = shuffleArray([...room.players]);
    
    const numSpies = Math.max(1, Math.floor(room.players.length / 3));
    
    // Até 7 jogadores: Tolo OU Triplo (aleatório)
    // 7+ jogadores: Tolo E Triplo
    let hasTriple = false;
    let hasJester = false;
    
    if (room.players.length >= 5 && room.players.length < 7) {
      // Escolhe aleatoriamente entre Tolo ou Triplo
      if (Math.random() < 0.5) {
        hasTriple = true;
      } else {
        hasJester = true;
      }
    } else if (room.players.length >= 7) {
      // Ambos
      hasTriple = true;
      hasJester = true;
    }

    // 2. Atribui os papéis (Isso cria uma lista ordenada: Espiões primeiro, etc)
    const playersWithRoles = shuffled.map((player, index) => {
      let role: PlayerRole = 'agent';
      if (index < numSpies) {
        role = 'spy';
      } else if (hasTriple && index === numSpies) {
        role = 'triple';
      } else if (hasJester && index === numSpies + (hasTriple ? 1 : 0)) {
        role = 'jester';
      }
      // Re-rola a habilidade baseada no papel novo
      return { ...player, role, abilities: [getRandomAbility(role)], isReady: false };
    });

    // 3. --- CORREÇÃO IMPORTANTE ---
    // Embaralha a lista FINAL para que a ordem no array (e na tela) seja aleatória
    // e não revele quem é quem (ex: evitando que os primeiros sejam sempre espiões).
    room.players = shuffleArray(playersWithRoles);
    
    room.status = 'role_reveal';
    room.mission = getRandomMission();
    room.missionAlternatives = getMissionAlternatives(room.mission, 5);
    room.currentPlayerIndex = 0;
    room.currentRound = 1;

    this.rooms.set(roomId, room);
    return room;
  }

  async submitDrawing(roomId: string, drawing: DrawingData): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.drawings.push(drawing);
    
    const activePlayers = room.players.filter(p => !p.isEliminated);
    if (room.drawings.length >= activePlayers.length) {
      room.status = 'discussion';
    }

    this.rooms.set(roomId, room);
    return room;
  }

  async submitVote(roomId: string, voterId: string, targetId: string): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.votes[voterId] = targetId;
    const player = room.players.find(p => p.id === voterId);
    if (player) {
      player.hasVoted = true;
      player.votedFor = targetId;
    }

    const activePlayers = room.players.filter(p => !p.isEliminated);
    const votedCount = Object.keys(room.votes).length;

    if (votedCount >= activePlayers.length) {
      // Save previous round votes before clearing
      room.previousRoundVotes = { ...room.votes };
      
      // Count votes considering Jester's negative vote ability and Shield
      const voteCounts: Record<string, number> = {};
      const shieldedPlayers = new Set<string>();
      
      // Check for shielded players
      room.players.forEach(p => {
        const hasActiveShield = p.abilities?.some(a => a.id === 'shield' && a.used);
        if (hasActiveShield) {
          shieldedPlayers.add(p.id);
        }
      });
      
      Object.entries(room.votes).forEach(([voterId, targetId]) => {
        const voter = room.players.find(p => p.id === voterId);
        // Voto negativo do Tolo é sempre ativo (habilidade passiva)
        const hasNegativeVote = voter?.role === 'jester' && 
          voter.abilities?.some(a => a.id === 'negative_vote');
        
        if (hasNegativeVote) {
          // Jester's vote counts as -1
          voteCounts[targetId] = (voteCounts[targetId] || 0) - 1;
        } else {
          voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
        }
      });

      // Find player(s) with most votes
      let maxVotes = -Infinity;
      let eliminatedId = '';
      const playersWithMaxVotes: string[] = [];
      
      Object.entries(voteCounts).forEach(([id, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          eliminatedId = id;
          playersWithMaxVotes.length = 0;
          playersWithMaxVotes.push(id);
        } else if (count === maxVotes) {
          playersWithMaxVotes.push(id);
        }
      });

      // Only eliminate if someone has positive votes
      if (maxVotes > 0) {
        // If there's a tie, pick randomly
        if (playersWithMaxVotes.length > 1) {
          eliminatedId = playersWithMaxVotes[Math.floor(Math.random() * playersWithMaxVotes.length)];
        }
        
        // Check if player is shielded
        if (shieldedPlayers.has(eliminatedId)) {
          // Player is protected, no elimination
          room.status = 'voting_result';
          this.rooms.set(roomId, room);
          return room;
        }
        
        const eliminatedPlayer = room.players.find(p => p.id === eliminatedId);
        if (eliminatedPlayer) {
          eliminatedPlayer.isEliminated = true;

          if (eliminatedPlayer.role === 'jester') {
            room.winner = 'jester';
            room.status = 'game_over';
          } else {
            const activeSpies = room.players.filter(p => !p.isEliminated && p.role === 'spy');
            const activeAgents = room.players.filter(p => !p.isEliminated && (p.role === 'agent' || p.role === 'triple'));

            if (activeSpies.length === 0) {
              room.winner = 'agents';
              room.status = 'game_over';
            } else if (activeSpies.length > activeAgents.length) {
              room.winner = 'spies';
              room.status = 'game_over';
            } else {
              room.status = 'voting_result';
            }
          }
        }
      } else {
        // No one has positive votes, move to voting result without elimination
        room.status = 'voting_result';
      }
    }

    this.rooms.set(roomId, room);
    return room;
  }

  async useAbility(roomId: string, playerId: string, abilityId: string, targetId?: string): Promise<{ room: Room; effect?: string } | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    const ability = player.abilities.find(a => a.id === abilityId && !a.used);
    if (!ability) return null;

    let effect: string | undefined;

    // Mark ability as used
    player.abilities = player.abilities.map(a => 
      a.id === abilityId ? { ...a, used: true } : a
    );

    // Handle specific ability effects
    switch (abilityId) {
      case 'extra_time':
        // Add 30 seconds - this will be handled by the client via timer_sync
        effect = 'extra_time_added';
        break;

      case 'force_revote':
        // Reset all votes and voting state
        room.votes = {};
        room.currentVoterIndex = 0;
        room.players.forEach(p => {
          p.hasVoted = false;
          p.votedFor = undefined;
        });
        effect = 'revote_forced';
        break;

      case 'spy_vote':
        // Reveal target's vote (effect will be sent to client)
        if (targetId) {
          const targetPlayer = room.players.find(p => p.id === targetId);
          if (targetPlayer && targetPlayer.votedFor) {
            effect = `spy_vote:${targetPlayer.votedFor}`;
          }
        }
        break;

      case 'peek_role':
        // Reveal target's role
        if (targetId) {
          const targetPlayer = room.players.find(p => p.id === targetId);
          if (targetPlayer && targetPlayer.role) {
            effect = `peek_role:${targetPlayer.role}`;
          }
        }
        break;

      case 'shield':
        // Shield is handled during vote counting - mark for protection
        effect = 'shield_active';
        break;

      case 'swap_vote':
        // Allow changing vote during voting phase
        if (room.status === 'voting' && player.hasVoted && targetId) {
          const oldVote = room.votes[playerId];
          room.votes[playerId] = targetId;
          player.votedFor = targetId;
          effect = `vote_swapped:${oldVote}:${targetId}`;
        }
        break;
    }

    this.rooms.set(roomId, room);
    return { room, effect };
  }

  async nextPhase(roomId: string): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    switch (room.status) {
      case 'role_reveal':
        room.status = 'mission';
        break;
      case 'mission':
        if (room.mission?.title === 'Desenho Secreto') {
          room.status = 'drawing';
          room.currentDrawingPlayerIndex = 0;
        } else {
          room.status = 'discussion';
        }
        break;
      case 'drawing':
        room.status = 'discussion';
        break;
      case 'discussion':
        room.status = 'voting';
        room.votes = {};
        room.currentVoterIndex = 0;
        room.players.forEach(p => {
          p.hasVoted = false;
          p.votedFor = undefined;
        });
        break;
      case 'voting_result':
        if (room.currentRound >= room.maxRounds) {
          const activeSpies = room.players.filter(p => !p.isEliminated && p.role === 'spy');
          const activeAgents = room.players.filter(p => !p.isEliminated && (p.role === 'agent' || p.role === 'triple'));
          room.winner = activeSpies.length >= activeAgents.length ? 'spies' : 'agents';
          room.status = 'game_over';
        } else {
          room.currentRound++;
          room.mission = getRandomMission();
          room.drawings = [];
          room.votes = {};
          room.status = 'mission';
          room.players.forEach(p => {
            p.hasVoted = false;
            p.votedFor = undefined;
          });
        }
        break;
    }

    this.rooms.set(roomId, room);
    return room;
  }

  async deleteRoom(roomId: string): Promise<void> {
    this.rooms.delete(roomId);
  }

  async cleanupOldRooms(): Promise<void> {
    const now = Date.now();
    const maxAge = 2 * 60 * 60 * 1000;
    const entries = Array.from(this.rooms.entries());

    for (const [id, room] of entries) {
      if (now - room.createdAt > maxAge) {
        this.rooms.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();
