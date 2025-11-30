import { z } from "zod";

export type GameMode = 'local' | 'online';
export type PlayerRole = 'agent' | 'spy' | 'triple' | 'jester';
export type AbilityType = 'spy_vote' | 'swap_vote' | 'extra_time' | 'force_revote' | 'peek_role' | 'shield' | 'negative_vote' | 'forensic_investigation';

export type GamePhase = 
  | 'waiting'
  | 'role_reveal'
  | 'mission'
  | 'drawing'
  | 'discussion'
  | 'voting'
  | 'voting_result'
  | 'game_over';

export interface Ability {
  id: AbilityType;
  name: string;
  description: string;
  icon: string;
  used: boolean;
}

export interface Player {
  id: string;
  name: string;
  role?: PlayerRole;
  isEliminated: boolean;
  abilities: Ability[];
  hasVoted: boolean;
  votedFor?: string;
  isHost: boolean;
  isConnected: boolean;
  isReady?: boolean;
}

export interface SecretFact {
  type: 'emoji' | 'code' | 'gesture' | 'word';
  value: string;
  hint: string;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  secretFact: SecretFact;
  duration: number;
}

export interface DrawingData {
  playerId: string;
  playerName: string;
  imageData: string;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  status: GamePhase;
  maxPlayers: number;
  currentRound: number;
  maxRounds: number;
  mission: Mission | null;
  drawings: DrawingData[];
  votes: Record<string, string>;
  previousRoundVotes?: Record<string, string>;
  currentPlayerIndex: number;
  currentVoterIndex: number;
  currentDrawingPlayerIndex: number;
  winner: 'agents' | 'spies' | 'jester' | null;
  createdAt: number;
}

export const createRoomSchema = z.object({
  hostName: z.string().min(1).max(20),
});

export const joinRoomSchema = z.object({
  code: z.string().length(6),
  playerName: z.string().min(1).max(20),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;

export type WebSocketMessageType = 
  | 'room_update'
  | 'player_joined'
  | 'player_left'
  | 'game_started'
  | 'phase_changed'
  | 'drawing_submitted'
  | 'vote_submitted'
  | 'player_eliminated'
  | 'game_over'
  | 'ability_used'
  | 'timer_sync'
  | 'player_ready'
  | 'all_players_ready'
  | 'error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: unknown;
  roomId?: string;
  playerId?: string;
}

export const ABILITIES: Ability[] = [
  { id: 'spy_vote', name: 'Espiar Voto', description: 'Veja o voto de um jogador', icon: 'Eye', used: false },
  { id: 'swap_vote', name: 'Trocar Voto', description: 'Troque seu voto depois de ver o resultado parcial', icon: 'Repeat', used: false },
  { id: 'extra_time', name: 'Tempo Extra', description: 'Adicione 30 segundos ao timer', icon: 'Clock', used: false },
  { id: 'force_revote', name: 'Revotação', description: 'Force uma nova votação', icon: 'RotateCcw', used: false },
  { id: 'peek_role', name: 'Revelar Papel', description: 'Veja o papel de um jogador', icon: 'Search', used: false },
  { id: 'shield', name: 'Escudo', description: 'Proteja-se da eliminação por uma rodada', icon: 'Shield', used: false },
];

export const JESTER_ABILITY: Ability = { 
  id: 'negative_vote', 
  name: 'Voto Negativo', 
  description: 'Seu voto conta como -1 para o alvo, potencialmente salvando-o da eliminação', 
  icon: 'MinusCircle', 
  used: false 
};

export const AGENT_RARE_ABILITY: Ability = { 
  id: 'forensic_investigation', 
  name: 'Investigação Forense', 
  description: 'Veja quem votou em quem na rodada anterior', 
  icon: 'FileSearch', 
  used: false 
};

export const JESTER_ABILITIES: Ability[] = [JESTER_ABILITY];

export function getRandomAbility(role?: PlayerRole): Ability {
  if (role === 'jester') {
    return { ...JESTER_ABILITY, used: false };
  }
  
  if (role === 'agent') {
    const hasRareAbility = Math.random() < 0.15;
    if (hasRareAbility) {
      return { ...AGENT_RARE_ABILITY, used: false };
    }
  }
  
  // Shield is a rare ability (10% chance)
  const hasShield = Math.random() < 0.10;
  if (hasShield) {
    const shieldAbility = ABILITIES.find(a => a.id === 'shield');
    if (shieldAbility) return { ...shieldAbility, used: false };
  }
  
  const availableAbilities = ABILITIES.filter(a => a.id !== 'shield');
  return { ...availableAbilities[Math.floor(Math.random() * availableAbilities.length)], used: false };
}

export type MissionCategory = 'palavra' | 'desenho' | 'gesto' | 'codigo' | 'local' | 'som' | 'historia' | 'objeto' | 'personagem' | 'acao';

export const MISSIONS: Mission[] = [
  // PALAVRA CHAVE (30 missões)
  { id: 1, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'MATRIX', hint: 'Um filme sobre simulação' }, duration: 90 },
  { id: 2, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'DRAGÃO', hint: 'Criatura mítica que cospe fogo' }, duration: 90 },
  { id: 3, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'ASTRONAUTA', hint: 'Viaja para o espaço' }, duration: 90 },
  { id: 4, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'RELÓGIO', hint: 'Marca o tempo' }, duration: 90 },
  { id: 5, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'ARCO-ÍRIS', hint: 'Fenômeno colorido após a chuva' }, duration: 90 },
  { id: 6, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'VAMPIRO', hint: 'Criatura noturna que bebe sangue' }, duration: 90 },
  { id: 7, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'FANTASMA', hint: 'Espírito que assombra' }, duration: 90 },
  { id: 8, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'PIRATA', hint: 'Navegador dos mares' }, duration: 90 },
  { id: 9, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'TORNADO', hint: 'Fenômeno climático giratório' }, duration: 90 },
  { id: 10, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'DIAMANTE', hint: 'Pedra preciosa brilhante' }, duration: 90 },
  { id: 11, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'SEREIA', hint: 'Metade humana, metade peixe' }, duration: 90 },
  { id: 12, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'VULCÃO', hint: 'Montanha que cospe lava' }, duration: 90 },
  { id: 13, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'ESPELHO', hint: 'Reflete imagens' }, duration: 90 },
  { id: 14, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'LABIRINTO', hint: 'Caminho confuso com paredes' }, duration: 90 },
  { id: 15, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'ECLIPSE', hint: 'Fenômeno celestial de sombra' }, duration: 90 },
  { id: 16, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'ZUMBI', hint: 'Morto que anda' }, duration: 90 },
  { id: 17, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'NINJA', hint: 'Guerreiro das sombras' }, duration: 90 },
  { id: 18, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'BRUXA', hint: 'Faz poções mágicas' }, duration: 90 },
  { id: 19, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'SAMURAI', hint: 'Guerreiro japonês com espada' }, duration: 90 },
  { id: 20, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'FÓSSIL', hint: 'Resto antigo de seres vivos' }, duration: 90 },
  { id: 21, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'METEORO', hint: 'Rocha espacial que cai' }, duration: 90 },
  { id: 22, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'GLADIADOR', hint: 'Lutador da arena romana' }, duration: 90 },
  { id: 23, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'FARAÓ', hint: 'Rei do antigo Egito' }, duration: 90 },
  { id: 24, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'ICEBERG', hint: 'Montanha de gelo flutuante' }, duration: 90 },
  { id: 25, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'ORIGAMI', hint: 'Arte de dobrar papel' }, duration: 90 },
  { id: 26, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'AVALANCHE', hint: 'Deslizamento de neve' }, duration: 90 },
  { id: 27, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'ROBÔ', hint: 'Máquina automática' }, duration: 90 },
  { id: 28, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'TESOURO', hint: 'Riqueza escondida' }, duration: 90 },
  { id: 29, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'FEITICEIRO', hint: 'Mago poderoso' }, duration: 90 },
  { id: 30, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'PORTAL', hint: 'Passagem para outro lugar' }, duration: 90 },

  // DESENHO SECRETO (30 missões)
  { id: 31, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'PIZZA', hint: 'Comida italiana redonda' }, duration: 60 },
  { id: 32, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'CASTELO', hint: 'Moradia de reis' }, duration: 60 },
  { id: 33, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'SUBMARINO', hint: 'Veículo subaquático' }, duration: 60 },
  { id: 34, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'FOGUETE', hint: 'Vai para o céu com fogo' }, duration: 60 },
  { id: 35, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'PALMEIRA', hint: 'Árvore tropical' }, duration: 60 },
  { id: 36, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'GUITARRA', hint: 'Instrumento musical com cordas' }, duration: 60 },
  { id: 37, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'BICICLETA', hint: 'Transporte de duas rodas' }, duration: 60 },
  { id: 38, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'TUBARÃO', hint: 'Predador dos oceanos' }, duration: 60 },
  { id: 39, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'CACHOEIRA', hint: 'Água caindo de altura' }, duration: 60 },
  { id: 40, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'HELICÓPTERO', hint: 'Voa com hélices' }, duration: 60 },
  { id: 41, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'CORUJA', hint: 'Ave noturna sábia' }, duration: 60 },
  { id: 42, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'PIRÂMIDE', hint: 'Construção egípcia triangular' }, duration: 60 },
  { id: 43, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'BALEIA', hint: 'Maior mamífero marinho' }, duration: 60 },
  { id: 44, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'ÂNCORA', hint: 'Segura navios no lugar' }, duration: 60 },
  { id: 45, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'MICROSCÓPIO', hint: 'Amplia coisas pequenas' }, duration: 60 },
  { id: 46, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'DRAGÃO', hint: 'Criatura mítica voadora' }, duration: 60 },
  { id: 47, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'CAVERNA', hint: 'Buraco na montanha' }, duration: 60 },
  { id: 48, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'FAROL', hint: 'Torre com luz para navios' }, duration: 60 },
  { id: 49, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'PINGUIM', hint: 'Ave que não voa, do frio' }, duration: 60 },
  { id: 50, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'VULCÃO', hint: 'Montanha de lava' }, duration: 60 },
  { id: 51, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'TRATOR', hint: 'Veículo de fazenda' }, duration: 60 },
  { id: 52, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'XADREZ', hint: 'Jogo de tabuleiro estratégico' }, duration: 60 },
  { id: 53, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'TELESCÓPIO', hint: 'Observa estrelas' }, duration: 60 },
  { id: 54, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'MORCEGO', hint: 'Mamífero voador noturno' }, duration: 60 },
  { id: 55, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'RODA GIGANTE', hint: 'Atração de parque de diversões' }, duration: 60 },
  { id: 56, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'IGLU', hint: 'Casa de gelo' }, duration: 60 },
  { id: 57, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'CANGURU', hint: 'Animal australiano saltador' }, duration: 60 },
  { id: 58, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'MONTANHA RUSSA', hint: 'Atração radical de parque' }, duration: 60 },
  { id: 59, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'AMPULHETA', hint: 'Mede tempo com areia' }, duration: 60 },
  { id: 60, title: 'Desenho Secreto', description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões tentarão blefar.', secretFact: { type: 'word', value: 'POLVO', hint: 'Animal marinho com tentáculos' }, duration: 60 },

  // GESTO SECRETO (25 missões)
  { id: 61, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Tocar o nariz', hint: 'Algo no rosto' }, duration: 90 },
  { id: 62, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Coçar a orelha', hint: 'Algo na cabeça' }, duration: 90 },
  { id: 63, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Cruzar os braços', hint: 'Movimento com os membros superiores' }, duration: 90 },
  { id: 64, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Piscar o olho', hint: 'Algo com os olhos' }, duration: 90 },
  { id: 65, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Esfregar as mãos', hint: 'Movimento repetitivo' }, duration: 90 },
  { id: 66, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Tocar o queixo', hint: 'Gesto de pensador' }, duration: 90 },
  { id: 67, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Bater na mesa', hint: 'Som de impacto' }, duration: 90 },
  { id: 68, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Fazer sinal de positivo', hint: 'Gesto de aprovação' }, duration: 90 },
  { id: 69, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Olhar para o teto', hint: 'Direção para cima' }, duration: 90 },
  { id: 70, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Apoiar a cabeça na mão', hint: 'Posição de descanso' }, duration: 90 },
  { id: 71, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Mexer no cabelo', hint: 'Toque na cabeça' }, duration: 90 },
  { id: 72, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Estalar os dedos', hint: 'Som com as mãos' }, duration: 90 },
  { id: 73, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Levantar as sobrancelhas', hint: 'Expressão facial' }, duration: 90 },
  { id: 74, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Cobrir a boca ao falar', hint: 'Gesto de segredo' }, duration: 90 },
  { id: 75, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Entrelaçar os dedos', hint: 'Mãos juntas' }, duration: 90 },
  { id: 76, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Fazer círculos com o dedo', hint: 'Movimento circular' }, duration: 90 },
  { id: 77, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Colocar a mão no peito', hint: 'Gesto de sinceridade' }, duration: 90 },
  { id: 78, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Fazer sinal de silêncio', hint: 'Dedo nos lábios' }, duration: 90 },
  { id: 79, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Tamborilar na mesa', hint: 'Som rítmico' }, duration: 90 },
  { id: 80, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Bocejar fingidamente', hint: 'Expressão de cansaço' }, duration: 90 },
  { id: 81, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Fazer sinal de telefone', hint: 'Mão na orelha' }, duration: 90 },
  { id: 82, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Ajeitar os óculos', hint: 'Toque no rosto' }, duration: 90 },
  { id: 83, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Cruzar as pernas', hint: 'Mudança de postura' }, duration: 90 },
  { id: 84, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Fazer sinal de OK', hint: 'Círculo com os dedos' }, duration: 90 },
  { id: 85, title: 'Gesto Secreto', description: 'Durante a discussão, agentes devem fazer o gesto secreto sutilmente.', secretFact: { type: 'gesture', value: 'Balançar a cabeça lentamente', hint: 'Movimento de negação suave' }, duration: 90 },

  // CÓDIGO NUMÉRICO (20 missões)
  { id: 86, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '42', hint: 'A resposta para tudo' }, duration: 90 },
  { id: 87, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '7', hint: 'Número da sorte' }, duration: 90 },
  { id: 88, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '13', hint: 'Número supersticioso' }, duration: 90 },
  { id: 89, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '99', hint: 'Quase cem' }, duration: 90 },
  { id: 90, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '21', hint: 'Blackjack perfeito' }, duration: 90 },
  { id: 91, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '88', hint: 'Número da volta no tempo' }, duration: 90 },
  { id: 92, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '3', hint: 'Número mágico' }, duration: 90 },
  { id: 93, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '50', hint: 'Metade de cem' }, duration: 90 },
  { id: 94, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '11', hint: 'Número de jogadores de futebol' }, duration: 90 },
  { id: 95, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '5', hint: 'Dedos de uma mão' }, duration: 90 },
  { id: 96, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '100', hint: 'Um século' }, duration: 90 },
  { id: 97, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '24', hint: 'Horas do dia' }, duration: 90 },
  { id: 98, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '365', hint: 'Dias do ano' }, duration: 90 },
  { id: 99, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '12', hint: 'Meses do ano' }, duration: 90 },
  { id: 100, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '1984', hint: 'Romance distópico de Orwell' }, duration: 90 },
  { id: 101, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '666', hint: 'Número do mal' }, duration: 90 },
  { id: 102, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '007', hint: 'Espião famoso' }, duration: 90 },
  { id: 103, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '69', hint: 'Número invertível' }, duration: 90 },
  { id: 104, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '404', hint: 'Erro de página não encontrada' }, duration: 90 },
  { id: 105, title: 'Código Numérico', description: 'Agentes conhecem um número secreto. Incorporem-no na conversa.', secretFact: { type: 'code', value: '2001', hint: 'Odisseia no espaço' }, duration: 90 },

  // LOCAL SECRETO - NOVA CATEGORIA (20 missões)
  { id: 106, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'BIBLIOTECA', hint: 'Lugar cheio de livros' }, duration: 90 },
  { id: 107, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'HOSPITAL', hint: 'Onde tratam doentes' }, duration: 90 },
  { id: 108, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'AEROPORTO', hint: 'Aviões decolam e pousam' }, duration: 90 },
  { id: 109, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'PRAIA', hint: 'Areia e mar' }, duration: 90 },
  { id: 110, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'CINEMA', hint: 'Assiste filmes na tela grande' }, duration: 90 },
  { id: 111, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'SUPERMERCADO', hint: 'Compra comida e produtos' }, duration: 90 },
  { id: 112, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'MUSEU', hint: 'Obras de arte e história' }, duration: 90 },
  { id: 113, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'ZOOLÓGICO', hint: 'Animais em exposição' }, duration: 90 },
  { id: 114, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'PARQUE', hint: 'Área verde com árvores' }, duration: 90 },
  { id: 115, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'ESTÁDIO', hint: 'Jogos e multidões' }, duration: 90 },
  { id: 116, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'CASSINO', hint: 'Jogos de azar' }, duration: 90 },
  { id: 117, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'DELEGACIA', hint: 'Policiais trabalham aqui' }, duration: 90 },
  { id: 118, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'IGREJA', hint: 'Lugar de oração' }, duration: 90 },
  { id: 119, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'BANCO', hint: 'Guarda dinheiro' }, duration: 90 },
  { id: 120, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'ESCOLA', hint: 'Alunos aprendem' }, duration: 90 },
  { id: 121, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'RESTAURANTE', hint: 'Serve refeições' }, duration: 90 },
  { id: 122, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'ACADEMIA', hint: 'Treino físico' }, duration: 90 },
  { id: 123, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'SHOPPING', hint: 'Várias lojas juntas' }, duration: 90 },
  { id: 124, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'CEMITÉRIO', hint: 'Descanso eterno' }, duration: 90 },
  { id: 125, title: 'Local Secreto', description: 'Agentes conhecem um local secreto. Descrevam-no sem dizer o nome.', secretFact: { type: 'word', value: 'CIRCO', hint: 'Palhaços e acrobatas' }, duration: 90 },

  // SOM SECRETO - NOVA CATEGORIA (15 missões)
  { id: 126, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'TOSSE', hint: 'Som de doença' }, duration: 90 },
  { id: 127, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'ASSOBIO', hint: 'Som com os lábios' }, duration: 90 },
  { id: 128, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'SUSPIRO', hint: 'Som de cansaço ou alívio' }, duration: 90 },
  { id: 129, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'RISADA', hint: 'Som de alegria' }, duration: 90 },
  { id: 130, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'ESPIRRO', hint: 'Som repentino do nariz' }, duration: 90 },
  { id: 131, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'GATO MIANDO', hint: 'Som de felino' }, duration: 90 },
  { id: 132, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'CACHORRO LATINDO', hint: 'Som de canino' }, duration: 90 },
  { id: 133, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'CAMPAINHA', hint: 'Som na porta' }, duration: 90 },
  { id: 134, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'TROVÃO', hint: 'Som de tempestade' }, duration: 90 },
  { id: 135, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'SIRENE', hint: 'Som de emergência' }, duration: 90 },
  { id: 136, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'APLAUSOS', hint: 'Som de aprovação' }, duration: 90 },
  { id: 137, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'BATER PALMAS', hint: 'Som ritmado com mãos' }, duration: 90 },
  { id: 138, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'RONCO', hint: 'Som de sono profundo' }, duration: 90 },
  { id: 139, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'TELEFONE TOCANDO', hint: 'Som de chamada' }, duration: 90 },
  { id: 140, title: 'Som Secreto', description: 'Agentes devem imitar um som específico durante a discussão.', secretFact: { type: 'word', value: 'ÁGUA CORRENDO', hint: 'Som líquido' }, duration: 90 },

  // HISTÓRIA INVENTADA - NOVA CATEGORIA (15 missões)
  { id: 141, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'CHAVE DE OURO', hint: 'Objeto que abre portas especiais' }, duration: 120 },
  { id: 142, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'PASSAGEM SECRETA', hint: 'Caminho escondido' }, duration: 120 },
  { id: 143, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'MENSAGEM CODIFICADA', hint: 'Comunicação cifrada' }, duration: 120 },
  { id: 144, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'MAPA DO TESOURO', hint: 'Guia para riquezas' }, duration: 120 },
  { id: 145, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'POÇÃO MÁGICA', hint: 'Bebida com poderes' }, duration: 120 },
  { id: 146, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'ESPIÃO DISFARÇADO', hint: 'Agente infiltrado' }, duration: 120 },
  { id: 147, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'MÁQUINA DO TEMPO', hint: 'Viaja pela história' }, duration: 120 },
  { id: 148, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'SUPER PODER', hint: 'Habilidade extraordinária' }, duration: 120 },
  { id: 149, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'ALIEN AMIGÁVEL', hint: 'Visitante do espaço' }, duration: 120 },
  { id: 150, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'VIAGEM AO PASSADO', hint: 'Retorno no tempo' }, duration: 120 },
  { id: 151, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'ILHA DESERTA', hint: 'Lugar isolado no mar' }, duration: 120 },
  { id: 152, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'HERÓI MASCARADO', hint: 'Justiceiro secreto' }, duration: 120 },
  { id: 153, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'EXPERIMENTO CIENTÍFICO', hint: 'Teste de laboratório' }, duration: 120 },
  { id: 154, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'GÊMEO SECRETO', hint: 'Irmão desconhecido' }, duration: 120 },
  { id: 155, title: 'História Inventada', description: 'Agentes devem contar uma história curta incluindo o elemento secreto.', secretFact: { type: 'word', value: 'ARTEFATO ANTIGO', hint: 'Objeto histórico poderoso' }, duration: 120 },

  // OBJETO MISTERIOSO - NOVA CATEGORIA (15 missões)
  { id: 156, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'BÚSSOLA', hint: 'Aponta direções' }, duration: 90 },
  { id: 157, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'BINÓCULO', hint: 'Ver de longe' }, duration: 90 },
  { id: 158, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'LANTERNA', hint: 'Luz portátil' }, duration: 90 },
  { id: 159, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'MICROFONE', hint: 'Amplifica a voz' }, duration: 90 },
  { id: 160, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'ALGEMA', hint: 'Prende pulsos' }, duration: 90 },
  { id: 161, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'CORDA', hint: 'Amarra coisas' }, duration: 90 },
  { id: 162, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'ESPADA', hint: 'Arma de lâmina' }, duration: 90 },
  { id: 163, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'ESCUDO', hint: 'Proteção contra ataques' }, duration: 90 },
  { id: 164, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'MÁSCARA', hint: 'Esconde o rosto' }, duration: 90 },
  { id: 165, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'CANIVETE', hint: 'Ferramenta multiuso' }, duration: 90 },
  { id: 166, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'GRAVADOR', hint: 'Captura sons' }, duration: 90 },
  { id: 167, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'PERUCA', hint: 'Cabelo falso' }, duration: 90 },
  { id: 168, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'PARAFUSO', hint: 'Prende peças girando' }, duration: 90 },
  { id: 169, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'ÍMÃ', hint: 'Atrai metais' }, duration: 90 },
  { id: 170, title: 'Objeto Misterioso', description: 'Agentes devem descrever o objeto sem dizer seu nome.', secretFact: { type: 'word', value: 'VENENO', hint: 'Substância perigosa' }, duration: 90 },

  // PERSONAGEM FAMOSO - NOVA CATEGORIA (15 missões)
  { id: 171, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'SHERLOCK HOLMES', hint: 'Detetive de Londres' }, duration: 90 },
  { id: 172, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'JAMES BOND', hint: 'Agente 007' }, duration: 90 },
  { id: 173, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'BATMAN', hint: 'Herói morcego' }, duration: 90 },
  { id: 174, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'DARTH VADER', hint: 'Vilão de máscara preta' }, duration: 90 },
  { id: 175, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'HARRY POTTER', hint: 'Bruxo com cicatriz' }, duration: 90 },
  { id: 176, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'INDIANA JONES', hint: 'Arqueólogo aventureiro' }, duration: 90 },
  { id: 177, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'JOKER', hint: 'Vilão palhaço' }, duration: 90 },
  { id: 178, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'MARIO', hint: 'Encanador italiano' }, duration: 90 },
  { id: 179, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'PIKACHU', hint: 'Rato elétrico amarelo' }, duration: 90 },
  { id: 180, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'HOMEM-ARANHA', hint: 'Herói que escala paredes' }, duration: 90 },
  { id: 181, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'WOLVERINE', hint: 'Mutante com garras' }, duration: 90 },
  { id: 182, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'YODA', hint: 'Mestre Jedi verde' }, duration: 90 },
  { id: 183, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'GANDALF', hint: 'Mago de barba longa' }, duration: 90 },
  { id: 184, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'THANOS', hint: 'Titã das pedras' }, duration: 90 },
  { id: 185, title: 'Personagem Famoso', description: 'Agentes devem fazer referências ao personagem sem dizer o nome.', secretFact: { type: 'word', value: 'SHREK', hint: 'Ogro verde' }, duration: 90 },

  // AÇÃO SECRETA - NOVA CATEGORIA (15 missões)
  { id: 186, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'COZINHAR', hint: 'Preparar comida' }, duration: 90 },
  { id: 187, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'NADAR', hint: 'Mover na água' }, duration: 90 },
  { id: 188, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'DANÇAR', hint: 'Mover com ritmo' }, duration: 90 },
  { id: 189, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'ESCALAR', hint: 'Subir alturas' }, duration: 90 },
  { id: 190, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'FOTOGRAFAR', hint: 'Capturar imagens' }, duration: 90 },
  { id: 191, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'MEDITAR', hint: 'Mente calma' }, duration: 90 },
  { id: 192, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'PESCAR', hint: 'Pegar peixes' }, duration: 90 },
  { id: 193, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'VOAR', hint: 'Ir pelo ar' }, duration: 90 },
  { id: 194, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'MERGULHAR', hint: 'Descer na água' }, duration: 90 },
  { id: 195, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'ESPIONAR', hint: 'Observar secretamente' }, duration: 90 },
  { id: 196, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'ROUBAR', hint: 'Pegar sem permissão' }, duration: 90 },
  { id: 197, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'FUGIR', hint: 'Escapar rápido' }, duration: 90 },
  { id: 198, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'SALTAR', hint: 'Pular de altura' }, duration: 90 },
  { id: 199, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'DISFARÇAR', hint: 'Mudar aparência' }, duration: 90 },
  { id: 200, title: 'Ação Secreta', description: 'Agentes devem mencionar esta ação de forma natural na conversa.', secretFact: { type: 'word', value: 'HACKEAR', hint: 'Invadir sistemas' }, duration: 90 },
];

export const ROLE_INFO: Record<PlayerRole, { name: string; description: string; color: string }> = {
  agent: {
    name: 'Agente',
    description: 'Elimine todos os Espiões para vencer. Você recebe os Fatos Secretos.',
    color: 'text-cyan-400',
  },
  spy: {
    name: 'Espião',
    description: 'Sobreviva até o final com maioria. Você NÃO recebe os Fatos Secretos.',
    color: 'text-red-500',
  },
  triple: {
    name: 'Agente Triplo',
    description: 'Você é um Agente, mas aparece na lista dos Espiões. Não sabe a identidade de ninguém.',
    color: 'text-purple-500',
  },
  jester: {
    name: 'O Tolo',
    description: 'Seja eliminado para vencer sozinho! Você NÃO recebe os Fatos Secretos.',
    color: 'text-yellow-500',
  },
};

export function getMissionCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const mission of MISSIONS) {
    counts[mission.title] = (counts[mission.title] || 0) + 1;
  }
  return counts;
}

export const MISSION_COUNTS = getMissionCounts();

export function getMissionAlternatives(currentMission: Mission, count: number = 3): SecretFact[] {
  const sameTitleMissions = MISSIONS.filter(
    m => m.title === currentMission.title && m.id !== currentMission.id
  );
  
  const shuffled = [...sameTitleMissions].sort(() => Math.random() - 0.5);
  const alternatives = shuffled.slice(0, count - 1).map(m => m.secretFact);
  
  const allOptions = [currentMission.secretFact, ...alternatives];
  return allOptions.sort(() => Math.random() - 0.5);
}
