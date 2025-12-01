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
  DialogFooter,
} from '@/components/ui/dialog';
import { Eye, Repeat, Clock, RotateCcw, Search, Shield, Sparkles, Check, X, MinusCircle, FileSearch, Shuffle, Timer } from 'lucide-react';
import type { Ability, Player, AbilityType } from '@shared/schema';

interface AbilityPanelProps {
  player: Player | undefined | null;
  players: Player[];
  onUseAbility: (abilityId: string, targetId?: string) => void;
  disabled?: boolean;
  previousRoundVotes?: Record<string, string>;
}

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

export default function AbilityPanel({ player, players, onUseAbility, disabled, previousRoundVotes = {} }: AbilityPanelProps) {
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<{ type: string; message: string } | null>(null);
  const [localUsedAbilities, setLocalUsedAbilities] = useState<Set<string>>(new Set());

  // Early return if player is not valid
  if (!player || !player.id) {
    return null;
  }

  // Safely get abilities - abilities might not be an array
  const playerAbilities = player?.abilities && Array.isArray(player.abilities) ? player.abilities : [];
  // Filter out abilities that are marked as used on server OR locally
  const availableAbilities = playerAbilities.filter(a => a && !a.used && !localUsedAbilities.has(a.id));
  const otherPlayers = players.filter(p => p && p.id !== player?.id && !p.isEliminated);

  const needsTarget = (ability: Ability): boolean => {
    return ['spy_vote', 'peek_role'].includes(ability.id);
  };
  
  const isPassiveAbility = (ability: Ability): boolean => {
    return ['negative_vote'].includes(ability.id);
  };

  const handleUseAbility = () => {
    if (!selectedAbility) return;
    
    if (needsTarget(selectedAbility) && !selectedTarget) return;

    // Mark ability as used locally immediately to prevent double-use
    setLocalUsedAbilities(prev => new Set(prev).add(selectedAbility.id));
    
    onUseAbility(selectedAbility.id, selectedTarget || undefined);

    if (selectedAbility.id === 'peek_role' && selectedTarget) {
      const target = players.find(p => p.id === selectedTarget);
      if (target?.role) {
        const roleNames: Record<string, string> = {
          agent: 'Agente',
          spy: 'Espião',
          triple: 'Agente Triplo',
          jester: 'O Tolo',
        };
        setShowResult({
          type: 'role',
          message: `${target.name} é ${roleNames[target.role]}!`,
        });
      }
    } else if (selectedAbility.id === 'spy_vote' && selectedTarget) {
      const target = players.find(p => p.id === selectedTarget);
      if (target?.votedFor) {
        const votedForPlayer = players.find(p => p.id === target.votedFor);
        setShowResult({
          type: 'vote',
          message: `${target.name} votou em ${votedForPlayer?.name || 'desconhecido'}`,
        });
      } else {
        setShowResult({
          type: 'vote',
          message: `${target?.name} ainda não votou`,
        });
      }
    } else if (selectedAbility.id === 'forensic_investigation') {
      if (!previousRoundVotes || Object.keys(previousRoundVotes).length === 0) {
        setShowResult({
          type: 'forensic',
          message: 'Não há votos da rodada anterior para investigar. Esta habilidade só funciona a partir da segunda rodada.',
        });
      } else {
        const voteLines = Object.entries(previousRoundVotes).map(([voterId, targetId]) => {
          const voter = players.find(p => p.id === voterId);
          const target = players.find(p => p.id === targetId);
          return `${voter?.name || 'Desconhecido'} → ${target?.name || 'Desconhecido'}`;
        });
        setShowResult({
          type: 'forensic',
          message: `Votos da rodada anterior:\n${voteLines.join('\n')}`,
        });
      }
    } else {
      setSelectedAbility(null);
      setSelectedTarget(null);
    }
  };

  const handleClose = () => {
    setSelectedAbility(null);
    setSelectedTarget(null);
    setShowResult(null);
  };

  if (availableAbilities.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50" data-testid="ability-panel">
        <div className="flex flex-col gap-2 items-end">
          {availableAbilities.map((ability) => {
            const Icon = ABILITY_ICONS[ability.id];
            const passive = isPassiveAbility(ability);
            
            if (passive) {
              return (
                <div
                  key={ability.id}
                  className="bg-secondary/50 border border-secondary/30 rounded-md px-3 py-2 flex items-center gap-2 text-sm text-muted-foreground"
                  data-testid={`passive-ability-${ability.id}`}
                >
                  <Icon className="w-4 h-4 text-yellow-500" />
                  <span className="hidden sm:inline">{typeof ability.name === 'string' ? ability.name : String(ability.name)}</span>
                  <span className="text-xs opacity-70">(passiva)</span>
                </div>
              );
            }
            
            return (
              <Button
                key={ability.id}
                variant="secondary"
                className="neon-glow flex items-center gap-2"
                onClick={() => setSelectedAbility(ability)}
                disabled={disabled}
                data-testid={`button-ability-${ability.id}`}
              >
                <Sparkles className="w-4 h-4" />
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{typeof ability.name === 'string' ? ability.name : String(ability.name)}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedAbility && !showResult} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="neon-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              {typeof selectedAbility?.name === 'string' ? selectedAbility.name : String(selectedAbility?.name || '')}
            </DialogTitle>
            <DialogDescription>
              {typeof selectedAbility?.description === 'string' ? selectedAbility.description : String(selectedAbility?.description || '')}
            </DialogDescription>
          </DialogHeader>

          {selectedAbility && needsTarget(selectedAbility) && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Escolha um jogador:</p>
              <div className="grid grid-cols-2 gap-2">
                {otherPlayers.map((p) => (
                  <Button
                    key={p.id}
                    variant={selectedTarget === p.id ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setSelectedTarget(p.id)}
                    data-testid={`target-${p.id}`}
                  >
                    {p.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleUseAbility}
              disabled={!selectedAbility || (needsTarget(selectedAbility) && !selectedTarget)}
              data-testid="button-confirm-ability"
            >
              <Check className="w-4 h-4 mr-2" />
              Usar Habilidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showResult} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="neon-border text-center">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl neon-text">
              Resultado
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-lg whitespace-pre-line">{showResult?.message}</p>
          </div>
          <DialogFooter className="justify-center">
            <Button onClick={handleClose} data-testid="button-close-result">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
