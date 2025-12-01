import { randomUUID } from "crypto";
import type { Room, Player, Mission, DrawingData, PlayerRole, Ability, StoryContribution } from "@shared/schema";
import { MISSIONS, getRandomAbility, getMissionAlternatives, shuffleString, SPY_ABILITY_SCRAMBLE, SPY_ABILITY_REVOTE } from "@shared/schema";
import { notifyRoomUpdate } from "./websocket";

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
  kickPlayer(roomId: string, hostId: string, playerIdToKick: string): Promise<Room | null>;
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
    setInterval(() => this.cleanupOldRooms(), 30000);
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
      maxPlayers: 12,
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
      updatedAt: Date.now(),
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

  async cleanupOldRooms(): Promise<void> {
    const now = Date.now();
    const maxAge = 2 * 60 * 60 * 1000;
    const entries = Array.from(this.rooms.entries());

    for (const [roomId, room] of entries) {
      let roomChanged = false;

      const initialPlayerCount = room.players.length;
      room.players = room.players.filter((player: Player) => {
        if (!player.isConnected && player.disconnectTime && now - player.disconnectTime > 25000) {
          roomChanged = true;
          if (room.hostId === player.id) {
            const nextHost = room.players.find((p: Player) => p.id !== player.id);
            if (nextHost) {
              room.hostId = nextHost.id;
              nextHost.isHost = true;
            }
          }
          return false;
        }
        return true;
      });

      const activePlayers = room.players.filter((p: Player) => p.isConnected);
      if (room.status !== 'waiting' && room.status !== 'game_over' && activePlayers.length < 3) {
        room.status = 'game_over';
        room.winner = 'spies';
        room.gameOverReason = 'Jogo encerrado: Menos de 3 jogadores ativos.';
        roomChanged = true;
      }

      if (room.players.length === 0 || now - room.createdAt > maxAge) {
        this.rooms.delete(roomId);
        continue;
      }

      if (room.updatedAt && now - room.updatedAt > 86400000) {
        this.rooms.delete(roomId);
        continue;
      }

      if (roomChanged || initialPlayerCount !== room.players.length) {
        room.updatedAt = now;
        this.rooms.set(roomId, room);
        notifyRoomUpdate(roomId, room);
      }
    }
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
    room.updatedAt = Date.now();
    this.rooms.set(room.id, room);
    return { room, playerId };
  }

  async kickPlayer(roomId: string, hostId: string, playerIdToKick: string): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.hostId !== hostId) return null;
    if (room.hostId === playerIdToKick) return null;

    room.players = room.players.filter((p: Player) => p.id !== playerIdToKick);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    const activePlayers = room.players.filter((p: Player) => p.isConnected);
    if (room.status !== 'waiting' && activePlayers.length < 3) {
      room.status = 'game_over';
      room.winner = 'spies';
      room.gameOverReason = 'Jogo encerrado: Menos de 3 jogadores ativos.';
    }

    room.updatedAt = Date.now();
    this.rooms.set(roomId, room);
    return room;
  }

  async leaveRoom(roomId: string, playerId: string): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find((p: Player) => p.id === playerId);
    if (player) {
      player.isConnected = false;
      player.disconnectTime = Date.now();
    }

    const activePlayers = room.players.filter((p: Player) => p.isConnected);
    if (room.status !== 'waiting' && room.status !== 'game_over' && activePlayers.length < 3) {
      room.status = 'game_over';
      room.winner = 'spies';
      room.gameOverReason = 'Jogo encerrado: Menos de 3 jogadores ativos.';
    }

    if (room.hostId === playerId && room.players.length > 0) {
      const nextHost = room.players.find((p: Player) => p.id !== playerId && p.isConnected);
      if (nextHost) {
        room.hostId = nextHost.id;
        nextHost.isHost = true;
      }
    }

    room.updatedAt = Date.now();
    this.rooms.set(roomId, room);
    return room;
  }

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const updatedRoom = { ...room, ...updates, updatedAt: Date.now() };
    this.rooms.set(roomId, updatedRoom);
    return updatedRoom;
  }

  async startGame(roomId: string): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.players.length < 3) return null;

    const shuffled = shuffleArray([...room.players]);
    
    const numSpies = Math.max(1, Math.floor(room.players.length / 3));
    
    let hasTriple = false;
    let hasJester = false;
    
    if (room.players.length >= 7) {
      hasTriple = true;
      hasJester = true;
    } else if (room.players.length >= 5) {
      if (Math.random() < 0.5) {
        hasTriple = true;
      } else {
        hasJester = true;
      }
    }

    const playersWithRoles = shuffled.map((player, index) => {
      let role: PlayerRole = 'agent';
      if (index < numSpies) {
        role = 'spy';
      } else if (hasTriple && index === numSpies) {
        role = 'triple';
      } else if (hasJester && index === numSpies + (hasTriple ? 1 : 0)) {
        role = 'jester';
      }
      
      let abilities: Ability[] = [getRandomAbility(role)];
      
      if (role === 'spy') {
        const spyAbilities = [SPY_ABILITY_SCRAMBLE, SPY_ABILITY_REVOTE];
        abilities = [{ ...spyAbilities[Math.floor(Math.random() * spyAbilities.length)], used: false }];
      }
      
      return { ...player, role, abilities, isReady: false };
    });

    room.players = shuffleArray(playersWithRoles);
    room.status = 'role_reveal';
    room.mission = getRandomMission();
    room.missionAlternatives = getMissionAlternatives(room.mission, MISSIONS.length);
    room.currentPlayerIndex = 0;
    room.currentRound = 1;
    room.updatedAt = Date.now();

    this.rooms.set(roomId, room);
    return room;
  }

  async submitDrawing(roomId: string, drawing: DrawingData): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.drawings.push(drawing);
    
    const activePlayers = room.players.filter((p: Player) => !p.isEliminated);
    if (room.drawings.length >= activePlayers.length) {
      room.status = 'discussion';
    }

    room.updatedAt = Date.now();
    this.rooms.set(roomId, room);
    return room;
  }

  async submitVote(roomId: string, voterId: string, targetId: string): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.votes[voterId] = targetId;
    const player = room.players.find((p: Player) => p.id === voterId);
    if (player) {
      player.hasVoted = true;
      player.votedFor = targetId;
    }

    const activePlayers = room.players.filter((p: Player) => !p.isEliminated);
    const votedCount = Object.keys(room.votes).length;

    if (votedCount >= activePlayers.length) {
      room.previousRoundVotes = { ...room.votes };
      
      const voteCounts: Record<string, number> = {};
      const shieldedPlayers = new Set<string>();
      
      room.players.forEach((p: Player) => {
        const hasActiveShield = p.abilities?.some((a: Ability) => a.id === 'shield' && a.used);
        if (hasActiveShield) {
          shieldedPlayers.add(p.id);
        }
      });
      
      Object.entries(room.votes).forEach(([vid, tid]) => {
        const voter = room.players.find((p: Player) => p.id === vid);
        const hasNegativeVote = voter?.role === 'jester' && 
          voter.abilities?.some((a: Ability) => a.id === 'negative_vote');
        
        if (hasNegativeVote) {
          voteCounts[tid] = (voteCounts[tid] || 0) - 1;
        } else {
          voteCounts[tid] = (voteCounts[tid] || 0) + 1;
        }
      });

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

      if (maxVotes > 0) {
        if (playersWithMaxVotes.length > 1) {
          eliminatedId = playersWithMaxVotes[Math.floor(Math.random() * playersWithMaxVotes.length)];
        }
        
        if (shieldedPlayers.has(eliminatedId)) {
          room.status = 'voting_result';
          room.updatedAt = Date.now();
          this.rooms.set(roomId, room);
          return room;
        }
        
        const eliminatedPlayer = room.players.find((p: Player) => p.id === eliminatedId);
        if (eliminatedPlayer) {
          eliminatedPlayer.isEliminated = true;

          if (eliminatedPlayer.role === 'jester') {
            room.winner = 'jester';
            room.status = 'game_over';
          } else {
            const activeSpies = room.players.filter((p: Player) => !p.isEliminated && p.role === 'spy');
            const activeAgents = room.players.filter((p: Player) => !p.isEliminated && (p.role === 'agent' || p.role === 'triple'));

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
        room.status = 'voting_result';
      }
    }

    room.updatedAt = Date.now();
    this.rooms.set(roomId, room);
    return room;
  }

  async useAbility(roomId: string, playerId: string, abilityId: string, targetId?: string): Promise<{ room: Room; effect?: string } | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find((p: Player) => p.id === playerId);
    if (!player) return null;

    const ability = player.abilities.find((a: Ability) => a.id === abilityId && !a.used);
    if (!ability) return null;

    ability.used = true;
    let effect: string | undefined;

    switch (abilityId) {
      case 'scramble_fact':
        if (room.mission?.secretFact.value) {
          const scrambledFact = shuffleString(room.mission.secretFact.value);
          const spyNames = room.players.filter((p: Player) => p.role === 'spy' || p.role === 'triple').map((p: Player) => p.name).join(', ');
          
          const message = {
            id: randomUUID(),
            playerId: 'SYSTEM',
            playerName: 'SISTEMA',
            message: `[TRANSCRIÇÃO DE LIGAÇÃO] O Fato Secreto da missão atual é: ${scrambledFact}. Espiões: ${spyNames}.`,
            timestamp: Date.now(),
          };
          room.spyMessages.push(message);
          effect = `scrambled_fact:${scrambledFact}`;
        }
        break;
        
      case 'force_revote_30s':
        if (room.status === 'voting_result') {
          room.status = 'voting';
          room.votes = {};
          room.players.forEach((p: Player) => { p.hasVoted = false; p.votedFor = undefined; });
          effect = 'revote_forced';
        } else {
          ability.used = false;
        }
        break;
        
      case 'extra_time':
        effect = 'extra_time_added';
        break;

      case 'force_revote':
        room.votes = {};
        room.currentVoterIndex = 0;
        room.players.forEach((p: Player) => {
          p.hasVoted = false;
          p.votedFor = undefined;
        });
        effect = 'revote_forced';
        break;

      case 'spy_vote':
        if (targetId) {
          const targetPlayer = room.players.find((p: Player) => p.id === targetId);
          if (targetPlayer && targetPlayer.votedFor) {
            effect = `spy_vote:${targetPlayer.votedFor}`;
          }
        }
        break;

      case 'peek_role':
        if (targetId) {
          const targetPlayer = room.players.find((p: Player) => p.id === targetId);
          if (targetPlayer && targetPlayer.role) {
            effect = `peek_role:${targetPlayer.role}`;
          }
        }
        break;

      case 'shield':
        effect = 'shield_active';
        break;

      case 'swap_vote':
        if (room.status === 'voting' && player.hasVoted && targetId) {
          const oldVote = room.votes[playerId];
          room.votes[playerId] = targetId;
          player.votedFor = targetId;
          effect = `vote_swapped:${oldVote}:${targetId}`;
        }
        break;
    }

    room.updatedAt = Date.now();
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
        if (room.mission?.secretFact.type === 'drawing') {
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
        room.players.forEach((p: Player) => {
          p.hasVoted = false;
          p.votedFor = undefined;
        });
        break;
      case 'voting_result':
        if (room.currentRound >= room.maxRounds) {
          const activeSpies = room.players.filter((p: Player) => !p.isEliminated && p.role === 'spy');
          const activeAgents = room.players.filter((p: Player) => !p.isEliminated && (p.role === 'agent' || p.role === 'triple'));
          room.winner = activeSpies.length >= activeAgents.length ? 'spies' : 'agents';
          room.status = 'game_over';
        } else {
          room.currentRound++;
          room.mission = getRandomMission();
          room.drawings = [];
          room.votes = {};
          room.status = 'mission';
          room.players.forEach((p: Player) => {
            p.hasVoted = false;
            p.votedFor = undefined;
          });
        }
        break;
    }

    room.updatedAt = Date.now();
    this.rooms.set(roomId, room);
    return room;
  }

  async deleteRoom(roomId: string): Promise<void> {
    this.rooms.delete(roomId);
  }
}

export const storage = new MemStorage();
