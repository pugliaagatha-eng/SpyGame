import { useState, useCallback, useMemo, useEffect } from 'react';
import CyberBackground from './CyberBackground';
import SplashScreen from './SplashScreen';
import RoomLobby from './RoomLobby';
import PlayerSetup from './PlayerSetup';
import RoleReveal from './RoleReveal';
import MissionPhase from './MissionPhase';
import DrawingCanvas from './DrawingCanvas';
import StoryPhase from './StoryPhase';
import DiscussionPhase from './DiscussionPhase';
import VotingPhase from './VotingPhase';
import VotingResult from './VotingResult';
import GameOver from './GameOver';
import AbilityPanel from './AbilityPanel';
import ChatPanel from './ChatPanel';
import SpyChatPanel from './SpyChatPanel';
import { useWebSocket } from '@/hooks/useWebSocket';
import { createRoom, joinRoom as apiJoinRoom, reconnectToRoom, kickPlayer } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAudio } from './AudioSystem';
import type { 
  GameMode, 
  Player, 
  Room, 
  Mission, 
  DrawingData, 
  PlayerRole,
  Ability,
  WebSocketMessage,
  SecretFact,
  ChatMessage,
  StoryContribution
} from '@shared/schema';
import { ABILITIES, MISSIONS, getRandomAbility, getMissionAlternatives } from '@shared/schema';

const generateId = () => Math.random().toString(36).substring(2, 9);

type LocalGamePhase = 
  | 'splash'
  | 'room_lobby'
  | 'player_setup'
  | 'role_reveal'
  | 'mission'
  | 'drawing'
  | 'story'
  | 'discussion'
  | 'voting'
  | 'voting_result'
  | 'game_over';

export default function SpyGame() {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [phase, setPhase] = useState<LocalGamePhase>('splash');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRounds] = useState(3);
  const [room, setRoom] = useState<Room | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [missionAlternatives, setMissionAlternatives] = useState<SecretFact[]>([]);
  const [drawings, setDrawings] = useState<DrawingData[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [previousRoundVotes, setPreviousRoundVotes] = useState<Record<string, string>>({});
  const [winner, setWinner] = useState<'agents' | 'spies' | 'jester' | null>(null);
  const [currentDrawingPlayerIndex, setCurrentDrawingPlayerIndex] = useState(0);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [spyChatMessages, setSpyChatMessages] = useState<ChatMessage[]>([]);
  const [isSpyChatMinimized, setIsSpyChatMinimized] = useState(false);
  const [storyContributions, setStoryContributions] = useState<StoryContribution[]>([]);
  const [currentStoryPlayerIndex, setCurrentStoryPlayerIndex] = useState(0);
  const { toast } = useToast();
  const { playWinSound } = useAudio();

  const myPlayer = useMemo(() => {
    return players.find(p => p.id === myPlayerId);
  }, [players, myPlayerId]);

  useEffect(() => {
    if (winner) {
      playWinSound(winner);
    }
  }, [winner, playWinSound]);

  // Detectar código da sala na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    
    if (roomCode && phase === 'splash') {
      // Automaticamente ir para modo online e preencher código
      setMode('online');
      setPhase('room_lobby');
      // O RoomLobby vai detectar o código via URL params
    }
  }, [phase]);

  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const SESSION_EXPIRY = 4 * 60 * 60 * 1000;
    
    const checkSavedSession = async () => {
      const savedSession = localStorage.getItem('spy-game-session');
      if (!savedSession) return;

      try {
        const { roomId, playerId, timestamp } = JSON.parse(savedSession);
        
        if (Date.now() - timestamp > SESSION_EXPIRY) {
          localStorage.removeItem('spy-game-session');
          return;
        }

        setIsReconnecting(true);
        const result = await reconnectToRoom(roomId, playerId);
        
        if (result.error) {
          localStorage.removeItem('spy-game-session');
          if (result.error !== 'Network error') {
            toast({ 
              title: 'Sessão expirada', 
              description: 'Sua sessão anterior não está mais disponível.',
              variant: 'destructive' 
            });
          }
          setIsReconnecting(false);
          return;
        }

        if (result.data) {
          setRoom(result.data.room);
          setPlayers(result.data.room.players);
          setMyPlayerId(result.data.playerId);
          setMode('online');
          
          const serverPhase = result.data.room.status;
          if (serverPhase === 'waiting') setPhase('room_lobby');
          else if (serverPhase === 'role_reveal') setPhase('role_reveal');
          else if (serverPhase === 'mission') setPhase('mission');
          else if (serverPhase === 'drawing') setPhase('drawing');
          else if (serverPhase === 'discussion') setPhase('discussion');
          else if (serverPhase === 'voting') setPhase('voting');
          else if (serverPhase === 'voting_result') setPhase('voting_result');
          else setPhase('room_lobby');
          
          if (result.data.room.mission) {
            setMission(result.data.room.mission);
          }
          
          toast({ 
            title: 'Reconectado!', 
            description: `Você voltou para a sala ${result.data.room.code}.`
          });
        }
        setIsReconnecting(false);
      } catch (error) {
        localStorage.removeItem('spy-game-session');
        setIsReconnecting(false);
      }
    };

    checkSavedSession();
  }, [toast]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    const payload = message.payload as Room | undefined;
    
    switch (message.type) {
      case 'room_update':
      case 'player_joined':
              case 'player_left':
              case 'player_kicked': // Adicionado para lidar com a expulsão
                if (payload && 'id' in payload) {
                  setRoom(payload);
                  setPlayers(payload.players);
                  
                  // Se o jogador expulso for o próprio usuário
                  if (message.type === 'player_kicked' && payload.players.every(p => p.id !== myPlayerId)) {
                    toast({ title: 'Você foi expulso!', description: 'O host removeu você da sala.', variant: 'destructive' });
                    setRoom(null);
                    setMyPlayerId(null);
                    setPhase('splash');
                    localStorage.removeItem('spy-game-session');
                  }
                }
                break;

      case 'game_started':
        if (payload && 'id' in payload) {
          setRoom(payload);
          setPlayers(payload.players);
          setMission(payload.mission);
          setMissionAlternatives(payload.missionAlternatives || []);
          setPhase('role_reveal');
          setCurrentPlayerIndex(0);
        }
        break;

      case 'phase_changed':
        if (payload && 'id' in payload) {
          setRoom(payload);
          setPlayers(payload.players);
          setMission(payload.mission);
          setDrawings(payload.drawings);
          setVotes(payload.votes);
          setCurrentRound(payload.currentRound);
          if (payload.previousRoundVotes) {
            setPreviousRoundVotes(payload.previousRoundVotes);
          }
          if (payload.storyContributions) {
            setStoryContributions(payload.storyContributions);
          }
          if (payload.currentStoryPlayerIndex !== undefined) {
            setCurrentStoryPlayerIndex(payload.currentStoryPlayerIndex);
          }
          
          const serverPhase = payload.status;
          if (serverPhase === 'waiting') setPhase('room_lobby');
          else if (serverPhase === 'role_reveal') setPhase('role_reveal');
          else if (serverPhase === 'mission') setPhase('mission');
          else if (serverPhase === 'drawing') setPhase('drawing');
          else if (serverPhase === 'story') setPhase('story');
          else if (serverPhase === 'discussion') setPhase('discussion');
          else if (serverPhase === 'voting') setPhase('voting');
          else if (serverPhase === 'voting_result') setPhase('voting_result');
          else if (serverPhase === 'game_over') {
            setPhase('game_over');
            setWinner(payload.winner);
          }
        }
        break;

      case 'story_turn_update':
        if (payload && 'id' in payload) {
          setRoom(payload);
          if (payload.storyContributions) {
            setStoryContributions(payload.storyContributions);
          }
          if (payload.currentStoryPlayerIndex !== undefined) {
            setCurrentStoryPlayerIndex(payload.currentStoryPlayerIndex);
          }
        }
        break;

      case 'drawing_submitted':
        if (payload && 'id' in payload) {
          setRoom(payload);
          setDrawings(payload.drawings);
          if (payload.status === 'discussion') {
            setPhase('discussion');
          }
        }
        break;

      case 'vote_submitted':
        if (payload && 'id' in payload) {
          setRoom(payload);
          setPlayers(payload.players);
          setVotes(payload.votes);
        }
        break;

      case 'player_eliminated':
        if (payload && 'id' in payload) {
          setRoom(payload);
          setPlayers(payload.players);
          setVotes(payload.votes);
          setPhase('voting_result');
        }
        break;

      case 'game_over':
        if (payload && 'id' in payload) {
          setRoom(payload);
          setPlayers(payload.players);
          setWinner(payload.winner);
          setPhase('game_over');
        }
        break;

      case 'chat_message':
        if (message.payload) {
          setChatMessages(prev => [...prev, message.payload as ChatMessage]);
        }
        break;

      case 'spy_chat_message':
        if (message.payload) {
          setSpyChatMessages(prev => [...prev, message.payload as ChatMessage]);
        }
        break;

      case 'ability_used':
        {
          const abilityPayload = message.payload as { room: Room; playerId: string; abilityId: string; targetId?: string; effect?: string };
          if (abilityPayload && abilityPayload.room) {
            setRoom(abilityPayload.room);
            setPlayers(abilityPayload.room.players);
            setVotes(abilityPayload.room.votes);
            setCurrentVoterIndex(abilityPayload.room.currentVoterIndex);
            
            // Handle ability effects
            if (abilityPayload.effect === 'revote_forced') {
              toast({
                title: "Revotação!",
                description: "Uma habilidade forçou uma nova votação.",
              });
            } else if (abilityPayload.effect === 'extra_time_added') {
              toast({
                title: "Tempo Extra!",
                description: "+30 segundos adicionados ao timer.",
              });
            } else if (abilityPayload.effect?.startsWith('spy_vote:')) {
              const votedForId = abilityPayload.effect.split(':')[1];
              const votedFor = abilityPayload.room.players.find(p => p.id === votedForId);
              if (votedFor && abilityPayload.playerId === myPlayerId) {
                toast({
                  title: "Voto Revelado!",
                  description: `O alvo votou em ${votedFor.name}.`,
                });
              }
            } else if (abilityPayload.effect?.startsWith('peek_role:')) {
              const role = abilityPayload.effect.split(':')[1];
              if (abilityPayload.playerId === myPlayerId) {
                const roleNames: Record<string, string> = {
                  'agent': 'Agente',
                  'spy': 'Espião',
                  'triple': 'Agente Triplo',
                  'jester': 'Tolo'
                };
                toast({
                  title: "Papel Revelado!",
                  description: `O alvo é ${roleNames[role] || role}.`,
                });
              }
            }
          }
        }
        break;

      case 'timer_sync':
        {
          const timerPayload = message.payload as { action: string; seconds: number };
          if (timerPayload?.action === 'add_time') {
            setTimeRemaining(prev => prev + timerPayload.seconds);
          }
        }
        break;

      case 'player_ready':
        if (payload && 'id' in payload) {
          setRoom(payload);
          setPlayers(payload.players);
        }
        break;
    }
  }, []);

  const { isConnected, sendMessage, joinRoom: wsJoinRoom } = useWebSocket(handleWebSocketMessage);

  const handleSelectMode = useCallback((selectedMode: GameMode) => {
    setMode(selectedMode);
    setPhase(selectedMode === 'online' ? 'room_lobby' : 'player_setup');
  }, []);

  const saveSession = useCallback((roomId: string, playerId: string) => {
    localStorage.setItem('spy-game-session', JSON.stringify({ roomId, playerId, timestamp: Date.now() }));
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('spy-game-session');
  }, []);

  const handleCreateRoom = useCallback(async (hostName: string) => {
    const result = await createRoom(hostName);
    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' });
      return;
    }
    if (result.data) {
      setRoom(result.data.room);
      setPlayers(result.data.room.players);
      setMyPlayerId(result.data.playerId);
      wsJoinRoom(result.data.room.id, result.data.playerId);
      saveSession(result.data.room.id, result.data.playerId);
    }
  }, [toast, wsJoinRoom, saveSession]);



  const handleJoinRoom = useCallback(async (code: string, playerName: string) => {
    const result = await apiJoinRoom(code, playerName);
    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' });
      return;
    }
    if (result.data) {
      setRoom(result.data.room);
      setPlayers(result.data.room.players);
      setMyPlayerId(result.data.playerId);
      wsJoinRoom(result.data.room.id, result.data.playerId);
      saveSession(result.data.room.id, result.data.playerId);
    }
  }, [toast, wsJoinRoom, saveSession]);

  const handleKickPlayer = useCallback(async (playerIdToKick: string) => {
    if (!room || !myPlayerId) return;
    
    const result = await kickPlayer(room.id, myPlayerId, playerIdToKick);
    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' });
      return;
    }
    if (result.data) {
      setRoom(result.data.room);
      setPlayers(result.data.room.players);
      toast({ title: 'Jogador expulso', description: 'O jogador foi removido da sala.' });
    }
  }, [room, myPlayerId, toast]);

  const handleAddPlayer = useCallback((name: string) => {
    const ability = ABILITIES[Math.floor(Math.random() * ABILITIES.length)];
    const newPlayer: Player = {
      id: generateId(),
      name,
      isEliminated: false,
      abilities: [{ ...ability, used: false }],
      hasVoted: false,
      isHost: players.length === 0,
      isConnected: true,
    };
    setPlayers(prev => [...prev, newPlayer]);
  }, [players.length]);

  const handleRemovePlayer = useCallback((id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }, []);

  const assignRoles = useCallback((playerList: Player[]): Player[] => {
    const shuffled = [...playerList].sort(() => Math.random() - 0.5);
    const numSpies = Math.max(1, Math.floor(playerList.length / 3));
    
    // Até 7 jogadores: Tolo OU Triplo (aleatório)
    // 7+ jogadores: Tolo E Triplo
    let hasTriple = false;
    let hasJester = false;
    
    if (playerList.length >= 5 && playerList.length < 7) {
      // Escolhe aleatoriamente entre Tolo ou Triplo
      if (Math.random() < 0.5) {
        hasTriple = true;
      } else {
        hasJester = true;
      }
    } else if (playerList.length >= 7) {
      // Ambos
      hasTriple = true;
      hasJester = true;
    }
    
    return shuffled.map((player, index) => {
      let role: PlayerRole = 'agent';
      if (index < numSpies) {
        role = 'spy';
      } else if (hasTriple && index === numSpies) {
        role = 'triple';
      } else if (hasJester && index === numSpies + (hasTriple ? 1 : 0)) {
        role = 'jester';
      }
      return { 
        ...player, 
        role,
        abilities: [getRandomAbility(role)]
      };
    });
  }, []);

  const handleStartGame = useCallback((playerNames?: string[]) => {
    if (mode === 'online' && room) {
      sendMessage({ action: 'start_game', roomId: room.id });
    } else if (playerNames && playerNames.length >= 3) {
      const newPlayers: Player[] = playerNames.map((name, index) => ({
        id: generateId(),
        name,
        isEliminated: false,
        abilities: [],
        hasVoted: false,
        isHost: index === 0,
        isConnected: true,
      }));
      const playersWithRoles = assignRoles(newPlayers);
      // Embaralhar a ordem de exibição dos papéis para não revelar quem é quem
      const shuffledPlayers = [...playersWithRoles].sort(() => Math.random() - 0.5);
      const selectedMission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
      const alternatives = getMissionAlternatives(selectedMission, 5);
      setPlayers(shuffledPlayers);
      setMission(selectedMission);
      setMissionAlternatives(alternatives);
      setPhase('role_reveal');
      setCurrentPlayerIndex(0);
    }
  }, [mode, room, assignRoles, sendMessage]);

  const handleNextPlayerReveal = useCallback(() => {
    if (mode === 'online' && room) {
      sendMessage({ action: 'next_player', roomId: room.id });
    } else {
      const nextIndex = currentPlayerIndex + 1;
      if (nextIndex >= players.length) {
        setPhase('mission');
        setCurrentPlayerIndex(0);
      } else {
        setCurrentPlayerIndex(nextIndex);
      }
    }
  }, [mode, room, currentPlayerIndex, players.length, sendMessage]);

  const handlePlayerReady = useCallback(() => {
    if (mode === 'online' && room) {
      sendMessage({ action: 'player_ready', roomId: room.id });
    }
  }, [mode, room, sendMessage]);

  const handleStartMissionFromRoleReveal = useCallback(() => {
    if (mode === 'online' && room) {
      sendMessage({ action: 'start_mission', roomId: room.id });
    } else {
      setPhase('mission');
    }
  }, [mode, room, sendMessage]);

  const handleStartMission = useCallback(() => {
    if (mode === 'online' && room) {
      sendMessage({ action: 'next_phase', roomId: room.id });
    } else {
      const isDrawingMission = mission?.secretFact.type === 'drawing';
      if (isDrawingMission) {
        setCurrentDrawingPlayerIndex(0);
        setDrawings([]);
        setPhase('drawing');
      } else {
        setPhase('discussion');
      }
    }
  }, [mode, room, mission, sendMessage]);

  const handleSubmitDrawing = useCallback((imageData: string) => {
    const activePlayers = players.filter(p => !p.isEliminated);
    // No modo online, usa myPlayer; no modo local, usa currentDrawingPlayer
    const currentPlayer = mode === 'online' && myPlayerId 
      ? players.find(p => p.id === myPlayerId)
      : activePlayers[currentDrawingPlayerIndex];
    
    if (!currentPlayer) return;

    const drawingData: DrawingData = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      imageData,
    };

    if (mode === 'online' && room) {
      sendMessage({ action: 'submit_drawing', roomId: room.id, payload: drawingData });
    } else {
      setDrawings(prev => [...prev, drawingData]);
      
      const nextIndex = currentDrawingPlayerIndex + 1;
      if (nextIndex >= activePlayers.length) {
        setPhase('discussion');
      } else {
        setCurrentDrawingPlayerIndex(nextIndex);
      }
    }
  }, [mode, room, players, currentDrawingPlayerIndex, myPlayerId, sendMessage]);

  const handleStartVoting = useCallback(() => {
    if (mode === 'online' && room) {
      sendMessage({ action: 'next_phase', roomId: room.id });
    } else {
      setPhase('voting');
      setVotes({});
      setCurrentVoterIndex(0);
      setPlayers(prev => prev.map(p => ({ ...p, hasVoted: false, votedFor: undefined })));
    }
  }, [mode, room, sendMessage]);

  const handleVote = useCallback((voterId: string, targetId: string) => {
    if (mode === 'online' && room) {
      sendMessage({ action: 'submit_vote', roomId: room.id, payload: { voterId, targetId } });
    } else {
      setVotes(prev => ({ ...prev, [voterId]: targetId }));
      setPlayers(prev => prev.map(p => 
        p.id === voterId ? { ...p, hasVoted: true, votedFor: targetId } : p
      ));
    }
  }, [mode, room, sendMessage]);

  const handleConfirmVote = useCallback(() => {
    if (mode === 'online') return;

    const activePlayers = players.filter(p => !p.isEliminated);
    const nextIndex = currentVoterIndex + 1;
    
    if (nextIndex >= activePlayers.length) {
      // Count votes considering Jester's negative vote ability
      const voteCounts: Record<string, number> = {};
      
      Object.entries(votes).forEach(([voterId, targetId]) => {
        const voter = players.find(p => p.id === voterId);
        const hasNegativeVote = voter?.role === 'jester' && 
          voter.abilities?.some(a => a.id === 'negative_vote' && !a.used);
        
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
      
      // Save votes for next round's forensic investigation
      setPreviousRoundVotes({...votes});
      
      // If maxVotes is 0 or negative, no one gets eliminated (Jester's -1 vote saved them)
      if (maxVotes <= 0) {
        toast({
          title: "Ninguém foi eliminado!",
          description: "Os votos negativos salvaram todos os alvos.",
        });
        setPhase('voting_result');
        return;
      }
      
      // If there's a tie with positive votes, pick randomly
      if (playersWithMaxVotes.length > 1) {
        eliminatedId = playersWithMaxVotes[Math.floor(Math.random() * playersWithMaxVotes.length)];
      }
      
      const eliminatedPlayer = players.find(p => p.id === eliminatedId);
      
      if (eliminatedPlayer?.role === 'jester') {
        setWinner('jester');
        setPlayers(prev => prev.map(p => p.id === eliminatedId ? { ...p, isEliminated: true } : p));
        setPhase('game_over');
      } else {
        setPlayers(prev => {
          const updated = prev.map(p => p.id === eliminatedId ? { ...p, isEliminated: true } : p);
          
          const activeSpies = updated.filter(p => !p.isEliminated && p.role === 'spy');
          const activeAgents = updated.filter(p => !p.isEliminated && (p.role === 'agent' || p.role === 'triple'));
          
          if (activeSpies.length === 0) {
            setTimeout(() => {
              setWinner('agents');
              setPhase('game_over');
            }, 0);
          } else if (activeSpies.length >= activeAgents.length) {
            setTimeout(() => {
              setWinner('spies');
              setPhase('game_over');
            }, 0);
          }
          
          return updated;
        });
        setPhase('voting_result');
      }
    } else {
      setCurrentVoterIndex(nextIndex);
    }
  }, [mode, players, currentVoterIndex, votes, toast]);

  const handleContinueFromResult = useCallback(() => {
    if (mode === 'online' && room) {
      sendMessage({ action: 'next_phase', roomId: room.id });
    } else {
      const nextRound = currentRound + 1;
      if (nextRound > maxRounds) {
        const activeSpies = players.filter(p => !p.isEliminated && p.role === 'spy');
        const activeAgents = players.filter(p => !p.isEliminated && (p.role === 'agent' || p.role === 'triple'));
        setWinner(activeSpies.length >= activeAgents.length ? 'spies' : 'agents');
        setPhase('game_over');
      } else {
        setCurrentRound(nextRound);
        const selectedMission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
        setMission(selectedMission);
        setVotes({});
        setDrawings([]);
        setPhase('mission');
        // NÃO resetar habilidades - elas devem ser usadas apenas uma vez por partida
        setPlayers(prev => prev.map(p => ({ ...p, hasVoted: false, votedFor: undefined })));
      }
    }
  }, [mode, room, currentRound, maxRounds, players, sendMessage]);

  const handleUseAbility = useCallback((abilityId: string, targetId?: string) => {
    const currentPlayer = players[currentPlayerIndex] || players.find(p => !p.isEliminated);
    if (!currentPlayer) return;
    
    if (mode === 'online' && room) {
      sendMessage({ 
        action: 'use_ability', 
        roomId: room.id, 
        payload: { playerId: currentPlayer.id, abilityId, targetId } 
      });
    } else {
      setPlayers(prev => prev.map(p => {
        if (p.id === currentPlayer.id) {
          return {
            ...p,
            abilities: p.abilities.map(a => 
              a.id === abilityId ? { ...a, used: true } : a
            ),
          };
        }
        return p;
      }));
    }
  }, [mode, room, players, currentPlayerIndex, sendMessage]);

  const handlePlayAgain = useCallback(() => {
    setPlayers(prev => prev.map(p => ({
      ...p,
      role: undefined,
      isEliminated: false,
      hasVoted: false,
      votedFor: undefined,
      abilities: [{ ...ABILITIES[Math.floor(Math.random() * ABILITIES.length)], used: false }],
    })));
    setCurrentRound(1);
    setVotes({});
    setDrawings([]);
    setWinner(null);
    setPhase(mode === 'online' ? 'room_lobby' : 'player_setup');
  }, [mode]);

  const handleBackToMenu = useCallback(() => {
    if (mode === 'online' && room && myPlayerId) {
      sendMessage({ action: 'leave_room', roomId: room.id, playerId: myPlayerId });
    }
    clearSession();
    setMode(null);
    setPhase('splash');
    setPlayers([]);
    setRoom(null);
    setCurrentRound(1);
    setVotes({});
    setDrawings([]);
    setWinner(null);
    setMyPlayerId(null);
  }, [mode, room, myPlayerId, sendMessage, clearSession]);

  const spyList = useMemo(() => {
    return players
      .filter(p => p.role === 'spy' || p.role === 'triple')
      .map(p => p.name);
  }, [players]);

  const agentList = useMemo(() => {
    return players
      .filter(p => p.role === 'agent')
      .map(p => p.name);
  }, [players]);

  const activePlayers = useMemo(() => players.filter(p => !p.isEliminated), [players]);
  const currentVoter = activePlayers[currentVoterIndex];
  const currentPlayer = players[currentPlayerIndex];
  const currentDrawingPlayer = activePlayers[currentDrawingPlayerIndex];
  const eliminatedPlayer = players.find(p => p.isEliminated && Object.values(votes).includes(p.id));
    const isHost = room ? room.hostId === myPlayerId : true;
    const myPlayerInfo = myPlayerId ? players.find(p => p.id === myPlayerId) : currentPlayer;

  const isDrawingMission = mission?.secretFact.type === 'drawing';
  // In online mode, show abilities for the player during discussion/voting
  // In local mode, only show abilities for the current voter during voting phase
  const abilityPlayer = mode === 'online' ? myPlayer : currentVoter;
  const showAbilityPanel = mode === 'online' 
    ? ['discussion', 'voting'].includes(phase) && !!myPlayer && myPlayer.id
    : phase === 'voting' && !!currentVoter && currentVoter.id;

  return (
    <div className="min-h-screen">
      <CyberBackground />
      
      {phase !== 'splash' && phase !== 'game_over' && (
        <button
          onClick={handleBackToMenu}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500 transition-all text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      )}
      
      {phase === 'splash' && (
        <SplashScreen onSelectMode={handleSelectMode} />
      )}

      {phase === 'room_lobby' && (
        <RoomLobby
          room={room}
          isHost={isHost}
          myPlayerId={myPlayerId}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onStartGame={handleStartGame}
          onBack={handleBackToMenu}
          onKickPlayer={handleKickPlayer}
        />
      )}

      {phase === 'player_setup' && (
        <PlayerSetup
          players={players}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
          onStartGame={handleStartGame}
          onBack={handleBackToMenu}
        />
      )}

      {phase === 'role_reveal' && currentPlayer && (
        <RoleReveal
          key={`role-reveal-${mode === 'online' ? myPlayerId : currentPlayerIndex}`}
          player={mode === 'online' && myPlayer ? myPlayer : currentPlayer}
          secretFact={mission?.secretFact ?? null}
          missionAlternatives={missionAlternatives}
          spyList={spyList}
          agentList={agentList}
          onNext={handleNextPlayerReveal}
          isLast={currentPlayerIndex === players.length - 1}
          isOnlineMode={mode === 'online'}
          allPlayers={players}
          isHost={isHost}
          onReady={handlePlayerReady}
          onStartMission={handleStartMissionFromRoleReveal}
        />
      )}

      {phase === 'mission' && mission && (
          <MissionPhase
            mission={mission}
            currentRound={currentRound}
            maxRounds={maxRounds}
            onStartDiscussion={handleStartMission}
            isDrawingMission={mission.secretFact.type === 'drawing'}
            onStartDrawing={handleStartMission}
            isHost={myPlayer?.isHost || false}
            playerRole={mode === 'online' ? myPlayer?.role : currentPlayer?.role}
          />
      )}

      {phase === 'drawing' && mission && (mode === 'online' ? myPlayer : currentDrawingPlayer) && (
        <DrawingCanvas
          playerName={mode === 'online' && myPlayer ? myPlayer.name : currentDrawingPlayer?.name || ''}
          word={(mode === 'online' && myPlayer ? myPlayer.role : currentDrawingPlayer?.role) === 'agent' || (mode === 'online' && myPlayer ? myPlayer.role : currentDrawingPlayer?.role) === 'triple' 
            ? mission.secretFact.value 
            : undefined}
          hint={mission.secretFact.hint}
          duration={mission.duration}
          onSubmit={handleSubmitDrawing}
          isAgent={(mode === 'online' && myPlayer ? myPlayer.role : currentDrawingPlayer?.role) === 'agent' || (mode === 'online' && myPlayer ? myPlayer.role : currentDrawingPlayer?.role) === 'triple'}
        />
      )}

      {phase === 'story' && mission && myPlayer && (
        <StoryPhase
          mission={mission}
          players={players}
          currentPlayerId={myPlayerId}
          currentStoryPlayerIndex={currentStoryPlayerIndex}
          storyContributions={storyContributions}
          onSubmitContribution={(text) => {
            if (room && myPlayer) {
              sendMessage({
                action: 'submit_story_contribution',
                roomId: room.id,
                payload: { playerId: myPlayer.id, playerName: myPlayer.name, text }
              });
            }
          }}
          onSkipToVoting={handleStartVoting}
          isHost={isHost}
          playerRole={myPlayer.role}
        />
      )}

      {phase === 'discussion' && mission && (
        <DiscussionPhase
          mission={mission}
          players={players}
          drawings={drawings}
          duration={90}
          onStartVoting={handleStartVoting}
          isOnlineMode={mode === 'online'}
          isHost={isHost}
        />
      )}

      {phase === 'voting' && currentVoter && (
        <VotingPhase
          players={players}
          currentVoter={mode === 'online' && myPlayer ? myPlayer : currentVoter}
          onVote={handleVote}
          onConfirmVote={handleConfirmVote}
          isLocalMode={mode === 'local'}
          votes={votes}
        />
      )}

      {phase === 'voting_result' && (
        <VotingResult
          players={players}
          eliminatedPlayer={players.find(p => p.isEliminated && !winner) ?? null}
          votes={votes}
          onContinue={handleContinueFromResult}
          currentRound={currentRound}
          maxRounds={maxRounds}
        />
      )}

      {phase === 'game_over' && winner && (
        <GameOver
          winner={winner}
          players={players}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {showAbilityPanel && abilityPlayer && (
        <AbilityPanel
          player={abilityPlayer}
          players={players}
          onUseAbility={handleUseAbility}
          disabled={false}
          previousRoundVotes={previousRoundVotes}
        />
      )}

      {mode === 'online' && myPlayer && phase !== 'splash' && phase !== 'room_lobby' && (
        <ChatPanel
          playerId={myPlayer.id}
          playerName={myPlayer.name}
          messages={chatMessages}
          onSendMessage={(message, emoji) => {
            if (room) {
              sendMessage({
                action: 'send_chat_message',
                roomId: room.id,
                payload: { playerId: myPlayer.id, playerName: myPlayer.name, message, emoji }
              });
            }
          }}
          isMinimized={isChatMinimized}
          onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
        />
      )}

      {mode === 'online' && myPlayer && myPlayer.role === 'spy' && phase !== 'splash' && phase !== 'room_lobby' && (
        <SpyChatPanel
          playerId={myPlayer.id}
          playerName={myPlayer.name}
          messages={spyChatMessages}
          onSendMessage={(message, emoji) => {
            if (room) {
              sendMessage({
                action: 'send_spy_chat_message',
                roomId: room.id,
                payload: { playerId: myPlayer.id, playerName: myPlayer.name, message, emoji }
              });
            }
          }}
          isMinimized={isSpyChatMinimized}
          onToggleMinimize={() => setIsSpyChatMinimized(!isSpyChatMinimized)}
        />
      )}
    </div>
  );
}
