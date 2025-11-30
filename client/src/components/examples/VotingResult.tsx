import VotingResult from '../game/VotingResult';
import type { Player } from '@shared/schema';

const mockPlayers: Player[] = [
  { id: '1', name: 'João', role: 'agent', isEliminated: false, hasVoted: true, abilities: [], isHost: true, isConnected: true },
  { id: '2', name: 'Maria', role: 'spy', isEliminated: true, hasVoted: true, abilities: [], isHost: false, isConnected: true },
  { id: '3', name: 'Pedro', role: 'agent', isEliminated: false, hasVoted: true, abilities: [], isHost: false, isConnected: true },
  { id: '4', name: 'Ana', role: 'jester', isEliminated: false, hasVoted: true, abilities: [], isHost: false, isConnected: true },
];

const mockVotes = {
  '1': '2',
  '3': '2',
  '4': '1',
  '2': '3',
};

export default function VotingResultExample() {
  return (
    <VotingResult
      players={mockPlayers}
      eliminatedPlayer={mockPlayers[1]}
      votes={mockVotes}
      onContinue={() => console.log('Continue')}
      currentRound={1}
      maxRounds={3}
    />
  );
}
