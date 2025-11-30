import PlayerSetup from '../game/PlayerSetup';

export default function PlayerSetupExample() {
  return (
    <PlayerSetup
      players={[]}
      onAddPlayer={(name) => console.log('Add player:', name)}
      onRemovePlayer={(id) => console.log('Remove player:', id)}
      onStartGame={() => console.log('Start game')}
      onBack={() => console.log('Back')}
    />
  );
}
