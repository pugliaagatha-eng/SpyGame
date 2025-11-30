import MissionPhase from '../game/MissionPhase';
import type { Mission } from '../game/types';

const mockMission: Mission = {
  id: 1,
  title: 'Desenho Secreto',
  description: 'Desenhe algo relacionado ao tema secreto. Agentes sabem o tema, Espiões não.',
  secretFact: {
    type: 'word',
    value: 'HACKER',
    hint: 'Alguém que invade sistemas',
  },
  duration: 60,
};

export default function MissionPhaseExample() {
  return (
    <MissionPhase
      mission={mockMission}
      currentRound={1}
      maxRounds={3}
      onStartDiscussion={() => console.log('Start discussion')}
      isDrawingMission={true}
      onStartDrawing={() => console.log('Start drawing')}
    />
  );
}
