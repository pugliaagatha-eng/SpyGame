import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Vote, Check, User, ChevronRight, EyeOff, Info, Sparkles, Eye, Repeat, Clock, RotateCcw, Search, Shield, MinusCircle, FileSearch, Shuffle, Timer } from 'lucide-react';
import type { Player, Ability, AbilityType } from '@shared/schema';
import { ABILITIES } from '@shared/schema';

const ABILITY_ICONS: Record<AbilityType, typeof Eye> = {
  spy_vote: Eye,
  swap_vote: Repeat,
  extra_time: Clock,
  force_revote: RotateCcw,
  peek_role: Search,
  shield: Shield,
  negative_vote: MinusCircle,
  forensic_investigation: FileSearch,
  scramble_fact: Shuffle,
  force_revote_30s: Timer,
};

interface VotingPhaseProps {
  players: Player[];
  currentVoter: Player | null;
  onVote: (voterId: string, targetId: string) => void;
  onConfirmVote: () => void;
  isLocalMode: boolean;
  votes?: Record<string, string>;
}

export default function VotingPhase({
  players,
  currentVoter,
  onVote,
  onConfirmVote,
  isLocalMode,
  votes = {},
}: VotingPhaseProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  const activePlayers = players.filter(p => !p.isEliminated);
  const votablePlayers = activePlayers.filter(p => p.id !== currentVoter?.id);
  
  // In online mode, check if the current voter has already voted
  const hasAlreadyVoted = !isLocalMode && currentVoter && votes[currentVoter.id];
  const votedTargetId = hasAlreadyVoted ? votes[currentVoter!.id] : selectedPlayer;
  
  const voterAbilities = currentVoter?.abilities?.filter(a => !a.used) || [];
  const hasAbilities = voterAbilities.length > 0;
  
  const isPassiveAbility = (ability: Ability): boolean => {
    return ['negative_vote'].includes(ability.id);
  };

  const handleVote = () => {
    if (selectedPlayer && currentVoter && !hasAlreadyVoted) {
      onVote(currentVoter.id, selectedPlayer);
      setShowConfirmation(true);
    }
  };

  const handleNext = () => {
    setSelectedPlayer(null);
    setShowConfirmation(false);
    setRevealed(false);
    onConfirmVote();
  };

  // Show confirmation if player has already voted (online mode) or just submitted vote
  if (showConfirmation || hasAlreadyVoted) {
    const votedFor = players.find(p => p.id === votedTargetId);
    const votedCount = Object.keys(votes).length;
    const totalVoters = activePlayers.length;
    const waitingForOthers = !isLocalMode && votedCount < totalVoters;
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md neon-border">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-2">Voto Registrado</h2>
            <p className="text-muted-foreground mb-4">
              Você votou em <span className="text-primary font-bold">{votedFor?.name}</span>
            </p>
            
            {waitingForOthers ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Aguardando outros jogadores... ({votedCount}/{totalVoters})
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(votedCount / totalVoters) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <Button className="w-full" onClick={handleNext} data-testid="button-next-voter">
                {isLocalMode ? 'Próximo Jogador' : 'Continuar'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLocalMode && !revealed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md neon-border">
          <CardContent className="p-8 text-center">
            <EyeOff className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="font-serif text-2xl font-bold mb-2">Vez de {currentVoter?.name}</h2>
            <p className="text-muted-foreground mb-6">
              Certifique-se que ninguém está olhando antes de votar.
            </p>
            <Button className="w-full" onClick={() => setRevealed(true)} data-testid="button-reveal-vote">
              Votar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-lg neon-border">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="outline" className="text-destructive border-destructive">
              <Vote className="w-3 h-3 mr-1" />
              VOTAÇÃO
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowHelpDialog(true)}
              data-testid="button-ability-help"
            >
              <Info className="w-5 h-5 text-secondary" />
            </Button>
          </div>
          <CardTitle className="font-serif text-2xl">
            {currentVoter?.name}, vote para eliminar
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {hasAbilities && (
            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-sm font-semibold text-secondary">Suas Habilidades</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-auto"
                  onClick={() => setShowHelpDialog(true)}
                >
                  <Info className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {voterAbilities.map((ability) => {
                  const Icon = ABILITY_ICONS[ability.id as AbilityType];
                  const passive = isPassiveAbility(ability);
                  return (
                    <Badge
                      key={ability.id}
                      variant={passive ? 'secondary' : 'default'}
                      className={`flex items-center gap-1 ${passive ? 'opacity-70' : ''}`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      {typeof ability.name === 'string' ? ability.name : String(ability.name)}
                      {passive && <span className="text-xs opacity-70">(auto)</span>}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use as habilidades ativas no painel flutuante no canto inferior direito.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {votablePlayers.map((player) => (
              <button
                key={player.id}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  selectedPlayer === player.id
                    ? 'border-primary bg-primary/20 scale-105 neon-glow'
                    : 'border-border hover:border-primary/50 bg-muted/30'
                }`}
                onClick={() => setSelectedPlayer(player.id)}
                data-testid={`vote-button-${player.id}`}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="font-medium">{player.name}</span>
                {selectedPlayer === player.id && (
                  <Check className="w-5 h-5 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!selectedPlayer}
            onClick={handleVote}
            data-testid="button-confirm-vote"
          >
            Confirmar Voto
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="neon-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Info className="w-5 h-5 text-secondary" />
              Guia de Habilidades
            </DialogTitle>
            <DialogDescription>
              Cada jogador recebe uma habilidade especial por partida.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {ABILITIES.map((ability) => {
              const Icon = ABILITY_ICONS[ability.id as AbilityType];
              const passive = ['negative_vote'].includes(ability.id);
              return (
                <div
                  key={ability.id}
                  className={`p-3 rounded-lg border ${passive ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-muted/30 border-border'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {Icon && <Icon className={`w-4 h-4 ${passive ? 'text-yellow-500' : 'text-primary'}`} />}
                    <span className="font-semibold">{typeof ability.name === 'string' ? ability.name : String(ability.name)}</span>
                    {passive && (
                      <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500">
                        PASSIVA
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{typeof ability.description === 'string' ? ability.description : String(ability.description)}</p>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
