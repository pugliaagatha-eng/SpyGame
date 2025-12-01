import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Sparkles, AlertTriangle, Skull, ChevronRight, Check, Users, Loader2 } from 'lucide-react';
import type { Player, PlayerRole, SecretFact, Ability } from '@shared/schema';
import { ROLE_INFO } from '@shared/schema';

interface RoleRevealProps {
  player: Player;
  secretFact: SecretFact | null;
  missionAlternatives?: SecretFact[];
  spyList: string[];
  agentList: string[];
  onNext: () => void;
  isLast: boolean;
  isOnlineMode?: boolean;
  allPlayers?: Player[];
  isHost?: boolean;
  onReady?: () => void;
  onStartMission?: () => void;
}

export default function RoleReveal({
  player,
  secretFact,
  missionAlternatives = [],
  spyList,
  agentList,
  onNext,
  isLast,
  isOnlineMode = false,
  allPlayers = [],
  isHost = false,
  onReady,
  onStartMission,
}: RoleRevealProps) {
  const [revealed, setRevealed] = useState(false);
  
  const readyCount = allPlayers.filter(p => p.isReady).length;
  const allReady = readyCount === allPlayers.length && allPlayers.length > 0;

  const role = player.role || 'agent';
  const roleInfo = ROLE_INFO[role];
  const ability = player.abilities[0];

  const canSeeSecret = role === 'agent' || role === 'triple';
  const canSeeSPyList = role === 'spy';
  const canSeeAgentList = false;

  const getRoleIcon = () => {
    switch (role) {
      case 'agent': return <Shield className="w-16 h-16" />;
      case 'spy': return <Eye className="w-16 h-16" />;
      case 'triple': return <Sparkles className="w-16 h-16" />;
      case 'jester': return <Skull className="w-16 h-16" />;
    }
  };

  const getRoleGradient = () => {
    switch (role) {
      case 'agent': return 'from-cyan-500/20 to-cyan-900/20';
      case 'spy': return 'from-red-500/20 to-red-900/20';
      case 'triple': return 'from-purple-500/20 to-purple-900/20';
      case 'jester': return 'from-yellow-500/20 to-yellow-900/20';
    }
  };

  if (!revealed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md neon-border">
          <CardContent className="p-8 text-center">
            <EyeOff className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="font-serif text-2xl font-bold mb-2">{player.name}</h2>
            <p className="text-muted-foreground mb-8">
              Seu papel está pronto para ser revelado.<br />
              Certifique-se que ninguém está olhando.
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => setRevealed(true)}
              data-testid="button-reveal-role"
            >
              Revelar Papel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className={`w-full max-w-md overflow-hidden transition-all duration-500 animate-in fade-in zoom-in`}>
        <div className={`bg-gradient-to-b ${getRoleGradient()} p-8`}>
          <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${roleInfo.color} neon-glow mb-4`}>
            {getRoleIcon()}
          </div>
          <h2 className={`font-serif text-3xl font-bold text-center ${roleInfo.color}`}>
            {roleInfo.name}
          </h2>
        </div>
        
        <CardContent className="p-6 space-y-4">
          {canSeeSPyList && spyList.length > 0 && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Outros Espiões
              </h3>
              <p className="text-red-300 font-mono text-sm">
                {spyList.join(', ')}
              </p>
            </div>
          )}

          {ability && (
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Sua Habilidade
              </h3>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-purple-300">
                  {ability.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {ability.description}
                </span>
              </div>
            </div>
          )}

          {isOnlineMode ? (
            <div className="pt-4 space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Jogadores
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {readyCount}/{allPlayers.length} prontos
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allPlayers.map(p => (
                    <Badge 
                      key={p.id}
                      variant={p.isReady ? "default" : "outline"}
                      className={p.isReady ? "bg-green-600" : ""}
                    >
                      {p.isReady && <Check className="w-3 h-3 mr-1" />}
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {player.isReady ? (
                isHost ? (
                  <Button
                    className="w-full"
                    onClick={onStartMission}
                    disabled={!allReady}
                    data-testid="button-start-mission"
                  >
                    {allReady ? (
                      <>Iniciar Missão <ChevronRight className="w-4 h-4 ml-2" /></>
                    ) : (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Aguardando jogadores...
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <Check className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p className="text-green-300 font-semibold">Você está pronto!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Aguardando outros jogadores...
                    </p>
                  </div>
                )
              ) : (
                <Button
                  className="w-full"
                  onClick={onReady}
                  data-testid="button-ready"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Pronto!
                </Button>
              )}
            </div>
          ) : (
            <div className="pt-4 space-y-2">
              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Memorize seu papel e passe o dispositivo
              </p>
              <Button
                className="w-full"
                onClick={onNext}
                data-testid="button-next-player"
              >
                {isLast ? 'Iniciar Missão' : 'Próximo Jogador'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
