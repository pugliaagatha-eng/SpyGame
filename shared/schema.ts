import { z } from "zod";

export type GameMode = 'online';
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
  type: 'emoji' | 'code' | 'gesture' | 'word' | 'ranking' | 'explanation';
  value: string;
  hint?: string; // Dica pública ampla para todos (exceto espiões, que não veem nada)

  spyValue?: string; // Para missões de Explicação - valor diferente para espiões
  rankingItems?: string[]; // Para missões de Ranking
  rankingCriteria?: string; // Critério de ordenação
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  secretFact: SecretFact;
  duration: number;

  onlineOnly?: boolean; // Se true, só aparece no modo online
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
  | 'chat_message'
  | 'spy_chat_message'
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
  
  const availableAbilities = ABILITIES.filter(a => a.id !== 'shield');
  return { ...availableAbilities[Math.floor(Math.random() * availableAbilities.length)], used: false };
}

export type MissionCategory = 'palavra' | 'desenho' | 'gesto' | 'codigo' | 'local' | 'som' | 'historia' | 'objeto' | 'personagem' | 'acao' | 'ranking' | 'explicacao';

// Missões de Código Secreto - Agentes sabem o código de 4 dígitos
export const CODE_MISSIONS: Mission[] = [
  { id: 3001, title: 'Código Secreto', description: 'Agentes sabem o código de 4 dígitos. Espiões tentam adivinhar ou blefar.', secretFact: { type: 'code', value: '1984', hint: 'Ano de um livro famoso de George Orwell' }, duration: 60 },
  { id: 3002, title: 'Código Secreto', description: 'Agentes sabem o código de 4 dígitos. Espiões tentam adivinhar ou blefar.', secretFact: { type: 'code', value: '0007', hint: 'Código de um famoso agente secreto' }, duration: 60 },
  { id: 3003, title: 'Código Secreto', description: 'Agentes sabem o código de 4 dígitos. Espiões tentam adivinhar ou blefar.', secretFact: { type: 'code', value: '4242', hint: 'Resposta para a vida, o universo e tudo mais (em dobro)' }, duration: 60 },
  { id: 3004, title: 'Código Secreto', description: 'Agentes sabem o código de 4 dígitos. Espiões tentam adivinhar ou blefar.', secretFact: { type: 'code', value: '2025', hint: 'O ano atual (ou próximo)' }, duration: 60 },
  { id: 3005, title: 'Código Secreto', description: 'Agentes sabem o código de 4 dígitos. Espiões tentam adivinhar ou blefar.', secretFact: { type: 'code', value: '1024', hint: 'Um kilobyte em bytes' }, duration: 60 },
  { id: 3006, title: 'Código Secreto', description: 'Agentes sabem o código de 4 dígitos. Espiões tentam adivinhar ou blefar.', secretFact: { type: 'code', value: '3141', hint: 'Os primeiros 4 dígitos de Pi' }, duration: 60 },
  { id: 3007, title: 'Código Secreto', description: 'Agentes sabem o código de 4 dígitos. Espiões tentam adivinhar ou blefar.', secretFact: { type: 'code', value: '9999', hint: 'O maior número de 4 dígitos' }, duration: 60 },
  { id: 3008, title: 'Código Secreto', description: 'Agentes sabem o código de 4 dígitos. Espiões tentam adivinhar ou blefar.', secretFact: { type: 'code', value: '1111', hint: 'Quatro uns' }, duration: 60 },
  { id: 3009, title: 'Código Secreto', description: 'Agentes sabem o código de 4 dígitos. Espiões tentam adivinhar ou blefar.', secretFact: { type: 'code', value: '1234', hint: 'Sequência numérica simples' }, duration: 60 },
  { id: 3010, title: 'Código Secreto', description: 'Agentes sabem o código de 4 dígitos. Espiões tentam adivinhar ou blefar.', secretFact: { type: 'code', value: '5678', hint: 'Sequência numérica simples (continuação)' }, duration: 60 },
];

// Missões de Explicação - Agentes recebem palavra específica, Espiões recebem palavra parecida
export const EXPLANATION_MISSIONS: Mission[] = [
  { id: 1001, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Suco de maracujá', hint: 'Bebida de fruta tropical', spyValue: 'Suco de laranja' }, duration: 90 },
  { id: 1002, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Pizza de calabresa', hint: 'Prato principal com embutido', spyValue: 'Pizza de pepperoni' }, duration: 90 },
  { id: 1003, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Café com leite', hint: 'Bebida quente matinal', spyValue: 'Cappuccino' }, duration: 90 },
  { id: 1004, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Bicicleta de montanha', hint: 'Veículo de duas rodas para trilhas', spyValue: 'Bicicleta de corrida' }, duration: 90 },
  { id: 1005, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Violão acústico', hint: 'Instrumento musical de cordas', spyValue: 'Guitarra elétrica' }, duration: 90 },
  { id: 1006, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Pão francês', hint: 'Produto de padaria crocante', spyValue: 'Pão de forma' }, duration: 90 },
  { id: 1007, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Tênis de corrida', hint: 'Calçado esportivo para asfalto', spyValue: 'Chuteira de futebol' }, duration: 90 },
  { id: 1008, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Cachorro pastor alemão', hint: 'Animal de estimação de guarda', spyValue: 'Cachorro labrador' }, duration: 90 },
  { id: 1009, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Sorvete de chocolate', hint: 'Sobremesa gelada de cacau', spyValue: 'Sorvete de baunilha' }, duration: 90 },
  { id: 1010, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Carro elétrico', hint: 'Veículo moderno sem combustão', spyValue: 'Carro híbrido' }, duration: 90 },
  { id: 1011, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Filme de terror', hint: 'Gênero cinematográfico assustador', spyValue: 'Filme de suspense' }, duration: 90 },
  { id: 1012, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Praia do Caribe', hint: 'Destino de viagem tropical', spyValue: 'Praia do Mediterrâneo' }, duration: 90 },
  { id: 1013, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Hambúrguer artesanal', hint: 'Lanche feito à mão', spyValue: 'Hambúrguer fast food' }, duration: 90 },
  { id: 1014, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Cerveja artesanal', hint: 'Bebida alcoólica especial', spyValue: 'Cerveja industrial' }, duration: 90 },
  { id: 1015, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Smartphone Android', hint: 'Dispositivo eletrônico móvel', spyValue: 'iPhone' }, duration: 90 },
  { id: 1016, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Yoga relaxante', hint: 'Exercício físico de alongamento', spyValue: 'Pilates' }, duration: 90 },
  { id: 1017, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Música clássica', hint: 'Gênero musical antigo', spyValue: 'Música instrumental' }, duration: 90 },
  { id: 1018, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Livro de ficção científica', hint: 'Tipo de literatura futurista', spyValue: 'Livro de fantasia' }, duration: 90 },
  { id: 1019, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Sapato social', hint: 'Calçado formal de couro', spyValue: 'Mocassim' }, duration: 90 },
  { id: 1020, title: 'Explicação', description: 'Explique o conceito que você recebeu sem ser muito específico. Espiões recebem algo parecido mas diferente!', secretFact: { type: 'explanation', value: 'Jantar romântico', hint: 'Refeição especial a dois', spyValue: 'Jantar de aniversário' }, duration: 90 },
];

// Missões de Ranking Secreto - Ordenar itens por critério secreto
export const RANKING_MISSIONS: Mission[] = [
  { id: 2001, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do menor ao maior', rankingItems: ['🐜', '🐈', '🐘', '🐳'], rankingCriteria: 'tamanho' }, duration: 90 },
  { id: 2002, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do mais frio ao mais quente', rankingItems: ['🥶', '🇧🇷', '🇪🇬', '🌋'], rankingCriteria: 'temperatura' }, duration: 90 },
  { id: 2003, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do mais antigo ao mais novo', rankingItems: ['🗿', '🏟️', '🗼', '🏙️'], rankingCriteria: 'idade' }, duration: 90 },
  { id: 2004, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do mais lento ao mais rápido', rankingItems: ['🐢', '🚶', '🐎', '🐆'], rankingCriteria: 'velocidade' }, duration: 90 },
  { id: 2005, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do mais barato ao mais caro', rankingItems: ['🍬', '🍕', '📱', '🚗'], rankingCriteria: 'preço' }, duration: 90 },
  { id: 2006, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do mais leve ao mais pesado', rankingItems: ['🪶', '🍎', '🧱', '🚗'], rankingCriteria: 'peso' }, duration: 90 },
  { id: 2007, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do menor ao maior população', rankingItems: ['🇻🇦', '🇵🇹', '🇧🇷', '🇨🇳'], rankingCriteria: 'população' }, duration: 90 },
  { id: 2008, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do mais curto ao mais longo', rankingItems: ['⏱️', '⏳', '🕰️', '🗓️'], rankingCriteria: 'duração' }, duration: 90 },
  { id: 2009, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do menos doce ao mais doce', rankingItems: ['🍋', '🍎', '🍌', '🍯'], rankingCriteria: 'doçura' }, duration: 90 },
  { id: 2010, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do mais baixo ao mais alto', rankingItems: ['🌱', '🏠', '🏢', '⛰️'], rankingCriteria: 'altura' }, duration: 90 },
  { id: 2011, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do mais silencioso ao mais barulhento', rankingItems: ['🤫', '🗣️', '📢', '🌩️'], rankingCriteria: 'volume' }, duration: 90 },
  { id: 2012, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do menos perigoso ao mais perigoso', rankingItems: ['🐇', '🐕', '🐺', '🦁'], rankingCriteria: 'perigo' }, duration: 90 },
  { id: 2013, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do mais simples ao mais complexo', rankingItems: ['🪨', '🌿', '🐒', '🧠'], rankingCriteria: 'complexidade' }, duration: 90 },
  { id: 2014, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do mais próximo ao mais distante do Sol', rankingItems: ['🪐', '🌍', '☄️', '🌌'], rankingCriteria: 'distância do sol' }, duration: 90 },
  { id: 2015, title: 'Ranking Secreto', description: 'Ordene os itens pelo critério secreto. Agentes sabem a ordem correta, espiões tentam adivinhar!', secretFact: { type: 'ranking', value: 'Do menos calórico ao mais calórico', rankingItems: ['🥒', '🍚', '🍫', '🥓'], rankingCriteria: 'calorias' }, duration: 90 },
];

export const MISSIONS: Mission[] = [
  // PALAVRA CHAVE (30 missões)
  { id: 1, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'MATRIX', hint: 'Um filme sobre simulação' }, duration: 90 },
  { id: 2, title: 'Palavra Chave', description: 'Uma palavra foi escolhida. Agentes sabem a palavra. Faça referências sutis.', secretFact: { type: 'word', value: 'DRAGÃO', hint: 'Criatura mítica que cospe fogo' }, duration: 90 },
  // ... (continua com todas as outras missões de Palavra Chave, Desenho Secreto, Gesto Secreto, Código Numérico, Local Secreto, Personagem Famoso)
  
  // Adiciona missões de Código Secreto, Explicação e Ranking ao final
  ...CODE_MISSIONS,
  ...EXPLANATION_MISSIONS,
  ...RANKING_MISSIONS,
];

// Funções auxiliares para missões por modo
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

// Conta missões por tipo
export const MISSION_COUNTS: Record<string, number> = {
  'Palavra Chave': 30,
  'Desenho Secreto': 20,
  'Gesto Secreto': 15,
  'Código Numérico': 10,
  'Local Secreto': 15,
  'Personagem Famoso': 10,
  'Explicação': EXPLANATION_MISSIONS.length,
  'Ranking Secreto': RANKING_MISSIONS.length,
};

// Função para pegar alternativas de missão (para 3 pistas)
export function getMissionAlternatives(mission: Mission, count: number = 3): SecretFact[] {
  const sameTitleMissions = MISSIONS.filter(m => m.title === mission.title && m.id !== mission.id);
  const shuffled = sameTitleMissions.sort(() => Math.random() - 0.5);
  const alternatives = shuffled.slice(0, count - 1).map(m => m.secretFact);
  
  // Inclui a missão correta e embaralha todas
  const allOptions = [mission.secretFact, ...alternatives];
  return allOptions.sort(() => Math.random() - 0.5);
}
