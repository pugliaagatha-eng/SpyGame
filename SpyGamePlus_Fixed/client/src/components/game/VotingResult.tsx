import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skull, ChevronRight, Users, Vote } from 'lucide-react';
import type { Player } from '@shared/schema';
import { ROLE_INFO } from '@shared/schema';

interface VotingResultProps {
  players: Player[];
  eliminatedPlayer: Player | null;
  votes: Record<string, string>;
  onContinue: () => void;
  currentRound: number;
  maxRounds: number;
}

export default function VotingResult({
  players,
  eliminatedPlayer,
  votes,
  onContinue,
  currentRound,
  maxRounds,
}: VotingResultProps) {
  const getVoteCount = (playerId: string) => {
    return Object.values(votes).filter(v => v === playerId).length;
  };

  const sortedPlayers = [...players]
    .filter(p => !p.isEliminated || p.id === eliminatedPlayer?.id)
    .sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id));

  const roleInfo = eliminatedPlayer?.role ? ROLE_INFO[eliminatedPlayer.role] : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-lg neon-border">
        <CardHeader className="text-center">
          <Badge variant="destructive" className="mx-auto mb-2">
            <Skull className="w-3 h-3 mr-1" />
            ELIMINAÇÃO
          </Badge>
          <CardTitle className="font-serif text-2xl">
            Resultado da Votação
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {eliminatedPlayer && (
            <div className="text-center p-6 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
                <Skull className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-destructive mb-2">
                {eliminatedPlayer.name}
              </h3>
              <p className="text-muted-foreground mb-2">foi eliminado!</p>
              {roleInfo && (
                <Badge className={`${roleInfo.color} bg-transparent border`}>
                  Era {roleInfo.name}
                </Badge>
              )}
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <Vote className="w-4 h-4" />
              Votos Recebidos
            </h3>
            <div className="space-y-2">
              {sortedPlayers.map((player) => {
                const voteCount = getVoteCount(player.id);
                const isEliminated = player.id === eliminatedPlayer?.id;
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isEliminated 
                        ? 'bg-destructive/10 border border-destructive/30' 
                        : 'bg-muted/30 border border-border'
                    }`}
                    data-testid={`result-${player.id}`}
                  >
                    <span className={isEliminated ? 'line-through text-muted-foreground' : ''}>
                      {player.name}
                    </span>
                    <Badge variant={isEliminated ? 'destructive' : 'secondary'}>
                      {voteCount} {voteCount === 1 ? 'voto' : 'votos'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {players.filter(p => !p.isEliminated).length} jogadores restantes
            </span>
          </div>

          <Button className="w-full" size="lg" onClick={onContinue} data-testid="button-continue">
            {currentRound < maxRounds ? 'Próxima Rodada' : 'Ver Resultado Final'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
