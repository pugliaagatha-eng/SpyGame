import GameOver from '../game/GameOver';
import type { Player } from '@shared/schema';

const mockPlayers: Player[] = [
  { id: '1', name: 'João', role: 'agent', isEliminated: false, hasVoted: true, abilities: [], isHost: true, isConnected: true },
  { id: '2', name: 'Maria', role: 'spy', isEliminated: true, hasVoted: true, abilities: [], isHost: false, isConnected: true },
  { id: '3', name: 'Pedro', role: 'agent', isEliminated: false, hasVoted: true, abilities: [], isHost: false, isConnected: true },
  { id: '4', name: 'Ana', role: 'triple', isEliminated: false, hasVoted: true, abilities: [], isHost: false, isConnected: true },
  { id: '5', name: 'Carlos', role: 'jester', isEliminated: true, hasVoted: true, abilities: [], isHost: false, isConnected: true },
];

export default function GameOverExample() {
  return (
    <GameOver
      winner="agents"
      players={mockPlayers}
      onPlayAgain={() => console.log('Play again')}
      onBackToMenu={() => console.log('Back to menu')}
    />
  );
}
