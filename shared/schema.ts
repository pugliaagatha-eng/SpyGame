import { z } from "zod";

export type GameMode = 'online' | 'local';
export type PlayerRole = 'agent' | 'spy' | 'triple' | 'jester';
export type AbilityType = 'spy_vote' | 'swap_vote' | 'extra_time' | 'force_revote' | 'peek_role' | 'shield' | 'negative_vote' | 'forensic_investigation' | 'scramble_fact' | 'force_revote_30s';

export type GamePhase = 
  | 'waiting'
  | 'role_reveal'
  | 'mission'
  | 'drawing'
  | 'story'
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
  disconnectTime?: number;
}

export interface SecretFact {
  type: 'drawing' | 'order' | 'code' | 'story';
  value: string;
  hint?: string;
  rankingItems?: string[];
  rankingCriteria?: string;
  storyTitle?: string;
  storyPrompt?: string;
  spyHint?: string;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  secretFact: SecretFact;
  duration: number;
  onlineOnly?: boolean;
  localOnly?: boolean;
}

export interface DrawingData {
  playerId: string;
  playerName: string;
  imageData: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  emoji?: string;
  timestamp: number;
}

export interface StoryContribution {
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
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
  missionAlternatives: SecretFact[];
  drawings: DrawingData[];
  votes: Record<string, string>;
  previousRoundVotes?: Record<string, string>;
  currentPlayerIndex: number;
  currentVoterIndex: number;
  currentDrawingPlayerIndex: number;
  winner: 'agents' | 'spies' | 'jester' | null;
  messages: ChatMessage[];
  spyMessages: ChatMessage[];
  createdAt: number;
  updatedAt?: number;
  gameOverReason?: string;
  storyContributions?: StoryContribution[];
  currentStoryPlayerIndex?: number;
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
  | 'player_kicked'
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
  | 'chat_message'
  | 'spy_chat_message'
  | 'story_contribution'
  | 'story_turn_update'
  | 'error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: unknown;
  roomId?: string;
  playerId?: string;
}

export const SPY_ABILITY_SCRAMBLE: Ability = { id: 'scramble_fact', name: 'Transcrever Ligação', description: 'Revela o Fato Secreto da missão atual embaralhado no chat secreto.', icon: 'Headphones', used: false };
export const SPY_ABILITY_REVOTE: Ability = { id: 'force_revote_30s', name: 'Revotação +30s', description: 'Força uma nova votação com 30 segundos extras de discussão.', icon: 'RotateCcw', used: false };

export const ABILITIES: Ability[] = [
  { id: 'spy_vote', name: 'Espiar Voto', description: 'Veja o voto de um jogador', icon: 'Eye', used: false },
  { id: 'swap_vote', name: 'Trocar Voto', description: 'Troque seu voto depois de ver o resultado parcial', icon: 'Repeat', used: false },
  { id: 'extra_time', name: 'Tempo Extra', description: 'Adicione 30 segundos ao timer', icon: 'Clock', used: false },
  { id: 'force_revote', name: 'Revotação', description: 'Force uma nova votação', icon: 'RotateCcw', used: false },
  { id: 'peek_role', name: 'Revelar Papel', description: 'Veja o papel de um jogador', icon: 'Search', used: false },
  { id: 'shield', name: 'Escudo', description: 'Proteja-se da eliminação por uma rodada', icon: 'Shield', used: false },
];

export const ROLE_INFO: Record<PlayerRole, { name: string; color: string; description: string }> = {
  agent: {
    name: 'Agente',
    color: 'text-cyan-400 border-cyan-400',
    description: 'Você conhece a palavra secreta. Identifique os espiões e vote para eliminá-los.',
  },
  spy: {
    name: 'Espião',
    color: 'text-red-400 border-red-400',
    description: 'Você NÃO conhece a palavra secreta. Tente descobri-la e se misturar aos agentes.',
  },
  triple: {
    name: 'Agente Triplo',
    color: 'text-purple-400 border-purple-400',
    description: 'Você conhece a palavra, mas vence com os espiões. Ajude-os sem se revelar.',
  },
  jester: {
    name: 'Tolo',
    color: 'text-amber-400 border-amber-400',
    description: 'Você vence se for eliminado! Aja de forma suspeita e atraia votos.',
  },
};

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

// --- Funções Auxiliares ---
export function shuffleString(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export function getRandomAbility(role?: PlayerRole): Ability {
  if (role === 'jester') {
    return { ...JESTER_ABILITY, used: false };
  }
  
  if (role === 'spy') {
    return { ...SPY_ABILITY_SCRAMBLE, used: false };
  }
  
  if (role === 'agent') {
    const rand = Math.random();
    if (rand < 0.30) {
      return { ...ABILITIES.find(a => a.id === 'shield')!, used: false };
    } else if (rand < 0.45) {
      return { ...AGENT_RARE_ABILITY, used: false };
    }
  } else if (role === 'triple') {
    if (Math.random() < 0.5) {
      return { ...ABILITIES.find(a => a.id === 'shield')!, used: false };
    }
  }
  
  const availableAbilities = ABILITIES.filter(a => a.id !== 'shield' && a.id !== 'forensic_investigation');
  return { ...availableAbilities[Math.floor(Math.random() * availableAbilities.length)], used: false };
}

export type MissionCategory = 'desenho' | 'ordem' | 'codigo' | 'historia';

export const DRAWING_MISSIONS: Mission[] = [
  { id: 1001, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Casa na árvore', hint: 'Uma construção suspensa na natureza' }, duration: 90 },
  { id: 1002, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Astronauta', hint: 'Alguém que viaja para o espaço' }, duration: 90 },
  { id: 1003, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Pizza', hint: 'Comida italiana redonda' }, duration: 90 },
  { id: 1004, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Dragão', hint: 'Criatura mítica que cospe fogo' }, duration: 90 },
  { id: 1005, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Submarino', hint: 'Veículo que anda debaixo da água' }, duration: 90 },
  { id: 1006, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Relógio de bolso', hint: 'Objeto antigo para ver as horas' }, duration: 90 },
  { id: 1007, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Pirata', hint: 'Navegador bandido dos mares' }, duration: 90 },
  { id: 1008, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Castelo', hint: 'Casa de reis e rainhas' }, duration: 90 },
  { id: 1009, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Foguete', hint: 'Transporte para o espaço' }, duration: 90 },
  { id: 1010, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Elefante', hint: 'Animal grande com tromba' }, duration: 90 },
  { id: 1011, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Vulcão', hint: 'Montanha que expele lava' }, duration: 90 },
  { id: 1012, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Unicórnio', hint: 'Cavalo mágico com chifre' }, duration: 90 },
  { id: 1013, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Arco-íris', hint: 'Fenômeno colorido após a chuva' }, duration: 90 },
  { id: 1014, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Sereia', hint: 'Criatura meio humana meio peixe' }, duration: 90 },
  { id: 1015, title: 'Desenho Secreto', description: 'Desenhe algo que represente a palavra secreta. Espiões não sabem o que desenhar!', secretFact: { type: 'drawing', value: 'Robô', hint: 'Máquina com forma humana' }, duration: 90 },
];

export const ORDER_MISSIONS: Mission[] = [
  { id: 2001, title: 'Ordem Secreta', description: 'Arraste os emojis na ordem correta. Agentes sabem a ordem, espiões tentam adivinhar!', secretFact: { type: 'order', value: 'Do menor ao maior', rankingItems: ['🐜', '🐈', '🐘', '🐳'], rankingCriteria: 'Tamanho (menor para maior)' }, duration: 90 },
  { id: 2002, title: 'Ordem Secreta', description: 'Arraste os emojis na ordem correta. Agentes sabem a ordem, espiões tentam adivinhar!', secretFact: { type: 'order', value: 'Do mais frio ao mais quente', rankingItems: ['❄️', '🌧️', '☀️', '🔥'], rankingCriteria: 'Temperatura (frio para quente)' }, duration: 90 },
  { id: 2003, title: 'Ordem Secreta', description: 'Arraste os emojis na ordem correta. Agentes sabem a ordem, espiões tentam adivinhar!', secretFact: { type: 'order', value: 'Do mais lento ao mais rápido', rankingItems: ['🐢', '🚶', '🐎', '🚀'], rankingCriteria: 'Velocidade (lento para rápido)' }, duration: 90 },
  { id: 2004, title: 'Ordem Secreta', description: 'Arraste os emojis na ordem correta. Agentes sabem a ordem, espiões tentam adivinhar!', secretFact: { type: 'order', value: 'Do mais barato ao mais caro', rankingItems: ['🍬', '🍕', '📱', '🏠'], rankingCriteria: 'Preço (barato para caro)' }, duration: 90 },
  { id: 2005, title: 'Ordem Secreta', description: 'Arraste os emojis na ordem correta. Agentes sabem a ordem, espiões tentam adivinhar!', secretFact: { type: 'order', value: 'Do mais leve ao mais pesado', rankingItems: ['🪶', '🍎', '🧱', '🚗'], rankingCriteria: 'Peso (leve para pesado)' }, duration: 90 },
  { id: 2006, title: 'Ordem Secreta', description: 'Arraste os emojis na ordem correta. Agentes sabem a ordem, espiões tentam adivinhar!', secretFact: { type: 'order', value: 'Do mais baixo ao mais alto', rankingItems: ['🌱', '🏠', '🏢', '⛰️'], rankingCriteria: 'Altura (baixo para alto)' }, duration: 90 },
  { id: 2007, title: 'Ordem Secreta', description: 'Arraste os emojis na ordem correta. Agentes sabem a ordem, espiões tentam adivinhar!', secretFact: { type: 'order', value: 'Do mais silencioso ao mais barulhento', rankingItems: ['🤫', '🗣️', '📢', '🌩️'], rankingCriteria: 'Volume (silencioso para barulhento)' }, duration: 90 },
  { id: 2008, title: 'Ordem Secreta', description: 'Arraste os emojis na ordem correta. Agentes sabem a ordem, espiões tentam adivinhar!', secretFact: { type: 'order', value: 'Do menos doce ao mais doce', rankingItems: ['🍋', '🍎', '🍌', '🍯'], rankingCriteria: 'Doçura (menos doce para mais doce)' }, duration: 90 },
  { id: 2009, title: 'Ordem Secreta', description: 'Arraste os emojis na ordem correta. Agentes sabem a ordem, espiões tentam adivinhar!', secretFact: { type: 'order', value: 'Do menos perigoso ao mais perigoso', rankingItems: ['🐇', '🐕', '🐺', '🦁'], rankingCriteria: 'Perigo (seguro para perigoso)' }, duration: 90 },
  { id: 2010, title: 'Ordem Secreta', description: 'Arraste os emojis na ordem correta. Agentes sabem a ordem, espiões tentam adivinhar!', secretFact: { type: 'order', value: 'Alfabética', rankingItems: ['🍎', '🍌', '🍒', '🍇'], rankingCriteria: 'Ordem alfabética (Apple, Banana, Cherry, Grape)' }, duration: 90 },
  { id: 2011, title: 'Ordem Secreta', description: 'Arraste os emojis na ordem correta. Agentes sabem a ordem, espiões tentam adivinhar!', secretFact: { type: 'order', value: 'Do mais antigo ao mais novo', rankingItems: ['🗿', '🏛️', '🏰', '🏙️'], rankingCriteria: 'Idade (antigo para moderno)' }, duration: 90 },
  { id: 2012, title: 'Ordem Secreta', description: 'Arraste os emojis na ordem correta. Agentes sabem a ordem, espiões tentam adivinhar!', secretFact: { type: 'order', value: 'Do número menor ao maior', rankingItems: ['1️⃣', '3️⃣', '7️⃣', '9️⃣'], rankingCriteria: 'Ordem numérica crescente' }, duration: 90 },
];

export const CODE_MISSIONS: Mission[] = [
  { id: 3001, title: 'Código Secreto', description: 'Digite o código de 5 dígitos. Agentes sabem o código, espiões tentam adivinhar!', secretFact: { type: 'code', value: '19847', hint: 'Ano do livro de Orwell + número da sorte' }, duration: 60 },
  { id: 3002, title: 'Código Secreto', description: 'Digite o código de 5 dígitos. Agentes sabem o código, espiões tentam adivinhar!', secretFact: { type: 'code', value: '00007', hint: 'Código de um famoso agente secreto' }, duration: 60 },
  { id: 3003, title: 'Código Secreto', description: 'Digite o código de 5 dígitos. Agentes sabem o código, espiões tentam adivinhar!', secretFact: { type: 'code', value: '42424', hint: 'A resposta para tudo (repetida)' }, duration: 60 },
  { id: 3004, title: 'Código Secreto', description: 'Digite o código de 5 dígitos. Agentes sabem o código, espiões tentam adivinhar!', secretFact: { type: 'code', value: '12345', hint: 'Sequência numérica simples' }, duration: 60 },
  { id: 3005, title: 'Código Secreto', description: 'Digite o código de 5 dígitos. Agentes sabem o código, espiões tentam adivinhar!', secretFact: { type: 'code', value: '31415', hint: 'Primeiros dígitos de Pi' }, duration: 60 },
  { id: 3006, title: 'Código Secreto', description: 'Digite o código de 5 dígitos. Agentes sabem o código, espiões tentam adivinhar!', secretFact: { type: 'code', value: '99999', hint: 'O maior número de 5 dígitos iguais' }, duration: 60 },
  { id: 3007, title: 'Código Secreto', description: 'Digite o código de 5 dígitos. Agentes sabem o código, espiões tentam adivinhar!', secretFact: { type: 'code', value: '11111', hint: 'Cinco números iguais (o primeiro)' }, duration: 60 },
  { id: 3008, title: 'Código Secreto', description: 'Digite o código de 5 dígitos. Agentes sabem o código, espiões tentam adivinhar!', secretFact: { type: 'code', value: '54321', hint: 'Contagem regressiva' }, duration: 60 },
  { id: 3009, title: 'Código Secreto', description: 'Digite o código de 5 dígitos. Agentes sabem o código, espiões tentam adivinhar!', secretFact: { type: 'code', value: '24680', hint: 'Números pares em sequência' }, duration: 60 },
  { id: 3010, title: 'Código Secreto', description: 'Digite o código de 5 dígitos. Agentes sabem o código, espiões tentam adivinhar!', secretFact: { type: 'code', value: '13579', hint: 'Números ímpares em sequência' }, duration: 60 },
  { id: 3011, title: 'Código Secreto', description: 'Digite o código de 5 dígitos. Agentes sabem o código, espiões tentam adivinhar!', secretFact: { type: 'code', value: '02468', hint: 'Números pares começando do zero' }, duration: 60 },
  { id: 3012, title: 'Código Secreto', description: 'Digite o código de 5 dígitos. Agentes sabem o código, espiões tentam adivinhar!', secretFact: { type: 'code', value: '86420', hint: 'Números pares decrescentes' }, duration: 60 },
];

export const STORY_MISSIONS: Mission[] = [
  { id: 4001, title: 'Conte a História', description: 'Continue a história que você conhece. Cada jogador tem 400 caracteres. Espiões não conhecem a história!', secretFact: { type: 'story', value: 'Chapeuzinho Vermelho', storyTitle: 'Chapeuzinho Vermelho', storyPrompt: 'Uma menina com capuz vermelho vai visitar a avó pela floresta, mas encontra um lobo mal-intencionado no caminho.', spyHint: 'Conto infantil europeu sobre uma jornada perigosa' }, duration: 180 },
  { id: 4002, title: 'Conte a História', description: 'Continue a história que você conhece. Cada jogador tem 400 caracteres. Espiões não conhecem a história!', secretFact: { type: 'story', value: 'Os Três Porquinhos', storyTitle: 'Os Três Porquinhos', storyPrompt: 'Três irmãos porquinhos constroem suas casas de materiais diferentes para se proteger do lobo mau.', spyHint: 'História sobre construção e proteção' }, duration: 180 },
  { id: 4003, title: 'Conte a História', description: 'Continue a história que você conhece. Cada jogador tem 400 caracteres. Espiões não conhecem a história!', secretFact: { type: 'story', value: 'João e Maria', storyTitle: 'João e Maria', storyPrompt: 'Duas crianças perdidas na floresta encontram uma casa de doces pertencente a uma bruxa.', spyHint: 'Conto dos irmãos Grimm sobre sobrevivência' }, duration: 180 },
  { id: 4004, title: 'Conte a História', description: 'Continue a história que você conhece. Cada jogador tem 400 caracteres. Espiões não conhecem a história!', secretFact: { type: 'story', value: 'A Bela Adormecida', storyTitle: 'A Bela Adormecida', storyPrompt: 'Uma princesa é amaldiçoada a dormir por 100 anos até ser acordada por um beijo de amor verdadeiro.', spyHint: 'Conto sobre uma maldição e o tempo' }, duration: 180 },
  { id: 4005, title: 'Conte a História', description: 'Continue a história que você conhece. Cada jogador tem 400 caracteres. Espiões não conhecem a história!', secretFact: { type: 'story', value: 'Cinderela', storyTitle: 'Cinderela', storyPrompt: 'Uma jovem maltratada pela madrasta vai ao baile com ajuda de uma fada e perde seu sapatinho de cristal.', spyHint: 'História sobre transformação e um baile' }, duration: 180 },
  { id: 4006, title: 'Conte a História', description: 'Continue a história que você conhece. Cada jogador tem 400 caracteres. Espiões não conhecem a história!', secretFact: { type: 'story', value: 'A Pequena Sereia', storyTitle: 'A Pequena Sereia', storyPrompt: 'Uma sereia troca sua voz por pernas para poder viver na terra e conquistar o príncipe.', spyHint: 'Conto de Hans Christian Andersen sobre sacrifício' }, duration: 180 },
  { id: 4007, title: 'Conte a História', description: 'Continue a história que você conhece. Cada jogador tem 400 caracteres. Espiões não conhecem a história!', secretFact: { type: 'story', value: 'Branca de Neve', storyTitle: 'Branca de Neve', storyPrompt: 'Uma princesa foge da madrasta má e vive com sete anões na floresta, mas é envenenada por uma maçã.', spyHint: 'Conto sobre beleza e inveja' }, duration: 180 },
  { id: 4008, title: 'Conte a História', description: 'Continue a história que você conhece. Cada jogador tem 400 caracteres. Espiões não conhecem a história!', secretFact: { type: 'story', value: 'Rapunzel', storyTitle: 'Rapunzel', storyPrompt: 'Uma menina com cabelos muito longos é presa em uma torre e usa seus cabelos para ajudar um príncipe a subir.', spyHint: 'Conto sobre isolamento e liberdade' }, duration: 180 },
  { id: 4009, title: 'Conte a História', description: 'Continue a história que você conhece. Cada jogador tem 400 caracteres. Espiões não conhecem a história!', secretFact: { type: 'story', value: 'O Patinho Feio', storyTitle: 'O Patinho Feio', storyPrompt: 'Um filhote de ave é rejeitado por ser diferente, mas cresce e descobre que é um belo cisne.', spyHint: 'História sobre identidade e aceitação' }, duration: 180 },
  { id: 4010, title: 'Conte a História', description: 'Continue a história que você conhece. Cada jogador tem 400 caracteres. Espiões não conhecem a história!', secretFact: { type: 'story', value: 'Pinóquio', storyTitle: 'Pinóquio', storyPrompt: 'Um boneco de madeira criado por Gepeto ganha vida e sonha em se tornar um menino de verdade.', spyHint: 'Conto italiano sobre crescimento e honestidade' }, duration: 180 },
];

export const MISSIONS: Mission[] = [
  ...DRAWING_MISSIONS,
  ...ORDER_MISSIONS,
  ...CODE_MISSIONS,
  ...STORY_MISSIONS,
];

export function getMissionsForMode(mode: GameMode): Mission[] {
  return MISSIONS.filter(m => {
    if (mode === 'local' && m.onlineOnly) return false;
    if (mode === 'online' && m.localOnly) return false;
    return true;
  });
}

export function getRandomMissionForMode(mode: GameMode): Mission {
  const availableMissions = getMissionsForMode(mode);
  return availableMissions[Math.floor(Math.random() * availableMissions.length)];
}

export const MISSION_COUNTS: Record<string, number> = {
  'Desenho Secreto': DRAWING_MISSIONS.length,
  'Ordem Secreta': ORDER_MISSIONS.length,
  'Código Secreto': CODE_MISSIONS.length,
  'Conte a História': STORY_MISSIONS.length,
};

export function getMissionAlternatives(mission: Mission, count: number = 3): SecretFact[] {
  const sameTitleMissions = MISSIONS.filter(m => m.title === mission.title && m.id !== mission.id);
  const shuffled = sameTitleMissions.sort(() => Math.random() - 0.5);
  const alternatives = shuffled.slice(0, count - 1).map(m => m.secretFact);
  
  const allOptions = [mission.secretFact, ...alternatives];
  return allOptions.sort(() => Math.random() - 0.5);
}
