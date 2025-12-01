import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Shield, Eye, Skull, Home, RotateCcw, Users, Sparkles } from 'lucide-react';
import type { Player } from '@shared/schema';
import { ROLE_INFO } from '@shared/schema';

interface GameOverProps {
  winner: 'agents' | 'spies' | 'jester' | 'draw';
  players: Player[];
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export default function GameOver({ winner, players, onPlayAgain, onBackToMenu }: GameOverProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const getWinnerInfo = () => {
    switch (winner) {
      case 'agents':
        return {
          title: 'Agentes Vencem!',
          description: 'Todos os espiões foram eliminados.',
          icon: Shield,
          color: 'text-cyan-400',
          bgColor: 'from-cyan-500/20 to-cyan-900/20',
        };
      case 'spies':
        return {
          title: 'Espiões Vencem!',
          description: 'Os espiões dominaram a operação.',
          icon: Eye,
          color: 'text-red-500',
          bgColor: 'from-red-500/20 to-red-900/20',
        };
      case 'jester':
        return {
          title: 'O Tolo Vence!',
          description: 'O Tolo foi eliminado e venceu sozinho!',
          icon: Skull,
          color: 'text-yellow-500',
          bgColor: 'from-yellow-500/20 to-yellow-900/20',
        };
      case 'draw':
        return {
          title: 'Empate!',
          description: 'Jogo encerrado por falta de jogadores.',
          icon: Users,
          color: 'text-gray-400',
          bgColor: 'from-gray-500/20 to-gray-900/20',
        };
    }
  };

  const winnerInfo = getWinnerInfo();
  const Icon = winnerInfo.icon;

  const winningPlayers = players.filter(p => {
    if (winner === 'agents') return p.role === 'agent' || p.role === 'triple';
    if (winner === 'spies') return p.role === 'spy';
    if (winner === 'jester') return p.role === 'jester';
    if (winner === 'draw') return false;
    return false;
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#00ffff', '#ff00ff', '#ffff00', '#ff0000', '#00ff00'][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <Card className={`w-full max-w-lg overflow-hidden neon-glow`}>
        <div className={`bg-gradient-to-b ${winnerInfo.bgColor} p-8 text-center`}>
          <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${winnerInfo.color} neon-glow`}>
            <Trophy className="w-12 h-12" />
          </div>
          <h1 className={`font-serif text-4xl font-bold ${winnerInfo.color} neon-text mb-2`}>
            {winnerInfo.title}
          </h1>
          <p className="text-muted-foreground">{winnerInfo.description}</p>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              Vencedores
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {winningPlayers.map((player) => (
                <Badge 
                  key={player.id} 
                  className={`${ROLE_INFO[player.role!].color} bg-transparent border`}
                >
                  {player.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              Todos os Jogadores
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player) => {
                const roleInfo = player.role ? ROLE_INFO[player.role] : null;
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      player.isEliminated 
                        ? 'bg-muted/20 border-border opacity-60' 
                        : 'bg-muted/30 border-border'
                    }`}
                    data-testid={`player-result-${player.id}`}
                  >
                    <span className={player.isEliminated ? 'line-through' : ''}>
                      {player.name}
                    </span>
                    {roleInfo && (
                      <Badge variant="outline" className={roleInfo.color}>
                        {roleInfo.name.charAt(0)}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button variant="outline" onClick={onBackToMenu} data-testid="button-back-menu">
              <Home className="w-4 h-4 mr-2" />
              Menu
            </Button>
            <Button onClick={onPlayAgain} data-testid="button-play-again">
              <RotateCcw className="w-4 h-4 mr-2" />
              Jogar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
