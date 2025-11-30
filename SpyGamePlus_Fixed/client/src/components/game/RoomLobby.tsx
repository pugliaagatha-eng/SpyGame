import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, Crown, Wifi, ArrowLeft, Check, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Room, Player } from '@shared/schema';

interface RoomLobbyProps {
  room: Room | null;
  isHost: boolean;
  onCreateRoom: (hostName: string) => void;
  onJoinRoom: (code: string, playerName: string) => void;
  onStartGame: () => void;
  onBack: () => void;
}

export default function RoomLobby({ 
  room, 
  isHost, 
  onCreateRoom, 
  onJoinRoom, 
  onStartGame,
  onBack 
}: RoomLobbyProps) {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>(room ? 'create' : 'select');
  const [hostName, setHostName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      toast({ title: 'Código copiado!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateRoom = () => {
    if (hostName.trim()) {
      onCreateRoom(hostName.trim());
    }
  };

  const handleJoinRoom = () => {
    if (roomCode.trim() && playerName.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  if (room) {
    return (
      <>
        <Button
          variant="outline"
          className="fixed top-6 left-6 z-50 bg-background/80 backdrop-blur-sm"
          onClick={onBack}
          data-testid="button-back-room"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <Card className="w-full max-w-md neon-border">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wifi className="w-5 h-5 text-primary animate-pulse" />
              <Badge variant="outline" className="text-primary border-primary">
                SALA ONLINE
              </Badge>
            </div>
            <CardTitle className="font-serif text-3xl neon-text">
              {room.code}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="mx-auto"
              data-testid="button-copy-code"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copiado!' : 'Copiar Código'}
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Jogadores
              </span>
              <span>{room.players.length}/{room.maxPlayers}</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {room.players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border"
                  data-testid={`player-card-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className="font-medium">{player.name}</span>
                  </div>
                  {player.isHost && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              {isHost ? (
                <Button
                  className="w-full"
                  disabled={room.players.length < 3}
                  onClick={onStartGame}
                  data-testid="button-start-game"
                >
                  {room.players.length < 3 
                    ? `Aguardando jogadores (${room.players.length}/3)` 
                    : 'Iniciar Jogo'}
                </Button>
              ) : (
                <p className="text-center text-muted-foreground text-sm">
                  Aguardando o host iniciar o jogo...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </>
    );
  }

  if (mode === 'select') {
    return (
      <>
        <Button
          variant="outline"
          className="fixed top-6 left-6 z-50 bg-background/80 backdrop-blur-sm"
          onClick={onBack}
          data-testid="button-back-main"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <h2 className="font-serif text-3xl font-bold neon-text mb-8">Modo Online</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
            <Card 
              className="neon-border cursor-pointer transition-all hover:scale-105"
              onClick={() => setMode('create')}
              data-testid="button-create-room"
            >
              <CardContent className="p-6 text-center">
                <UserPlus className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="font-serif text-xl font-bold mb-2">Criar Sala</h3>
                <p className="text-muted-foreground text-sm">
                  Crie uma nova sala e convide amigos
                </p>
              </CardContent>
            </Card>

            <Card 
              className="neon-border cursor-pointer transition-all hover:scale-105"
              onClick={() => setMode('join')}
              data-testid="button-join-room"
            >
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-secondary" />
                <h3 className="font-serif text-xl font-bold mb-2">Entrar</h3>
                <p className="text-muted-foreground text-sm">
                  Entre em uma sala existente com código
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        className="fixed top-6 left-6 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => setMode('select')}
        data-testid="button-back-select"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-sm neon-border">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-center">
              {mode === 'create' ? 'Criar Sala' : 'Entrar na Sala'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === 'create' ? (
              <>
                <Input
                  placeholder="Seu nome"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="text-center"
                  data-testid="input-host-name"
                />
                <Button
                  className="w-full"
                  disabled={!hostName.trim()}
                  onClick={handleCreateRoom}
                  data-testid="button-confirm-create"
                >
                  Criar Sala
                </Button>
              </>
            ) : (
              <>
                <Input
                  placeholder="Código da sala"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="text-center font-mono tracking-widest"
                  maxLength={6}
                  data-testid="input-room-code"
                />
                <Input
                  placeholder="Seu nome"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-center"
                  data-testid="input-player-name"
                />
                <Button
                  className="w-full"
                  disabled={!roomCode.trim() || !playerName.trim()}
                  onClick={handleJoinRoom}
                  data-testid="button-confirm-join"
                >
                  Entrar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
