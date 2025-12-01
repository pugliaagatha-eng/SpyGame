import DiscussionPhase from '../game/DiscussionPhase';
import type { Mission, Player, DrawingData } from '@shared/schema';

const mockMission: Mission = {
  id: 1,
  title: 'Desenho Secreto',
  description: 'Desenhe algo relacionado ao tema secreto.',
  secretFact: { type: 'drawing', value: 'HACKER', hint: 'Alguém que invade sistemas' },
  duration: 60,
};

const mockPlayers: Player[] = [
  { id: '1', name: 'João', role: 'agent', isEliminated: false, hasVoted: false, abilities: [], isHost: true, isConnected: true },
  { id: '2', name: 'Maria', role: 'spy', isEliminated: false, hasVoted: false, abilities: [], isHost: false, isConnected: true },
  { id: '3', name: 'Pedro', role: 'agent', isEliminated: false, hasVoted: false, abilities: [], isHost: false, isConnected: true },
  { id: '4', name: 'Ana', role: 'jester', isEliminated: false, hasVoted: false, abilities: [], isHost: false, isConnected: true },
];

const mockDrawings: DrawingData[] = [
  { playerId: '1', playerName: 'João', imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
  { playerId: '2', playerName: 'Maria', imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
];

export default function DiscussionPhaseExample() {
  return (
    <DiscussionPhase
      mission={mockMission}
      players={mockPlayers}
      drawings={mockDrawings}
      duration={90}
      onStartVoting={() => console.log('Start voting')}
    />
  );
}
