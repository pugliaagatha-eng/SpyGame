import RoleReveal from '../game/RoleReveal';
import type { Player, SecretFact } from '@shared/schema';

const mockPlayer: Player = {
  id: '1',
  name: 'João',
  role: 'spy',
  isEliminated: false,
  hasVoted: false,
  isHost: false,
  isConnected: true,
  abilities: [{
    id: 'spy_vote',
    name: 'Espiar Voto',
    description: 'Veja o voto de um jogador',
    icon: 'Eye',
    used: false,
  }],
};

const mockSecretFact: SecretFact = {
  type: 'word',
  value: 'CYBER',
  hint: 'Relacionado a tecnologia',
};

export default function RoleRevealExample() {
  return (
    <RoleReveal
      player={mockPlayer}
      secretFact={mockSecretFact}
      spyList={['Maria', 'Pedro']}
      agentList={['Ana', 'Carlos']}
      onNext={() => console.log('Next')}
      isLast={false}
    />
  );
}
