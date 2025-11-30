import RoomLobby from '../game/RoomLobby';
import type { Room } from '@shared/schema';

const mockRoom: Room = {
  id: '1',
  code: 'ABC123',
  hostId: 'host1',
  players: [
    { id: 'host1', name: 'João', isEliminated: false, abilities: [], hasVoted: false, isHost: true, isConnected: true },
    { id: 'p2', name: 'Maria', isEliminated: false, abilities: [], hasVoted: false, isHost: false, isConnected: true },
    { id: 'p3', name: 'Pedro', isEliminated: false, abilities: [], hasVoted: false, isHost: false, isConnected: true },
  ],
  status: 'waiting',
  maxPlayers: 10,
  currentRound: 1,
  maxRounds: 3,
  mission: null,
  drawings: [],
  votes: {},
  currentPlayerIndex: 0,
  currentVoterIndex: 0,
  currentDrawingPlayerIndex: 0,
  winner: null,
  createdAt: Date.now(),
};

export default function RoomLobbyExample() {
  return (
    <RoomLobby
      room={mockRoom}
      isHost={true}
      onCreateRoom={(name) => console.log('Create room:', name)}
      onJoinRoom={(code, name) => console.log('Join room:', code, name)}
      onStartGame={() => console.log('Start game')}
      onBack={() => console.log('Back')}
    />
  );
}
