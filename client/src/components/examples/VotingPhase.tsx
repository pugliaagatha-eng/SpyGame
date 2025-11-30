import VotingPhase from '../game/VotingPhase';
import type { Player } from '@shared/schema';

const mockPlayers: Player[] = [
  { id: '1', name: 'João', role: 'agent', isEliminated: false, hasVoted: false, abilities: [], isHost: true, isConnected: true },
  { id: '2', name: 'Maria', role: 'spy', isEliminated: false, hasVoted: false, abilities: [], isHost: false, isConnected: true },
  { id: '3', name: 'Pedro', role: 'agent', isEliminated: false, hasVoted: false, abilities: [], isHost: false, isConnected: true },
  { id: '4', name: 'Ana', role: 'jester', isEliminated: false, hasVoted: false, abilities: [], isHost: false, isConnected: true },
];

export default function VotingPhaseExample() {
  return (
    <VotingPhase
      players={mockPlayers}
      currentVoter={mockPlayers[0]}
      onVote={(voterId, targetId) => console.log('Vote:', voterId, targetId)}
      onConfirmVote={() => console.log('Confirm vote')}
      isLocalMode={true}
    />
  );
}
