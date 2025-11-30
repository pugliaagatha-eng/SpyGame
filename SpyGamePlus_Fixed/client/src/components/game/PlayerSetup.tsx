import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, ArrowLeft, Play, Users } from 'lucide-react';

interface PlayerSetupProps {
  players: { id: string; name: string }[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onStartGame: (playerNames: string[]) => void;
  onBack: () => void;
}

export default function PlayerSetup({
  players,
  onAddPlayer,
  onRemovePlayer,
  onStartGame,
  onBack,
}: PlayerSetupProps) {
  const [playerCount, setPlayerCount] = useState('4');
  const [playerNames, setPlayerNames] = useState<string[]>(Array(4).fill(''));

  const handlePlayerCountChange = (value: string) => {
    const count = parseInt(value);
    setPlayerCount(value);
    setPlayerNames(prev => {
      const newNames = [...prev];
      while (newNames.length < count) newNames.push('');
      return newNames.slice(0, count);
    });
  };

  const handleNameChange = (index: number, name: string) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = name;
      return newNames;
    });
  };

  const handleStartGame = () => {
    const validNames = playerNames.filter(n => n.trim());
    if (validNames.length >= 3) {
      onStartGame(validNames);
    }
  };

  const filledCount = playerNames.filter(n => n.trim()).length;
  const canStart = filledCount >= 3;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md mb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <Card className="w-full max-w-md neon-border">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-center flex items-center justify-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Configurar Jogadores
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Número de jogadores</label>
            <Select value={playerCount} onValueChange={handlePlayerCountChange}>
              <SelectTrigger data-testid="select-player-count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <SelectItem key={n} value={n.toString()}>
                    {n} jogadores
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {playerNames.map((name, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-mono text-muted-foreground">
                  {index + 1}
                </div>
                <Input
                  placeholder={`Jogador ${index + 1}`}
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="flex-1"
                  data-testid={`input-player-${index}`}
                />
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-3">
            <Button
              className="w-full"
              disabled={!canStart}
              onClick={handleStartGame}
              data-testid="button-start-game"
            >
              <Play className="w-4 h-4 mr-2" />
              {canStart 
                ? `Iniciar com ${filledCount} jogadores` 
                : `Mínimo 3 jogadores (${filledCount}/3)`}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
              {parseInt(playerCount) >= 5 
                ? 'Inclui Agente Triplo e O Tolo'
                : 'Agente Triplo e O Tolo disponíveis com 5+ jogadores'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
