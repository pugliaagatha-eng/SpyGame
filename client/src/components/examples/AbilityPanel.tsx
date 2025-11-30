import AbilityPanel from '../game/AbilityPanel';
import type { Player } from '@shared/schema';

const mockPlayer: Player = {
  id: '1',
  name: 'João',
  role: 'agent',
  isEliminated: false,
  hasVoted: false,
  isHost: false,
  isConnected: true,
  abilities: [
    {
      id: 'spy_vote',
      name: 'Espiar Voto',
      description: 'Veja o voto de um jogador',
      icon: 'Eye',
      used: false,
    },
  ],
};

const mockPlayers: Player[] = [
  mockPlayer,
  { id: '2', name: 'Maria', role: 'spy', isEliminated: false, hasVoted: true, votedFor: '3', abilities: [], isHost: false, isConnected: true },
  { id: '3', name: 'Pedro', role: 'agent', isEliminated: false, hasVoted: false, abilities: [], isHost: false, isConnected: true },
  { id: '4', name: 'Ana', role: 'jester', isEliminated: false, hasVoted: true, votedFor: '1', abilities: [], isHost: false, isConnected: true },
];

export default function AbilityPanelExample() {
  return (
    <div className="min-h-[400px] bg-background relative">
      <AbilityPanel
        player={mockPlayer}
        players={mockPlayers}
        onUseAbility={(abilityId, targetId) => console.log('Use ability:', abilityId, targetId)}
      />
    </div>
  );
}
